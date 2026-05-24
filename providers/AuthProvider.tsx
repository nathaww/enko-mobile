import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { secureStorage } from '@/services/secureStorage';
import { getMe } from '@/features/auth/auth-api';
import type { AuthResponse, AuthUser } from '@/features/auth/auth.types';

type AuthStatus = 'bootstrapping' | 'authenticated' | 'unauthenticated';

export type AuthContextValue = {
  status: AuthStatus;
  user: AuthUser | null;
  hasOnboarded: boolean;
  /** True until the on-mount bootstrap finishes reading secure storage. */
  isBootstrapping: boolean;
  signIn: (data: AuthResponse) => Promise<void>;
  signOut: () => Promise<void>;
  completeOnboarding: () => Promise<void>;
  /** Debug-only: wipe everything from secure storage. */
  reset: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const queryClient = useQueryClient();
  const [status, setStatus] = useState<AuthStatus>('bootstrapping');
  const [user, setUser] = useState<AuthUser | null>(null);
  const [hasOnboarded, setHasOnboarded] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [session, onboarded] = await Promise.all([
          secureStorage.getSession(),
          secureStorage.isOnboardingComplete(),
        ]);
        if (cancelled) return;
        setHasOnboarded(onboarded);
        if (session) {
          // Hydrate the user profile so screens like Profile can render
          // immediately on cold launch. If the call fails (network, expired
          // token), we still surface the app shell as authenticated — the
          // next API call will trigger a 401 and the interceptor will clear
          // the session.
          setStatus('authenticated');
          try {
            const me = await getMe();
            if (!cancelled) setUser(me);
          } catch {
            // Silent: keep status='authenticated' so the user sees the app;
            // missing user data shows as a loading state in Profile.
          }
        } else {
          setStatus('unauthenticated');
        }
      } catch {
        if (!cancelled) {
          setStatus('unauthenticated');
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const signIn = useCallback(
    async (data: AuthResponse) => {
      await secureStorage.saveSession({
        accessToken: data.accessToken,
        refreshToken: data.refreshToken,
      });
      // Wipe every cached query so the new user starts on fresh data — no
      // expenses, dashboard cards, or money sources from the previous session
      // bleed through. Cheaper than invalidating individual feature keys and
      // guarantees zero cross-user leakage.
      queryClient.clear();
      setUser(data.user);
      setStatus('authenticated');
    },
    [queryClient]
  );

  const signOut = useCallback(async () => {
    await secureStorage.clearSession();
    queryClient.clear();
    setUser(null);
    setStatus('unauthenticated');
  }, [queryClient]);

  const completeOnboarding = useCallback(async () => {
    await secureStorage.markOnboardingComplete();
    setHasOnboarded(true);
  }, []);

  const reset = useCallback(async () => {
    await secureStorage.resetAll();
    queryClient.clear();
    setUser(null);
    setHasOnboarded(false);
    setStatus('unauthenticated');
  }, [queryClient]);

  const value = useMemo<AuthContextValue>(
    () => ({
      status,
      user,
      hasOnboarded,
      isBootstrapping: status === 'bootstrapping',
      signIn,
      signOut,
      completeOnboarding,
      reset,
    }),
    [status, user, hasOnboarded, signIn, signOut, completeOnboarding, reset]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuthContext(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuthContext must be used within AuthProvider');
  return ctx;
}
