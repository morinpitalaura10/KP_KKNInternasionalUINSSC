import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/mahasiswa - Daftar mahasiswa dengan join user, fakultas, prodi
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    const search = searchParams.get('search') || '';
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '20', 10);
    const skip = (page - 1) * limit;

    if (id) {
      const item = await prisma.mahasiswa.findUnique({
        where: { id_mahasiswa: parseInt(id, 10) },
        include: {
          users: { select: { id_user: true, nim: true, nama: true, email: true, status: true } },
          fakultas: { select: { nama_fakultas: true } },
          prodi: { select: { nama_prodi: true } },
        },
      });
      if (!item) {
        return NextResponse.json({ success: false, message: 'Mahasiswa tidak ditemukan' }, { status: 404 });
      }
      return NextResponse.json({ success: true, data: mapItem(item) });
    }

    const where = search
      ? {
          OR: [
            { users: { nama: { contains: search } } },
            { users: { nim: { contains: search } } },
          ],
        }
      : {};

    const [total, items] = await Promise.all([
      prisma.mahasiswa.count({ where }),
      prisma.mahasiswa.findMany({
        where,
        include: {
          users: { select: { id_user: true, nim: true, nama: true, email: true, status: true } },
          fakultas: { select: { nama_fakultas: true } },
          prodi: { select: { nama_prodi: true } },
        },
        orderBy: { id_mahasiswa: 'asc' },
        skip,
        take: limit,
      }),
    ]);

    return NextResponse.json({
      success: true,
      data: items.map(mapItem),
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch (error) {
    console.error('Error fetching mahasiswa:', error);
    return NextResponse.json({ success: false, message: 'Gagal mengambil data mahasiswa' }, { status: 500 });
  }
}

// PUT /api/mahasiswa - Update data mahasiswa (IPK, semester, kelas, dll)
export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, id_mahasiswa, id_fakultas, id_prodi, ipk, semester, kelas } = body;

    const targetId = parseInt(String(id || id_mahasiswa), 10);
    if (!targetId || isNaN(targetId)) {
      return NextResponse.json({ success: false, message: 'ID Mahasiswa wajib disertakan!' }, { status: 400 });
    }

    const existing = await prisma.mahasiswa.findUnique({ where: { id_mahasiswa: targetId } });
    if (!existing) {
      return NextResponse.json({ success: false, message: 'Mahasiswa tidak ditemukan!' }, { status: 404 });
    }

    const updated = await prisma.mahasiswa.update({
      where: { id_mahasiswa: targetId },
      data: {
        ...(id_fakultas ? { id_fakultas: parseInt(String(id_fakultas), 10) } : {}),
        ...(id_prodi ? { id_prodi: parseInt(String(id_prodi), 10) } : {}),
        ...(ipk !== undefined ? { ipk: parseFloat(String(ipk)) } : {}),
        ...(semester !== undefined ? { semester: parseInt(String(semester), 10) } : {}),
        ...(kelas ? { kelas } : {}),
      },
      include: {
        users: { select: { id_user: true, nim: true, nama: true, email: true, status: true } },
        fakultas: { select: { nama_fakultas: true } },
        prodi: { select: { nama_prodi: true } },
      },
    });

    return NextResponse.json({ success: true, data: mapItem(updated), message: 'Data mahasiswa berhasil diperbarui!' });
  } catch (error) {
    console.error('Error updating mahasiswa:', error);
    return NextResponse.json({ success: false, message: 'Gagal memperbarui data mahasiswa' }, { status: 500 });
  }
}

// PATCH /api/mahasiswa - Toggle status user mahasiswa (aktif/nonaktif)
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

    return NextResponse.json({ success: true, message: 'Status akun mahasiswa berhasil diperbarui!' });
  } catch (error) {
    console.error('Error updating user status:', error);
    return NextResponse.json({ success: false, message: 'Gagal memperbarui status akun' }, { status: 500 });
  }
}

function mapItem(item: any) {
  return {
    id: item.id_mahasiswa,
    id_mahasiswa: item.id_mahasiswa,
    id_user: item.users?.id_user,
    nim: item.users?.nim || '-',
    nama: item.users?.nama || '-',
    email: item.users?.email || '-',
    status_akun: item.users?.status ?? true,
    nama_fakultas: item.fakultas?.nama_fakultas || '-',
    nama_prodi: item.prodi?.nama_prodi || '-',
    ipk: item.ipk ? parseFloat(item.ipk.toString()) : null,
    semester: item.semester,
    kelas: item.kelas,
    last_sync: item.last_sync,
  };
}
