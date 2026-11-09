import React from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import SectionTitle from '@/components/SectionTitle';
import { AnnouncementDetailCard } from '@/components/AnnouncementCard';
import { prisma } from '@/lib/prisma';
import { notFound } from 'next/navigation';

export const dynamic = 'force-dynamic';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function AnnouncementDetailPage({ params }: PageProps) {
  const { id } = await params;

  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agt', 'Sep', 'Okt', 'Nov', 'Des'];

  let item: {
    day: string;
    month: string;
    year: string;
    title: string;
    dateStr: string;
    authorStr: string;
    fullContent: string;
  } | null = null;

  try {
    const pengumuman = await prisma.pengumuman.findUnique({
      where: { id_pengumuman: parseInt(id, 10) },
      include: {
        users: { select: { nama: true } },
      },
    });

    if (pengumuman) {
      const d = new Date(pengumuman.tanggal_publish);
      item = {
        day: String(d.getDate()),
        month: monthNames[d.getMonth()] || 'Jan',
        year: String(d.getFullYear()),
        title: pengumuman.judul,
        dateStr: d.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }),
        authorStr: pengumuman.users?.nama || 'LP2M',
        fullContent: pengumuman.isi,
      };
    }
  } catch (error) {
    console.warn('Tidak dapat terhubung ke database di AnnouncementDetailPage:', error);
  }

  if (!item) {
    notFound();
  }

  return (
    <div className="min-h-screen flex flex-col bg-white font-sans">
      <Header />

      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <SectionTitle
          prefixTitle="PENGUMUMAN HASIL SELEKSI PESERTA"
          metaInfo={`${item.dateStr} || ${item.authorStr}`}
        />

        <div className="my-8">
          <AnnouncementDetailCard
            day={item.day}
            month={item.month}
            year={item.year}
            title={item.title}
            content={item.fullContent}
          />
        </div>
      </main>

      <Footer />
    </div>
  );
}
