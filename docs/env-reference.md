# Environment reference (CogniVault)

All apps read the **root** `.env` via `@workspace/config`. Copy from [`.env.example`](../.env.example).

## Required to run locally

| Variable             | Where to get it                                                                                       |
| -------------------- | ----------------------------------------------------------------------------------------------------- |
| `MONGODB_URI`        | Local: `pnpm db:up`. Cloud: [MongoDB Atlas](https://cloud.mongodb.com) → free M0 → Connect → copy URI |
| `BETTER_AUTH_SECRET` | `openssl rand -base64 32` (min 32 chars)                                                              |
| `BETTER_AUTH_URL`    | API base URL, e.g. `http://localhost:4000`                                                            |
| `CLIENT_URL`         | Web app URL, e.g. `http://localhost:5173`                                                             |
| `MARKETING_URL`      | Marketing site URL, e.g. `http://localhost:3000`                                                      |
| `ALLOWED_ORIGINS`    | Comma-separated CORS origins (web + marketing)                                                        |

## Required for sign-in (at least one OAuth pair)

| Variable                                    | Where to get it                                                                                                                                        |
| ------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` | [Google Cloud Console](https://console.cloud.google.com/apis/credentials) → OAuth client (Web). Redirect: `{BETTER_AUTH_URL}/api/auth/callback/google` |
| `GITHUB_CLIENT_ID` / `GITHUB_CLIENT_SECRET` | [GitHub Developer Settings](https://github.com/settings/developers) → New OAuth App. Callback: `{BETTER_AUTH_URL}/api/auth/callback/github`            |

## Required for content ingestion (AI)

| Variable                 | Where to get it / notes                                                                                                |
| ------------------------ | ---------------------------------------------------------------------------------------------------------------------- |
| `GEMINI_API_KEY`         | [Google AI Studio](https://aistudio.google.com/apikey) (free tier)                                                     |
| `GEMINI_FLASH_MODEL`     | Default `gemini-3.6-flash` — current stable Flash ([deprecations](https://ai.google.dev/gemini-api/docs/deprecations)) |
| `GEMINI_EMBEDDING_MODEL` | Default `gemini-embedding-2` — current stable embeddings ([docs](https://ai.google.dev/gemini-api/docs/embeddings))    |

## Admin bootstrap

| Variable         | Notes                                                                                                                                                                      |
| ---------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `ADMIN_USER_IDS` | Comma-separated Better Auth user IDs granted platform admin via the admin plugin. Sign in once, copy your user id from the DB/`/v1/me`, then set this and restart the API. |

## Client build-time

| Variable                                                                | App                          |
| ----------------------------------------------------------------------- | ---------------------------- |
| `VITE_*`                                                                | Web (`apps/web`)             |
| `NEXT_PUBLIC_API_URL` / `NEXT_PUBLIC_AUTH_URL` / `NEXT_PUBLIC_APP_NAME` | Marketing (`apps/marketing`) |

## Optional

| Variable                                           | Notes                                                                         |
| -------------------------------------------------- | ----------------------------------------------------------------------------- |
| `RESEND_API_KEY` / `EMAIL_PROVIDER` / `EMAIL_FROM` | Org invitation email. Empty key → mock provider logs links to the API console |
| `STORAGE_*`                                        | Local uploads by default; S3 only if you switch `STORAGE_PROVIDER=s3`         |
| `CONTENT_UPLOAD_MAX_BYTES`                         | PDF library upload cap (default 15MB)                                         |
| `SENTRY_DSN` / `OTEL_*` / `VITE_SENTRY_DSN`        | Production observability only                                                 |

See `.env.example` for the full active list.
