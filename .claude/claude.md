# CLAUDE.md

## Project Overview

This is a React Native app built with Expo, Expo Router, React Query, Axios, and a Context-based theme system (no Unistyles, no styled-components — see Styling section).

The codebase follows a modular, feature-first architecture:
- Each page or feature lives in its own folder.
- API, types, page, and feature components stay together.
- Shared utilities, hooks, types, services, providers, and UI live in global folders at the project root (no `src/` wrapper — Expo Router defaults to `app/` at the root and the cost of moving it is not worth the cosmetic win).
- Keep the structure scalable, predictable, and easy to refactor.

## Core Principles

- Prefer feature-based organization over layer-based organization.
- Keep business logic out of UI components when possible.
- Keep API calls in feature API files.
- Keep server state in React Query.
- Keep app-wide concerns centralized: auth, themes, errors, query client, axios config, providers.
- Reuse common components and types instead of duplicating them.

## Folder Structure (flat-root)

```txt
enko-mobile/
  app/                          # Expo Router routes
    _layout.tsx
    index.tsx
    (auth)/
      login.tsx
    (tabs)/
      _layout.tsx
      dashboard.tsx

  features/                     # Feature-scoped code
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

  components/                   # Reusable global UI
    Button.tsx
    EmptyState.tsx
    ErrorState.tsx
    LoadingView.tsx
    LottieView.tsx

  hooks/                        # Reusable global hooks
    useTheme.ts
    useHaptic.ts
    useDebounce.ts

  providers/                    # App-wide context providers
    AppProviders.tsx
    ThemeProvider.tsx
    QueryProvider.tsx

  theme/                        # Design tokens
    colors.ts
    spacing.ts
    radii.ts
    typography.ts
    shadows.ts
    light.ts
    dark.ts
    index.ts

  api/                          # Axios + interceptors
    axios.ts
    interceptors.ts

  query/                        # React Query client
    queryClient.ts

  types/                        # Shared types
    common.ts

  utils/                        # Pure helpers
    storage.ts
    logger.ts

  services/                     # External integrations
    analytics.ts
    pushNotifications.ts

  assets/                       # Static assets
    fonts/
    images/
    illustrations/              # SVG (empty, error, hero)
      empty/
      error/
      hero/                     # PNG @1x/@2x/@3x for 3D moments
    lottie/
      onboarding/
      loading/
      success/
    brand/
    illustrations.ts            # Typed asset registry — import from here

  constants/                    # Existing legacy folder, keep for now
  metro.config.js               # SVG transformer config
  svg.d.ts                      # SVG module type declarations
  app.json
  package.json
  tsconfig.json
```

## Feature Folder Rules

For every feature:
- Keep the screen file in the feature folder.
- Keep API functions in `feature-api.ts`.
- Keep request and response types in `feature.types.ts`.
- Keep query keys in `feature.queryKeys.ts`.
- Keep feature-specific components inside the same folder.
- Keep platform-specific UI in `.ios.tsx` and `.android.tsx` when needed.

## Routing

- Use Expo Router file-based routing.
- Keep route files thin.
- Route files should mostly re-export feature screens or compose them.
- Use `_layout.tsx` for app-wide providers and shared navigation structure.
- Use nested route groups like `(auth)` and `(tabs)` to separate flows.

## API Layer

### Axios
- Use one centralized Axios instance in `api/axios.ts`.
- Add request and response interceptors in `api/interceptors.ts`.
- Inject auth tokens in request interceptors.
- Normalize errors in response interceptors.
- Send unexpected errors to a global toast.
- Handle logout / token refresh centrally on 401.

### API file pattern
Each feature should have its own API file:
- `login-api.ts`
- `dashboard-api.ts`

Each API function should:
- Call the shared axios instance.
- Return `res.data`.
- Avoid UI logic, React Query logic, or component-shape transforms.

```ts
import { api } from '@/api/axios';
export const getUser = async () => {
  const res = await api.get('/user');
  return res.data;
};
```

## React Query Rules

- Always use React Query for server state.
- `useQuery` for reads, `useMutation` for writes.
- Import API functions from the matching `feature-api.ts`.
- Keep query keys in `feature.queryKeys.ts` as factory functions.
- Invalidate the correct queries after successful mutations.

