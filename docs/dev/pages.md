# Pages: rutas de UI del App Router

Ubicación: `src/app/page.tsx` (portada) y `src/app/(pages)/**/page.tsx`. Layout raíz: `src/app/layout.tsx`; no hay layout propio de `(pages)`.

Qué muestra y qué permite cada página, y quién puede verla, es comportamiento: está en la spec de su capability.

## Rutas

| Ruta | Archivo | Tipo | Spec |
|------|---------|------|------|
| `/` | `src/app/page.tsx` | client | article-feed, favorites |
| `/login` | `src/app/(pages)/login/page.tsx` | server | auth |
| `/register` | `src/app/(pages)/register/page.tsx` | server | auth |
| `/forgot-password` | `src/app/(pages)/forgot-password/page.tsx` | server | auth |
| `/settings` | `src/app/(pages)/settings/page.tsx` | server | translation |
| `/categories` | `src/app/(pages)/categories/page.tsx` | client | categories |
| `/sources` | `src/app/(pages)/sources/page.tsx` | client | sources |
| `/notifications` | `src/app/(pages)/notifications/page.tsx` | client | notifications |
| `/stories` | `src/app/(pages)/stories/page.tsx` | client | story-timeline |
| `/stories/[id]` | `src/app/(pages)/stories/[id]/page.tsx` | client | story-timeline |
| `/events/[id]` | `src/app/(pages)/events/[id]/page.tsx` | client | bias-radar |
| `/admin` | `src/app/(pages)/admin/page.tsx` | client | categories, sources |

Las specs están en `openspec/specs/<cap>/spec.md`. Qué rutas pasan por `src/proxy.ts`: ver `auth.md`.

## Grupo de rutas

`(pages)` agrupa las páginas no raíz sin afectar a la URL. Cada página monta su plantilla (`AppLayout` o `AuthLayout`, en `src/components/templates/`).

## Patrón de página server

```tsx
import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { auth } from "@/lib/auth";
import { AppLayout } from "@/components/templates/app-layout";

export default async function SettingsPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const t = await getTranslations("settings");
  return <AppLayout title={t("title")}>{/* … */}</AppLayout>;
}
```

- Server component por defecto: puede instanciar repos y casos de uso sin pasar por `/api`.
- Las páginas con estado o interacción son client (`"use client"`) y piden datos con `fetch('/api/...')`; nunca importan casos de uso, repos ni Prisma.
- Textos con `getTranslations` (server) o `useTranslations` (client); claves en `messages/es.json` y `messages/en.json`.

## Metadata / SEO

`export const metadata` o `generateMetadata` en cada página relevante (estándar de Next.js). No es aún una convención estricta.

## Al añadir una página

1. Crea la carpeta y `page.tsx` bajo `src/app/(pages)/<ruta>/`.
2. Decide server o client (por defecto, server).
3. Si es privada, añádela al matcher de `src/proxy.ts` o comprueba `auth()` y redirige.
4. Instancia repos y caso de uso (server) o haz `fetch` a `/api/...` (client).
5. Añade la fila a esta tabla y describe el comportamiento en un change de OpenSpec.
