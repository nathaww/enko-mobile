import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { isAxiosError } from 'axios';
import { secureStorage } from '@/services/secureStorage';
import { subscribeSessionInvalidated } from '@/services/sessionEvents';
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
        if (!session) {
          setStatus('unauthenticated');
          return;
        }

        // Validate the stored session up front. The axios interceptor will
        // transparently refresh on 401, so any error reaching here means
        // even refresh failed — the session is unrecoverable.
        try {
          const me = await getMe();
          if (cancelled) return;
          setUser(me);
          setStatus('authenticated');
        } catch (err) {
          if (cancelled) return;
          if (isAxiosError(err) && err.response?.status === 401) {
            // Interceptor already cleared secure storage and emitted the
            // invalidation event — we just mirror that into context state.
            setUser(null);
            setStatus('unauthenticated');
          } else {
            // Network / server hiccup: keep tokens, let the user into the
            // shell, individual screens can surface their own loading errors.
            setStatus('authenticated');
          }
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

  // Listen for "your session just died" pings from the axios interceptor.
  // The interceptor clears secure storage on its own; our job is to mirror
  // that into React state so the auth-gated routes redirect.
  useEffect(() => {
    return subscribeSessionInvalidated(() => {
      queryClient.clear();
      setUser(null);
      setStatus('unauthenticated');
    });
  }, [queryClient]);

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
