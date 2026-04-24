# Pipeline de IA — Embeddings, Clustering, Sentiment, Topics

Tres tipos de IA en juego:

1. **Embeddings locales** con `@xenova/transformers` (no hace llamadas de red en runtime — modelo descargado).
2. **Groq API** (LLM rápido) para: clasificación de categorías, análisis de sentimiento, generación de topics.
3. **Similitud coseno** en memoria vía `src/lib/similarity.ts`.

## Embeddings

Archivo: `src/infrastructure/ai/transformers-embedder.ts`.

- Modelo: `Xenova/all-MiniLM-L6-v2` (384 dimensiones).
- Pool: mean · Normalize: true · Post-proceso: `l2Normalize` (por seguridad).
- Singleton lazy: `getEmbedder()` carga el pipeline una vez por proceso.
- Batch: `embedMany` trocea en batches de 32.
- Texto a embedar: `buildEmbeddingText(title, description)` concatena `title\ndescription` (si hay descripción).

Consumidores (dominio): interfaz `EmbeddingService` en `src/domain/story/embedding-service.ts`.

## Similitud

`src/lib/similarity.ts` expone:
- `l2Normalize(vec)` — normaliza a norma 1.
- `cosine(a, b)` — producto escalar asumiendo normalizados (= similitud coseno en ese caso).

Rango: `[-1, 1]`, típicamente `[0, 1]` para embeddings de frases semánticamente similares.

## Story Timeline (seguimiento de un tema)

Caso de uso: `MatchArticleToStories` (`src/application/story/match-article-to-stories.ts`).

1. Cuando entra un artículo nuevo con embedding `e_a`.
2. Se iteran las `Story` activas del usuario; cada una tiene su `embedding` y `threshold` (default 0.55).
3. Si `cosine(e_a, e_story) ≥ story.threshold`, se crea `StoryArticle { storyId, articleId, similarity }`.
4. Follow-article (`FollowArticle`) crea una `Story` a partir de un artículo, genera `summary` con `TopicGenerator` (Groq) y usa `article.embedding` como `story.embedding`.

## News Bias Radar (clustering cross-fuente)

Caso de uso: `ClusterArticle` (`src/application/news-event/cluster-article.ts`).

1. Umbral configurable: `NEWS_EVENT_SIMILARITY_THRESHOLD` (env, default **0.72**, más estricto que stories).
2. Se busca el `NewsEvent` más similar al embedding del artículo.
3. Si hay match ≥ threshold → `article.newsEventId = event.id` y se actualiza `event.lastSeenAt`.
4. Si no hay match → se crea un `NewsEvent` nuevo con `title = article.title` y `embedding = article.embedding`.

Esto agrupa **varios artículos del mismo suceso** (de distintas fuentes) bajo un mismo evento, permitiendo luego comparar framings/sentimientos.

## Sentiment Analysis

Archivo: `src/infrastructure/ai/groq-sentiment-analyzer.ts`. Puerto: `src/domain/news-event/sentiment-analyzer.ts`.

- Input: título + descripción del artículo.
- Output: `sentiment` (positivo/negativo/neutro o escala — inspeccionar la impl si dudas) y `framingSummary`.
- Aplicado en `AnalyzeArticleSentiment` (por artículo) y `AnalyzeSentimentBatch` (lote, para heal).

## Category Classification

Archivo: `src/infrastructure/ai/groq-classifier.ts`.

- Input: texto del artículo + lista de categorías default (leídas de BD).
- Output: IDs de categorías aplicables.
- Si no hay `GROQ_API_KEY`, `classify()` devuelve `[]` (no-op stub).
- Las asignaciones se crean con `origin = AUTO`; las manuales (origin `MANUAL`) no son sobrescribibles.

## Topic Generation

Archivo: `src/infrastructure/ai/groq-topic-generator.ts`. Puerto: `src/domain/story/topic-generator.ts`.

Genera un `summary` corto para una `Story` al seguir un artículo.

## Variables de entorno relevantes

- `GROQ_API_KEY` — si falta, clasificación y sentiment quedan como stubs (el pipeline sigue funcionando).
- `NEWS_EVENT_SIMILARITY_THRESHOLD` — umbral de clustering (default 0.72).
- `CRON_SECRET` — auth del cron.
- `DATABASE_URL` — PostgreSQL (Prisma).
- `WORLDNEWSAPI_API_KEY` / `NEWSAPI_API_KEY` — ver adaptadores.
- `RESEND_API_KEY` — email.

## Al tocar el pipeline

- Si cambias el modelo de embeddings, recuerda que **los embeddings en BD quedan obsoletos** (dimensiones distintas). Habrá que recomputar (`HealArticles` puede ayudar, pero hay que extender la lógica).
- Si cambias un umbral, ajústalo vía env antes que hardcode.
- Groq es rápido pero tiene rate limits — agrupar con `embedMany`/`AnalyzeSentimentBatch` en flujos batch.
