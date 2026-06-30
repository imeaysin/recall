FROM node:22-alpine AS base
RUN corepack enable && corepack prepare pnpm@11.6.0 --activate
WORKDIR /app

FROM base AS deps
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml .npmrc turbo.json ./
COPY apps/api/package.json apps/api/
COPY packages/auth/package.json packages/auth/
COPY packages/config/package.json packages/config/
COPY packages/contracts/package.json packages/contracts/
COPY packages/db/package.json packages/db/
COPY packages/email/package.json packages/email/
COPY packages/storage/package.json packages/storage/
COPY tooling/eslint-config/package.json tooling/eslint-config/
COPY tooling/typescript-config/package.json tooling/typescript-config/
RUN pnpm install --frozen-lockfile --filter api...

FROM base AS build
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/apps/api/node_modules ./apps/api/node_modules
COPY . .
ENV SKIP_ENV_VALIDATION=true
RUN pnpm --filter @workspace/config build \
  && pnpm --filter @workspace/contracts build \
  && pnpm --filter @workspace/auth build \
  && pnpm --filter @workspace/db build \
  && pnpm --filter @workspace/email build \
  && pnpm --filter @workspace/storage build \
  && pnpm --filter api build

FROM node:22-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
RUN addgroup --system --gid 1001 nodejs && adduser --system --uid 1001 nestjs
COPY --from=build /app/apps/api/dist ./dist
COPY --from=build /app/apps/api/package.json ./package.json
COPY --from=build /app/node_modules ./node_modules
USER nestjs
EXPOSE 4000
CMD ["node", "dist/main.js"]
