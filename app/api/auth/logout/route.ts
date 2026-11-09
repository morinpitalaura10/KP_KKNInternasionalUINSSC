import { NextResponse } from 'next/server';

export async function POST() {
  const response = NextResponse.json({
    success: true,
    message: 'Logout berhasil!',
  });

  // Clear authentication cookies
  response.cookies.set('user_role', '', {
    path: '/',
    maxAge: 0,
    expires: new Date(0),
  });

  response.cookies.set('user_session', '', {
    path: '/',
    maxAge: 0,
    expires: new Date(0),
  });

  response.cookies.set('bridge_token', '', {
    path: '/',
    maxAge: 0,
    expires: new Date(0),
  });

  return response;
}

export async function GET(request: Request) {
  const loginUrl = new URL('/login', request.url);
  const response = NextResponse.redirect(loginUrl);

  response.cookies.set('user_role', '', {
    path: '/',
    maxAge: 0,
    expires: new Date(0),
  });

  response.cookies.set('user_session', '', {
    path: '/',
    maxAge: 0,
    expires: new Date(0),
  });

  response.cookies.set('bridge_token', '', {
    path: '/',
    maxAge: 0,
    expires: new Date(0),
  });

  return response;
}
