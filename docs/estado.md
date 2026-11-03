# Estado de FeedFlow

- **Actualizado**: 2026-11-03
- **Versión**: 1.0.0 (`package.json`)
- **Commit**: `35b9f41` · rama `main` (sin push)
- **Probado**: no

## Dónde estamos

Entorno de Claude Code recién montado: CLAUDE.md reescrito, `.claude/context/stack.md`, agentes `ff-*`, skill `/estado`, hook SessionStart con banner y esta nota. El código no ha cambiado desde `7e170fa`.

Dependencias reparadas con `npm ci && npm run db:generate` (2026-11-03):
- `npm test`: verde (12 ficheros, 64 tests).
- `npm run lint`: verde, 1 aviso (de antes de reparar).
- `npx tsc --noEmit`: verde.
- `npm run build`: verde (Next 16.2.0 Turbopack, 31 rutas + proxy).
- `npm ls` marca como extraneous `@emnapi/*`, `@napi-rs/wasm-runtime` y `@tybys/wasm-util`: restos que `npm ci` no pudo borrar (EPERM en Windows). Inofensivos; desaparecen en el próximo `npm ci` sin procesos abiertos.

## Siguiente paso (pendiente)

1. Arrancar `mkdir -p logs && npm run dev 2>&1 | tee logs/dev.log` y buscar `✓ Ready in`.

Agente: ninguno, lo hace el usuario. Si algo falla, `ff-debugger`.

## Otros pendientes

- Aviso de lint: directiva `eslint-disable` sin uso en `src/global.d.ts:4`.
- Docs desfasadas:
  - `.claude/context/testing.md:44,61` describe e2e con Playwright que no existe (no hay `playwright.config` ni `test/e2e`).
  - `.claude/context/README.md` cita `application.md`, que no existe.
  - `.claude/context/README.md` y `architecture.md` describen `/api/cron/sync` y `/api/cron/notifications`, sustituidos por el worker.
  - `.claude/context/conventions.md` dice que `npm run lint` = `next lint`; ahora es `eslint .`.
- `.claude/.mcp.json` (MCP de Playwright) está fuera de la raíz: probablemente no se carga. Moverlo a `.mcp.json` si se quiere usar.
- Variables leídas en código y ausentes de `.env.example`: `NEWS_EVENT_SIMILARITY_THRESHOLD`, `STORY_SIMILARITY_THRESHOLD`, `PREFETCH_TRANSLATIONS_INTERVAL_SECONDS`.
- Sin validación de variables de entorno (lecturas directas de `process.env`).
- Sin CI (`.github/workflows/` vacío).
- Sin tags. El primer commit con el formato `vX.Y.Z:` decidirá si es `v1.0.1` o `v1.1.0`.
- Push a `origin/main` de los cambios del entorno cuando se commiteen.

## Tags y releases

| Tag | Commit | Fecha | Release | Probado |
|-----|--------|-------|---------|---------|
| — | — | — | — | — |
