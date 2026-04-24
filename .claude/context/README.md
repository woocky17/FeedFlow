# `.claude/context/` — Memoria operativa de FeedFlow

Archivos `.md` temáticos que Claude Code carga **bajo demanda** (no automáticamente) cuando el `CLAUDE.md` raíz o el usuario lo indican. Evitan que el agente tenga que re-explorar la codebase en cada sesión.

## Cómo se usan

1. El `CLAUDE.md` raíz tiene un índice que dice "para tarea X, lee `Y.md`".
2. El usuario puede forzar carga selectiva con `/ctx <area1> <area2>`.
3. Cada `.md` describe **patrones e invariantes estables**, no listas exhaustivas que cambian a cada commit.

## Índice

| Archivo | Qué contiene |
|---------|--------------|
| `architecture.md` | Las 4 capas hexagonales, sus dependencias, flujos de una request y del cron |
| `domain.md` | Entidades por feature (`user`, `article`, `category`, `favorite`, `source`, `notification`, `story`, `news-event`), invariantes, puertos |
| `application.md` *(opcional futuro)* | Casos de uso agrupados por feature — de momento se describe en `architecture.md` |
| `api-routes.md` | Mapa de endpoints `src/app/api/**` con verbo, path, caso de uso que invoca, auth |
| `pages.md` | Rutas de UI en `src/app/(pages)/**` y `src/app/page.tsx` |
| `database.md` | Resumen interpretado del `schema.prisma`: modelos, relaciones, índices, enums, migraciones |
| `components.md` | Atomic Design aquí, convenciones Radix + Tailwind v4, Storybook |
| `testing.md` | Vitest (unit/integration), Playwright (e2e), mocks, factories |
| `ai-pipeline.md` | Embeddings (MiniLM), clustering News Bias Radar, similitud Stories, Groq (clasificación/sentiment/topic) |
| `auth.md` | NextAuth v5 beta, Credentials provider, middleware, session shape |
| `cron.md` | Jobs `/api/cron/sync` y `/api/cron/notifications`, auth por `CRON_SECRET`, Docker cron |
| `conventions.md` | Naming, alias de imports, ESLint, Prettier, mensajes de commit |

## Regla al editarlos

Cuando cambies código que invalida lo descrito aquí, **actualiza el `.md` en el mismo commit**. Si una sección se vuelve una lista exhaustiva volátil (ej. un endpoint por línea), reconsidera si debería describirse como patrón en vez de listarse exhaustivamente — o generarse con un script.
