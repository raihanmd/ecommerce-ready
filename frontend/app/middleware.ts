import { NextRequest, NextResponse } from 'next/server';

export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // Admin route protection
  if (pathname.startsWith('/admin')) {
    const token = request.cookies.get('admin-auth-storage')?.value;

    // Allow login page without authentication
    if (pathname === '/admin/login') {
      // If already authenticated, redirect to dashboard
      if (token) {
        try {
          const authData = JSON.parse(token);
          if (authData.state?.token) {
            return NextResponse.redirect(new URL('/admin/dashboard', request.url));
          }
        } catch (e) {
          // Invalid token, allow access to login
        }
      }
      return NextResponse.next();
    }

    // For other admin routes, require authentication
    if (!token) {
      return NextResponse.redirect(new URL('/admin/login', request.url));
    }

    try {
      const authData = JSON.parse(token);
      const { state } = authData;

      // Check if token exists and user is authenticated
      if (!state?.token || !state?.isAuthenticated) {
        return NextResponse.redirect(new URL('/admin/login', request.url));
      }

      // Verify token hasn't expired (optional - add token expiration check here)
      // This is a basic check; implement proper JWT validation on backend

      // Allow the request to proceed
      return NextResponse.next();
    } catch (error) {
      // Invalid auth data, redirect to login
      return NextResponse.redirect(new URL('/admin/login', request.url));
    }
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
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|public).*)',
  ],
};
