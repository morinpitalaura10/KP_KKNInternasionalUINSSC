'use client';

import React, { useEffect, useState } from 'react';
import {
  MahasiswaPengumumanView,
  PengumumanItem,
} from '@/components/mahasiswa';

export default function PengumumanMahasiswaPage() {
  const [items, setItems] = useState<PengumumanItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadPengumuman() {
      try {
        const res = await fetch('/api/pengumuman');
        const json = await res.json();
        if (json.success && Array.isArray(json.data)) {
          setItems(json.data);
        }
      } catch (err) {
        console.error('Failed to load pengumuman:', err);
      } finally {
        setIsLoading(false);
      }
    }
    loadPengumuman();
  }, []);

  const formatDate = (dateStr: string) => {
    try {
      return new Date(dateStr).toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      });
    } catch {
      return dateStr;
    }
  };

  const getTag = (judul: string) => {
    const lower = judul.toLowerCase();
    if (lower.includes('verifikasi')) return 'Verifikasi';
    if (lower.includes('wawancara')) return 'Wawancara';
    if (lower.includes('seleksi') || lower.includes('hasil')) return 'Seleksi';
    if (lower.includes('pembekalan')) return 'Pembekalan';
    if (lower.includes('pelaksanaan')) return 'Pelaksanaan';
    return 'Pendaftaran';
  };

  return (
    <MahasiswaPengumumanView
      items={items}
      isLoading={isLoading}
      formatDate={formatDate}
      getTag={getTag}
    />
  );
}
