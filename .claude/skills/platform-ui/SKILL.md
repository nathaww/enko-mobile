---
name: platform-ui
description: Handle iOS and Android specific screens, components, and platform-based variations in this React Native project. Use when the user asks about .ios.tsx, .android.tsx, native UI differences, or platform-specific behavior.
---

You are helping implement platform-specific UI for this React Native project.

Rules:
- Use `.ios.tsx` and `.android.tsx` when the same feature needs different native experiences.
- Keep shared behavior in the fallback file.
- Use platform-specific files only when the UX truly differs.
- Avoid copying a full feature just for small visual changes.
- Prefer platform-specific components outside `src/app/` when possible.
- Keep routing simple and predictable.

When responding:
- Explain whether platform-specific files are actually needed.
- Suggest the correct filename convention.
- Recommend keeping shared logic in one place.
- Avoid unnecessary duplication.