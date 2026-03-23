export { auth as proxy } from "@/lib/auth";

export const config = {
  matcher: [
    "/categories/:path*",
    "/favorites/:path*",
    "/sources/:path*",
    "/notifications/:path*",
    "/admin/:path*",
    "/api/articles/:path*",
    "/api/categories/:path*",
    "/api/favorites/:path*",
    "/api/notifications/:path*",
    "/api/admin/:path*",
  ],
};
