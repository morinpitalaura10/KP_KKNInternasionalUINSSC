
import { prisma } from '@/lib/prisma';

export interface TimelineStageCheck {
  isOpen: boolean;
  status: 'BELUM_DIBUKA' | 'SEDANG_DIBUKA' | 'SUDAH_SELESAI' | 'TIDAK_DITEMUKAN';
  stageName?: string;
  tanggalMulai?: string;
  tanggalSelesai?: string;
  message?: string;
}

/**
 * Cek apakah tahapan tertentu pada suatu periode sedang aktif/buka berdasarkan tanggal hari ini.
 * Jenis tahapan:
 * - 'pendaftaran'  : Pendaftaran & Unggah Berkas
 * - 'verifikasi'   : Seleksi Administrasi & Verifikasi Dokumen
 * - 'wawancara'    : Seleksi Wawancara
 * - 'pengumuman'   : Pengumuman Hasil Akhir
 */
export async function checkTimelineWindow(
  id_periode: number,
  stageType: 'pendaftaran' | 'verifikasi' | 'wawancara' | 'pengumuman'
): Promise<TimelineStageCheck> {
  try {
    const timelines = await prisma.timeline.findMany({
      where: { id_periode },
      orderBy: { urutan: 'asc' },
    });

    if (!timelines || timelines.length === 0) {
      return {
        isOpen: true,
        status: 'TIDAK_DITEMUKAN',
        message: 'Tidak ada jadwal timeline khusus yang dikonfigurasi untuk periode ini.',
      };
    }

    // Cari tahapan yang cocok berdasarkan kata kunci atau flag
    let matched = null;
    if (stageType === 'pendaftaran') {
      matched =
        timelines.find((t) => /pendaftaran|unggah|berkas/i.test(t.nama_tahapan)) ||
        timelines[0];
    } else if (stageType === 'verifikasi') {
      matched =
        timelines.find((t) => /verifikasi|administrasi/i.test(t.nama_tahapan)) ||
        timelines.find((t) => t.urutan === 2);
    } else if (stageType === 'wawancara') {
      matched =
        timelines.find((t) => /wawancara|interview/i.test(t.nama_tahapan)) ||
        timelines.find((t) => t.urutan === 4);
    } else if (stageType === 'pengumuman') {
      matched =
        timelines.find((t) => t.is_pengumuman || /pengumuman|kelulusan/i.test(t.nama_tahapan)) ||
        timelines.find((t) => t.urutan === 5);
    }

    if (!matched) {
      return {
        isOpen: true,
        status: 'TIDAK_DITEMUKAN',
      };
    }

    const now = new Date();
    // Normalisasi perbandingan tanggal berdasarkan hari (YYYY-MM-DD lokal)
    const todayStr = now.toISOString().split('T')[0];
    const startStr = new Date(matched.tanggal_mulai).toISOString().split('T')[0];
    const endStr = new Date(matched.tanggal_selesai).toISOString().split('T')[0];

    const options: Intl.DateTimeFormatOptions = {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    };
    const formatIndo = (dStr: string) => {
      const parts = dStr.split('-');
      const d = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
      return d.toLocaleDateString('id-ID', options);
    };

    const strMulai = formatIndo(startStr);
    const strSelesai = formatIndo(endStr);

    // Kasus 1: Belum masuk tanggal mulai
    if (todayStr < startStr) {
      return {
        isOpen: false,
        status: 'BELUM_DIBUKA',
        stageName: matched.nama_tahapan,
        tanggalMulai: startStr,
        tanggalSelesai: endStr,
        message: `Tahapan "${matched.nama_tahapan}" belum dibuka. Sesuai jadwal timeline, tahapan ini baru dibuka mulai ${strMulai} s.d. ${strSelesai}. Penilaian saat ini dikunci.`,
      };
    }

    // Kasus 2: Masa tahapan sudah lewat tanggal selesai
    if (todayStr > endStr) {
      return {
        isOpen: true, // Tetap izinkan melihat atau review riwayat, namun tandai sudah lewat jadwal
        status: 'SUDAH_SELESAI',
        stageName: matched.nama_tahapan,
        tanggalMulai: startStr,
        tanggalSelesai: endStr,
        message: `Jadwal tahapan "${matched.nama_tahapan}" telah berakhir pada ${strSelesai}.`,
      };
    }

    // Kasus 3: Sedang berlangsung
    return {
      isOpen: true,
      status: 'SEDANG_DIBUKA',
      stageName: matched.nama_tahapan,
      tanggalMulai: startStr,
      tanggalSelesai: endStr,
      message: `Tahapan "${matched.nama_tahapan}" sedang berlangsung (${strMulai} s.d. ${strSelesai}).`,
    };
  } catch (error) {
    console.error('Error checking timeline window:', error);
    return {
      isOpen: true,
      status: 'TIDAK_DITEMUKAN',
      message: 'Gagal mengecek jadwal timeline.',
    };
  }
}
