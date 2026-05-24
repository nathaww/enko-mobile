# Enko Mobile · Principles & Conventions

The exhaustive source of truth for this project. CLAUDE.md is the short summary loaded into every session; this file is the deep reference. The `review` skill checks changes against everything in here.

If you're a fresh session, **read this file top to bottom before making non-trivial changes**.

---

## 0. Project at a Glance

- **What:** Personal finance / expense tracker for Ethiopia (ETB-default, multi-currency capable). Track expenses, manage money sources (accounts), see budget vs actual, get AI-parsed expense entry.
- **Stack:** Expo SDK 54 · React Native 0.81 · Expo Router (file-based routing) · React Query · Axios · Plus Jakarta Sans font · Lucide icons · TypeScript strict mode
- **Backend:** NestJS + Prisma deployed at `https://expense-tracker-backend-tawny-eight.vercel.app`. Swagger JSON: `/api/docs-json`. Endpoints live at root, **not** under `/api`.
- **Three projects in the parent repo:** `enko-mobile` (this), `enko-web` (Next.js), `enko-backend` (NestJS).

---

## 1. Folder Structure (flat-root)

No `src/` wrapper. Expo Router expects `app/` at the project root and we follow that convention. Everything else sits as siblings.

```txt
enko-mobile/
  app/                # Expo Router routes (thin re-exports of feature screens)
    _layout.tsx       # Root: providers, font loading, splash, toast root
    index.tsx         # Entry redirect (decides onboarding/auth/tabs)
    (onboarding)/
    (auth)/
    (tabs)/           # Tab group with NativeTabs layout
  features/           # Feature folders — see §3
    auth/
    home/
    expenses/
    money-sources/
    categories/
    onboarding/
    profile/
  components/         # Global reusable UI primitives — see §10
  hooks/              # Global reusable hooks — see §11
  providers/          # AppProviders, ThemeProvider, AuthProvider, QueryProvider
  theme/              # Design tokens — see §7
  api/                # axios.ts + interceptors.ts
  query/              # queryClient.ts (React Query setup)
  types/              # common.ts — cross-feature shared types
  utils/              # Pure helpers (formatAmount, zodValidate, etc.)
  services/           # External integrations (secureStorage so far)
  assets/             # Static assets
    fonts/
    images/
    illustrations/    # SVG empty/error/auth + PNG hero
    lottie/           # JSON for onboarding/loading/success
    icons/tabs/       # PNG tab icons + auto-generated densities
    brand/
    illustrations.ts  # Typed asset registry — see §13
  scripts/            # Build/dev scripts (convert-tab-icons.sh, etc.)
  metro.config.js
  app.json
  package.json
  tsconfig.json
  .env.local          # EXPO_PUBLIC_* env vars
```

**Why no `src/`:** Expo Router defaults to root `app/`. Moving to `src/app/` requires extra config in `package.json` "main" and metro config. Cosmetic only — costs more than it gains.

---

## 2. Naming Conventions

