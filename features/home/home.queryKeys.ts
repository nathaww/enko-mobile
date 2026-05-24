import type { Period } from './home.types';

export const homeQueryKeys = {
  all: () => ['home'] as const,
  overview: () => [...homeQueryKeys.all(), 'overview'] as const,
  totalBalance: (period: Period) =>
    [...homeQueryKeys.all(), 'totalBalance', period] as const,
  expensesOverview: (period: Period) =>
    [...homeQueryKeys.all(), 'expensesOverview', period] as const,
  trends: () => [...homeQueryKeys.all(), 'trends'] as const,
  recent: (limit: number) =>
    [...homeQueryKeys.all(), 'recent', limit] as const,
};
