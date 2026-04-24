# Dominio — Entidades, VOs y puertos

> Carpeta: `src/domain/`. **TypeScript puro**. Cualquier `import` desde `prisma`, `next`, `react` aquí es un bug.

## Patrón de entidad

Todas las entidades siguen el mismo estilo:

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

### `user/` — Usuario
- `user-entity.ts` → `User` (id, email, passwordHash, role, createdAt). Role: `USER | ADMIN`.
- Puerto: `usuario-repository.ts` (nombre legacy en español) — `findByEmail`, `findById`, `save`, `delete`, `updatePassword`.

### `source/` — Fuente de noticias
- `source-entity.ts` → `Source` (id, name, baseUrl, apiKey, active, createdAt).
- Puerto: `source-repository.ts`.

### `article/` — Artículo de noticia
- `noticia-entity.ts` → `Noticia` (id, title, url, description, image, sourceId, publishedAt, savedAt, embedding, newsEventId, sentiment, framingSummary).
- Puertos: `noticia-repository.ts`, `noticias-fetcher.ts` (fetchPorFuente).
- Invariante clave: `url` es única globalmente (`@unique` en Prisma). Si ya existe, no se guarda de nuevo.

### `category/` — Categoría + Asignación
- `categoria-entity.ts` → `Categoria` (id, name, type: `DEFAULT | CUSTOM`, userId?, createdAt). Default: `userId = null`. Custom: requiere `userId`.
- `asignacion-categoria-entity.ts` → `AsignacionCategoria` (articleId, categoryId, userId?, origin: `AUTO | MANUAL`, assignedAt). **Invariante**: si `origin = MANUAL`, no puede ser sobrescrita por un flujo `AUTO`.
- Puertos: `categoria-repository.ts`, `asignacion-categoria-repository.ts`.

### `favorite/` — Favoritos
- `favorito-entity.ts` → `Favorito` (id, userId, articleId, createdAt).
- Invariante: `(userId, articleId)` único.
- Puerto: `favorito-repository.ts`.

### `notification/` — Notificaciones in-app + email
- `notificacion-entity.ts` → `Notificacion` (id, userId, message, read, createdAt).
- Puertos: `notificacion-repository.ts`, `email-sender.ts` (`send(to, subject, body)`).

### `story/` — Story Timeline (seguimiento de un tema)
- `story.ts` → `Story` (id, userId, name, summary, embedding, sourceArticleId, threshold=0.55, active, createdAt). Invariantes: name no vacío, userId y sourceArticleId requeridos, `threshold ∈ [0,1]`.
- `story-article.ts` → `StoryArticle` (storyId, articleId, similarity, addedAt).
- Puertos: `story-repository.ts`, `article-embedding-repository.ts`, `embedding-service.ts` (`embed(text)`, `embedMany(texts)`), `topic-generator.ts`.

### `news-event/` — News Bias Radar (clustering cross-fuente)
- `news-event.ts` → `NewsEvent` (id, title, embedding, firstSeenAt, lastSeenAt, createdAt). Invariante: title no vacío.
- Puertos: `news-event-repository.ts`, `sentiment-analyzer.ts`.

## Convenciones de nombres

- Mezcla histórica: archivos de entidades antiguas están en **español** (`noticia-entity`, `categoria-entity`, `usuario-repository`). Los nuevos módulos (`story`, `news-event`) están en **inglés**. Al añadir a un módulo existente, mantén su idioma.
- Cada feature tiene un `index.ts` que re-exporta la API pública del módulo.

## Al añadir/cambiar una entidad

1. Modifica/crea la entidad + validaciones en su archivo.
2. Añade/actualiza el puerto (`*-repository.ts` o servicio).
3. Actualiza el `index.ts` del feature.
4. Crea/actualiza la implementación Prisma en `infrastructure/db/prisma/`.
5. Si hay campos nuevos persistidos → `prisma/schema.prisma` + `npm run db:migrate`.
6. Actualiza este archivo si el patrón/invariante es nuevo.
