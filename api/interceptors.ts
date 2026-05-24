import { api } from './axios';
import { secureStorage } from '@/services/secureStorage';

/**
 * Wire request + response interceptors. Called once from _layout before
 * anything renders so every API call carries the auth header.
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
    async (error) => {
      // TODO: on 401, call /auth/refresh-access-token with refreshToken,
      // retry the original request once. If refresh fails, clear session.
      // Keeping this a single-shot reject for now so failures surface clearly
      // in toasts during early development.
      return Promise.reject(error);
    }
  );
}
