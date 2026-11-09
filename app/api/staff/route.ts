import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { validateStrongPassword } from '@/lib/passwordPolicy';

// GET /api/staff
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    const search = searchParams.get('search') || '';

    if (id) {
      const item = await prisma.staff.findUnique({
        where: { id_staff: parseInt(id, 10) },
        include: { users: { select: { id_user: true, nama: true, email: true, status: true } } },
      });
      if (!item) {
        return NextResponse.json({ success: false, message: 'Staff tidak ditemukan' }, { status: 404 });
      }
      return NextResponse.json({ success: true, data: mapItem(item) });
    }

    const where = search
      ? { OR: [{ users: { nama: { contains: search } } }, { nip: { contains: search } }] }
      : {};

    const items = await prisma.staff.findMany({
      where,
      include: { users: { select: { id_user: true, nama: true, email: true, status: true } } },
      orderBy: { id_staff: 'asc' },
    });

    return NextResponse.json({ success: true, data: items.map(mapItem) });
  } catch (error) {
    console.error('Error fetching staff:', error);
    return NextResponse.json({ success: false, message: 'Gagal mengambil data staff' }, { status: 500 });
  }
}

// POST /api/staff - Tambah staff baru (beserta akun user)
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { nama, email, password, nip, no_hp } = body;

    if (!nama || !email || !password || !nip || !no_hp) {
      return NextResponse.json(
        { success: false, message: 'nama, email, password, nip, dan no_hp wajib diisi!' },
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

    // Cek email atau NIP sudah ada
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return NextResponse.json({ success: false, message: 'Email sudah terdaftar!' }, { status: 409 });
    }
    const existingNip = await prisma.staff.findUnique({ where: { nip } });
    if (existingNip) {
      return NextResponse.json({ success: false, message: 'NIP sudah terdaftar!' }, { status: 409 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    // Buat user dan staff dalam satu transaksi
    const result = await prisma.$transaction(async (tx) => {
      const newUser = await tx.user.create({
        data: {
          nama,
          email,
          password: hashedPassword,
          role: 'staff',
          status: true,
        },
      });

      const newStaff = await tx.staff.create({
        data: {
          id_user: newUser.id_user,
          nip,
          no_hp,
          status: true,
        },
        include: { users: { select: { id_user: true, nama: true, email: true, status: true } } },
      });

      return newStaff;
    });

    return NextResponse.json({ success: true, data: mapItem(result), message: 'Staff berhasil ditambahkan!' });
  } catch (error) {
    console.error('Error creating staff:', error);
    return NextResponse.json({ success: false, message: 'Gagal menambahkan staff' }, { status: 500 });
  }
}

// PUT /api/staff - Update data staff
export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, id_staff, nama, email, nip, no_hp, password } = body;

    const targetId = parseInt(String(id || id_staff), 10);
    if (!targetId || isNaN(targetId)) {
      return NextResponse.json({ success: false, message: 'ID Staff wajib disertakan!' }, { status: 400 });
    }

    const existing = await prisma.staff.findUnique({
      where: { id_staff: targetId },
      include: { users: true },
    });
    if (!existing) {
      return NextResponse.json({ success: false, message: 'Staff tidak ditemukan!' }, { status: 404 });
    }

    // Cek NIP unik (jika diubah)
    if (nip && nip !== existing.nip) {
      const dupNip = await prisma.staff.findUnique({ where: { nip } });
      if (dupNip) {
        return NextResponse.json({ success: false, message: 'NIP sudah digunakan staff lain!' }, { status: 409 });
      }
    }

    // Cek email unik (jika diubah)
    if (email && email !== existing.users.email) {
      const dupEmail = await prisma.user.findUnique({ where: { email } });
      if (dupEmail) {
        return NextResponse.json({ success: false, message: 'Email sudah digunakan user lain!' }, { status: 409 });
      }
    }

    const result = await prisma.$transaction(async (tx) => {
      // Update user data
      const userUpdateData: any = {};
      if (nama) userUpdateData.nama = nama;
      if (email) userUpdateData.email = email;
      if (password && String(password).trim().length > 0) {
        const cleanPw = String(password).trim();
        const pwValidation = validateStrongPassword(cleanPw);
        if (!pwValidation.valid) {
          throw new Error(pwValidation.message);
        }
        userUpdateData.password = await bcrypt.hash(cleanPw, 10);
      }

      if (Object.keys(userUpdateData).length > 0) {
        await tx.user.update({
          where: { id_user: existing.id_user },
          data: userUpdateData,
        });
      }

      // Update staff data
      const staffUpdateData: any = {};
      if (nip) staffUpdateData.nip = nip;
      if (no_hp) staffUpdateData.no_hp = no_hp;

      const updatedStaff = await tx.staff.update({
        where: { id_staff: targetId },
        data: staffUpdateData,
        include: { users: { select: { id_user: true, nama: true, email: true, status: true } } },
      });

      return updatedStaff;
    });

    return NextResponse.json({ success: true, data: mapItem(result), message: 'Data staff berhasil diperbarui!' });
  } catch (error) {
    console.error('Error updating staff:', error);
    return NextResponse.json({ success: false, message: 'Gagal memperbarui data staff' }, { status: 500 });
  }
}

// DELETE /api/staff?id=xxx
export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const idParam = searchParams.get('id');
    const targetId = parseInt(String(idParam), 10);

    if (!targetId || isNaN(targetId)) {
      return NextResponse.json({ success: false, message: 'ID Staff wajib disertakan!' }, { status: 400 });
    }

    const existing = await prisma.staff.findUnique({ where: { id_staff: targetId } });
    if (!existing) {
      return NextResponse.json({ success: false, message: 'Staff tidak ditemukan!' }, { status: 404 });
    }

    // Hapus staff dan user dalam transaksi
    await prisma.$transaction(async (tx) => {
      await tx.staff.delete({ where: { id_staff: targetId } });
      await tx.user.delete({ where: { id_user: existing.id_user } });
    });

    return NextResponse.json({ success: true, message: 'Staff dan akun user berhasil dihapus!' });
  } catch (error) {
    console.error('Error deleting staff:', error);
    return NextResponse.json({ success: false, message: 'Gagal menghapus staff' }, { status: 500 });
  }
}

// PATCH /api/staff - Toggle status akun staff
export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { id_user, status } = body;

    if (!id_user) {
      return NextResponse.json({ success: false, message: 'id_user wajib disertakan!' }, { status: 400 });
    }

    await prisma.user.update({
      where: { id_user: parseInt(String(id_user), 10) },
      data: { status: Boolean(status) },
    });

    return NextResponse.json({ success: true, message: 'Status akun staff berhasil diperbarui!' });
  } catch (error) {
    console.error('Error patching staff status:', error);
    return NextResponse.json({ success: false, message: 'Gagal mengubah status akun staff' }, { status: 500 });
  }
}

function mapItem(item: any) {
  return {
    id: item.id_staff,
    id_staff: item.id_staff,
    id_user: item.users?.id_user,
    nama: item.users?.nama || '-',
    email: item.users?.email || '-',
    status_akun: item.users?.status ?? true,
    nip: item.nip,
    no_hp: item.no_hp,
    status: item.status,
  };
}
