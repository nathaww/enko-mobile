import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/useToast';
import {
  createExpense,
  deleteExpense,
  parseExpenseFromText,
  updateExpense,
} from './expenses-api';
import { expensesQueryKeys } from './expenses.queryKeys';
import { homeQueryKeys } from '@/features/home/home.queryKeys';
import type {
  CreateExpenseRequest,
  UpdateExpenseRequest,
} from './expenses.types';

function extractMessage(err: unknown, fallback: string): string {
  if (typeof err === 'object' && err !== null) {
    const anyErr = err as { response?: { data?: { message?: string } }; message?: string };
    return anyErr.response?.data?.message ?? anyErr.message ?? fallback;
  }
  return fallback;
}

/**
 * Invalidate every query that depends on the expense list so the Expenses
 * tab, Home dashboard cards (total balance, recent activity, trends), and
 * any future analytics pick up fresh data automatically after mutations.
 */
function invalidateExpenseQueries(queryClient: ReturnType<typeof useQueryClient>) {
  return Promise.all([
    queryClient.invalidateQueries({ queryKey: expensesQueryKeys.all() }),
    queryClient.invalidateQueries({ queryKey: homeQueryKeys.all() }),
  ]);
}

export function useCreateExpense() {
  const queryClient = useQueryClient();
  const toast = useToast();
  return useMutation({
    mutationFn: (data: CreateExpenseRequest) => createExpense(data),
    onSuccess: async () => {
      await invalidateExpenseQueries(queryClient);
      toast('success', { title: 'Expense added' });
    },
    onError: (err) => {
      toast('error', {
        title: 'Could not add expense',
        description: extractMessage(err, 'Please try again.'),
      });
    },
  });
}

export function useUpdateExpense() {
  const queryClient = useQueryClient();
  const toast = useToast();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateExpenseRequest }) =>
      updateExpense(id, data),
    onSuccess: async () => {
      await invalidateExpenseQueries(queryClient);
      toast('success', { title: 'Expense updated' });
    },
    onError: (err) => {
      toast('error', {
        title: 'Could not update expense',
        description: extractMessage(err, 'Please try again.'),
      });
    },
  });
}

export function useDeleteExpense() {
  const queryClient = useQueryClient();
  const toast = useToast();
  return useMutation({
    mutationFn: (id: string) => deleteExpense(id),
    onSuccess: async () => {
      await invalidateExpenseQueries(queryClient);
      toast('success', { title: 'Expense deleted' });
    },
    onError: (err) => {
      toast('error', {
        title: 'Could not delete',
        description: extractMessage(err, 'Please try again.'),
      });
    },
  });
}

export function useParseExpense() {
  const toast = useToast();
  return useMutation({
    mutationFn: (text: string) => parseExpenseFromText(text),
    onError: (err) => {
      toast('error', {
        title: 'Could not parse',
        description: extractMessage(err, 'Try rewriting in plain text.'),
      });
    },
  });
}
