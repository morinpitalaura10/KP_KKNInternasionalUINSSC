import React from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import TimelineItem from '@/components/TimelineItem';
import { prisma } from '@/lib/prisma';
import { computeTimelineStatus, formatIndonesianDateRange } from '@/app/api/timeline/route';
import { Calendar, AlertCircle, Sparkles, CheckCircle2 } from 'lucide-react';

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

  const activeStage = timelineList.find((item) => item.status === 'Berlangsung');

  return (
    <div className="min-h-screen flex flex-col bg-white font-sans scroll-smooth">
      {/* Top Header Bar */}
      <Header />

      <main className="flex-1 w-full">
        {/* Top Title Section (White Background Area - Konsisten dengan /informasi & /persyaratan) */}
        <section className="py-6 sm:py-10 bg-white">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-3 sm:space-y-4">
            <div className="text-left space-y-1.5 sm:space-y-2">
              <h1 className="text-base sm:text-2xl md:text-3xl lg:text-4xl font-archivo text-[#0E4A3E] tracking-tight leading-tight uppercase">
                JADWAL & TIMELINE PENDAFTARAN <br className="hidden sm:block" />
                KULIAH KERJA NYATA INTERNASIONAL
              </h1>
              <h2 className="text-[10px] sm:text-base md:text-lg lg:text-xl font-archivo text-[#0E4A3E] uppercase tracking-wide leading-tight">
                UNIVERSITAS ISLAM NEGERI SIBER SYEKH NURJATI CIREBON
              </h2>
              {periodeInfo && (
                <p className="text-[11px] sm:text-sm font-semibold text-gray-500 pt-0.5">
                  Periode Pendaftaran: {periodeInfo.nama_periode} ({periodeInfo.tahun})
                </p>
              )}
              <p className="text-[11px] sm:text-sm text-gray-600 max-w-2xl text-left font-normal leading-relaxed pt-0.5 sm:pt-1">
                Perhatikan jadwal dan alur tahapan seleksi berikut agar tidak terlewat. Status tahapan diperbarui otomatis secara real-time berdasarkan tanggal berjalan.
              </p>
            </div>
          </div>
        </section>

        {/* Main Content Area (Sage Green Background #568E7D - Konsisten dengan /informasi & /persyaratan) */}
        <section className="bg-[#568E7D] text-white py-8 sm:py-14">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 sm:space-y-12">
            
            {/* Timeline Roadmap Card Container */}
            <div className="bg-white/10 border border-white/25 rounded-2xl sm:rounded-3xl p-5 sm:p-8 md:p-10 shadow-xl space-y-6 sm:space-y-8">
              
              {/* Header Box */}
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/20 pb-3 sm:pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center text-white shrink-0 shadow-xs">
                    <Calendar className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h2 className="text-base sm:text-2xl font-archivo text-white tracking-wide uppercase">
                      ALUR & TAHAPAN SELEKSI KKN INTERNASIONAL
                    </h2>
                    <p className="text-[11px] sm:text-xs text-emerald-100/90 font-medium">
                      {periodeInfo ? `Periode Aktif: ${periodeInfo.nama_periode} (${periodeInfo.tahun})` : 'Jadwal Resmi Seleksi Delegasi'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold bg-[#C0E6D8] text-[#0E4A3E] px-3.5 py-1 rounded-full shadow-xs flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5" />
                    {timelineList.length} Tahapan Seleksi
                  </span>
                </div>
              </div>

              {/* Real-time Active Stage Notice */}
              {activeStage && (
                <div className="bg-[#0E4A3E]/70 border border-[#C0E6D8] rounded-2xl p-4 sm:p-5 flex items-center justify-between gap-4 text-xs sm:text-sm shadow-md">
                  <div className="flex items-center gap-3">
                    <span className="relative flex h-3 w-3 shrink-0">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#C0E6D8] opacity-75" />
                      <span className="relative inline-flex rounded-full h-3 w-3 bg-[#C0E6D8]" />
                    </span>
                    <div>
                      <span className="font-bold text-[#C0E6D8] uppercase tracking-wider text-[11px] block">
                        Tahapan Berjalan Saat Ini:
                      </span>
                      <span className="font-extrabold text-white text-xs sm:text-sm">
                        {activeStage.title} ({activeStage.date})
                      </span>
                    </div>
                  </div>
                  <span className="hidden sm:inline-block text-[11px] font-bold px-3 py-1 rounded-full bg-[#C0E6D8] text-[#0E4A3E] shrink-0">
                    Aktif Sekarang
                  </span>
                </div>
              )}

              {/* Timeline Items List */}
              {timelineList.length > 0 ? (
                <div className="space-y-6 pt-2">
                  {timelineList.map((item, idx) => (
                    <TimelineItem
                      key={item.id}
                      stepNumber={idx + 1}
                      title={item.title}
                      date={item.date}
                      deskripsi={item.deskripsi}
                      status={item.status}
                      isLast={idx === timelineList.length - 1}
                    />
                  ))}
                </div>
              ) : (
                <div className="my-8 p-8 text-center bg-white/10 border border-white/20 rounded-2xl max-w-xl mx-auto space-y-2 text-white">
                  <AlertCircle className="w-10 h-10 text-white/70 mx-auto" />
                  <h3 className="text-base font-bold">Belum Ada Jadwal Timeline</h3>
                  <p className="text-xs text-emerald-100/80">
                    Jadwal tahapan seleksi untuk periode ini belum diatur atau dinonaktifkan oleh administrator.
                  </p>
                </div>
              )}

            </div>

          </div>
        </section>

      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}
