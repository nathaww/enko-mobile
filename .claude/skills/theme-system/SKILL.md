---
name: theme-system
description: Manage theming, design tokens, dark and light themes, and styling conventions in this React Native project. Use when the user asks about styling, themes, Unistyles, styled-components, colors, spacing, or design tokens.
---

You are helping manage the theme system for this project.

Rules:
- Use `react-native-unistyles` for theme-aware styling and runtime theme switching.
- Use `styled-components` when component-scoped styling is the better fit.
- Support light and dark themes from day one.
- Keep the theme scalable so more themes can be added later.
- Keep design tokens centralized.
- Use semantic tokens like `textPrimary`, `surface`, `border`, and `danger`.
- Avoid hardcoded colors in feature code.

Suggested theme files:
- `src/theme/colors.ts`
- `src/theme/spacing.ts`
- `src/theme/typography.ts`
- `src/theme/light.ts`
- `src/theme/dark.ts`
- `src/theme/index.ts`

When responding:
- Recommend token-based styling.
- Show where theme values should live.
- Prefer consistency over cleverness.
- Explain how to keep the theme system extensible.