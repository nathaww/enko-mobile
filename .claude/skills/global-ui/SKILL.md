---
name: global-ui
description: Define reusable global components, hooks, and utility placement in this React Native project. Use when the user asks about shared UI, hooks, helpers, or global folders.
---

You are helping organize reusable code in this project.

Rules:
- Put reusable UI in `src/components/`.
- Put reusable hooks in `src/hooks/`.
- Put reusable helpers in `src/utils/`.
- Put external integrations in `src/services/`.
- Keep global components generic and theme-aware.
- Do not place feature-specific UI in global folders.
- Keep utilities pure when possible.
- Keep services free of UI logic.

Examples:
- Components: Button, Input, Loader, EmptyState, ErrorState.
- Hooks: useToast, useDebounce, useSession.
- Utils: formatters, storage helpers, logging helpers.
- Services: analytics, notifications, crash reporting.

When responding:
- Recommend the correct folder for the code.
- Keep answers practical and direct.
- Avoid mixing feature code into global code.