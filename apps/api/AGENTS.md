# API app — agent guide

NestJS 11 REST API with Better Auth, MongoDB, and CQRS feature modules.

## Module structure (copy from `notes`)

```
modules/<feature>/
  commands/           *.command.ts + *.handler.ts
  queries/            *.query.ts + *.handler.ts  (when reads are non-trivial)
  notes.dto.ts       createZodDto wrappers (request + success response envelopes)
  entities/           Domain types / DB document shape
  repositories/       Data access (Mongo, storage, etc.)
  <feature>.controller.ts   CommandBus / QueryBus only
  <feature>.module.ts       CqrsModule + handlers + repository
```

**Uploads** follows the same pattern with `StorageRepository` instead of Mongo.

**Health** and **Me** use a thin controller + service (no CQRS) — simple reads with no domain logic.

## Cross-cutting (`src/common/`)

| Path                        | Role                                                                       |
| --------------------------- | -------------------------------------------------------------------------- |
| `configure-app.ts`          | CORS, helmet, versioning, swagger (`cleanupOpenApiDoc`), static uploads    |
| `interceptors/`             | HTTP logging, success envelope transform                                   |
| `filters/`                  | Global exception handler (machine-readable `code`)                         |
| `decorators/`               | Auth re-exports, `@ApiAuthErrorResponses()` / `@ApiPublicErrorResponses()` |
| `exceptions/`               | `apiNotFound` / `apiForbidden` / `apiBadRequest` (typed `DomainErrorCode`) |
| `storage/storage.module.ts` | `STORAGE` provider from `@workspace/storage`                               |

## Testing

- **Unit:** `test/unit/**/*.spec.ts` — run via `pnpm test` in this app.
- **E2e:** `test/e2e/**/*.e2e-spec.ts` — run via `pnpm test:e2e` (needs MongoDB).
- **Auth smoke (optional, local):** `bash apps/api/scripts/auth-flow-test.sh` with `pnpm dev:api` running.
- Shared setup: `test/jest-setup.ts`.

## Adding an endpoint

1. Add Zod schema (+ `.meta()` / `.describe()` for Swagger) to `packages/contracts`.
2. Add `createZodDto` wrapper in the module (e.g. `notes.dto.ts`).
3. Create command/query + handler + repository method.
4. Wire handler in module `providers`.
5. Expose via controller — `@Body() MyDto` validates automatically; add `@ApiAuthErrorResponses()` or `@ApiPublicErrorResponses()`.

**Domain errors:** add codes to `DomainErrorCode` in `packages/contracts/src/api/errors.ts`, then use `apiNotFound(..., DomainErrorCode.NOTE_NOT_FOUND)`.

Do not call repositories or storage directly from controllers.

## Serverless architecture

The API is designed for **stateless, serverless execution** (e.g. Vercel, AWS Lambda, Cloud Run). Every request must stand alone.

### Request context (never from client body)

| Context                | Source                                                                  |
| ---------------------- | ----------------------------------------------------------------------- |
| User id, platform role | Verified JWT (`@CurrentUser()`)                                         |
| Active workspace       | JWT `activeOrganizationId` (`@CurrentOrganization()`)                   |
| Org permissions        | JWT `organizationRole` + DB for dynamic roles (`@RequireOrgPermission`) |

Org-scoped routes (notes, uploads) must use `@CurrentOrganization()` — never accept `organizationId` from query/body.

### What must not exist

- **In-memory rate limiting** — removed `@nestjs/throttler` (counters are per-instance). Use API gateway limits or Better Auth `rateLimit.storage: "database"` when upgrading Better Auth.
- **Separate MongoDB pools** — auth and business API share `@workspace/db` (`connectDb` once per instance).
- **Session state on business routes** — `/v1/*` uses Bearer JWT only; Better Auth cookies are for `/api/auth/*`.

### Acceptable per-instance state

- Mongoose connection reuse (`readyState === 1` guard in `connectDb`)
- Lazy `getAuth()` singleton (immutable config, not user data)
- JWKS public-key cache in `jose` (`cooldownDuration` in `verifyAccessToken`)
- `STORAGE` provider factory (env-bound, stateless)

### Deployment

- **MongoDB:** use a serverless-friendly URI (e.g. Atlas) with connection pooling; `DatabaseModule` connects on boot via `DATABASE_READY`.
- **File uploads:** set `STORAGE_PROVIDER=s3` in production — `local` + `express.static` is dev-only (ephemeral disk, not multi-instance safe).
- **Graceful shutdown:** `DatabaseLifecycle` disconnects on `onModuleDestroy` (long-running dev; optional in pure serverless).

### Guard chain

```
JwksGuard → RbacGuard → OrgRbacGuard
```

`@Public()` skips JWT. `@RequirePermission` = platform role from JWT. `@RequireOrgPermission` = active org from JWT + permission check.
