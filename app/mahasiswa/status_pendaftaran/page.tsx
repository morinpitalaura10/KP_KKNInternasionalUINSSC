'use client';

import React, { useEffect, useState } from 'react';
import {
  MahasiswaStatusView,
  StatusData,
} from '@/components/mahasiswa';

const STAGES = [
  { label: 'Draft' },
  { label: 'Menunggu Verifikasi' },
  { label: 'Perbaikan Dokumen' },
  { label: 'Verifikasi Dokumen' },
  { label: 'Wawancara' },
  { label: 'Lolos/Tidak Lolos' },
];

export default function StatusPendaftaranPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [data, setData] = useState<StatusData>({
    currentStage: 0,
    statusPendaftaran: 'Belum Mendaftar',
    statusDokumen: '-',
    catatanRevisi: null,
    hasPendaftaran: false,
    negaraTujuan: null,
    dokumen: [],
  });

  useEffect(() => {
    let userId: string | null = null;
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('currentUser');
      if (stored) {
        try {
          const user = JSON.parse(stored);
          userId = user.id;
        } catch {
          // ignore
        }
      }
    }

    async function loadStatus() {
      if (!userId) {
        setIsLoading(false);
        return;
      }
      try {
        const res = await fetch(`/api/mahasiswa/dashboard?userId=${userId}`);
        const json = await res.json();
        if (json.success && json.data) {
          setData({
            currentStage:
              typeof json.data.currentStage === 'number' ? json.data.currentStage : 0,
            statusPendaftaran: json.data.statusPendaftaran || 'Belum Mendaftar',
            statusDokumen: json.data.statusDokumen || '-',
            catatanRevisi: json.data.catatanRevisi,
            hasPendaftaran: Boolean(json.data.hasPendaftaran),
            negaraTujuan: json.data.negaraTujuan,
            dokumen: json.data.dokumen || [],
          });
        }
      } catch (err) {
        console.error('Failed to load status:', err);
      } finally {
        setIsLoading(false);
      }
    }
    loadStatus();
  }, []);

  const hasRevisiDocs = data.dokumen.some((d) => d.status === 'Revisi');

  return (
    <MahasiswaStatusView
      isLoading={isLoading}
      data={data}
      stages={STAGES}
      hasRevisiDocs={hasRevisiDocs}
    />
  );
}