| Kind | Convention | Examples |
|---|---|---|
| **Files (mostly)** | `kebab-case` | `expenses-api.ts`, `auth.mutations.ts`, `home.queryKeys.ts` |
| **Component files** | `PascalCase.tsx` | `Button.tsx`, `AddExpenseSheet.tsx`, `BalanceHero.tsx` |
| **Feature screen** | `<feature>.tsx` | `expenses.tsx`, `home.tsx`, `login.tsx` |
| **Feature API** | `<feature>-api.ts` | `expenses-api.ts`, `auth-api.ts` |
| **Feature types** | `<feature>.types.ts` | `expenses.types.ts` |
| **Feature query keys** | `<feature>.queryKeys.ts` | `expensesQueryKeys` export inside |
| **Feature schemas (Zod)** | `<feature>.schemas.ts` | `LoginSchema`, `ExpenseFormSchema` |
| **Feature mutations** | `<feature>.mutations.ts` | `useLoginMutation`, `useCreateExpense` |
| **React components** | `PascalCase` exports | `Button`, `Card`, `AmountChip` |
| **Functions/variables** | `camelCase` | `formatAmount`, `useAuth`, `signIn` |
| **Constants** | `UPPER_SNAKE_CASE` for module-scope const data | `DEV_ACCOUNTS`, `PERIOD_OPTIONS` |
| **Types** | `PascalCase` | `Expense`, `AuthUser`, `Period` |
| **Type aliases for unions** | `PascalCase` | `ThemeMode = 'light' \| 'dark'` |
| **Hooks** | `use` prefix | `useAuth`, `useTheme`, `useHaptic` |
| **Boolean variables** | `is/has/should` prefix | `isPending`, `hasOnboarded`, `shouldRefresh` |
| **Handlers** | `on` prefix for callbacks, `handle` for internal | `onPress`, `handleSubmit` |
| **Query key factories** | `<feature>QueryKeys` exported const | `authQueryKeys`, `expensesQueryKeys` |

**Don't:**
- ❌ `featureApi.ts` — use `feature-api.ts`
- ❌ `useFeatureQueries.ts` (multiple hooks inside) — split or use `feature.mutations.ts` / `feature.queries.ts`
- ❌ generic `helpers.ts` — name what's in it (`formatAmount.ts`, `dateUtils.ts`)
- ❌ `index.ts` barrel files in `features/` — they hide imports. Only use when reducing real noise.

---

## 3. Feature Folder Pattern

A canonical feature folder:

```txt
features/expenses/
  expenses.tsx                # The screen component
  expenses-api.ts             # axios calls, return res.data, no UI logic
  expenses.types.ts           # request/response/domain types
  expenses.queryKeys.ts       # factory functions for React Query keys
  expenses.schemas.ts         # Zod schemas if the feature has forms
  expenses.mutations.ts       # useMutation hooks
  groupByDate.ts              # feature-scoped pure utilities (optional)
  components/                 # feature-scoped UI components
    ExpenseListItem.tsx
    AddExpenseSheet.tsx
    AmountInput.tsx
  hooks/                      # feature-scoped hooks (when needed)
```

**Rules:**
- The screen file (`<feature>.tsx`) is the composition root. It owns local state, wires queries to UI, and composes child components.
- API functions are **pure** — they call axios, return `res.data`, and never touch UI or React Query.
- Mutation hooks live in `<feature>.mutations.ts`, NOT in the screen. They invalidate the right queries and surface toasts.
- Feature-scoped components stay in `components/` under the feature. If they get used in a second feature, promote to global `components/`.
- Routes (in `app/`) are **thin re-exports**: `export { Expenses as default } from '@/features/expenses/expenses';`. Don't put logic in route files.

---

## 4. API Layer

**Single axios instance** in [api/axios.ts](api/axios.ts). All requests go through it. Base URL comes from `EXPO_PUBLIC_API_URL` (set in `.env.local`).

**Interceptors** in [api/interceptors.ts](api/interceptors.ts), wired once in `_layout.tsx` before anything renders:
- Request: pulls JWT from `secureStorage`, sets `Authorization: Bearer <token>`
- Response: TODO — refresh-on-401 (currently single-shot reject so errors surface in toasts during dev)

**Per-feature API files** (e.g. `expenses-api.ts`):
- Pure async functions
- Return `res.data` directly (no transforms)
- No UI logic, no toasts, no navigation
- Type the request and response explicitly

```ts
// ✅ good
export async function listExpenses(filters: ExpenseFilters = {}): Promise<Expense[]> {
  const res = await api.get<Expense[]>('/expenses', { params: filters });
  return res.data;
}

// ❌ bad — UI logic in API
export async function listExpenses(filters: ExpenseFilters) {
  toast.show('Loading...'); // never
  const res = await api.get('/expenses', { params: filters });
  return res.data.map(e => ({ ...e, displayDate: format(e.date) })); // transforms belong in hooks/components
}
```

