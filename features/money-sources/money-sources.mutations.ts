import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/useToast';
import {
  createMoneySource,
  deleteMoneySource,
  updateMoneySource,
} from './money-sources-api';
import { moneySourcesQueryKeys } from './money-sources.queryKeys';
import { expensesQueryKeys } from '@/features/expenses/expenses.queryKeys';
import { homeQueryKeys } from '@/features/home/home.queryKeys';
import type {
  CreateMoneySourceRequest,
  UpdateMoneySourceRequest,
} from './money-sources.types';

function extractMessage(err: unknown, fallback: string): string {
  if (typeof err === 'object' && err !== null) {
    const anyErr = err as { response?: { data?: { message?: string } }; message?: string };
    return anyErr.response?.data?.message ?? anyErr.message ?? fallback;
  }
  return fallback;
}

// Money sources are referenced by expenses and rolled into the Home
// dashboard's total-balance card, so every write has to bust those caches.
function invalidateMoneySourceQueries(queryClient: ReturnType<typeof useQueryClient>) {
  return Promise.all([
    queryClient.invalidateQueries({ queryKey: moneySourcesQueryKeys.all() }),
    queryClient.invalidateQueries({ queryKey: expensesQueryKeys.all() }),
    queryClient.invalidateQueries({ queryKey: homeQueryKeys.all() }),
  ]);
}

export function useCreateMoneySource() {
  const queryClient = useQueryClient();
  const toast = useToast();
  return useMutation({
    mutationFn: (data: CreateMoneySourceRequest) => createMoneySource(data),
    onSuccess: async () => {
      await invalidateMoneySourceQueries(queryClient);
      toast('success', { title: 'Account added' });
    },
    onError: (err) => {
      toast('error', {
        title: 'Could not add account',
        description: extractMessage(err, 'Please try again.'),
      });
    },
  });
}

export function useUpdateMoneySource() {
  const queryClient = useQueryClient();
  const toast = useToast();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateMoneySourceRequest }) =>
      updateMoneySource(id, data),
    onSuccess: async () => {
      await invalidateMoneySourceQueries(queryClient);
      toast('success', { title: 'Account updated' });
    },
    onError: (err) => {
      toast('error', {
        title: 'Could not update account',
        description: extractMessage(err, 'Please try again.'),
      });
    },
  });
}

export function useDeleteMoneySource() {
  const queryClient = useQueryClient();
  const toast = useToast();
  return useMutation({
    mutationFn: (id: string) => deleteMoneySource(id),
    onSuccess: async () => {
      await invalidateMoneySourceQueries(queryClient);
      toast('success', { title: 'Account deleted' });
    },
    onError: (err) => {
      toast('error', {
        title: 'Could not delete',
        description: extractMessage(err, 'Please try again.'),
      });
    },
  });
}
