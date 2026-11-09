import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { pendaftaran_status_pendaftaran } from '@prisma/client';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    const search = searchParams.get('search')?.trim() || '';
    const status = searchParams.get('status')?.trim() || '';
    const fakultas = searchParams.get('fakultas')?.trim() || '';
    const idPeriode = searchParams.get('id_periode');
    const activeOnly = searchParams.get('active_only') === 'true';
    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
    const limit = Math.max(1, parseInt(searchParams.get('limit') || '10', 10));
    const skip = (page - 1) * limit;

    // Single item fetch
    if (id) {
      const item = await prisma.pendaftaran.findUnique({
        where: { id_pendaftaran: parseInt(id, 10) },
        include: {
          mahasiswa: {
            include: {
              users: { select: { id_user: true, nim: true, nama: true, email: true } },
              fakultas: { select: { id_fakultas: true, nama_fakultas: true } },
              prodi: { select: { id_prodi: true, nama_prodi: true } },
            },
          },
          periode: { select: { id_periode: true, nama_periode: true, tahun: true } },
          periode_negara: {
            include: {
              negara: { select: { id_negara: true, nama_negara: true } },
            },
          },
          dokumen_pendaftaran: {
            include: {
              persyaratan: { select: { nama_persyaratan: true, format_file: true } },
            },
          },
          orang_tua: true,
        },
      });

      if (!item) {
        return NextResponse.json({ success: false, message: 'Data pendaftaran tidak ditemukan' }, { status: 404 });
      }

      return NextResponse.json({ success: true, data: mapPendaftaranItem(item) });
    }

    // Build filters
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const where: any = {};

    // Filter by search (nama or nim)
    if (search) {
      where.OR = [
        { mahasiswa: { users: { nama: { contains: search } } } },
        { mahasiswa: { users: { nim: { contains: search } } } },
      ];
    }

    // Filter by status
    if (status && status !== 'Semua Status' && status !== 'all') {
      // Map UI friendly values if needed
      let statusEnum: pendaftaran_status_pendaftaran | undefined;
      if (status === 'Terverifikasi' || status === 'Verifikasi Dokumen') {
        statusEnum = pendaftaran_status_pendaftaran.Verifikasi_Dokumen;
      } else if (status === 'Menunggu' || status === 'Menunggu Verifikasi') {
        statusEnum = pendaftaran_status_pendaftaran.Menunggu_Verifikasi;
      } else if (status === 'Perlu Perbaikan' || status === 'Perbaikan Dokumen') {
        statusEnum = pendaftaran_status_pendaftaran.Perbaikan_Dokumen;
      } else if (Object.values(pendaftaran_status_pendaftaran).includes(status as pendaftaran_status_pendaftaran)) {
        statusEnum = status as pendaftaran_status_pendaftaran;
      }

      if (statusEnum) {
        where.status_pendaftaran = statusEnum;
      }
    } else {
      // Pendaftaran berstatus 'Draft' belum resmi dikirim mahasiswa sehingga tidak boleh tampil di Admin & Staff
      where.status_pendaftaran = { not: 'Draft' };
    }

    // Filter by fakultas
    if (fakultas && fakultas !== 'Semua Fakultas' && fakultas !== 'all') {
      where.mahasiswa = {
        ...where.mahasiswa,
        fakultas: {
          nama_fakultas: fakultas,
        },
      };
    }

    // Filter by periode
    const activePeriode = await prisma.periode.findFirst({
      where: { status: 'Aktif' },
      select: { id_periode: true, nama_periode: true, tahun: true, status: true },
    });

    if (activeOnly) {
      where.id_periode = activePeriode ? activePeriode.id_periode : -1;
    } else if (idPeriode && idPeriode !== 'all') {
      where.id_periode = parseInt(idPeriode, 10);
    }

    const [total, items] = await Promise.all([
      prisma.pendaftaran.count({ where }),
      prisma.pendaftaran.findMany({
        where,
        include: {
          mahasiswa: {
            include: {
              users: { select: { id_user: true, nim: true, nama: true, email: true } },
              fakultas: { select: { id_fakultas: true, nama_fakultas: true } },
              prodi: { select: { id_prodi: true, nama_prodi: true } },
            },
          },
          periode: { select: { id_periode: true, nama_periode: true, tahun: true } },
          periode_negara: {
            include: {
              negara: { select: { id_negara: true, nama_negara: true } },
            },
          },
          dokumen_pendaftaran: {
            include: {
              persyaratan: { select: { id_persyaratan: true, nama_persyaratan: true, format_file: true } },
            },
          },
          orang_tua: true,
        },
        orderBy: { id_pendaftaran: 'desc' },
        skip,
        take: limit,
      }),
    ]);

    return NextResponse.json({
      success: true,
      data: items.map(mapPendaftaranItem),
      activePeriode: activePeriode || null,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit) || 1,
      },
    });
  } catch (error) {
    console.error('Error fetching pendaftaran:', error);
    return NextResponse.json({ success: false, message: 'Gagal mengambil data pendaftaran' }, { status: 500 });
  }
}

