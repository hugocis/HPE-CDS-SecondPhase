import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    // Redirigir a /auth/signin con el callbackUrl
    const isAuthenticated = !!req.nextauth.token;
    if (!isAuthenticated) {
      const signInUrl = new URL('/auth/signin', req.url);
      signInUrl.searchParams.set('callbackUrl', req.url);
      return NextResponse.redirect(signInUrl);
    }
    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
  }
);

export const config = {
  matcher: [
    "/profile/:path*",
    "/book-hotel/:path*",
    "/book-route/:path*",
    "/book-service/:path*",
    "/book-vehicle/:path*",
    "/orders/:path*",
    "/checkout/:path*",
  ],
};