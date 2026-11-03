# FeedFlow

Agregador de noticias personalizado (Next.js 16 full-stack): deduplicación por embeddings, clustering para análisis de sesgo (News Bias Radar), timelines de historias (Story Timeline), categorías por usuario y traducción con Groq.

- **Runtime**: Node 22 (Docker `node:22-slim`). Mínimo `^20.19 || ^22.12 || >=24` (lo impone Prisma 7). No soportados: Node 18, 21, 23 ni 20/22 por debajo de esos mínimos.
- **Repo**: https://github.com/woocky17/FeedFlow (rama `main`).
- **Versión**: `package.json` → `version`. Stack y versiones resueltas en `.claude/context/stack.md`.

## Identificadores fijos

- Cliente Prisma generado en `generated/prisma` (gitignored): tras `npm ci` o cambiar el schema, `npm run db:generate`.
- Auth por `src/proxy.ts` (convención de Next 16), no `middleware.ts`.
- Alias `@/*` → `src/*` (más `@/domain/*`, `@/application/*`, `@/infrastructure/*`).
- Nombres legacy en español que se mantienen: `Noticia`, `Categoria`, `Usuario`.
- Textos de UI con `next-intl`: `messages/es.json` y `messages/en.json`.

## Decisiones que no se discuten

- **Hexagonal estricto**: `domain/` es TypeScript puro; nada de Prisma, Next, React ni fetch. Así el dominio se testea sin infraestructura y los adaptadores se cambian sin tocarlo.
- **Casos de uso con puertos por constructor** (DI manual): sin contenedor ni magia, cada dependencia es explícita.
- **Worker standalone** (`src/worker`) para sync, heal, notificaciones y prefetch de traducciones, en lugar de rutas cron de Next: bucle propio, sin timeouts de request y con su propio contenedor Docker. Solo queda `/api/cron/backfill` como disparo manual.
- **Embeddings locales** (`Xenova/all-MiniLM-L6-v2`, 384 dims): sin coste por llamada ni dependencia de red para deduplicar y agrupar.

## Estructura

```
src/
├── domain/          entidades, VOs y puertos (TS puro; CLAUDE.md propio)
├── application/     casos de uso por feature (CLAUDE.md propio)
├── infrastructure/  adaptadores: prisma, ai (transformers + groq), news, mail (CLAUDE.md propio)
├── worker/          proceso Node standalone: index.ts, loop.ts, container.ts
├── app/             App Router: (pages)/, api/, actions/
├── components/      Atomic Design; stories recomendables, solo como catálogo (CLAUDE.md propio)
├── i18n/            configuración de next-intl
├── lib/             auth.ts (NextAuth), similarity.ts
├── types/           tipos globales
└── proxy.ts         protección de rutas (auth)
messages/            traducciones es/en
prisma/              schema.prisma, migrations/, seed.ts
generated/prisma/    cliente Prisma generado (gitignored)
scripts/             run-cron.ts, run-sync.ts
test/                Vitest unit: domain/, application/, infrastructure/
docs/                estado.md (nota de traspaso) y planes temporales
logs/                salida de `npm run dev` (gitignored)
.claude/context/     docs operativas por área (carga bajo demanda)
.claude/commands/    /ctx
.claude/agents/      ff-researcher, ff-api-explorer, ff-implementer, ff-reviewer, ff-debugger
.claude/skills/      /estado
.claude/hooks/       session-banner.mjs (SessionStart)
```

## Referencias

| Tarea | Lee |
|-------|-----|
| Stack, versiones y comandos | `.claude/context/stack.md` |
| Arquitectura y flujos (diseño) | `.claude/context/architecture.md` |
| Entidades, invariantes, VOs | `.claude/context/domain.md` |
| Endpoints API | `.claude/context/api-routes.md` |
| Schema, migraciones | `.claude/context/database.md` |
| Páginas y rutas UI | `.claude/context/pages.md` |
| Componentes y stories | `.claude/context/components.md` |
| Tests | `.claude/context/testing.md` |
| Embeddings, clustering, Groq | `.claude/context/ai-pipeline.md` |
| Login, sesión, proxy | `.claude/context/auth.md` |
| Worker, sync, notificaciones | `.claude/context/cron.md` |
| Naming, imports, estilo, commits | `.claude/context/conventions.md` |

Carga selectiva con `/ctx <area>`. Además: CLAUDE.md por capa en `src/domain`, `src/application`, `src/infrastructure` y `src/components`; roadmap en `FUTURE_FEATURES.md`. Las reglas detalladas de código están en `.claude/agents/ff-implementer.md`.

Logs: no hay ficheros de log propios. App → `logs/dev.log` (ver Probar). Worker → JSON por stdout (`src/worker/loop.ts`), en Docker `docker compose logs -f worker`.

## Flujo de trabajo con agentes

Ciclo de una feature: `ff-researcher` → `ff-api-explorer` → decidir el enfoque con el usuario → `ff-implementer` (por tandas) → `ff-reviewer` → prueba el usuario → `ff-debugger` si falla → arreglo → commit.

- **Tandas pequeñas**: cada agente recibe una sola tanda acotada de tareas relacionadas. Lo que pida el usuario mientras trabaja va a la siguiente tanda, con un agente nuevo; nunca se le envía al que está en curso. Entre tandas se pasan los tests.
- Agentes que no tocan los mismos ficheros se lanzan en paralelo.
- Al cerrar un bloque de trabajo, actualizar `docs/estado.md`. `/estado` lo lee al empezar sesión.
- Los pendientes de `docs/estado.md` se deciden y se despachan con `/pendientes` (skill global): menú de opciones y tandas de agentes con lo elegido.
- Respuestas breves; lo decidido y lo pendiente va a `docs/`, no se queda en el chat.

## Commits y versiones

- Semver en `package.json`. Formato `vX.Y.Z: <resumen>` para código y `Docs: <resumen>` para solo documentación.
- Solo cuando los pida el usuario. Sin `Co-Authored-By` ni otra atribución a Claude.
- Releases como prerelease hasta probarlas en real (`gh` está autenticado).

## Probar

Fuera del entorno real (sin BD ni APIs):

```bash
npm test               # Vitest unit (64 tests, mockean fetch, sin BD)
npm run lint           # ESLint, ~60 s
npx tsc --noEmit       # typecheck (no hay script); requiere generated/prisma al día
npm run build          # next build
```

Si `tsc` falla con `implicitly has an 'any' type` en repositorios Prisma: `npm ci && npm run db:generate`.

En real (Git Bash):

```bash
mkdir -p logs && npm run dev 2>&1 | tee logs/dev.log   # arranque correcto: "✓ Ready in"
npm run worker                                         # o: docker compose logs -f worker
```

El worker arranca bien si imprime `{"level":"info","ts":"…","event":"boot","message":"worker starting"}` y después `start`/`done` por job.

## Política de mantenimiento

- Al añadir o renombrar una feature, ruta API, convención o dependencia → actualizar el `.md` de `.claude/context/` en el mismo commit.
- Cambios estructurales (capa nueva, regla nueva) → actualizar también este CLAUDE.md.
- Cada trampa nueva → reglas de `ff-implementer` **y** checklist de `ff-reviewer`.
- Este fichero no pasa de 150 líneas; si crece, mover una sección a `.claude/context/` y dejar el puntero.
