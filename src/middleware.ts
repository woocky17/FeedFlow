export { auth as middleware } from "@/lib/auth";

export const config = {
  matcher: [
    "/((?!login|register|forgot-password|api/auth|_next/static|_next/image|favicon.ico).*)",
  ],
};
