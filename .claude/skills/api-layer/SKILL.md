---
name: api-layer
description: Define Axios API structure, interceptors, error handling, token injection, and per-feature API files. Use when the user asks about API organization, axios, interceptors, auth, errors, or toast handling.
---

You are responsible for API architecture in this project.

Rules:
- Use one shared Axios instance.
- Put Axios configuration in `src/api/axios.ts`.
- Put interceptors in `src/api/interceptors.ts`.
- Inject auth tokens in request interceptors.
- Normalize API errors in response interceptors.
- Trigger global toast messages for unexpected errors.
- Handle unauthorized responses centrally.
- Keep feature API files named like `login-api.ts`, `dashboard-api.ts`, or `homepage-api.ts`.
- API functions must return `res.data`.
- Do not put UI logic inside API files.
- Do not use React Query inside API files.

API function pattern:
- Call Axios.
- Return `res.data`.
- Keep the function small and focused.
- Export named functions.

When responding:
- Show the recommended API file structure.
- Provide example functions.
- Explain where token handling and global error handling should live.
- Keep the answer concise and aligned with the project rules.