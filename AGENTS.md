# CogniVault monorepo — agent guide

pnpm workspace: NestJS API, Vite React web app, Next.js marketing site, shared packages.

## Layout

```text
apps/
  api/          NestJS — Light-CQRS feature modules, Jest (unit + e2e)
  web/          Vite + React Router — Vitest in test/
  marketing/    Next.js 16 landing — see apps/marketing/AGENTS.md
packages/
  ai/             AiClient + Gemini adapter (see packages/ai/README.md)
  auth/           Better Auth server + Nest guards + React hooks
  config/         Root .env validation (Zod)
  contracts/      Shared Zod schemas (API + clients)
  db/             MongoDB connection layer (Mongoose)
  email/          Transactional email (Resend + React Email)
  extractors/     Per-source extractors (see packages/extractors/README.md)
  logger/         Structured logging (pino)
  storage/        File upload providers (local / S3)
  ui/             Shared React UI (shadcn + app shell)
tooling/        eslint-config, typescript-config, vitest-config
docs/           Human docs (architecture, features, deployment)
```

Jobs use Nest `@nestjs/schedule` + Mongo claim (no BullMQ/Redis). EventEmitter2 under `apps/api/src/common/`.

## Commands (from repo root)

| Script                                       | Purpose                      |
| -------------------------------------------- | ---------------------------- |
| `pnpm dev`                                   | All apps with a `dev` script |
| `pnpm dev:api` / `dev:web` / `dev:marketing` | Single app                   |
| `pnpm lint` / `typecheck` / `test` / `build` | CI parity                    |
| `pnpm db:up`                                 | MongoDB via Docker Compose   |

Set `SKIP_ENV_VALIDATION=true` when env is incomplete locally.

## Conventions

### API (`apps/api`)

- **Pattern:** controller → Service Orchestrator (Pragmatic Light-CQRS) → Command / Query Repository. No `@nestjs/cqrs` package.
- **Events:** Decoupled architecture using strictly-typed Event Classes (e.g., `UserDeletedEvent`) and `@nestjs/event-emitter`.
- **Reference module:** `src/modules/content/` (domain, dto, repository, listeners, service, controller). Notes module removed.
- **Validation & OpenAPI:** Zod schemas in `@workspace/contracts` (with `.meta()` / `.describe()`). API uses `nestjs-zod` (`createZodDto`, global `ZodValidationPipe`, `cleanupOpenApiDoc` for `/docs`). Request bodies use `.strict()` (reject unknown keys).
- **Responses:** success envelope `{ success, statusCode, message, data, timestamp }` via `TransformResponseInterceptor`; errors `{ success, statusCode, code, message, errors, path, timestamp }` via `AllExceptionsFilter`. Document success with `apiSuccessResponse()` in contracts; use `@ApiAuthErrorResponses()` / `@ApiPublicErrorResponses()` on controllers.
- **Domain errors:** `apiNotFound(..., DomainErrorCode.NOTE_NOT_FOUND)` — codes live in `@workspace/contracts` (`HttpErrorCode`, `DomainErrorCode`).
- **Auth:** Better Auth sessions via `@workspace/auth/nestjs`; `@Session()` / `@RequireRoles()`. Admin plugin for platform user management; data is `userId`-scoped (no org plugin). See [packages/auth/README.md](./packages/auth/README.md).
- **Tests:** `test/unit/*.spec.ts` (Jest), `test/e2e/*.e2e-spec.ts` (`pnpm test:e2e` in api).
- **Logging:** `@workspace/logger` (pino v10). Dev: `pino-pretty` via transport (`LOG_PRETTY=true|false`). Production: JSON + ISO timestamps. Nest route noise at `debug` — set `LOG_LEVEL=debug` to show.

### Web (`apps/web`)

- **Pattern:** route → page → TanStack Query hooks → `lib/api.ts`.
- **`apiFetch`** unwraps the success envelope (`data`) and sends cookies (`credentials: "include"`); throws `ApiError` with `code` on failures.
- **Auth client:** `@workspace/auth/client` (`useSession`, `signIn`, `signOut`).
- **Tests:** `test/**/*.test.ts` with `@/` alias (see `vitest.config.ts`).

### Shared packages

- Add versions to `pnpm-workspace.yaml` `catalog:`; reference as `"catalog:"` in package.json.
- Build library packages before typecheck (`turbo` handles `dependsOn: ["^build"]`).

## Do not

- Over-engineer (no custom CQRS abstractions; Light-CQRS service + repositories is enough).
- Duplicate contract shapes outside `@workspace/contracts`.
- Change product scope without reading `docs/product/` first.
- Assume stock Next.js 15 APIs — marketing uses Next 16 (see `apps/marketing/AGENTS.md`).

## Further reading

- [docs/architecture.md](./docs/architecture.md)
- [docs/adding-a-feature.md](./docs/adding-a-feature.md)
- [docs/org-roles-and-ui.md](./docs/org-roles-and-ui.md) — static vs custom roles, module API/UI gating
- [docs/authN-authZ.md](./docs/authN-authZ.md)
- [packages/auth/README.md](./packages/auth/README.md)
- Per-app: `apps/api/AGENTS.md`, `apps/web/AGENTS.md`
