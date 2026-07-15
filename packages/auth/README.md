# @workspace/auth

Shared authentication and authorization for Theo.

- **Better Auth** (`1.6.23`) — sessions, email/password, OAuth, 2FA, organizations, admin, API keys
- **CASL** v7 — isomorphic ABAC
- **Sessions** — Redis secondary storage (`@better-auth/redis-storage`) + Mongo copy (`storeSessionInDatabase`)

No custom JWT bearer layer. Org/admin plugins require Mongo; Redis holds hot session data for multi-instance hosts.
