import { AxiosError, type InternalAxiosRequestConfig } from 'axios';
import { api } from './axios';
import { secureStorage } from '@/services/secureStorage';
import { emitSessionInvalidated } from '@/services/sessionEvents';
import { refreshAccessToken } from '@/features/auth/auth-api';

// Custom flag attached to a request config to opt-out of the 401-refresh-retry
// loop. Used by the refresh endpoint itself (a 401 there means the refresh
// token is dead) and by anything else that should fail loudly instead of
// triggering refresh.
type RetryableConfig = InternalAxiosRequestConfig & {
  _skipAuthRetry?: boolean;
  _retried?: boolean;
};

/**
 * Single-flight refresh: if N requests race a 401 at the same time, they
 * all await the same in-flight refresh promise instead of triggering N
 * concurrent refreshes (which would invalidate each other since the backend
 * rotates the refresh token on every call).
 */
let inFlightRefresh: Promise<string | null> | null = null;

async function performRefresh(): Promise<string | null> {
  const refreshToken = await secureStorage.getRefreshToken();
  if (!refreshToken) return null;

  try {
    const fresh = await refreshAccessToken(refreshToken);
    await secureStorage.saveSession({
      accessToken: fresh.accessToken,
      refreshToken: fresh.refreshToken,
    });
    return fresh.accessToken;
  } catch {
    // Refresh itself failed — token revoked, expired, or backend rejected.
    // Caller will treat this as "session is dead, sign the user out".
    return null;
  }
}

function getRefreshSingleton(): Promise<string | null> {
  if (!inFlightRefresh) {
    inFlightRefresh = performRefresh().finally(() => {
      inFlightRefresh = null;
    });
  }
  return inFlightRefresh;
}

async function invalidateSession(): Promise<void> {
  await secureStorage.clearSession();
  emitSessionInvalidated();
}

/**
 * Wire request + response interceptors. Called once from AppProviders before
 * anything renders so every API call carries the auth header and 401s flow
 * through the refresh-or-logout path.
 */
export function setupInterceptors() {
  api.interceptors.request.use(
    async (config) => {
      const token = await secureStorage.getAccessToken();
      if (token) {
        config.headers.set('Authorization', `Bearer ${token}`);
      }
      return config;
    },
    (error) => Promise.reject(error)
  );

  api.interceptors.response.use(
    (response) => response,
    async (error: AxiosError) => {
      const original = error.config as RetryableConfig | undefined;

      // Non-401 or non-axios — let it bubble.
      if (!original || error.response?.status !== 401) {
        return Promise.reject(error);
      }

      // Don't refresh-then-retry the refresh call itself, or anything that
      // explicitly opted out, or anything we already retried once.
      if (original._skipAuthRetry || original._retried) {
        await invalidateSession();
        return Promise.reject(error);
      }

      original._retried = true;

      const newAccessToken = await getRefreshSingleton();

      if (!newAccessToken) {
        await invalidateSession();
        return Promise.reject(error);
      }

      // Replay the original through `api` so the request interceptor picks
      // up the fresh access token from secure storage (we just wrote it in
      // performRefresh). The `_retried` flag is what stops this from looping
      // if the replay also 401s for some unrelated reason.
      return api.request(original);
    }
  );
}
