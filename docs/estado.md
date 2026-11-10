# Estado de FeedFlow

- **Actualizado**: 2026-11-10
- **Versión**: 1.0.5 (`package.json`)
- **Commit**: `v1.0.5` · rama `main`, sin push. La migración a OpenSpec está sin commitear.
- **Probado v1.0.5**: tests (18 ficheros, 85) y tsc en verde. Sin probar en real contra Groq.
- **Probado v1.0.4**: tests (18 ficheros, 85), tsc y lint de lo tocado en verde; seed ejecutado contra la BD local (17 fuentes activas: 16 RSS + 1 WORLDNEWS). Sin probar: un `worker:once` con las fuentes nuevas.
- **Probado v1.0.3**: tests (16 ficheros, 72), lint, tsc y build en verde. En el navegador con el admin de prueba: feed, historias, categorías, fuentes, notificaciones (`GET /api/notifications` 200), ajustes, admin y evento, sin errores de consola. Sin probar: storybook y worker contra la BD.

## Dónde estamos

Migración a OpenSpec hecha y sin commitear: `openspec/` con `config.yaml` y 10 changes `baseline-*` (article-feed, article-ingestion, auth, bias-radar, categories, favorites, notifications, sources, story-timeline, translation) que describen el comportamiento actual sin consagrar los bugs de la lista de abajo. Las docs operativas pasaron de `.claude/context/` a `docs/dev/`, las reglas comunes a `AGENTS.md` (con `CLAUDE.md` solo para lo propio de Claude) y los agentes y el hook trabajan con changes de OpenSpec. `openspec/specs/` sigue vacío hasta archivar las baselines.

v1.0.5: Groq retiró `llama-3.3-70b-versatile` (404 en todas las llamadas). El modelo sale de `GROQ_MODEL` (default `openai/gpt-oss-120b`) y solo se define en `fetchGroqChat`, que además manda `reasoning_effort: "low"` para que el razonamiento no se coma `max_tokens`.

v1.0.4: más fuentes sin API key (el usuario descartó las APIs que piden registro: GNews, NewsData, Currents, TheNewsAPI, Guardian).

- **Seed**: 13 feeds RSS nuevos en `demoRssSources` (elDiario.es, El Mundo, ABC, La Vanguardia, Europa Press, Xataka, El Confidencial, BBC News (RSS), The Guardian, NPR, Al Jazeera, NYT, Google News US). RTVE descartado (feeds de 2022). La BBC va como "BBC News (RSS)" porque el seed deduplica por nombre y ya hay una fuente WORLDNEWS "BBC News".
- **Mapper RSS/Atom**: `pickText` en todos los campos de texto y fechas (nodos con atributos llegan como objeto de `fast-xml-parser`); el mapeo va dentro del try por item, así que un item raro ya no tumba la fuente.
- **Candidata sin hacer**: adaptador GDELT DOC 2.0 (sin clave, 1 petición cada 5 s; necesita `kind` nuevo en `Source`).

v1.0.3 (despachado con `/pendientes`):

- **Notificaciones**: nueva `GET /api/notifications` (caso de uso `ListUserNotifications`, como máximo 100, más recientes primero, vía `NotificationRepository.findRecentByUser`). La página distingue error de carga de lista vacía.
- **i18n**: textos fijos en inglés pasados a next-intl en `/admin`, `/categories`, `/events/[id]`, `/stories/[id]` y en `Button`, `NotificationItem`, `EventSourcesPill`, `SourceForm`, `CategoryForm`. `messages/es.json` y `en.json` con las mismas claves. Fechas con el idioma activo.
- **`ArticleRepository.findById`**: `GetArticleWithTranslation` ya no recorre `findAll()`.
- **Usuarios de prueba**: `prisma/seed.ts` crea `TEST_USER_*` y `TEST_ADMIN_*` desde `.env` (hash como el registro, valida el email, no imprime contraseñas). Ver "Probar" en `AGENTS.md`.
- **Agentes**: trampas nuevas (junction de Turbopack en `.next/dev`, Git Bash msys) en `ff-debugger`, `ff-implementer` y `ff-reviewer`.
- **Datos locales (no van en git)**: El País, 20 Minutos y Google News (España) pasadas a `language = ES`; `test@feedflow.local` recreado con la contraseña de `.env`.

v1.0.2 (`e0b3d6a`): `src/application` sin Prisma ni infraestructura, fuera métodos de puertos sin uso, `PREFETCH_TRANSLATIONS_INTERVAL_SECONDS` en docker-compose.
v1.0.1 (`e76d2f0`): limpieza de dependencias, Storybook solo catálogo, código muerto y docs desfasadas.

## Siguiente paso (pendiente)

1. **OpenSpec**: el usuario revisa las 10 baselines (`openspec/changes/baseline-*`), las archiva con `/openspec-archive-change` y hace commit. Después, un change por cada bug de la lista de abajo, empezando por el de `CRON_SECRET`.
2. `npm run storybook` y comprobar que el catálogo carga (los componentes con texto propio necesitan el provider de next-intl, que da `.storybook/preview.tsx`).
3. **Groq responde 401** con la `GROQ_API_KEY` de `.env` (clave caducada o revocada): renovarla en console.groq.com y repetir `npm run worker:once` (salida en `logs/worker.log`). Esperado: `[heal]` con `classified` y `sentimentAnalyzed` > 0. Pasada del 2026-11-03: `[sync] synced=80 errors=0`, los 80 artículos agrupados en eventos (embeddings locales bien), `[heal]` ejecuta las consultas nuevas de la tanda C (`sentimentSkipped: 40` = límite de 40), pero ningún artículo clasificado ni con sentimiento por el 401; `updateSentiment` sigue NO VERIFICADO en real.
4. Probar la app en inglés (selector de idioma) en admin, evento e historias.

