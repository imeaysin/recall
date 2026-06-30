# Web app — agent guide

Vite + React 19 + React Router 7 + TanStack Query.

## Structure

```
src/
  features/<name>/     pages, hooks, components for a domain
  lib/api.ts           authenticated fetch, ApiError, unwraps { data }
  routes/              route definitions
test/                  Vitest tests mirror src paths (e.g. test/lib/api.test.ts)
```

## Data fetching

- Use TanStack Query hooks in `features/*/hooks/`.
- Call `apiFetch<T>()` from `lib/api.ts` — types from `@workspace/contracts`.
- Auth token via `@workspace/auth` client.

## Tests

- Vitest with `@/` → `src/` alias (`vitest.config.ts`).
- Place tests under `test/`, not colocated in `src/`.
- Package-level logic (dates, contracts) is tested in `packages/*/test/`.

## UI

- Shared components live in `@workspace/ui` — do not duplicate in this app.
