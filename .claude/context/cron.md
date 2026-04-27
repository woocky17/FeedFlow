# Worker — Sincronización de noticias + notificaciones

FeedFlow ejecuta los jobs periódicos en un **proceso Node standalone** (`src/worker/`), no como rutas HTTP. La app web (`apps/web`) ya no tiene endpoints de cron salvo `/api/cron/backfill`, que es disparo manual interactivo del admin.

## Fetchers: enrutado por `Source.kind`

El sync y el backfill reciben un único `ArticleFetcher` que en realidad es un `MultiSourceArticleFetcher` (`src/infrastructure/news/multi-source-fetcher.ts`). Inspecciona `source.kind` y delega:

- `kind = "worldnews"` → `WorldNewsApiAdapter` (API REST con `x-api-key`, consume cuota, soporta `from/to/limit`).
- `kind = "rss"` → `RssArticleFetcher` (feed HTTP público parseado con `fast-xml-parser`; soporta RSS 2.0 y Atom). Sin cuota, sin auth. El filtrado por `from/to` es client-side sobre `pubDate`/`updated` — sólo rinde lo que el feed exponga (típicamente últimos 20-50 items). Para backfill profundo, usar `kind=worldnews`.

## Worker

Archivo entry point: `src/worker/index.ts`. Loop: `src/worker/loop.ts`. DI compartida: `src/worker/container.ts`.

Dos jobs registrados, cada uno con su propio intervalo y concurrencia 1 (no se solapa consigo mismo):

### `sync`
- `SyncArticles.execute()` → itera fuentes activas, fetch (worldnews o rss), `IngestArticle` por artículo (dedup + classify + cluster + story match + sentiment).
- `HealArticles.execute()` → completa los huérfanos (sin categoría, sin cluster, sin sentiment) en ventana de 7 días.
- Intervalo: `SYNC_INTERVAL_SECONDS` (default `7200` = 2h).

### `notifications`
- Itera `prisma.user.findMany` y por cada usuario ejecuta `SendNotifications.execute(userId)` (detecta artículos nuevos relevantes a sus categorías, crea fila en `Notification`, envía email vía `ResendEmailAdapter`).
- Intervalo: `NOTIFICATIONS_INTERVAL_SECONDS` (default `86400` = 24h).

### Logs

Cada iteración imprime JSON line a stdout:

```json
{"level":"info","ts":"2026-04-27T10:30:00Z","job":"sync","event":"start"}
{"level":"info","ts":"2026-04-27T10:30:42Z","job":"sync","event":"done","durationMs":42013,"result":{"synced":40,"errors":2,"heal":{"classified":0,"clustered":0}}}
```

Capturados por Docker — `docker compose logs -f worker`.

### Shutdown

`SIGTERM` / `SIGINT` → el worker espera a que terminen los jobs en vuelo, cierra Prisma y sale con código 0. `docker compose stop worker` debería tardar <10 s salvo que un sync esté en mitad de un fetch.

## Disparador

Servicio `worker` en `docker-compose.yml`:

```yaml
worker:
  build: { context: ., target: worker }
  depends_on: [db]
  environment:
    DATABASE_URL: postgresql://feedflow:feedflow@db:5432/feedflow
    GROQ_API_KEY, RESEND_API_KEY, NEWS_EVENT_SIMILARITY_THRESHOLD, STORY_SIMILARITY_THRESHOLD,
    SYNC_INTERVAL_SECONDS, NOTIFICATIONS_INTERVAL_SECONDS, BACKFILL_MAX_DAYS
  volumes:
    - xenova_cache:/app/node_modules/@xenova/transformers/.cache
```

No depende de `app` — si la web cae, la ingestión sigue. Comparte el volumen `xenova_cache` con `app` para no descargar el modelo MiniLM dos veces.

**Notas de rate limiting**: WorldNewsAPI plan free = 50 pts/día, ~1.2 pts/call. A 2h → 12 calls/día → ~14.4 pts/fuente. Seguro hasta ~3 fuentes worldnews. Las RSS no consumen cuota.

## `POST /api/cron/backfill` — bootstrap histórico (sigue como endpoint HTTP)

Archivo: `src/app/api/cron/backfill/route.ts`. Duración máx: 60s. **No** lo dispara el worker — es manual, usa `buildContainer()` para reusar la misma DI.

Body JSON opcional:

```json
{ "daysBack": 3, "sourceIds": ["<source-id>"] }
```

- `daysBack` — clampado a `[1, BACKFILL_MAX_DAYS]` (env, default `3`).
- `sourceIds` — si se omite, backfillea todas las fuentes activas.

Ejemplo:

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
| `DATABASE_URL` | conexión Prisma | obligatorio |
| `SYNC_INTERVAL_SECONDS` | cadencia job sync | `7200` (2h) |
| `NOTIFICATIONS_INTERVAL_SECONDS` | cadencia job notifications | `86400` (24h) |
| `NEWS_EVENT_SIMILARITY_THRESHOLD` | umbral clustering | `0.72` |
| `STORY_SIMILARITY_THRESHOLD` | umbral stories | `0.55` |
| `GROQ_API_KEY` | clasificación + sentiment | opcional (stub si falta) |
| `RESEND_API_KEY` | email para notifications | obligatorio para notifications |
| `BACKFILL_MAX_DAYS` | tope de días en `/api/cron/backfill` | `3` |
| `CRON_SECRET` | auth de `/api/cron/backfill` | obligatorio |

## Ejecutar manualmente (sin Docker)

```bash
npm run worker          # loop persistente
npm run worker:once     # un solo sync + heal y sale
```

## Al añadir un job nuevo

1. Si es periódico → añadir un caso de uso (`application/<feature>/...`) y registrarlo en `src/worker/index.ts` dentro del array `jobs` con su `intervalSec`.
2. Si es interactivo (un admin lo dispara con parámetros) → exponerlo como ruta `/api/cron/<name>/route.ts` que use `buildContainer()`.
3. Documentar aquí.