### Dev stub pattern

Every API function checks `const useDevStub = __DEV__ && !process.env.EXPO_PUBLIC_API_URL;` at top of file. When true, it returns mock data instead of hitting the network. Lets the UI be developed offline.

For "list" APIs the stub returns a static array. For "write" APIs (create / update / delete), use **module-scoped state** so the stub feels interactive:

```ts
let stubExpenses: Expense[] | null = null;

function ensureStub(): Expense[] {
  if (stubExpenses) return stubExpenses;
  stubExpenses = [/* initial seed */];
  return stubExpenses;
}

export async function createExpense(data: CreateExpenseRequest): Promise<Expense> {
  if (useDevStub) {
    await delay(300);
    const newExpense = build(data);
    stubExpenses = [newExpense, ...ensureStub()];
    return newExpense;
  }
  const res = await api.post('/expenses', data);
  return res.data;
}
```

State resets on app reload.

---

## 5. React Query

### Setup

`QueryClient` lives in [query/queryClient.ts](query/queryClient.ts). Mounted via `QueryProvider` inside `AppProviders`. Defaults:
- `staleTime: 30_000` — data stays fresh for 30s
- `gcTime: 5 * 60_000` — cache kept 5min after unmount
- `retry: 1` for queries, `retry: 0` for mutations
- `refetchOnWindowFocus: false` — RN doesn't have window focus

### Query keys

Always use **factory functions** in `<feature>.queryKeys.ts`:

```ts
export const expensesQueryKeys = {
  all: () => ['expenses'] as const,
  list: (filters?: ExpenseFilters) => [...expensesQueryKeys.all(), 'list', filters ?? {}] as const,
  detail: (id: string) => [...expensesQueryKeys.all(), 'detail', id] as const,
};
```

The `all()` key is the namespace — invalidating it nukes every query in that feature.

### Reads

Use `useQuery` directly in components or in feature hooks:

```ts
const expensesQ = useQuery({
  queryKey: expensesQueryKeys.list(filters),
  queryFn: () => listExpenses(filters),
});
```

For multiple parallel queries in one screen, use `useQueries`:

```ts
const results = useQueries({
  queries: [
    { queryKey: homeQueryKeys.totalBalance(period), queryFn: () => getTotalBalance(period) },
    { queryKey: homeQueryKeys.recent(5), queryFn: () => getRecentExpenses(5) },
    /* ... */
  ],
});
```

### Mutations

Live in `<feature>.mutations.ts`. Each mutation:
1. Calls the API function via `useMutation`
2. **Invalidates** relevant query keys on success
3. Shows a toast on success/error (use `useToast`)
4. Navigates / triggers side effects as appropriate

```ts
export function useCreateExpense() {
  const queryClient = useQueryClient();
  const toast = useToast();
  return useMutation({
    mutationFn: (data: CreateExpenseRequest) => createExpense(data),
    onSuccess: async () => {
      await invalidateExpenseQueries(queryClient);
      toast('success', { title: 'Expense added' });
    },
    onError: (err) => {
      toast('error', { title: 'Could not add', description: extractMessage(err, '...') });
    },
  });
}
```

### Cross-feature invalidation

When a mutation affects multiple features' data, invalidate all of them. Common example: creating an expense should refresh the Home dashboard:

```ts
function invalidateExpenseQueries(queryClient) {
  return Promise.all([
    queryClient.invalidateQueries({ queryKey: expensesQueryKeys.all() }),
    queryClient.invalidateQueries({ queryKey: homeQueryKeys.all() }),
  ]);
}
```

---

## 6. Type System

### Where types live

