import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

function mapStatusToEnum(status: string) {
  if (status === 'Belum Aktif' || status === 'Belum_Aktif') return 'Belum_Aktif' as const;
  if (status === 'Selesai') return 'Selesai' as const;
  return 'Aktif' as const;
}

function mapPeriodeToClient(p: any) {
  return {
    id: p.id_periode,
    id_periode: p.id_periode,
    nama: p.nama_periode,
    nama_periode: p.nama_periode,
    tahun: p.tahun,
    tahunAkademik: String(p.tahun),
    tanggalMulai: p.tanggal_mulai,
    tanggal_mulai: p.tanggal_mulai,
    tanggalSelesai: p.tanggal_selesai,
    tanggal_selesai: p.tanggal_selesai,
    kuota: p.kuota,
    ketuaLp2m: p.ketua_lp2m || 'Dr. Faqiuddin Abdul Kodir, MA',
    ketua_lp2m: p.ketua_lp2m || 'Dr. Faqiuddin Abdul Kodir, MA',
    status: p.status === 'Belum_Aktif' ? 'Belum Aktif' : p.status,
    createdAt: p.created_at,
  };
}

// GET all periods
export async function GET() {
  try {
    const list = await prisma.periode.findMany({
      orderBy: { created_at: 'desc' },
    });

    return NextResponse.json({
      success: true,
      data: list.map(mapPeriodeToClient),
    });
  } catch (error) {
    console.error('Error fetching periodes:', error);
    return NextResponse.json(
      { success: false, message: 'Gagal mengambil data periode dari database' },
      { status: 500 }
    );
  }
}

// POST: Create new period
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { nama, nama_periode, tahun, tahunAkademik, tanggalMulai, tanggal_mulai, tanggalSelesai, tanggal_selesai, kuota, status, ketuaLp2m, ketua_lp2m } = body;

    const finalNama = nama || nama_periode;
    const finalTahun = parseInt(String(tahun || tahunAkademik || new Date().getFullYear()), 10);
    const finalTglMulai = new Date(tanggalMulai || tanggal_mulai);
    const finalTglSelesai = new Date(tanggalSelesai || tanggal_selesai);

    if (!finalNama || isNaN(finalTglMulai.getTime()) || isNaN(finalTglSelesai.getTime())) {
      return NextResponse.json(
        { success: false, message: 'Nama periode, tanggal mulai, dan tanggal selesai wajib diisi valid!' },
        { status: 400 }
      );
    }

    const finalStatus = mapStatusToEnum(status || 'Aktif');

    // Single active period: jika periode baru berstatus Aktif, periode lain yang
    // masih Aktif otomatis diubah menjadi Selesai (dalam satu transaksi).
    const newPeriode = await prisma.$transaction(async (tx) => {
      if (finalStatus === 'Aktif') {
        await tx.periode.updateMany({
          where: { status: 'Aktif' },
          data: { status: 'Selesai' },
        });
      }
      return tx.periode.create({
        data: {
          nama_periode: finalNama,
          tahun: finalTahun,
          tanggal_mulai: finalTglMulai,
          tanggal_selesai: finalTglSelesai,
          kuota: kuota ? parseInt(String(kuota), 10) : 10,
          status: finalStatus,
          ketua_lp2m: ketua_lp2m || ketuaLp2m || 'Dr. Faqiuddin Abdul Kodir, MA',
        },
      });
    });

    return NextResponse.json({
      success: true,
      data: mapPeriodeToClient(newPeriode),
      message: finalStatus === 'Aktif'
        ? 'Periode berhasil ditambahkan dan diaktifkan. Periode aktif sebelumnya otomatis ditandai Selesai.'
        : 'Periode pendaftaran berhasil ditambahkan ke database MySQL!',
    });
  } catch (error) {
    console.error('Error creating periode:', error);
    return NextResponse.json(
      { success: false, message: 'Gagal menambahkan periode baru ke database' },
      { status: 500 }
    );
  }
}

