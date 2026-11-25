import React from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import PersyaratanClient, { PersyaratanItem } from '@/components/PersyaratanClient';
import { prisma } from '@/lib/prisma';
import { getPersyaratanAkademik } from '@/lib/persyaratanAkademik';

export const dynamic = 'force-dynamic';

export default async function PersyaratanPage() {
  let persyaratanItems: PersyaratanItem[] = [];
  let activePeriode: { nama_periode: string; tahun: number } | null = null;
  const akademikConfig = await getPersyaratanAkademik();

  try {
    // Get active period
    let periode = await prisma.periode.findFirst({ where: { status: 'Aktif' } });
    if (!periode) {
      periode = await prisma.periode.findFirst({ orderBy: { id_periode: 'desc' } });
    }

    if (periode) {
      activePeriode = { nama_periode: periode.nama_periode, tahun: periode.tahun };
      persyaratanItems = await prisma.persyaratan.findMany({
        where: { id_periode: periode.id_periode, status: true },
        orderBy: { id_persyaratan: 'asc' },
      });
      if (persyaratanItems.length === 0) {
        persyaratanItems = await prisma.persyaratan.findMany({
          where: { status: true },
          orderBy: { id_persyaratan: 'asc' },
          take: 6,
        });
      }
    } else {
      persyaratanItems = await prisma.persyaratan.findMany({
        where: { status: true },
        orderBy: { id_persyaratan: 'asc' },
      });
    }
  } catch (error) {
    console.warn('Tidak dapat terhubung ke database di PersyaratanPage:', error);
  }

  return (
    <div className="min-h-screen flex flex-col bg-white font-sans scroll-smooth">
      {/* Top Header Bar */}
      <Header />

      {/* Main Interactive Persyaratan Client Component */}
      <PersyaratanClient
        persyaratanItems={persyaratanItems}
        activePeriode={activePeriode}
        akademikConfig={akademikConfig}
      />

      {/* Footer */}
      <Footer />
    </div>
  );
}
