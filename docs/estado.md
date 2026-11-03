# Estado de FeedFlow

- **Actualizado**: 2026-11-03
- **Versión**: 1.0.3 (`package.json`)
- **Commit**: `v1.0.3` · rama `main` (con push). Revisado por `ff-reviewer` sin bloqueantes; sus hallazgos importantes, arreglados.
- **Probado**: tests (16 ficheros, 72), lint, tsc y build en verde. En el navegador con el admin de prueba: feed, historias, categorías, fuentes, notificaciones (`GET /api/notifications` 200), ajustes, admin y evento, sin errores de consola. Sin probar: storybook y worker contra la BD.

## Dónde estamos

v1.0.3 (despachado con `/pendientes`):

- **Notificaciones**: nueva `GET /api/notifications` (caso de uso `ListUserNotifications`, como máximo 100, más recientes primero, vía `NotificationRepository.findRecentByUser`). La página distingue error de carga de lista vacía.
- **i18n**: textos fijos en inglés pasados a next-intl en `/admin`, `/categories`, `/events/[id]`, `/stories/[id]` y en `Button`, `NotificationItem`, `EventSourcesPill`, `SourceForm`, `CategoryForm`. `messages/es.json` y `en.json` con las mismas claves. Fechas con el idioma activo.
- **`ArticleRepository.findById`**: `GetArticleWithTranslation` ya no recorre `findAll()`.
- **Usuarios de prueba**: `prisma/seed.ts` crea `TEST_USER_*` y `TEST_ADMIN_*` desde `.env` (hash como el registro, valida el email, no imprime contraseñas). Ver "Probar" en `CLAUDE.md`.
- **Agentes**: trampas nuevas (junction de Turbopack en `.next/dev`, Git Bash msys) en `ff-debugger`, `ff-implementer` y `ff-reviewer`.
- **Datos locales (no van en git)**: El País, 20 Minutos y Google News (España) pasadas a `language = ES`; `test@feedflow.local` recreado con la contraseña de `.env`.

v1.0.2 (`e0b3d6a`): `src/application` sin Prisma ni infraestructura, fuera métodos de puertos sin uso, `PREFETCH_TRANSLATIONS_INTERVAL_SECONDS` en docker-compose.
v1.0.1 (`e76d2f0`): limpieza de dependencias, Storybook solo catálogo, código muerto y docs desfasadas.

## Siguiente paso (pendiente)

1. `npm run storybook` y comprobar que el catálogo carga (los componentes con texto propio necesitan el provider de next-intl, que da `.storybook/preview.tsx`).
2. `npm run worker:once` con la BD local y comprobar que `sync` (heal + sentiment) termina con `"event":"done"`. Llama a Groq y a las fuentes de noticias reales.
3. Probar la app en inglés (selector de idioma) en admin, evento e historias.

Agente: ninguno, lo hace el usuario. Si algo falla, `ff-debugger`.

## Otros pendientes

- `Source.language` tiene `@default(EN)` en `prisma/schema.prisma`: las fuentes en español creadas sin idioma quedan como `EN` (era la causa del badge). Valorar exigir el idioma al crear la fuente o cambiar el default.
- El admin no tiene enlace a `/admin` en la navegación (¿intencionado?).
- Sin sesión, las APIs del matcher de `src/proxy.ts` responden 307 al login en vez de 401 (callback `authorized` de `src/lib/auth.ts`; afecta a todas).
- Rutas API que usan Prisma o repos sin caso de uso: `src/app/api/articles/route.ts`, `src/app/api/admin/categories/**`, `src/app/api/favorites/[id]`. Además buscan un artículo por id con Prisma directo `src/app/api/stories/route.ts:23` y `src/infrastructure/db/prisma/article-embedding-repository-impl.ts:9`.
- Recuperación de contraseña a medias: `RecoverPassword` solo busca el usuario y envía el email; no hay flujo que cambie la contraseña.
- Textos que siguen en inglés: mensajes de error de la API que la UI muestra tal cual (`data.error`), "Failed to follow story" en `src/lib/hooks/use-followed-stories.ts`, y el `description` de `src/app/layout.tsx` solo en español.
- `src/application/article/heal-articles.ts` usa `console.error` en la capa de aplicación.
- `ArticleRepository` importa el tipo `SentimentResult` de `@/domain/news-event` (acoplamiento entre módulos del dominio, sin ciclo).
- Restos extraneous de npm (`@emnapi/*`, `@napi-rs/wasm-runtime`, `@tybys/wasm-util`): se van con `npm ci` sin procesos abiertos.
- Se mantiene a propósito: sin CI (`.github/workflows/` vacío), sin validación de variables de entorno y sin tags.

## Tags y releases

| Tag | Commit | Fecha | Release | Probado |
|-----|--------|-------|---------|---------|
| — | — | — | — | — |
