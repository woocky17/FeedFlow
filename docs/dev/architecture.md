# Arquitectura: hexagonal en Next.js 16

## Las 4 capas y sus dependencias

```
┌─────────────────────────────────────────────────────────────┐
│  app/  (Next.js App Router: api/** + (pages)/**)            │
│    ↓ instancia adaptadores, inyecta puertos en casos de uso │
│  infrastructure/  (Prisma, Groq, Transformers, WorldNewsAPI,│
│                    RSS, Resend)                             │
│    ↓ implementa puertos de                                  │
│  application/  (casos de uso por feature)                   │
│    ↓ depende de                                             │
│  domain/  (entidades + puertos, TypeScript puro)            │
└─────────────────────────────────────────────────────────────┘
```

**Regla inviolable**: la flecha solo va hacia dentro. `domain` no conoce a nadie. `application` conoce `domain`. `infrastructure` conoce `application` y `domain`. `app` conoce las 3 capas y es quien ensambla todo.

## domain/

- Entidades como clases con `private constructor` + `static create(props)` que valida invariantes (ver `src/domain/story/story.ts`, `src/domain/news-event/news-event.ts`).
- Puertos como interfaces TypeScript:
  - Repositorios: `*-repository.ts` (ej. `story-repository.ts`, `noticia-repository.ts`).
  - Servicios: `embedding-service.ts`, `topic-generator.ts`, `sentiment-analyzer.ts`, `email-sender.ts`, `noticias-fetcher.ts`, `translation-service.ts`.
- Sin frameworks, sin Prisma, sin React, sin axios/fetch. Solo TypeScript y tipos nativos.

Detalle en `domain.md`.

## application/

Un caso de uso por archivo, agrupado por feature:
- `article/` → `sync-articles.ts`, `heal-articles.ts`, `ingest-article.ts`, `backfill-articles.ts`
- `article-translation/` → `get-article-with-translation.ts`, `prefetch-article-titles.ts`
- `user/` → `register-user.ts`, `login.ts`, `recover-password.ts`, `update-user-language.ts`
- `category/` → `create-custom-category.ts`, `edit-custom-category.ts`, `delete-custom-category.ts`
- `favorite/` → `add-favorite.ts`, `get-favorites.ts`
- `source/` → `add-source.ts`, `edit-source.ts`, `delete-source.ts`, `toggle-source.ts`
- `notification/` → `send-notifications.ts`, `mark-notification-read.ts`, `list-user-notifications.ts`
- `story/` → `follow-article.ts`, `backfill-story.ts`, `match-article-to-stories.ts`, `list-user-stories.ts`, `get-story-timeline.ts`, `unfollow-story.ts`
- `news-event/` → `cluster-article.ts`, `analyze-article-sentiment.ts`, `analyze-sentiment-batch.ts`, `get-news-event.ts`

Patrón típico:
```ts
export class UseCase {
  constructor(private readonly repo: Port, private readonly otherPort: OtherPort) {}
  async execute(input: InputDto): Promise<OutputDto> { /* orquestación */ }
}
```

DTOs de entrada/salida en el mismo archivo del caso de uso cuando son simples.

## infrastructure/

- `db/prisma/`: un `*-repository-impl.ts` por entidad que implementa el puerto de `domain`. `client.ts` instancia el singleton. El seed está en `prisma/seed.ts`.
- `ai/`: `transformers-embedder.ts` (MiniLM local, 384 dims), `groq-classifier.ts`, `groq-sentiment-analyzer.ts`, `groq-topic-generator.ts`, `groq-translator.ts` y `groq-fetch.ts` (cliente de bajo nivel, único punto de llamada a Groq).
- `news/`: adaptadores del puerto `ArticleFetcher`: `worldnewsapi/worldnewsapi-adapter.ts` y `rss/rss-adapter.ts` (`fast-xml-parser`). `multi-source-fetcher.ts` es el router por `source.kind`; el worker y el backfill inyectan el router, no los adaptadores sueltos.
- `mail/resend/`: `resend-email-adapter.ts` + `templates.ts`.

## app/

- `api/**/route.ts`: handlers REST; instancian repos y casos de uso y delegan. Nunca lógica de negocio. Ver `api-routes.md`.
- `(pages)/**/page.tsx` y `page.tsx` raíz: UI. Ver `pages.md`.
- `actions/`: server actions (`set-locale.ts`).
- `layout.tsx` raíz monta los providers globales (tema de Radix, sesión, next-intl).

Las rutas `/api/cron/sync` y `/api/cron/notifications` ya no existen: la ingestión periódica vive en `src/worker/`. Solo queda `/api/cron/backfill` como disparo manual.

## worker/

`src/worker/` es un entry point Node independiente que se contenedoriza por separado (stage `worker` en `Dockerfile`, servicio `worker` en `docker-compose.yml`). No depende del runtime de Next.js.

- `container.ts`: `buildContainer()` ensambla repos, adaptadores y casos de uso. Lo reutilizan `/api/cron/backfill/route.ts` y los scripts `scripts/run-cron.ts` / `run-sync.ts`.
- `loop.ts`: scheduler con `setTimeout` recursivo, concurrencia 1 por job, jitter inicial, logs JSON por stdout (`log(level, data)`) y shutdown limpio en `SIGTERM`/`SIGINT`.
- `index.ts`: registra los jobs. Intervalos, logs y variables en `cron.md`.

## Flujos por capas

Solo el recorrido de clases; lo que hace cada flujo está en las specs.

- **Feed**: `src/app/page.tsx` (client) → `fetch('/api/articles?categoryId=…&sourceId=…')` → `api/articles/route.ts` → Prisma directo (sin caso de uso). Comportamiento: `openspec/specs/article-feed/spec.md`.
- **Job `sync`**: `SyncArticles` → `MultiSourceArticleFetcher` → `IngestArticle` (`GroqClassifier`, `ClusterArticle`, `MatchArticleToStories`, `AnalyzeArticleSentiment`) y después `HealArticles`. Comportamiento: `openspec/specs/article-ingestion/spec.md`.
- **Job `notifications`**: `runNotificationsAllUsers()` → `SendNotifications` → `ResendEmailAdapter`. Comportamiento: `openspec/specs/notifications/spec.md`.
- **Job `prefetchTranslations`**: `PrefetchArticleTitles` → `GroqTranslationService`. Comportamiento: `openspec/specs/translation/spec.md`.
