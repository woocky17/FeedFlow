# Worker: jobs periódicos y backfill manual

Los jobs periódicos corren en un **proceso Node standalone** (`src/worker/`), no como rutas HTTP. La app web solo conserva `POST /api/cron/backfill` como disparo manual.

Qué hace cada job (qué fuentes lee, cómo deduplica, qué repara, a quién notifica, qué traduce) es comportamiento: `openspec/specs/article-ingestion/spec.md`, `openspec/specs/notifications/spec.md` y `openspec/specs/translation/spec.md`.

## Ficheros

- `src/worker/index.ts`: entry point; registra los jobs en el array `jobs` con su `intervalSec`.
- `src/worker/loop.ts`: scheduler (concurrencia 1 por job, jitter inicial, shutdown limpio) y `log(level, data)`.
- `src/worker/container.ts`: `buildContainer()`, la DI compartida con el backfill y los scripts.
- `scripts/run-cron.ts` (`npm run worker:once`) y `scripts/run-sync.ts`.
- Fetcher: `MultiSourceArticleFetcher` (`src/infrastructure/news/multi-source-fetcher.ts`) enruta por `source.kind` a `WorldNewsApiAdapter` (`x-api-key`, consume cuota) o `RssArticleFetcher` (`fast-xml-parser`, RSS 2.0 y Atom, sin cuota). El RSS filtra `from/to` en cliente sobre `pubDate`: solo rinde lo que exponga el feed (20-50 items); para backfill profundo, `worldnews`.

En el worker no hay `next/headers`, `auth()` ni `next-intl/server`.

## Jobs

| Job | Caso de uso | Intervalo | Se registra |
|-----|-------------|-----------|-------------|
| `sync` | `SyncArticles` y después `HealArticles` | `SYNC_INTERVAL_SECONDS` (`7200`, 2 h) | siempre |
| `notifications` | `runNotificationsAllUsers()` → `SendNotifications` | `NOTIFICATIONS_INTERVAL_SECONDS` (`86400`, 24 h) | siempre |
| `prefetchTranslations` | `PrefetchArticleTitles` | `PREFETCH_TRANSLATIONS_INTERVAL_SECONDS` (`600`, 10 min) | solo con `GROQ_API_KEY` (si no, `container.prefetchArticleTitles` es `null`) |

## Logs

Nada de `console.log` suelto en el worker: todo pasa por `log(level, data)` de `src/worker/loop.ts`, una línea JSON por stdout con `event`:

```json
{"level":"info","ts":"…","event":"boot","message":"worker starting"}
{"level":"info","ts":"2026-04-27T10:30:00Z","job":"sync","event":"start"}
{"level":"info","ts":"2026-04-27T10:30:42Z","job":"sync","event":"done","durationMs":42013,"result":{"synced":40,"errors":2,"heal":{"classified":0,"clustered":0}}}
```

Arranque correcto: `"event":"boot"` y luego `start`/`done` por job, sin `"event":"failed"` ni `"fatal"`. En Docker: `docker compose logs -f worker`. `prefetchTranslations` deja en `result` `scanned`, `translated`, `skipped` y `errors`.

## Shutdown

`SIGTERM` / `SIGINT` → espera a que terminen los jobs en vuelo, cierra Prisma y sale con código 0. `docker compose stop worker` debería tardar menos de 10 s salvo que un sync esté en mitad de un fetch.

## Docker

Servicio `worker` en `docker-compose.yml`:

```yaml
worker:
  build: { context: ., target: worker }
  restart: unless-stopped
  depends_on: [db]
  environment:
    DATABASE_URL: postgresql://feedflow:feedflow@db:5432/feedflow
    GROQ_API_KEY, GROQ_MODEL, RESEND_API_KEY, NEWS_EVENT_SIMILARITY_THRESHOLD, STORY_SIMILARITY_THRESHOLD,
    SYNC_INTERVAL_SECONDS, NOTIFICATIONS_INTERVAL_SECONDS, PREFETCH_TRANSLATIONS_INTERVAL_SECONDS,
    BACKFILL_MAX_DAYS
  volumes:
    - xenova_cache:/app/node_modules/@xenova/transformers/.cache
```

`BACKFILL_MAX_DAYS` solo está definido en el servicio `worker`, pero el backfill HTTP corre en `app`: en Docker, `/api/cron/backfill` usa el default `3` (bug apuntado en `docs/estado.md`).

No depende de `app`: si la web cae, la ingesta sigue. Comparte el volumen `xenova_cache` con `app` para no descargar MiniLM dos veces (contenedor sin root; no cambiar la ruta sin revisar el `Dockerfile`).

**Cuota de WorldNewsAPI**: plan free = 50 puntos/día, ~1,2 por llamada. Con sync cada 2 h → 12 llamadas/día → ~14,4 puntos por fuente: da para unas 3 fuentes WORLDNEWS. Las RSS no consumen cuota.

## `POST /api/cron/backfill`

Archivo: `src/app/api/cron/backfill/route.ts` (`maxDuration` 60 s). No lo dispara el worker; reutiliza `buildContainer()`. Se autentica con `Authorization: Bearer $CRON_SECRET`. Parámetros y límites: `openspec/specs/article-ingestion/spec.md`.

```bash
curl -X POST \
  -H "Authorization: Bearer $CRON_SECRET" \
  -H "Content-Type: application/json" \
  -d '{"daysBack":2}' \
  http://localhost:3000/api/cron/backfill
```

## Variables de entorno

| Variable | Qué controla | Default |
|----------|--------------|---------|
| `DATABASE_URL` | conexión Prisma | obligatoria |
| `SYNC_INTERVAL_SECONDS` | cadencia del job `sync` | `7200` |
| `NOTIFICATIONS_INTERVAL_SECONDS` | cadencia del job `notifications` | `86400` |
| `PREFETCH_TRANSLATIONS_INTERVAL_SECONDS` | cadencia del job `prefetchTranslations` | `600` |
| `NEWS_EVENT_SIMILARITY_THRESHOLD` | umbral de agrupación en eventos | `0.72` |
| `STORY_SIMILARITY_THRESHOLD` | umbral de las historias | `0.55` |
| `GROQ_API_KEY` | piezas de Groq (ver `ai-pipeline.md`) | opcional |
| `GROQ_MODEL` | modelo de Groq | `openai/gpt-oss-120b` |
| `RESEND_API_KEY` | email de las notificaciones | necesaria para enviar emails |
| `BACKFILL_MAX_DAYS` | tope de días de `/api/cron/backfill` (en `docker-compose.yml` solo está en `worker`, no en `app`, que es donde corre el backfill) | `3` |
| `CRON_SECRET` | auth de `/api/cron/backfill` | obligatoria |

Toda variable nueva va a `.env.example` y a este archivo (o a `ai-pipeline.md` si es de IA), con default explícito en el código (`Number(process.env.X ?? 600)`).

## Ejecutar sin Docker

```bash
npm run worker          # bucle persistente
npm run worker:once     # un sync + heal y sale (scripts/run-cron.ts, logs en texto plano)
```

## Al añadir un job

1. Si es periódico → caso de uso en `application/<feature>/` y registro en `src/worker/index.ts` dentro del array `jobs` con su `intervalSec` (por env con default).
2. Si es interactivo (un admin lo dispara con parámetros) → ruta `/api/cron/<name>/route.ts` que use `buildContainer()` y el patrón service-to-service de `api-routes.md`.
3. Documenta aquí el job y su variable; el comportamiento va en un change de OpenSpec.
