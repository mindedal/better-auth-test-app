import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  const cookieHeader = request.headers.get("cookie") || "";
  
  console.log("Middleware: Incoming Request", {
    path: request.nextUrl.pathname,
    cookieLength: cookieHeader.length,
    cookieStart: cookieHeader.substring(0, 20) + "..."
  });

  try {
    const res = await fetch(`${request.nextUrl.origin}/api/auth/get-session`, {
        headers: {
            cookie: cookieHeader,
        },
    });

    console.log("Middleware: API Response Status", res.status);

    const session = await res.json();
    
    console.log("Middleware: Session Data", {
        sessionFound: !!session,
        userEmail: session?.user?.email,
        role: session?.user?.role
    });

    if (!session || !session.session) {
        return NextResponse.redirect(new URL("/login", request.url));
    }

    if (request.nextUrl.pathname.startsWith("/admin")) {
        if (session.user.role !== "admin") {
        return NextResponse.redirect(new URL("/dashboard", request.url));
        }
    }

    return NextResponse.next();
  } catch (error) {
      console.error("Middleware: Error fetching session", error);
      return NextResponse.redirect(new URL("/login", request.url));
  }
}

export const config = {
  matcher: ["/dashboard", "/admin"],
};
