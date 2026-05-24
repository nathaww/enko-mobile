import { api } from '@/api/axios';
import type {
  AuthResponse,
  ForgotPasswordRequest,
  LoginRequest,
  RegisterRequest,
  ResetPasswordRequest,
  VerifyCodeRequest,
} from './auth.types';

/**
 * Dev bypass: when no API URL is configured we short-circuit auth calls with
 * mock responses so the UI is browsable end-to-end without a backend. Remove
 * the `useDevStub` branches once the backend is wired and EXPO_PUBLIC_API_URL
 * is set.
 */
const useDevStub = __DEV__ && !process.env.EXPO_PUBLIC_API_URL;

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function mockAuthResponse(email: string, name = 'Nathan'): AuthResponse {
  return {
    accessToken: 'dev-access',
    refreshToken: 'dev-refresh',
    user: {
      id: 'dev-user',
      name,
      email,
      isActive: true,
      isVerified: true,
    },
  };
}

export async function loginUser(data: LoginRequest): Promise<AuthResponse> {
  if (useDevStub) {
    await delay(500);
    return mockAuthResponse(data.email);
  }
  const res = await api.post<AuthResponse>('/auth/login', data);
  return res.data;
}

export async function registerUser(data: RegisterRequest): Promise<AuthResponse> {
  if (useDevStub) {
    await delay(700);
    return mockAuthResponse(data.email, data.name);
  }
  const res = await api.post<AuthResponse>('/auth/register', data);
  return res.data;
}

export async function logoutUser(): Promise<void> {
  if (useDevStub) {
    await delay(200);
    return;
  }
  await api.post('/auth/logout');
}

export async function requestPasswordReset(
  data: ForgotPasswordRequest
): Promise<{ ok: true }> {
  if (useDevStub) {
    await delay(500);
    return { ok: true };
  }
  const res = await api.post<{ ok: true }>('/auth/password-reset/request', data);
  return res.data;
}

export async function validatePasswordResetCode(
  data: VerifyCodeRequest
): Promise<{ ok: true; resetToken: string }> {
  if (useDevStub) {
    await delay(500);
    return { ok: true, resetToken: 'dev-reset' };
  }
  const res = await api.post<{ ok: true; resetToken: string }>(
    '/auth/password-reset/validate',
    data
  );
  return res.data;
}

export async function resetPassword(data: ResetPasswordRequest): Promise<{ ok: true }> {
  if (useDevStub) {
    await delay(500);
    return { ok: true };
  }
  const res = await api.post<{ ok: true }>('/auth/password-reset/reset', data);
  return res.data;
}

export async function requestEmailVerification(): Promise<{ ok: true }> {
  if (useDevStub) {
    await delay(300);
    return { ok: true };
  }
  const res = await api.post<{ ok: true }>('/auth/email-verification/request');
  return res.data;
}

export async function verifyEmail(data: VerifyCodeRequest): Promise<{ ok: true }> {
  if (useDevStub) {
    await delay(500);
    return { ok: true };
  }
  const res = await api.post<{ ok: true }>('/auth/email-verification/verify', data);
  return res.data;
}