```ts
useQuery({
  queryKey: dashboardQueryKeys.list(),
  queryFn: getDashboard,
});
```

## Types

- Create a `*.types.ts` per feature (`dashboard.types.ts`, etc.).
- Put reused types in `types/common.ts`.
- If a type starts being reused, move it from the feature file into `common.ts`.

```ts
// types/common.ts
export type ApiResponse<T> = { success: boolean; message: string; data: T };
export type PaginationMeta = { page: number; limit: number; total: number };
```

## Styling

We use **plain `StyleSheet.create` with theme tokens accessed via `useTheme()`** — no Unistyles, no styled-components. This keeps zero extra deps, no native rebuild risk, and the same primitives RN ships with.

```tsx
import { StyleSheet, View, Text } from 'react-native';
import { useTheme } from '@/hooks/useTheme';
import { spacing, radii, typography } from '@/theme';
import { useMemo } from 'react';

export function Card({ title }: { title: string }) {
  const theme = useTheme();
  const styles = useMemo(() => makeStyles(theme), [theme]);
  return (
    <View style={styles.root}>
      <Text style={styles.title}>{title}</Text>
    </View>
  );
}

function makeStyles(theme: ReturnType<typeof useTheme>) {
  return StyleSheet.create({
    root: {
      backgroundColor: theme.colors.surface1,
      borderRadius: radii['3xl'],
      padding: spacing.lg,
    },
    title: { ...typography.titleMD, color: theme.colors.onSurface },
  });
}
```

### Theme rules
- All design tokens live in `theme/`.
- Use semantic tokens (`theme.colors.onSurface`, `theme.colors.brand`) — never raw hex in feature code.
- Light + dark are defined as siblings in `theme/light.ts` and `theme/dark.ts`. Both export the same shape; `ThemeProvider` picks based on system or user override.
- Reach for shared tokens (`spacing`, `radii`, `typography`, `shadows`) from `@/theme` — they are not mode-dependent.

### When `useMemo(makeStyles)` becomes painful
If a component re-renders frequently and `makeStyles` shows up in profiling, hoist the static parts outside and only theme-dependent values inside. We can introduce Unistyles later if perf demands it — not before.

## Scripts

```bash
pnpm start             # metro dev server
pnpm ios               # build + run iOS (after pods are synced)
pnpm android           # build + run Android
pnpm ios:pods          # sync CocoaPods only
pnpm android:gradle    # clean Android gradle cache
pnpm ios:rebuild       # ios:pods + run:ios  (use after adding a native dep)
pnpm android:rebuild   # gradle clean + run:android
pnpm typecheck         # tsc --noEmit
```

**After installing any native module** (`expo-*`, `react-native-*` with native code) run `pnpm ios:rebuild` / `pnpm android:rebuild`. Metro reload alone is not enough; native modules need to be compiled into the binary. Symptom of skipping this: `Cannot find native module 'X'` at runtime.

## Reusability Rule (no copy-paste)

If a value, style, piece of UI, or behavior is used more than once, extract it into a shared primitive. Do not copy-paste. Do not wait for the "third strike" — by then the two callsites have already drifted apart.

- **UI used twice → component.** Lives in `components/` if used across features, in `features/<x>/components/` if scoped to one feature.
- **Behavior used twice → hook.** Lives in `hooks/` if shared, `features/<x>/hooks/` if scoped.
- **Style pattern used twice → extracted into a primitive component** (so the styling is set in one place and consumers compose them). Don't share style objects across feature code; share components that own the style.
- **Pure function used twice → util** in `utils/`.
- **Token (color, radius, spacing, font) used anywhere → must come from `theme/`.** Never hardcode `#9FE870` or `padding: 16` in a feature file.

### Worked example

We hit an iOS bug where `TextInput` clips descenders when `lineHeight` is set explicitly + the field is focused. The fix is a specific style combo (`fontFamily` + `fontSize` only, no `lineHeight`; `includeFontPadding: false`; `textAlignVertical: 'center'`). Rather than re-apply this in every input, we extract `<Input>` in `components/Input.tsx` and **every visible text input in the app uses it** — feature code never reaches for a bare `<TextInput>`.

