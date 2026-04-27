FROM node:22-slim AS base

# Dependencies
FROM base AS deps
WORKDIR /app
RUN apt-get update && apt-get install -y openssl ca-certificates \
    && rm -rf /var/lib/apt/lists/*
COPY package.json package-lock.json ./
RUN npm ci

# Build
FROM base AS builder
WORKDIR /app
RUN apt-get update && apt-get install -y openssl ca-certificates \
    && rm -rf /var/lib/apt/lists/*
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npx prisma generate
RUN npm run build

# Production
FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production
RUN apt-get update && apt-get install -y openssl ca-certificates \
    && rm -rf /var/lib/apt/lists/*
RUN addgroup --system --gid 1001 nodejs \
    && adduser --system --uid 1001 nextjs

COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=builder --chown=nextjs:nodejs /app/generated ./generated
COPY --from=builder --chown=nextjs:nodejs /app/node_modules/@xenova ./node_modules/@xenova
COPY --from=builder --chown=nextjs:nodejs /app/node_modules/onnxruntime-node ./node_modules/onnxruntime-node
COPY --from=builder --chown=nextjs:nodejs /app/node_modules/@prisma ./node_modules/@prisma

USER nextjs
EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["node", "server.js"]

# Worker (standalone Node process for cron jobs)
FROM base AS worker
WORKDIR /app
ENV NODE_ENV=production
RUN apt-get update && apt-get install -y openssl ca-certificates \
    && rm -rf /var/lib/apt/lists/*
RUN addgroup --system --gid 1001 nodejs \
    && adduser --system --uid 1001 worker

COPY --from=builder --chown=worker:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=worker:nodejs /app/generated ./generated
COPY --from=builder --chown=worker:nodejs /app/src ./src
COPY --from=builder --chown=worker:nodejs /app/tsconfig.json ./tsconfig.json
COPY --from=builder --chown=worker:nodejs /app/package.json ./package.json

# Pre-create xenova cache dir owned by worker so the named volume inherits the
# right ownership on first mount (Docker creates volume mount points as root by
# default, which would block the non-root worker from writing).
RUN mkdir -p /app/node_modules/@xenova/transformers/.cache \
    && chown -R worker:nodejs /app/node_modules/@xenova/transformers/.cache

USER worker

CMD ["node", "node_modules/tsx/dist/cli.mjs", "src/worker/index.ts"]
