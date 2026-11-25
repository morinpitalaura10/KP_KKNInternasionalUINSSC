import React from 'react';
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import AnnouncementCard from '@/components/AnnouncementCard';
import { prisma } from '@/lib/prisma';
import { Megaphone, Calendar, FileText, ArrowRight, Sparkles, AlertCircle } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function PengumumanPage() {
  let announcements: {
    id: string;
    day: string;
    month: string;
    year: string;
    title: string;
    summary: string;
    dateStr: string;
    authorStr: string;
    fullContent: string;
  }[] = [];

  let periodeInfo: { id_periode: number; nama_periode: string; tahun: number } | null = null;

  try {
    // Tamu / publik hanya melihat pengumuman dari periode yang berstatus Aktif
    let activePeriode = await prisma.periode.findFirst({ where: { status: 'Aktif' } });
    if (!activePeriode) {
      activePeriode = await prisma.periode.findFirst({ orderBy: { id_periode: 'desc' } });
    }

    if (activePeriode) {
      periodeInfo = {
        id_periode: activePeriode.id_periode,
        nama_periode: activePeriode.nama_periode,
        tahun: activePeriode.tahun,
      };
    }

    const whereClause: any = { status: true };
    if (activePeriode) {
      whereClause.id_periode = activePeriode.id_periode;
    }

    const items = await prisma.pengumuman.findMany({
      where: whereClause,
      orderBy: { tanggal_publish: 'desc' },
      include: {
        users: { select: { nama: true } },
        periode: { select: { nama_periode: true } },
      },
    });

    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agt', 'Sep', 'Okt', 'Nov', 'Des'];

    announcements = items.map((item) => {
      const d = new Date(item.tanggal_publish);
      return {
        id: String(item.id_pengumuman),
        day: String(d.getDate()),
        month: monthNames[d.getMonth()] || 'Jan',
        year: String(d.getFullYear()),
        title: item.judul,
        summary: item.isi.substring(0, 160) + (item.isi.length > 160 ? '...' : ''),
        dateStr: d.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }),
        authorStr: item.users?.nama || 'Panitia LP2M',
        fullContent: item.isi,
      };
    });
  } catch (error) {
    console.warn('Tidak dapat terhubung ke database di PengumumanPage:', error);
  }

  return (
    <div className="min-h-screen flex flex-col bg-white font-sans scroll-smooth">
      {/* Top Header Bar */}
      <Header />

      <main className="flex-1 w-full">
        {/* Top Title Section (White Background Area - Konsisten dengan /informasi, /persyaratan & /timeline) */}
        <section className="py-6 sm:py-10 bg-white">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-3 sm:space-y-4">
            <div className="text-left space-y-1.5 sm:space-y-2">
              <h1 className="text-base sm:text-2xl md:text-3xl lg:text-4xl font-archivo text-[#0E4A3E] tracking-tight leading-tight uppercase">
                PENGUMUMAN & WARTA TERBARU <br className="hidden sm:block" />
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
                Ikuti seluruh informasi resmi, edaran berkas, jadwal tes seleksi bahasa dan wawancara, serta pengumuman hasil kelulusan delegasi peserta KKN Internasional.
              </p>
            </div>
          </div>
        </section>

        {/* Main Content Area (Sage Green Background #568E7D - Konsisten dengan /informasi, /persyaratan & /timeline) */}
        <section className="bg-[#568E7D] text-white py-8 sm:py-14">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 sm:space-y-12">
            
            {/* Announcements Card Container */}
            <div className="bg-white/10 border border-white/25 rounded-2xl sm:rounded-3xl p-5 sm:p-8 md:p-10 shadow-xl space-y-6 sm:space-y-8">
              
              {/* Header Box */}
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/20 pb-3 sm:pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center text-white shrink-0 shadow-xs">
                    <Megaphone className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h2 className="text-base sm:text-2xl font-archivo text-white tracking-wide uppercase">
                      DAFTAR PENGUMUMAN RESMI
                    </h2>
                    <p className="text-[11px] sm:text-xs text-emerald-100/90 font-medium">
                      {periodeInfo ? `Periode Aktif: ${periodeInfo.nama_periode} (${periodeInfo.tahun})` : 'Pemberitahuan Terkini LP2M'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold bg-[#C0E6D8] text-[#0E4A3E] px-3.5 py-1 rounded-full shadow-xs flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5" />
                    {announcements.length} Pengumuman
                  </span>
                </div>
              </div>

              {/* Announcement Cards List */}
              {announcements.length === 0 ? (
                <div className="w-full bg-[#0E4A3E]/50 border border-white/20 rounded-2xl sm:rounded-3xl p-8 sm:p-12 text-center shadow-lg space-y-4">
                  <div className="mx-auto w-16 h-16 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center text-[#C0E6D8] shadow-xs">
                    <AlertCircle className="w-8 h-8 text-[#C0E6D8]" />
                  </div>

                  <div className="space-y-1.5">
                    <h3 className="text-base sm:text-xl font-bold text-white tracking-tight">
                      Belum Ada Pengumuman Baru
                    </h3>
                    <p className="text-xs sm:text-sm text-emerald-100/80 max-w-md mx-auto leading-relaxed">
                      Saat ini belum ada pengumuman resmi yang diterbitkan untuk{' '}
                      <strong className="text-white">{periodeInfo?.nama_periode || 'periode aktif'}</strong>.
                      Seluruh informasi penting dan hasil seleksi akan diumumkan di sini.
                    </p>
                  </div>

                  {/* Quick Links */}
                  <div className="pt-4 flex flex-wrap items-center justify-center gap-3">
                    <Link
                      href="/timeline"
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/15 hover:bg-white/25 text-white text-xs font-bold border border-white/20 transition-all"
                    >
                      <Calendar className="w-3.5 h-3.5 text-[#C0E6D8]" />
                      <span>Cek Jadwal Timeline</span>
                    </Link>
                    <Link
                      href="/persyaratan"
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/15 hover:bg-white/25 text-white text-xs font-bold border border-white/20 transition-all"
                    >
                      <FileText className="w-3.5 h-3.5 text-[#C0E6D8]" />
                      <span>Lihat Syarat Berkas</span>
                    </Link>
                  </div>
                </div>
              ) : (
                <div className="space-y-4 pt-1">
                  {announcements.map((item) => (
                    <AnnouncementCard
                      key={item.id}
                      id={item.id}
                      day={item.day}
                      month={item.month}
                      year={item.year}
                      title={item.title}
                      summary={item.summary}
                      authorStr={item.authorStr}
                    />
                  ))}
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