- **Feature-specific** types: `<feature>.types.ts` (request DTOs, response DTOs, domain types, filter shapes)
- **App-wide shared** types: [types/common.ts](types/common.ts) (`ApiResponse<T>`, `PaginationMeta`, `Paginated<T>`)
- **Auth shared** types: feature folder owns them — `features/auth/auth.types.ts` (other features `import type { AuthUser } from '@/features/auth/auth.types'` when needed)

### Zod for runtime validation

Form schemas live in `<feature>.schemas.ts`. Export both the schema and the inferred type:

```ts
export const LoginSchema = z.object({
  email: z.string().min(1, 'Email is required').email('Enter a valid email'),
  password: z.string().min(8, 'At least 8 characters'),
});

export type LoginValues = z.infer<typeof LoginSchema>;
```

Validators are wired to Formik via `zodValidate()` in [utils/zodValidate.ts](utils/zodValidate.ts).

### Type matching backend

Mobile DTOs mirror backend DTOs from `enko-backend/src/<feature>/dto/`. When the backend changes a field, update the mobile type. **Keep them in sync** — do not transform shapes at the API boundary unless the backend response is genuinely unfit for client use.

---

## 7. Theming

### Tokens

All design tokens in [theme/](theme/):
- `colors.ts` — palette (brand, surfaces light/dark, semantic chips, category accents)
- `spacing.ts` — 4, 8, 12, 16, 20, 24, 32, 40, 48, 64
- `radii.ts` — 8, 12, 14, 16, 18, 22, 24, 28, 36, pill
- `typography.ts` — Plus Jakarta Sans variants + scale (displayXL down to label)
- `shadows.ts` — soft / FAB / sheet shadow presets
- `light.ts`, `dark.ts` — full theme objects with same shape
- `index.ts` — exports + `Theme` / `ThemeMode` type

### Brand

**One brand accent: `#9FE870` (Wise green).** Owns CTAs, FAB, active tab, charts, links. Never use a different "primary" color anywhere.

### Light vs dark

Both themes export the same shape. `ThemeProvider` selects based on:
1. Explicit user override (saved to SecureStore)
2. Else system color scheme (via `useColorScheme()` from RN)
3. Defaults to dark if both above are undefined

Override is persisted in `secureStorage.themeOverride` so user choice survives relaunch.

### How to read theme in components

```tsx
import { useTheme } from '@/hooks/useTheme';

function MyComponent() {
  const theme = useTheme();
  const styles = useMemo(() => makeStyles(theme), [theme]);
  return <View style={styles.root} />;
}

function makeStyles(theme: ReturnType<typeof useTheme>) {
  return StyleSheet.create({
    root: {
      backgroundColor: theme.colors.surface1,
      padding: spacing.lg,
    },
  });
}
```

**Always memoize styles with `useMemo`** — without it, every render creates a new style object. We pulled this pattern into every component for consistency.

### Rules

- **Never** hardcode hex / rgba in feature code. Use `theme.colors.*`.
- **Never** hardcode pixel padding/margin in feature code. Use `spacing.*`.
- **Never** hardcode border radius. Use `radii.*`.
- Font family must come from `typography.*.fontFamily` (`PlusJakartaSans_*`).
- Status bar style must match theme mode (handled by `<StatusBar style={mode === 'dark' ? 'light' : 'dark'} />` in `_layout`).

---

## 8. Forms

### Stack: Formik + Zod + sonner-style toasts

[utils/zodValidate.ts](utils/zodValidate.ts) is the adapter:

```tsx
<Formik
  initialValues={initial}
  validate={validateLogin}        // hoisted module-scoped reference
  validateOnChange={false}        // perf: don't validate on every keystroke
  validateOnBlur                  // validate when user tabs out
  onSubmit={(values) => mutation.mutate(values)}
>
```

### Performance rules

1. **Hoist the validator out of render.** Inline `validate={zodValidate(Schema)}` creates a new function every render — Zod schema rebuilds on every keystroke.

   ```ts
   // ✅ good — module scope
   const validateLogin = zodValidate(LoginSchema);

   // ❌ bad
   <Formik validate={zodValidate(LoginSchema)} ... />
   ```