// PUT /api/pendaftaran - Update status & catatan pendaftaran
export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const { id_pendaftaran, status_pendaftaran, catatan, id_periode_negara } = body;

    const targetId = parseInt(String(id_pendaftaran), 10);
    if (!targetId || isNaN(targetId)) {
      return NextResponse.json({ success: false, message: 'ID Pendaftaran wajib diisi!' }, { status: 400 });
    }

    const existing = await prisma.pendaftaran.findUnique({ where: { id_pendaftaran: targetId } });
    if (!existing) {
      return NextResponse.json({ success: false, message: 'Data pendaftaran tidak ditemukan' }, { status: 404 });
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const updateData: any = { updated_at: new Date() };
    if (status_pendaftaran) {
      updateData.status_pendaftaran = status_pendaftaran;
    }
    if (catatan !== undefined) {
      updateData.catatan = catatan;
    }
    if (id_periode_negara !== undefined && id_periode_negara !== null && id_periode_negara !== '') {
      updateData.id_periode_negara = parseInt(String(id_periode_negara), 10);
    }

    const updated = await prisma.pendaftaran.update({
      where: { id_pendaftaran: targetId },
      data: updateData,
      include: {
        mahasiswa: {
          include: {
            users: { select: { nama: true, nim: true } },
            fakultas: true,
            prodi: true,
          },
        },
        periode: true,
        periode_negara: { include: { negara: true } },
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Status pendaftaran berhasil diperbarui!',
      data: mapPendaftaranItem(updated),
    });
  } catch (error) {
    console.error('Error updating pendaftaran:', error);
    return NextResponse.json({ success: false, message: 'Gagal memperbarui status pendaftaran' }, { status: 500 });
  }
}

// DELETE /api/pendaftaran?id=xxx - Hapus pendaftaran
export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const idParam = searchParams.get('id');
    const targetId = parseInt(String(idParam), 10);

    if (!targetId || isNaN(targetId)) {
      return NextResponse.json({ success: false, message: 'ID Pendaftaran wajib diisi!' }, { status: 400 });
    }

    await prisma.pendaftaran.delete({
      where: { id_pendaftaran: targetId },
    });

    return NextResponse.json({ success: true, message: 'Data pendaftaran berhasil dihapus!' });
  } catch (error) {
    console.error('Error deleting pendaftaran:', error);
    return NextResponse.json({ success: false, message: 'Gagal menghapus data pendaftaran' }, { status: 500 });
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapPendaftaranItem(item: any) {
  const mhs = item.mahasiswa;
  const user = mhs?.users;
  const fak = mhs?.fakultas;
  const prodi = mhs?.prodi;
  const periode = item.periode;
  const negara = item.periode_negara?.negara;

  // Status mapping to UI label & visual style
  let statusLabel = 'Menunggu';
  let statusBadgeType: 'terverifikasi' | 'menunggu' | 'perlu_perbaikan' | 'draft' | 'lolos' = 'menunggu';

  switch (item.status_pendaftaran) {
    case 'Verifikasi_Dokumen':
      statusLabel = 'Terverifikasi';
      statusBadgeType = 'terverifikasi';
      break;
    case 'Menunggu_Verifikasi':
      statusLabel = 'Menunggu';
      statusBadgeType = 'menunggu';
      break;
    case 'Perbaikan_Dokumen':
      statusLabel = 'Perlu Perbaikan';
      statusBadgeType = 'perlu_perbaikan';
      break;
    case 'Lolos':
      statusLabel = 'Lolos';
      statusBadgeType = 'lolos';
      break;
    case 'Tidak_Lolos':
      statusLabel = 'Tidak Lolos';
      statusBadgeType = 'perlu_perbaikan';
      break;
    case 'Wawancara':
      statusLabel = 'Wawancara';
      statusBadgeType = 'menunggu';
      break;
    case 'Draft':
    default:
      statusLabel = 'Draft';
      statusBadgeType = 'draft';
      break;
  }

  return {
    id_pendaftaran: item.id_pendaftaran,
    id_mahasiswa: item.id_mahasiswa,
    id_periode: item.id_periode,
    id_periode_negara: item.id_periode_negara,
    nim: user?.nim || '-',
    nama: user?.nama || '-',
    email: user?.email || '-',
    nama_fakultas: fak?.nama_fakultas || '-',
    nama_prodi: prodi?.nama_prodi || '-',
    nama_periode: periode?.nama_periode || '-',
    tahun_periode: periode?.tahun || null,
    nama_negara: negara?.nama_negara || '-',
    jenis_kelamin: item.jenis_kelamin,
    no_hp: item.no_hp,
    alamat: item.alamat,
    tempat_lahir: item.tempat_lahir,
    tanggal_lahir: item.tanggal_lahir,
    asal_sekolah: item.asal_sekolah,
    total_sks: item.total_sks,
    ipk: item.ipk ? parseFloat(item.ipk.toString()) : null,
    deskripsi_diri: item.deskripsi_diri,
    golongan_darah: item.golongan_darah,
    riwayat_penyakit: item.riwayat_penyakit,
    alergi: item.alergi,
    ukuran_kaos: item.ukuran_kaos,
    tanggal_daftar: item.tanggal_daftar,
    status_pendaftaran: item.status_pendaftaran,
    status_label: statusLabel,
    status_badge_type: statusBadgeType,
    catatan: item.catatan || '',
    dokumen: (item.dokumen_pendaftaran || []).map((d: any) => ({
      id_dokumen: d.id_dokumen,
      id_persyaratan: d.id_persyaratan,
      nama_persyaratan: d.persyaratan?.nama_persyaratan || `Persyaratan #${d.id_persyaratan}`,
      format_file: d.persyaratan?.format_file || 'pdf',
      file_path: d.file_path,
      status: d.status,
      uploaded_at: d.uploaded_at,
    })),
    orang_tua: item.orang_tua || null,
  };
}
