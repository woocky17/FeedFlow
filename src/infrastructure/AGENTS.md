# `src/infrastructure/` — Reglas de capa

**Adaptadores concretos** que implementan puertos declarados en `domain/` o `application/`. Aquí vive la tecnología.

## Estructura

```
infrastructure/
├── db/prisma/        ← repositorios Prisma (*-repository-impl.ts) + client.ts
├── ai/               ← transformers-embedder, groq-classifier, groq-sentiment-analyzer, groq-topic-generator, groq-translator, groq-fetch
├── news/
│   ├── multi-source-fetcher.ts ← elige rss o worldnewsapi según Source.kind
│   ├── worldnewsapi/ ← worldnewsapi-adapter + article-mapper
│   └── rss/          ← rss-adapter + article-mapper
└── mail/resend/      ← resend-email-adapter + templates
```

## Convenciones

- Archivos en kebab-case; clases en `PascalCase` con prefijo tecnológico: `PrismaStoryRepository`, `TransformersEmbedder`, `GroqClassifier`, `ResendEmailAdapter`, `WorldNewsApiAdapter`.
- Cada adapter implementa un puerto (`implements StoryRepository`, `implements EmbeddingService`, …) — si no implementa uno, probablemente está en la capa equivocada.
- El singleton de Prisma vive en `db/prisma/client.ts`. Los repos lo importan (`import { prisma } from "./client"`).
- Los embeddings (MiniLM) se cargan lazy en `transformers-embedder.ts` — singleton via closure.
- Los clientes Groq reciben `apiKey` por constructor y llaman a Groq solo vía `fetchGroqChat` (`groq-fetch.ts`). Sin `GROQ_API_KEY`:
  - `GroqClassifier`: no se instancia; `src/worker/container.ts` usa un stub con `classify() → []`.
  - `GroqSentimentAnalyzer` y `GroqTopicGenerator`: se instancian con `""` y degradan solos (`null`/`[]` y tema de respaldo).
  - `GroqTranslationService` (`groq-translator.ts`): no se instancia; el worker no registra el prefetch de títulos y `GET /api/articles/[id]/translation` responde 503. Si se le llama sin clave, lanza error.

## Qué NO va aquí

- Lógica de negocio (va en `domain/`).
- Casos de uso (van en `application/`).
- Handlers HTTP ni UI.

## Al añadir un adaptador

1. Crea `infrastructure/<dominio>/<tecnologia>/<archivo>.ts`.
2. `implements <Port>` del dominio o aplicación — si no hay puerto, primero crea el puerto.
3. Mappings de formato externo → dominio en `article-mapper.ts` o helper dedicado.
4. Mockealo en tests de casos de uso (no uses el adapter real salvo en integration tests).

> Para el worker y el pipeline de IA, lee `docs/dev/cron.md` y `docs/dev/ai-pipeline.md`.