Agente: ninguno, lo hace el usuario. Si algo falla, `ff-debugger`.

## Otros pendientes

- `Source.language` tiene `@default(EN)` en `prisma/schema.prisma`: las fuentes en español creadas sin idioma quedan como `EN` (era la causa del badge). Valorar exigir el idioma al crear la fuente o cambiar el default.
- El admin no tiene enlace a `/admin` en la navegación (¿intencionado?).
- Rutas API que usan Prisma o repos sin caso de uso: `src/app/api/articles/route.ts`, `src/app/api/admin/categories/**`, `src/app/api/favorites/[id]`. Además buscan un artículo por id con Prisma directo `src/app/api/stories/route.ts:23` y `src/infrastructure/db/prisma/article-embedding-repository-impl.ts:9`.
- Textos que siguen en inglés: mensajes de error de la API que la UI muestra tal cual (`data.error`), "Failed to follow story" en `src/lib/hooks/use-followed-stories.ts`, y el `description` de `src/app/layout.tsx` solo en español.
- `src/application/article/heal-articles.ts` usa `console.error` en la capa de aplicación.
- `ArticleRepository` importa el tipo `SentimentResult` de `@/domain/news-event` (acoplamiento entre módulos del dominio, sin ciclo).
- Restos extraneous de npm (`@emnapi/*`, `@napi-rs/wasm-runtime`, `@tybys/wasm-util`): se van con `npm ci` sin procesos abiertos.
- Se mantiene a propósito: sin CI (`.github/workflows/` vacío), sin validación de variables de entorno y sin tags.

## Bugs detectados al escribir las specs (pendientes de un change cada uno)

- **Seguridad (el primero que se arreglará):** el backfill acepta `Bearer undefined` si no hay `CRON_SECRET` (`src/app/api/cron/backfill/route.ts:19`).
- La recuperación de contraseña está a medias: `RecoverPassword` solo busca el usuario y envía el email, no guarda el token ni hay paso de cambio de contraseña; `passwordRecoveryEmailTemplate` está importado pero sin usar (`src/app/api/auth/recover-password/route.ts:5`).
- `/events/[id]` y `/api/events/[id]` son públicos (fuera del matcher de `src/proxy.ts`).
- Sin sesión, las APIs bajo el matcher de `src/proxy.ts` (favoritos, notificaciones y admin) responden 307 a `/login` en vez de 401/403 (callback `authorized`, `src/lib/auth.ts:41`; afecta a todas).
- Un 402 de WorldNews también salta las fuentes RSS que quedan en el ciclo (`src/application/article/sync-articles.ts:36`, backfill en `src/application/article/backfill-articles.ts:73`).
- El login ignora `callbackUrl` (`src/components/organisms/login-form.tsx:36`).
- El mínimo de 8 caracteres en la contraseña solo existe en el HTML (`src/components/organisms/register-form.tsx:81`).
- Un usuario normal ve la página `/admin`.
- `BACKFILL_MAX_DAYS` solo está en el servicio `worker` de `docker-compose.yml`, pero `/api/cron/backfill` corre en `app`: en Docker el tope siempre es el default `3`.
- En el backfill, un `daysBack` no numérico da NaN y `sourceIds` no se valida (`src/app/api/cron/backfill/route.ts:33`, `:36`).
- Las notificaciones no se generan nunca, porque solo usan categorías propias y el clasificador solo asigna las de por defecto (`src/application/notification/send-notifications.ts:20`, `src/infrastructure/ai/groq-classifier.ts:66`). Además repiten artículos, un fallo de email corta las de ese usuario y los textos no pasan por next-intl.
- El clasificador cachea las categorías por defecto mientras vive el proceso (`src/infrastructure/ai/groq-classifier.ts:64`).
- Una fuente WorldNews con `apiKey` vacía rompe `findAll` (`src/infrastructure/db/prisma/source-repository-impl.ts:27`).
- `/sources` usa la API de admin (`src/app/(pages)/sources/page.tsx:40`).
- La UI no comprueba `res.ok` al activar o borrar (`src/app/(pages)/sources/page.tsx:52-58`, `:67`; `src/app/(pages)/categories/page.tsx:82`; `src/app/(pages)/admin/page.tsx:102`, `:144`).
- La API de admin devuelve la `apiKey` completa (`src/app/api/admin/sources/route.ts:18`).
- La pastilla «N fuentes» cuenta artículos (`src/app/api/articles/route.ts:47-55`).
- El feed sin sesión traduce siempre a `es` (`src/app/api/articles/route.ts:14`).
- Sin sesión no hay pastillas de categoría (401).
- El filtro de favoritos solo mira los artículos cargados.
- `/api/articles` no tiene límite (`src/app/api/articles/route.ts:26`).
- Favoritos con un id inexistente devuelven 400 con el mensaje de Prisma (`src/app/api/favorites/route.ts:49`).
- Traducción: un artículo inexistente da 500; sin descripción, se retraduce siempre; `providerLabel` fijo en `groq:llama-3.3-70b` (`src/application/article-translation/get-article-with-translation.ts:28`, `prefetch-article-titles.ts:33`); el endpoint no se usa en la UI.
- Categorías: los duplicados se controlan distinguiendo mayúsculas y sin recortar espacios; el alta de admin no controla duplicados (`@@unique` no los impide con `userId` nulo).
- `canBeOverriddenBy` (MANUAL/AUTO) no se usa en ningún flujo (`src/domain/category/asignacion-categoria-entity.ts:30`).

## Tags y releases

| Tag | Commit | Fecha | Release | Probado |
|-----|--------|-------|---------|---------|
| — | — | — | — | — |
