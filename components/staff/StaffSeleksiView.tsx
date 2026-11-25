'use client';

import React from 'react';
import {
  Trophy,
  Search,
  X,
  FileSpreadsheet,
  Globe2,
  CheckCircle2,
  AlertTriangle,
  Award,
} from 'lucide-react';
import {
  HeroBanner,
  HeroAsideCard,
  ResponsiveTableCard,
} from '@/components/ui';

export interface FakultasStat {
  nama_fakultas: string;
  total: number;
  lolos: number;
  cadangan: number;
}

export interface SeleksiItem {
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

export interface SummaryStats {
  totalPeserta: number;
  totalLolos: number;
  totalCadangan: number;
  totalTidakLolos: number;
  persenLolos?: number;
  persenTidakLolos?: number;
  persenCadangan?: number;
  targetKuota?: number;
  bobotSubstansi?: number;
  bobotWawancara?: number;
  fakultasBreakdown?: FakultasStat[];
}

export interface PeriodeOption {
  id_periode: number;
  nama_periode: string;
  tahun: number;
  status: string;
  kuota: number;
}

export interface StaffSeleksiViewProps {
  items: SeleksiItem[];
  filtered: SeleksiItem[];
  periodes: PeriodeOption[];
  summary: SummaryStats;
  currentBobotSubstansi: number;
  currentBobotWawancara: number;
  activeTab: 'all' | 'Lolos' | 'Cadangan' | 'Tidak Lolos';
  onSetActiveTab: (tab: 'all' | 'Lolos' | 'Cadangan' | 'Tidak Lolos') => void;
  search: string;
  onSearchChange: (val: string) => void;
  isLoading: boolean;
  selectedDetail: SeleksiItem | null;
  onSelectDetail: (item: SeleksiItem | null) => void;
  onExportCSV: () => void;
}

export default function StaffSeleksiView({
  items,
  filtered,
  periodes,
  summary,
  currentBobotSubstansi,
  currentBobotWawancara,
  activeTab,
  onSetActiveTab,
  search,
  onSearchChange,
  isLoading,
  selectedDetail,
  onSelectDetail,
  onExportCSV,
}: StaffSeleksiViewProps) {
  return (
    <div className="kkn-page-container font-sans">
      <HeroBanner
        badgeIcon={<Trophy className="w-3.5 h-3.5 text-[#C0E6D8]" />}
        badgeText="Ketetapan Hasil Akhir Seleksi"
        title="HASIL SELEKSI"
        description="Keputusan kelulusan akhir peserta KKN Internasional, alokasi negara penempatan, serta distribusi keterwakilan fakultas."
        aside={
          periodes.length > 0 ? (
            <HeroAsideCard
              label="Periode Seleksi Aktif"
              title={`${periodes[0].nama_periode} (${periodes[0].tahun})`}
              showPulse={false}
            />
          ) : undefined
        }
        action={
          <button
            type="button"
            onClick={onExportCSV}
            className="kkn-hero-action-btn shadow-xs self-start sm:self-auto"
          >
            <FileSpreadsheet className="w-4 h-4 text-[#C0E6D8]" />
            <span>Ekspor CSV</span>
          </button>
        }
      />

      <div className="kkn-trophy-mint-card space-y-4 lg:space-y-0">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 sm:gap-6">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-[#0E4A3E] text-amber-300 flex items-center justify-center shrink-0 shadow-sm">
              <Trophy className="w-6 h-6 sm:w-7 sm:h-7 stroke-[2.2]" />
            </div>
            <div>
              <p className="text-[11px] sm:text-xs font-bold text-[#0E4A3E]/80 uppercase tracking-wider">
                Total Peserta Ditetapkan Lolos
              </p>
              <h3 className="text-xl sm:text-3xl font-black text-[#0E4A3E]">
                {summary.totalLolos}{' '}
                <span className="text-sm sm:text-lg font-bold text-[#0E4A3E]/70">
                  dari Kuota {summary.targetKuota || 10}
                </span>
              </h3>
            </div>
          </div>

          <div className="kkn-circle-stat-grid">
            <div className="kkn-circle-stat-item">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full border-[3px] border-emerald-600 bg-emerald-100 flex items-center justify-center text-emerald-950 font-black text-xs sm:text-sm shrink-0">
                {summary.persenLolos ?? 0}%
              </div>
              <div className="min-w-0">
                <span className="text-[11px] sm:text-xs font-black text-[#0E4A3E] block leading-tight">Lolos</span>
                <span className="text-[10px] sm:text-[11px] font-semibold text-slate-700 whitespace-nowrap block">
                  {summary.totalLolos} Mhs
                </span>
              </div>
            </div>

            <div className="kkn-circle-stat-item">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full border-[3px] border-amber-500 bg-amber-100 flex items-center justify-center text-amber-950 font-black text-xs sm:text-sm shrink-0">
                {summary.persenCadangan ?? 0}%
              </div>
              <div className="min-w-0">
                <span className="text-[11px] sm:text-xs font-black text-amber-950 block leading-tight">Cadangan</span>
                <span className="text-[10px] sm:text-[11px] font-semibold text-slate-700 whitespace-nowrap block">
                  {summary.totalCadangan} Mhs
                </span>
              </div>
            </div>

            <div className="kkn-circle-stat-item">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full border-[3px] border-rose-500 bg-rose-100 flex items-center justify-center text-rose-950 font-black text-xs sm:text-sm shrink-0">
                {summary.persenTidakLolos ?? 0}%
              </div>
              <div className="min-w-0">
                <span className="text-[11px] sm:text-xs font-black text-rose-950 block leading-tight whitespace-nowrap">
                  Tidak Lolos
                </span>
                <span className="text-[10px] sm:text-[11px] font-semibold text-slate-700 whitespace-nowrap block">
                  {summary.totalTidakLolos} Mhs
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {summary.fakultasBreakdown && summary.fakultasBreakdown.length > 0 && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs p-4 sm:p-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 mb-3">
            <span className="text-xs font-extrabold text-[#0E4A3E] uppercase tracking-wider flex items-center gap-1.5">
              <Award className="w-4 h-4 text-[#0E4A3E] shrink-0" />
              <span>Distribusi Kelulusan per Fakultas</span>
            </span>
            <span className="text-[10px] sm:text-[11px] font-bold text-slate-600">
              Formula: {currentBobotSubstansi}% Substansi + {currentBobotWawancara}% Wawancara
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

      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="w-full sm:w-auto overflow-x-auto scrollbar-none">
          <div className="inline-flex items-center gap-1.5 p-1 bg-white border border-[#C0E6D8] rounded-xl shadow-2xs min-w-max">
            <button
              onClick={() => onSetActiveTab('all')}
              className={`px-3.5 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                activeTab === 'all'
                  ? 'bg-[#0E4A3E] text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              Semua ({items.length})
            </button>
            <button
              onClick={() => onSetActiveTab('Lolos')}
              className={`px-3.5 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                activeTab === 'Lolos'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              Lolos ({summary.totalLolos})
            </button>
            <button
              onClick={() => onSetActiveTab('Cadangan')}
              className={`px-3.5 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                activeTab === 'Cadangan'
                  ? 'bg-amber-600 text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              Cadangan ({summary.totalCadangan})
            </button>
            <button
              onClick={() => onSetActiveTab('Tidak Lolos')}
              className={`px-3.5 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                activeTab === 'Tidak Lolos'
                  ? 'bg-red-600 text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              Tidak Lolos ({summary.totalTidakLolos})
            </button>
          </div>
        </div>

        <div className="relative w-full sm:min-w-[260px] sm:w-auto">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Cari nama, NIM, atau negara tujuan..."
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            className="kkn-input-search shadow-2xs"
          />
        </div>
      </div>

      <ResponsiveTableCard
        isLoading={isLoading}
        loadingText="Memuat keputusan hasil akhir seleksi..."
        isEmpty={filtered.length === 0}
        emptyContent="Tidak ada peserta seleksi pada filter ini."
        minWidthClass="min-w-[780px]"
        thead={
          <tr>
            <th className="kkn-table-th px-3 text-center w-12">No</th>
            <th className="kkn-table-th min-w-[190px]">NIM / Nama Mahasiswa</th>
            <th className="kkn-table-th min-w-[170px]">Fakultas / Prodi</th>
            <th className="kkn-table-th text-center min-w-[140px]">Negara Penempatan</th>
            <th className="kkn-table-th px-3 text-center w-24">Rekom Dekan</th>
            <th className="kkn-table-th px-3 text-center min-w-[100px]">Skor (#Rank)</th>
            <th className="kkn-table-th text-center min-w-[120px]">Keputusan</th>
            <th className="kkn-table-th px-3 text-center w-20">Aksi</th>
          </tr>
        }
        tbody={filtered.map((item, idx) => (
          <tr key={item.id_hasil} className="hover:bg-slate-50 transition-colors">
            <td className="kkn-table-td px-3 text-center font-bold text-slate-500 whitespace-nowrap">
              {idx + 1}
            </td>
            <td className="kkn-table-td">
              <p className="font-bold text-slate-800 leading-snug">{item.nama}</p>
              <p className="text-[11px] text-slate-500 font-mono mt-0.5">NIM: {item.nim}</p>
            </td>
            <td className="kkn-table-td">
              <p className="font-semibold text-slate-800 text-xs">{item.nama_prodi}</p>
              <span className="kkn-badge-fakultas">{item.nama_fakultas}</span>
            </td>
            <td className="kkn-table-td text-center whitespace-nowrap">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 font-bold text-xs">
                <Globe2 className="w-3.5 h-3.5 text-[#0E4A3E]" />
                {item.nama_negara || '-'}
              </span>
            </td>
            <td className="kkn-table-td px-3 text-center whitespace-nowrap">
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
            </td>
            <td className="kkn-table-td px-3 text-center whitespace-nowrap">
              <span className="font-extrabold text-[#0E4A3E] block">
                {item.nilai_akhir.toFixed(2)}
              </span>
              <span className="text-[10px] font-bold text-slate-400">
                Rank #{item.ranking_akhir}
              </span>
            </td>
            <td className="kkn-table-td text-center whitespace-nowrap">
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
            </td>
            <td className="kkn-table-td px-3 text-center whitespace-nowrap">
              <button
                onClick={() => onSelectDetail(item)}
                className="kkn-btn-table-action shadow-xs"
              >
                Detail
              </button>
            </td>
          </tr>
        ))}
        footer={
          <>
            <div>
              Menampilkan 1–{filtered.length} dari {items.length} data keputusan seleksi
            </div>
            <div className="text-[11px] font-semibold text-slate-500">
              Ditetapkan oleh Admin LP2M
            </div>
          </>
        }
      />

      {selectedDetail && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="font-extrabold text-base text-[#0E4A3E] uppercase">
                Keputusan Hasil Seleksi Mahasiswa
              </h3>
              <button
                onClick={() => onSelectDetail(null)}
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
                onClick={() => onSelectDetail(null)}
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
