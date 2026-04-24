# Autenticación — NextAuth v5 beta

Archivo clave: `src/lib/auth.ts`. Rutas: `src/app/api/auth/[...nextauth]/route.ts` (handlers), `src/app/(pages)/login`, `/register`, `/forgot-password`.

## Configuración

- **Provider**: `Credentials` (email + password). Sin OAuth hasta nuevo aviso.
- **Password**: hasheadas con `bcryptjs` (`bcrypt.compare` en `authorize`).
- **Adapter**: ninguno — NextAuth v5 gestiona sesiones como JWT. La BD de usuarios es la propia de FeedFlow (`users` de Prisma), accedida por `PrismaUserRepository.findByEmail`.
- **Strategy**: JWT (default sin adapter).
- **Pages**: `signIn: "/login"` (redirige ahí si falta sesión).

## Callbacks

- `authorized({ auth })` → `!!auth?.user`. Base para middleware simple.
- `jwt({ token, user })` → si `user` (primer login), copia `role` al token.
- `session({ session, token })` → expone `id` (`token.sub`) y `role` en `session.user`.

```ts
// Forma de session.user en runtime:
{ id: string; email: string; role: "USER" | "ADMIN"; name?: string; image?: string }
```

## Uso en handlers API

```ts
import { auth } from "@/lib/auth";

export async function GET() {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (session.user.role !== "ADMIN") return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  // …
}
```

## Uso en server components / pages

```ts
import { auth } from "@/lib/auth";
const session = await auth();
if (!session?.user) redirect("/login");
```

## Sign-in / sign-out

```ts
import { signIn, signOut } from "@/lib/auth";
await signIn("credentials", { email, password, redirectTo: "/" });
await signOut({ redirectTo: "/login" });
```

Formularios en `src/components/organisms/login-form.tsx`, `register-form.tsx`, `forgot-password-form.tsx`.

## Registro y recuperación

- Registro: `POST /api/auth/register` → `RegisterUser` (caso de uso) — valida email único, hashea con bcrypt, guarda en BD.
- Recuperar password: `POST /api/auth/recover-password` → `RecoverPassword` — genera token, envía email vía `ResendEmailAdapter`.

## Middleware

No hay middleware global custom aún (`middleware.ts` no existe al momento de escribir esto). Cada ruta API comprueba sesión inline. Si se añade middleware, probablemente vaya en `src/middleware.ts` con matcher sobre rutas `/api/*` protegidas y `/(pages)/*` privadas.

## Al modificar auth

- Añadir un provider nuevo: meterlo en el array `providers` de `src/lib/auth.ts` y actualizar este archivo.
- Si se añade un adapter Prisma, cambia la estrategia de sesión — documenta en este archivo.
- El campo `role` se propaga vía JWT; si añades más campos custom al token, actualiza también `jwt` y `session` callbacks.
