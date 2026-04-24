# Convenciones de código

## TypeScript

- `strict: true` en `tsconfig.json`. Evita `any`; usa `unknown` + narrowing si no conoces el shape.
- Target `ES2017`, module `esnext`, moduleResolution `bundler`.
- **JSX**: `react-jsx` (no hace falta importar React).
- Sin `noEmit` override — el build lo hace Next.js.

## Alias de imports (ver `tsconfig.json`)

```ts
import { X } from "@/lib/x";                    // desde src/lib/x
import { Story } from "@/domain/story";         // desde src/domain/story
import { FollowArticle } from "@/application/story";
import { PrismaStoryRepository } from "@/infrastructure/db/prisma/story-repository-impl";
```

**No uses imports relativos largos** (`../../../`). Si necesitas importar cross-carpeta, usa el alias.

## Naming

- **Archivos**: `kebab-case.ts` / `kebab-case.tsx` (ej. `story-repository-impl.ts`, `icon-button.tsx`).
- **Clases, tipos, interfaces**: `PascalCase`.
- **Funciones, variables, métodos**: `camelCase`.
- **Constantes globales**: `SCREAMING_SNAKE_CASE` cuando son de verdad constantes (config env, umbrales inmutables). Para constantes locales de módulo, `camelCase` está bien.
- **Entidades**: una por archivo con el sufijo `-entity.ts` en módulos antiguos (`noticia-entity.ts`) o sin sufijo en los nuevos (`story.ts`, `news-event.ts`). Mantén el estilo del módulo donde trabajes.
- **Repositorios**: puerto en `domain/` sin prefijo (`story-repository.ts`), impl en `infrastructure/db/prisma/` con sufijo `-impl.ts` y prefijo `Prisma` en la clase (`PrismaStoryRepository`).
- **Casos de uso**: clase `PascalCase` describiendo la acción (`FollowArticle`, `MatchArticleToStories`, `SyncArticles`). Un archivo = un caso de uso.

## Idioma

- **Código y comentarios**: inglés (identificadores, JSDoc, errores técnicos lanzados).
- **Docs `.md`**: español.
- **Legacy en español**: los módulos originales (`article` usa `Noticia` internamente, `category` usa `Categoria`, `user` usa `Usuario`) están en español — respeta el idioma del módulo donde añadas código.
- **Mensajes al usuario final** (UI, emails): español.

## Prettier

`.prettierrc`:
```json
{ "semi": true, "singleQuote": false, "tabWidth": 2, "trailingComma": "all", "printWidth": 100 }
```

Punto y coma sí, comillas dobles, 2 espacios, trailing commas sí, ancho 100. `npm run format` lo aplica a todo `src/`.

## ESLint

`eslint-config-next` + `eslint-plugin-storybook`. `npm run lint` = `next lint`. Sigue las reglas por defecto de Next 16.

## Commits

- Convención existente en el repo (ver `git log`): prefijos tipo `feat(<scope>):`, `chore:`, `fix(<scope>):`. Úsalo.
- **NO incluir `Co-Authored-By`** (preferencia explícita del autor).
- Mensajes en inglés, body opcional con bullets cuando el cambio tiene varias partes.

## Orden de imports

Prettier no los ordena. Convención suave vista en el código:
1. Libs externas (`react`, `next`, `@prisma/client`, etc.).
2. Alias del proyecto (`@/domain/...`, `@/application/...`, `@/infrastructure/...`, `@/lib/...`).
3. Relativos (`./...`).

Cada bloque separado por línea en blanco cuando hay varios.

## Manejo de errores

- Lanza `Error` con mensajes descriptivos en inglés desde dominio/aplicación.
- En handlers API, captura y devuelve `{ error: message }` con status apropiado.
- No uses `try/catch` vacíos para silenciar errores — si el error es esperable, manéjalo explícitamente.

## No añadas

- Comentarios que describen qué hace el código (los nombres ya lo hacen).
- Docstrings en cada función.
- Código muerto o comentado "por si acaso".
- Dependencias nuevas sin necesidad clara — revisa si ya hay algo instalado (`package.json`).
