# @workspace/auth

Shared authentication for Theo / CogniVault.

- **Better Auth** — OAuth (Google / GitHub), cookie sessions (30-day TTL), Mongo sessions
- **Admin plugin** — platform user management (`ADMIN_USER_IDS` + `admin` / `user` roles)
- **No organization plugin** — personal libraries are scoped by `userId`
- **No Redis secondary storage** for CogniVault core — rate limits use database storage
- **No password auth** (FR-1.1)

## Server

```ts
import { admin } from "better-auth/plugins/admin"

plugins: [
  admin({
    // Optional: force these user ids to admin regardless of role field
    adminUserIds: [...],
  }),
]
```

## Client

```ts
import { adminClient } from "better-auth/client/plugins"

createAuthClient({
  plugins: [adminClient()],
})
```

NestJS wiring: `@workspace/auth/nestjs` (`WorkspaceAuthModule`, `@Session()`, `@RequireRoles()`).
