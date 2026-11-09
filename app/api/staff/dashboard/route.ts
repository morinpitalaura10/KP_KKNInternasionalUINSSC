import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const activePeriode = await prisma.periode.findFirst({ where: { status: 'Aktif' } });
    const id_periode = activePeriode?.id_periode ?? -1;

    // Counts (hanya yang sudah resmi disubmit, kecualikan Draft)
    const totalPendaftar = await prisma.pendaftaran.count({
      where: { id_periode, status_pendaftaran: { not: 'Draft' } },
    });
    const menungguVerifikasi = await prisma.pendaftaran.count({
      where: { id_periode, status_pendaftaran: 'Menunggu_Verifikasi' },
    });
    const verifikasiDokumen = await prisma.pendaftaran.count({
      where: { id_periode, status_pendaftaran: { in: ['Verifikasi_Dokumen', 'Wawancara'] } },
    });
    const lolosSeleksi = await prisma.pendaftaran.count({
      where: { id_periode, status_pendaftaran: 'Lolos' },
    });

    // Recent applicants (hanya pendaftaran resmi yang sudah dikirim)
    const recent = await prisma.pendaftaran.findMany({
      where: { id_periode, status_pendaftaran: { not: 'Draft' } },
      take: 5,
      orderBy: { created_at: 'desc' },
      include: {
        mahasiswa: {
          include: { users: true, fakultas: true, prodi: true },
        },
      },
    });

    // Progress percentage
    const verifiedOrBeyond = await prisma.pendaftaran.count({
      where: {
        id_periode,
        status_pendaftaran: { in: ['Verifikasi_Dokumen', 'Wawancara', 'Lolos', 'Tidak_Lolos'] },
      },
    });
    const progressPercent = totalPendaftar > 0 ? Math.round((verifiedOrBeyond / totalPendaftar) * 100) : 0;

    return NextResponse.json({
      success: true,
      activePeriode: activePeriode
        ? {
            id_periode: activePeriode.id_periode,
            nama_periode: activePeriode.nama_periode,
            tahun: activePeriode.tahun,
          }
        : null,
      stats: {
        totalPendaftar,
        menungguVerifikasi,
        verifikasiDokumen,
        lolosSeleksi,
        progressPercent,
      },
      recentApplicants: recent.map((r) => ({
        id_pendaftaran: r.id_pendaftaran,
        nama: r.mahasiswa?.users?.nama || '-',
        nim: r.mahasiswa?.users?.nim || '-',
        prodi: r.mahasiswa?.prodi?.nama_prodi || '-',
        fakultas: r.mahasiswa?.fakultas?.nama_fakultas || '-',
        status: r.status_pendaftaran,
        tanggal_daftar: r.tanggal_daftar.toISOString(),
      })),
    });
  } catch (error) {
    console.error('Error fetching staff dashboard data:', error);
    return NextResponse.json({ success: false, message: 'Gagal mengambil data dashboard staff' }, { status: 500 });
  }
}
