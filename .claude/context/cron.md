# Cron — Sincronización de noticias + notificaciones

FeedFlow ejecuta dos jobs periódicos. Ambos son rutas HTTP protegidas por `Authorization: Bearer $CRON_SECRET`.

## Jobs

### `GET /api/cron/sync` — fetch + IA + cluster

Archivo: `src/app/api/cron/sync/route.ts`. Duración máx: 60s (`maxDuration = 60`).

Ensambla y ejecuta, en este orden:
1. **`SyncArticles.execute()`**
   - Itera fuentes activas.
   - `WorldNewsApiAdapter.fetchPorFuente()` → candidatos.
   - Filtra los no duplicados (por `url @unique`).
   - Para cada nuevo artículo:
     - `GroqClassifier.classify()` → categorías default aplicables (stub vacío si no hay `GROQ_API_KEY`).
     - `TransformersEmbedder.embed(title + description)` → guarda embedding.
     - `MatchArticleToStories.execute()` → añade a stories del usuario cuyo umbral se cumpla.
     - `ClusterArticle.execute()` → asigna `newsEventId` o crea `NewsEvent` (umbral `NEWS_EVENT_SIMILARITY_THRESHOLD`, default 0.72).
     - `AnalyzeArticleSentiment.execute()` → `sentiment` + `framingSummary` vía Groq.
2. **`HealArticles.execute()`** — recorre artículos con datos faltantes (sin categorías, sin cluster, sin sentiment) y completa. Útil para arrancar tras cambiar una dependencia.

Respuesta: `{ sync, heal }` con contadores.

### `GET /api/cron/notifications` — notificaciones por categoría

Archivo: `src/app/api/cron/notifications/route.ts`.

Itera `prisma.user.findMany` y por cada usuario ejecuta `SendNotifications.execute(userId)`:
- Detecta artículos nuevos que encajen con las categorías del usuario.
- Crea `Notification` en BD.
- Envía email vía `ResendEmailAdapter`.

Respuesta: `{ processed, results: [{ userId, status }] }`.

## Disparador — Docker cron sidecar

Configurado en `docker-compose.yml` como servicio `cron` (alpine + curl):

```yaml
cron:
  image: alpine:latest
  environment:
    CRON_SECRET: ${CRON_SECRET:-change-me}
    SYNC_INTERVAL_SECONDS: ${SYNC_INTERVAL_SECONDS:-7200}  # 2h por defecto
  command: while true; do curl -H "Authorization: Bearer $CRON_SECRET" http://app:3000/api/cron/sync; sleep $SYNC_INTERVAL_SECONDS; done
```

**Notas de rate limiting** (ya anotadas en docker-compose): WorldNewsAPI plan gratis = 50 pts/día, cada llamada ≈ 1.2 pts. A 2h → 12 calls/día → ~14.4 pts/fuente. Seguro hasta ~3 fuentes en free.

Las notificaciones NO están planificadas por el sidecar actual — si se quieren diarias, añadir otro servicio cron o un segundo loop que llame `/api/cron/notifications` con su propia cadencia.

## Variables de entorno

| Variable | Qué controla | Default |
|----------|--------------|---------|
| `CRON_SECRET` | auth del endpoint | (obligatorio) |
| `SYNC_INTERVAL_SECONDS` | frecuencia del sidecar | `7200` (2h) |
| `NEWS_EVENT_SIMILARITY_THRESHOLD` | umbral clustering | `0.72` |
| `STORY_SIMILARITY_THRESHOLD` | umbral stories (pasado al caso de uso al crearlo) | `0.55` |
| `GROQ_API_KEY` | clasificación + sentiment | opcional (stub si falta) |
| `WORLDNEWSAPI_API_KEY` | fetch de noticias | obligatorio en prod |
| `RESEND_API_KEY` | email | obligatorio para notifications |

## Ejecutar manualmente (debug)

```bash
curl -H "Authorization: Bearer $CRON_SECRET" http://localhost:3000/api/cron/sync
curl -H "Authorization: Bearer $CRON_SECRET" http://localhost:3000/api/cron/notifications
```

## Al añadir un job nuevo

1. Crea `src/app/api/cron/<name>/route.ts` con el patrón (auth por `CRON_SECRET`, `runtime = "nodejs"`, `dynamic = "force-dynamic"`).
2. Añade un servicio al `docker-compose.yml` (o extiende el sidecar existente) con su propio intervalo.
3. Documenta aquí.
