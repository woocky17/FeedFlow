# FeedFlow

Agregador de noticias personalizado (Next.js 16 full-stack): deduplicación por embeddings, clustering para análisis de sesgo (News Bias Radar), timelines de historias (Story Timeline), categorías por usuario y traducción con Groq.

- **Runtime**: Node 22 (Docker `node:22-slim`). Mínimo `^20.19 || ^22.12 || >=24` (lo impone Prisma 7). No soportados: Node 18, 21, 23 ni 20/22 por debajo de esos mínimos.
- **Repo**: https://github.com/woocky17/FeedFlow (rama `main`).
- **Versión**: `package.json` → `version`. Stack y versiones resueltas en `docs/dev/stack.md`.
- **Entorno**: Windows en local y Linux en Docker.

## Identificadores fijos

- Cliente Prisma generado en `generated/prisma` (gitignored): tras `npm ci` o cambiar el schema, `npm run db:generate`.
- Auth por `src/proxy.ts` (convención de Next 16), no `middleware.ts`.
- Alias de imports definidos en `tsconfig.json` (`paths`): uno para `src/*` y uno por capa (domain, application, infrastructure). Nunca `../../../`. Detalle en `docs/dev/conventions.md`.
- Nombres legacy en español que se mantienen: `Noticia`, `Categoria`, `Usuario`.
- Textos de UI con `next-intl`: `messages/es.json` y `messages/en.json`, siempre los dos con las mismas claves.

## Decisiones que no se discuten

- **Hexagonal estricto**: `domain/` es TypeScript puro; nada de Prisma, Next, React ni fetch. Así el dominio se testea sin infraestructura y los adaptadores se cambian sin tocarlo.
- **Casos de uso con puertos por constructor** (DI manual): sin contenedor ni magia, cada dependencia es explícita.
- **Worker standalone** (`src/worker`) para sync, heal, notificaciones y prefetch de traducciones, en lugar de rutas cron de Next: bucle propio, sin timeouts de request y con su propio contenedor Docker. Solo queda `/api/cron/backfill` como disparo manual.
- **Embeddings locales** (`Xenova/all-MiniLM-L6-v2`, 384 dims): sin coste por llamada ni dependencia de red para deduplicar y agrupar.

## Estructura

```
src/
├── domain/          entidades, VOs y puertos (TS puro; AGENTS.md propio)
├── application/     casos de uso por feature (AGENTS.md propio)
├── infrastructure/  adaptadores: prisma, ai (transformers + groq), news, mail (AGENTS.md propio)
├── worker/          proceso Node standalone: index.ts, loop.ts, container.ts
├── app/             App Router: (pages)/, api/, actions/
├── components/      Atomic Design; stories recomendables, solo como catálogo (AGENTS.md propio)
├── i18n/            configuración de next-intl
├── lib/             auth.ts (NextAuth), similarity.ts
├── types/           tipos globales
└── proxy.ts         protección de rutas (auth)
messages/            traducciones es/en
prisma/              schema.prisma, migrations/, seed.ts
generated/prisma/    cliente Prisma generado (gitignored)
openspec/            specs de comportamiento (specs/) y changes en curso (changes/)
scripts/             run-cron.ts, run-sync.ts
test/                Vitest unit: domain/, application/, infrastructure/
docs/dev/            documentación operativa por área
docs/                estado.md (nota de traspaso) y planes temporales
logs/                salida de `npm run dev` (gitignored)
```

Antes de tocar `src/<capa>/`, lee `src/<capa>/AGENTS.md` (existe para `domain`, `application`, `infrastructure` y `components`).

## Referencias

Lo operativo (cómo está montado y cómo se trabaja) está en `docs/dev/`. El comportamiento (qué hace el sistema) está en las specs de `openspec/specs/<cap>/spec.md` (`openspec list --specs`).

| Tarea | Lee |
|-------|-----|
| Índice de la documentación operativa | `docs/dev/README.md` |
| Stack, versiones y comandos | `docs/dev/stack.md` |
| Capas, worker y flujos por capas | `docs/dev/architecture.md` |
| Naming, imports, estilo, errores, commits | `docs/dev/conventions.md` |
| Entidades y puertos | `docs/dev/domain.md` |
| Schema, migraciones, seed | `docs/dev/database.md` |
| Patrones de handler y mapa de endpoints | `docs/dev/api-routes.md` |
| Rutas de UI y patrón de página | `docs/dev/pages.md` |
| Componentes y stories | `docs/dev/components.md` |
| NextAuth, sesión, `src/proxy.ts` | `docs/dev/auth.md` |
| Groq, embeddings, similitud | `docs/dev/ai-pipeline.md` |
| Worker, jobs, Docker, variables | `docs/dev/cron.md` |
| Tests | `docs/dev/testing.md` |
| Qué hace una feature | `openspec/specs/<cap>/spec.md` |
| Roadmap | `FUTURE_FEATURES.md` |

Capabilities: `article-ingestion`, `article-feed`, `bias-radar`, `story-timeline`, `auth`, `categories`, `favorites`, `notifications`, `sources`, `translation`. Mientras un change `baseline-<cap>` no esté archivado, su spec está en `openspec/changes/baseline-<cap>/specs/<cap>/spec.md`.

## Specs (OpenSpec)

- El comportamiento solo se cambia con un change en `openspec/changes/<id>/`: propose → apply → verify → archive. Al archivarlo, sus deltas pasan a `openspec/specs/`.
- `openspec/specs/` nunca se edita a mano.
- En cada requisito, las palabras clave SHALL/MUST van en inglés; el resto del texto, en español.
- Antes de dar un change por bueno: `openspec validate --all --strict`.

## Probar

Fuera del entorno real (sin BD ni APIs):

```bash
npm test               # Vitest unit (mockean fetch, sin BD)
npm run lint           # ESLint (eslint .), ~60 s
npx tsc --noEmit       # typecheck (no hay script); requiere generated/prisma al día
npm run build          # next build
```

Si `tsc` falla con `implicitly has an 'any' type` en repositorios Prisma: `npm ci && npm run db:generate`.

Usuarios de prueba: `TEST_USER_*`/`TEST_ADMIN_*` en `.env` + `npx prisma db seed` (ver `docs/dev/database.md`).

En real:

```bash
mkdir -p logs && npm run dev 2>&1 | tee logs/dev.log   # arranque correcto: "✓ Ready in"
npm run worker                                         # o: docker compose logs -f worker
```

Logs: no hay ficheros de log propios. App → `logs/dev.log`. Worker → JSON por stdout (`src/worker/loop.ts`). Arranca bien si imprime `{"level":"info","ts":"…","event":"boot","message":"worker starting"}` y después `start`/`done` por job, sin `"event":"failed"` ni `"fatal"`.

## Commits y versiones

- Semver en `package.json`, subido en el mismo commit. Formato `vX.Y.Z: <resumen>` para código y `Docs: <resumen>` para solo documentación.
- Solo cuando los pida el usuario. Sin `Co-Authored-By` ni otras atribuciones de herramientas.
- Releases como prerelease hasta probarlas en real.

## Política de mantenimiento

- Lo operativo nuevo o cambiado (dependencia, convención, ruta, variable, patrón) → el `.md` de `docs/dev/` que toque, en el mismo commit.
- Comportamiento nuevo o cambiado → un change de OpenSpec, no `docs/dev/`.
- Cambios estructurales (capa nueva, regla nueva) → actualizar también este fichero y el `AGENTS.md` de la capa.
- Al cerrar un bloque de trabajo, actualizar `docs/estado.md`.
