import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapKriteria(item: any) {
  return {
    id_kriteria: item.id_kriteria,
    id_periode: item.id_periode,
    nama_kriteria: item.nama_kriteria,
    bobot: item.bobot ? parseFloat(item.bobot.toString()) : 0,
    nilai_maksimal: item.nilai_maksimal ? parseFloat(item.nilai_maksimal.toString()) : 0,
    jenis: item.jenis,
    metode_nilai: item.metode_nilai,
    status: item.status,
    nama_periode: item.periode?.nama_periode || '-',
  };
}

// GET /api/kriteria - List all kriteria (optionally filtered by id_periode)
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const idPeriode = searchParams.get('id_periode');
    const id = searchParams.get('id');

    // Single fetch
    if (id) {
      const item = await prisma.kriteria_seleksi.findUnique({
        where: { id_kriteria: parseInt(id, 10) },
        include: { periode: { select: { nama_periode: true } } },
      });
      if (!item) {
        return NextResponse.json({ success: false, message: 'Kriteria tidak ditemukan' }, { status: 404 });
      }
      return NextResponse.json({ success: true, data: mapKriteria(item) });
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const where: any = {};

    if (idPeriode) {
      where.id_periode = parseInt(idPeriode, 10);
    } else {
      // Default to active periode or first available periode
      const activePeriode = (await prisma.periode.findFirst({ where: { status: 'Aktif' } }))
        || (await prisma.periode.findFirst({ orderBy: { id_periode: 'asc' } }));
      if (activePeriode) {
        where.id_periode = activePeriode.id_periode;
      }
    }

    const items = await prisma.kriteria_seleksi.findMany({
      where,
      include: { periode: { select: { nama_periode: true } } },
      orderBy: { id_kriteria: 'asc' },
    });

    // Also get available periodes for the dropdown
    const periodes = await prisma.periode.findMany({
      orderBy: { created_at: 'desc' },
      select: { id_periode: true, nama_periode: true, tahun: true, status: true },
    });

    // Calculate total bobot
    const totalBobot = items.reduce((sum, item) => sum + parseFloat(item.bobot.toString()), 0);

    return NextResponse.json({
      success: true,
      data: items.map(mapKriteria),
      totalBobot,
      periodes: periodes.map((p) => ({
        id_periode: p.id_periode,
        nama_periode: p.nama_periode,
        tahun: p.tahun,
        status: p.status === 'Belum_Aktif' ? 'Belum Aktif' : p.status,
      })),
      activePeriodeId: where.id_periode || null,
    });
  } catch (error) {
    console.error('Error fetching kriteria:', error);
    return NextResponse.json({ success: false, message: 'Gagal mengambil data kriteria' }, { status: 500 });
  }
}

// POST /api/kriteria - Create new kriteria
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { id_periode, nama_kriteria, bobot, nilai_maksimal, jenis, metode_nilai } = body;

    if (!id_periode || !nama_kriteria || bobot === undefined || !nilai_maksimal || !jenis || !metode_nilai) {
      return NextResponse.json(
        { success: false, message: 'Semua field wajib diisi (nama_kriteria, bobot, nilai_maksimal, jenis, metode_nilai)!' },
        { status: 400 }
      );
    }

    const targetPeriodeId = parseInt(String(id_periode), 10);
    const newBobot = parseFloat(String(bobot));

    if (isNaN(newBobot) || newBobot <= 0 || newBobot > 100) {
      return NextResponse.json(
        { success: false, message: 'Bobot harus berupa angka antara 1 sampai 100!' },
        { status: 400 }
      );
    }

    // Check existing total weight for this periode
    const existingKriteria = await prisma.kriteria_seleksi.findMany({
      where: { id_periode: targetPeriodeId, status: true },
    });
    const currentTotal = existingKriteria.reduce((sum, item) => sum + parseFloat(item.bobot.toString()), 0);

    if (currentTotal + newBobot > 100) {
      const sisa = Math.max(0, 100 - currentTotal);
      return NextResponse.json(
        {
          success: false,
          message: `Total bobot kriteria untuk periode ini tidak boleh melebihi 100%! Saat ini total bobot kriteria aktif sudah ${currentTotal}%. Maksimal bobot yang dapat ditambahkan adalah ${sisa}%.`,
        },
        { status: 400 }
      );
    }

    const created = await prisma.kriteria_seleksi.create({
      data: {
        id_periode: targetPeriodeId,
        nama_kriteria,
        bobot: newBobot,
        nilai_maksimal: parseFloat(String(nilai_maksimal)),
        jenis,
        metode_nilai,
        status: true,
      },
      include: { periode: { select: { nama_periode: true } } },
    });

    return NextResponse.json({
      success: true,
      message: 'Kriteria seleksi berhasil ditambahkan!',
      data: mapKriteria(created),
    });
  } catch (error) {
    console.error('Error creating kriteria:', error);
    return NextResponse.json({ success: false, message: 'Gagal menambahkan kriteria' }, { status: 500 });
  }
}

