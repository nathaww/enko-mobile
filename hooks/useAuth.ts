import { useAuthContext, type AuthContextValue } from '@/providers/AuthProvider';

/** Auth state + session actions. Backed by AuthProvider. */
export function useAuth(): AuthContextValue {
  return useAuthContext();
}
