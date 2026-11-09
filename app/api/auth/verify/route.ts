import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const sessionCookie = req.cookies.get('user_session')?.value;
    const roleCookie = req.cookies.get('user_role')?.value;

    if (!sessionCookie || !roleCookie) {
      return NextResponse.json(
        { valid: false, reason: 'unauthenticated', message: 'Sesi tidak ditemukan' },
        { status: 401 }
      );
    }

    let userId: number | null = null;
    let userEmail: string | null = null;

    try {
      const parsed = JSON.parse(decodeURIComponent(sessionCookie));
      userId = parsed.id_user || (parsed.id ? Number(parsed.id) : null);
      userEmail = parsed.email || null;
    } catch {
      return NextResponse.json(
        { valid: false, reason: 'malformed_session', message: 'Format sesi tidak valid' },
        { status: 400 }
      );
    }

    if (!userId && !userEmail) {
      return NextResponse.json(
        { valid: false, reason: 'invalid_identity', message: 'Identitas sesi tidak valid' },
        { status: 400 }
      );
    }

    // Cari user di database
    const user = await prisma.user.findFirst({
      where: userId ? { id_user: userId } : { email: userEmail! },
      select: {
        id_user: true,
        nama: true,
        email: true,
        role: true,
        status: true,
      },
    });

    // Jika akun tidak ditemukan (misal telah dihapus)
    if (!user) {
      const response = NextResponse.json(
        {
          valid: false,
          reason: 'deleted',
          message: 'Akun Anda tidak lagi terdaftar di sistem atau telah dihapus.',
        },
        { status: 401 }
      );
      // Bersihkan cookies
      response.cookies.set('user_role', '', { path: '/', maxAge: 0 });
      response.cookies.set('user_session', '', { path: '/', maxAge: 0 });
      response.cookies.set('bridge_token', '', { path: '/', maxAge: 0 });
      return response;
    }

    // Jika akun dinonaktifkan
    if (!user.status) {
      const response = NextResponse.json(
        {
          valid: false,
          reason: 'inactive',
          message: 'Akun Anda telah dinonaktifkan oleh administrator.',
        },
        { status: 403 }
      );
      response.cookies.set('user_role', '', { path: '/', maxAge: 0 });
      response.cookies.set('user_session', '', { path: '/', maxAge: 0 });
      response.cookies.set('bridge_token', '', { path: '/', maxAge: 0 });
      return response;
    }

    // Akun valid dan aktif
    return NextResponse.json({
      valid: true,
      user: {
        id_user: user.id_user,
        nama: user.nama,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error('Error verifying auth session:', error);
    return NextResponse.json(
      { valid: true, warning: 'Database verification skipped due to error' },
      { status: 200 }
    );
  }
}

