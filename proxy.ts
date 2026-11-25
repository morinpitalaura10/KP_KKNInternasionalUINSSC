import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

function hasValidRoleSession(request: NextRequest, expectedRole: 'admin' | 'staff' | 'mahasiswa'): boolean {
  const userRole = request.cookies.get('user_role')?.value;
  const userSession = request.cookies.get('user_session')?.value;

  if (!userRole || userRole !== expectedRole || !userSession) {
    return false;
  }

  try {
    const parsed = JSON.parse(decodeURIComponent(userSession));
    if (!parsed || parsed.role !== expectedRole || (!parsed.id && !parsed.id_user)) {
      return false;
    }
    return true;
  } catch {
    return false;
  }
}

function redirectToLoginAndClearCookies(request: NextRequest, pathname: string) {
  const loginUrl = new URL('/login', request.url);
  loginUrl.searchParams.set('redirect', pathname);
  const res = NextResponse.redirect(loginUrl);
  res.cookies.set('user_role', '', { path: '/', maxAge: 0 });
  res.cookies.set('user_session', '', { path: '/', maxAge: 0 });
  res.cookies.set('bridge_token', '', { path: '/', maxAge: 0 });
  return res;
}

/**
 * Next.js 16 Proxy (formerly middleware)
 * Protects administrative and authenticated role portals at the edge/server level.
 * Prevents unauthorized users from entering /admin, /staff, or /mahasiswa without logging in first.
 */
export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Protect /admin routes
  if (pathname.startsWith('/admin')) {
    if (!hasValidRoleSession(request, 'admin')) {
      return redirectToLoginAndClearCookies(request, pathname);
    }
  }

  // Protect /staff routes
  if (pathname.startsWith('/staff')) {
    if (!hasValidRoleSession(request, 'staff')) {
      return redirectToLoginAndClearCookies(request, pathname);
    }
  }

  // Protect /mahasiswa routes
  if (pathname.startsWith('/mahasiswa')) {
    if (!hasValidRoleSession(request, 'mahasiswa')) {
      return redirectToLoginAndClearCookies(request, pathname);
    }
  }

  const response = NextResponse.next();

  // When visiting /login or public pages (/), clear any stale auth cookies so users must log in explicitly
  if (
    pathname === '/' ||
    pathname === '/login' ||
    pathname === '/informasi' ||
    pathname === '/persyaratan' ||
    pathname === '/timeline' ||
    pathname.startsWith('/pengumuman')
  ) {
    response.cookies.set('user_role', '', { path: '/', maxAge: 0 });
    response.cookies.set('user_session', '', { path: '/', maxAge: 0 });
    response.cookies.set('bridge_token', '', { path: '/', maxAge: 0 });
  }

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
  matcher: [
    '/',
    '/informasi',
    '/persyaratan',
    '/timeline',
    '/pengumuman/:path*',
    '/admin/:path*',
    '/staff/:path*',
    '/mahasiswa/:path*',
    '/login',
  ],
};
