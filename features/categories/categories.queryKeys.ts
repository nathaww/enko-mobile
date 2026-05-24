export const categoriesQueryKeys = {
  all: () => ['categories'] as const,
  list: () => [...categoriesQueryKeys.all(), 'list'] as const,
  detail: (id: string) => [...categoriesQueryKeys.all(), 'detail', id] as const,
};
