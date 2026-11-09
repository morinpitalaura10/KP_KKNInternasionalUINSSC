'use client';

import React, { useEffect, useState, useCallback } from 'react';
import {
  Trophy,
  Search,
  RefreshCw,
  Calendar,
  X,
  FileSpreadsheet,
  Globe2,
  CheckCircle2,
  AlertTriangle,
  Award,
} from 'lucide-react';
import { PageHeader } from '@/components/ui';

interface FakultasStat {
  nama_fakultas: string;
  total: number;
  lolos: number;
  cadangan: number;
}

interface SeleksiItem {
  id_hasil: number;
  id_pendaftaran: number;
  ranking_akhir: number;
  nim: string;
  nama: string;
  nama_fakultas: string;
  nama_prodi: string;
  ipk: number | null;
  nilai_substansi: number;
  nilai_wawancara: number;
  bobot_substansi: number;
  bobot_wawancara: number;
  nilai_akhir: number;
  status: 'Lolos' | 'Cadangan' | 'Tidak_Lolos';
  status_label: 'Lolos' | 'Cadangan' | 'Tidak Lolos';
  catatan: string;
  hasRekomendasiDekan?: boolean;
  nama_negara: string;
  ditetapkan_oleh: string;
  tanggal_penetapan: string | null;
}

interface SummaryStats {
  totalPeserta: number;
  totalLolos: number;
  totalCadangan: number;
  totalTidakLolos: number;
  persenLolos: number;
  persenTidakLolos: number;
  persenCadangan: number;
  targetKuota: number;
  bobotSubstansi?: number;
  bobotWawancara?: number;
  fakultasBreakdown?: FakultasStat[];
}

interface PeriodeItem {
  id_periode: number;
  nama_periode: string;
  tahun: number;
  status: string;
  kuota: number;
}

