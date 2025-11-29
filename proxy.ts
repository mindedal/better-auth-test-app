import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { Ratelimit } from "@upstash/ratelimit";
import { redis } from "@/lib/redis";

const ratelimit = new Ratelimit({
  redis: redis,
  limiter: Ratelimit.slidingWindow(10, "10 s"),
});

export async function proxy(request: NextRequest) {
  if (request.nextUrl.pathname.startsWith("/api")) {
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

  const sessionToken = request.cookies.get("better-auth.session_token");

  if (request.nextUrl.pathname.startsWith("/dashboard") || request.nextUrl.pathname.startsWith("/admin")) {
    if (!sessionToken) {
      return NextResponse.redirect(new URL("/login", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};