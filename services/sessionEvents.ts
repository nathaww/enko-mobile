/**
 * Decoupled signaling channel between the axios interceptor (vanilla TS,
 * outside React) and AuthProvider (React context, holds the auth state).
 *
 * The interceptor can't import AuthProvider directly — that would create a
 * dependency cycle, and React state mutations don't belong in a vanilla
 * module. Instead the interceptor calls `emitSessionInvalidated()` after it
 * has cleared secure storage, and AuthProvider subscribes once on mount to
 * flip `status` to 'unauthenticated' and clear the query cache.
 */

type Listener = () => void;

const listeners = new Set<Listener>();

export function subscribeSessionInvalidated(listener: Listener): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function emitSessionInvalidated(): void {
  for (const listener of listeners) {
    try {
      listener();
    } catch {
      // Listeners must not throw; swallow to keep other subscribers running.
    }
  }
}
