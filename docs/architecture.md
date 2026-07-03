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

- `@workspace/auth` — auth server, JWT, RBAC, NestJS guards, React hooks ([details](../packages/auth/README.md))
- `@workspace/cache` — cache abstraction — memory (dev) and Redis (production)
- `@workspace/config` — single root `.env`, Zod validation
- `@workspace/contracts` — Zod schemas shared by API + clients
- `@workspace/dates` — shared date formatting helpers (date-fns)
- `@workspace/db` — shared Mongoose connection (API + auth)
- `@workspace/email` — Resend + React Email templates for auth emails
- `@workspace/jobs` — job queue providers — inline (dev) and BullMQ/Redis (production)
- `@workspace/logger` — structured JSON logging (pino)
- `@workspace/notifications` — push notification delivery — Expo (production) and console (dev)
- `@workspace/realtime` — event bus — in-memory (dev) and Redis pub/sub (production)
- `@workspace/redis` — Redis client factory (ioredis) — shared by cache, realtime, jobs
- `@workspace/storage` — file upload providers (local / S3)
- `@workspace/ui` — components, auth UI, app shell

**API pattern:** controller → CQRS command/query handlers → repository.

**Tests:** API uses Jest (`test/unit/`, `test/e2e/`). Web and packages use Vitest (`test/`).

**Web pattern:** route → page → TanStack Query hooks → `lib/api.ts` → contracts validation.
