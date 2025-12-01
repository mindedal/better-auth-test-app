import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { Ratelimit } from "@upstash/ratelimit";
import { redis } from "@/lib/redis";
import { getSessionCookie } from "better-auth/cookies";

const ratelimit = new Ratelimit({
  redis: redis,
  limiter: Ratelimit.slidingWindow(10, "10 s"),
});

// Routes that require authentication
const protectedRoutes = ["/dashboard", "/admin", "/settings"];

// Routes that should redirect to dashboard if already authenticated
const authRoutes = ["/login", "/register", "/signup"];

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Rate limiting for API routes
  if (pathname.startsWith("/api")) {
    const ip = request.headers.get("x-forwarded-for") ?? "127.0.0.1";
    const { success, limit, reset, remaining } = await ratelimit.limit(ip);

    if (!success) {
      return NextResponse.json(
        { error: "Too Many Requests" },
        {
          status: 429,
          headers: {
            "X-RateLimit-Limit": limit.toString(),
            "X-RateLimit-Remaining": remaining.toString(),
            "X-RateLimit-Reset": reset.toString(),
          },
        }
      );
    }
  }

  // Use better-auth's getSessionCookie for optimistic session check
  // NOTE: This only checks cookie presence, not validity - full validation happens in pages/API routes
  const sessionCookie = getSessionCookie(request);

  // Protect authenticated routes
  const isProtectedRoute = protectedRoutes.some((route) =>
    pathname.startsWith(route)
  );

  if (isProtectedRoute && !sessionCookie) {
    const redirectUrl = new URL("/login", request.url);
    redirectUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(redirectUrl);
  }

  // Redirect authenticated users away from auth pages
  const isAuthRoute = authRoutes.some((route) => pathname.startsWith(route));

  // Don't redirect to dashboard if coming from a failed auth check (prevents infinite redirect loop
  // when session cookie exists but is invalid/expired - dashboard validates and redirects back with this param)
  const fromAuthFailure = request.nextUrl.searchParams.get("auth") === "failed";
  if (isAuthRoute && sessionCookie && !fromAuthFailure) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};