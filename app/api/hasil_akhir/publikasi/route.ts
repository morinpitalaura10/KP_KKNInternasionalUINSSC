import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import {
  resolveActorUserId,
  getPeriodePublikasiStatus,
  updatePeriodePublikasiStatus,
  catatLogPublikasi,
} from '@/lib/publikasi';

// POST /api/hasil_akhir/publikasi
// Publikasi / Tarik publikasi resmi hasil seleksi suatu periode.
// Fleksibel & manual: Admin dapat mempublikasikan ke mahasiswa atau menarik kembali ke Draft jika masih perlu penyesuaian.
export async function POST(req: NextRequest) {
  try {
    const userRole = req.cookies.get('user_role')?.value;
    if (userRole && userRole !== 'admin') {
      return NextResponse.json(
        { success: false, message: 'Hanya Admin LP2M yang berwenang mengatur publikasi hasil seleksi.' },
        { status: 403 }
      );
    }

    const body = await req.json();
    const targetPeriodeId = parseInt(String(body?.id_periode), 10);
    if (!targetPeriodeId || isNaN(targetPeriodeId)) {
      return NextResponse.json({ success: false, message: 'ID Periode wajib diisi!' }, { status: 400 });
    }

    const periode = await prisma.periode.findUnique({
      where: { id_periode: targetPeriodeId },
      select: { id_periode: true, nama_periode: true },
    });
    if (!periode) {
      return NextResponse.json({ success: false, message: 'Periode tidak ditemukan!' }, { status: 404 });
    }

    const currentPub = await getPeriodePublikasiStatus(targetPeriodeId);
    const targetDipublikasi = body?.dipublikasi !== undefined 
      ? Boolean(body.dipublikasi) 
      : !currentPub.hasil_dipublikasi;

    const jumlahHasil = await prisma.hasil_seleksi.count({
      where: { pendaftaran: { id_periode: targetPeriodeId } },
    });

    if (targetDipublikasi && jumlahHasil === 0) {
      return NextResponse.json(
        {
          success: false,
          message: 'Belum ada data hasil seleksi pada periode ini. Silakan jalankan Kalkulasi SPK terlebih dahulu.',
        },
        { status: 400 }
      );
    }

    const actorUserId = await resolveActorUserId(req, body?.id_user);
    const now = await updatePeriodePublikasiStatus({
      id_periode: targetPeriodeId,
      dipublikasi: targetDipublikasi,
      id_user: actorUserId,
    });

    await catatLogPublikasi({
      id_user: actorUserId,
      jenis: 'hasil_seleksi',
      aksi: targetDipublikasi ? 'Publish' : 'Private',
      id_periode: targetPeriodeId,
      id_referensi: targetPeriodeId,
      keterangan: targetDipublikasi
        ? `Publikasi resmi hasil seleksi "${periode.nama_periode}" (${jumlahHasil} peserta) berhasil dibuka ke mahasiswa.`
        : `Publikasi hasil seleksi "${periode.nama_periode}" ditarik kembali ke status Draft/Private.`,
    });

    return NextResponse.json({
      success: true,
      message: targetDipublikasi
        ? `Hasil seleksi "${periode.nama_periode}" berhasil dipublikasikan! Mahasiswa sekarang dapat melihat hasil pengumuman.`
        : `Publikasi hasil seleksi "${periode.nama_periode}" berhasil ditarik kembali ke status Draft.`,
      data: {
        dipublikasi: targetDipublikasi,
        locked: false,
        tanggal_publikasi: targetDipublikasi ? now.toISOString() : null,
        dipublikasi_oleh: targetDipublikasi ? actorUserId : null,
      },
    });
  } catch (error) {
    console.error('Error publikasi hasil seleksi:', error);
    return NextResponse.json({ success: false, message: 'Gagal mengatur status publikasi hasil seleksi' }, { status: 500 });
  }
}
