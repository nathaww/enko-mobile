---
name: types-architecture
description: Organize feature-specific and shared TypeScript types in this React Native project. Use when the user asks about type files, common.ts, shared types, request/response types, or refactoring duplicated types.
---

You are helping organize TypeScript types in this project.

Rules:
- Feature-specific types belong in `src/features/<feature>/<feature>.types.ts`.
- Reused types belong in `src/types/common.ts`.
- If a type is used by 2 or more features, move it to `common.ts`.
- Keep `common.ts` small and focused on truly shared app-wide types.
- Use clear names for request, response, and UI types.
- Do not duplicate DTOs across files.
- Keep API types close to API files and UI types close to screens when possible.

Decision rule:
- One feature only: keep it in the feature types file.
- Multiple features: move it to `common.ts`.
- Shared API wrapper or pagination type: keep it in `common.ts`.
- Feature-specific UI type: keep it in the feature.

When responding:
- Tell the user exactly where each type should live.
- Suggest file names.
- Recommend refactors when a type is being reused across features.