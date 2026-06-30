# Deployment

## API (`apps/api`)

Multi-stage Dockerfile included:

```bash
docker build -f apps/api/Dockerfile -t theo-api .
docker run -p 4000:4000 --env-file .env theo-api
```

Set `NODE_ENV=production`, `MONGODB_URI`, `BETTER_AUTH_*`, and `ALLOWED_ORIGINS`.

## Web (`apps/web`)

Static Vite build:

```bash
pnpm --filter web build
# deploy dist/ to any static host (Cloudflare Pages, S3, etc.)
```

Set `VITE_API_URL` and `VITE_AUTH_URL` at build time.

## Marketing (`apps/marketing`)

Standard Next.js deploy (Vercel, etc.). Set `NEXT_PUBLIC_*` vars.

## Mobile

Use [EAS Build](https://docs.expo.dev/build/introduction/) with `EXPO_PUBLIC_AUTH_URL` and `EXPO_PUBLIC_API_URL`.
