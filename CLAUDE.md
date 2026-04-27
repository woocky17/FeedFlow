# FeedFlow — Guía para Claude Code

FeedFlow es un **agregador de noticias personalizado** (Next.js 16 full-stack) con deduplicación por embeddings, clustering de noticias para análisis de sesgo (News Bias Radar), timelines de historias (Story Timeline) y categorías por usuario. Arquitectura hexagonal estricta.

## Stack

- **Next.js 16.2** · **React 19.2** · **TypeScript 5.9** · App Router
- **Prisma 7.5** + **PostgreSQL** (cliente generado en `generated/prisma`)
- **NextAuth v5 beta** (Credentials provider + bcryptjs + JWT)
- **TailwindCSS 4** + **Radix UI** (@radix-ui/themes, @radix-ui/react-icons)
- **@xenova/transformers** (`Xenova/all-MiniLM-L6-v2`, 384 dims, local) para embeddings
- **Groq API** para clasificación de categorías, análisis de sentimiento y generación de topics
- **fast-xml-parser** para adaptador RSS/Atom (`RssArticleFetcher`)
- **Storybook 10**, **Vitest 4**, **Playwright 1.59**
- Docker (multi-stage) + cron job Docker para sync periódico

## Mapa de carpetas

```
src/
├── domain/          TypeScript puro: entidades, VOs, puertos (repositorios/servicios)
├── application/     Casos de uso — orquestan el dominio vía puertos inyectados
├── infrastructure/  Adaptadores: db/prisma, ai (transformers + groq), news (worldnewsapi, rss, newsapi) + multi-source-fetcher router, mail/resend
├── worker/          Proceso Node standalone (sync, heal, notifications) con loop propio + container DI
├── app/             Next.js App Router: api/** y (pages)/**
├── components/      Atomic Design: atoms, molecules, organisms, templates
└── lib/             Utilidades: auth.ts (NextAuth config), similarity.ts (l2Normalize, cosine)
prisma/              schema.prisma + migrations + seed.ts
.claude/context/     Documentación operativa detallada (cargar bajo demanda)
```

## Reglas de oro

- **Hexagonal estricto**: nunca importes Prisma, React, axios ni nada externo desde `src/domain/**`. Si aparece `prisma`/`next`/`react` dentro de `domain/`, está mal.
- **Casos de uso en `application/`** reciben puertos por el constructor (DI manual). No tocan infraestructura directamente.
- **Adaptadores** en `infrastructure/` implementan puertos declarados en `domain/*/…-repository.ts` o `application/*/ports.ts`.
- **Atomic Design** en `components/`: atoms (primitivas), molecules (combinaciones), organisms (con lógica), templates (layouts). Todo atom/molecule debería tener un `*.stories.tsx`.
- **Español** en docs y mensajes al usuario; nombres técnicos (entidades, clases, tipos) en inglés cuando sea idiomático (excepto los que ya están en español por histórico: `Noticia`, `Categoria`…).
- **Commits**: no incluir `Co-Authored-By` (preferencia del autor).
- **Sin dependencias innecesarias**: no añadir libs si se puede resolver con TS puro o lo ya instalado.

## Comandos útiles

```bash
npm run dev              # servidor Next.js
npm run build            # build de producción
npm run lint             # ESLint
npm run format           # Prettier

npm run db:generate      # regenerar cliente Prisma tras cambiar schema
npm run db:migrate       # crear+aplicar migración (dev)
npm run db:push          # aplicar schema sin migración (sandbox)
npm run db:studio        # GUI Prisma
npm run db:seed          # prisma/seed.ts

npm run storybook        # Storybook en :6006
```

Cron authenticado con `Authorization: Bearer $CRON_SECRET`.

## Índice de carga selectiva

Para la mayoría de tareas **solo necesitas este archivo**. Si la tarea requiere detalle, carga el `.md` relevante vía `/ctx <area>` o leyéndolo directamente:

| Tarea | Lee |
|-------|-----|
| Cambiar arquitectura, entender flujos end-to-end | `.claude/context/architecture.md` |
| Añadir/modificar entidad, invariante, VO | `.claude/context/domain.md` |
| Crear/modificar endpoint API | `.claude/context/api-routes.md` |
| Cambiar schema Prisma, migración, relaciones | `.claude/context/database.md` |
| Crear/cambiar página, ruta UI | `.claude/context/pages.md` |
| Crear/cambiar componente UI, story | `.claude/context/components.md` |
| Escribir tests (unit, integration, e2e) | `.claude/context/testing.md` |
| Tocar embeddings, clustering, sentiment, Groq | `.claude/context/ai-pipeline.md` |
| Tocar login, sesión, middleware, NextAuth | `.claude/context/auth.md` |
| Tocar cron, sync, notificaciones programadas | `.claude/context/cron.md` |
| Dudas sobre naming, imports, estilo, lint | `.claude/context/conventions.md` |

Para tareas cross-layer, lee varios (`/ctx domain api-routes database`).

## Política de mantenimiento

- Al añadir/renombrar una feature de dominio, ruta API, convención o dependencia del stack → actualiza el `.md` relevante de `.claude/context/` **en el mismo commit** del código.
- Cambios estructurales (capa nueva, regla nueva del proyecto) → actualiza también este `CLAUDE.md` raíz.
- Si este archivo supera 150 líneas, mueve una sección a `.claude/context/` y deja solo el puntero.

## Referencias externas al código

- `FUTURE_FEATURES.md` — ideas diferenciadoras planeadas (Story Timeline, News Bias Radar, News Diet, Smart Briefing, Source Trust Score…). Solo si se discute roadmap.
- `.claude/agregador-noticias-tareas.md` — checklist legacy de la especificación inicial. Referencia histórica, no operativa.
