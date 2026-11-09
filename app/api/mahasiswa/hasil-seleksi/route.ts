import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getPeriodePublikasiStatus } from '@/lib/publikasi';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ success: false, message: 'userId wajib disertakan' }, { status: 400 });
    }

    // Find mahasiswa by user id
    const mahasiswa = await prisma.mahasiswa.findFirst({
      where: { id_user: parseInt(userId, 10) },
      include: {
        users: { select: { nama: true, nim: true, email: true } },
        fakultas: { select: { nama_fakultas: true } },
        prodi: { select: { nama_prodi: true } },
      },
    });

    if (!mahasiswa) {
      return NextResponse.json({
        success: true,
        data: { hasResult: false },
      });
    }

    // Get active period
    const activePeriode = await prisma.periode.findFirst({ where: { status: 'Aktif' } });

    // Find pendaftaran with hasil_seleksi
    const pendaftaran = await prisma.pendaftaran.findFirst({
      where: {
        id_mahasiswa: mahasiswa.id_mahasiswa,
        ...(activePeriode ? { id_periode: activePeriode.id_periode } : {}),
      },
      orderBy: { created_at: 'desc' },
      include: {
        hasil_seleksi: true,
        periode: { select: { nama_periode: true, tahun: true } },
        periode_negara: {
          include: { negara: { select: { nama_negara: true, status: true } } },
        },
      },
    });

    if (!pendaftaran || !pendaftaran.hasil_seleksi) {
      return NextResponse.json({
        success: true,
        data: { hasResult: false },
      });
    }

    // Hasil hanya terlihat setelah admin mempublikasikan secara resmi
    const pubStatus = await getPeriodePublikasiStatus(pendaftaran.id_periode);
    if (!pubStatus.hasil_dipublikasi) {
      return NextResponse.json({
        success: true,
        data: { hasResult: false, belumDipublikasi: true },
      });
    }

    const hs = pendaftaran.hasil_seleksi;

    return NextResponse.json({
      success: true,
      data: {
        hasResult: true,
        idHasil: hs.id_hasil,
        idPendaftaran: pendaftaran.id_pendaftaran,
        nim: mahasiswa.users?.nim || '-',
        nama: mahasiswa.users?.nama || '-',
        fakultas: mahasiswa.fakultas?.nama_fakultas || '-',
        prodi: mahasiswa.prodi?.nama_prodi || '-',
        ipk: pendaftaran.ipk
          ? parseFloat(pendaftaran.ipk.toString())
          : mahasiswa.ipk
          ? parseFloat(mahasiswa.ipk.toString())
          : null,
        status: hs.status === 'Tidak_Lolos' ? 'Tidak Lolos' : hs.status,
        nilaiSubstansi: hs.nilai_substansi ? parseFloat(hs.nilai_substansi.toString()) : null,
        nilaiWawancara: hs.nilai_wawancara ? parseFloat(hs.nilai_wawancara.toString()) : null,
        nilaiAkhir: hs.nilai_akhir ? parseFloat(hs.nilai_akhir.toString()) : null,
        ranking: hs.ranking_akhir,
        catatan: hs.catatan || null,
        negaraTujuan:
          hs.status === 'Lolos' &&
          pendaftaran.periode_negara?.status !== false &&
          pendaftaran.periode_negara?.negara?.status !== false
            ? pendaftaran.periode_negara?.negara?.nama_negara || null
            : null,
        namaPeriode: pendaftaran.periode?.nama_periode || null,
        tahunPeriode: pendaftaran.periode?.tahun || 2026,
        tanggalPenetapan: hs.tanggal_penetapan ? hs.tanggal_penetapan.toISOString() : null,
      },
    });
  } catch (error) {
    console.error('Error fetching hasil seleksi:', error);
    return NextResponse.json({ success: false, message: 'Gagal mengambil data hasil seleksi' }, { status: 500 });
  }
}
