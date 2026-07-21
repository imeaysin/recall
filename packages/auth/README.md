# @workspace/auth

Shared authentication for Theo / CogniVault.

- **Better Auth** — OAuth (Google / GitHub), cookie sessions (30-day TTL), Mongo sessions
- **Admin plugin** — platform user management (`ADMIN_USER_IDS` + `admin` / `user` roles)
- **No organization plugin** — personal libraries are scoped by `userId`
- **No Redis** for core — rate limits use database storage
- **No password auth** (FR-1.1)

NestJS: `@workspace/auth/nestjs` (`WorkspaceAuthModule`, `@Session()`, `@RequireRoles()`).

Client: `adminClient()` from `better-auth/client/plugins`.

**Mongo note:** the adapter stores app `id` as document `_id`. Raw `user` updates must query `{ _id: ObjectId(session.user.id) }`, not `{ id }`.
