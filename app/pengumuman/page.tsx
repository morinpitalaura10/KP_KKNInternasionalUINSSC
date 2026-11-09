import React from 'react';
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import SectionTitle from '@/components/SectionTitle';
import AnnouncementCard from '@/components/AnnouncementCard';
import { prisma } from '@/lib/prisma';
import { BellRing, Calendar, FileText, ArrowRight, Sparkles } from 'lucide-react';

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
        summary: item.isi.substring(0, 150) + (item.isi.length > 150 ? '...' : ''),
        dateStr: d.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }),
        authorStr: item.users?.nama || 'LP2M',
        fullContent: item.isi,
      };
    });
  } catch (error) {
    console.warn('Tidak dapat terhubung ke database di PengumumanPage:', error);
  }

  return (
    <div className="min-h-screen flex flex-col bg-white font-sans">
      <Header />

      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-12">
        <SectionTitle
          prefixTitle="PENGUMUMAN TERBARU"
          description="Perhatikan jadwal dan tahapan berikut agar tidak terlewat."
        />

        {/* Badge Penanda Periode Aktif */}
        {periodeInfo && (
          <div className="mt-3 mb-6 flex items-center gap-2">
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#E8F5F1] text-[#0E4A3E] border border-[#C0E6D8] text-xs font-bold shadow-2xs">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              Periode Aktif: {periodeInfo.nama_periode} ({periodeInfo.tahun})
            </span>
          </div>
        )}

        <div className="space-y-4 my-6">
          {announcements.length === 0 ? (
            <div className="w-full bg-gradient-to-b from-[#F6FAF8] to-white border border-[#C0E6D8] rounded-3xl p-8 sm:p-12 text-center shadow-xs">
              {/* Icon Illustration */}
              <div className="mx-auto w-20 h-20 rounded-3xl bg-[#E8F5F1] border border-[#C0E6D8] flex items-center justify-center text-[#0E4A3E] shadow-xs mb-5">
                <BellRing className="w-9 h-9 text-[#0E4A3E] stroke-[2.2]" />
              </div>

              {/* Title & Description */}
              <h3 className="text-lg sm:text-xl font-extrabold text-slate-800 tracking-tight">
                Belum Ada Pengumuman Baru
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 max-w-lg mx-auto mt-2 leading-relaxed">
                Saat ini belum ada pengumuman resmi yang diterbitkan untuk{' '}
                <strong className="text-slate-900">{periodeInfo?.nama_periode || 'periode aktif saat ini'}</strong>.
                Seluruh informasi penting, pembaruan berkas, jadwal tes, dan hasil seleksi akan diumumkan di halaman ini.
              </p>

              {/* Quick Navigation Cards */}
              <div className="mt-8 pt-8 border-t border-slate-200/80 max-w-2xl mx-auto">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-3.5">
                  Sambil menunggu, Anda dapat memeriksa:
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-left">
                  <Link
                    href="/timeline"
                    className="group p-4 rounded-2xl bg-white hover:bg-emerald-50/60 border border-slate-200 hover:border-emerald-300 transition-all shadow-2xs flex items-center justify-between gap-3"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-10 h-10 rounded-xl bg-[#E8F5F1] text-[#0E4A3E] flex items-center justify-center shrink-0">
                        <Calendar className="w-5 h-5 text-[#0E4A3E]" />
                      </div>
                      <div className="min-w-0">
                        <h4 className="font-bold text-xs sm:text-sm text-slate-900 group-hover:text-[#0E4A3E] transition-colors truncate">
                          Jadwal &amp; Timeline KKN
                        </h4>
                        <p className="text-[11px] text-slate-500 truncate">
                          Pantau alur dan batas waktu tahapan
                        </p>
                      </div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-[#0E4A3E] group-hover:translate-x-1 transition-all shrink-0" />
                  </Link>

                  <Link
                    href="/persyaratan"
                    className="group p-4 rounded-2xl bg-white hover:bg-emerald-50/60 border border-slate-200 hover:border-emerald-300 transition-all shadow-2xs flex items-center justify-between gap-3"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-10 h-10 rounded-xl bg-[#E8F5F1] text-[#0E4A3E] flex items-center justify-center shrink-0">
                        <FileText className="w-5 h-5 text-[#0E4A3E]" />
                      </div>
                      <div className="min-w-0">
                        <h4 className="font-bold text-xs sm:text-sm text-slate-900 group-hover:text-[#0E4A3E] transition-colors truncate">
                          Syarat Dokumen &amp; Nilai
                        </h4>
                        <p className="text-[11px] text-slate-500 truncate">
                          Persiapkan kelengkapan berkas Anda
                        </p>
                      </div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-[#0E4A3E] group-hover:translate-x-1 transition-all shrink-0" />
                  </Link>
                </div>
              </div>

              {/* Login Portal Reminder */}
              <div className="mt-6 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-100/80 border border-slate-200 text-[11px] text-slate-600">
                <Sparkles className="w-3.5 h-3.5 text-[#0E4A3E]" />
                <span>
                  Sudah memiliki akun pendaftaran?{' '}
                  <Link href="/login" className="font-bold text-[#0E4A3E] hover:underline">
                    Masuk ke Portal Mahasiswa
                  </Link>{' '}
                  untuk memantau status seleksi Anda.
                </span>
              </div>
            </div>
          ) : (
            announcements.map((item) => (
              <AnnouncementCard
                key={item.id}
                id={item.id}
                day={item.day}
                month={item.month}
                year={item.year}
                title={item.title}
                summary={item.summary}
              />
            ))
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