// PUT: Update existing period
export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, id_periode, nama, nama_periode, tahun, tahunAkademik, tanggalMulai, tanggal_mulai, tanggalSelesai, tanggal_selesai, kuota, status, ketuaLp2m, ketua_lp2m } = body;

    const targetId = parseInt(String(id || id_periode), 10);
    if (!targetId || isNaN(targetId)) {
      return NextResponse.json(
        { success: false, message: 'ID Periode wajib disertakan!' },
        { status: 400 }
      );
    }

    const existing = await prisma.periode.findUnique({ where: { id_periode: targetId } });
    if (!existing) {
      return NextResponse.json({ success: false, message: 'Periode tidak ditemukan!' }, { status: 404 });
    }

    // Allow Admin to update periode parameters (kuota, nama, jadwal)

    const finalNama = nama || nama_periode;
    const finalTglMulai = (tanggalMulai || tanggal_mulai) ? new Date(tanggalMulai || tanggal_mulai) : undefined;
    const finalTglSelesai = (tanggalSelesai || tanggal_selesai) ? new Date(tanggalSelesai || tanggal_selesai) : undefined;

    const finalStatus = status ? mapStatusToEnum(status) : undefined;
    const isActivating = finalStatus === 'Aktif' && existing.status !== 'Aktif';

    // Single active period: saat periode ini diaktifkan, periode lain yang
    // masih Aktif otomatis diubah menjadi Selesai (dalam satu transaksi).
    const updated = await prisma.$transaction(async (tx) => {
      if (finalStatus === 'Aktif') {
        await tx.periode.updateMany({
          where: { status: 'Aktif', id_periode: { not: targetId } },
          data: { status: 'Selesai' },
        });
      }
      return tx.periode.update({
        where: { id_periode: targetId },
        data: {
          ...(finalNama && { nama_periode: finalNama }),
          ...(tahun || tahunAkademik ? { tahun: parseInt(String(tahun || tahunAkademik), 10) } : {}),
          ...(finalTglMulai && { tanggal_mulai: finalTglMulai }),
          ...(finalTglSelesai && { tanggal_selesai: finalTglSelesai }),
          ...(kuota !== undefined ? { kuota: parseInt(String(kuota), 10) } : {}),
          ...(finalStatus ? { status: finalStatus } : {}),
          ...((ketua_lp2m !== undefined || ketuaLp2m !== undefined) ? { ketua_lp2m: (ketua_lp2m || ketuaLp2m || 'Dr. Faqiuddin Abdul Kodir, MA') } : {}),
        },
      });
    });

    return NextResponse.json({
      success: true,
      data: mapPeriodeToClient(updated),
      message: isActivating
        ? `Periode "${updated.nama_periode}" berhasil diaktifkan. Periode aktif sebelumnya otomatis ditandai Selesai.`
        : 'Data periode pendaftaran berhasil diperbarui!',
    });
  } catch (error) {
    console.error('Error updating periode:', error);
    return NextResponse.json(
      { success: false, message: 'Gagal memperbarui data periode di database' },
      { status: 500 }
    );
  }
}

// DELETE: Delete a period
export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const idParam = searchParams.get('id');
    const targetId = parseInt(String(idParam), 10);

    if (!targetId || isNaN(targetId)) {
      return NextResponse.json(
        { success: false, message: 'ID Periode wajib disertakan untuk penghapusan!' },
        { status: 400 }
      );
    }

    await prisma.periode.delete({
      where: { id_periode: targetId },
    });

    return NextResponse.json({
      success: true,
      message: 'Periode pendaftaran berhasil dihapus dari database!',
    });
  } catch (error) {
    console.error('Error deleting periode:', error);
    return NextResponse.json(
      { success: false, message: 'Gagal menghapus periode dari database' },
      { status: 500 }
    );
  }
}
