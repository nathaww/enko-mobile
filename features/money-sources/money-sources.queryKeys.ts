export const moneySourcesQueryKeys = {
  all: () => ['money-sources'] as const,
  list: () => [...moneySourcesQueryKeys.all(), 'list'] as const,
  detail: (id: string) => [...moneySourcesQueryKeys.all(), 'detail', id] as const,
};
