import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { validateStrongPassword } from '@/lib/passwordPolicy';

function mapAdmin(user: any) {
  return {
    id: user.id_user,
    id_user: user.id_user,
    nama: user.nama,
    email: user.email,
    role: user.role,
    status: user.status,
    created_at: user.created_at,
    updated_at: user.updated_at,
  };
}

// GET /api/admin/users - List all admin accounts
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const search = searchParams.get('search') || '';
    const id = searchParams.get('id');

    if (id) {
      const user = await prisma.user.findFirst({
        where: { id_user: parseInt(id, 10), role: 'admin' },
        select: {
          id_user: true,
          nama: true,
          email: true,
          role: true,
          status: true,
          created_at: true,
          updated_at: true,
        },
      });
      if (!user) {
        return NextResponse.json({ success: false, message: 'Admin tidak ditemukan' }, { status: 404 });
      }
      return NextResponse.json({ success: true, data: mapAdmin(user) });
    }

    const where: any = { role: 'admin' };
    if (search) {
      where.OR = [
        { nama: { contains: search } },
        { email: { contains: search } },
      ];
    }

    const users = await prisma.user.findMany({
      where,
      select: {
        id_user: true,
        nama: true,
        email: true,
        role: true,
        status: true,
        created_at: true,
        updated_at: true,
      },
      orderBy: { id_user: 'asc' },
    });

    return NextResponse.json({ success: true, data: users.map(mapAdmin) });
  } catch (error) {
    console.error('Error fetching admin accounts:', error);
    return NextResponse.json(
      { success: false, message: 'Gagal memuat daftar akun admin dari database' },
      { status: 500 }
    );
  }
}

