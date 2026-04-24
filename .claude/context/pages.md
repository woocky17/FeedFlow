# Pages — Next.js App Router UI

Ubicación: `src/app/**/page.tsx`. Layouts: `src/app/layout.tsx` (raíz) y `src/app/(pages)/layout.tsx` si existe.

## Rutas

| Ruta | Archivo | Auth | Propósito |
|------|---------|------|-----------|
| `/` | `src/app/page.tsx` | user | Feed principal con filtros por categoría y búsqueda |
| `/login` | `src/app/(pages)/login/page.tsx` | público | Form de login (`LoginForm` organism) |
| `/register` | `src/app/(pages)/register/page.tsx` | público | Form de registro |
| `/forgot-password` | `src/app/(pages)/forgot-password/page.tsx` | público | Form de recuperación |
| `/categories` | `src/app/(pages)/categories/page.tsx` | user | Gestión de categorías custom del usuario |
| `/sources` | `src/app/(pages)/sources/page.tsx` | user | Activar/desactivar fuentes para su feed |
| `/notifications` | `src/app/(pages)/notifications/page.tsx` | user | Ver + marcar notificaciones como leídas |
| `/stories` | `src/app/(pages)/stories/page.tsx` | user | Listado de stories seguidas |
| `/stories/[id]` | `src/app/(pages)/stories/[id]/page.tsx` | user | Timeline de una story |
| `/events/[id]` | `src/app/(pages)/events/[id]/page.tsx` | user | News Bias Radar para un `NewsEvent` (framings por fuente) |
| `/admin` | `src/app/(pages)/admin/page.tsx` | admin | Panel de administración (categorías default + fuentes) |

## Convención de grupo de rutas

Next.js App Router permite `(group)` en la ruta para compartir layout sin afectar la URL. `(pages)` agrupa las páginas "no-raíz" que pueden compartir `auth-layout` o `app-layout`.

## Patrón típico — server component con fetch

```tsx
// src/app/(pages)/stories/page.tsx
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { PrismaStoryRepository } from "@/infrastructure/db/prisma/story-repository-impl";
import { ListUserStories } from "@/application/story";

export default async function StoriesPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const useCase = new ListUserStories(new PrismaStoryRepository());
  const stories = await useCase.execute(session.user.id);
  return <StoriesList stories={stories} />;
}
```

- Las pages son **server components** por defecto — se ejecutan en el servidor, pueden instanciar repos directamente y llamar casos de uso sin pasar por `/api`.
- Los forms y componentes interactivos son **client components** (`"use client"`).

## Metadata / SEO

Usa `export const metadata` o `generateMetadata` en cada página relevante (Next.js estándar). Aún no establecido como convención estricta — añadir cuando se ataque SEO.

## Al añadir una página

1. Crea la carpeta y `page.tsx` bajo `src/app/(pages)/<ruta>/` (o raíz si es pública crítica).
2. Decide server vs client (default: server).
3. Si es protegida, comprueba `auth()` y redirige.
4. Instancia repos + caso de uso o hace `fetch` a `/api/...`.
5. Actualiza este archivo con la nueva ruta.
