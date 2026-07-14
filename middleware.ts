import { NextResponse, type NextRequest } from "next/server";

// Edge-level guard, backed by the "__session" cookie set in /app/api/session/route.ts
// after a successful Firebase sign-in. This is a fast pre-check; the client-side
// <ProtectedRoute> in components/auth/protected-route.tsx does the real
// Firebase Auth state verification and handles the redirect/loading UI.
const PROTECTED_PREFIXES = ["/dashboard", "/journal", "/backtesting", "/calculator", "/calendar", "/notes", "/settings"];
const AUTH_PAGES = ["/login", "/signup", "/forgot-password"];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const sessionCookie = request.cookies.get("__session")?.value;

  const isProtected = PROTECTED_PREFIXES.some((p) => pathname.startsWith(p));
  const isAuthPage = AUTH_PAGES.some((p) => pathname.startsWith(p));

  if (isProtected && !sessionCookie) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("redirect", pathname);
    return NextResponse.redirect(url);
  }

  if (isAuthPage && sessionCookie) {
    const url = request.nextUrl.clone();
    url.pathname = "/dashboard";
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/journal/:path*",
    "/backtesting/:path*",
    "/calculator/:path*",
    "/calendar/:path*",
    "/notes/:path*",
    "/settings/:path*",
    "/login",
    "/signup",
    "/forgot-password",
  ],
};
