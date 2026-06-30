# Architecture

```
┌─────────────┐     JWT      ┌─────────────┐     MongoDB    ┌──────────┐
│  apps/web   │ ───────────► │  apps/api   │ ─────────────► │   db     │
│  (Vite)     │              │  (NestJS)   │                └──────────┘
└──────┬──────┘              └──────┬──────┘
       │                            │
       │ session                    │ /api/auth/*
       ▼                            ▼
┌──────────────────────────────────────────────┐
│           @workspace/auth (Better Auth)       │
└──────────────────────────────────────────────┘
```

**Shared packages**

- `@workspace/config` — single root `.env`, Zod validation
- `@workspace/contracts` — Zod schemas shared by API + clients
- `@workspace/logger` — structured JSON logging (pino)
- `@workspace/auth` — auth server, JWT, RBAC ([details](../packages/auth/README.md))
- `@workspace/ui` — components, auth UI, app shell

**API pattern:** controller → CQRS command/query handlers → repository.

**Tests:** API uses Jest (`test/unit/`, `test/e2e/`). Web and packages use Vitest (`test/`).

**Web pattern:** route → page → TanStack Query hooks → `lib/api.ts` → contracts validation.
