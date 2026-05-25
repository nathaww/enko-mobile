import type { Period } from './home.types';

export const homeQueryKeys = {
  all: () => ['home'] as const,
  overview: () => [...homeQueryKeys.all(), 'overview'] as const,
  totalBalance: (period: Period) =>
    [...homeQueryKeys.all(), 'totalBalance', period] as const,
  trends: () => [...homeQueryKeys.all(), 'trends'] as const,
  composition: () => [...homeQueryKeys.all(), 'composition'] as const,
  budget: () => [...homeQueryKeys.all(), 'budget'] as const,
  peerComparison: () => [...homeQueryKeys.all(), 'peerComparison'] as const,
  recent: (limit: number) =>
    [...homeQueryKeys.all(), 'recent', limit] as const,
};
