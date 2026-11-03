# Stack y comandos

Versiones resueltas en `node_modules` / `package-lock.json` (2026-11-03). Si cambias una dependencia, actualiza esta tabla.

## Runtime

- Node 22 en local y en Docker (`node:22-slim`). Mínimo `^20.19 || ^22.12 || >=24` (Prisma 7.5); Next 16 pide `>=20.9`.
- TypeScript 5.9.3 `strict`, ESM, `moduleResolution: bundler`.

## Dependencias

| Paquete | Versión | Uso |
|---------|---------|-----|
| next | 16.2.0 | App Router, `output: "standalone"`, `proxy.ts` |
| react / react-dom | 19.2.4 | UI |
| next-auth | 5.0.0-beta.30 | Credentials + bcryptjs + JWT |
| next-intl | 4.9.1 | i18n, `messages/{es,en}.json` |
| prisma / @prisma/client | 7.5.0 | generador `prisma-client` → `generated/prisma` |
| @prisma/adapter-pg / pg | 7.5.0 / 8.20.0 | driver adapter PostgreSQL |
| @xenova/transformers | 2.17.2 | embeddings `all-MiniLM-L6-v2` (384 dims) |
| onnxruntime-node | 1.14.0 | backend de transformers (`serverExternalPackages`) |
| fast-xml-parser | 5.7.1 | RSS/Atom |
| tailwindcss | 4.2.2 | estilos (PostCSS) |
| @radix-ui/themes | 3.3.0 | componentes base |
| tsx | 4.21.0 | worker y scripts |
| vitest | 4.1.4 | tests (proyectos `unit` y `storybook`) |
| storybook | 10.3.5 | `@storybook/nextjs-vite` |
| playwright | 1.59.1 | navegador del proyecto vitest `storybook` y `scripts/visual` (no hay e2e) |
| eslint | 9.39.4 | flat config + `eslint-config-next` |
| vite | 8.0.9 | Storybook / Vitest |

Integraciones externas por `fetch` directo, sin SDK: Groq, WorldNewsAPI, NewsAPI, Resend.

## Docker

`docker-compose.yml`: `db` (postgres:16-alpine, 5433→5432), `app` (3000) y `worker` (target `worker` del `Dockerfile`), volumen `xenova_cache` para el modelo.

## Comandos

```bash
npm run dev              # servidor Next.js
npm run build            # next build
npm run start            # servidor de producción
npm run lint             # eslint .
npm run format           # prettier sobre src/**
npm test                 # vitest run --project unit
npm run test:watch       # vitest --project unit
npx tsc --noEmit         # typecheck (no hay script)

npm run db:generate      # regenerar cliente Prisma
npm run db:migrate       # crear+aplicar migración (dev)
npm run db:push          # aplicar schema sin migración
npm run db:studio        # GUI Prisma
npm run db:seed          # prisma/seed.ts

npm run worker           # worker en bucle
npm run worker:once      # una pasada (scripts/run-cron.ts)

npm run storybook        # Storybook en :6006
npm run build-storybook
```

`Makefile` envuelve lo mismo (`make dev`, `make db-migrate`…) y Docker: `make docker-up`, `docker-down`, `docker-db`, `docker-build`, `docker-logs`.

`POST /api/cron/backfill` sigue siendo HTTP y se autentica con `Authorization: Bearer $CRON_SECRET`.
