import { useMutation } from '@tanstack/react-query';
import { router } from 'expo-router';
import { useToast } from '@/hooks/useToast';
import {
  loginUser,
  registerUser,
  requestPasswordReset,
  validatePasswordResetCode,
  verifyEmail,
} from './auth-api';
import type {
  ForgotPasswordRequest,
  LoginRequest,
  RegisterRequest,
  VerifyCodeRequest,
} from './auth.types';

function extractMessage(err: unknown, fallback: string): string {
  if (typeof err === 'object' && err !== null) {
    const anyErr = err as { response?: { data?: { message?: string } }; message?: string };
    return anyErr.response?.data?.message ?? anyErr.message ?? fallback;
  }
  return fallback;
}

export function useLoginMutation() {
  const toast = useToast();
  return useMutation({
    mutationFn: (data: LoginRequest) => loginUser(data),
    onSuccess: (data) => {
      toast('success', { title: `Welcome back, ${data.user.name.split(' ')[0]}` });
      router.replace('/(tabs)');
    },
    onError: (err) => {
      toast('error', {
        title: 'Sign in failed',
        description: extractMessage(err, 'Please try again.'),
      });
    },
  });
}

export function useRegisterMutation() {
  const toast = useToast();
  return useMutation({
    mutationFn: (data: RegisterRequest) => registerUser(data),
    onSuccess: () => {
      toast('success', { title: 'Account created', description: 'You are signed in.' });
      router.replace('/(tabs)');
    },
    onError: (err) => {
      toast('error', {
        title: 'Could not create account',
        description: extractMessage(err, 'Please try again.'),
      });
    },
  });
}

export function useForgotPasswordMutation() {
  const toast = useToast();
  return useMutation({
    mutationFn: (data: ForgotPasswordRequest) => requestPasswordReset(data),
    onSuccess: (_, vars) => {
      toast('success', {
        title: 'Code sent',
        description: `Check ${vars.email} for the 6-digit code.`,
      });
      router.push({
        pathname: '/(auth)/verify-code',
        params: { email: vars.email },
      });
    },
    onError: (err) => {
      toast('error', {
        title: 'Could not send code',
        description: extractMessage(err, 'Please try again.'),
      });
    },
  });
}

export function useVerifyCodeMutation() {
  const toast = useToast();
  return useMutation({
    mutationFn: (data: VerifyCodeRequest) => validatePasswordResetCode(data),
    onSuccess: () => {
      toast('success', { title: 'Code verified', description: 'Set a new password.' });
      // TODO: route to reset-password screen when added
      router.replace('/(auth)/login');
    },
    onError: (err) => {
      toast('error', {
        title: 'Invalid code',
        description: extractMessage(err, 'Check the digits and try again.'),
      });
    },
  });
}

export function useVerifyEmailMutation() {
  const toast = useToast();
  return useMutation({
    mutationFn: (data: VerifyCodeRequest) => verifyEmail(data),
    onSuccess: () => {
      toast('success', { title: 'Email verified' });
      router.replace('/(tabs)');
    },
    onError: (err) => {
      toast('error', {
        title: 'Verification failed',
        description: extractMessage(err, 'Please try again.'),
      });
    },
  });
}
