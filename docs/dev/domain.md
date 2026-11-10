# Dominio: entidades y puertos

> Carpeta: `src/domain/`. **TypeScript puro**. Cualquier `import` desde `prisma`, `next`, `react` aquí es un bug. Reglas de capa en `src/domain/AGENTS.md`.

Las reglas de negocio (unicidades, umbrales…) son comportamiento y están en `openspec/specs/<cap>/spec.md`. Aquí solo la forma del código.

## Patrón de entidad

```ts
export interface EntityProps { /* ... */ }

export class Entity {
  readonly prop: Type;
  private constructor(props: EntityProps) { /* asigna */ }
  static create(props: EntityProps): Entity {
    // validar invariantes; lanzar Error si no se cumplen
    return new Entity(props);
  }
}
```

Ejemplos fieles: `src/domain/story/story.ts`, `src/domain/news-event/news-event.ts`.

## Entidades por feature

### `shared/`
- `language.ts`: `Language = "es" | "en"`, `SUPPORTED_LANGUAGES`, `DEFAULT_LANGUAGE`, `isLanguage`, `assertLanguage`.

### `user/`
- `user-entity.ts` → `User` (id, email, passwordHash, role, language, createdAt). `UserRole = "user" | "admin"` (en Prisma es el enum `USER | ADMIN`; lo traduce `user-repository-impl.ts`).
- Puerto: `usuario-repository.ts` (nombre legacy): `findByEmail`, `findById`, `save`, `updateLanguage`.

### `source/`
- `source-entity.ts` → `Source` (id, name, baseUrl, apiKey, kind, language, active, createdAt). `SourceKind = "worldnews" | "rss"` (en Prisma `WORLDNEWS | RSS`); `language` es un `Language`.
- Puerto: `source-repository.ts`.

### `article/`
- `noticia-entity.ts` → `Article` (id, title, url, description, image, sourceId, language, publishedAt, savedAt, embedding, newsEventId, sentiment, framingSummary).
- Puertos: `noticia-repository.ts` (`ArticleRepository`), `noticias-fetcher.ts` (`ArticleFetcher`).
- `ArticleRepository`: `save`, `findAll`, `findById` (`Article | null`), `findByCategory`, `existsByUrl`; para el heal, `findUncategorizedSince`, `findUnclusteredSince` y `findWithoutSentimentSince`, que reciben `(since, limit)` y devuelven `ArticleSummary` (`id`, `title`, `description`); `updateSentiment(articleId, SentimentResult)` guarda `sentiment` y `framingSummary`.

### `article-translation/`
- `article-translation-entity.ts` → `ArticleTranslation` (articleId, targetLang, title, description, provider, createdAt).
- Puertos: `article-translation-repository.ts` (`ArticleTranslationRepository`), `translation-service.ts` (`TranslationService`).

### `category/`
- `categoria-entity.ts` → `Categoria` (id, name, type: `DEFAULT | CUSTOM`, userId?, createdAt).
- `asignacion-categoria-entity.ts` → `CategoryAssignment` (articleId, categoryId, userId?, origin: `AUTO | MANUAL`, assignedAt).
- `CategoryAssignment.canBeOverriddenBy`: MANUAL no la sobrescribe AUTO (hoy sin uso).
- Puertos: `categoria-repository.ts`, `asignacion-categoria-repository.ts`.

### `favorite/`
- `favorito-entity.ts` → `Favorito` (id, userId, articleId, createdAt).
- Puerto: `favorito-repository.ts`.

### `notification/`
- `notificacion-entity.ts` → `Notificacion` (id, userId, message, read, createdAt).
- Puertos: `notificacion-repository.ts` (`NotificationRepository`: `add`, `findByUser`, `findRecentByUser(userId, limit)`, `markAsRead`), `email-sender.ts` (`send(to, subject, body)`).

### `story/`
- `story.ts` → `Story` (id, userId, name, summary, embedding, sourceArticleId, threshold, active, createdAt).
- `story-article.ts` → `StoryArticle` (storyId, articleId, similarity, addedAt).
- Puertos: `story-repository.ts`, `article-embedding-repository.ts`, `embedding-service.ts` (`embed(text)`, `embedMany(texts)` y la función pura `buildEmbeddingText`), `topic-generator.ts`.

### `news-event/`
- `news-event.ts` → `NewsEvent` (id, title, embedding, firstSeenAt, lastSeenAt, createdAt).
- Puertos: `news-event-repository.ts`, `sentiment-analyzer.ts`.

## Convenciones de nombres

- Mezcla histórica: los ficheros de entidades antiguas están en español (`noticia-entity`, `categoria-entity`, `usuario-repository`). Los módulos nuevos (`story`, `news-event`, `article-translation`) están en inglés. Al añadir a un módulo existente, mantén su idioma.
- Cada feature tiene un `index.ts` que re-exporta la API pública del módulo.

## Al añadir o cambiar una entidad

1. Modifica o crea la entidad y sus validaciones en su archivo.
2. Añade o actualiza el puerto (`*-repository.ts` o servicio).
3. Actualiza el `index.ts` del feature.
4. Crea o actualiza la implementación Prisma en `infrastructure/db/prisma/`.
5. Si hay campos nuevos persistidos → `prisma/schema.prisma` + `npm run db:migrate` (ver `database.md`).
6. Si el cambio altera el comportamiento, va en un change de OpenSpec; si solo cambia la forma, actualiza este archivo.
