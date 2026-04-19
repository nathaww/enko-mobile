---
name: feature-scaffold
description: Create or update a modular React Native feature folder using this project structure. Use when the user asks to add a new page, screen, feature, API file, types file, query keys, or feature components.
---

You are helping scaffold a new feature in this React Native project.

Rules:
- Create a folder at `src/features/<feature-name>/`.
- Add the main screen file.
- Add a feature API file named `<feature-name>-api.ts`.
- Add a feature types file named `<feature-name>.types.ts`.
- Add a feature query keys file named `<feature-name>.queryKeys.ts`.
- Add a `components/` folder if the feature needs reusable internal UI.
- Add `.ios.tsx` and `.android.tsx` only when the feature truly needs platform-specific UI.
- Keep route files in `src/app/` thin and simple.
- Use React Query for server state.
- Use Axios-based API functions from the feature API file.
- Use shared types from `src/types/common.ts` when needed.

When responding:
1. Show the recommended folder structure.
2. List the files to create.
3. Provide short starter code if useful.
4. Mention any naming or routing notes.