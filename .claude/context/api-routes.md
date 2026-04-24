# API Routes — `src/app/api/**`

Convenciones generales:
- Handlers REST en `route.ts` por ruta (verbos HTTP exportados: `GET`, `POST`, `PUT`, `DELETE`, `PATCH`).
- Autenticación de usuarios vía `auth()` de `@/lib/auth` (NextAuth v5). Rutas protegidas comprueban `session?.user`.
- Rutas admin comprueban `session.user.role === "ADMIN"`.
- Rutas cron comprueban `Authorization: Bearer $CRON_SECRET`.
- Respuestas JSON; errores `NextResponse.json({ error }, { status })`.
- **Sin lógica de negocio** en los handlers: solo validan input, instancian repos/casos de uso, ejecutan y devuelven.

## Mapa de endpoints

### Auth
| Método | Path | Handler | Caso de uso |
|--------|------|---------|-------------|
| GET/POST | `/api/auth/[...nextauth]` | `handlers` de NextAuth | login/logout/session |
| POST | `/api/auth/register` | — | `RegisterUser` |
| POST | `/api/auth/recover-password` | — | `RecoverPassword` |

### Articles
| Método | Path | Caso de uso |
|--------|------|-------------|
| GET | `/api/articles` | `ReadArticles` (con filtros por categoría/búsqueda) |

### Categories
| Método | Path | Caso de uso | Auth |
|--------|------|-------------|------|
| GET/POST | `/api/categories` | lectura / `CreateCustomCategory` | user |
| PUT/DELETE | `/api/categories/[id]` | `EditCustomCategory` / `DeleteCustomCategory` | user |
| GET/POST | `/api/admin/categories` | `ManageDefaultCategories` | admin |
| PUT/DELETE | `/api/admin/categories/[id]` | admin | admin |

### Sources (admin)
| Método | Path | Caso de uso |
|--------|------|-------------|
| GET/POST | `/api/admin/sources` | `AddSource` |
| PUT/DELETE | `/api/admin/sources/[id]` | `EditSource` / `DeleteSource` / `ToggleSource` |

### Favorites
| Método | Path | Caso de uso |
|--------|------|-------------|
| GET/POST | `/api/favorites` | `GetFavorites` / `AddFavorite` |
| DELETE | `/api/favorites/[id]` | `DeleteFavorite` |

### Notifications
| Método | Path | Caso de uso |
|--------|------|-------------|
| PUT | `/api/notifications/[id]/read` | `MarkNotificationRead` |

### Stories (Story Timeline)
| Método | Path | Caso de uso |
|--------|------|-------------|
| GET/POST | `/api/stories` | `ListUserStories` / `FollowArticle` |
| GET/DELETE | `/api/stories/[id]` | `GetStoryTimeline` / `UnfollowStory` |

### Events (News Bias Radar)
| Método | Path | Caso de uso |
|--------|------|-------------|
| GET | `/api/events/[id]` | `GetNewsEvent` |

### Cron (service-to-service)
| Método | Path | Qué hace |
|--------|------|----------|
| GET | `/api/cron/sync` | `SyncArticles` + `HealArticles` (fetch + dedup + categorize + embed + cluster + sentiment) |
| GET | `/api/cron/notifications` | `SendNotifications` (detecta nuevas por categoría + email) |

## Patrón de handler protegido

```ts
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  // validación mínima de shape
  const useCase = new TheUseCase(new PrismaXRepository(), /* otros puertos */);
  const result = await useCase.execute({ userId: session.user.id, ...body });
  return NextResponse.json(result);
}
```

## Patrón de handler cron

```ts
export const runtime = "nodejs";
export const maxDuration = 60;
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  if (req.headers.get("authorization") !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  // ensamblar + ejecutar
}
```

## Al añadir un endpoint

1. Crea `src/app/api/<feature>/[...]/route.ts`.
2. Importa `auth` si es protegido, o comprueba `CRON_SECRET` si es cron.
3. Instancia los repos Prisma y el caso de uso con DI manual.
4. Valida input mínimo; devuelve errores consistentes.
5. Añade la fila correspondiente a este archivo (`api-routes.md`).
