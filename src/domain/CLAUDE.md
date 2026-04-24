# `src/domain/` — Reglas de capa

**TypeScript puro.** Cualquier `import` desde `prisma`, `next`, `react`, `axios`, `@xenova/transformers`, `bcryptjs` o cualquier otra lib externa aquí **es un bug**. Si lo necesitas, vive en `infrastructure/` y entra al dominio por un puerto.

## Qué va aquí

- **Entidades**: clase con `private constructor` + `static create(props)` que valida invariantes. Ver `story/story.ts`, `news-event/news-event.ts` como referencia.
- **Value Objects**: clases inmutables con equality por valor (si hay varios, documéntalos).
- **Puertos de salida** (interfaces):
  - Repositorios: `*-repository.ts`.
  - Servicios del dominio: `embedding-service.ts`, `topic-generator.ts`, `sentiment-analyzer.ts`, `email-sender.ts`, `noticias-fetcher.ts`.
- `index.ts` por feature re-exportando la API pública del módulo.

## Qué NO va aquí

- Llamadas HTTP, BD, sistema de archivos.
- Dependencias de React / Next / Prisma.
- Casos de uso (van en `application/`).
- Implementaciones de puertos (van en `infrastructure/`).

## Idioma de los módulos

Algunos módulos históricos usan español: `article` contiene `Noticia`, `category` contiene `Categoria`, `user` contiene `Usuario`. Los nuevos (`story`, `news-event`) están en inglés. **Mantén el idioma del módulo donde trabajes**.

## Tests

Tests unitarios coubicados (`story.test.ts` junto a `story.ts`). Sin mocks — el dominio es puro.

> Para el contexto completo del dominio y sus invariantes, lee `.claude/context/domain.md`.
