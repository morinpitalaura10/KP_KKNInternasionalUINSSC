import React from 'react';
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { prisma } from '@/lib/prisma';
import { notFound } from 'next/navigation';
import { 
  ArrowLeft, 
  Calendar, 
  ArrowRight,
  CheckCircle2
} from 'lucide-react';

export const dynamic = 'force-dynamic';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function AnnouncementDetailPage({ params }: PageProps) {
  const { id } = await params;
  const announcementId = parseInt(id, 10);

  if (isNaN(announcementId)) {
    notFound();
  }

  const monthNames = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
  ];

  let item: {
    id: number;
    title: string;
    dateFormatted: string;
    authorName: string;
    content: string;
  } | null = null;

  let relatedItems: Array<{
    id: number;
    title: string;
    dateFormatted: string;
  }> = [];

  try {
    const pengumuman = await prisma.pengumuman.findUnique({
      where: { id_pengumuman: announcementId },
      include: {
        users: { select: { nama: true } },
      },
    });

    if (pengumuman) {
      const d = new Date(pengumuman.tanggal_publish);
      item = {
        id: pengumuman.id_pengumuman,
        title: pengumuman.judul,
        dateFormatted: `${d.getDate()} ${monthNames[d.getMonth()]} ${d.getFullYear()}`,
        authorName: pengumuman.users?.nama || 'Super Administrator LP2M',
        content: pengumuman.isi,
      };

      // Fetch other recent announcements
      const others = await prisma.pengumuman.findMany({
        where: {
          id_pengumuman: { not: announcementId },
          status: true,
        },
        orderBy: { tanggal_publish: 'desc' },
        take: 2,
      });

      relatedItems = others.map((o) => {
        const od = new Date(o.tanggal_publish);
        return {
          id: o.id_pengumuman,
          title: o.judul,
          dateFormatted: `${od.getDate()} ${monthNames[od.getMonth()]} ${od.getFullYear()}`,
        };
      });
    }
  } catch (error) {
    console.warn('Tidak dapat terhubung ke database di AnnouncementDetailPage:', error);
  }

  if (!item) {
    notFound();
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#F8FAF9] font-sans antialiased text-slate-800">
      <Header />

      <main className="flex-1 w-full py-5 sm:py-10">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 space-y-5">
          
          {/* Top Back Navigation (Single sleek button, no duplication) */}
          <div>
            <Link
              href="/pengumuman"
              className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-[#0E4A3E] hover:text-[#09352c] transition-colors group py-1"
            >
              <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-0.5 text-[#0E4A3E]" />
              <span>Kembali ke Semua Pengumuman</span>
            </Link>
          </div>

          {/* Clean Modern Article Card */}
          <article className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200/80 shadow-xs sm:shadow-sm p-5 sm:p-9 md:p-11 space-y-6">
            
            {/* Header: Badge, Title & Clean Inline Byline (No stacked clutter) */}
            <header className="space-y-3 border-b border-slate-100 pb-5">
              
              {/* Category Pill */}
              <div>
                <span className="inline-block px-2.5 py-0.5 rounded-full bg-emerald-50 text-[#0E4A3E] border border-emerald-200/70 text-[11px] sm:text-xs font-bold tracking-wide">
                  Edaran Resmi LP2M
                </span>
              </div>

              {/* Main Title */}
              <h1 className="text-lg sm:text-2xl md:text-3xl font-archivo font-extrabold text-[#0E4A3E] tracking-tight leading-snug">
                {item.title}
              </h1>

              {/* Clean Inline Byline: Single clean line, no bulky boxes */}
              <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1 text-xs text-slate-500 pt-0.5">
                <span className="font-semibold text-slate-800">{item.authorName}</span>
                <span>•</span>
                <span>{item.dateFormatted}</span>
                <span className="hidden sm:inline">•</span>
                <span className="hidden sm:inline text-slate-400">LP2M UINSSC</span>
              </div>

            </header>

            {/* Article Content */}
            <div className="text-slate-700 text-sm sm:text-base leading-relaxed font-normal whitespace-pre-line space-y-3.5">
              {item.content}
            </div>

            {/* Assistance Note */}
            <div className="bg-[#EAF5F0] border border-[#C0E6D8] rounded-xl p-3.5 sm:p-5 flex items-start gap-3">
              <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5 text-[#0E4A3E] shrink-0 mt-0.5" />
              <div className="space-y-0.5 text-xs sm:text-sm text-slate-700 leading-relaxed">
                <strong className="font-bold text-[#0E4A3E] block">
                  Informasi Tambahan & Bantuan
                </strong>
                <p className="text-xs text-slate-600">
                  Untuk pertanyaan atau kendala seputar pengumuman ini, hubungi Tim LP2M di Gedung Rektorat Lt. 2 atau kanal resmi UINSSC.
                </p>
              </div>
            </div>

          </article>

          {/* Related Announcements Section (Clean & Lightweight) */}
          {relatedItems.length > 0 && (
            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between">
                <h3 className="text-sm sm:text-base font-bold text-slate-900 font-archivo">
                  Pengumuman Lainnya
                </h3>
                <Link
                  href="/pengumuman"
                  className="text-xs font-semibold text-[#0E4A3E] hover:underline flex items-center gap-1"
                >
                  <span>Lihat Semua</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {relatedItems.map((rel) => (
                  <Link
                    key={rel.id}
                    href={`/pengumuman/${rel.id}`}
                    className="block bg-white hover:bg-emerald-50/40 border border-slate-200/80 hover:border-[#568E7D]/50 rounded-xl p-4 transition-all duration-200 shadow-xs hover:shadow-sm group"
                  >
                    <div className="flex items-center gap-1.5 text-[11px] text-slate-400 mb-1.5">
                      <Calendar className="w-3 h-3 text-slate-400" />
                      <span>{rel.dateFormatted}</span>
                    </div>
                    <h4 className="font-bold text-xs sm:text-sm text-slate-800 group-hover:text-[#0E4A3E] transition-colors line-clamp-2 leading-snug">
                      {rel.title}
                    </h4>
                  </Link>
                ))}
              </div>
            </div>
          )}

        </div>
      </main>

      <Footer />
    </div>
  );
}
