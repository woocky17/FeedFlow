# `src/infrastructure/` — Reglas de capa

**Adaptadores concretos** que implementan puertos declarados en `domain/` o `application/`. Aquí vive la tecnología.

## Estructura

```
infrastructure/
├── db/prisma/        ← repositorios Prisma (*-repository-impl.ts) + client.ts + seed.ts
├── ai/               ← transformers-embedder, groq-classifier, groq-sentiment-analyzer, groq-topic-generator, groq-fetch
├── news/
│   ├── worldnewsapi/ ← worldnewsapi-adapter + article-mapper (activo en cron/sync)
│   └── newsapi/      ← newsapi-adapter + article-mapper (alternativa)
└── mail/resend/      ← resend-email-adapter + templates
```

## Convenciones

- Archivos en kebab-case; clases en `PascalCase` con prefijo tecnológico: `PrismaStoryRepository`, `TransformersEmbedder`, `GroqClassifier`, `ResendEmailAdapter`, `WorldNewsApiAdapter`.
- Cada adapter implementa un puerto (`implements StoryRepository`, `implements EmbeddingService`, …) — si no implementa uno, probablemente está en la capa equivocada.
- El singleton de Prisma vive en `db/prisma/client.ts`. Los repos lo importan (`import { prisma } from "./client"`).
- Los embeddings (MiniLM) se cargan lazy en `transformers-embedder.ts` — singleton via closure.
- Los clientes Groq reciben `apiKey` por constructor; si falta, la ruta cron degrada a un stub (`classify() → []`).

## Qué NO va aquí

- Lógica de negocio (va en `domain/`).
- Casos de uso (van en `application/`).
- Handlers HTTP ni UI.

## Al añadir un adaptador

1. Crea `infrastructure/<dominio>/<tecnologia>/<archivo>.ts`.
2. `implements <Port>` del dominio o aplicación — si no hay puerto, primero crea el puerto.
3. Mappings de formato externo → dominio en `article-mapper.ts` o helper dedicado.
4. Mockealo en tests de casos de uso (no uses el adapter real salvo en integration tests).

> Para el flujo detallado del cron/sync y el pipeline de IA, lee `.claude/context/architecture.md` y `.claude/context/ai-pipeline.md`.
