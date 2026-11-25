'use client';

import React from 'react';
import {
  Calendar,
  Search,
  Filter,
  FileSpreadsheet,
  Trophy,
  RefreshCw,
  Award,
  Settings2,
  Users,
  Globe2,
  CheckCircle2,
  AlertTriangle,
  Edit3,
  X,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Calculator,
  Loader2,
  Sparkles,
  Eye,
  EyeOff,
  Clock,
  Send,
  History,
} from 'lucide-react';
import PageHeader from '@/components/ui/PageHeader';
import AlertBanner from '@/components/ui/AlertBanner';
import ConfirmModal from '@/components/ui/ConfirmModal';
import { LogPublikasiModal } from '@/components/ui';

export interface AdminHasilAkhirViewProps {
  periodes: Array<{
    id_periode: number;
    nama_periode: string;
    tahun: string | number;
    kuota: number;
  }>;
  selectedPeriodeId: number | null;
  setSelectedPeriodeId: (id: number | null) => void;
  setSummary: React.Dispatch<React.SetStateAction<any>>;
  summary: {
    totalPeserta: number;
    totalLolos: number;
    totalCadangan: number;
    totalTidakLolos: number;
    targetKuota: number;
    persenLolos: number;
    persenCadangan: number;
    persenTidakLolos: number;
    fakultasBreakdown?: Array<{
      nama_fakultas: string;
      total: number;
      lolos: number;
    }>;
  };
  publikasiInfo: {
    dipublikasi: boolean;
    tanggal_publikasi?: string | null;
    dipublikasi_oleh?: number | null;
    nama_user_publikasi?: string | null;
    batas_penetapan?: string | null;
    lewat_batas_waktu?: boolean;
  } | null;
  isPublishing: boolean;
  handleTogglePublish: () => void;
  currentBobotSubstansi: number;
  currentBobotWawancara: number;
  setInputBobotSubstansi: (b: number) => void;
  setInputBobotWawancara: (b: number) => void;
  setIsBobotModalOpen: (open: boolean) => void;
  handleOpenKuotaModal: () => void;
  search: string;
  setSearch: (s: string) => void;
  setCurrentPage: React.Dispatch<React.SetStateAction<number>>;
  selectedStatus: string;
  setSelectedStatus: (s: string) => void;
  selectedFakultas: string;
  setSelectedFakultas: (f: string) => void;
  FAKULTAS_LIST: string[];
  handleExportCSV: () => void;
  statusMessage: { type: 'success' | 'error'; text: string } | null;
  setStatusMessage: (m: { type: 'success' | 'error'; text: string } | null) => void;
  isLoading: boolean;
  items: Array<{
    id_hasil: number;
    id_pendaftaran: number;
    nim: string;
    nama: string;
    nama_prodi: string;
    nama_fakultas: string;
    nama_negara: string;
    nilai_substansi: number;
    nilai_wawancara: number;
    nilai_akhir: number;
    ranking_akhir: number;
    status: 'Lolos' | 'Cadangan' | 'Tidak_Lolos' | 'Tidak Lolos';
    status_label?: string;
    catatan?: string;
    ipk?: number | null;
    hasRekomendasiDekan?: boolean;
  }>;
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
  currentPage: number;
  handleOpenDetailModal: (item: any) => void;
  selectedDetail: any;
  setSelectedDetail: (d: any) => void;
  handleSaveStatus: (e: React.FormEvent) => void;
  modalNewStatus: 'Lolos' | 'Cadangan' | 'Tidak Lolos';
  setModalNewStatus: (s: 'Lolos' | 'Cadangan' | 'Tidak Lolos') => void;
  modalCatatan: string;
  setModalCatatan: (c: string) => void;
  isUpdating: boolean;
  isSawModalOpen: boolean;
  setIsSawModalOpen: (open: boolean) => void;
  sawTab: 'preferensi' | 'normalisasi' | 'keputusan';
  setSawTab: (tab: 'preferensi' | 'normalisasi' | 'keputusan') => void;
  sawCalculation: any;
  isKuotaModalOpen: boolean;
  setIsKuotaModalOpen: (open: boolean) => void;
  handleSaveKuota: (e: React.FormEvent) => void;
  inputKuota: number;
  setInputKuota: (k: number) => void;
  inputCadangan: number;
  setInputCadangan: (c: number) => void;
  applyRankingStatus: boolean;
  setApplyRankingStatus: (a: boolean) => void;
  isSavingKuota: boolean;
  isBobotModalOpen: boolean;
  handleSaveBobot: (e: React.FormEvent) => void;
  inputBobotSubstansi: number;
  inputBobotWawancara: number;
  recalculateWeights: boolean;
  setRecalculateWeights: (r: boolean) => void;
  isSavingBobot: boolean;
  confirmPublishModal: any;
  setConfirmPublishModal: (m: any) => void;
  handleConfirmTogglePublish: () => void;
  isLogModalOpen: boolean;
  setIsLogModalOpen: (open: boolean) => void;
  handleRunSPK: () => void;
  isCalculatingSPK: boolean;
}

