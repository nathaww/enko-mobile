import type { ExpenseFilters } from './expenses.types';

export const expensesQueryKeys = {
  all: () => ['expenses'] as const,
  list: (filters?: ExpenseFilters) =>
    [...expensesQueryKeys.all(), 'list', filters ?? {}] as const,
  recent: (limit: number) =>
    [...expensesQueryKeys.all(), 'recent', limit] as const,
  detail: (id: string) => [...expensesQueryKeys.all(), 'detail', id] as const,
};
