# Base de datos — Prisma + PostgreSQL

Schema: `prisma/schema.prisma`. Cliente generado en `generated/prisma` (no en `node_modules`). Adaptador PG: `@prisma/adapter-pg`.

## Enums

- `Role`: `USER | ADMIN`
- `CategoryType`: `DEFAULT | CUSTOM` (default = global sin dueño; custom = del usuario)
- `AssignmentOrigin`: `AUTO | MANUAL` (el manual no es sobrescribible por el auto)

## Modelos (tablas)

| Modelo | Tabla | Campos relevantes | Relaciones | Índices |
|--------|-------|-------------------|-----------|---------|
| `User` | `users` | `email @unique`, `passwordHash`, `role` | categories, categoryAssignments, favorites, notifications, stories | — |
| `Source` | `sources` | `name`, `baseUrl`, `apiKey`, `active` | articles | — |
| `Article` | `articles` | `url @unique`, `title`, `description?`, `image?`, `publishedAt`, `savedAt`, **`embedding: Float[]`**, `newsEventId?`, `sentiment?`, `framingSummary?` | source (Cascade), categoryAssignments, favorites, storyArticles, storySources (1-N inverso vía `StorySource`), newsEvent (SetNull) | `sourceId`, `publishedAt`, `newsEventId` |
| `Category` | `categories` | `name`, `type`, `userId?` | user (Cascade), categoryAssignments | `userId`; `@@unique([name, userId])` |
| `CategoryAssignment` | `category_assignments` | `origin` (AUTO/MANUAL), `assignedAt` | article (Cascade), category (Cascade), user? (SetNull) | `articleId`, `categoryId`; `@@unique([articleId, categoryId, userId])` |
| `Favorite` | `favorites` | `createdAt` | user (Cascade), article (Cascade) | `@@unique([userId, articleId])` |
| `Notification` | `notifications` | `message`, `read` | user (Cascade) | `userId` |
| `Story` | `stories` | `name`, `summary`, **`embedding: Float[]`**, `sourceArticleId`, `threshold @default(0.55)`, `active` | user (Cascade), sourceArticle (relation "StorySource", Cascade), articles (StoryArticle) | `userId`, `active`; `@@unique([userId, sourceArticleId])` |
| `NewsEvent` | `news_events` | `title`, **`embedding: Float[]`**, `firstSeenAt`, `lastSeenAt` | articles | `lastSeenAt` |
| `StoryArticle` | `story_articles` | `similarity: Float`, `addedAt` | story (Cascade), article (Cascade) | `storyId`, `articleId`; `@@unique([storyId, articleId])` |

## Embeddings en BD

- `Article.embedding`, `Story.embedding`, `NewsEvent.embedding` son `Float[]` (PostgreSQL array de floats).
- Modelo: `Xenova/all-MiniLM-L6-v2` → **384 dimensiones**, normalizado L2. Ver `src/infrastructure/ai/transformers-embedder.ts` y `src/lib/similarity.ts`.
- La similitud se calcula en aplicación (no en BD) — se cargan candidatos y se hace coseno en memoria con `l2Normalize`.
- Si en el futuro se usa `pgvector`, se migrará el tipo de columna.

## Migraciones

```bash
# tras cambiar schema.prisma en desarrollo
npm run db:migrate -- --name descripcion_corta

# regenerar cliente sin migración (si cambió sólo el generator)
npm run db:generate

# push directo sin migración (solo sandbox/preview)
npm run db:push

# producción: aplicar migraciones ya creadas
npx prisma migrate deploy
```

Las migraciones viven en `prisma/migrations/`. Los nombres recientes muestran el historial: stories y news-events añadidos en iteraciones separadas.

## Seed

`prisma/seed.ts` (ejecutado vía `npx tsx`). Crea categorías default. Se ejecuta con:
```bash
npm run db:seed
```

Fuentes RSS de demo (`demoRssSources`, `kind = RSS`, sin API key, idempotente por `name`): ES → El País, 20 Minutos, Google News (España), elDiario.es, El Mundo, ABC, La Vanguardia, Europa Press, Xataka, El Confidencial; EN → BBC News (RSS), The Guardian (World), NPR News, Al Jazeera, The New York Times, Google News (US). La BBC va como "BBC News (RSS)" porque ya existe una fuente WORLDNEWS "BBC News" y el seed deduplica por `name`. Descartada: RTVE (sus feeds públicos están congelados en 2022).

Usuarios de prueba (solo desarrollo local): si `.env` define `TEST_USER_EMAIL`/`TEST_USER_PASSWORD` y `TEST_ADMIN_EMAIL`/`TEST_ADMIN_PASSWORD`, `npx prisma db seed` crea un usuario `USER` y otro `ADMIN` (bcryptjs coste 12, idioma `ES`, igual que el registro). Es idempotente: si el email ya existe no cambia la contraseña; solo asciende a `ADMIN` el del par `TEST_ADMIN_*`. Si falta alguna variable, se salta ese usuario.

## Al modificar el modelo

1. Edita `prisma/schema.prisma`.
2. `npm run db:migrate -- --name ...` (dev).
3. Actualiza el adaptador en `src/infrastructure/db/prisma/<entity>-repository-impl.ts`.
4. Si la entidad de dominio cambia, actualiza también `src/domain/<feature>/…-entity.ts` y/o su puerto.
5. Revisa mappings: Prisma usa camelCase pero hay `@@map("snake_case")` para nombres de tabla.
6. Actualiza este archivo (modelo, relaciones o índices nuevos).
