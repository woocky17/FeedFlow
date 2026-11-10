---
description: Carga selectiva de contexto desde docs/dev/ y de las specs de OpenSpec
argument-hint: "[area1 area2 ...]"
---

Carga el contexto de las áreas indicadas por el usuario: **$ARGUMENTS**.

Lo operativo está en `docs/dev/<area>.md`; el comportamiento, en las specs de OpenSpec.

## 1. Resuelve cada área

Áreas operativas (solo `docs/dev/`):

- `stack` / `commands` → `docs/dev/stack.md`
- `architecture` / `layers` → `docs/dev/architecture.md`
- `conventions` / `style` / `lint` → `docs/dev/conventions.md`
- `domain` → `docs/dev/domain.md`
- `database` / `db` / `prisma` → `docs/dev/database.md`
- `api` / `api-routes` → `docs/dev/api-routes.md`
- `pages` / `ui-routes` → `docs/dev/pages.md`
- `components` / `ui` → `docs/dev/components.md`
- `ai` / `ai-pipeline` / `groq` / `embeddings` → `docs/dev/ai-pipeline.md`
- `cron` / `worker` → `docs/dev/cron.md`
- `testing` / `tests` → `docs/dev/testing.md`

Áreas de comportamiento (spec + docs operativos relacionados):

- `auth` → spec `auth` + `docs/dev/auth.md`
- `ingestion` / `article-ingestion` / `sync` → spec `article-ingestion` + `docs/dev/cron.md`, `docs/dev/ai-pipeline.md`
- `feed` / `article-feed` → spec `article-feed` + `docs/dev/api-routes.md`, `docs/dev/pages.md`
- `bias-radar` / `events` → spec `bias-radar` + `docs/dev/ai-pipeline.md`
- `stories` / `story-timeline` → spec `story-timeline` + `docs/dev/ai-pipeline.md`
- `categories` → spec `categories` + `docs/dev/api-routes.md`
- `favorites` → spec `favorites` + `docs/dev/api-routes.md`
- `notifications` → spec `notifications` + `docs/dev/cron.md`
- `sources` → spec `sources` + `docs/dev/api-routes.md`, `docs/dev/cron.md`
- `translation` / `i18n` → spec `translation` + `docs/dev/ai-pipeline.md`

## 2. Carga la spec de cada capability `<cap>`

1. Si existe `openspec/specs/<cap>/spec.md`, muéstrala con la CLI (Git Bash):
   ```bash
   export PATH="/c/Users/dortet/AppData/Roaming/npm:$PATH" OPENSPEC_TELEMETRY=0
   openspec show <cap> --type spec
   ```
   Si la CLI falla (sale con código 1 cuando la spec no existe), lee el fichero directamente.
2. Si no existe, el change `baseline-<cap>` aún no está archivado: lee el delta `openspec/changes/baseline-<cap>/specs/<cap>/spec.md`.
3. Si tampoco existe, busca la capability con `openspec list --specs` y `openspec list`, y avisa al usuario.

## 3. Lee en paralelo

Lee en una sola llamada con varios tool uses todos los `docs/dev/*.md` y specs que correspondan.

## 4. Resume

Devuelve un resumen de **3-6 bullets** orientado a la tarea que el usuario va a pedir: patrones, puertos, rutas, variables y los requisitos de la spec que probablemente toque. No re-expliques qué es cada fichero; céntrate en lo accionable.

Termina preguntando qué tarea concreta quiere abordar ahora que el contexto está cargado.

Si `$ARGUMENTS` está vacío, lista las áreas disponibles y pide cuáles cargar. Si un área no coincide con ninguna, avísalo y sugiere la más cercana.
