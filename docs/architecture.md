# Architecture

```
┌─────────────┐  session cookie  ┌─────────────┐     MongoDB    ┌──────────┐
│  apps/web   │ ───────────────► │  apps/api   │ ─────────────► │   db     │
│  (Vite)     │                  │  (NestJS)   │                └──────────┘
└──────┬──────┘                  └──────┬──────┘
       │                                │
       │ authClient                     │ /api/auth/*
       ▼                                ▼
┌──────────────────────────────────────────────┐
│  @workspace/auth (Better Auth + CASL)         │
└──────────────────────────────────────────────┘
```

**Shared packages**

- `@workspace/ai` — provider-agnostic `AiClient` + Gemini adapter ([details](../packages/ai/README.md))
- `@workspace/auth` — Better Auth server/client, NestJS module ([details](../packages/auth/README.md))
- `@workspace/config` — single root `.env`, Zod validation
- `@workspace/contracts` — Zod schemas shared by API + clients
- `@workspace/db` — shared Mongoose connection (business collections)
- `@workspace/email` — Resend + React Email templates for auth emails
- `@workspace/extractors` — per-source text extraction ([details](../packages/extractors/README.md))
- `@workspace/logger` — structured JSON logging (pino)
- `@workspace/storage` — file upload providers (local HMAC-signed downloads / S3)
- `@workspace/ui` — shared React components

**API-local (not packages):** Nest `@nestjs/schedule` jobs + Mongo claim under `apps/api`; EventEmitter2 under `apps/api/src/common/`.

**API pattern:** controller → Service Orchestrator (Pragmatic Light-CQRS) → Command / Query Repository → Domain Exceptions. No `@nestjs/cqrs`.
**Auth:** Better Auth sessions + admin plugin for platform user management; content is `userId`-scoped. See [packages/auth/README.md](../packages/auth/README.md).

**Tests:** API uses Jest (`test/unit/`, `test/e2e/`). Web and packages use Vitest (`test/`).

**Web pattern:** route → page → TanStack Query hooks → `lib/api.ts` → contracts validation.
