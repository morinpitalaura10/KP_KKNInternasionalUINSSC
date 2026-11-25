'use client';

import React, { useEffect, useState, useCallback } from 'react';
import {
  StaffSeleksiView,
  SeleksiItem,
  SummaryStats,
  PeriodeOption,
} from '@/components/staff';

export default function StaffSeleksiPage() {
  const [items, setItems] = useState<SeleksiItem[]>([]);
  const [periodes, setPeriodes] = useState<PeriodeOption[]>([]);
  const [selectedPeriodeId, setSelectedPeriodeId] = useState<number | null>(null);
  const [summary, setSummary] = useState<SummaryStats>({
    totalPeserta: 0,
    totalLolos: 0,
    totalCadangan: 0,
    totalTidakLolos: 0,
    persenLolos: 0,
    persenTidakLolos: 0,
    persenCadangan: 0,
    targetKuota: 10,
  });
  const [activeTab, setActiveTab] = useState<'all' | 'Lolos' | 'Cadangan' | 'Tidak Lolos'>('all');
  const [search, setSearch] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [selectedDetail, setSelectedDetail] = useState<SeleksiItem | null>(null);

  const fetchSeleksi = useCallback(async (signal?: AbortSignal) => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams({ limit: '100', active_only: 'true' });

      const res = await fetch(`/api/hasil_akhir?${params.toString()}`, { signal });
      if (!res.ok || signal?.aborted) return;
      const json = await res.json();
      if (signal?.aborted) return;

      if (json.success) {
        setItems(json.data || []);
        if (json.summary) setSummary(json.summary);
        if (json.periodes) {
          setPeriodes(json.periodes);
          const currentId = json.activePeriodeId || json.periodes[0]?.id_periode;
          if (currentId) {
            setSelectedPeriodeId(currentId);
          }
        }
      }
    } catch (err: any) {
      if (err?.name === 'AbortError') return;
      console.error(err);
    } finally {
      if (!signal?.aborted) {
        setIsLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    fetchSeleksi(controller.signal);
    return () => {
      controller.abort();
    };
  }, [fetchSeleksi]);

  const currentBobotSubstansi = summary.bobotSubstansi ?? items[0]?.bobot_substansi ?? 70;
  const currentBobotWawancara = summary.bobotWawancara ?? items[0]?.bobot_wawancara ?? 30;

  const filtered = items.filter((item) => {
    const matchesSearch =
      item.nama.toLowerCase().includes(search.toLowerCase()) ||
      item.nim.toLowerCase().includes(search.toLowerCase()) ||
      (item.nama_negara || '').toLowerCase().includes(search.toLowerCase());
    let matchesTab = true;
    if (activeTab === 'Lolos') matchesTab = item.status === 'Lolos';
    else if (activeTab === 'Cadangan') matchesTab = item.status === 'Cadangan';
    else if (activeTab === 'Tidak Lolos') matchesTab = item.status === 'Tidak_Lolos';
    return matchesSearch && matchesTab;
  });

  const handleExportCSV = () => {
    if (filtered.length === 0) return;

    const headers = [
      'Ranking Akhir',
      'NIM',
      'Nama Mahasiswa',
      'Fakultas',
      'Program Studi',
      `Nilai Substansi (${currentBobotSubstansi}%)`,
      `Nilai Wawancara (${currentBobotWawancara}%)`,
      'Nilai Akhir',
      'Status Kelulusan',
      'Negara Penempatan',
      'Rekomendasi Dekan',
      'Catatan',
    ];

    const rows = filtered.map((item) => [
      item.ranking_akhir,
      `"${item.nim}"`,
      `"${item.nama.replace(/"/g, '""')}"`,
      `"${item.nama_fakultas}"`,
      `"${item.nama_prodi}"`,
      item.nilai_substansi,
      item.nilai_wawancara,
      item.nilai_akhir.toFixed(2),
      item.status_label,
      `"${item.nama_negara || '-'}"`,
      item.hasRekomendasiDekan ? 'Ada' : 'Belum',
      `"${(item.catatan || '').replace(/"/g, '""')}"`,
    ]);

    const csvContent =
      '\uFEFF' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    const dateStr = new Date().toISOString().slice(0, 10);
    link.setAttribute('download', `Hasil_Seleksi_KKN_Internasional_${dateStr}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Void reference to prevent unused warning
  void selectedPeriodeId;

  return (
    <StaffSeleksiView
      items={items}
      filtered={filtered}
      periodes={periodes}
      summary={summary}
      currentBobotSubstansi={currentBobotSubstansi}
      currentBobotWawancara={currentBobotWawancara}
      activeTab={activeTab}
      onSetActiveTab={setActiveTab}
      search={search}
      onSearchChange={setSearch}
      isLoading={isLoading}
      selectedDetail={selectedDetail}
      onSelectDetail={setSelectedDetail}
      onExportCSV={handleExportCSV}
    />
  );
}
