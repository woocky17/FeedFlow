# Pipeline de IA: embeddings, Groq y similitud

Qué hace la ingesta y con qué umbrales agrupa, empareja, clasifica, analiza o traduce es comportamiento: `openspec/specs/article-ingestion/spec.md`, `bias-radar`, `story-timeline`, `categories` y `translation` (misma ruta). Aquí, cómo está montada la IA.

Todo artículo nuevo entra por `IngestArticle` (`src/application/article/ingest-article.ts`), que usan tanto `SyncArticles` (worker) como `BackfillArticles` (backfill manual).

Tres piezas:

1. **Embeddings locales** con `@xenova/transformers` (sin red en runtime una vez descargado el modelo).
2. **Groq** (LLM) para clasificación, sentimiento, topics y traducción.
3. **Similitud coseno** en memoria con `src/lib/similarity.ts`.

## Groq: modelo y parámetros comunes

Todas las llamadas pasan por `fetchGroqChat` (`src/infrastructure/ai/groq-fetch.ts`), con reintentos y backoff ante 429/5xx y `retry-after`. Añade por defecto (un adaptador puede sobrescribirlos):

- `model`: `GROQ_MODEL` o, si no está definida, `DEFAULT_GROQ_MODEL` = `openai/gpt-oss-120b`. Ningún adaptador lleva el modelo en literal. `llama-3.3-70b-versatile` se retiró (404 en todas las llamadas); si vuelve a pasar, mira `GET https://api.groq.com/openai/v1/models`.
- `reasoning_effort: "low"` e `include_reasoning: false`. gpt-oss es un modelo de razonamiento y sus tokens de razonamiento cuentan contra `max_tokens`: sin `low`, con topes bajos devolvía `content` vacío (el clasificador daba `[]`) o HTTP 400 `json_validate_failed`, sin error visible. `include_reasoning: false` solo quita `message.reasoning` de la respuesta, no ahorra tokens; no se combina con `reasoning_format` (400).

`max_tokens` por adaptador: clasificador 300; sentimiento 400 (uno) y `min(400 + 120·n, 2000)` (lote, n = 8 por defecto); topics 400; traducción de títulos 400 y de descripciones 800.

Los adaptadores reciben `apiKey` por constructor. El clasificador, el sentimiento y los topics registran el fallo con `console.error` y degradan en vez de propagar; `groq-translator` no degrada: lanza el error (sin clave, respuesta vacía o malformada) y lo gestiona quien lo llama.

## Dónde vive cada pieza

| Pieza | Adaptador | Puerto | Caso de uso | Spec |
|-------|-----------|--------|-------------|------|
| Embeddings | `src/infrastructure/ai/transformers-embedder.ts` | `src/domain/story/embedding-service.ts` | `ClusterArticle`, `FollowArticle`, `BackfillStory`, `MatchArticleToStories` | bias-radar, story-timeline |
| Clasificación | `groq-classifier.ts` | `CategoryClassifier` (`src/application/article/sync-articles.ts`) | `IngestArticle`, `HealArticles` | categories |
| Sentimiento | `groq-sentiment-analyzer.ts` | `src/domain/news-event/sentiment-analyzer.ts` | `AnalyzeArticleSentiment`, `AnalyzeSentimentBatch` | bias-radar |
| Topics | `groq-topic-generator.ts` | `src/domain/story/topic-generator.ts` | `FollowArticle` | story-timeline |
| Traducción | `groq-translator.ts` | `src/domain/article-translation/translation-service.ts` | `GetArticleWithTranslation`, `PrefetchArticleTitles` | translation |

## Embeddings

- Modelo `Xenova/all-MiniLM-L6-v2` (384 dimensiones). Pool mean, `normalize: true` y `l2Normalize` por seguridad.
- Singleton lazy: `getEmbedder()` carga el pipeline una vez por proceso. No cargues el modelo en rutas que no lo necesiten.
- `embedMany` trocea en lotes de 32.
- Texto a embeber: `buildEmbeddingText(title, description)` (función pura en `src/domain/story/embedding-service.ts`).
- `@xenova/transformers` y `onnxruntime-node` deben seguir en `serverExternalPackages` (`next.config.ts`). En Docker la caché del modelo vive en `node_modules/@xenova/transformers/.cache` (volumen `xenova_cache`).

## Similitud

`src/lib/similarity.ts`: `l2Normalize(vec)` y `cosine(a, b)` (producto escalar sobre vectores normalizados). Rango `[-1, 1]`, en la práctica `[0, 1]` entre frases parecidas.

## Variables de entorno

| Variable | Qué controla | Default |
|----------|--------------|---------|
| `GROQ_API_KEY` | activa clasificación, sentimiento, topics y traducción | opcional; sin ella el clasificador usa un stub (`classify() → []`), sentimiento y topics degradan solos, la traducción bajo demanda responde 503 y el worker no registra el job `prefetchTranslations` (ver `src/infrastructure/AGENTS.md`) |
| `GROQ_MODEL` | modelo de chat de Groq | `openai/gpt-oss-120b` |
| `NEWS_EVENT_SIMILARITY_THRESHOLD` | umbral de agrupación en eventos (`src/worker/container.ts`) | `0.72` |
| `STORY_SIMILARITY_THRESHOLD` | umbral de las historias nuevas (`src/app/api/stories/route.ts`) | `0.55` |

Claves de WorldNewsAPI: por fuente en `Source.apiKey`, no en el entorno. El resto de variables en `cron.md`.

## Al tocar el pipeline

- Si cambias el modelo de embeddings, los embeddings guardados quedan obsoletos (dimensiones distintas) y hay que recomputarlos.
- Si cambias un umbral, hazlo por env antes que en el código (y si cambia el comportamiento, con un change de OpenSpec).
- Groq tiene rate limits: agrupa (`embedMany`, `AnalyzeSentimentBatch`) en los flujos por lote; no hagas una llamada por artículo si se puede por lote.
