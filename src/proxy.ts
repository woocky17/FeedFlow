export { auth as proxy } from "@/lib/auth";

export const config = {
  matcher: [
    "/categories/:path*",
    "/sources/:path*",
    "/notifications/:path*",
    "/admin/:path*",
    "/api/favorites/:path*",
    "/api/notifications/:path*",
    "/api/admin/:path*",
  ],
};