2. **Use `validateOnChange={false}` + `validateOnBlur`.** Validation runs only when field loses focus or on submit. Massive perf win, friendlier UX.

3. **Clear stale errors on field change.** With `validateOnChange=false`, errors stick until next blur. In `FormField` and `CodeInput` we clear them eagerly:

   ```ts
   onChangeText={(text) => {
     helpers.setValue(text);
     if (meta.error) helpers.setError(undefined);
   }}
   ```

### TextInput rules

**Never use raw `<TextInput>` in feature code.** Always go through `<Input>` from [components/Input.tsx](components/Input.tsx). It bakes in:
- iOS descender fix (no explicit `lineHeight`, paddingVertical instead)
- Android `includeFontPadding: false` + `textAlignVertical: 'center'`
- Default `placeholderTextColor` from theme
- Typography variants (`body` / `display`)

The raw `<TextInput>` will clip the bottom of `j`, `g`, `p`, `y` when focused on iOS.

### Reusable form primitives

- `<Input variant="body|display">` — theme-aware TextInput primitive
- `<FormField name label>` — Formik-aware bordered field with label + animated border + error
- `<CodeInput name length>` — 6-digit OTP entry with iOS SMS autofill + Android one-tap

---

## 9. Reusability (DRY)

**If used more than once, extract.** No copy-paste. Don't wait for the "third strike."

- **UI used twice → component.** Lives in `components/` if cross-feature, in `features/<x>/components/` if scoped to one feature.
- **Behavior used twice → hook.** Lives in `hooks/` if shared, `features/<x>/hooks/` if scoped.
- **Style pattern used twice → primitive component owns the style.** Don't share style objects; share components that own the style.
- **Pure function used twice → util** in `utils/`.
- **Token (color, radius, spacing, font) used anywhere → must come from `theme/`.** Never hardcode `#9FE870` or `padding: 16` in a feature file.

### Existing global primitives (use these, don't reinvent)

| Component | Purpose | File |
|---|---|---|
| `Button` | Primary / tonal / ghost / danger variants, haptic on press | `components/Button.tsx` |
| `Input` | Themed TextInput with platform fixes | `components/Input.tsx` |
| `FormField` | Formik-aware bordered field | `components/FormField.tsx` |
| `CodeInput` | 6-digit OTP with autofill | `components/CodeInput.tsx` |
| `Card` | Surface-1 card primitive (`default \| tight \| hero \| flat`) | `components/Card.tsx` |
| `Segmented` | Generic segmented control | `components/Segmented.tsx` |
| `AmountChip` | Semantic pill chip (`pos \| neg \| info \| brand \| muted`) | `components/AmountChip.tsx` |
| `ListItem` | Generic row with icon + meta + trailing | `components/ListItem.tsx` |
| `EmptyState` | Illustration + title + description + optional CTA | `components/EmptyState.tsx` |
| `ErrorState` | Same shape, retry CTA default | `components/ErrorState.tsx` |
| `LoadingView` | Lottie spinner + optional message | `components/LoadingView.tsx` |
| `LottieView` | Typed Lottie wrapper, references registry | `components/LottieView.tsx` |
| `Toast` (`AppToast`) | Mounted at root; trigger via `useToast()` | `components/Toast.tsx` |

### Existing global hooks

- `useTheme()` — current theme object
- `useThemeContext()` — theme + override + setOverride
- `useAuth()` — auth state + signIn/signOut/completeOnboarding/reset
- `useHaptic()` — returns `haptic(kind)` for light/medium/heavy/selection/success/warning/error
- `useToast()` — returns `toast(kind, { title, description })` with auto-paired haptic

### Existing utilities

