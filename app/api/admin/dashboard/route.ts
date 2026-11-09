import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { Prisma } from '@prisma/client';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const reqPeriodeId = searchParams.get('id_periode');

    // 1. Dapatkan periode yang diminta, periode aktif, atau periode yang memiliki pendaftaran
    let activePeriode = null;
    if (reqPeriodeId) {
      activePeriode = await prisma.periode.findUnique({
        where: { id_periode: parseInt(reqPeriodeId, 10) },
      });
    }

    if (!activePeriode) {
      activePeriode = await prisma.periode.findFirst({
        where: { status: 'Aktif' },
        orderBy: { id_periode: 'desc' },
      });
    }

    if (!activePeriode) {
      activePeriode = (await prisma.periode.findFirst({
        where: { pendaftaran: { some: {} } },
        orderBy: { id_periode: 'desc' },
      })) || (await prisma.periode.findFirst({
        orderBy: { tahun: 'desc' },
      }));
    }

    const id_periode = activePeriode?.id_periode;

    // 2. Agregasi statistik status pendaftaran sesuai field database
    const [
      totalPendaftaran,
      menungguVerifikasi,
      verifikasiDokumen,
      perluPerbaikan,
      wawancaraCount,
      lolosSeleksi,
      tidakLolos,
      draftCount,
      totalMahasiswa,
      totalStaff,
      totalPengumuman,
    ] = await Promise.all([
      id_periode
        ? prisma.pendaftaran.count({ where: { id_periode, status_pendaftaran: { not: 'Draft' } } })
        : prisma.pendaftaran.count({ where: { status_pendaftaran: { not: 'Draft' } } }),
      id_periode
        ? prisma.pendaftaran.count({ where: { id_periode, status_pendaftaran: 'Menunggu_Verifikasi' } })
        : prisma.pendaftaran.count({ where: { status_pendaftaran: 'Menunggu_Verifikasi' } }),
      id_periode
        ? prisma.pendaftaran.count({ where: { id_periode, status_pendaftaran: 'Verifikasi_Dokumen' } })
        : prisma.pendaftaran.count({ where: { status_pendaftaran: 'Verifikasi_Dokumen' } }),
      id_periode
        ? prisma.pendaftaran.count({ where: { id_periode, status_pendaftaran: 'Perbaikan_Dokumen' } })
        : prisma.pendaftaran.count({ where: { status_pendaftaran: 'Perbaikan_Dokumen' } }),
      id_periode
        ? prisma.pendaftaran.count({ where: { id_periode, status_pendaftaran: 'Wawancara' } })
        : prisma.pendaftaran.count({ where: { status_pendaftaran: 'Wawancara' } }),
      id_periode
        ? prisma.pendaftaran.count({ where: { id_periode, status_pendaftaran: 'Lolos' } })
        : prisma.pendaftaran.count({ where: { status_pendaftaran: 'Lolos' } }),
      id_periode
        ? prisma.pendaftaran.count({ where: { id_periode, status_pendaftaran: 'Tidak_Lolos' } })
        : prisma.pendaftaran.count({ where: { status_pendaftaran: 'Tidak_Lolos' } }),
      id_periode
        ? prisma.pendaftaran.count({ where: { id_periode, status_pendaftaran: 'Draft' } })
        : prisma.pendaftaran.count({ where: { status_pendaftaran: 'Draft' } }),
      prisma.mahasiswa.count(),
      prisma.staff.count({ where: { status: true } }),
      prisma.pengumuman.count({ where: { status: true } }),
    ]);

    // 3. Pipeline Tahapan Pendaftaran (sesuai alur status pendaftaran di DB)
    // Stage 1: Pendaftaran (Seluruh berkas masuk: total)
    // Stage 2: Verifikasi Dokumen (Yang sudah submit berkas & diverifikasi)
    // Stage 3: Seleksi (Yang sudah lolos verifikasi administrasi & masuk penilaian)
    // Stage 4: Wawancara (Yang masuk sesi wawancara)
    // Stage 5: Pengumuman (Yang telah ditetapkan hasil akhir: Lolos / Tidak Lolos)
    const stage1Count = totalPendaftaran;
    const stage2Count = menungguVerifikasi + perluPerbaikan + verifikasiDokumen + wawancaraCount + lolosSeleksi + tidakLolos;
    const stage3Count = verifikasiDokumen + wawancaraCount + lolosSeleksi;
    const stage4Count = wawancaraCount + lolosSeleksi;
    const stage5Count = lolosSeleksi + tidakLolos;

    const tahapan = [
      {
        id: 1,
        nama: 'Pendaftaran',
        count: stage1Count,
        isActive: stage1Count > 0,
      },
      {
        id: 2,
        nama: 'Verifikasi Dokumen',
        count: stage2Count,
        isActive: stage2Count > 0,
      },
      {
        id: 3,
        nama: 'Seleksi',
        count: stage3Count,
        isActive: stage3Count > 0,
      },
      {
        id: 4,
        nama: 'Wawancara',
        count: stage4Count,
        isActive: stage4Count > 0,
      },
      {
        id: 5,
        nama: 'Pengumuman',
        count: stage5Count,
        isActive: stage5Count > 0,
      },
    ];

    // 4. Grafik pendaftar per hari dari tanggal_daftar di database
    let dailyRows: any[] = [];
    try {
      dailyRows = await prisma.$queryRaw<Array<{ tgl: any; count: any }>>`
        SELECT DATE(tanggal_daftar) as tgl, COUNT(*) as count 
        FROM pendaftaran 
        WHERE status_pendaftaran != 'Draft'
        ${id_periode ? Prisma.sql`AND id_periode = ${id_periode}` : Prisma.empty}
        GROUP BY DATE(tanggal_daftar) 
        ORDER BY tgl ASC
      `;
    } catch (e) {
      console.error('Error querying daily registrations:', e);
    }

    const dailyRegistrations = dailyRows.map((row) => {
      const dateObj = new Date(row.tgl);
      return {
        date: dateObj.toISOString().split('T')[0],
        label: dateObj.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' }),
        count: Number(row.count) || 0,
      };
    });

    // 5. Pengumuman Terbaru
    const recentPengumuman = await prisma.pengumuman.findMany({
      where: {
        status: true,
        ...(id_periode ? { id_periode } : {}),
      },
      orderBy: { tanggal_publish: 'desc' },
      take: 4,
      select: {
        id_pengumuman: true,
        judul: true,
        isi: true,
        tanggal_publish: true,
        status: true,
      },
    });

    const now = new Date();
    const isOngoing = activePeriode
      ? activePeriode.status === 'Aktif' || (now >= activePeriode.tanggal_mulai && now <= activePeriode.tanggal_selesai)
      : false;

    // Ambil daftar seluruh periode untuk dropdown selector
    const periodes = await prisma.periode.findMany({
      orderBy: { created_at: 'desc' },
      select: { id_periode: true, nama_periode: true, tahun: true, status: true, kuota: true },
    });

    return NextResponse.json({
      success: true,
      data: {
        activePeriode: activePeriode
          ? {
              id_periode: activePeriode.id_periode,
              nama_periode: activePeriode.nama_periode,
              tahun: activePeriode.tahun,
              kuota: activePeriode.kuota,
              status: activePeriode.status === 'Belum_Aktif' ? 'Belum Aktif' : activePeriode.status,
              tanggal_mulai: activePeriode.tanggal_mulai.toISOString().split('T')[0],
              tanggal_selesai: activePeriode.tanggal_selesai.toISOString().split('T')[0],
              isOngoing,
            }
          : null,
        periodes: periodes.map((p) => ({
          id_periode: p.id_periode,
          nama_periode: p.nama_periode,
          tahun: p.tahun,
          status: p.status === 'Belum_Aktif' ? 'Belum Aktif' : p.status,
          kuota: p.kuota,
        })),
        stats: {
          totalPendaftaran,
          menungguVerifikasi,
          verifikasiDokumen,
          perluPerbaikan,
          wawancaraCount,
          lolosSeleksi,
          tidakLolos,
          draftCount,
          totalMahasiswa,
          totalStaff,
          totalPengumuman,
        },
        tahapan,
        dailyRegistrations,
        recentPengumuman: recentPengumuman.map((p) => ({
          id_pengumuman: p.id_pengumuman,
          judul: p.judul,
          isi: p.isi,
          tanggal_publish: p.tanggal_publish.toISOString(),
        })),
      },
    });
  } catch (error) {
    console.error('Error fetching admin dashboard data:', error);
    return NextResponse.json(
      { success: false, message: 'Gagal mengambil data statistik dashboard admin' },
      { status: 500 }
    );
  }
}
