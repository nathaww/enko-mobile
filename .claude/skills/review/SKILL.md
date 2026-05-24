---
name: review
description: Review pending or recent changes against the project's PRINCIPLES.md and surface violations + suggested improvements. Use when the user says "review", "review my changes", "check this", "audit the code", "is this following our conventions", or before considering a feature done.
---

You are reviewing changes in the Enko mobile project against its principles.

## Step 1 — Load the principles

Read **`.claude/PRINCIPLES.md`** at the project root in full. That document is the source of truth for every convention this project follows. If you skim it instead of reading it, you'll miss things and write bad reviews. The doc is long but every section matters.

## Step 2 — Identify what to review

In this order, pick the most appropriate scope:

1. **User specified files / a range** ("review the Expenses feature", "review what I just changed") — review those exact files.
2. **Working tree changes** — run `git status` and `git diff` to find unstaged + staged changes. If there are any, review them.
3. **Recent commit** — if working tree is clean, review the most recent commit: `git diff HEAD~1`.
4. **Specific feature folder** if context strongly implies it (e.g. user is opening files in `features/expenses/`).

If you can't determine the scope, ask the user briefly: "What do you want reviewed — your current uncommitted changes, the last commit, or a specific feature?"

## Step 3 — Read every changed file in full

Don't trust the diff alone. Read every changed file end to end. Diffs hide context (imports, neighboring patterns, file-scope hoists). Spending 30 seconds reading the file beats 5 minutes guessing from a diff.

## Step 4 — Run the principles checklist

For each changed file, walk through this checklist (cross-reference PRINCIPLES.md sections):

### Architecture & structure (§1, §3)
- [ ] Feature code lives in `features/<feature>/` with the canonical files (`feature-api.ts`, `feature.types.ts`, `feature.queryKeys.ts`, etc.)
- [ ] Route files in `app/` are thin re-exports, not screen logic
- [ ] Feature-scoped components live in `features/<x>/components/`, NOT global `components/`
- [ ] Cross-feature imports use `@/` path aliases, not relative `../../`

### Naming (§2)
- [ ] Files are `kebab-case` (except components which are `PascalCase.tsx`)
- [ ] Conventional suffixes: `-api.ts`, `.types.ts`, `.queryKeys.ts`, `.schemas.ts`, `.mutations.ts`
- [ ] Hooks prefix `use`, booleans prefix `is/has/should`, handlers prefix `on/handle`
- [ ] No `index.ts` barrel files in features
- [ ] No generic names like `helpers.ts` or `utils.ts` — must name the contents

### API layer (§4)
- [ ] All requests use the shared `api` instance from `@/api/axios`
- [ ] API functions return `res.data` directly, no UI logic / no toasts / no navigation
- [ ] Dev stub pattern present (`const useDevStub = __DEV__ && !process.env.EXPO_PUBLIC_API_URL`)
- [ ] Mutating endpoints use module-scoped state for interactive dev stubs (read §4)

### React Query (§5)
- [ ] Query keys use factory functions from `<feature>.queryKeys.ts`
- [ ] No inline query keys (`['expenses']` directly in `useQuery`)
- [ ] Mutations invalidate the **right** keys, including **cross-feature** invalidation when applicable (e.g. expense create → invalidate home queries too)
- [ ] Mutations show toasts on success/error
- [ ] `useQuery` / `useMutation` use proper TypeScript generics

### Type system (§6)
- [ ] Types in `<feature>.types.ts`, not inline in components
- [ ] Shared types in `types/common.ts`
- [ ] Mobile DTOs mirror backend DTOs from `enko-backend/src/<feature>/dto/`
- [ ] Zod schemas in `<feature>.schemas.ts` for forms

### Theming (§7)
- [ ] No hardcoded hex/rgba in feature code — all `theme.colors.*`
- [ ] No hardcoded `padding: 16` or `margin: 8` — all `spacing.*`
- [ ] No hardcoded border radius — all `radii.*`
- [ ] Font family from `typography.*.fontFamily`
- [ ] Styles created via `makeStyles(theme)` + `useMemo`
- [ ] Both light + dark work (theme.colors.* values exist in both)

