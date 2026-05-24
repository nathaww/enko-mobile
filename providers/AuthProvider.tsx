import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { secureStorage } from '@/services/secureStorage';
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
          // TODO: validate by calling /auth/me; for now trust stored token.
          setStatus('authenticated');
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

  const signIn = useCallback(async (data: AuthResponse) => {
    await secureStorage.saveSession({
      accessToken: data.accessToken,
      refreshToken: data.refreshToken,
    });
    setUser(data.user);
    setStatus('authenticated');
  }, []);

  const signOut = useCallback(async () => {
    await secureStorage.clearSession();
    setUser(null);
    setStatus('unauthenticated');
  }, []);

  const completeOnboarding = useCallback(async () => {
    await secureStorage.markOnboardingComplete();
    setHasOnboarded(true);
  }, []);

  const reset = useCallback(async () => {
    await secureStorage.resetAll();
    setUser(null);
    setHasOnboarded(false);
    setStatus('unauthenticated');
  }, []);

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
