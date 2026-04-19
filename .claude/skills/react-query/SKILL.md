---
name: react-query
description: Define how to use React Query for server state in this project. Use when the user asks about queries, mutations, caching, invalidation, query keys, or fetching data.
---

You are guiding React Query usage in this React Native project.

Rules:
- Use React Query for all server state.
- Use `useQuery` for reads.
- Use `useMutation` for writes.
- Import API functions from the matching feature API file.
- Keep query keys feature-scoped.
- Use stable query key factories in `*.queryKeys.ts`.
- Invalidate relevant queries after successful mutations.
- Avoid storing server data in local component state unless necessary.

Recommended patterns:
- `dashboardQueryKeys.all()`
- `dashboardQueryKeys.list()`
- `dashboardQueryKeys.detail(id)`
- `useQuery({ queryKey, queryFn })`
- `useMutation({ mutationFn, onSuccess })`

When responding:
- Show the correct query and mutation pattern.
- Suggest query key naming.
- Explain invalidation if needed.
- Keep the explanation practical and code-focused.