export default function AdminHasilAkhirView({
  periodes,
  selectedPeriodeId,
  setSelectedPeriodeId,
  setSummary,
  summary,
  publikasiInfo,
  isPublishing,
  handleTogglePublish,
  currentBobotSubstansi,
  currentBobotWawancara,
  setInputBobotSubstansi,
  setInputBobotWawancara,
  setIsBobotModalOpen,
  handleOpenKuotaModal,
  search,
  setSearch,
  setCurrentPage,
  selectedStatus,
  setSelectedStatus,
  selectedFakultas,
  setSelectedFakultas,
  FAKULTAS_LIST,
  handleExportCSV,
  statusMessage,
  setStatusMessage,
  isLoading,
  items,
  pagination,
  currentPage,
  handleOpenDetailModal,
  selectedDetail,
  setSelectedDetail,
  handleSaveStatus,
  modalNewStatus,
  setModalNewStatus,
  modalCatatan,
  setModalCatatan,
  isUpdating,
  isSawModalOpen,
  setIsSawModalOpen,
  sawTab,
  setSawTab,
  sawCalculation,
  isKuotaModalOpen,
  setIsKuotaModalOpen,
  handleSaveKuota,
  inputKuota,
  setInputKuota,
  inputCadangan,
  setInputCadangan,
  applyRankingStatus,
  setApplyRankingStatus,
  isSavingKuota,
  isBobotModalOpen,
  handleSaveBobot,
  inputBobotSubstansi,
  inputBobotWawancara,
  recalculateWeights,
  setRecalculateWeights,
  isSavingBobot,
  confirmPublishModal,
  setConfirmPublishModal,
  handleConfirmTogglePublish,
  isLogModalOpen,
  setIsLogModalOpen,
  handleRunSPK,
  isCalculatingSPK,
}: AdminHasilAkhirViewProps) {
  return (
    <div className="w-full max-w-7xl space-y-6 pb-12 font-sans">
      {/* ── Top Header Area matching Archivo Black Design ── */}
      <PageHeader
        title="KELOLA HASIL AKHIR"
        subtitle="KULIAH KERJA NYATA INTERNASIONAL"
        description="Lihat dan kelola hasil akhir seleksi peserta KKN Internasional."
        action={
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 w-full sm:w-auto">
            {periodes.length > 0 && (
              <div className="relative flex items-center gap-2 bg-white px-3 py-2 rounded-xl border border-slate-300 shadow-2xs w-full max-w-full min-w-0">
                <Calendar className="w-4 h-4 text-[#0E4A3E] shrink-0" />
                <select
                  value={selectedPeriodeId || periodes[0]?.id_periode || ''}
                  onChange={(e) => {
                    const newId = Number(e.target.value);
                    setSelectedPeriodeId(newId);
                    setCurrentPage(1);
                    const selP = periodes.find((p) => p.id_periode === newId);
                    if (selP) {
                      setSummary((prev: any) => ({ ...prev, targetKuota: selP.kuota }));
                    }
                  }}
                  className="w-full min-w-0 max-w-full text-xs sm:text-sm font-bold text-slate-700 bg-transparent focus:outline-none cursor-pointer appearance-none truncate pr-6"
                >
                  {periodes.map((p) => (
                    <option key={p.id_periode} value={p.id_periode}>
                      {p.nama_periode} ({p.tahun})
                    </option>
                  ))}
                </select>
                <ChevronDown className="w-4 h-4 text-slate-500 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none shrink-0" />
              </div>
            )}

            <div className="flex items-center gap-2 overflow-x-auto no-scrollbar w-full sm:w-auto pb-0.5">
              <button
                type="button"
                onClick={() => setIsLogModalOpen(true)}
                className="inline-flex items-center gap-1.5 px-3 py-2 bg-white hover:bg-slate-50 border border-slate-300 text-[#0E4A3E] rounded-xl text-xs sm:text-sm font-bold shadow-2xs transition-all cursor-pointer whitespace-nowrap shrink-0"
                title="Lihat Riwayat Publikasi & Log Audit"
              >
                <History className="w-4 h-4 text-[#0E4A3E]" />
                <span>Log Publikasi</span>
              </button>

              <button
                type="button"
                onClick={() => setIsSawModalOpen(true)}
                className="inline-flex items-center gap-1.5 px-3 py-2 bg-white hover:bg-slate-50 border border-slate-300 text-[#0E4A3E] rounded-xl text-xs sm:text-sm font-bold shadow-2xs transition-all cursor-pointer whitespace-nowrap shrink-0"
              >
                <Calculator className="w-4 h-4 text-[#0E4A3E]" />
                <span>Matriks SPK</span>
              </button>

              <button
                type="button"
                onClick={handleRunSPK}
                disabled={isCalculatingSPK}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-[#0E4A3E] hover:bg-[#09352c] text-white rounded-xl text-xs sm:text-sm font-bold shadow-xs transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap shrink-0"
                title="Kalkulasi otomatis nilai SPK dan sinkronisasi pendaftar yang belum terhitung"
              >
                {isCalculatingSPK ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Sparkles className="w-4 h-4 text-emerald-300" />
                )}
                <span>{isCalculatingSPK ? 'Menghitung SPK...' : 'Kalkulasi SPK'}</span>
              </button>
            </div>
          </div>
        }
      />

      {/* ── Panel Alur Publikasi Pengumuman Hasil Seleksi ── */}
      <div
        className={`rounded-2xl border p-4 sm:p-5 shadow-2xs transition-all ${
          publikasiInfo?.dipublikasi
            ? 'bg-emerald-50/90 border-emerald-300'
            : publikasiInfo?.lewat_batas_waktu
            ? 'bg-amber-50/50 border-amber-200'
            : 'bg-white border-slate-200'
        }`}
      >
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-start gap-3 sm:gap-3.5">
            <div
              className={`w-10 h-10 sm:w-11 sm:h-11 rounded-2xl flex items-center justify-center shrink-0 shadow-xs ${
                publikasiInfo?.dipublikasi
                  ? 'bg-[#0E4A3E] text-white'
                  : 'bg-[#E8F5F1] text-[#0E4A3E]'
              }`}
            >
              <Globe2 className="w-5 h-5" />
            </div>

            <div className="space-y-1.5 min-w-0 flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h4 className="text-xs sm:text-sm font-extrabold text-slate-900 uppercase tracking-wide">
                  Status Publikasi Hasil Seleksi
                </h4>
                {publikasiInfo?.dipublikasi ? (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-700 text-white">
                    <Eye className="w-3 h-3" /> Dipublikasikan (Aktif di Mahasiswa)
                  </span>
                ) : (
                  <>
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-slate-200 text-slate-700">
                      <EyeOff className="w-3 h-3" /> Draft (Hanya Terlihat Panitia)
                    </span>
                    {publikasiInfo?.lewat_batas_waktu && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-amber-100 text-amber-900 border border-amber-300">
                        <Clock className="w-3 h-3 text-amber-700" /> Melewati Target Timeline
                      </span>
                    )}
                  </>
                )}
              </div>

              <p className="text-xs text-slate-600 leading-relaxed">
                {publikasiInfo?.dipublikasi ? (
                  <>
                    Keputusan hasil seleksi telah dipublikasikan secara resmi
                    {publikasiInfo.tanggal_publikasi
                      ? ` pada ${new Date(publikasiInfo.tanggal_publikasi).toLocaleDateString('id-ID', {
                          day: '2-digit',
                          month: 'long',
                          year: 'numeric',
                        })} pukul ${new Date(publikasiInfo.tanggal_publikasi).toLocaleTimeString('id-ID', {
                          hour: '2-digit',
                          minute: '2-digit',
                        })} WIB`
                      : ''}
                    {publikasiInfo.nama_user_publikasi
                      ? ` oleh ${publikasiInfo.nama_user_publikasi} (user_id #${publikasiInfo.dipublikasi_oleh})`
                      : ''}
                    . Mahasiswa sekarang dapat melihat status kelulusan di portal. Anda tetap dapat melakukan penyesuaian atau menarik kembali publikasi ke status Draft kapan saja jika diperlukan.
                  </>
                ) : (
                  <>
                    Status saat ini berupa <strong>Draft Panitia</strong> (mahasiswa belum dapat melihat pengumuman kelulusan). Anda dapat menyesuaikan kuota kelulusan, bobot formula, dan status peserta secara leluasa.
                    {publikasiInfo?.batas_penetapan && (
                      <span className="text-slate-500 block mt-0.5">
                        Target jadwal pengumuman pada timeline:{' '}
                        <strong>
                          {new Date(publikasiInfo.batas_penetapan).toLocaleDateString('id-ID', {
                            day: '2-digit',
                            month: 'long',
                            year: 'numeric',
                          })}
                        </strong>
                        {publikasiInfo.lewat_batas_waktu
                          ? ' (Target waktu telah terlewati, silakan publikasikan secara manual jika seluruh data peserta telah siap).'
                          : '.'}
                      </span>
                    )}
                  </>
                )}
              </p>
            </div>
          </div>

          <div className="w-full sm:w-auto shrink-0 pt-2 lg:pt-0 border-t lg:border-t-0 border-slate-200/60">
            {publikasiInfo?.dipublikasi ? (
              <button
                type="button"
                onClick={handleTogglePublish}
                disabled={isPublishing}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 text-xs sm:text-sm font-extrabold shadow-sm transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
                title="Tarik kembali pengumuman hasil seleksi ke status Draft/Private"
              >
                {isPublishing ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <EyeOff className="w-4 h-4 text-amber-700" />
                )}
                <span>{isPublishing ? 'Memproses...' : 'Tarik Publikasi (Kembalikan ke Draft)'}</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={handleTogglePublish}
                disabled={isPublishing}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#0E4A3E] hover:bg-[#09352c] text-white text-xs sm:text-sm font-extrabold shadow-sm transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
                title="Publikasikan hasil seleksi ke portal mahasiswa"
              >
                {isPublishing ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Send className="w-4 h-4 text-emerald-300" />
                )}
                <span>{isPublishing ? 'Mempublikasikan...' : 'Publish Hasil Seleksi'}</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ── Top Summary Stat Card ── */}
      <div className="bg-gradient-to-b from-[#D4F1E4] to-[#BEE6D7] border border-[#9fd3c3]/90 rounded-2xl p-4 sm:p-6 shadow-[0_4px_16px_rgba(14,74,62,0.12)]">
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4 sm:gap-6">
          {/* Left Trophy Box */}
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-[#0E4A3E] text-amber-400 flex items-center justify-center shrink-0 shadow-sm">
              <Trophy className="w-6 h-6 sm:w-7 sm:h-7 stroke-[2.2]" />
            </div>
            <div>
              <p className="text-[11px] sm:text-sm font-bold text-[#0E4A3E]/80 tracking-wide uppercase">
                Total Peserta Lolos
              </p>
              <div className="flex items-baseline gap-2 mt-0.5">
                <h3 className="text-xl sm:text-3xl font-black text-[#0E4A3E] tracking-tight leading-tight">
                  {summary.totalLolos}{' '}
                  <span className="text-sm sm:text-lg font-bold text-[#0E4A3E]/70">
                    dari Kuota {summary.targetKuota}
                  </span>
                </h3>
              </div>
            </div>
          </div>

          {/* Right Circle Percentage Stats in a clean responsive grid */}
          <div className="grid grid-cols-3 gap-2 sm:gap-6 pt-3 lg:pt-0 border-t lg:border-t-0 border-[#0E4A3E]/15">
            {/* 1. Lolos Circle (Green) */}
            <div className="flex flex-col sm:flex-row items-center text-center sm:text-left gap-1.5 sm:gap-2.5 bg-white/40 sm:bg-transparent p-2 sm:p-0 rounded-xl">
              <div className="w-11 h-11 sm:w-14 sm:h-14 rounded-full border-[3px] sm:border-[3.5px] border-emerald-600 bg-emerald-100/80 flex items-center justify-center text-emerald-900 font-black text-xs sm:text-base shrink-0 shadow-2xs">
                {summary.persenLolos}%
              </div>
              <div className="min-w-0">
                <span className="text-[11px] sm:text-sm font-black text-[#0E4A3E] block leading-tight">
                  Lolos
                </span>
                <span className="text-[10px] sm:text-xs font-semibold text-[#0E4A3E]/70 block">
                  {summary.totalLolos} Mhs
                </span>
              </div>
            </div>

            {/* 2. Tidak Lolos Circle (Red) */}
            <div className="flex flex-col sm:flex-row items-center text-center sm:text-left gap-1.5 sm:gap-2.5 bg-white/40 sm:bg-transparent p-2 sm:p-0 rounded-xl">
              <div className="w-11 h-11 sm:w-14 sm:h-14 rounded-full border-[3px] sm:border-[3.5px] border-rose-500 bg-rose-100/80 flex items-center justify-center text-rose-900 font-black text-xs sm:text-base shrink-0 shadow-2xs">
                {summary.persenTidakLolos}%
              </div>
              <div className="min-w-0">
                <span className="text-[11px] sm:text-sm font-black text-rose-900 block leading-tight">
                  Tidak Lolos
                </span>
                <span className="text-[10px] sm:text-xs font-semibold text-rose-900/70 block">
                  {summary.totalTidakLolos} Mhs
                </span>
              </div>
            </div>

            {/* 3. Cadangan Circle (Yellow) */}
            <div className="flex flex-col sm:flex-row items-center text-center sm:text-left gap-1.5 sm:gap-2.5 bg-white/40 sm:bg-transparent p-2 sm:p-0 rounded-xl">
              <div className="w-11 h-11 sm:w-14 sm:h-14 rounded-full border-[3px] sm:border-[3.5px] border-amber-500 bg-amber-100/80 flex items-center justify-center text-amber-900 font-black text-xs sm:text-base shrink-0 shadow-2xs">
                {summary.persenCadangan}%
              </div>
              <div className="min-w-0">
                <span className="text-[11px] sm:text-sm font-black text-amber-900 block leading-tight">
                  Cadangan
                </span>
                <span className="text-[10px] sm:text-xs font-semibold text-amber-900/70 block">
                  {summary.totalCadangan} Mhs
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Kebijakan LP2M: Formula Pembobotan & Keterwakilan Fakultas ── */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs p-4 sm:p-5 space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 pb-3 border-b border-slate-100">
          <div className="flex items-start gap-2.5 min-w-0 flex-1">
            <div className="w-8 h-8 rounded-xl bg-[#0E4A3E]/10 text-[#0E4A3E] flex items-center justify-center font-black shrink-0 mt-0.5">
              <Award className="w-4 h-4 text-[#0E4A3E]" />
            </div>
            <div className="min-w-0">
              <h4 className="text-xs sm:text-sm font-extrabold text-[#0E4A3E] uppercase tracking-wide">
                Pedoman Seleksi & Keterwakilan Fakultas (LP2M)
              </h4>
              <p className="text-[11px] text-slate-500 font-medium">
                Seleksi mempertimbangkan ranking nilai, kuota keterwakilan fakultas/prodi, serta syarat wajib rekomendasi Dekan.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 shrink-0 w-full sm:w-auto">
            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#DDF2E8] border border-[#c2e5d6] rounded-xl text-xs font-bold text-[#0E4A3E] w-full sm:w-auto justify-between sm:justify-start">
              <span>Formula:</span>
              <span className="font-extrabold text-emerald-900 bg-white/80 px-2 py-0.5 rounded shadow-2xs">
                {currentBobotSubstansi}% Substansi + {currentBobotWawancara}% Wawancara
              </span>
            </div>
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <button
                type="button"
                onClick={() => {
                  setInputBobotSubstansi(currentBobotSubstansi);
                  setInputBobotWawancara(currentBobotWawancara);
                  setIsBobotModalOpen(true);
                }}
                className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-3 py-1.5 bg-white hover:bg-emerald-50 text-emerald-800 border border-emerald-300 rounded-xl text-xs font-bold transition-all shadow-2xs cursor-pointer hover:scale-102 active:scale-98 whitespace-nowrap"
                title="Ubah Bobot Formula Seleksi Secara Dinamis"
              >
                <Settings2 className="w-3.5 h-3.5 text-emerald-700" />
                <span>Atur Bobot</span>
              </button>
              <button
                type="button"
                onClick={handleOpenKuotaModal}
                className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-3 py-1.5 bg-white hover:bg-emerald-50 text-emerald-800 border border-emerald-300 rounded-xl text-xs font-bold transition-all shadow-2xs cursor-pointer hover:scale-102 active:scale-98 whitespace-nowrap"
                title="Atur Kuota Kelulusan Peserta KKN"
              >
                <Users className="w-3.5 h-3.5 text-emerald-700" />
                <span>Atur Kuota</span>
              </button>
            </div>
          </div>
        </div>

        {/* Breakdown Keterwakilan Fakultas */}
        {summary.fakultasBreakdown && summary.fakultasBreakdown.length > 0 && (
          <div>
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-2">
              Distribusi Keterwakilan Peserta per Fakultas:
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
              {summary.fakultasBreakdown.map((f) => (
                <div
                  key={f.nama_fakultas}
                  className={`p-2.5 rounded-xl border transition-all ${
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
                        f.lolos > 0
                          ? 'bg-emerald-600 text-white'
                          : 'bg-slate-200 text-slate-600'
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
      </div>

      {/* ── Filters Bar ── */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Cari data hasil akhir disini..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-300 rounded-xl text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0E4A3E] shadow-2xs"
          />
        </div>

        {/* Status Filter */}
        <div className="relative min-w-[170px]">
          <select
            value={selectedStatus}
            onChange={(e) => {
              setSelectedStatus(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-xs sm:text-sm font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#0E4A3E] shadow-2xs appearance-none pr-8 cursor-pointer"
          >
            <option value="all">Semua Status</option>
            <option value="Lolos">Lolos</option>
            <option value="Cadangan">Cadangan</option>
            <option value="Tidak Lolos">Tidak Lolos</option>
          </select>
          <Filter className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
        </div>

        {/* Fakultas Filter */}
        <div className="relative min-w-[170px]">
          <select
            value={selectedFakultas}
            onChange={(e) => {
              setSelectedFakultas(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-xs sm:text-sm font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#0E4A3E] shadow-2xs appearance-none pr-8 cursor-pointer"
          >
            {FAKULTAS_LIST.map((f) => (
              <option key={f} value={f}>
                {f}
              </option>
            ))}
          </select>
          <Filter className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
        </div>

        {/* Ekspor CSV Button */}
        <button
          type="button"
          onClick={handleExportCSV}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-[#0E4A3E] hover:bg-[#09352c] text-white rounded-xl text-xs sm:text-sm font-bold transition-all shadow-xs cursor-pointer whitespace-nowrap shrink-0"
          title="Ekspor seluruh hasil akhir seleksi ke format Excel / CSV"
        >
          <FileSpreadsheet className="w-4 h-4 text-emerald-300" />
          <span>Ekspor CSV</span>
        </button>
      </div>

      {/* ── Status Message Alert / Toast ── */}
      <AlertBanner message={statusMessage} onClose={() => setStatusMessage(null)} />

      {/* ── Main Table Card matching Figma Design ── */}
      <div className="kkn-table-card">
        <div className="kkn-table-scroll">
          <div className="kkn-table-inner">
        {/* Table Header Bar (#0E4A3E) */}
        <div className="kkn-table-header">
          <div className="kkn-table-header-grid">
            <span className="col-span-1 text-center">No</span>
            <span className="col-span-3">NIM / Nama Mahasiswa</span>
            <span className="col-span-2">Fakultas / Program Studi</span>
            <span className="col-span-2">Nilai Akhir (Skor)</span>
            <span className="col-span-1 text-center">Ranking</span>
            <span className="col-span-2 text-center">Negara Penempatan</span>
            <span className="col-span-1 text-center">Status</span>
          </div>
        </div>

        {/* Table Content Rows */}
        {isLoading ? (
          <div className="py-16 flex flex-col items-center justify-center text-slate-400 gap-2">
            <RefreshCw className="w-6 h-6 animate-spin text-[#0E4A3E]" />
            <span className="text-xs font-semibold">Memuat data hasil akhir seleksi...</span>
          </div>
        ) : items.length === 0 ? (
          <div className="py-16 px-4 text-center">
            <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-3 text-slate-400">
              <FileSpreadsheet className="w-6 h-6" />
            </div>
            <p className="text-sm font-bold text-slate-700">Tidak ada data hasil akhir</p>
            <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
              Cobalah sesuaikan kata kunci pencarian atau ganti filter status dan fakultas.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-slate-200">
            {items.map((item, idx) => (
              <div
                key={item.id_hasil}
                className="kkn-table-row"
              >
                {/* 1. No */}
                <span className="col-span-1 text-center font-bold text-slate-500">
                  {(pagination.page - 1) * pagination.limit + idx + 1}
                </span>

                {/* 2. Mahasiswa Info */}
                <div className="col-span-3 pr-3">
                  <p className="font-bold text-slate-800 leading-snug">{item.nama}</p>
                  <p className="text-[11px] font-semibold text-slate-500 mt-0.5">
                    NIM: <span className="text-slate-700">{item.nim}</span>
                  </p>
                  <div className="mt-1">
                    {item.hasRekomendasiDekan !== false ? (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-1.5 py-0.5 rounded">
                        <CheckCircle2 className="w-2.5 h-2.5 text-emerald-600" />
                        Rekomendasi Dekan
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-700 bg-amber-50 border border-amber-200 px-1.5 py-0.5 rounded">
                        <AlertTriangle className="w-2.5 h-2.5 text-amber-600" />
                        Perlu Rekomendasi
                      </span>
                    )}
                  </div>
                </div>

                {/* 3. Fakultas / Prodi */}
                <div className="col-span-2 pr-3 text-slate-700">
                  <p className="font-semibold text-slate-800">{item.nama_prodi}</p>
                  <span className="inline-block text-[11px] font-bold text-[#0E4A3E] bg-[#0E4A3E]/10 px-2 py-0.5 rounded-md mt-0.5">
                    {item.nama_fakultas}
                  </span>
                </div>

                {/* 4. Nilai Akhir */}
                <div className="col-span-2 pr-3">
                  <div className="flex items-center gap-1.5">
                    <span className="text-base font-extrabold text-[#0E4A3E]">
                      {item.nilai_akhir.toFixed(2)}
                    </span>
                    <span className="text-[11px] text-slate-400">/ 100</span>
                  </div>
                  <span className="text-[10px] text-slate-400 block mt-0.5">
                    Substansi: {item.nilai_substansi} • Wawancara: {item.nilai_wawancara}
                  </span>
                </div>

                {/* 5. Ranking */}
                <div className="col-span-1 text-center font-black text-slate-800 text-sm sm:text-base">
                  {item.ranking_akhir}
                </div>

                {/* 6. Negara Penempatan */}
                <div className="col-span-2 flex justify-center">
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-sky-50 text-sky-800 border border-sky-200 whitespace-nowrap">
                    <Globe2 className="w-3 h-3 text-sky-600 shrink-0" />
                    {item.nama_negara !== '-' ? item.nama_negara : <span className="text-slate-400 italic">Belum ditetapkan</span>}
                  </span>
                </div>

                {/* 7. Status + Aksi */}
                <div className="col-span-1 flex flex-col items-center gap-1">
                  {item.status === 'Lolos' ? (
                    <span className="inline-block bg-[#C0E6D8] text-[#0E4A3E] border border-emerald-300 font-bold text-[11px] px-3.5 py-1 rounded-full shadow-2xs whitespace-nowrap">
                      Lolos
                    </span>
                  ) : item.status === 'Cadangan' ? (
                    <span className="inline-block bg-amber-100 text-amber-800 border border-amber-300 font-bold text-[11px] px-3.5 py-1 rounded-full shadow-2xs whitespace-nowrap">
                      Cadangan
                    </span>
                  ) : (
                    <span className="inline-block bg-red-100 text-red-700 border border-red-300 font-bold text-[11px] px-3 py-1 rounded-full whitespace-nowrap">
                      Tidak Lolos
                    </span>
                  )}
                  <button
                    onClick={() => handleOpenDetailModal(item)}
                    title="Ubah Status Penetapan"
                    className="p-1 text-amber-500 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors cursor-pointer"
                  >
                    <Edit3 className="w-3.5 h-3.5 stroke-[2.2]" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ── Table Footer / Pagination ── */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-slate-600">
          <div>
            Menampilkan{' '}
            <strong className="text-slate-800">
              {pagination.total > 0 ? (pagination.page - 1) * pagination.limit + 1 : 0}
            </strong>
            -
            <strong className="text-slate-800">
              {Math.min(pagination.page * pagination.limit, pagination.total)}
            </strong>{' '}
            data dari <strong className="text-slate-800">{pagination.total}</strong> data
          </div>

          <div className="flex items-center gap-1.5 self-center">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage <= 1 || isLoading}
              className="p-1.5 rounded-lg border border-slate-300 bg-white hover:bg-slate-100 disabled:opacity-40 transition-colors cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map((num) => (
              <button
                key={num}
                onClick={() => setCurrentPage(num)}
                disabled={isLoading}
                className={`w-8 h-8 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  currentPage === num
                    ? 'bg-[#0E4A3E] text-white shadow-xs'
                    : 'bg-white border border-slate-300 text-slate-700 hover:bg-slate-100'
                }`}
              >
                {num}
              </button>
            ))}

            <button
              onClick={() => setCurrentPage((p) => Math.min(pagination.totalPages, p + 1))}
              disabled={currentPage >= pagination.totalPages || isLoading}
              className="p-1.5 rounded-lg border border-slate-300 bg-white hover:bg-slate-100 disabled:opacity-40 transition-colors cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
          </div>
        </div>
      </div>

      {/* ── MODAL PENETAPAN & UPDATE STATUS HASIL AKHIR ── */}
      {selectedDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg border border-slate-200 overflow-hidden">
            {/* Header */}
            <div className="bg-[#0E4A3E] text-white px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Trophy className="w-5 h-5 text-amber-300" />
                <h3 className="font-bold text-base">Penetapan Hasil Kelulusan Seleksi</h3>
              </div>
              <button
                onClick={() => setSelectedDetail(null)}
                className="text-white/80 hover:text-white p-1 hover:bg-white/10 rounded-lg transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSaveStatus} className="p-6 space-y-4">
              {/* Student Card */}
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-bold text-slate-800 text-sm sm:text-base">
                      {selectedDetail.nama}
                    </h4>
                    <p className="text-xs text-slate-500 mt-0.5">
                      NIM: {selectedDetail.nim} • {selectedDetail.nama_prodi} ({selectedDetail.nama_fakultas})
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="text-[11px] font-bold text-slate-400 block uppercase">
                      Rangking
                    </span>
                    <span className="text-xl font-black text-[#0E4A3E]">
                      #{selectedDetail.ranking_akhir}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2 mt-3 pt-3 border-t border-slate-200 text-center">
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold block uppercase">
                      Nilai Substansi
                    </span>
                    <span className="text-sm font-bold text-slate-700">
                      {selectedDetail.nilai_substansi}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold block uppercase">
                      Nilai Wawancara
                    </span>
                    <span className="text-sm font-bold text-slate-700">
                      {selectedDetail.nilai_wawancara}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold block uppercase">
                      Skor Akhir
                    </span>
                    <span className="text-sm font-black text-[#0E4A3E]">
                      {selectedDetail.nilai_akhir.toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Status Select */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Status Kelulusan
                </label>
                <select
                  value={modalNewStatus}
                  onChange={(e) =>
                    setModalNewStatus(e.target.value as 'Lolos' | 'Cadangan' | 'Tidak Lolos')
                  }
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm font-bold text-slate-800 bg-white focus:outline-none focus:ring-2 focus:ring-[#0E4A3E] cursor-pointer"
                >
                  <option value="Lolos">Lolos (Peserta Utama)</option>
                  <option value="Cadangan">Cadangan</option>
                  <option value="Tidak Lolos">Tidak Lolos</option>
                </select>
              </div>

              {/* Catatan Penetapan */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Catatan Penetapan Hasil Seleksi
                </label>
                <textarea
                  rows={3}
                  placeholder="Keterangan kelulusan, penempatan negara tujuan, atau catatan administrasi..."
                  value={modalCatatan}
                  onChange={(e) => setModalCatatan(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0E4A3E]"
                />
              </div>

              {/* Buttons */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200 mt-6">
                <button
                  type="button"
                  onClick={() => setSelectedDetail(null)}
                  className="px-4 py-2.5 rounded-xl border border-slate-300 text-slate-700 font-bold text-xs sm:text-sm hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isUpdating}
                  className="px-6 py-2.5 rounded-xl bg-[#0D6EFD] hover:bg-[#0b5ed7] text-white font-bold text-xs sm:text-sm shadow-md transition-all hover:scale-102 active:scale-98 disabled:opacity-50 cursor-pointer flex items-center gap-2"
                >
                  {isUpdating && <RefreshCw className="w-4 h-4 animate-spin" />}
                  <span>Simpan Keputusan</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── MODAL PERHITUNGAN SPK METODE SAW ── */}
      {isSawModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-2xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-4xl w-full max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="bg-[#0E4A3E] text-white px-6 py-4 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2.5">
                <Calculator className="w-5 h-5 text-emerald-300" />
                <div>
                  <h3 className="font-extrabold text-base uppercase tracking-tight">
                    Perhitungan SPK — Metode Simple Additive Weighting (SAW)
                  </h3>
                  <p className="text-xs text-emerald-200 font-medium">
                    Tahapan kalkulasi matriks keputusan, normalisasi, dan preferensi perangkingan peserta.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsSawModalOpen(false)}
                className="text-emerald-200 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Formula Explainer */}
            <div className="bg-[#DDF2E8] border-b border-[#c2e5d6] p-4 text-xs space-y-1.5 shrink-0 text-[#0E4A3E]">
              <div className="flex flex-wrap items-center justify-between gap-2 font-bold">
                <span>Metode: Simple Additive Weighting (SAW)</span>
                <span className="bg-white/80 px-2 py-0.5 rounded border border-[#9ed4c0]">
                  Bobot: W₁ (Substansi) = {sawCalculation?.wSubstansi || 0.7} • W₂ (Wawancara) = {sawCalculation?.wWawancara || 0.3}
                </span>
              </div>
              <p className="text-slate-700 leading-relaxed text-[11px]">
                • <strong>Normalisasi (Benefit):</strong> r<sub>ij</sub> = x<sub>ij</sub> / Max(x<sub>j</sub>). Karena nilai yang lebih tinggi dianggap lebih baik.<br />
                • <strong>Nilai Preferensi:</strong> V<sub>i</sub> = (W₁ × r<sub>i1</sub>) + (W₂ × r<sub>i2</sub>). Mahasiswa dengan nilai V<sub>i</sub> terbesar memiliki prioritas kelulusan tertinggi.
              </p>
            </div>

            {/* Tab Controls */}
            <div className="flex items-center gap-2 px-6 pt-4 shrink-0 border-b border-slate-200">
              <button
                onClick={() => setSawTab('preferensi')}
                className={`pb-2.5 px-3 text-xs font-bold transition-all cursor-pointer border-b-2 ${
                  sawTab === 'preferensi'
                    ? 'border-[#0E4A3E] text-[#0E4A3E]'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                1. Nilai Preferensi (V) & Rangking
              </button>
              <button
                onClick={() => setSawTab('normalisasi')}
                className={`pb-2.5 px-3 text-xs font-bold transition-all cursor-pointer border-b-2 ${
                  sawTab === 'normalisasi'
                    ? 'border-[#0E4A3E] text-[#0E4A3E]'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                2. Matriks Normalisasi (R)
              </button>
              <button
                onClick={() => setSawTab('keputusan')}
                className={`pb-2.5 px-3 text-xs font-bold transition-all cursor-pointer border-b-2 ${
                  sawTab === 'keputusan'
                    ? 'border-[#0E4A3E] text-[#0E4A3E]'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                3. Matriks Keputusan (X)
              </button>
            </div>

            {/* Table Content */}
            <div className="p-6 overflow-y-auto flex-1">
              {!sawCalculation || sawCalculation.rows.length === 0 ? (
                <div className="py-12 text-center text-slate-500 text-xs">
                  Belum ada data nilai kandidat untuk dihitung.
                </div>
              ) : sawTab === 'preferensi' ? (
                /* TAB 1: PREFERENSI */
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                        <th className="p-2.5 text-center w-12">Rank</th>
                        <th className="p-2.5">NIM / Nama Mahasiswa</th>
                        <th className="p-2.5">Fakultas</th>
                        <th className="p-2.5 text-center">r₁ (Substansi)</th>
                        <th className="p-2.5 text-center">r₂ (Wawancara)</th>
                        <th className="p-2.5 text-center bg-emerald-50 text-[#0E4A3E] font-black">Nilai Preferensi (V)</th>
                        <th className="p-2.5 text-center">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {sawCalculation.rows.map((row: any, idx: number) => (
                        <tr key={row.id_hasil} className="hover:bg-slate-50">
                          <td className="p-2.5 text-center font-black text-slate-800">
                            {idx + 1}
                          </td>
                          <td className="p-2.5">
                            <span className="font-bold text-slate-800 block">{row.nama}</span>
                            <span className="text-[10px] text-slate-500">{row.nim}</span>
                          </td>
                          <td className="p-2.5 font-semibold text-slate-700">{row.fakultas}</td>
                          <td className="p-2.5 text-center font-semibold text-slate-600">{row.rSubstansi}</td>
                          <td className="p-2.5 text-center font-semibold text-slate-600">{row.rWawancara}</td>
                          <td className="p-2.5 text-center font-black text-emerald-800 bg-emerald-50/60 text-sm">
                            {row.vPreference.toFixed(4)}
                          </td>
                          <td className="p-2.5 text-center">
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700">
                              {row.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : sawTab === 'normalisasi' ? (
                /* TAB 2: NORMALISASI */
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                        <th className="p-2.5 text-center w-12">No</th>
                        <th className="p-2.5">Nama Alternatif (Mahasiswa)</th>
                        <th className="p-2.5 text-center">r₁ (Substansi = x₁ / {sawCalculation.maxSubstansi})</th>
                        <th className="p-2.5 text-center">r₂ (Wawancara = x₂ / {sawCalculation.maxWawancara})</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {sawCalculation.rows.map((row: any, idx: number) => (
                        <tr key={row.id_hasil} className="hover:bg-slate-50">
                          <td className="p-2.5 text-center font-bold text-slate-500">{idx + 1}</td>
                          <td className="p-2.5 font-bold text-slate-800">{row.nama} ({row.nim})</td>
                          <td className="p-2.5 text-center font-bold text-slate-700 bg-slate-50/50">
                            {row.rSubstansi}
                          </td>
                          <td className="p-2.5 text-center font-bold text-slate-700 bg-slate-50/50">
                            {row.rWawancara}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                /* TAB 3: KEPUTUSAN */
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                        <th className="p-2.5 text-center w-12">No</th>
                        <th className="p-2.5">Alternatif (Mahasiswa)</th>
                        <th className="p-2.5 text-center">C₁: Nilai Substansi (Benefit)</th>
                        <th className="p-2.5 text-center">C₂: Nilai Wawancara (Benefit)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {sawCalculation.rows.map((row: any, idx: number) => (
                        <tr key={row.id_hasil} className="hover:bg-slate-50">
                          <td className="p-2.5 text-center font-bold text-slate-500">{idx + 1}</td>
                          <td className="p-2.5 font-bold text-slate-800">{row.nama}</td>
                          <td className="p-2.5 text-center font-black text-[#0E4A3E]">{row.xSubstansi}</td>
                          <td className="p-2.5 text-center font-black text-[#0E4A3E]">{row.xWawancara}</td>
                        </tr>
                      ))}
                      <tr className="bg-emerald-50/80 font-black text-[#0E4A3E]">
                        <td colSpan={2} className="p-2.5 text-right uppercase text-[11px]">
                          Nilai Maksimum Kolom (Max x_j):
                        </td>
                        <td className="p-2.5 text-center">{sawCalculation.maxSubstansi}</td>
                        <td className="p-2.5 text-center">{sawCalculation.maxWawancara}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="bg-slate-50 px-6 py-3 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500 shrink-0">
              <span>Metode SPK Simple Additive Weighting (SAW) Terintegrasi LP2M</span>
              <button
                type="button"
                onClick={() => setIsSawModalOpen(false)}
                className="px-4 py-1.5 bg-[#0E4A3E] text-white font-bold rounded-lg text-xs hover:bg-[#08362d] transition-colors cursor-pointer"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Modal Atur Kuota Kelulusan ── */}
      {isKuotaModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl border border-slate-300 shadow-2xl w-full max-w-xl max-h-[92vh] overflow-y-auto p-6 md:p-8 space-y-6">
            {/* Modal Header */}
            <div className="flex items-start justify-between pb-4 border-b border-slate-200">
              <div>
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-6 bg-[#0E4A3E] rounded-full inline-block" />
                  <h3 className="text-xl font-extrabold text-[#0E4A3E] uppercase tracking-wide">
                    Atur Kuota Kelulusan Seleksi
                  </h3>
                </div>
                <p className="text-xs text-slate-500 mt-1 pl-4.5">
                  Tentukan jumlah kuota peserta lolos untuk periode ini (misal: 10 atau 13 peserta) dan terapkan ranking kelulusan.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsKuotaModalOpen(false)}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSaveKuota} className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Input 1: Kuota Utama (Lolos) */}
                <div className="p-4 bg-emerald-50/70 border border-emerald-200 rounded-2xl">
                  <label className="block text-xs font-extrabold text-emerald-900 uppercase tracking-wide mb-1">
                    Kuota Peserta Lolos <span className="text-red-500">*</span>
                  </label>
                  <p className="text-[11px] text-emerald-700 mb-2">
                    Jumlah mahasiswa yang dinyatakan lolos resmi.
                  </p>
                  <input
                    type="number"
                    min="1"
                    max="1000"
                    required
                    value={inputKuota}
                    onChange={(e) => setInputKuota(parseInt(e.target.value, 10) || 1)}
                    className="w-full px-3.5 py-2.5 bg-white border border-emerald-300 rounded-xl text-base font-black text-emerald-900 focus:outline-none focus:ring-2 focus:ring-[#0E4A3E] shadow-2xs"
                  />
                </div>

                {/* Input 2: Kuota Cadangan */}
                <div className="p-4 bg-amber-50/70 border border-amber-200 rounded-2xl">
                  <label className="block text-xs font-extrabold text-amber-900 uppercase tracking-wide mb-1">
                    Kuota Cadangan (Waiting List)
                  </label>
                  <p className="text-[11px] text-amber-700 mb-2">
                    Jumlah mahasiswa cadangan jika ada yang mundur.
                  </p>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={inputCadangan}
                    onChange={(e) => setInputCadangan(parseInt(e.target.value, 10) || 0)}
                    className="w-full px-3.5 py-2.5 bg-white border border-amber-300 rounded-xl text-base font-black text-amber-900 focus:outline-none focus:ring-2 focus:ring-amber-500 shadow-2xs"
                  />
                </div>
              </div>

              {/* Opsi Terapkan Ranking Otomatis */}
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-3">
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={applyRankingStatus}
                    onChange={(e) => setApplyRankingStatus(e.target.checked)}
                    className="mt-0.5 w-4 h-4 text-[#0E4A3E] rounded border-slate-300 focus:ring-[#0E4A3E]"
                  />
                  <div>
                    <span className="text-xs font-bold text-slate-800 block">
                      Terapkan Status Kelulusan Berdasarkan Ranking Nilai SPK
                    </span>
                    <span className="text-[11px] text-slate-500 block mt-0.5">
                      Sistem akan otomatis menetapkan status seluruh peserta sesuai urutan peringkat:
                    </span>
                  </div>
                </label>

                {applyRankingStatus && (
                  <div className="pl-7 space-y-1.5 text-xs">
                    <div className="flex items-center gap-2 text-emerald-800 font-semibold">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />
                      <span>Peringkat 1 s/d {inputKuota}: <strong>Status Lolos</strong> ({inputKuota} Mahasiswa)</span>
                    </div>
                    {inputCadangan > 0 && (
                      <div className="flex items-center gap-2 text-amber-800 font-semibold">
                        <span className="w-2 h-2 rounded-full bg-amber-500 inline-block" />
                        <span>Peringkat {inputKuota + 1} s/d {inputKuota + inputCadangan}: <strong>Status Cadangan</strong> ({inputCadangan} Mahasiswa)</span>
                      </div>
                    )}
                    <div className="flex items-center gap-2 text-rose-800 font-semibold">
                      <span className="w-2 h-2 rounded-full bg-rose-500 inline-block" />
                      <span>Peringkat {inputKuota + inputCadangan + 1} ke bawah: <strong>Status Tidak Lolos</strong></span>
                    </div>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsKuotaModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-slate-300 text-slate-700 font-bold text-xs sm:text-sm hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSavingKuota}
                  className="px-6 py-2.5 rounded-xl bg-[#0E4A3E] hover:bg-[#09352c] text-white font-bold text-xs sm:text-sm shadow-md transition-all hover:scale-102 active:scale-98 disabled:opacity-50 cursor-pointer flex items-center gap-2"
                >
                  {isSavingKuota && <RefreshCw className="w-4 h-4 animate-spin" />}
                  <span>{applyRankingStatus ? 'Simpan Kuota & Terapkan Kelulusan' : 'Simpan Kuota Periode'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── MODAL ATUR BOBOT FORMULA SELEKSI DINAMIS ── */}
      {isBobotModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl border border-slate-300 shadow-2xl w-full max-w-xl max-h-[92vh] overflow-y-auto p-6 md:p-8 space-y-6">
            {/* Modal Header */}
            <div className="flex items-start justify-between pb-4 border-b border-slate-200">
              <div>
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-6 bg-[#0E4A3E] rounded-full inline-block" />
                  <h3 className="text-xl font-extrabold text-[#0E4A3E] uppercase tracking-wide">
                    Atur Bobot Formula Seleksi
                  </h3>
                </div>
                <p className="text-xs text-slate-500 mt-1 pl-4.5">
                  Tentukan persentase kontribusi Nilai Substansi (Portofolio/IPK) dan Wawancara secara dinamis. Total formula harus 100%.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsBobotModalOpen(false)}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSaveBobot} className="space-y-5">
              {/* Live Formula Badge Preview */}
              <div className="p-4 bg-[#DDF2E8]/80 border border-[#b4e0ce] rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
                <div>
                  <span className="text-[11px] font-bold text-[#0E4A3E] uppercase tracking-wider block">
                    Formula Aktif Saat Ini:
                  </span>
                  <div className="text-base font-black text-[#0E4A3E] mt-0.5">
                    {inputBobotSubstansi}% Substansi + {inputBobotWawancara}% Wawancara
                  </div>
                </div>
                <div className="text-xs font-bold px-3 py-1 bg-white text-[#0E4A3E] rounded-xl border border-[#b4e0ce] shadow-2xs">
                  Total: {inputBobotSubstansi + inputBobotWawancara}%
                </div>
              </div>

              {/* Quick Presets */}
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-2">
                  Pilihan Rekomendasi (Preset):
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {[
                    { label: '70% : 30% (Default LP2M)', s: 70, w: 30 },
                    { label: '60% : 40% (Akademik 60%)', s: 60, w: 40 },
                    { label: '50% : 50% (Proporsional 1:1)', s: 50, w: 50 },
                    { label: '80% : 20% (Dominan Portofolio)', s: 80, w: 20 },
                    { label: '40% : 60% (Dominan Wawancara)', s: 40, w: 60 },
                    { label: '30% : 70% (Wawancara 70%)', s: 30, w: 70 },
                  ].map((preset) => {
                    const isSelected = inputBobotSubstansi === preset.s && inputBobotWawancara === preset.w;
                    return (
                      <button
                        key={preset.label}
                        type="button"
                        onClick={() => {
                          setInputBobotSubstansi(preset.s);
                          setInputBobotWawancara(preset.w);
                        }}
                        className={`p-2 rounded-xl text-left text-xs font-bold border transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-[#0E4A3E] text-white border-[#0E4A3E] shadow-xs'
                            : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        <div className="text-[11px] leading-tight">{preset.label}</div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Slider & Custom Inputs */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Input Bobot Substansi */}
                <div className="p-4 bg-emerald-50/70 border border-emerald-200 rounded-2xl space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-extrabold text-emerald-900 uppercase tracking-wide">
                      Bobot Substansi (%)
                    </label>
                    <span className="text-base font-black text-emerald-900">{inputBobotSubstansi}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    step="5"
                    value={inputBobotSubstansi}
                    onChange={(e) => {
                      const val = parseInt(e.target.value, 10) || 0;
                      setInputBobotSubstansi(val);
                      setInputBobotWawancara(100 - val);
                    }}
                    className="w-full accent-[#0E4A3E] cursor-pointer"
                  />
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={inputBobotSubstansi}
                    onChange={(e) => {
                      const val = Math.min(100, Math.max(0, parseInt(e.target.value, 10) || 0));
                      setInputBobotSubstansi(val);
                      setInputBobotWawancara(100 - val);
                    }}
                    className="w-full px-3 py-2 bg-white border border-emerald-300 rounded-xl text-sm font-bold text-emerald-900 focus:outline-none focus:ring-1 focus:ring-[#0E4A3E]"
                  />
                </div>

                {/* Input Bobot Wawancara */}
                <div className="p-4 bg-teal-50/70 border border-teal-200 rounded-2xl space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-extrabold text-teal-900 uppercase tracking-wide">
                      Bobot Wawancara (%)
                    </label>
                    <span className="text-base font-black text-teal-900">{inputBobotWawancara}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    step="5"
                    value={inputBobotWawancara}
                    onChange={(e) => {
                      const val = parseInt(e.target.value, 10) || 0;
                      setInputBobotWawancara(val);
                      setInputBobotSubstansi(100 - val);
                    }}
                    className="w-full accent-teal-700 cursor-pointer"
                  />
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={inputBobotWawancara}
                    onChange={(e) => {
                      const val = Math.min(100, Math.max(0, parseInt(e.target.value, 10) || 0));
                      setInputBobotWawancara(val);
                      setInputBobotSubstansi(100 - val);
                    }}
                    className="w-full px-3 py-2 bg-white border border-teal-300 rounded-xl text-sm font-bold text-teal-900 focus:outline-none focus:ring-1 focus:ring-teal-700"
                  />
                </div>
              </div>

              {/* Option to recalculate candidates */}
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-2">
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={recalculateWeights}
                    onChange={(e) => setRecalculateWeights(e.target.checked)}
                    className="mt-0.5 w-4 h-4 text-[#0E4A3E] rounded border-slate-300 focus:ring-[#0E4A3E]"
                  />
                  <div>
                    <span className="text-xs font-bold text-slate-800 block">
                      Hitung Ulang Nilai Akhir & Ranking Seluruh Peserta Otomatis
                    </span>
                    <span className="text-[11px] text-slate-500 block mt-0.5">
                      Sistem akan memperbarui kolom <code>bobot_substansi</code>, <code>bobot_wawancara</code>, dan menghitung kembali <code>nilai_akhir</code> pada seluruh peserta periode ini.
                    </span>
                  </div>
                </label>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsBobotModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-slate-300 text-slate-700 font-bold text-xs sm:text-sm hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSavingBobot || inputBobotSubstansi + inputBobotWawancara !== 100}
                  className="px-6 py-2.5 rounded-xl bg-[#0E4A3E] hover:bg-[#09352c] text-white font-bold text-xs sm:text-sm shadow-md transition-all hover:scale-102 active:scale-98 disabled:opacity-50 cursor-pointer flex items-center gap-2"
                >
                  {isSavingBobot && <RefreshCw className="w-4 h-4 animate-spin" />}
                  <span>Simpan & Terapkan Formula</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── MODAL KONFIRMASI PUBLIKASI / TARIK PUBLIKASI ── */}
      <ConfirmModal
        isOpen={!!confirmPublishModal}
        onClose={() => setConfirmPublishModal(null)}
        onConfirm={handleConfirmTogglePublish}
        title={
          confirmPublishModal?.willPublish
            ? 'Publikasikan Hasil Seleksi?'
            : 'Tarik Kembali Publikasi?'
        }
        itemName={confirmPublishModal?.namaPeriodeLabel}
        description={
          confirmPublishModal?.willPublish
            ? 'Mahasiswa yang mendaftar pada periode ini akan dapat melihat status pengumuman kelulusan serta mengunduh SK Kelulusan di portal mahasiswa.'
            : 'Hasil seleksi akan dikembalikan ke status Draft/Private. Mahasiswa sementara tidak akan dapat melihat hasil seleksi hingga Anda mempublikasikannya kembali.'
        }
        confirmLabel={
          confirmPublishModal?.willPublish ? 'Ya, Publikasikan' : 'Ya, Tarik ke Draft'
        }
        cancelLabel="Batal"
        type="warning"
        isProcessing={isPublishing}
      />

      {/* ── MODAL RIWAYAT PUBLIKASI & LOG AUDIT ── */}
      <LogPublikasiModal
        isOpen={isLogModalOpen}
        onClose={() => setIsLogModalOpen(false)}
        defaultJenis="hasil_seleksi"
        idPeriode={selectedPeriodeId}
      />
    </div>
  );
}