### Forms (§8)
- [ ] Validator hoisted to module scope (not inline `validate={zodValidate(Schema)}`)
- [ ] `validateOnChange={false}` + `validateOnBlur`
- [ ] Input components clear `meta.error` on text change
- [ ] No raw `<TextInput>` — uses `<Input>` from `components/Input.tsx`
- [ ] FormField for Formik integration

### Reusability / DRY (§9)
- [ ] Patterns used 2+ times extracted into primitives
- [ ] Cross-feature primitives in `components/`
- [ ] Cross-feature hooks in `hooks/`
- [ ] Pure functions used 2+ times in `utils/`

### Copy (§10)
- [ ] **No em-dashes (—) in user-facing text or code comments** (search the diff for `—`)
- [ ] Sentence case for buttons and section headers
- [ ] Simple concrete verbs

### Platform UI (§11)
- [ ] `.ios.tsx` / `.android.tsx` only when UX truly differs
- [ ] Fallback `.tsx` always present for type resolution
- [ ] Tab bar icons are PNGs (not SVGs as `src`) — see tab-icons skill

### Auth (§12)
- [ ] Tokens read/written only via `secureStorage` service, never directly to `expo-secure-store`
- [ ] Auth-affecting mutations route through `useAuth().signIn()` / `signOut()`

### Common pitfalls (§17)
- [ ] Reanimated shared value writes are inside `useEffect`, not render body
- [ ] No new native module installed without rebuild instructions
- [ ] No `expo-router` route added without checking typed routes

### Quality bar (§18)
- [ ] `pnpm typecheck` should pass
- [ ] If the user asks, you can run it via Bash to verify

## Step 5 — Format the review

Output structured markdown with these sections, in this order:

```markdown
## Review summary

[One sentence: what was reviewed, overall assessment]

## ✅ What's good

[3–6 bullets calling out specifically what was done well. Be concrete — don't say "good naming"; say "queryKeys factory in expenses.queryKeys.ts:5 follows the convention". Praise that lands.]

## 🚧 Must-fix (blockers)

[Real violations of principles that should not ship as-is. Each item:
- **Issue**: one sentence + file:line ref
- **Why**: the principle being violated (cite §X)
- **Fix**: concrete code suggestion]

[If none, write "None — this change is clean against the principles."]

## 💡 Suggestions (non-blocking)

[Smaller improvements: missed reuse opportunities, slightly clearer naming, additional invalidation that would be nice. Same structure as above. These are "would be nice", not "must".]

## 🤔 Open questions

[Anything you genuinely can't tell from the code — e.g. "should this also invalidate the X query?" Ask the human for input.]
```

## Tone rules

- Be **specific** — file:line refs always, not "somewhere in the expenses feature".
- Be **direct** — don't pad with "consider possibly maybe". Say what's wrong and how to fix.
- Be **honest** about severity — a stylistic nit is not a blocker. Don't inflate.
- Quote relevant principles by section number so the reader can verify.
- If a principle in PRINCIPLES.md seems wrong or outdated for the code, say so explicitly under "Open questions" — the doc itself might need updating.
- **Don't write code unless explicitly asked.** Your job is to call out issues, not to fix them. The user will decide what to act on.

## What NOT to flag

- Pure formatting / whitespace (a formatter handles those).
- Personal preference unless it's in PRINCIPLES.md.
- "Could be more concise" without a concrete principle citation.
- Files that weren't changed in the scope being reviewed.

## When the changes are small

If the diff is only a few lines (e.g. a one-line bug fix), keep the review short — one summary paragraph plus any issues, no need to fill every section.

## When the user pushes back

If the user disagrees with a finding ("that's not actually a violation"), reread the relevant principles section. If you were wrong, say so. If you stand by it, restate the principle with a quote.
