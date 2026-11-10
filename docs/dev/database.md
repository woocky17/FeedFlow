# Base de datos: Prisma + PostgreSQL

Schema: `prisma/schema.prisma`. Prisma 7 con generador `prisma-client`: cliente en `generated/prisma` (gitignored, no en `node_modules`). Driver adapter `PrismaPg` (`@prisma/adapter-pg`). Prisma solo se usa desde `src/infrastructure/db/prisma/` (singleton en `client.ts`).

## Enums

- `Role`: `USER | ADMIN`. En el dominio y en la sesión es `"user" | "admin"`; lo traduce `user-repository-impl.ts`.
- `CategoryType`: `DEFAULT | CUSTOM`.
- `AssignmentOrigin`: `AUTO | MANUAL`.
- `SourceKind`: `WORLDNEWS | RSS` (en el dominio `"worldnews" | "rss"`).
- `Language`: `ES | EN` (en el dominio `"es" | "en"`; `language-mapper.ts`).

## Modelos (tablas)

| Modelo | Tabla | Campos relevantes | Relaciones | Índices |
|--------|-------|-------------------|-----------|---------|
| `User` | `users` | `email @unique`, `passwordHash`, `role @default(USER)`, `language @default(ES)` | categories, categoryAssignments, favorites, notifications, stories | — |
| `Source` | `sources` | `name`, `baseUrl`, `apiKey @default("")`, `kind @default(WORLDNEWS)`, `language @default(EN)`, `active` | articles | — |
| `Article` | `articles` | `url @unique`, `title`, `description?`, `image?`, `language @default(EN)`, `publishedAt`, `savedAt`, **`embedding: Float[]`**, `newsEventId?`, `sentiment?`, `framingSummary?` | source (Cascade), categoryAssignments, favorites, storyArticles, storySources (relación "StorySource"), newsEvent (SetNull), translations | `sourceId`, `publishedAt`, `newsEventId`, `[language, publishedAt]` |
| `ArticleTranslation` | `article_translations` | `targetLang`, `title`, `description?`, `provider` | article (Cascade) | `@@id([articleId, targetLang])`, `articleId` |
| `Category` | `categories` | `name`, `type`, `userId?` | user (Cascade), categoryAssignments | `userId`; `@@unique([name, userId])` |
| `CategoryAssignment` | `category_assignments` | `origin`, `assignedAt` | article (Cascade), category (Cascade), user? (SetNull) | `articleId`, `categoryId`; `@@unique([articleId, categoryId, userId])` |
| `Favorite` | `favorites` | `createdAt` | user (Cascade), article (Cascade) | `@@unique([userId, articleId])` |
| `Notification` | `notifications` | `message`, `read` | user (Cascade) | `userId` |
| `Story` | `stories` | `name`, `summary`, **`embedding: Float[]`**, `sourceArticleId`, `threshold`, `active` | user (Cascade), sourceArticle ("StorySource", Cascade), articles (StoryArticle) | `userId`, `active`; `@@unique([userId, sourceArticleId])` |
| `NewsEvent` | `news_events` | `title`, **`embedding: Float[]`**, `firstSeenAt`, `lastSeenAt` | articles | `lastSeenAt` |
| `StoryArticle` | `story_articles` | `similarity: Float`, `addedAt` | story (Cascade), article (Cascade) | `storyId`, `articleId`; `@@unique([storyId, articleId])` |

`Source.apiKey` no debe salir al cliente ni a los logs; hoy la API de admin la devuelve entera (ver `docs/estado.md`).

## Embeddings en BD

- `Article.embedding`, `Story.embedding` y `NewsEvent.embedding` son `Float[]` (array de PostgreSQL).
- Modelo `Xenova/all-MiniLM-L6-v2`, 384 dimensiones, normalizado L2. Ver `src/infrastructure/ai/transformers-embedder.ts` y `src/lib/similarity.ts`.
- La similitud se calcula en la aplicación, no en la BD: se cargan candidatos y se hace el coseno en memoria.
- Si algún día se usa `pgvector`, habrá que migrar el tipo de columna.

## Migraciones

```bash
# tras cambiar schema.prisma (solo contra la BD local de docker compose, puerto 5433)
npm run db:migrate -- --name descripcion_corta

# regenerar el cliente (tras npm ci o cualquier cambio de schema)
npm run db:generate

# producción: aplicar migraciones ya creadas
npx prisma migrate deploy
```

Las migraciones viven en `prisma/migrations/`. Nunca `db:push`, `migrate reset` ni seed contra una BD real sin permiso explícito.

## Seed

`prisma/seed.ts` (con `npx tsx`): `npm run db:seed` o `npx prisma db seed`. Es idempotente.

- Categorías por defecto.
- Fuentes RSS de demo (`demoRssSources`, `kind = RSS`, sin API key, deduplicadas por `name`): ES → El País, 20 Minutos, Google News (España), elDiario.es, El Mundo, ABC, La Vanguardia, Europa Press, Xataka, El Confidencial; EN → BBC News (RSS), The Guardian (World), NPR News, Al Jazeera, The New York Times, Google News (US). La BBC va como "BBC News (RSS)" porque ya existe una fuente WORLDNEWS "BBC News". RTVE descartada (feeds congelados en 2022).
- Usuarios de prueba (solo desarrollo local): si `.env` define `TEST_USER_EMAIL`/`TEST_USER_PASSWORD` y `TEST_ADMIN_EMAIL`/`TEST_ADMIN_PASSWORD`, crea un usuario `USER` y otro `ADMIN` (bcryptjs coste 12, idioma `ES`, igual que el registro). Si el email ya existe no cambia la contraseña; solo asciende a `ADMIN` el del par `TEST_ADMIN_*`. Si falta alguna variable, se salta ese usuario. No imprime contraseñas.

## Al modificar el modelo

1. Edita `prisma/schema.prisma`.
2. `npm run db:migrate -- --name ...` (dev, BD local) y `npm run db:generate`.
3. Actualiza el adaptador en `src/infrastructure/db/prisma/<entity>-repository-impl.ts`.
4. Si cambia la entidad de dominio, actualiza también `src/domain/<feature>/…` y su puerto.
5. Revisa los mappings: los modelos van en PascalCase y las tablas con `@@map("snake_case")`.
6. Actualiza este archivo (modelos, relaciones o índices nuevos).
