# Build context: repository root (monorepo).
# Only @usa-limousine-corporation/backend is installed and started.

FROM node:22-bookworm-slim AS builder

RUN apt-get update \
  && apt-get install -y --no-install-recommends python3 make g++ openssl ca-certificates \
  && rm -rf /var/lib/apt/lists/*

RUN corepack enable && corepack prepare pnpm@9.15.9 --activate

WORKDIR /app

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/backend/package.json apps/backend/package.json
COPY packages/config packages/config
COPY apps/backend/prisma.config.ts apps/backend/prisma.config.ts
COPY apps/backend/prisma apps/backend/prisma

RUN pnpm install --frozen-lockfile --filter @usa-limousine-corporation/backend...

COPY tsconfig.base.json ./
COPY apps/backend apps/backend

RUN pnpm --filter @usa-limousine-corporation/backend build

FROM node:22-bookworm-slim AS runner

RUN apt-get update \
  && apt-get install -y --no-install-recommends openssl ca-certificates \
  && rm -rf /var/lib/apt/lists/*

RUN corepack enable && corepack prepare pnpm@9.15.9 --activate

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000

COPY --from=builder /app /app
COPY deploy/vps/entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

WORKDIR /app/apps/backend

EXPOSE 3000

ENTRYPOINT ["/entrypoint.sh"]