The signal: if you find yourself copying a style block, *stop and extract first*. The refactor is always cheaper now than after three callsites have drifted.

## Copywriting Rules

- **Never use em-dashes (—) in user-facing text.** This applies to button labels, screen copy, toast titles/descriptions, error messages, onboarding slides, validation messages — anywhere a user might read the text. Use a period and a new sentence, a comma, or restructure. Comments in code are also no em-dash for consistency.
  - Bad: `"Track every birr — Enko sorts the rest."`
  - Good: `"Track every birr. Enko sorts the rest."`
- Sentence case for buttons and section headers (`Sign in`, not `Sign In`).
- Prefer simple, concrete words: `Track`, `See`, `Add`, not `Capture`, `Visualize`, `Create`.
- Toast titles are short imperatives or status (`Welcome back`, `Code sent`, `Sign in failed`). Description holds detail.

## Environment

API URL is configured via `EXPO_PUBLIC_API_URL` in `.env.local`. Anything prefixed with `EXPO_PUBLIC_` gets inlined at build time and is readable from JS via `process.env.EXPO_PUBLIC_API_URL`. **Restart metro after editing `.env.local`** (changes don't hot-reload).

Current deployed backend: `https://expense-tracker-backend-tawny-eight.vercel.app` — Swagger docs at `/api/docs-json`. **Note:** the `/api` prefix is *only* on the docs route. Actual endpoints live at the root, e.g. `POST /auth/login` (not `/api/auth/login`). The axios `baseURL` in `api/axios.ts` is set to the host without `/api`.

When `EXPO_PUBLIC_API_URL` is unset, `auth-api.ts` falls back to in-memory dev stubs so the UI is browsable without a backend. With it set, real calls go through.

## Form Performance

Formik re-renders all consumers on every keystroke because the context value is the whole formik state. Combined with Zod validation, naive setups lag visibly when users hold backspace. **Two rules** make every form fast enough without leaving Formik:

1. **Hoist validators out of render.** Define them at module scope, not inline:
   ```ts
   // ✅ good — single stable reference
   const validateLogin = zodValidate(LoginSchema);
   export function Login() {
     return <Formik validate={validateLogin} ...>;
   }

   // ❌ bad — new fn every render, Zod schema re-bound
   <Formik validate={zodValidate(LoginSchema)} ...>
   ```

2. **Validate on blur, not on change.** Default `validateOnChange={true}` means Zod parses the whole schema on every keystroke. Switch to `validateOnChange={false}` + `validateOnBlur` so validation runs only when a field loses focus (and on submit). This is also a friendlier UX — no shouting at users mid-typing.
   ```tsx
   <Formik
     validate={validateLogin}
     validateOnChange={false}
     validateOnBlur
     onSubmit={...}
   />
   ```

For forms with > 10 fields or async validators, also consider Formik's `<FastField>` (skips re-render unless the specific field changed). If you ever need to move away from Formik for performance, `react-hook-form` is the suggested replacement — it uses uncontrolled inputs and doesn't re-render on every keystroke.

## Auth & Session

Auth state is held by `providers/AuthProvider.tsx` and consumed via `hooks/useAuth.ts`.

- **Storage** — tokens live in `expo-secure-store` (iOS Keychain, Android Keystore). Wrapper at `services/secureStorage.ts`. Never touch SecureStore directly from feature code.
- **Bootstrap** — on mount, AuthProvider reads `accessToken` + `onboardingComplete` flag from secure storage and either authenticates or marks unauthenticated. Splash stays up until bootstrap completes.
- **Sign in / register** — auth mutations call `useAuth().signIn(authResponse)` which persists tokens AND updates context. Routes navigate to `/(tabs)` after.
- **Sign out** — `useAuth().signOut()` clears storage, resets context, navigates to `/(auth)/welcome`.
- **Onboarding flag** — `useAuth().completeOnboarding()` flips a persisted boolean so users see it only once.
- **Axios** — request interceptor pulls the access token from secure store on every call. Response interceptor handles 401 (refresh-or-logout, currently a TODO).
- **App entry decision** — `app/index.tsx` reads `useAuth()` and redirects:
  - bootstrapping → `null` (splash still up)
  - authenticated → `/(tabs)`
  - not onboarded → `/(onboarding)`
  - onboarded + signed out → `/(auth)/welcome`

## Global Components

- Put reusable UI in `components/` at root.
- Theme-aware (use `useTheme`).
- Don't put feature-specific UI here.
- Current primitives:
  - `Button` (primary / tonal / ghost / danger variants, haptic on press)
  - `EmptyState` (illustration + title + description + optional CTA)
  - `ErrorState` (defaults to retry CTA)
  - `LoadingView` (Lottie spinner + optional message)
  - `LottieView` (typed wrapper around `lottie-react-native`)

## Global Hooks

- Put reusable hooks in `hooks/` at root.
- Currently:
  - `useTheme` — active theme tokens
  - `useHaptic` — `haptic('medium')`, `haptic('success')`, etc.

## Global Utilities

- Put pure helpers in `utils/`.
- Formatting, date helpers, string helpers, storage wrappers.

## Services

- External integrations in `services/`: analytics, push, crash reporting.

## Error Handling

- API errors flow through Axios response interceptors → normalized shape → toast on unexpected failures.
- Screens handle local validation and empty/error states only.
- 401 → centralized refresh / logout (lives in interceptors).

## Query Keys

- Dedicated `*.queryKeys.ts` per feature.
- Factory functions, not hardcoded arrays:
  - `dashboardQueryKeys.all()`
  - `dashboardQueryKeys.list(filters)`
  - `dashboardQueryKeys.detail(id)`

## Naming Rules

- Lowercase kebab-case filenames where practical.
- Feature names consistent across folders, routes, API files.
- `*-api.ts`, `*.types.ts`, `*.queryKeys.ts` consistently.
- `index.ts` only when it reduces import noise.

## Platform-Specific UI

- `.ios.tsx` / `.android.tsx` only when UX truly differs (e.g. native date picker style, tab bar pattern).
- Keep the shared `.tsx` version as fallback.
- iOS: 5 flat tabs + bottom-right FAB. Android: 4 tabs with centered FAB lifted above the bar (per wireframe spec).

## Assets

All assets live under `assets/` at the project root. **Import via `assets/illustrations.ts`** — the typed registry — rather than reaching into filesystem paths from components:

```tsx
import { EmptyState } from '@/components/EmptyState';
<EmptyState illustration="expenses" title="No expenses yet" />
```

SVG imports work via `react-native-svg-transformer` (configured in `metro.config.js`). Lottie imports are JSON via `require()`. Hero 3D illustrations are PNG @1x/@2x/@3x.

## Testing

- Tests for critical utilities, hooks, API wrappers, and complex components.
- Feature-level tests next to the code.
- Mock API calls, not UI state.

## Working Rules

When building a new feature:
1. Create the feature folder under `features/`.
2. Add the screen component (`feature.tsx`).
3. Add the API file (`feature-api.ts`).
4. Add the types file (`feature.types.ts`).
5. Add query keys (`feature.queryKeys.ts`).
6. Add feature components in `components/` subfolder if needed.
7. Wire the route file under `app/` to the feature screen.
8. Fetch server state with React Query only.
9. Keep platform-specific UI isolated.
10. Use theme tokens — never raw hex/spacing values in component code.

## Foundation Status

- ✅ Deps installed: lottie-react-native, react-native-svg(+transformer), expo-haptics, Plus Jakarta Sans via @expo-google-fonts, @tanstack/react-query, axios
- ✅ Metro configured for SVG
- ✅ Theme tokens (colors, typography, spacing, radii, shadows, light, dark)
- ✅ Providers (ThemeProvider, QueryProvider, AppProviders)
- ✅ Hooks (useTheme, useHaptic)
- ✅ API + Query infrastructure (axios + interceptor stub, queryClient)
- ✅ Typed asset registry (assets/illustrations.ts)
- ✅ Core components (Button, EmptyState, ErrorState, LoadingView, LottieView)
- ✅ Root layout wired with providers + Plus Jakarta font loading
- ⏳ Branding assets (logo, splash, adaptive icon) — pending
- ⏳ Native rebuild required after this foundation pass: `npx expo prebuild --clean && npx expo run:ios` (and `run:android` when ready)
