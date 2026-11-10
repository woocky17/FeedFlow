# Autenticación: NextAuth v5 beta

Archivo clave: `src/lib/auth.ts` (único punto de auth). Rutas: `src/app/api/auth/[...nextauth]/route.ts` (handlers), `src/app/(pages)/login`, `/register`, `/forgot-password`. Protección por rutas: `src/proxy.ts`.

Comportamiento (registro, login, cierre de sesión, recuperación de contraseña, qué páginas y APIs exigen sesión o rol): `openspec/specs/auth/spec.md`.

## Configuración

- **Provider**: `Credentials` (email + password). Sin OAuth.
- **Password**: hash con `bcryptjs` (`bcrypt.compare` en `authorize`).
- **Adapter**: ninguno; la sesión es JWT. Los usuarios se leen con `PrismaUserRepository.findByEmail`.
- **Pages**: `signIn: "/login"`.
- **Secreto**: NextAuth v5 lo toma de `AUTH_SECRET`/`NEXTAUTH_SECRET`; `src/lib/auth.ts` no pasa `secret` ni `trustHost`.

## Callbacks

- `authorized({ auth })` → `!!auth?.user`. Es lo que usa `src/proxy.ts`.
- `jwt({ token, user, trigger, session })` → en el primer login copia `role` y `language` al token; con `trigger === "update"` y `session.language` actualiza el idioma.
- `session({ session, token })` → expone `id` (`token.sub`), `role` y `language` (por defecto `"es"`) en `session.user`.

```ts
// Forma de session.user en runtime (tipos en src/types/next-auth.d.ts):
{ id: string; email: string; role: "user" | "admin"; language: "es" | "en" }
```

El rol va en minúscula: el dominio usa `UserRole = "user" | "admin"` y `user-repository-impl.ts` lo traduce desde el enum Prisma `USER | ADMIN`.

## Protección de rutas: `src/proxy.ts`

Next 16 usa `src/proxy.ts`, no `middleware.ts`. Exporta `export { auth as proxy } from "@/lib/auth"` con un `matcher` que cubre `/categories`, `/sources`, `/notifications`, `/admin`, `/api/favorites`, `/api/notifications` y `/api/admin`. Lo que no está en el matcher se protege dentro del handler o de la página. Si añades una ruta privada, decide si va al matcher o si se comprueba dentro.

## Uso en handlers API

```ts
import { auth } from "@/lib/auth";

export async function GET() {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (session.user.role !== "admin") return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  // …
}
```

## Uso en server components

```ts
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";

const session = await auth();
if (!session?.user?.id) redirect("/login");
```

Ejemplo real: `src/app/(pages)/settings/page.tsx`.

## Sign-in / sign-out (client components)

```ts
import { signIn, signOut } from "next-auth/react";

const result = await signIn("credentials", { email, password, redirect: false });
if (result?.error) { /* credenciales inválidas */ }

signOut({ callbackUrl: "/" });
```

Formularios en `src/components/organisms/login-form.tsx`, `register-form.tsx`, `forgot-password-form.tsx`; el cierre de sesión está en `src/components/templates/app-layout.tsx`. En el worker no hay `auth()`.

## Al modificar auth

- Provider nuevo: añádelo al array `providers` de `src/lib/auth.ts` y actualiza este archivo.
- Si se añade un adapter Prisma, cambia la estrategia de sesión: documéntalo aquí.
- `role` y `language` viajan en el JWT; si añades campos al token, actualiza los callbacks `jwt` y `session` y `src/types/next-auth.d.ts`.
