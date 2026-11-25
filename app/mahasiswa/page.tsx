'use client';

import React, { useEffect, useState } from 'react';
import {
  MahasiswaDashboardView,
  MahasiswaDashboardData,
} from '@/components/mahasiswa';

const STAGES = [
  { label: 'Draft' },
  { label: 'Menunggu Verifikasi' },
  { label: 'Perbaikan Dokumen' },
  { label: 'Verifikasi Dokumen' },
  { label: 'Wawancara' },
  { label: 'Lolos/Tidak Lolos' },
];

const TEMPLATE_CARDS_FALLBACK = [
  { label: 'Template Surat Rekomendasi Dekan', desc: 'Surat dari Rektor / Dekan untuk mengikuti KKN Internasional' },
  { label: 'Template Surat Izin Orang Tua', desc: 'Surat Izin Orang Tua / Wali Mahasiswa Peserta KKN Internasional' },
  { label: 'Template Surat Pernyataan', desc: 'Surat Pernyataan Kesanggupan dan Tanggung Jawab Peserta' },
  { label: 'Template Rekomendasi DPA', desc: 'Surat Rekomendasi dari Dosen Pembimbing Akademik' },
];

export default function MahasiswaDashboardPage() {
  const [displayName, setDisplayName] = useState('MAHASISWA');
  const [isLoading, setIsLoading] = useState(true);
  const [dashData, setDashData] = useState<MahasiswaDashboardData>({
    hasPendaftaran: false,
    statusPendaftaran: 'Belum Mendaftar',
    statusDokumen: '-',
    statusSeleksi: '-',
    catatanRevisi: null,
    currentStage: 0,
  });

  useEffect(() => {
    let userId: string | null = null;

    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('currentUser');
      if (stored) {
        try {
          const user = JSON.parse(stored);
          setDisplayName(user.name ?? 'MAHASISWA');
          userId = user.id;
        } catch {
          // ignore
        }
      }
    }

    async function loadDashboard() {
      if (!userId) {
        setIsLoading(false);
        return;
      }
      try {
        const res = await fetch(`/api/mahasiswa/dashboard?userId=${userId}`);
        const json = await res.json();
        if (json.success && json.data) {
          setDashData(json.data);
        }
      } catch (err) {
        console.error('Failed to load mahasiswa dashboard:', err);
      } finally {
        setIsLoading(false);
      }
    }

    loadDashboard();
  }, []);

  const templateCards =
    dashData.suratTemplates && dashData.suratTemplates.length > 0
      ? dashData.suratTemplates.map((s) => ({
          label: s.nama,
          desc: s.file_path
            ? s.file_path.split('/').pop() || 'Template Dokumen Resmi'
            : 'Format Dokumen Resmi',
          file_path: s.file_path,
          id: s.id,
        }))
      : TEMPLATE_CARDS_FALLBACK.map((c, i) => ({ ...c, id: i, file_path: '' }));

  return (
    <MahasiswaDashboardView
      displayName={displayName}
      isLoading={isLoading}
      dashData={dashData}
      stages={STAGES}
      templateCards={templateCards}
    />
  );
}
