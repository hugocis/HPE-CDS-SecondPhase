import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    
    // Si no hay token, redirigir al login
    if (!token) {
      const signInUrl = new URL('/auth/signin', req.url);
      signInUrl.searchParams.set('callbackUrl', req.url);
      return NextResponse.redirect(signInUrl);
    }

    // Cache-Control para rutas autenticadas
    const response = NextResponse.next();
    response.headers.set(
      'Cache-Control',
      'public, s-maxage=60, stale-while-revalidate=300'
    );
    
    return response;
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
  }
);

// Proteger más rutas que requieran autenticación
export const config = {
  matcher: [
    "/profile/:path*",
    "/book-hotel/:path*",
    "/book-route/:path*",
    "/book-service/:path*",
    "/book-vehicle/:path*",
    "/orders/:path*",
    "/checkout/:path*",
    "/api/cart/:path*",
    "/api/orders/:path*",
    "/api/users/:path*",
    "/api/rewards/:path*",
    "/rewards/:path*"
  ],
};