// POST /api/admin/users - Create new admin account
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { nama, email, password, status } = body;

    if (!nama || !email || !password) {
      return NextResponse.json(
        { success: false, message: 'Nama, email, dan password wajib diisi!' },
        { status: 400 }
      );
    }

    // Validasi Strong Password (8-16 karakter, kombinasi kapital, huruf kecil, dan angka)
    const pwValidation = validateStrongPassword(password);
    if (!pwValidation.valid) {
      return NextResponse.json(
        { success: false, message: pwValidation.message },
        { status: 400 }
      );
    }

    const cleanEmail = String(email).trim().toLowerCase();
    const existingUser = await prisma.user.findUnique({
      where: { email: cleanEmail },
    });

    if (existingUser) {
      return NextResponse.json(
        { success: false, message: 'Email sudah terdaftar di sistem!' },
        { status: 409 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newAdmin = await prisma.user.create({
      data: {
        nama: String(nama).trim(),
        email: cleanEmail,
        password: hashedPassword,
        role: 'admin',
        status: status !== undefined ? Boolean(status) : true,
      },
      select: {
        id_user: true,
        nama: true,
        email: true,
        role: true,
        status: true,
        created_at: true,
      },
    });

    return NextResponse.json({
      success: true,
      message: `Akun Admin "${newAdmin.nama}" berhasil dibuat!`,
      data: mapAdmin(newAdmin),
    });
  } catch (error) {
    console.error('Error creating admin:', error);
    return NextResponse.json(
      { success: false, message: 'Gagal membuat akun admin baru' },
      { status: 500 }
    );
  }
}

// PUT /api/admin/users - Update admin account
export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, id_user, nama, email, password, status } = body;

    const targetId = parseInt(String(id || id_user), 10);
    if (!targetId || isNaN(targetId)) {
      return NextResponse.json(
        { success: false, message: 'ID Admin wajib disertakan!' },
        { status: 400 }
      );
    }

    const existing = await prisma.user.findFirst({
      where: { id_user: targetId, role: 'admin' },
    });

    if (!existing) {
      return NextResponse.json(
        { success: false, message: 'Akun Admin tidak ditemukan!' },
        { status: 404 }
      );
    }

    // Jika ingin menonaktifkan admin, cek jangan sampai tidak ada admin aktif sama sekali
    if (status === false && existing.status === true) {
      const activeAdminCount = await prisma.user.count({
        where: { role: 'admin', status: true },
      });
      if (activeAdminCount <= 1) {
        return NextResponse.json(
          {
            success: false,
            message: 'Tidak dapat menonaktifkan akun admin ini karena minimal harus ada 1 Admin yang aktif!',
          },
          { status: 400 }
        );
      }
    }

    const updateData: any = {};
    if (nama !== undefined) updateData.nama = String(nama).trim();
    if (status !== undefined) updateData.status = Boolean(status);

    if (email) {
      const cleanEmail = String(email).trim().toLowerCase();
      if (cleanEmail !== existing.email) {
        const dupEmail = await prisma.user.findUnique({
          where: { email: cleanEmail },
        });
        if (dupEmail) {
          return NextResponse.json(
            { success: false, message: 'Email sudah digunakan oleh user lain!' },
            { status: 409 }
          );
        }
        updateData.email = cleanEmail;
      }
    }

    if (password && String(password).trim().length > 0) {
      const cleanPw = String(password).trim();
      const pwValidation = validateStrongPassword(cleanPw);
      if (!pwValidation.valid) {
        return NextResponse.json(
          { success: false, message: pwValidation.message },
          { status: 400 }
        );
      }
      updateData.password = await bcrypt.hash(cleanPw, 10);
    }

    const updated = await prisma.user.update({
      where: { id_user: targetId },
      data: updateData,
      select: {
        id_user: true,
        nama: true,
        email: true,
        role: true,
        status: true,
        created_at: true,
        updated_at: true,
      },
    });

    // Cek apakah admin menonaktifkan akunnya sendiri
    const sessionCookie = req.cookies.get('user_session')?.value;
    let isSelf = false;
    if (sessionCookie) {
      try {
        const parsed = JSON.parse(decodeURIComponent(sessionCookie));
        const currentId = parsed.id_user || (parsed.id ? Number(parsed.id) : null);
        if (currentId === targetId) {
          isSelf = true;
        }
      } catch {}
    }

    const response = NextResponse.json({
      success: true,
      message: `Akun Admin "${updated.nama}" berhasil diperbarui!`,
      data: mapAdmin(updated),
      isSelf,
      isDeactivatedSelf: isSelf && updated.status === false,
    });

    if (isSelf && updated.status === false) {
      response.cookies.set('user_role', '', { path: '/', maxAge: 0 });
      response.cookies.set('user_session', '', { path: '/', maxAge: 0 });
      response.cookies.set('bridge_token', '', { path: '/', maxAge: 0 });
    }

    return response;
  } catch (error) {
    console.error('Error updating admin:', error);
    return NextResponse.json(
      { success: false, message: 'Gagal memperbarui akun admin' },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/users - Delete admin account
export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id') || searchParams.get('id_user');

    if (!id) {
      return NextResponse.json(
        { success: false, message: 'ID Admin wajib disertakan!' },
        { status: 400 }
      );
    }

    const targetId = parseInt(id, 10);
    const existing = await prisma.user.findFirst({
      where: { id_user: targetId, role: 'admin' },
    });

    if (!existing) {
      return NextResponse.json(
        { success: false, message: 'Akun Admin tidak ditemukan!' },
        { status: 404 }
      );
    }

    // Pastikan tidak menghapus satu-satunya admin
    const totalAdmin = await prisma.user.count({
      where: { role: 'admin' },
    });
    if (totalAdmin <= 1) {
      return NextResponse.json(
        {
          success: false,
          message: 'Sistem harus memiliki minimal 1 Akun Admin aktif. Anda tidak dapat menghapus akun ini.',
        },
        { status: 400 }
      );
    }

    // Deteksi apakah admin yang dihapus adalah akun yang sedang aktif login
    const sessionCookie = req.cookies.get('user_session')?.value;
    let isSelf = false;
    if (sessionCookie) {
      try {
        const parsed = JSON.parse(decodeURIComponent(sessionCookie));
        const currentId = parsed.id_user || (parsed.id ? Number(parsed.id) : null);
        if (currentId === targetId) {
          isSelf = true;
        }
      } catch {}
    }

    await prisma.user.delete({
      where: { id_user: targetId },
    });

    const response = NextResponse.json({
      success: true,
      message: `Akun Admin "${existing.nama}" berhasil dihapus dari sistem.`,
      isSelf,
    });

    // Jika admin menghapus akunnya sendiri, bersihkan cookie auth agar otomatis logout
    if (isSelf) {
      response.cookies.set('user_role', '', { path: '/', maxAge: 0 });
      response.cookies.set('user_session', '', { path: '/', maxAge: 0 });
      response.cookies.set('bridge_token', '', { path: '/', maxAge: 0 });
    }

    return response;
  } catch (error: any) {
    console.error('Error deleting admin:', error);
    // Tangani jika ada foreign key constraint (misal admin pernah publish pengumuman/informasi)
    if (error.code === 'P2003') {
      return NextResponse.json(
        {
          success: false,
          message:
            'Akun admin tidak dapat dihapus karena telah memiliki riwayat data (seperti pengumuman/informasi). Silakan ubah status akun menjadi Nonaktif sebagai gantinya.',
        },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { success: false, message: 'Gagal menghapus akun admin dari database.' },
      { status: 500 }
    );
  }
}
