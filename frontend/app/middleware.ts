import { NextRequest, NextResponse } from "next/server";

export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // ============ ADMIN ROUTES ============
  if (pathname.startsWith("/admin")) {
    const authCookie = request.cookies.get("admin-auth-storage")?.value;

    // For /admin/dashboard/* - require authentication
    if (pathname.startsWith("/admin/dashboard")) {
      if (!authCookie) {
        return NextResponse.redirect(new URL("/login", request.url));
      }

      try {
        const authData = JSON.parse(authCookie);
        const { state } = authData;

        // Check if token exists and user is authenticated
        if (!state?.token || !state?.isAuthenticated) {
          return NextResponse.redirect(new URL("/login", request.url));
        }

        // Allow access
        return NextResponse.next();
      } catch (error) {
        // Invalid auth data, redirect to login
        return NextResponse.redirect(new URL("/login", request.url));
      }
    }
  }

  // ============ LOGIN PAGE ============
  if (pathname === "/login") {
    const authCookie = request.cookies.get("admin-auth-storage")?.value;

    // If already authenticated, redirect to dashboard
    if (authCookie) {
      try {
        const authData = JSON.parse(authCookie);
        if (authData.state?.token && authData.state?.isAuthenticated) {
          return NextResponse.redirect(
            new URL("/admin/dashboard", request.url),
          );
        }
      } catch (e) {
        // Invalid token, allow access to login
      }
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    // Match admin dashboard routes
    "/admin/dashboard/:path*",
    // Match login page
    "/login",
  ],
};