export default function StaffHasilSeleksiPage() {
  const [items, setItems] = useState<SeleksiItem[]>([]);
  const [periodes, setPeriodes] = useState<PeriodeItem[]>([]);
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

  const fetchSeleksi = useCallback(async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams({ limit: '100', active_only: 'true' });

      const res = await fetch(`/api/hasil_akhir?${params.toString()}`);
      const json = await res.json();
      if (json.success) {
        setItems(json.data || []);
        if (json.summary) setSummary(json.summary);
        if (json.periodes) {
          setPeriodes(json.periodes);
          const currentId =
            selectedPeriodeId || json.activePeriodeId || json.periodes[0]?.id_periode;
          if (currentId && currentId !== selectedPeriodeId) {
            setSelectedPeriodeId(currentId);
          }
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, [selectedPeriodeId]);

  useEffect(() => {
    fetchSeleksi();
  }, [fetchSeleksi]);

  const currentBobotSubstansi = summary.bobotSubstansi ?? items[0]?.bobot_substansi ?? 70;
  const currentBobotWawancara = summary.bobotWawancara ?? items[0]?.bobot_wawancara ?? 30;

  // Tab & search filtering
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

  // Export CSV
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
      item.nilai_akhir,
      `"${item.status_label}"`,
      `"${item.nama_negara || '-'}"`,
      item.hasRekomendasiDekan ? 'Ada' : 'Belum Ada',
      `"${(item.catatan || '').replace(/"/g, '""')}"`,
    ]);

    const csvContent =
      '\uFEFF' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\r\n');
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

  return (
    <div className="w-full max-w-7xl space-y-6 pb-12 font-sans">
      {/* ── Top Header Area ── */}
      <PageHeader
        title="HASIL SELEKSI"
        subtitle="KULIAH KERJA NYATA INTERNASIONAL"
        description="Keputusan kelulusan akhir peserta KKN Internasional, alokasi negara penempatan, serta distribusi keterwakilan fakultas."
        action={
          <div className="flex items-center gap-2.5">
            {periodes.length > 0 && (
              <div className="flex items-center gap-2 bg-[#DDF2E8] px-3.5 py-2 rounded-xl border border-emerald-200 shadow-2xs text-xs sm:text-sm font-extrabold text-[#0E4A3E]">
                <Calendar className="w-4 h-4 text-[#0E4A3E]" />
                <span>
                  Periode Aktif: {periodes[0].nama_periode} ({periodes[0].tahun})
                </span>
              </div>
            )}

            <button
              type="button"
              onClick={handleExportCSV}
              className="inline-flex items-center gap-2 px-4 py-2 bg-[#0E4A3E] hover:bg-[#09352c] text-white rounded-xl text-xs sm:text-sm font-bold shadow-xs transition-all cursor-pointer whitespace-nowrap"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-300" />
              <span>Ekspor CSV</span>
            </button>
          </div>
        }
      />

      {/* ── Top Mint Green Trophy & Circle Percentage Card ── */}
      <div className="bg-gradient-to-b from-[#D4F1E4] to-[#BEE6D7] border border-[#9fd3c3]/90 rounded-2xl p-5 sm:p-6 shadow-2xs">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4 w-full lg:w-auto">
            <div className="w-14 h-14 rounded-2xl bg-[#0E4A3E] text-amber-300 flex items-center justify-center shrink-0 shadow-sm">
              <Trophy className="w-7 h-7 stroke-[2.2]" />
            </div>
            <div>
              <p className="text-xs font-bold text-[#0E4A3E]/80 uppercase tracking-wider">
                Total Peserta Ditetapkan Lolos
              </p>
              <h3 className="text-2xl sm:text-3xl font-black text-[#0E4A3E]">
                {summary.totalLolos}{' '}
                <span className="text-lg font-bold text-[#0E4A3E]/70">
                  dari Kuota {summary.targetKuota || 10}
                </span>
              </h3>
            </div>
          </div>

          {/* Circle Percentage Stats */}
          <div className="flex items-center justify-center sm:justify-end gap-6 sm:gap-10 w-full lg:w-auto">
            <div className="flex items-center gap-2.5">
              <div className="w-12 h-12 rounded-full border-[3px] border-emerald-600 bg-emerald-100/70 flex items-center justify-center text-emerald-900 font-black text-xs sm:text-sm">
                {summary.persenLolos ?? 0}%
              </div>
              <div className="text-left">
                <span className="text-xs font-extrabold text-[#0E4A3E] block">Lolos</span>
                <span className="text-[11px] font-semibold text-slate-600">
                  {summary.totalLolos} Mahasiswa
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2.5">
              <div className="w-12 h-12 rounded-full border-[3px] border-amber-500 bg-amber-100/70 flex items-center justify-center text-amber-900 font-black text-xs sm:text-sm">
                {summary.persenCadangan ?? 0}%
              </div>
              <div className="text-left">
                <span className="text-xs font-extrabold text-amber-900 block">Cadangan</span>
                <span className="text-[11px] font-semibold text-slate-600">
                  {summary.totalCadangan} Mahasiswa
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2.5">
              <div className="w-12 h-12 rounded-full border-[3px] border-rose-500 bg-rose-100/70 flex items-center justify-center text-rose-900 font-black text-xs sm:text-sm">
                {summary.persenTidakLolos ?? 0}%
              </div>
              <div className="text-left">
                <span className="text-xs font-extrabold text-rose-900 block">Tidak Lolos</span>
                <span className="text-[11px] font-semibold text-slate-600">
                  {summary.totalTidakLolos} Mahasiswa
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Distribusi Keterwakilan Fakultas (dari Admin) ── */}
      {summary.fakultasBreakdown && summary.fakultasBreakdown.length > 0 && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs p-4 sm:p-5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-extrabold text-[#0E4A3E] uppercase tracking-wider flex items-center gap-1.5">
              <Award className="w-4 h-4 text-[#0E4A3E]" />
              Distribusi Kelulusan & Keterwakilan per Fakultas
            </span>
            <span className="text-[11px] font-bold text-slate-500">
              Formula Aktif: {currentBobotSubstansi}% Substansi + {currentBobotWawancara}% Wawancara
            </span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
            {summary.fakultasBreakdown.map((f) => (
              <div
                key={f.nama_fakultas}
                className={`p-2.5 rounded-xl border ${
                  f.lolos > 0
                    ? 'bg-emerald-50/60 border-emerald-200'
                    : 'bg-slate-50 border-slate-200'
                }`}
              >
                <span className="text-xs font-extrabold text-slate-800 truncate block">
                  {f.nama_fakultas}
                </span>
                <div className="flex items-center justify-between text-[11px] mt-1">
                  <span className="text-slate-500">{f.total} peserta</span>
                  <span
                    className={`font-black px-1.5 py-0.2 rounded text-[10px] ${
                      f.lolos > 0 ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-600'
                    }`}
                  >
                    {f.lolos} Lolos
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Filter Tabs & Search Bar ── */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        <div className="flex items-center gap-1.5 p-1 bg-white border border-slate-200 rounded-xl shadow-2xs">
          <button
            onClick={() => setActiveTab('all')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'all'
                ? 'bg-[#0E4A3E] text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            Semua ({items.length})
          </button>
          <button
            onClick={() => setActiveTab('Lolos')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'Lolos'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            Lolos ({summary.totalLolos})
          </button>
          <button
            onClick={() => setActiveTab('Cadangan')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'Cadangan'
                ? 'bg-amber-600 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            Cadangan ({summary.totalCadangan})
          </button>
          <button
            onClick={() => setActiveTab('Tidak Lolos')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'Tidak Lolos'
                ? 'bg-red-600 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            Tidak Lolos ({summary.totalTidakLolos})
          </button>
        </div>

        {/* Search */}
        <div className="relative min-w-[260px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Cari nama, NIM, atau negara tujuan..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-white border border-slate-300 rounded-xl text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0E4A3E] shadow-2xs"
          />
        </div>
      </div>

      {/* ── Table Card (Fokus Keputusan Kelulusan, Negara Penempatan & Rekomendasi Dekan) ── */}
      <div className="bg-white rounded-2xl border border-slate-300 shadow-sm overflow-hidden">
        <div className="bg-[#0E4A3E] text-white px-6 py-4">
          <div className="grid grid-cols-12 text-xs font-extrabold tracking-wider uppercase items-center">
            <span className="col-span-1 text-center">No</span>
            <span className="col-span-3">NIM / Nama Mahasiswa</span>
            <span className="col-span-2">Fakultas / Prodi</span>
            <span className="col-span-2 text-center">Negara Penempatan</span>
            <span className="col-span-1 text-center">Rekom Dekan</span>
            <span className="col-span-1 text-center">Skor (#Rank)</span>
            <span className="col-span-1 text-center">Keputusan</span>
            <span className="col-span-1 text-center">Aksi</span>
          </div>
        </div>

        {/* Content */}
        {isLoading ? (
          <div className="py-16 flex flex-col items-center justify-center text-slate-400 gap-2">
            <RefreshCw className="w-6 h-6 animate-spin text-[#0E4A3E]" />
            <span className="text-xs font-semibold">Memuat keputusan hasil akhir seleksi...</span>
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-16 text-center text-slate-500 text-sm">
            Tidak ada peserta seleksi pada filter ini.
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {filtered.map((item, idx) => (
              <div
                key={item.id_hasil}
                className="grid grid-cols-12 items-center px-6 py-4 hover:bg-slate-50 transition-colors text-xs sm:text-sm"
              >
                <span className="col-span-1 text-center font-bold text-slate-500">{idx + 1}</span>

                <div className="col-span-3 pr-3">
                  <p className="font-bold text-slate-800 leading-snug">{item.nama}</p>
                  <p className="text-[11px] text-slate-500 font-mono mt-0.5">NIM: {item.nim}</p>
                </div>

                <div className="col-span-2 pr-2">
                  <p className="font-semibold text-slate-800 text-xs truncate">{item.nama_prodi}</p>
                  <span className="inline-block text-[10px] font-bold text-[#0E4A3E] bg-[#0E4A3E]/10 px-2 py-0.5 rounded-md mt-0.5">
                    {item.nama_fakultas}
                  </span>
                </div>

                {/* Negara Penempatan */}
                <div className="col-span-2 flex justify-center">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 font-bold text-xs">
                    <Globe2 className="w-3.5 h-3.5 text-[#0E4A3E]" />
                    {item.nama_negara || '-'}
                  </span>
                </div>

                {/* Rekomendasi Dekan */}
                <div className="col-span-1 flex justify-center">
                  {item.hasRekomendasiDekan ? (
                    <span className="inline-flex items-center gap-1 text-emerald-700 font-bold text-[11px]">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Ada
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-amber-600 font-bold text-[11px]">
                      <AlertTriangle className="w-3.5 h-3.5" />
                      Belum
                    </span>
                  )}
                </div>

                {/* Skor & Ranking */}
                <div className="col-span-1 text-center">
                  <span className="font-extrabold text-[#0E4A3E] block">
                    {item.nilai_akhir.toFixed(2)}
                  </span>
                  <span className="text-[10px] font-bold text-slate-400">
                    Rank #{item.ranking_akhir}
                  </span>
                </div>

                {/* Keputusan Status Badges */}
                <div className="col-span-1 flex justify-center">
                  {item.status === 'Lolos' ? (
                    <span className="inline-block bg-[#C0E6D8] text-[#0E4A3E] border border-emerald-300 font-bold text-[11px] px-3 py-1 rounded-full shadow-2xs whitespace-nowrap">
                      Lolos
                    </span>
                  ) : item.status === 'Cadangan' ? (
                    <span className="inline-block bg-amber-100 text-amber-800 border border-amber-300 font-bold text-[11px] px-3 py-1 rounded-full shadow-2xs whitespace-nowrap">
                      Cadangan
                    </span>
                  ) : (
                    <span className="inline-block bg-red-100 text-red-700 border border-red-300 font-bold text-[11px] px-3 py-1 rounded-full whitespace-nowrap">
                      Tidak Lolos
                    </span>
                  )}
                </div>

                {/* Aksi: Detail */}
                <div className="col-span-1 flex justify-center">
                  <button
                    onClick={() => setSelectedDetail(item)}
                    className="px-3 py-1.5 bg-[#0E4A3E] hover:bg-[#09352c] text-white rounded-lg text-xs font-bold transition-all shadow-xs cursor-pointer"
                  >
                    Detail
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Footer */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs text-slate-600">
          <div>
            Menampilkan 1–{filtered.length} dari {items.length} data keputusan seleksi
          </div>
          <div className="text-[11px] font-semibold text-slate-500">
            Ditetapkan oleh Admin LP2M
          </div>
        </div>
      </div>

      {/* ── Detail Modal Keputusan Seleksi ── */}
      {selectedDetail && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="font-extrabold text-base text-[#0E4A3E] uppercase">
                Keputusan Hasil Seleksi Mahasiswa
              </h3>
              <button
                onClick={() => setSelectedDetail(null)}
                className="text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 bg-slate-50 rounded-xl space-y-0.5">
                <p className="font-bold text-sm text-slate-800">{selectedDetail.nama}</p>
                <p className="text-slate-500">
                  NIM: {selectedDetail.nim} • {selectedDetail.nama_prodi} ({selectedDetail.nama_fakultas})
                </p>
                <p className="text-slate-600 font-semibold pt-1">
                  Negara Tujuan/Penempatan: {selectedDetail.nama_negara || '-'}
                </p>
              </div>

              <div className="p-3 bg-[#C0E6D8] border border-[#99d1c1] rounded-xl text-center">
                <span className="text-[11px] font-bold text-[#0E4A3E] uppercase block">
                  Keputusan Akhir LP2M
                </span>
                <span className="text-xl font-black text-[#0E4A3E] block mt-0.5">
                  {selectedDetail.status_label} (Peringkat #{selectedDetail.ranking_akhir})
                </span>
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-500">
                    Nilai Substansi ({selectedDetail.bobot_substansi || currentBobotSubstansi}%)
                  </span>
                  <span className="font-bold text-slate-800">{selectedDetail.nilai_substansi}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-500">
                    Nilai Wawancara ({selectedDetail.bobot_wawancara || currentBobotWawancara}%)
                  </span>
                  <span className="font-bold text-slate-800">{selectedDetail.nilai_wawancara}</span>
                </div>
                <div className="flex justify-between py-1 font-bold text-sm text-[#0E4A3E]">
                  <span>Total Nilai Akhir</span>
                  <span>{selectedDetail.nilai_akhir.toFixed(2)}</span>
                </div>
              </div>

              {selectedDetail.catatan && (
                <div className="p-3 bg-slate-50 rounded-lg text-slate-600 italic border border-slate-200">
                  Catatan Panitia: &ldquo;{selectedDetail.catatan}&rdquo;
                </div>
              )}
            </div>

            <div className="flex justify-end pt-3">
              <button
                onClick={() => setSelectedDetail(null)}
                className="px-5 py-2 rounded-xl bg-slate-200 text-slate-700 font-bold text-xs hover:bg-slate-300 cursor-pointer"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
