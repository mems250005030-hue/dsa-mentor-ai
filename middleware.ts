export { default } from "next-auth/middleware";

export const config = {
  matcher: ["/dashboard/:path*", "/roadmap/:path*", "/problems/:path*", "/interview/:path*", "/contests/:path*", "/reports/:path*", "/profile/:path*", "/admin/:path*"]
};
