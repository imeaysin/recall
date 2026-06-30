# @workspace/contracts

Shared API contracts and schemas for **Theo**, powered by **Zod**.

## Layout

```
src/
  api/           Cross-cutting API types (envelopes, error codes)
  schemas/       Domain Zod schemas (notes, auth, uploads, …)
  index.ts       Public exports
```

## Usage

Import from `@workspace/contracts` in `api`, `web`, and other apps. Add new domain schemas under `src/schemas/`; add shared API shapes under `src/api/`.

Part of the Theo monorepo template.
