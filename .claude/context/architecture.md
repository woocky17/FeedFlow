# Arquitectura — Hexagonal en Next.js 16

## Las 4 capas y sus dependencias

```
┌─────────────────────────────────────────────────────────────┐
│  app/  (Next.js App Router: api/** + (pages)/**)            │
│    ↓ instancia adaptadores, inyecta puertos en casos de uso │
│  infrastructure/  (Prisma, Groq, Transformers, WorldNewsAPI,│
│                    Resend, NewsAPI)                         │
│    ↓ implementa puertos de                                  │
│  application/  (casos de uso por feature)                   │
│    ↓ depende de                                             │
│  domain/  (entidades + puertos — TypeScript puro)           │
└─────────────────────────────────────────────────────────────┘
```

**Regla inviolable**: la flecha solo va hacia dentro. `domain` no conoce a nadie. `application` conoce `domain`. `infrastructure` conoce `application` y `domain`. `app` conoce las 3 capas y es quien ensambla todo.

## domain/

- Entidades como clases con `private constructor` + `static create(props)` que valida invariantes (ver `src/domain/story/story.ts`, `src/domain/news-event/news-event.ts`).
- Puertos como interfaces TypeScript:
  - Repositorios: `*-repository.ts` (ej. `story-repository.ts`, `noticia-repository.ts`).
  - Servicios: `embedding-service.ts`, `topic-generator.ts`, `sentiment-analyzer.ts`, `email-sender.ts`, `noticias-fetcher.ts`.
- Sin frameworks, sin Prisma, sin React, sin axios/fetch. Solo TypeScript y tipos nativos.

## application/

Un caso de uso por archivo, agrupado por feature:
- `article/` → `sync-articles.ts`, `heal-articles.ts`, `read-articles.ts`, `search-articles-ai.ts`
- `user/` → `register-user.ts`, `login.ts`, `recover-password.ts`, `delete-account.ts`
- `category/` → `create-custom-category.ts`, `edit-custom-category.ts`, `delete-custom-category.ts`, `assign-category-manually.ts`, `manage-default-categories.ts`
- `favorite/` → `add-favorite.ts`, `get-favorites.ts`, `delete-favorite.ts`
- `source/` → `add-source.ts`, `edit-source.ts`, `delete-source.ts`, `toggle-source.ts`
- `notification/` → `send-notifications.ts`, `mark-notification-read.ts`
- `story/` → `follow-article.ts`, `backfill-story.ts`, `match-article-to-stories.ts`, `list-user-stories.ts`, `get-story-timeline.ts`, `unfollow-story.ts`
- `news-event/` → `cluster-article.ts`, `analyze-article-sentiment.ts`, `analyze-sentiment-batch.ts`, `get-news-event.ts`

Patrón típico:
```ts
export class UseCase {
  constructor(private readonly repo: Port, private readonly otherPort: OtherPort) {}
  async execute(input: InputDto): Promise<OutputDto> { /* orquestación */ }
}
```

DTOs de entrada/salida se definen en el mismo archivo del caso de uso cuando son simples.

## infrastructure/

- `db/prisma/` — un `*-repository-impl.ts` por entidad que implementa el puerto de `domain`. `client.ts` instancia el singleton. `seed.ts` para categorías default.
- `ai/` — `transformers-embedder.ts` (MiniLM local, 384 dims, normalizado L2), `groq-classifier.ts` (categorías), `groq-sentiment-analyzer.ts`, `groq-topic-generator.ts`, `groq-fetch.ts` (cliente bajo nivel).
- `news/` — adaptadores del puerto `ArticleFetcher`: `worldnewsapi/worldnewsapi-adapter.ts` (API con cuota), `rss/rss-adapter.ts` (feeds públicos vía `fast-xml-parser`, cuota ilimitada) y `newsapi/newsapi-adapter.ts` (alternativa no usada). `multi-source-fetcher.ts` es el router que, dado un `Source`, despacha al adapter correcto según `source.kind` (`"worldnews" | "rss"`). El cron inyecta el router, no los adapters sueltos.
- `mail/resend/` — `resend-email-adapter.ts` + `templates.ts`.

## app/

- `api/**/route.ts` — handlers REST; instancian repos+casos de uso y delegan. Nunca lógica de negocio.
- `(pages)/**/page.tsx` — UI; llaman a la API vía `fetch` desde server components o client components.
- `layout.tsx` raíz monta providers globales (theme, toast, auth).
- `page.tsx` raíz es el feed principal (~14KB).

**Nota**: las rutas `/api/cron/sync` y `/api/cron/notifications` se han eliminado. La ingestión periódica vive en `src/worker/` (proceso Node standalone). Sólo `/api/cron/backfill` se mantiene como endpoint HTTP por ser una acción interactiva del admin.

## worker/

`src/worker/` es un entry point Node independiente que se contenedoriza por separado (stage `worker` en `Dockerfile`, servicio `worker` en `docker-compose.yml`). No depende del runtime Next.js.

- `container.ts` — `buildContainer()` factory que ensambla todos los repos+adapters+casos de uso. Reutilizada también por `/api/cron/backfill/route.ts` y los scripts `scripts/run-cron.ts` / `run-sync.ts`.
- `loop.ts` — scheduler con `setTimeout` recursivo, concurrencia 1 por job, jitter inicial, logs JSON-line a stdout, shutdown limpio en `SIGTERM`/`SIGINT`.
- `index.ts` — registra los jobs `sync` (intervalo `SYNC_INTERVAL_SECONDS`) y `notifications` (`NOTIFICATIONS_INTERVAL_SECONDS`).

## Flujo típico — leer artículos filtrados

```
(pages)/page.tsx (Server Component)
  → fetch('/api/articles?category=tech')
    → api/articles/route.ts
      → new ReadArticles(new PrismaArticleRepository(), …).execute({...})
        → repo.findByCategory() → Prisma → PostgreSQL
```

## Flujo cron — /api/cron/sync

Autenticado por `Authorization: Bearer $CRON_SECRET`. Ensambla (ver `src/app/api/cron/sync/route.ts`):

1. `SyncArticles.execute()`:
   - Itera fuentes activas → `WorldNewsApiAdapter.fetchPorFuente()` → nuevos `Article` no duplicados (por `url`).
   - Para cada artículo nuevo:
     - `GroqClassifier.classify()` → asigna categorías por IA (si hay `GROQ_API_KEY`).
     - `TransformersEmbedder.embed(title + description)` → guarda embedding en `articles.embedding`.
     - `MatchArticleToStories` → si similitud ≥ `story.threshold`, añade a `story_articles`.
     - `ClusterArticle` → busca o crea `NewsEvent` con umbral `NEWS_EVENT_SIMILARITY_THRESHOLD` (default 0.72).
     - `AnalyzeArticleSentiment` → `articles.sentiment` y `articles.framingSummary` vía Groq.
2. `HealArticles.execute()` — re-ejecuta clasificación/clustering/sentiment sobre artículos que quedaron sin procesar.

Devuelve `{ sync, heal }` con contadores.

## Flujo cron — /api/cron/notifications

Detecta noticias nuevas relevantes por categoría del usuario, crea `Notification` y envía email por `ResendEmailAdapter`.
