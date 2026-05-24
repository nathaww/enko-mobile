export const insightsQueryKeys = {
  all: () => ['insights'] as const,
  composition: () => [...insightsQueryKeys.all(), 'composition'] as const,
  budget: () => [...insightsQueryKeys.all(), 'budget'] as const,
  peerComparison: () => [...insightsQueryKeys.all(), 'peerComparison'] as const,
};
