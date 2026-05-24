import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/useToast';
import { createCategory, deleteCategory, updateCategory } from './categories-api';
import { categoriesQueryKeys } from './categories.queryKeys';
import { expensesQueryKeys } from '@/features/expenses/expenses.queryKeys';
import { homeQueryKeys } from '@/features/home/home.queryKeys';
import type {
  CreateCategoryRequest,
  UpdateCategoryRequest,
} from './categories.types';

function extractMessage(err: unknown, fallback: string): string {
  if (typeof err === 'object' && err !== null) {
    const anyErr = err as { response?: { data?: { message?: string } }; message?: string };
    return anyErr.response?.data?.message ?? anyErr.message ?? fallback;
  }
  return fallback;
}

// Categories are referenced by expenses (and dashboard rollups), so any
// create/update/delete has to bust both feature caches or the lists go stale.
function invalidateCategoryQueries(queryClient: ReturnType<typeof useQueryClient>) {
  return Promise.all([
    queryClient.invalidateQueries({ queryKey: categoriesQueryKeys.all() }),
    queryClient.invalidateQueries({ queryKey: expensesQueryKeys.all() }),
    queryClient.invalidateQueries({ queryKey: homeQueryKeys.all() }),
  ]);
}

export function useCreateCategory() {
  const queryClient = useQueryClient();
  const toast = useToast();
  return useMutation({
    mutationFn: (data: CreateCategoryRequest) => createCategory(data),
    onSuccess: async () => {
      await invalidateCategoryQueries(queryClient);
      toast('success', { title: 'Category added' });
    },
    onError: (err) => {
      toast('error', {
        title: 'Could not add category',
        description: extractMessage(err, 'Please try again.'),
      });
    },
  });
}

export function useUpdateCategory() {
  const queryClient = useQueryClient();
  const toast = useToast();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateCategoryRequest }) =>
      updateCategory(id, data),
    onSuccess: async () => {
      await invalidateCategoryQueries(queryClient);
      toast('success', { title: 'Category updated' });
    },
    onError: (err) => {
      toast('error', {
        title: 'Could not update category',
        description: extractMessage(err, 'Please try again.'),
      });
    },
  });
}

export function useDeleteCategory() {
  const queryClient = useQueryClient();
  const toast = useToast();
  return useMutation({
    mutationFn: (id: string) => deleteCategory(id),
    onSuccess: async () => {
      await invalidateCategoryQueries(queryClient);
      toast('success', { title: 'Category deleted' });
    },
    onError: (err) => {
      toast('error', {
        title: 'Could not delete',
        description: extractMessage(err, 'Please try again.'),
      });
    },
  });
}
