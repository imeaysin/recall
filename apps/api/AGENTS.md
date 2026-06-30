# API app — agent guide

NestJS 11 REST API with Better Auth, MongoDB, and CQRS feature modules.

## Module structure (copy from `notes`)

```
modules/<feature>/
  commands/           *.command.ts + *.handler.ts
  queries/            *.query.ts + *.handler.ts  (when reads are non-trivial)
  dto/                Swagger DTOs only — validation lives in @workspace/contracts
  entities/           Domain types / DB document shape
  repositories/       Data access (Mongo, storage, etc.)
  <feature>.controller.ts   CommandBus / QueryBus only
  <feature>.module.ts       CqrsModule + handlers + repository
```

**Uploads** follows the same pattern with `StorageRepository` instead of Mongo.

## Cross-cutting (`src/common/`)

| Path                           | Role                                                               |
| ------------------------------ | ------------------------------------------------------------------ |
| `configure-app.ts`             | CORS, helmet, versioning, validation pipe, swagger, static uploads |
| `interceptors/`                | HTTP logging (`@workspace/logger`), `{ data }` transform           |
| `filters/`                     | Global exception handler                                           |
| `pipes/zod-validation.pipe.ts` | Zod body validation                                                |
| `decorators/`                  | Re-exports auth decorators + `@Roles`                              |
| `storage/storage.module.ts`    | `STORAGE` provider from `@workspace/storage`                       |

## Testing

- **Unit:** `test/unit/**/*.spec.ts` — run via `pnpm test` in this app.
- **E2e:** `test/e2e/**/*.e2e-spec.ts` — run via `pnpm test:e2e` (needs MongoDB).
- Shared setup: `test/jest-setup.ts`.

## Adding an endpoint

1. Add Zod schema to `packages/contracts`.
2. Create command/query + handler + repository method.
3. Wire handler in module `providers`.
4. Expose via controller with appropriate guards/decorators.

Do not call repositories or storage directly from controllers.
