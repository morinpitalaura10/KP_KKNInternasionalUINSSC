import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/persyaratan - List persyaratan for active or specified period
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const idPeriode = searchParams.get('id_periode');
    const isAdmin = searchParams.get('admin') === 'true';

    let targetPeriodeId: number | null = null;
    if (idPeriode) {
      targetPeriodeId = parseInt(idPeriode, 10);
    } else if (!isAdmin) {
      const activePeriode = await prisma.periode.findFirst({
        where: { status: 'Aktif' },
      });
      if (activePeriode) {
        targetPeriodeId = activePeriode.id_periode;
      }
    }

    const whereClause: { status?: boolean; id_periode?: number } = {};
    if (!isAdmin) {
      whereClause.status = true;
    }
    if (targetPeriodeId) {
      whereClause.id_periode = targetPeriodeId;
    }

    const data = await prisma.persyaratan.findMany({
      where: whereClause,
      include: {
        periode: { select: { nama_periode: true, tahun: true } },
      },
      orderBy: { id_persyaratan: 'asc' },
    });

    return NextResponse.json({
      success: true,
      data: data.map(mapItem),
    });
  } catch (error) {
    console.error('Error fetching persyaratan:', error);
    return NextResponse.json(
      { success: false, message: 'Gagal mengambil data persyaratan' },
      { status: 500 }
    );
  }
}

// POST /api/persyaratan - Tambah persyaratan baru
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { id_periode, nama_persyaratan, deskripsi, format_file, ukuran_maksimal, wajib } = body;

    if (!id_periode || !nama_persyaratan || !deskripsi || !format_file) {
      return NextResponse.json(
        { success: false, message: 'id_periode, nama_persyaratan, deskripsi, dan format_file wajib diisi!' },
        { status: 400 }
      );
    }

    const newItem = await prisma.persyaratan.create({
      data: {
        id_periode: parseInt(String(id_periode), 10),
        nama_persyaratan,
        deskripsi,
        format_file,
        ukuran_maksimal: parseInt(String(ukuran_maksimal || 2048), 10),
        wajib: wajib !== undefined ? Boolean(wajib) : true,
        status: true,
      },
      include: {
        periode: { select: { nama_periode: true, tahun: true } },
      },
    });

    return NextResponse.json({
      success: true,
      data: mapItem(newItem),
      message: 'Persyaratan berhasil ditambahkan!',
    });
  } catch (error) {
    console.error('Error creating persyaratan:', error);
    return NextResponse.json(
      { success: false, message: 'Gagal menambahkan persyaratan' },
      { status: 500 }
    );
  }
}

// PUT /api/persyaratan - Update persyaratan
export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, id_persyaratan, id_periode, nama_persyaratan, deskripsi, format_file, ukuran_maksimal, wajib, status } = body;

    const targetId = parseInt(String(id || id_persyaratan), 10);
    if (!targetId || isNaN(targetId)) {
      return NextResponse.json(
        { success: false, message: 'ID persyaratan wajib disertakan!' },
        { status: 400 }
      );
    }

    const existing = await prisma.persyaratan.findUnique({ where: { id_persyaratan: targetId } });
    if (!existing) {
      return NextResponse.json(
        { success: false, message: 'Persyaratan tidak ditemukan!' },
        { status: 404 }
      );
    }

    const updated = await prisma.persyaratan.update({
      where: { id_persyaratan: targetId },
      data: {
        ...(id_periode !== undefined ? { id_periode: parseInt(String(id_periode), 10) } : {}),
        ...(nama_persyaratan ? { nama_persyaratan } : {}),
        ...(deskripsi ? { deskripsi } : {}),
        ...(format_file ? { format_file } : {}),
        ...(ukuran_maksimal !== undefined ? { ukuran_maksimal: parseInt(String(ukuran_maksimal), 10) } : {}),
        ...(wajib !== undefined ? { wajib: Boolean(wajib) } : {}),
        ...(status !== undefined ? { status: Boolean(status) } : {}),
      },
      include: {
        periode: { select: { nama_periode: true, tahun: true } },
      },
    });

    return NextResponse.json({
      success: true,
      data: mapItem(updated),
      message: 'Persyaratan berhasil diperbarui!',
    });
  } catch (error) {
    console.error('Error updating persyaratan:', error);
    return NextResponse.json(
      { success: false, message: 'Gagal memperbarui persyaratan' },
      { status: 500 }
    );
  }
}

// DELETE /api/persyaratan?id=xxx - Hapus persyaratan
export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const idParam = searchParams.get('id');
    const targetId = parseInt(String(idParam), 10);

    if (!targetId || isNaN(targetId)) {
      return NextResponse.json(
        { success: false, message: 'ID persyaratan wajib disertakan!' },
        { status: 400 }
      );
    }

    await prisma.persyaratan.delete({ where: { id_persyaratan: targetId } });

    return NextResponse.json({ success: true, message: 'Persyaratan berhasil dihapus!' });
  } catch (error) {
    console.error('Error deleting persyaratan:', error);
    return NextResponse.json(
      { success: false, message: 'Gagal menghapus persyaratan' },
      { status: 500 }
    );
  }
}

function mapItem(item: any) {
  return {
    id: item.id_persyaratan,
    id_persyaratan: item.id_persyaratan,
    id_periode: item.id_periode,
    nama_persyaratan: item.nama_persyaratan,
    deskripsi: item.deskripsi,
    format_file: item.format_file,
    ukuran_maksimal: item.ukuran_maksimal,
    wajib: item.wajib,
    status: item.status,
    nama_periode: item.periode?.nama_periode || null,
    tahun_periode: item.periode?.tahun || null,
  };
}
