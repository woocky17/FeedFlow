# Estado de FeedFlow

- **Actualizado**: 2026-11-03
- **Versión**: 1.0.1 (`package.json`)
- **Commit**: `v1.0.1: limpieza…` · rama `main` (con push)
- **Probado**: tests/lint/tsc/build en verde; no probado a mano (dev ni storybook)

## Dónde estamos

v1.0.1: limpieza del repo en tres tandas, revisada por `ff-reviewer` sin bloqueantes:

1. **Dependencias y Storybook solo catálogo**: fuera `@eslint/eslintrc`, `@radix-ui/react-icons`, `@types/bcryptjs`, `@chromatic-com/storybook`, `@storybook/addon-onboarding`, `@storybook/addon-vitest`, `@vitest/browser-playwright`, `@vitest/coverage-v8` y `playwright`; `dotenv` pasa a `dependencies`. Vitest queda con el proyecto `unit` y Storybook sin addon de tests ni `vitest.shims.d.ts`.
2. **Código muerto**: borrados el adaptador `newsapi`, el seed duplicado `src/infrastructure/db/prisma/seed.ts`, los componentes `nav-link`, `toast`/`toast-provider`, `form-field` y `label`, los scripts de backfill/informes y `scripts/visual/*`, y seis casos de uso sin uso (`read-articles`, `search-articles-ai`, `assign-category-manually`, `manage-default-categories`, `delete-favorite`, `delete-account`).
3. **Configuración y docs**: borrado `.claude/.mcp.json` (MCP de Playwright mal ubicado y con un paquete inexistente); quitada de `package.json` la clave `prisma.seed` (Prisma 7.5 solo lee `migrations.seed` de `prisma.config.ts`); `Makefile` con `.PHONY` completo y targets `test` y `worker`; `.env.example` con `PREFETCH_TRANSLATIONS_INTERVAL_SECONDS`, `NEWS_EVENT_SIMILARITY_THRESHOLD` y `STORY_SIMILARITY_THRESHOLD`; quitado el `eslint-disable` sobrante de `src/global.d.ts`; docs de `.claude/context/` (README, architecture, api-routes, conventions) al día con el worker y `eslint .`.

Verificación tras la tanda 3: `npm test` verde (12 ficheros, 64 tests), `npm run lint` sin avisos, `npx tsc --noEmit --incremental false` verde y `npm run build` verde.

## Siguiente paso (pendiente)

1. Arrancar `mkdir -p logs && npm run dev 2>&1 | tee logs/dev.log`, buscar `✓ Ready in` y recorrer feed, favoritos, stories, eventos y admin.
2. Arrancar `npm run storybook` y comprobar que el catálogo carga sin las stories borradas.

Agente: ninguno para 1 y 2, lo hace el usuario. Si algo falla, `ff-debugger`.

## Otros pendientes

- Métodos de puertos sin uso tras la limpieza (decidir si se quitan): `ArticleRepository.findBySource`, `CategoryAssignmentRepository.findByArticle` y `updateOrigin`, `FavoriteRepository.delete`, `NotificationRepository.delete`, `UserRepository.delete` y `updatePassword`.
- Violaciones hexagonales previas:
  - `src/application/news-event/analyze-sentiment-batch.ts:27`, `src/application/news-event/analyze-article-sentiment.ts:16` y `src/application/article/heal-articles.ts:37,70,93` usan `prisma` desde application.
  - `src/app/api/articles/route.ts`, `src/app/api/admin/categories/**` y `src/app/api/favorites/[id]` usan Prisma o repos sin caso de uso.
- Carpetas vacías que quedan en disco (git no las ve): `scripts/visual/` y `src/app/(pages)/favorites/`. Borrarlas a mano.
- Restos extraneous de npm (`@emnapi/*`, `@napi-rs/wasm-runtime`, `@tybys/wasm-util`): se van con `npm ci` sin procesos abiertos.
- `.claude/agregador-noticias-tareas.md` (checklist legacy): decidir si se borra.
- Se mantiene a propósito: sin CI (`.github/workflows/` vacío), sin validación de variables de entorno y sin tags.

## Tags y releases

| Tag | Commit | Fecha | Release | Probado |
|-----|--------|-------|---------|---------|
| — | — | — | — | — |
