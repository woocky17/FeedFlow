# API Routes: `src/app/api/**`

Qué hace cada endpoint (entradas, respuestas, códigos, quién puede llamarlo) es comportamiento y está en las specs: `openspec/specs/<cap>/spec.md`. Aquí, las convenciones, los patrones y dónde vive cada handler.

## Convenciones

- Handlers REST en `route.ts` por ruta (verbos exportados: `GET`, `POST`, `PUT`, `DELETE`, `PATCH`).
- En Next 16 `params` es una `Promise`: `{ params }: { params: Promise<{ id: string }> }` y `await params`.
- Sesión con `auth()` de `@/lib/auth` (NextAuth v5). Las rutas de usuario comprueban `session?.user` y devuelven 401.
- Las rutas admin comprueban `session.user.role === "admin"` (minúscula; ver `auth.md`) y devuelven 403.
- `src/proxy.ts` solo cubre `/api/favorites`, `/api/notifications` y `/api/admin`; el resto se protege dentro del handler.
- Rutas service-to-service: `Authorization: Bearer $CRON_SECRET`.
- Respuestas JSON; errores `NextResponse.json({ error: message }, { status })` dentro de `try/catch`.
- **Sin lógica de negocio** en los handlers: validan la entrada a mano (no hay zod), instancian repos y casos de uso, ejecutan y devuelven.

## Mapa de endpoints

| Método | Path | Caso de uso / implementación | Spec |
|--------|------|------------------------------|------|
| GET/POST | `/api/auth/[...nextauth]` | `handlers` de NextAuth | auth |
| POST | `/api/auth/register` | `RegisterUser` | auth |
| POST | `/api/auth/recover-password` | `RecoverPassword` | auth |
| GET | `/api/articles` | Prisma directo en el handler; query `categoryId` y `sourceId` | article-feed |
| GET | `/api/articles/[id]/translation` | `GetArticleWithTranslation` (`GroqTranslationService`); query `targetLang` | translation |
| GET/POST | `/api/categories` | lectura / `CreateCustomCategory` | categories |
| PUT/DELETE | `/api/categories/[id]` | `EditCustomCategory` / `DeleteCustomCategory` | categories |
| GET/POST | `/api/admin/categories` | `PrismaCategoryRepository` directo | categories |
| PUT/DELETE | `/api/admin/categories/[id]` | `PrismaCategoryRepository` directo | categories |
| GET/POST | `/api/admin/sources` | lectura / `AddSource` | sources |
| PUT/DELETE | `/api/admin/sources/[id]` | `EditSource` / `ToggleSource` / `DeleteSource` | sources |
| GET/POST | `/api/favorites` | `GetFavorites` / `AddFavorite` | favorites |
| DELETE | `/api/favorites/[id]` | `PrismaFavoriteRepository.deleteByArticle` directo | favorites |
| GET | `/api/notifications` | `ListUserNotifications` | notifications |
| PUT | `/api/notifications/[id]/read` | `MarkNotificationRead` | notifications |
| GET/POST | `/api/stories` | `ListUserStories` / `FollowArticle` | story-timeline |
| GET/DELETE | `/api/stories/[id]` | `GetStoryTimeline` / `UnfollowStory` | story-timeline |
| GET | `/api/events/[id]` | `GetNewsEvent` | bias-radar |
| POST | `/api/cron/backfill` | `BackfillArticles` vía `buildContainer()` (ver `cron.md`) | article-ingestion |

El sync y las notificaciones periódicas no tienen ruta HTTP: los ejecuta el worker (`src/worker`, ver `cron.md`).

## Patrón de handler protegido

```ts
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    // validación a mano: tipo, longitud, enum
    const useCase = new TheUseCase(new PrismaXRepository(), /* otros puertos */);
    const result = await useCase.execute({ userId: session.user.id, ...body });
    return NextResponse.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Internal error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
```

## Patrón de handler service-to-service

```ts
export const runtime = "nodejs";
export const maxDuration = 60;
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const secret = process.env.CRON_SECRET;
  if (!secret || req.headers.get("authorization") !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  // ensamblar con buildContainer() y ejecutar
}
```

`src/app/api/cron/backfill/route.ts` todavía no comprueba que `CRON_SECRET` exista (pendiente en `docs/estado.md`).

## Al añadir un endpoint

1. Crea `src/app/api/<feature>/[...]/route.ts`.
2. Importa `auth` si es de usuario, o comprueba `CRON_SECRET` si es service-to-service.
3. Instancia los repos Prisma y el caso de uso con DI manual.
4. Valida la entrada y devuelve errores consistentes.
5. Añade la fila a este mapa y describe el comportamiento en un change de OpenSpec.
