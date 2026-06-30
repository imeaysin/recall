# Adding a feature

End-to-end example: **Notes** (already in the template).

## 1. Contracts

`packages/contracts/src/notes.ts` — Zod schemas + inferred types.

**Swagger docs:** add OpenAPI metadata on schemas with `.meta()` / `.describe()`. Use `apiDataResponse()` from `http.ts` for `{ data: T }` response envelopes. The API uses `nestjs-zod` + `cleanupOpenApiDoc`, so metadata appears in `/docs`.

```ts
z.string().meta({
  description: "Short title for the note",
  examples: ["Ship the dashboard"],
})

z.object({ ... }).meta({
  id: "CreateNoteDto",
  title: "Create note",
  description: "Payload to create a new note.",
})

// Response envelope (matches TransformResponseInterceptor)
apiDataResponse(NoteResponseSchema, {
  id: "NoteApiResponseDto",
  title: "Note response",
  description: "Standard API envelope containing a single note.",
})
```

Export from `packages/contracts/src/index.ts`.

## 2. API module

```
apps/api/src/modules/notes/
  commands/     create-note, delete-note
  queries/      list-notes
  notes.dto.ts       createZodDto wrappers from @workspace/contracts
  entities/     domain types
  repositories/ MongoDB access
  notes.controller.ts
  notes.module.ts
```

Register `NotesModule` in `app.module.ts`.

## 3. Web feature

```
apps/web/src/features/notes/
  hooks/use-notes.ts    TanStack Query
  pages/notes-page.tsx
  routes.tsx
```

1. Add segment + URL in `apps/web/src/config/routes.ts` and API path in `config/api-routes.ts`.
2. Create feature `routes.tsx` using `routeSegments` from `config/routes.ts`.

## 4. Authorization

Use decorators from `@workspace/auth/nestjs` — see [packages/auth/README.md](../packages/auth/README.md).

User-owned resources: JWT + ownership check in the handler (notes pattern).

Org-scoped resources: `@RequireOrgPermission(...)`.

## 5. Verify

```bash
pnpm typecheck && pnpm test && pnpm build
```
