import React from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import SectionTitle from '@/components/SectionTitle';
import TimelineItem from '@/components/TimelineItem';
import { prisma } from '@/lib/prisma';
import { computeTimelineStatus, formatIndonesianDateRange } from '@/app/api/timeline/route';
import { Calendar, AlertCircle } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function TimelinePage() {
  type TimelineStatus = 'Berlangsung' | 'Belum Dimulai' | 'Selesai';

  interface TimelineEntry {
    id: number;
    title: string;
    date: string;
    deskripsi?: string;
    status: TimelineStatus;
  }

  let timelineList: TimelineEntry[] = [];
  let periodeInfo: { nama_periode: string; tahun: number } | null = null;

  try {
    let activePeriode = await prisma.periode.findFirst({ where: { status: 'Aktif' } });
    if (!activePeriode) {
      activePeriode = await prisma.periode.findFirst({ orderBy: { id_periode: 'desc' } });
    }

    if (activePeriode) {
      periodeInfo = {
        nama_periode: activePeriode.nama_periode,
        tahun: activePeriode.tahun,
      };

      const id_periode = activePeriode.id_periode;

      // Auto seed if empty
      const count = await prisma.timeline.count({ where: { id_periode } });
      if (count === 0) {
        const defaultStages = [
          {
            id_periode,
            nama_tahapan: 'Pendaftaran & Unggah Berkas Persyaratan',
            urutan: 1,
            tanggal_mulai: new Date('2026-10-01'),
            tanggal_selesai: new Date('2026-10-05'),
            deskripsi: 'Pendaftaran online melalui portal mahasiswa dan mengunggah seluruh berkas administrasi yang dipersyaratkan.',
            status: true,
          },
          {
            id_periode,
            nama_tahapan: 'Seleksi Administrasi & Verifikasi Dokumen',
            urutan: 2,
            tanggal_mulai: new Date('2026-10-06'),
            tanggal_selesai: new Date('2026-10-08'),
            deskripsi: 'Pemeriksaan keabsahan berkas pendaftaran dan validasi dokumen oleh panitia seleksi KKN Internasional.',
            status: true,
          },
          {
            id_periode,
            nama_tahapan: 'Tes Kemampuan Bahasa Asing (TOEFL/IELTS/TOAFL)',
            urutan: 3,
            tanggal_mulai: new Date('2026-10-09'),
            tanggal_selesai: new Date('2026-10-10'),
            deskripsi: 'Uji kompetensi kecakapan bahasa asing (Inggris/Arab) sebagai persiapan komunikasi di negara tujuan.',
            status: true,
          },
          {
            id_periode,
            nama_tahapan: 'Seleksi Wawancara & Pendalaman Program Kerja',
            urutan: 4,
            tanggal_mulai: new Date('2026-10-11'),
            tanggal_selesai: new Date('2026-10-13'),
            deskripsi: 'Wawancara langsung oleh tim penguji mengenai motivasi, kesiapan mental, wawasan global, dan proposal program kerja.',
            status: true,
          },
          {
            id_periode,
            nama_tahapan: 'Pengumuman Hasil Akhir Kelulusan Peserta',
            urutan: 5,
            tanggal_mulai: new Date('2026-10-15'),
            tanggal_selesai: new Date('2026-10-15'),
            deskripsi: 'Pengumuman resmi daftar nama mahasiswa yang lolos sebagai delegasi KKN Internasional UINSSC.',
            status: true,
          },
          {
            id_periode,
            nama_tahapan: 'Pembekalan, Orientasi & Pengurusan Paspor/Visa',
            urutan: 6,
            tanggal_mulai: new Date('2026-10-18'),
            tanggal_selesai: new Date('2026-10-25'),
            deskripsi: 'Pemberian materi kultural, persiapan teknis, administrasi imigrasi, dan etika pengabdian di luar negeri.',
            status: true,
          },
          {
            id_periode,
            nama_tahapan: 'Pemberangkatan & Pelaksanaan KKN Internasional',
            urutan: 7,
            tanggal_mulai: new Date('2026-11-01'),
            tanggal_selesai: new Date('2026-11-15'),
            deskripsi: 'Pelepasan resmi dan pelaksanaan program pengabdian kepada masyarakat di negara penempatan.',
            status: true,
          },
          {
            id_periode,
            nama_tahapan: 'Pelaporan Akhir, Seminar Hasil & Evaluasi',
            urutan: 8,
            tanggal_mulai: new Date('2026-11-20'),
            tanggal_selesai: new Date('2026-11-25'),
            deskripsi: 'Penyusunan laporan akhir kegiatan, desiminasi hasil pengabdian, serta penilaian akhir.',
            status: true,
          },
        ];
        for (const s of defaultStages) {
          await prisma.timeline.create({ data: s });
        }
      }

      const items = await prisma.timeline.findMany({
        where: { id_periode, status: true },
        orderBy: [
          { urutan: 'asc' },
          { tanggal_mulai: 'asc' },
        ],
      });

      timelineList = items.map((item) => {
        const status = computeTimelineStatus(item.tanggal_mulai, item.tanggal_selesai);
        const formattedDate = formatIndonesianDateRange(item.tanggal_mulai, item.tanggal_selesai);

        return {
          id: item.id_timeline,
          title: item.nama_tahapan,
          date: formattedDate,
          deskripsi: item.deskripsi,
          status,
        };
      });
    }
  } catch (error) {
    console.warn('Tidak dapat terhubung ke database di TimelinePage:', error);
  }

  return (
    <div className="min-h-screen flex flex-col bg-white font-sans">
      <Header />

      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <SectionTitle
          prefixTitle="TIMELINE PENDAFTARAN"
          description="Perhatikan jadwal dan tahapan berikut agar tidak terlewat. Status tahapan diperbarui otomatis secara real-time berdasarkan tanggal berjalan."
        />

        {/* Periode Banner */}
        {periodeInfo && (
          <div className="mt-4 mb-6 p-4 rounded-2xl bg-[#E8F5F1] border border-[#a8d5c2] flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#0E4A3E] text-white flex items-center justify-center shrink-0 shadow-xs">
                <Calendar className="w-5 h-5 text-amber-300" />
              </div>
              <div>
                <p className="text-xs text-[#0E4A3E]/80 font-bold uppercase tracking-wider">
                  Periode Pendaftaran Aktif
                </p>
                <h3 className="text-sm sm:text-base font-extrabold text-[#0E4A3E]">
                  {periodeInfo.nama_periode} ({periodeInfo.tahun})
                </h3>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-[#0E4A3E] text-xs font-bold border border-emerald-300">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                Sinkron Database
              </span>
            </div>
          </div>
        )}

        {/* Timeline Items List */}
        {timelineList.length > 0 ? (
          <div className="space-y-4 my-8">
            {timelineList.map((item) => (
              <TimelineItem
                key={item.id}
                title={item.title}
                date={item.date}
                status={item.status}
              />
            ))}
          </div>
        ) : (
          <div className="my-12 p-8 text-center bg-slate-50 border border-slate-200 rounded-3xl max-w-xl mx-auto space-y-3">
            <AlertCircle className="w-10 h-10 text-slate-400 mx-auto" />
            <h3 className="text-base font-bold text-slate-700">Belum Ada Jadwal Timeline</h3>
            <p className="text-xs text-slate-500">
              Jadwal tahapan seleksi untuk periode ini belum diatur atau dinonaktifkan oleh administrator.
            </p>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
