# `src/application/` — Reglas de capa

**Casos de uso** que orquestan el dominio usando puertos inyectados por constructor. Sin frameworks, sin Prisma directo, sin React.

## Patrón

Un archivo = un caso de uso. Una clase por archivo con:

```ts
export class FollowArticle {
  constructor(
    private readonly stories: StoryRepository,
    private readonly articles: NoticiaRepository,
    private readonly embedder: EmbeddingService,
    private readonly topicGenerator: TopicGenerator,
  ) {}

  async execute(input: { userId: string; articleId: string }): Promise<Story> {
    // orquestación
  }
}
```

DTOs de input/output definidos en el mismo archivo cuando son simples.

## Qué va aquí

- `<feature>/<accion>.ts` — un caso de uso.
- `<feature>/index.ts` — re-exporta los casos de uso públicos del módulo.
- Puertos específicos de aplicación (no de dominio): hoy se declaran en el fichero del caso de uso que los consume y se importan desde ahí. Ejemplos: `CategoryClassifier`, `StoryMatcher`, `ArticleClusterer` y `SentimentEnricher` en `article/sync-articles.ts` (los usan `ingest-article.ts`, `heal-articles.ts` y `GroqClassifier`); `ArticleTitleSource` en `article-translation/prefetch-article-titles.ts`. No hay ningún `ports.ts`; si un feature acumula varios puertos propios, se pueden mover a `<feature>/ports.ts`.

## Qué NO va aquí

- Lógica de negocio pura (va en `domain/`).
- Instanciación de adaptadores concretos (eso se hace en `app/` o en tests).
- Handlers HTTP ni React.

## Al añadir un caso de uso

1. Crea `application/<feature>/<kebab-case-action>.ts`.
2. Declara el puerto en `domain/` si es nuevo; referencia puertos existentes si no.
3. Añade a `application/<feature>/index.ts`.
4. Crea tests unitarios con mocks de puertos en `test/application/<feature>/<accion>.test.ts`.
5. Instancia el caso de uso desde `app/api/<feature>/[...]/route.ts` o desde la page que lo use.

> Para el mapa de casos de uso por feature, lee `docs/dev/architecture.md` (sección `application/`). El comportamiento está en `openspec/specs/`.
