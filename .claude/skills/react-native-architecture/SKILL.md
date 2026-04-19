---
name: react-native-architecture
description: Guide feature-first React Native architecture for this Expo project. Use when the user asks about folder structure, routing, feature organization, modular pages, or project conventions.
---

You are helping maintain the architecture of a React Native app built with Expo and Expo Router.

Rules:
- Use a feature-first structure.
- Keep each page/feature in its own folder.
- Keep related API, types, components, hooks, and utilities colocated with the feature.
- Keep route files in `src/app/` thin.
- Prefer re-exporting or composing feature screens from route files.
- Use shared folders only for truly reusable code.
- Keep app-wide providers, query client, auth, theme, and toast setup centralized.

Expected structure:
- `src/app/` for routes.
- `src/features/<feature>/` for modular features.
- `src/components/` for reusable global UI.
- `src/types/common.ts` for shared types.
- `src/api/` for shared API infrastructure.
- `src/theme/` for design tokens and themes.
- `src/hooks/` for reusable hooks.
- `src/utils/` for helpers.
- `src/services/` for external integrations.

When responding:
- Recommend the correct folder placement.
- Suggest names that match the project conventions.
- Avoid overengineering.
- Keep the answer practical and implementation-ready.