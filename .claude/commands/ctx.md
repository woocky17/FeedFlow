---
description: Carga selectiva de contexto desde .claude/context/
argument-hint: "[area1 area2 ...]"
---

Carga el contexto relevante desde `.claude/context/` para las áreas indicadas por el usuario como argumento: **$ARGUMENTS**.

Instrucciones:

1. Identifica qué archivo(s) de `.claude/context/` corresponden a cada área. Áreas disponibles:
   - `architecture` → `.claude/context/architecture.md` (capas hexagonales, flujos end-to-end, cron)
   - `domain` → `.claude/context/domain.md` (entidades, VOs, puertos, invariantes)
   - `api` / `api-routes` → `.claude/context/api-routes.md` (mapa de endpoints)
   - `pages` / `ui-routes` → `.claude/context/pages.md` (rutas de UI)
   - `database` / `db` / `prisma` → `.claude/context/database.md` (modelos Prisma, relaciones, migraciones)
   - `components` / `ui` → `.claude/context/components.md` (Atomic Design, Radix, Tailwind, Storybook)
   - `testing` / `tests` → `.claude/context/testing.md` (Vitest, Playwright)
   - `ai` / `ai-pipeline` / `embeddings` → `.claude/context/ai-pipeline.md` (Transformers, Groq, clustering, sentiment)
   - `auth` / `nextauth` → `.claude/context/auth.md`
   - `cron` / `sync` → `.claude/context/cron.md`
   - `conventions` / `style` / `lint` → `.claude/context/conventions.md`

2. **Lee en paralelo** (una sola llamada con múltiples tool uses) todos los archivos correspondientes.

3. Tras leerlos, devuelve un resumen de **3-6 bullets** orientado a la tarea que el usuario va a pedir a continuación: extrae los patrones, invariantes, rutas o umbrales que probablemente usará. No re-expliques qué es cada archivo; céntrate en lo accionable.

4. Termina preguntando al usuario qué tarea concreta quiere abordar ahora que ya tienes el contexto cargado.

Si el usuario no pasó argumentos (`$ARGUMENTS` vacío), lista las áreas disponibles y pídele que indique cuáles cargar.

Si un área no coincide con ningún archivo, avisa al usuario y sugiere la más cercana.
