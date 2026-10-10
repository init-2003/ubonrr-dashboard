import { NextRequest, NextResponse } from "next/server";
import { verifySessionToken, COOKIE_NAME } from "@/lib/auth";

export async function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;

  // 1. Bypass static assets, images, favicons, and auth API endpoints
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api/auth") ||
    pathname === "/favicon.ico" ||
    pathname.includes(".") // static files like .png, .jpg, .svg, .css, .js
  ) {
    return NextResponse.next();
  }

  const sessionCookie = request.cookies.get(COOKIE_NAME);
  const user = sessionCookie?.value ? await verifySessionToken(sessionCookie.value) : null;
  const isAuthenticated = !!user;

  // 2. If visiting /login
  if (pathname === "/login") {
    if (isAuthenticated) {
      // Already logged in, redirect to dashboard
      const redirectUrl = request.nextUrl.searchParams.get("redirect") || "/overview";
      return NextResponse.redirect(new URL(redirectUrl, request.url));
    }
    return NextResponse.next();
  }

  // 3. If accessing protected API endpoints without valid auth
  if (pathname.startsWith("/api/")) {
    if (!isAuthenticated) {
      return NextResponse.json(
        { error: "Unauthorized - กรุณาเข้าสู่ระบบก่อนใช้งาน" },
        { status: 401 }
      );
    }
    return NextResponse.next();
  }

  // 4. If accessing protected pages without auth
  if (!isAuthenticated) {
    const fullPath = pathname + search;
    const loginUrl = new URL("/login", request.url);
    if (fullPath !== "/" && fullPath !== "") {
      loginUrl.searchParams.set("redirect", fullPath);
    }
    return NextResponse.redirect(loginUrl);
  }

  // 5. If logged in and visiting root path `/`
  if (pathname === "/") {
    return NextResponse.redirect(new URL("/overview", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};
