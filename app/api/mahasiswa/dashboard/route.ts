
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
    });

    if (!mahasiswa) {
      return NextResponse.json({
        success: true,
        data: {
          hasPendaftaran: false,
          statusPendaftaran: null,
          statusDokumen: null,
          statusSeleksi: null,
          catatanRevisi: null,
          currentStage: 0,
          nama: '',
        },
      });
    }

    // Get active period
    const activePeriode = await prisma.periode.findFirst({ where: { status: 'Aktif' } });

    // Find the most recent pendaftaran for this mahasiswa in the active period
    const pendaftaran = await prisma.pendaftaran.findFirst({
      where: {
        id_mahasiswa: mahasiswa.id_mahasiswa,
        ...(activePeriode ? { id_periode: activePeriode.id_periode } : {}),
      },
      orderBy: { created_at: 'desc' },
      include: {
        dokumen_pendaftaran: {
          include: {
            persyaratan: true,
            verifikasi_dokumen: { orderBy: { tanggal_verifikasi: 'desc' }, take: 1 },
          },
        },
        hasil_seleksi: true,
        wawancara: { orderBy: { tanggal_wawancara: 'desc' }, take: 1 },
        periode_negara: { include: { negara: true } },
      },
    });

    // Surat templates from active period or general (all periods)
    const suratTemplates = await prisma.$queryRawUnsafe<
      { id_surat: number | bigint; nama_surat: string; file_path: string }[]
    >(
      activePeriode
        ? 'SELECT id_surat, nama_surat, file_path FROM surat WHERE status = 1 AND (id_periode IS NULL OR id_periode = ?) ORDER BY id_surat ASC LIMIT 8'
        : 'SELECT id_surat, nama_surat, file_path FROM surat WHERE status = 1 AND id_periode IS NULL ORDER BY id_surat ASC LIMIT 8',
      ...(activePeriode ? [activePeriode.id_periode] : [])
    );

    const mappedTemplates = suratTemplates.map((s) => ({
      id: Number(s.id_surat),
      nama: s.nama_surat,
      file_path: s.file_path,
    }));

    if (!pendaftaran) {
      return NextResponse.json({
        success: true,
        data: {
          hasPendaftaran: false,
          statusPendaftaran: 'Belum Mendaftar',
          statusDokumen: '-',
          statusSeleksi: '-',
          catatanRevisi: null,
          currentStage: 0,
          suratTemplates: mappedTemplates,
        },
      });
    }

    // Sebelum hasil seleksi dipublikasikan resmi, status kelulusan disembunyikan dari mahasiswa
    const pubStatus = await getPeriodePublikasiStatus(pendaftaran.id_periode);
    const hasilDipublikasi = pubStatus.hasil_dipublikasi;
    const rawStatus = pendaftaran.status_pendaftaran;
    const effectiveStatus =
      !hasilDipublikasi && (rawStatus === 'Lolos' || rawStatus === 'Tidak_Lolos') ? 'Wawancara' : rawStatus;
    const hasilSeleksi = hasilDipublikasi ? pendaftaran.hasil_seleksi : null;

    // Determine status labels
    const statusMap: Record<string, string> = {
      Draft: 'Draft',
      Menunggu_Verifikasi: 'Menunggu Verifikasi',
      Perbaikan_Dokumen: 'Perbaikan Dokumen',
      Verifikasi_Dokumen: 'Terverifikasi',
      Wawancara: 'Wawancara',
      Lolos: 'Lolos',
      Tidak_Lolos: 'Tidak Lolos',
    };

    // Calculate current stage (1-indexed)
    const stageOrder = [
      'Draft',
      'Menunggu_Verifikasi',
      'Perbaikan_Dokumen',
      'Verifikasi_Dokumen',
      'Wawancara',
      'Lolos',
    ];
    let currentStage = stageOrder.indexOf(effectiveStatus) + 1;
    if (effectiveStatus === 'Tidak_Lolos') currentStage = 6;
    if (currentStage <= 0) currentStage = 1;

    // Document status
    const totalDocs = pendaftaran.dokumen_pendaftaran.length;
    const validDocs = pendaftaran.dokumen_pendaftaran.filter((d) => d.status === 'Valid').length;
    const revisiDocs = pendaftaran.dokumen_pendaftaran.filter((d) => d.status === 'Revisi').length;

    let statusDokumen = 'Belum Upload';
    if (totalDocs > 0) {
      if (validDocs === totalDocs) statusDokumen = 'Terverifikasi';
      else if (revisiDocs > 0) statusDokumen = 'Perlu Revisi';
      else statusDokumen = 'Menunggu';
    }

    // Seleksi status
    let statusSeleksi = 'Menunggu';
    if (hasilSeleksi) {
      statusSeleksi = hasilSeleksi.status === 'Lolos'
        ? 'Lolos'
        : hasilSeleksi.status === 'Cadangan'
          ? 'Cadangan'
          : 'Tidak Lolos';
    } else if (
      effectiveStatus === 'Draft' ||
      effectiveStatus === 'Menunggu_Verifikasi' ||
      effectiveStatus === 'Perbaikan_Dokumen'
    ) {
      statusSeleksi = '-';
    }

    // Catatan revisi
    const catatanRevisi = pendaftaran.catatan || null;

    // Map dokumen detail for student verification view
    const dokumenList = pendaftaran.dokumen_pendaftaran.map((d) => ({
      id_dokumen: d.id_dokumen,
      id_persyaratan: d.id_persyaratan,
      nama_persyaratan: d.persyaratan.nama_persyaratan,
      format_file: d.persyaratan.format_file,
      file_path: d.file_path,
      status: d.status,
      catatan: d.verifikasi_dokumen[0]?.catatan || null,
      tanggal_verifikasi: d.verifikasi_dokumen[0]?.tanggal_verifikasi || null,
    }));

    return NextResponse.json({
      success: true,
      data: {
        hasPendaftaran: true,
        id_pendaftaran: pendaftaran.id_pendaftaran,
        statusPendaftaran: statusMap[effectiveStatus] || effectiveStatus,
        statusDokumen,
        statusSeleksi,
        catatanRevisi,
        currentStage,
        hasilDipublikasi,
        negaraTujuan:
          hasilDipublikasi &&
            (effectiveStatus === 'Lolos' || hasilSeleksi?.status === 'Lolos') &&
            pendaftaran.periode_negara?.status !== false &&
            pendaftaran.periode_negara?.negara?.status !== false
            ? pendaftaran.periode_negara?.negara?.nama_negara || null
            : null,
        dokumen: dokumenList,
        suratTemplates: mappedTemplates,
      },
    });
  } catch (error) {
    console.error('Error fetching mahasiswa dashboard:', error);
    return NextResponse.json({ success: false, message: 'Gagal mengambil data dashboard mahasiswa' }, { status: 500 });
  }
}
