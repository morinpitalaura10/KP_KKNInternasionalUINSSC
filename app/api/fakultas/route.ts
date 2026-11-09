import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/fakultas - List all faculties with prodi
export async function GET() {
  try {
    const list = await prisma.fakultas.findMany({
      where: { status: true },
      include: {
        prodi: {
          where: { status: true },
          orderBy: { nama_prodi: 'asc' },
        },
      },
      orderBy: { id_fakultas: 'asc' },
    });

    return NextResponse.json({ success: true, data: list });
  } catch (error) {
    console.error('Error fetching fakultas:', error);
    return NextResponse.json(
      { success: false, message: 'Gagal mengambil data fakultas' },
      { status: 500 }
    );
  }
}

// POST /api/fakultas - Add new faculty (and optional initial prodi)
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { nama_fakultas, nama_prodi } = body;

    if (!nama_fakultas || !String(nama_fakultas).trim()) {
      return NextResponse.json(
        { success: false, message: 'Nama fakultas wajib diisi!' },
        { status: 400 }
      );
    }

    const cleanNamaFakultas = String(nama_fakultas).trim();

    // Cek apakah fakultas dengan nama tersebut sudah ada
    const existing = await prisma.fakultas.findFirst({
      where: {
        nama_fakultas: {
          equals: cleanNamaFakultas,
        },
      },
    });

    if (existing) {
      // Jika fakultas sudah ada dan admin memasukkan nama prodi, tambahkan prodi ke fakultas tersebut
      if (nama_prodi && String(nama_prodi).trim()) {
        const cleanProdi = String(nama_prodi).trim();
        const existingProdi = await prisma.prodi.findFirst({
          where: {
            id_fakultas: existing.id_fakultas,
            nama_prodi: cleanProdi,
          },
        });

        if (existingProdi) {
          return NextResponse.json(
            { success: false, message: `Program studi "${cleanProdi}" sudah ada di fakultas ini!` },
            { status: 409 }
          );
        }

        const newProdi = await prisma.prodi.create({
          data: {
            id_fakultas: existing.id_fakultas,
            nama_prodi: cleanProdi,
            status: true,
          },
        });

        return NextResponse.json({
          success: true,
          message: `Program studi "${cleanProdi}" berhasil ditambahkan ke ${existing.nama_fakultas}!`,
          data: { fakultas: existing, prodi: newProdi },
        });
      }

      return NextResponse.json(
        { success: false, message: `Fakultas "${cleanNamaFakultas}" sudah terdaftar!` },
        { status: 409 }
      );
    }

    // Buat fakultas baru
    const newFakultas = await prisma.fakultas.create({
      data: {
        nama_fakultas: cleanNamaFakultas,
        status: true,
        ...(nama_prodi && String(nama_prodi).trim()
          ? {
              prodi: {
                create: {
                  nama_prodi: String(nama_prodi).trim(),
                  status: true,
                },
              },
            }
          : {}),
      },
      include: {
        prodi: true,
      },
    });

    return NextResponse.json({
      success: true,
      message: `Fakultas "${cleanNamaFakultas}" berhasil ditambahkan!`,
      data: newFakultas,
    });
  } catch (error) {
    console.error('Error creating fakultas:', error);
    return NextResponse.json(
      { success: false, message: 'Gagal menambahkan fakultas ke database' },
      { status: 500 }
    );
  }
}

// DELETE /api/fakultas - Delete faculty
export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { success: false, message: 'ID fakultas wajib disertakan!' },
        { status: 400 }
      );
    }

    const idFakultas = parseInt(id, 10);

    // Cek apakah ada mahasiswa yang terdaftar di fakultas ini
    const mhsCount = await prisma.mahasiswa.count({
      where: { id_fakultas: idFakultas },
    });

    if (mhsCount > 0) {
      return NextResponse.json(
        {
          success: false,
          message: `Fakultas tidak dapat dihapus karena terdapat ${mhsCount} data mahasiswa yang terdaftar di fakultas ini.`,
        },
        { status: 400 }
      );
    }

    // Hapus prodi terlebih dahulu jika ada
    await prisma.prodi.deleteMany({
      where: { id_fakultas: idFakultas },
    });

    // Hapus fakultas
    await prisma.fakultas.delete({
      where: { id_fakultas: idFakultas },
    });

    return NextResponse.json({
      success: true,
      message: 'Fakultas beserta jurusannya berhasil dihapus!',
    });
  } catch (error) {
    console.error('Error deleting fakultas:', error);
    return NextResponse.json(
      { success: false, message: 'Gagal menghapus fakultas dari database' },
      { status: 500 }
    );
  }
}

// PUT /api/fakultas - Edit faculty name
export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const { id_fakultas, nama_fakultas } = body;

    if (!id_fakultas || !nama_fakultas || !String(nama_fakultas).trim()) {
      return NextResponse.json(
        { success: false, message: 'ID fakultas dan nama fakultas wajib diisi!' },
        { status: 400 }
      );
    }

    const cleanNama = String(nama_fakultas).trim();
    const targetFakId = parseInt(String(id_fakultas), 10);

    const existing = await prisma.fakultas.findUnique({
      where: { id_fakultas: targetFakId },
    });

    if (!existing) {
      return NextResponse.json(
        { success: false, message: 'Fakultas tidak ditemukan!' },
        { status: 404 }
      );
    }

    const updated = await prisma.fakultas.update({
      where: { id_fakultas: targetFakId },
      data: { nama_fakultas: cleanNama },
    });

    return NextResponse.json({
      success: true,
      message: `Nama fakultas berhasil diperbarui menjadi "${cleanNama}"!`,
      data: updated,
    });
  } catch (error) {
    console.error('Error updating fakultas:', error);
    return NextResponse.json(
      { success: false, message: 'Gagal memperbarui nama fakultas' },
      { status: 500 }
    );
  }
}

