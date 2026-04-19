# CLAUDE.md

## Project Overview

This is a React Native app built with Expo, Expo Router, React Query, Axios, react-native-unistyles, and styled-components.

The codebase follows a modular, feature-first architecture:
- Each page or feature lives in its own folder.
- API, types, page, and feature components stay together.
- Shared utilities, hooks, types, services, and UI live in global folders.
- Keep the structure scalable, predictable, and easy to refactor.

## Core Principles

- Prefer feature-based organization over layer-based organization.
- Keep business logic out of UI components when possible.
- Keep API calls in feature API files.
- Keep server state in React Query.
- Keep app-wide concerns centralized: auth, themes, errors, query client, and axios config.
- Reuse common components and types instead of duplicating them.

## Folder Structure

Use this pattern:

```txt
src/
  app/
    _layout.tsx
    index.tsx
    (auth)/
      login.tsx
    (main)/
      dashboard.tsx

  features/
    dashboard/
      dashboard.tsx
      dashboard.ios.tsx
      dashboard.android.tsx
      dashboard-api.ts
      dashboard.types.ts
      dashboard.queryKeys.ts
      components/
        DashboardCard.tsx
        DashboardHeader.tsx
      hooks/
        useDashboardFilters.ts
      utils/
        formatDashboardData.ts
      index.ts

    login/
      login.tsx
      login-api.ts
      login.types.ts
      login.queryKeys.ts
      components/
        LoginForm.tsx

  components/
    Button.tsx
    Input.tsx
    Loader.tsx
    ErrorState.tsx
    EmptyState.tsx

  hooks/
    useToast.ts
    useDebounce.ts

  types/
    common.ts

  api/
    axios.ts
    interceptors.ts

  query/
    queryClient.ts

  theme/
    colors.ts
    spacing.ts
    typography.ts
    light.ts
    dark.ts
    index.ts

  utils/
    storage.ts
    logger.ts
    helpers.ts

  services/
    analytics.ts
    pushNotifications.ts
```

## Feature Folder Rules

For every feature:
- Keep the screen file in the feature folder.
- Keep API functions in `feature-api.ts`.
- Keep request and response types in `feature.types.ts`.
- Keep query keys in `feature.queryKeys.ts`.
- Keep feature-specific components inside the same folder.
- Keep platform-specific UI in `.ios.tsx` and `.android.tsx` when needed.

Example:
- `dashboard-api.ts` contains dashboard network functions.
- `dashboard.types.ts` contains dashboard DTOs.
- `dashboard.queryKeys.ts` contains React Query keys.
- `dashboard.tsx` contains the main screen.
- `dashboard.ios.tsx` and `dashboard.android.tsx` override the screen when the UX needs to feel more native.

## Routing

- Use Expo Router file-based routing.
- Keep route files thin.
- Route files should mostly re-export feature screens or compose them.
- Use `_layout.tsx` for app-wide providers and shared navigation structure.
- Use nested route groups like `(auth)` and `(main)` to separate flows.

Important:
- In `app/`, always keep a non-platform route file when using `.ios.tsx` or `.android.tsx` there.
- Prefer platform-specific feature components outside `app/` when possible.
- Use platform-specific files only when the UX truly differs.

## API Layer

### Axios
- Use one centralized Axios instance.
- Add request and response interceptors.
- Inject auth tokens in request interceptors.
- Normalize errors in response interceptors.
- Send unexpected errors to a global toast or notification system.
- Handle logout or token refresh centrally if needed.

### API file pattern
Each feature should have its own API file:
- `login-api.ts`
- `homepage-api.ts`
- `dashboard-api.ts`

Each API function should:
- Call Axios.
- Return `res.data`.
- Avoid UI logic.
- Avoid React Query logic.
- Avoid transformation that belongs in hooks or components.

Example:
```ts
export const getUser = async () => {
  const res = await api.get('/user');
  return res.data;
};
```

## React Query Rules

- Always use React Query for server state.
- Use `useQuery` for reads.
- Use `useMutation` for writes.
- Import functions from the matching API file.
- Keep query keys feature-scoped and consistent.
- Invalidate the correct queries after successful mutations.
- Prefer `queryClient.invalidateQueries` over manual state syncing unless necessary.

### Query file pattern
For each feature:
- `feature.queryKeys.ts`
- `feature-api.ts`
- `useFeatureQuery.ts` or direct `useQuery` usage in the screen

Example:
```ts
useQuery({
  queryKey: dashboardQueryKeys.list(),
  queryFn: getDashboard,
});
```