// PUT /api/kriteria - Update kriteria
export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const { id_kriteria, nama_kriteria, bobot, nilai_maksimal, jenis, metode_nilai, status } = body;

    const targetId = parseInt(String(id_kriteria), 10);
    if (!targetId || isNaN(targetId)) {
      return NextResponse.json({ success: false, message: 'ID Kriteria wajib diisi!' }, { status: 400 });
    }

    const existing = await prisma.kriteria_seleksi.findUnique({ where: { id_kriteria: targetId } });
    if (!existing) {
      return NextResponse.json({ success: false, message: 'Kriteria tidak ditemukan' }, { status: 404 });
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const updateData: any = {};
    if (nama_kriteria !== undefined) updateData.nama_kriteria = nama_kriteria;
    if (nilai_maksimal !== undefined) updateData.nilai_maksimal = parseFloat(String(nilai_maksimal));
    if (jenis !== undefined) updateData.jenis = jenis;
    if (metode_nilai !== undefined) updateData.metode_nilai = metode_nilai;
    if (status !== undefined) updateData.status = Boolean(status);

    if (bobot !== undefined) {
      const newBobot = parseFloat(String(bobot));
      if (isNaN(newBobot) || newBobot <= 0 || newBobot > 100) {
        return NextResponse.json({ success: false, message: 'Bobot harus berupa angka antara 1 sampai 100!' }, { status: 400 });
      }

      const willBeActive = status !== undefined ? Boolean(status) : existing.status;
      if (willBeActive) {
        const otherKriteria = await prisma.kriteria_seleksi.findMany({
          where: {
            id_periode: existing.id_periode,
            status: true,
            id_kriteria: { not: targetId },
          },
        });
        const otherTotal = otherKriteria.reduce((sum, item) => sum + parseFloat(item.bobot.toString()), 0);

        if (otherTotal + newBobot > 100) {
          const sisa = Math.max(0, 100 - otherTotal);
          return NextResponse.json(
            {
              success: false,
              message: `Total bobot kriteria tidak boleh melebihi 100%! Kriteria aktif lainnya sudah berjumlah ${otherTotal}%. Bobot maksimal yang diizinkan adalah ${sisa}%.`,
            },
            { status: 400 }
          );
        }
      }
      updateData.bobot = newBobot;
    }

    const updated = await prisma.kriteria_seleksi.update({
      where: { id_kriteria: targetId },
      data: updateData,
      include: { periode: { select: { nama_periode: true } } },
    });

    return NextResponse.json({
      success: true,
      message: 'Kriteria seleksi berhasil diperbarui!',
      data: mapKriteria(updated),
    });
  } catch (error) {
    console.error('Error updating kriteria:', error);
    return NextResponse.json({ success: false, message: 'Gagal memperbarui kriteria' }, { status: 500 });
  }
}

// DELETE /api/kriteria?id=xxx
export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const idParam = searchParams.get('id');
    const targetId = parseInt(String(idParam), 10);

    if (!targetId || isNaN(targetId)) {
      return NextResponse.json({ success: false, message: 'ID Kriteria wajib diisi!' }, { status: 400 });
    }

    await prisma.kriteria_seleksi.delete({
      where: { id_kriteria: targetId },
    });

    return NextResponse.json({ success: true, message: 'Kriteria seleksi berhasil dihapus!' });
  } catch (error) {
    console.error('Error deleting kriteria:', error);
    return NextResponse.json({ success: false, message: 'Gagal menghapus kriteria' }, { status: 500 });
  }
}