- `utils/formatAmount.ts` — `formatAmount()`, `splitAmount()` (whole + cents), `HIDDEN_AMOUNT`
- `utils/zodValidate.ts` — Zod-to-Formik adapter

---

## 10. Copywriting

### Hard rules

- **Never use em-dashes (—) in user-facing text.** Includes button labels, screen copy, toast titles/descriptions, error messages, onboarding slides, validation messages, code comments. Replace with periods, commas, or restructure.
  - ❌ `"Track every birr — Enko sorts the rest."`
  - ✅ `"Track every birr. Enko sorts the rest."`

- **Sentence case for buttons and section headers.** "Sign in", not "Sign In". "Reset your password.", not "Reset Your Password".

- **Simple, concrete verbs.** "Track", "See", "Add" — not "Capture", "Visualize", "Create".

- **Toast titles are short imperatives or status.** ("Welcome back", "Code sent", "Sign in failed"). Description holds detail.

### Tone

Friendly but precise. No jargon, no marketing fluff. Two-sentence max for descriptions. Trust the user; don't over-explain.

---

## 11. Platform-specific UI

### When to fork

`.ios.tsx` / `.android.tsx` files only when UX truly differs. Keep the shared `.tsx` as the fallback for type resolution (TypeScript doesn't follow Metro's platform extensions — without a fallback, imports fail).

### Tab bar — NativeTabs

The bottom tab bar uses `expo-router/unstable-native-tabs` (not a custom JS implementation). This is non-negotiable because iOS 26's liquid glass material is rendered by UIKit on native tab bars; a JS BlurView is only an approximation.

**What we control via NativeTabs props:**
- `tintColor` — selected icon + label (set to `theme.colors.brand`)
- `iconColor` — inactive icon color (set to `theme.colors.onSurfaceMuted`)
- `labelStyle` — Plus Jakarta on the label
- Per-trigger PNG icons via `src={{ default, selected }}` — outline + filled pairs

**What we don't control:**
- Bar background (it IS the liquid glass material on iOS 26 — translucent by design)

### Tab icons (SVG → PNG workflow)

Tab icons must be **PNG** files. iOS treats them as template images (alpha mask) and tints via `tintColor`/`iconColor` automatically. SVG React elements as `src` do NOT get this treatment.

Workflow:
1. Drop SVG sources into `assets/icons/tabs/` named `<name>.svg` (outline) and `<name>-filled.svg` (filled)
2. Run `pnpm icons:convert` — uses `rsvg-convert` to render at @1x/@2x/@3x densities
3. PNGs land next to the SVGs (or instead of, if SVGs are removed)
4. Wire via `<Icon src={{ default: require(...), selected: require(...) }} />`

See [.claude/skills/tab-icons/SKILL.md](.claude/skills/tab-icons/SKILL.md) for the full skill.

---

## 12. Auth & Session

### Components

- `providers/AuthProvider.tsx` — holds session state (`status`, `user`, `hasOnboarded`, `isBootstrapping`)
- `hooks/useAuth.ts` — consumer hook
- `services/secureStorage.ts` — encrypted key/value (iOS Keychain / Android Keystore) — tokens + onboarding flag + theme override

### Flow

1. **Bootstrap (on app launch):** AuthProvider reads `accessToken` + `onboardingComplete` from secure storage. If token exists, it fetches `/auth/me` to hydrate user data, then sets `status='authenticated'`. Splash stays up until this resolves (controlled by `BootstrapGate` in `_layout.tsx`).

2. **Sign in / register:** Mutations call `useAuth().signIn(authResponse)` which persists tokens AND updates context. Routes navigate to `/(tabs)`.

3. **Sign out:** `useAuth().signOut()` clears tokens + resets context. Logout mutation also navigates to `/(auth)/welcome`.

4. **Onboarding completion:** `useAuth().completeOnboarding()` flips a persisted boolean — users see onboarding only once.