## Types

- Create a `*.types.ts` file for each feature, such as `dashboard.types.ts`, `login.types.ts`, or `profile.types.ts`.
- Put feature-specific request, response, and UI types in the matching feature file.
- Put reused or app-wide types in `src/types/common.ts`.
- Use `common.ts` for types shared across multiple features, pages, hooks, or API files.
- Do not duplicate the same type in multiple feature files.
- If a type starts being reused, move it from the feature file into `common.ts`.

Example:

```ts
// src/types/common.ts
export type ApiResponse<T> = {
  success: boolean;
  message: string;
  data: T;
};

export type PaginationMeta = {
  page: number;
  limit: number;
  total: number;
};
```

```ts
// src/features/dashboard/dashboard.types.ts
export type DashboardStats = {
  revenue: number;
  users: number;
  growth: number;
};

export type DashboardFilters = {
  fromDate?: string;
  toDate?: string;
};
```

## Styling

- Use `react-native-unistyles` for theme-aware styling and runtime theme switching.
- Use `styled-components` when component-scoped styling is cleaner.
- Support dark and light themes from day one.
- Design the theme system so future themes can be added without rewiring the app.

### Theme rules
- Keep theme tokens centralized.
- Define colors, spacing, radius, typography, and shadow tokens in one place.
- Use semantic tokens like `textPrimary`, `surface`, `border`, and `danger`.
- Never hardcode colors in feature code unless it is a one-off exception.
- Use theme values in both global components and feature components.

## Global Components

- Put reusable UI in `components/`.
- Keep these components generic and theme-aware.
- Do not place feature-specific UI in the global components folder.
- Add reusable primitives like:
  - Button
  - Input
  - Card
  - Loader
  - EmptyState
  - ErrorState
  - ToastContainer

## Global Hooks

- Put reusable hooks in `hooks/`.
- Use hooks for shared behavior such as:
  - debouncing
  - toast access
  - auth session access
  - network state
  - app lifecycle logic

## Global Utilities

- Put reusable helpers in `utils/`.
- Keep utilities pure when possible.
- Use this folder for:
  - formatting
  - logging
  - storage helpers
  - date helpers
  - string helpers

## Services

- Put external integrations in `services/`.
- Use this for:
  - analytics
  - push notifications
  - crash reporting
  - app review prompts
- Do not put UI or screen logic in services.

## Error Handling

- All API errors should flow through Axios interceptors.
- Normalize server errors into a consistent shape.
- Show toast notifications for unexpected failures.
- Let screen components handle local validation and empty states only.
- If a request is unauthorized, handle refresh/logout centrally.

## Query Keys

- Keep query keys in dedicated `*.queryKeys.ts` files.
- Use stable factory functions instead of hardcoded arrays everywhere.
- Example:
  - `dashboardQueryKeys.all()`
  - `dashboardQueryKeys.list()`
  - `dashboardQueryKeys.detail(id)`

## Naming Rules

- Use lowercase and kebab-case filenames where practical.
- Keep feature names consistent across folders, routes, and API files.
- Prefer `login-api.ts` over a generic `api.ts` when a feature has multiple network modules.
- Use `*.types.ts` consistently across the project.
- Use `index.ts` only when it reduces import noise.

## Platform-Specific UI

- Use `.ios.tsx` and `.android.tsx` when the same feature needs different native experiences.
- Keep the shared version as the fallback.
- Prefer platform-specific components outside `app/` when you want to keep routing simple.
- Avoid copying an entire feature just to tweak a small visual difference.

## Testing

- Add tests for critical utilities, hooks, API wrappers, and complex components.
- Prefer feature-level tests close to the code.
- Test query hooks and mutations when business logic matters.
- Mock API calls, not UI state, whenever possible.

## Suggested Additions

- `schemas/` for Zod or runtime validation.
- `constants/` for shared app constants.
- `providers/` for app providers like QueryClient, ThemeProvider, AuthProvider, and ToastProvider.
- `assets/` for icons, fonts, and images.
- `config/` for environment-specific configuration.
- `middleware/` or `guards/` for route protection if needed later.

## Working Rules

When building a new feature:
1. Create the feature folder.
2. Add the screen component.
3. Add the API file.
4. Add the types file.
5. Add query keys.
6. Add feature components if needed.
7. Wire the route file to the feature screen.
8. Fetch server state with React Query only.
9. Keep platform-specific UI isolated.
10. Keep theme usage consistent and token-based.