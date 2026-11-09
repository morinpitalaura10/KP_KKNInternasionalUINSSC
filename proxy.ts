import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * Next.js 16 Proxy (formerly middleware)
 * Protects administrative and authenticated role portals at the edge/server level.
 * Prevents unauthorized users from entering /admin, /staff, or /mahasiswa without logging in first.
 */
export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const userRole = request.cookies.get('user_role')?.value;

  // Protect /admin routes
  if (pathname.startsWith('/admin')) {
    if (!userRole || userRole !== 'admin') {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  // Protect /staff routes
  if (pathname.startsWith('/staff')) {
    if (!userRole || userRole !== 'staff') {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  // Protect /mahasiswa routes
  if (pathname.startsWith('/mahasiswa')) {
    if (!userRole || userRole !== 'mahasiswa') {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  // If already logged in and visiting /login, redirect directly to dashboard
  if (pathname === '/login') {
    if (userRole === 'admin') {
      return NextResponse.redirect(new URL('/admin', request.url));
    }
    if (userRole === 'staff') {
      return NextResponse.redirect(new URL('/staff', request.url));
    }
    if (userRole === 'mahasiswa') {
      return NextResponse.redirect(new URL('/mahasiswa', request.url));
    }
  }

  const response = NextResponse.next();

  // Enforce zero cache on protected pages to disable browser bfcache and back/forward leak
  if (
    pathname.startsWith('/admin') ||
    pathname.startsWith('/staff') ||
    pathname.startsWith('/mahasiswa')
  ) {
    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    response.headers.set('Pragma', 'no-cache');
    response.headers.set('Expires', '0');
  }

  return response;
}

export const config = {
  matcher: ['/admin/:path*', '/staff/:path*', '/mahasiswa/:path*', '/login'],
};
