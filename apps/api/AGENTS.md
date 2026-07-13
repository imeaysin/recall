# API app — agent guide

NestJS 11 REST API with Better Auth, MongoDB, and CQRS feature modules.

## Module structure (copy from `notes`)

```
modules/<feature>/
  domain/             *.model.ts (Domain entities) + exceptions/
  dto/                create-[feature].dto.ts, update-[feature].dto.ts, etc.
  repository/         *.command.ts (writes) + *.query.ts (reads)
  listeners/          *.listener.ts (Cross-module events via event-emitter)
  <feature>.controller.ts   Ingress Routing & Delivery
  <feature>.service.ts      Workflow Orchestrator (No CQRS boilerplate)
  <feature>.module.ts       Dependency Providers
```

**Uploads** follows the same pattern with `StorageRepository` instead of Mongo.

**Health** and **Me** use a thin controller + service (no CQRS) — simple reads with no domain logic.

## Cross-cutting (`src/common/`)

| Path                          | Role                                                                       |
| ----------------------------- | -------------------------------------------------------------------------- |
| `configure-app.ts`            | CORS, helmet, versioning, swagger (`cleanupOpenApiDoc`), static uploads    |
| `interceptors/`               | HTTP logging (with `requestId`), success envelope transform                |
| `middleware/`                 | Request ID propagation, MongoDB-backed `/v1/*` rate limiting               |
| `jobs/`                       | Job queue provider (`@workspace/jobs`) — `inline` or `redis` (BullMQ)      |
| `filters/`                    | Global exception handler (machine-readable `code`)                         |
| `decorators/`                 | Auth re-exports, `@ApiAuthErrorResponses()` / `@ApiPublicErrorResponses()` |
| `exceptions/`                 | Base `DomainException` for throwing pure domain errors                     |
| `storage/storage.module.ts`   | `STORAGE` provider from `@workspace/storage`                               |
| `database/database.module.ts` | Global `DATABASE_READY` + injectable `MONGO_DB` (native driver `Db`)       |

## Testing

Follow the [NestJS testing guide](https://docs.nestjs.com/fundamentals/testing): `Test.createTestingModule()`, `createNestApplication()`, and Supertest.

| Layer                      | Location                                    | Command                                     |
| -------------------------- | ------------------------------------------- | ------------------------------------------- |
| **Unit**                   | `test/unit/**/*.spec.ts`                    | `pnpm test`                                 |
| **E2E**                    | `test/e2e/**/*.e2e-spec.ts`                 | `pnpm test:e2e` (MongoDB required)          |
| **Integration (live API)** | `test/integration/**/*.integration-spec.ts` | `pnpm test:integration` with `pnpm dev:api` |

**E2E helpers**

- `test/e2e/support/create-e2e-app.ts` — `Test.createTestingModule({ imports: [AppModule] })`, `createNestApplication()`, `configureApp()` (see [Nest testing](https://docs.nestjs.com/fundamentals/testing))
- `test/e2e/jest-e2e.setup.ts` — stubs Better Auth ESM deps (`jose`, `better-auth` plugins) so real guards load in Jest

Global guards use `APP_GUARD` + `useFactory` in `@workspace/auth/nestjs` (Reflector is wired explicitly because the nestjs bundle is built with tsup/esbuild, which does not emit DI metadata). E2E runs the real guard chain; authenticated flows are covered by **integration** tests.

## Adding an endpoint

1. Add Zod schema (+ `.meta()` / `.describe()` for Swagger) to `packages/contracts`.
2. Add `createZodDto` wrappers in the module inside the `dto/` directory (e.g. `dto/create-note.dto.ts`).
3. Create repository methods (`*.command.ts` or `*.query.ts`) and orchestrate them in `*.service.ts`.
4. Wire service and repositories in module `providers`.
5. Expose via controller — `@Body() MyDto` validates automatically; add `@ApiAuthErrorResponses()` or `@ApiPublicErrorResponses()`.

**Domain errors:** add codes to `DomainErrorCode` in `packages/contracts/src/api/errors.ts`, then create and throw custom exceptions that inherit from `DomainException` inside your business layer.

Do not call repositories or storage directly from controllers. Instead, dispatch logic through the orchestrating Service.

## Serverless architecture

The API is designed for **stateless, serverless execution** (e.g. Vercel, AWS Lambda, Cloud Run). Every request must stand alone.

### Request context (never from client body)

| Context                | Source                                                           |
| ---------------------- | ---------------------------------------------------------------- |
| User id, platform role | Verified JWT (`@CurrentUser()`)                                  |
| Active workspace       | JWT `activeOrganizationId` (`@CurrentOrganization()`)            |
| Org permissions        | Member role from DB (`@RequireOrgPermission` via `OrgRbacGuard`) |

Org-scoped routes (notes, uploads) must use `@CurrentOrganization()` — never accept `organizationId` from query/body.

### What must not exist

- **In-memory rate limiting** — removed `@nestjs/throttler` (counters are per-instance). `/v1/*` uses MongoDB-backed limits in `middleware/rate-limit.middleware.ts`; `/api/auth/*` uses Better Auth `rateLimit.storage: "database"`. Prefer edge/gateway limits in high-traffic production.
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

`@Public()` skips JWT. `@RequirePermission` = platform role from JWT. `@RequireOrgPermission` = active org from JWT + member role resolved from DB.
