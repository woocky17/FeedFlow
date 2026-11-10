# `docs/dev/`: documentación operativa de FeedFlow

Ficheros `.md` temáticos que se leen bajo demanda: cómo está montado el proyecto y cómo se trabaja en él (stack, comandos, convenciones, patrones, schema, Docker, variables, logs). Sirven a cualquier persona o herramienta, no solo a un agente concreto.

## Qué va aquí y qué no

- **Aquí**: lo operativo. Dónde vive cada cosa, cómo se escribe un handler o una entidad, qué puertos hay, qué variables de entorno existen y con qué default, cómo se migra, cómo se prueba.
- **No aquí**: el comportamiento (qué hace un endpoint, una página o un job, reglas de negocio, umbrales vistos como comportamiento). Eso vive en las specs de OpenSpec, en `openspec/specs/<cap>/spec.md` (`openspec list --specs`). Mientras un change `baseline-<cap>` no esté archivado, la spec está en `openspec/changes/baseline-<cap>/specs/<cap>/spec.md`.

Capabilities: `article-ingestion`, `article-feed`, `bias-radar`, `story-timeline`, `auth`, `categories`, `favorites`, `notifications`, `sources`, `translation`.

## Índice

| Fichero | Qué contiene |
|---------|--------------|
| `stack.md` | Versiones resueltas, runtime, Docker y comandos npm/make |
| `architecture.md` | Las 4 capas hexagonales, sus dependencias, el worker y por qué capas pasa cada flujo |
| `conventions.md` | Naming, alias de imports, Prettier, ESLint, errores y commits |
| `domain.md` | Patrón de entidad, entidades por feature y puertos |
| `database.md` | Schema Prisma: enums, modelos, relaciones, índices, migraciones y seed |
| `api-routes.md` | Convenciones y patrones de handler, y el mapa de endpoints a casos de uso |
| `pages.md` | Rutas de UI y su fichero, patrón de página server |
| `components.md` | Atomic Design, Radix, Tailwind 4 y Storybook |
| `auth.md` | NextAuth v5: configuración, callbacks, forma de la sesión, `src/proxy.ts` |
| `ai-pipeline.md` | Groq (modelo y parámetros), embeddings, similitud y dónde vive cada pieza de IA |
| `cron.md` | Worker: jobs, intervalos, logs, shutdown, Docker, backfill manual y variables |
| `testing.md` | Vitest: dónde van los tests, mocks y comandos |

## Regla al editarlos

- Si cambias código que invalida lo descrito aquí, actualiza el `.md` en el mismo commit.
- Si lo que cambia es comportamiento, no va aquí: va a un change de OpenSpec.
- Describe patrones estables, no listas exhaustivas que cambian a cada commit.