5. **Axios:** Request interceptor pulls the access token from secure storage on every call. 401 handling is currently a TODO (single-shot reject).

### App entry routing

`app/index.tsx` reads `useAuth()` and redirects:
- `bootstrapping` → `null` (splash still up)
- `authenticated` → `/(tabs)`
- `not onboarded` → `/(onboarding)`
- `onboarded + signed out` → `/(auth)/welcome`

### Dev stub auth

`features/auth/auth-api.ts` has stubs for every endpoint that fire when `EXPO_PUBLIC_API_URL` is unset. Mocked sign-in returns a fake user so the app is browseable end-to-end without a backend.

### Seeded backend accounts

All share password `password123`:
- `jane@example.com` — Verified, has data — **recommended for testing**
- `michael@example.com`, `emily@example.com`, `sarah@example.com`, `alex@example.com` — all verified
- `john@example.com`, `david@example.com` — unverified (test verify flow)

Login page has a **dev quick-signin row** that only renders in `__DEV__` builds with these accounts as taps.

---

## 13. Asset Registry

[assets/illustrations.ts](assets/illustrations.ts) is the central registry. Import keys, not paths:

```tsx
import { EmptyState } from '@/components/EmptyState';
<EmptyState illustration="expenses" title="No expenses yet" />
```

NOT:

```tsx
// ❌
import EmptyExpenses from '@/assets/illustrations/empty/empty-expenses.svg';
```

The registry has typed key unions: `EmptyIllustrationKey`, `ErrorIllustrationKey`, `HeroIllustrationKey`, `LottieGroupKey`. Use them.

For tab icons specifically, see §11.

---

## 14. Environment Variables

- All env vars must be prefixed `EXPO_PUBLIC_` to be available in the bundle at runtime (inlined at build time).
- Live in `.env.local`.
- `EXPO_PUBLIC_API_URL` — backend base URL. Currently `https://expense-tracker-backend-tawny-eight.vercel.app`.
- After editing `.env.local`, **restart Metro with `pnpm start --reset-cache`** — env vars don't hot-reload.

When `EXPO_PUBLIC_API_URL` is unset, every feature API file falls back to dev stubs.

---

## 15. Native Modules

**After installing any native module** (`expo-*`, `react-native-*` with native code), the binary must be rebuilt. Metro reload alone is not enough. Symptom of skipping this: `Cannot find native module 'X'` at runtime.

```bash
pnpm ios:rebuild       # cd ios && pod install && expo run:ios
pnpm android:rebuild   # cd android && ./gradlew clean && expo run:android
```

If new native deps were added since the Android folder was last generated:

```bash
pnpm prebuild:android  # regenerates android/ config to include new modules
pnpm android:rebuild
```

Current native dependencies (any of these getting added/removed requires a rebuild):
- `lottie-react-native`, `react-native-svg`, `expo-haptics`, `expo-blur`, `expo-secure-store`, `expo-font`, `@react-native-community/datetimepicker`, `react-native-reanimated`, `react-native-screens`, `react-native-safe-area-context`, `react-native-toast-message`

---

## 16. Scripts

```bash
# Dev
pnpm dev                  # expo start --reset-cache (Metro)
pnpm start                # expo start (no cache reset)

# Build/run
pnpm ios                  # expo run:ios
pnpm android              # expo run:android
pnpm ios:pods             # cd ios && pod install
pnpm android:gradle       # cd android && ./gradlew clean
pnpm ios:rebuild          # ios:pods + run:ios
pnpm android:rebuild      # android:gradle + run:android
pnpm prebuild:ios         # expo prebuild --platform ios
pnpm prebuild:android     # expo prebuild --platform android

# Quality
pnpm typecheck            # tsc --noEmit

# Assets
pnpm icons:convert        # scripts/convert-tab-icons.sh — SVG → PNG @1x/@2x/@3x
```

---

## 17. Common Pitfalls

### Reanimated strict mode

