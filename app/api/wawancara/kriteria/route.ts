import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/wawancara/kriteria?id_periode=...
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const idPeriodeParam = searchParams.get('id_periode');

    let id_periode: number | undefined;
    if (idPeriodeParam) {
      id_periode = parseInt(idPeriodeParam, 10);
    } else {
      const active = (await prisma.periode.findFirst({ where: { status: 'Aktif' } }))
        || (await prisma.periode.findFirst({ orderBy: { id_periode: 'asc' } }));
      id_periode = active ? active.id_periode : 1;
    }

    const kriteria = await prisma.kriteria_wawancara.findMany({
      where: { id_periode, status: true },
      orderBy: { id_kriteria_wawancara: 'asc' },
    });

    const totalBobot = kriteria.reduce((acc, k) => acc + parseFloat(k.bobot.toString()), 0);

    return NextResponse.json({
      success: true,
      data: kriteria.map((k) => ({
        id_kriteria_wawancara: k.id_kriteria_wawancara,
        id_periode: k.id_periode,
        nama_kriteria: k.nama_kriteria,
        bobot: parseFloat(k.bobot.toString()),
        nilai_maksimal: parseFloat(k.nilai_maksimal.toString()),
        status: k.status,
      })),
      totalBobot,
    });
  } catch (error) {
    console.error('Error fetching kriteria wawancara:', error);
    return NextResponse.json({ success: false, message: 'Gagal memuat kriteria wawancara' }, { status: 500 });
  }
}

// POST /api/wawancara/kriteria - Tambah kriteria wawancara baru
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { id_periode, nama_kriteria, bobot, nilai_maksimal } = body;

    if (!id_periode || !nama_kriteria || bobot === undefined) {
      return NextResponse.json(
        { success: false, message: 'Periode, nama kriteria, dan bobot wajib diisi!' },
        { status: 400 }
      );
    }

    const created = await prisma.kriteria_wawancara.create({
      data: {
        id_periode: parseInt(String(id_periode), 10),
        nama_kriteria: String(nama_kriteria).trim(),
        bobot: parseFloat(String(bobot)),
        nilai_maksimal: nilai_maksimal ? parseFloat(String(nilai_maksimal)) : 100,
        status: true,
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Kriteria wawancara berhasil ditambahkan!',
      data: {
        id_kriteria_wawancara: created.id_kriteria_wawancara,
        id_periode: created.id_periode,
        nama_kriteria: created.nama_kriteria,
        bobot: parseFloat(created.bobot.toString()),
        nilai_maksimal: parseFloat(created.nilai_maksimal.toString()),
      },
    });
  } catch (error) {
    console.error('Error adding kriteria wawancara:', error);
    return NextResponse.json({ success: false, message: 'Gagal menambahkan kriteria wawancara' }, { status: 500 });
  }
}

// PUT /api/wawancara/kriteria - Edit kriteria wawancara
export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const { id_kriteria_wawancara, nama_kriteria, bobot, nilai_maksimal } = body;

    const id = parseInt(String(id_kriteria_wawancara), 10);
    if (!id || isNaN(id)) {
      return NextResponse.json({ success: false, message: 'ID Kriteria Wawancara tidak valid!' }, { status: 400 });
    }

    const updated = await prisma.kriteria_wawancara.update({
      where: { id_kriteria_wawancara: id },
      data: {
        ...(nama_kriteria ? { nama_kriteria: String(nama_kriteria).trim() } : {}),
        ...(bobot !== undefined ? { bobot: parseFloat(String(bobot)) } : {}),
        ...(nilai_maksimal !== undefined ? { nilai_maksimal: parseFloat(String(nilai_maksimal)) } : {}),
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Kriteria wawancara berhasil diperbarui!',
      data: {
        id_kriteria_wawancara: updated.id_kriteria_wawancara,
        id_periode: updated.id_periode,
        nama_kriteria: updated.nama_kriteria,
        bobot: parseFloat(updated.bobot.toString()),
        nilai_maksimal: parseFloat(updated.nilai_maksimal.toString()),
      },
    });
  } catch (error) {
    console.error('Error updating kriteria wawancara:', error);
    return NextResponse.json({ success: false, message: 'Gagal memperbarui kriteria wawancara' }, { status: 500 });
  }
}

// DELETE /api/wawancara/kriteria?id=... - Hapus kriteria wawancara
export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const idParam = searchParams.get('id');
    const id = parseInt(idParam || '', 10);

    if (!id || isNaN(id)) {
      return NextResponse.json({ success: false, message: 'ID Kriteria Wawancara tidak valid!' }, { status: 400 });
    }

    // Check if any nilai_wawancara uses this criteria
    const countNilai = await prisma.nilai_wawancara.count({
      where: { id_kriteria_wawancara: id },
    });

    if (countNilai > 0) {
      // Soft-delete if already used
      await prisma.kriteria_wawancara.update({
        where: { id_kriteria_wawancara: id },
        data: { status: false },
      });
    } else {
      await prisma.kriteria_wawancara.delete({
        where: { id_kriteria_wawancara: id },
      });
    }

    return NextResponse.json({
      success: true,
      message: 'Kriteria wawancara berhasil dihapus!',
    });
  } catch (error) {
    console.error('Error deleting kriteria wawancara:', error);
    return NextResponse.json({ success: false, message: 'Gagal menghapus kriteria wawancara' }, { status: 500 });
  }
}
