import { api } from './axios';

/**
 * Wire up auth tokens, error normalization, and toast notifications.
 * Call this once from AppProviders before the app renders.
 *
 * Stubbed out for now — fill in once auth + toast are in place.
 */
export function setupInterceptors() {
  api.interceptors.request.use(
    (config) => {
      // TODO: attach JWT from secure storage
      return config;
    },
    (error) => Promise.reject(error)
  );

  api.interceptors.response.use(
    (response) => response,
    (error) => {
      // TODO: normalize error shape, surface toast on 5xx, refresh-token on 401
      return Promise.reject(error);
    }
  );
}