Never write to `sharedValue.value` during render. Strict mode warns on this and it causes UI thread issues.

```tsx
// ✅ good
useEffect(() => {
  progress.value = withTiming(focused ? 1 : 0);
}, [focused]);

// ❌ bad
progress.value = withTiming(focused ? 1 : 0); // in component body
```

### iOS TextInput descender clipping

Don't set `lineHeight` on iOS `TextInput` — it clips `j`, `g`, `p`, `y` when focused. Use `Input` primitive or follow its pattern (no `lineHeight`, `paddingVertical` for height, `includeFontPadding: false` + `textAlignVertical: 'center'` for Android).

### Formik validate creates new fn every render

Hoist `zodValidate(Schema)` to module scope. See §8.

### Stale errors with `validateOnChange={false}`

Errors stick until next blur. In input components, clear them eagerly on text change.

### Expo Router typed routes stale after route changes

When you add a new route file, the typed routes (`.expo/types/router.d.ts`) is regenerated on next `expo start`. If typecheck fails before that, manually update or restart Metro.

### Em-dashes in copy

Never. Anywhere user can read.

### Hardcoded values

Always tokens. `theme.colors.brand`, not `#9FE870`. `spacing.lg`, not `16`.

### Native rebuild after install

Always. Metro reload isn't enough.

### Bottom padding for floating tab bar

NativeTabs adjusts the system safe-area inset to include its own height. Use `useSafeAreaInsets().bottom` or just trust SafeAreaView. The `TabPlaceholder` uses `contentInsetAdjustmentBehavior="automatic"` on ScrollView for this.

---

## 18. PR / Change Quality Bar

Before considering work done:
- ✅ Typecheck passes (`pnpm typecheck`)
- ✅ No new hardcoded colors/spacing
- ✅ No new raw `<TextInput>` outside of `components/Input.tsx`
- ✅ No new copy with em-dashes
- ✅ New mutations invalidate the right query keys (cross-feature when applicable)
- ✅ New API functions have dev stubs (when reasonable — listing endpoints especially)
- ✅ New components match an existing primitive's pattern, or extract a new primitive if used > 1×
- ✅ Reanimated values written in effects, not render
- ✅ Theme switches work (tap Profile → Theme → Dark — entire screen flips)

---

## 19. Skill catalog (`.claude/skills/`)

- **`tab-icons`** — SVG → PNG conversion workflow for NativeTabs tab icons
- **`review`** — review pending changes against this principles doc
- Plus the project-default skills from CLAUDE.md (api-layer, react-query, theme-system, feature-scaffold, etc.)

---

## 20. The Backend (`enko-backend/`)

NestJS app deployed on Vercel. Key endpoints:

- **Auth:** `/auth/login`, `/auth/register`, `/auth/logout`, `/auth/refresh-access-token`, `/auth/me`, `/auth/change-password`, `/auth/password-reset/{request,validate,reset}`, `/auth/email-verification/{request,verify}`
- **Dashboard:** `/dashboard/overview`, `/dashboard/trends`, `/dashboard/expense-composition`, `/dashboard/budget-comparison`, `/dashboard/expenses-overview`, `/dashboard/total-balance`
- **Expenses:** `/expenses` (GET/POST/PATCH/DELETE), `/expenses/from-text` (AI parse)
- **Money sources:** `/money-sources` (CRUD + `/add-funds/:id`)
- **Categories:** `/categories` (CRUD)
- **Exchange rates:** `/exchange-rates`
- **Data:** `/data/export`, `/data/import`
- **App settings:** `/app-settings`

When backend DTOs change, update mobile `<feature>.types.ts` to match.

Password reset emails include both a link (web) and a **6-digit code** (mobile) — the code is stored under the same `password_reset:{X}` Redis key, so either works as the `token` param for validate/reset endpoints.

---

If anything in this doc is wrong or stale, **update this doc first**, then update the code to match.
