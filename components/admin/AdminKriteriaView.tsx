'use client';

import React from 'react';
import {
  Plus,
  Edit3,
  Trash2,
  CheckCircle2,
  X,
  RefreshCw,
  SlidersHorizontal,
  Check,
  AlertTriangle,
  Calendar,
  Lock,
  Save,
  Calculator,
  Copy,
  Languages,
} from 'lucide-react';
import { PageHeader, AlertBanner, ConfirmModal, FilterBar } from '@/components/ui';

export const isToeflKriteria = (item: { nama_kriteria: string; metode_nilai?: string }) => {
  const nama = (item.nama_kriteria || '').toLowerCase();
  const metode = (item.metode_nilai || '').toLowerCase();
  return (
    nama.includes('toefl') ||
    nama.includes('ielts') ||
    nama.includes('bahasa') ||
    nama.includes('language') ||
    metode.includes('toefl') ||
    metode.includes('ielts')
  );
};

export interface KriteriaItem {
  id_kriteria: number;
  id_periode: number;
  nama_kriteria: string;
  bobot: number;
  nilai_maksimal: number;
  jenis: string;
  metode_nilai: string;
  status: boolean;
  nama_periode: string;
}

export interface PeriodeOption {
  id_periode: number;
  nama_periode: string;
  tahun: number;
  status: string;
}

export const JENIS_KRITERIA_OPTIONS = [
  'Benefit (Semakin Tinggi Makin Baik)',
  'Cost (Semakin Rendah Makin Baik)',
  'Akademik',
  'Kompetensi',
  'Non-Akademik',
  'Substansi',
  'Administratif',
  'Wawancara',
  'Lainnya',
];

export const METODE_NILAI_PRESETS = [
  'Simple Additive Weighting (SAW)',
  'Konversi Skala 100',
  'Penilaian Manual (Skala 1-100)',
  'Konversi Skor TOEFL',
  'Checklist Verifikasi',
  'Rubrik Penilaian 1-5',
  'Sistem Poin Terbobot',
];

export interface AdminKriteriaViewProps {
  kriteriaList: KriteriaItem[];
  periodes: PeriodeOption[];
  selectedPeriodeId: number | null;
  totalBobot: number;
  isLoading: boolean;
  statusMessage: { type: 'success' | 'error'; text: string } | null;
  setStatusMessage: (msg: { type: 'success' | 'error'; text: string } | null) => void;
  currentPeriode: PeriodeOption | null;
  handlePeriodeChange: (id: number) => void;
  // Modal Form
  isModalOpen: boolean;
  setIsModalOpen: (val: boolean) => void;
  isSubmitting: boolean;
  editingItem: KriteriaItem | null;
  formPeriodeId: number;
  setFormPeriodeId: (val: number) => void;
  formNamaKriteria: string;
  setFormNamaKriteria: (val: string) => void;
  formJenis: string;
  setFormJenis: (val: string) => void;
  formCustomJenis: string;
  setFormCustomJenis: (val: string) => void;
  formMetodeNilai: string;
  setFormMetodeNilai: (val: string) => void;
  formNilaiMaksimal: string;
  setFormNilaiMaksimal: (val: string) => void;
  formBobot: string;
  setFormBobot: (val: string) => void;
  formStatus: boolean;
  setFormStatus: (val: boolean) => void;
  formIsToefl: boolean;
  setFormIsToefl: (val: boolean) => void;
  handleOpenCreate: () => void;
  handleOpenEdit: (item: KriteriaItem) => void;
  handleSubmitForm: (e: React.FormEvent) => Promise<void>;
  // Delete confirm
  deleteTarget: KriteriaItem | null;
  setDeleteTarget: (target: KriteriaItem | null) => void;
  isDeleting: boolean;
  handleDeleteConfirm: () => Promise<void>;
  // Copy Modal
  isCopyModalOpen: boolean;
  setIsCopyModalOpen: (val: boolean) => void;
  copySourcePeriode: string;
  setCopySourcePeriode: (val: string) => void;
  copyTargetPeriode: string;
  setCopyTargetPeriode: (val: string) => void;
  copyMode: 'append' | 'replace';
  setCopyMode: (val: 'append' | 'replace') => void;
  isCopying: boolean;
  handleOpenCopyModal: () => void;
  handleExecuteCopy: (e: React.FormEvent) => Promise<void>;
  // Rubrik Bahasa
  rubrikInggris: any[];
  setRubrikInggris: React.Dispatch<React.SetStateAction<any[]>>;
  bonusArab: { toafl_min: number; skor_tambahan_toafl: number; skor_tambahan_lisan: number };
  setBonusArab: React.Dispatch<React.SetStateAction<{ toafl_min: number; skor_tambahan_toafl: number; skor_tambahan_lisan: number }>>;
  isSavingRubrik: boolean;
  rubrikStatusMessage: { type: 'success' | 'error'; text: string } | null;
  setRubrikStatusMessage: (msg: { type: 'success' | 'error'; text: string } | null) => void;
  handleSaveRubrik: () => Promise<void>;
}

export function AdminKriteriaView({
  kriteriaList,
  periodes,
  selectedPeriodeId,
  totalBobot,
  isLoading,
  statusMessage,
  setStatusMessage,
  currentPeriode,
  handlePeriodeChange,
  isModalOpen,
  setIsModalOpen,
  isSubmitting,
  editingItem,
  formPeriodeId,
  setFormPeriodeId,
  formNamaKriteria,
  setFormNamaKriteria,
  formJenis,
  setFormJenis,
  formCustomJenis,
  setFormCustomJenis,
  formMetodeNilai,
  setFormMetodeNilai,
  formNilaiMaksimal,
  setFormNilaiMaksimal,
  formBobot,
  setFormBobot,
  formIsToefl,
  setFormIsToefl,
  handleOpenCreate,
  handleOpenEdit,
  handleSubmitForm,
  deleteTarget,
  setDeleteTarget,
  isDeleting,
  handleDeleteConfirm,
  isCopyModalOpen,
  setIsCopyModalOpen,
  copySourcePeriode,
  setCopySourcePeriode,
  copyTargetPeriode,
  setCopyTargetPeriode,
  copyMode,
  setCopyMode,
  isCopying,
  handleOpenCopyModal,
  handleExecuteCopy,
  rubrikInggris,
  setRubrikInggris,
  bonusArab,
  setBonusArab,
  isSavingRubrik,
  rubrikStatusMessage,
  setRubrikStatusMessage,
  handleSaveRubrik,
}: AdminKriteriaViewProps) {
  const getJenisBadgeColor = (jenis: string) => {
    switch (jenis.toLowerCase()) {
      case 'akademik':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'kompetensi':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'non-akademik':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'substansi':
        return 'bg-purple-50 text-purple-700 border-purple-200';
      case 'administratif':
        return 'bg-slate-100 text-slate-700 border-slate-300';
      default:
        return 'bg-teal-50 text-teal-700 border-teal-200';
    }
  };

  return (
    <div className="w-full max-w-7xl space-y-6 pb-12 font-sans">
      {/* ── Top Header Area ── */}
      <PageHeader
        title="KELOLA KRITERIA DAN BOBOT"
        subtitle="KULIAH KERJA NYATA INTERNASIONAL"
        description="Atur kriteria penilaian dan bobot nilai untuk sistem seleksi."
        action={
          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={handleOpenCopyModal}
              className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl border border-emerald-300 bg-white hover:bg-emerald-50 text-[#0E4A3E] text-xs font-bold transition-all shadow-xs cursor-pointer hover:scale-102"
              title="Salin paket kriteria seleksi dari periode/gelombang lain"
            >
              <Copy className="w-4 h-4 text-[#0E4A3E]" />
              <span>Tarik dari Gelombang Lain</span>
            </button>

            <button onClick={handleOpenCreate} className="btn-primary-add">
              <Plus className="w-4 h-4 stroke-[3]" />
              <span>Tambah Kriteria</span>
            </button>
          </div>
        }
      />

      {/* ── Periode Selector & Quick Info Bar ── */}
      <FilterBar
        actions={
          <div className="flex items-center gap-3 shrink-0">
            {currentPeriode && (
              <span
                className={`text-xs font-bold px-3 py-1 rounded-full border ${
                  currentPeriode.status === 'Aktif'
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                    : currentPeriode.status === 'Selesai'
                    ? 'bg-red-50 text-red-700 border-red-200'
                    : 'bg-slate-100 text-slate-600 border-slate-200'
                }`}
              >
                Status Periode: {currentPeriode.status}
              </span>
            )}
            <span className="text-xs font-bold text-slate-500 bg-slate-100 px-3 py-1.5 rounded-full border border-slate-200">
              {kriteriaList.length} Kriteria Terdaftar
            </span>
          </div>
        }
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#0E4A3E]/10 flex items-center justify-center text-[#0E4A3E] shrink-0">
            <Calendar className="w-5 h-5" />
          </div>
          <div>
            <label htmlFor="periode-select" className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
              Pilih Periode KKN
            </label>
            <select
              id="periode-select"
              value={selectedPeriodeId || ''}
              onChange={(e) => handlePeriodeChange(Number(e.target.value))}
              className="bg-transparent font-bold text-sm sm:text-base text-slate-800 focus:outline-none cursor-pointer pr-4"
            >
              {periodes.map((p) => (
                <option key={p.id_periode} value={p.id_periode}>
                  {p.nama_periode} ({p.tahun}) {p.status === 'Aktif' ? '• [Aktif]' : `• [${p.status}]`}
                </option>
              ))}
            </select>
          </div>
        </div>
      </FilterBar>

      {/* ── Status Message Alert / Toast ── */}
      <AlertBanner message={statusMessage} onClose={() => setStatusMessage(null)} />

      {/* ── Main Table Card matching Figma Design ── */}
      <div className="kkn-table-card">
        <div className="kkn-table-scroll">
          <div className="kkn-table-inner">
        {/* Table Header Bar */}
        <div className="kkn-table-header">
          <div className="kkn-table-header-grid">
            <span className="col-span-1 text-center">No</span>
            <span className="col-span-4">Nama Kriteria</span>
            <span className="col-span-2">Jenis Kriteria</span>
            <span className="col-span-3">Metode Penilaian & Skala</span>
            <span className="col-span-1 text-center">Bobot</span>
            <span className="col-span-1 text-center">Aksi</span>
          </div>
        </div>

        {/* Table Content Rows */}
        {isLoading ? (
          <div className="py-16 flex flex-col items-center justify-center text-slate-400 gap-2">
            <RefreshCw className="w-6 h-6 animate-spin text-[#0E4A3E]" />
            <span className="text-xs font-semibold">Memuat data kriteria seleksi...</span>
          </div>
        ) : kriteriaList.length === 0 ? (
          <div className="py-16 px-4 text-center">
            <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-3 text-slate-400">
              <SlidersHorizontal className="w-6 h-6" />
            </div>
            <p className="text-sm font-bold text-slate-700">Belum ada kriteria penilaian untuk periode ini</p>
            <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
              Silakan tambahkan kriteria seleksi dengan mengklik tombol{' '}
              <span className="font-bold text-[#0D6EFD]">+ Tambah Kriteria</span> di atas.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-slate-200">
            {kriteriaList.map((item, idx) => (
              <div key={item.id_kriteria} className="kkn-table-row">
                <span className="col-span-1 text-center font-bold text-slate-500">
                  {idx + 1}
                </span>

                <div className="col-span-4 pr-3">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-bold text-slate-800 leading-snug">{item.nama_kriteria}</p>
                    {isToeflKriteria(item) && (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-md bg-[#C0E6D8] text-[#0E4A3E] border border-emerald-300">
                        <Languages className="w-3 h-3 text-[#0E4A3E]" />
                        Kriteria TOEFL / Bahasa
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    ID #{item.id_kriteria} • {item.nama_periode}
                  </p>
                </div>

                <div className="col-span-2 pr-2">
                  <span
                    className={`inline-block font-semibold text-[11px] px-2.5 py-0.5 rounded-full border ${getJenisBadgeColor(
                      item.jenis
                    )}`}
                  >
                    {item.jenis}
                  </span>
                </div>

                <div className="col-span-3 pr-3 text-slate-700">
                  <p className="font-semibold text-slate-800">{item.metode_nilai}</p>
                  <span className="text-[11px] text-slate-400 block mt-0.5">
                    Nilai Maks: <span className="font-bold text-slate-600">{item.nilai_maksimal}</span>
                  </span>
                </div>

                <div className="col-span-1 text-center">
                  <span className="text-sm sm:text-base font-extrabold text-slate-800">
                    {item.bobot}
                  </span>
                  <span className="text-[11px] text-slate-400 ml-0.5">%</span>
                </div>

                <div className="col-span-1 flex items-center justify-center gap-2">
                  <button
                    onClick={() => handleOpenEdit(item)}
                    title="Edit Kriteria"
                    className="p-1.5 text-amber-500 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors cursor-pointer"
                  >
                    <Edit3 className="w-4 h-4 stroke-[2.2]" />
                  </button>

                  <button
                    onClick={() => setDeleteTarget(item)}
                    title="Hapus Kriteria"
                    className="p-1.5 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4 stroke-[2.2]" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
          </div>
        </div>
      </div>

      {/* ── Total Bobot Bar ── */}
      <div
        className={`rounded-2xl px-6 py-4.5 flex items-center justify-between border transition-all ${
          totalBobot === 100
            ? 'bg-[#C0E6D8] border-[#99d1c1] text-[#0E4A3E]'
            : totalBobot < 100
            ? 'bg-amber-50 border-amber-300 text-amber-900'
            : 'bg-red-50 border-red-300 text-red-900'
        }`}
      >
        <div className="flex items-center gap-2.5">
          {totalBobot === 100 ? (
            <div className="w-6 h-6 rounded-full bg-[#0E4A3E] text-white flex items-center justify-center shrink-0">
              <Check className="w-4 h-4 stroke-[3]" />
            </div>
          ) : (
            <div
              className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 ${
                totalBobot < 100 ? 'bg-amber-600 text-white' : 'bg-red-600 text-white'
              }`}
            >
              <AlertTriangle className="w-4 h-4 stroke-[3]" />
            </div>
          )}
          <div>
            <span className="text-base sm:text-lg font-extrabold tracking-wide">
              Total Bobot
            </span>
            {totalBobot === 100 ? (
              <span className="ml-2 text-xs font-semibold opacity-85 hidden sm:inline">
                (Sempurna: 100% dialokasikan)
              </span>
            ) : totalBobot < 100 ? (
              <span className="ml-2 text-xs font-semibold opacity-90 hidden sm:inline">
                (Kurang {100 - totalBobot}% lagi untuk mencapai 100%)
              </span>
            ) : (
              <span className="ml-2 text-xs font-semibold opacity-90 hidden sm:inline">
                (Kelebihan {totalBobot - 100}%, bobot harus tepat 100%)
              </span>
            )}
          </div>
        </div>

        <div className="text-right">
          <span className="text-xl sm:text-2xl font-black tracking-tight">
            {totalBobot}%
          </span>
        </div>
      </div>

      {/* ── KONFIGURASI RUBRIK SKOR BAHASA ASING ── */}
      <div className="bg-white rounded-2xl border border-slate-300 shadow-sm p-6 space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#0E4A3E]/10 flex items-center justify-center text-[#0E4A3E] shrink-0">
              <Calculator className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="font-extrabold text-base text-[#0E4A3E]">
                  Standarisasi & Konfigurasi Rubrik Skor Bahasa Asing
                </h3>
                <span className="text-[10px] font-bold bg-[#C0E6D8] text-[#0E4A3E] px-2.5 py-0.5 rounded-full flex items-center gap-1 border border-emerald-300">
                  <Lock className="w-3 h-3" />
                  Terkunci di Staff (Otomatis Sistem)
                </span>
                {kriteriaList.some(isToeflKriteria) ? (
                  <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 px-2.5 py-0.5 rounded-full flex items-center gap-1 border border-emerald-300">
                    <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                    Aktif Digunakan di Periode Ini
                  </span>
                ) : (
                  <span className="text-[10px] font-bold bg-amber-50 text-amber-700 px-2.5 py-0.5 rounded-full flex items-center gap-1 border border-amber-300">
                    <AlertTriangle className="w-3 h-3 text-amber-600" />
                    Belum Ada Kriteria Bahasa di Periode Ini
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Admin dapat mengatur nilai skor (misal: 0, 20, 30, 40, 50) secara dinamis. Nilai ini dihitung otomatis oleh sistem dan staf pewawancara tidak dapat mengubahnya.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleSaveRubrik}
            disabled={isSavingRubrik}
            className="px-4 py-2 bg-[#0E4A3E] hover:bg-[#09352c] text-white text-xs font-bold rounded-xl transition-all shadow-xs flex items-center gap-2 cursor-pointer disabled:opacity-50 self-start sm:self-auto shrink-0"
          >
            {isSavingRubrik ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                <span>Menyimpan...</span>
              </>
            ) : (
              <>
                <Save className="w-3.5 h-3.5" />
                <span>Simpan Perubahan Skor Rubrik</span>
              </>
            )}
          </button>
        </div>

        {rubrikStatusMessage && (
          <div
            className={`p-3 rounded-xl border flex items-center justify-between gap-2 text-xs font-semibold ${
              rubrikStatusMessage.type === 'success'
                ? 'bg-emerald-50 border-emerald-300 text-emerald-800'
                : 'bg-red-50 border-red-300 text-red-800'
            }`}
          >
            <span>{rubrikStatusMessage.text}</span>
            <button onClick={() => setRubrikStatusMessage(null)}>
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Tabel Pengaturan Skor Jenjang Bahasa Inggris */}
        <div className="overflow-x-auto">
          <table className="w-full text-left divide-y divide-slate-200 text-xs">
            <thead className="bg-slate-50 font-bold text-slate-700">
              <tr>
                <th className="px-3.5 py-3 text-center">Tingkat</th>
                <th className="px-3.5 py-3">Predikat Kemahiran</th>
                <th className="px-3.5 py-3">Rentang TOEFL</th>
                <th className="px-3.5 py-3">Rentang IELTS</th>
                <th className="px-3.5 py-3">Rentang TOEIC</th>
                <th className="px-3.5 py-3 text-center w-36">Skor Sistem (Dinamis)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-800">
              {rubrikInggris.map((item, idx) => (
                <tr key={idx} className="hover:bg-slate-50">
                  <td className="px-3.5 py-3 text-center font-bold text-slate-500">
                    Jenjang {item.tingkat}
                  </td>
                  <td className="px-3.5 py-3 font-semibold text-slate-800">
                    {item.predikat}
                  </td>
                  <td className="px-3.5 py-3 font-mono text-slate-600">
                    {item.toeflLabel}
                  </td>
                  <td className="px-3.5 py-3 font-mono text-slate-600">
                    {item.ieltsLabel}
                  </td>
                  <td className="px-3.5 py-3 font-mono text-slate-600">
                    {item.toeicLabel}
                  </td>
                  <td className="px-3.5 py-3 text-center">
                    <div className="flex items-center justify-center gap-1.5">
                      <input
                        type="number"
                        min="0"
                        max="100"
                        value={item.skor}
                        onChange={(e) => {
                          const val = Math.max(0, Math.min(100, parseInt(e.target.value, 10) || 0));
                          setRubrikInggris((prev) => {
                            const clone = [...prev];
                            clone[idx] = { ...clone[idx], skor: val };
                            return clone;
                          });
                        }}
                        className="w-20 px-2 py-1.5 rounded-lg border border-slate-300 font-black text-center text-sm text-[#0E4A3E] focus:outline-none focus:ring-2 focus:ring-[#0E4A3E]"
                      />
                      <span className="text-[11px] font-bold text-slate-400">Poin</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Bonus Bahasa Arab */}
        <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
          <div>
            <span className="font-bold text-slate-800 block">
              Nilai Tambah Bahasa Arab (Opsional)
            </span>
            <p className="text-[11px] text-slate-500">
              Skor tambahan bagi mahasiswa yang memiliki TOAFL atau kemampuan muhadatsah lisan aktif.
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="text-slate-600 font-semibold">Bonus TOAFL (≥400):</span>
              <input
                type="number"
                min="0"
                max="30"
                value={bonusArab.skor_tambahan_toafl}
                onChange={(e) =>
                  setBonusArab((prev) => ({
                    ...prev,
                    skor_tambahan_toafl: parseInt(e.target.value, 10) || 0,
                  }))
                }
                className="w-16 px-2 py-1 rounded-lg border border-slate-300 font-bold text-center text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0E4A3E]"
              />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-slate-600 font-semibold">Bonus Lisan Aktif:</span>
              <input
                type="number"
                min="0"
                max="20"
                value={bonusArab.skor_tambahan_lisan}
                onChange={(e) =>
                  setBonusArab((prev) => ({
                    ...prev,
                    skor_tambahan_lisan: parseInt(e.target.value, 10) || 0,
                  }))
                }
                className="w-16 px-2 py-1 rounded-lg border border-slate-300 font-bold text-center text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0E4A3E]"
              />
            </div>
          </div>
        </div>
      </div>

      {/* ── CREATE / EDIT MODAL ── */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg border border-slate-200 overflow-hidden">
            {/* Header */}
            <div className="bg-[#0E4A3E] text-white px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <SlidersHorizontal className="w-5 h-5 text-emerald-300" />
                <h3 className="font-bold text-base">
                  {editingItem ? 'Edit Kriteria Penilaian' : 'Tambah Kriteria Penilaian'}
                </h3>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-white/80 hover:text-white p-1 hover:bg-white/10 rounded-lg transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmitForm} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Periode KKN <span className="text-red-500">*</span>
                </label>
                <select
                  disabled={!!editingItem}
                  value={formPeriodeId}
                  onChange={(e) => setFormPeriodeId(Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm font-semibold text-slate-800 bg-white focus:outline-none focus:ring-2 focus:ring-[#0E4A3E] disabled:bg-slate-100 disabled:text-slate-500 cursor-pointer"
                >
                  {periodes.map((p) => (
                    <option key={p.id_periode} value={p.id_periode}>
                      {p.nama_periode} ({p.tahun})
                    </option>
                  ))}
                </select>
                {editingItem && (
                  <p className="text-[11px] text-slate-400 mt-1">Periode tidak dapat diubah saat mode edit.</p>
                )}
              </div>

              {/* Checkbox Penanda Kriteria TOEFL / Bahasa Asing */}
              <div className={`p-3.5 rounded-xl border transition-all ${
                formIsToefl ? 'bg-emerald-50/80 border-emerald-300 ring-2 ring-[#0E4A3E]/10' : 'bg-slate-50 border-slate-200 hover:bg-slate-100/70'
              }`}>
                <label className="flex items-start gap-3 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={formIsToefl}
                    onChange={(e) => {
                      const checked = e.target.checked;
                      setFormIsToefl(checked);
                      if (checked) {
                        if (!formNamaKriteria || formNamaKriteria.trim() === '' || formNamaKriteria.includes('Indeks Prestasi')) {
                          setFormNamaKriteria('Kemampuan Bahasa Asing (TOEFL/IELTS)');
                        }
                        setFormJenis('Kompetensi');
                        setFormMetodeNilai('Konversi Skor TOEFL');
                      }
                    }}
                    className="mt-0.5 w-4 h-4 rounded text-[#0E4A3E] focus:ring-[#0E4A3E] border-slate-300 cursor-pointer"
                  />
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-extrabold text-[#0E4A3E]">
                        Tandai sebagai Kriteria Kemampuan Bahasa Asing (TOEFL / IELTS)
                      </span>
                      {formIsToefl && (
                        <span className="text-[10px] font-bold bg-[#C0E6D8] text-[#0E4A3E] px-2 py-0.5 rounded-full border border-emerald-300">
                          ✓ Terhubung Rubrik
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">
                      Centang opsi ini jika kriteria ini menilai TOEFL / IELTS / kemampuan bahasa. Sistem akan otomatis mengatur kategori, metode penilaian, dan menghubungkannya ke rubrik standarisasi skor seleksi.
                    </p>
                  </div>
                </label>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Nama Kriteria Seleksi <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Indeks Prestasi Kumulatif (IPK)"
                  value={formNamaKriteria}
                  onChange={(e) => setFormNamaKriteria(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0E4A3E]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Jenis / Kategori <span className="text-red-500">*</span>
                </label>
                <select
                  value={formJenis}
                  onChange={(e) => setFormJenis(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm font-semibold text-slate-800 bg-white focus:outline-none focus:ring-2 focus:ring-[#0E4A3E] cursor-pointer"
                >
                  {JENIS_KRITERIA_OPTIONS.map((j) => (
                    <option key={j} value={j}>
                      {j}
                    </option>
                  ))}
                </select>
                {formJenis === 'Lainnya' && (
                  <input
                    type="text"
                    required
                    placeholder="Masukkan jenis kriteria lainnya..."
                    value={formCustomJenis}
                    onChange={(e) => setFormCustomJenis(e.target.value)}
                    className="w-full mt-2 px-3.5 py-2 rounded-xl border border-slate-300 text-xs sm:text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0E4A3E]"
                  />
                )}
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Metode Penilaian <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  list="metode-presets"
                  required
                  placeholder="Pilih atau ketik metode penilaian..."
                  value={formMetodeNilai}
                  onChange={(e) => setFormMetodeNilai(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0E4A3E]"
                />
                <datalist id="metode-presets">
                  {METODE_NILAI_PRESETS.map((m) => (
                    <option key={m} value={m} />
                  ))}
                </datalist>
                <p className="text-[11px] text-slate-400 mt-1">
                  Contoh: Konversi Skala 100, Penilaian Manual (Skala 1-100), Checklist Verifikasi
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Bobot (%) <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      step="any"
                      min="1"
                      max="100"
                      required
                      placeholder="20"
                      value={formBobot}
                      onChange={(e) => setFormBobot(e.target.value)}
                      className="w-full px-3.5 py-2.5 pr-8 rounded-xl border border-slate-300 text-xs sm:text-sm font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0E4A3E]"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">
                      %
                    </span>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Nilai Maksimal <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    step="any"
                    min="1"
                    required
                    placeholder="100"
                    value={formNilaiMaksimal}
                    onChange={(e) => setFormNilaiMaksimal(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0E4A3E]"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200 mt-6">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-slate-300 text-slate-700 font-bold text-xs sm:text-sm hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-2.5 rounded-xl bg-[#0D6EFD] hover:bg-[#0b5ed7] text-white font-bold text-xs sm:text-sm shadow-md transition-all hover:scale-102 active:scale-98 disabled:opacity-50 cursor-pointer flex items-center gap-2"
                >
                  {isSubmitting && <RefreshCw className="w-4 h-4 animate-spin" />}
                  <span>{editingItem ? 'Simpan Perubahan' : 'Tambah Kriteria'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── DELETE CONFIRMATION MODAL ── */}
      <ConfirmModal
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDeleteConfirm}
        title="Hapus Kriteria Seleksi?"
        itemName={deleteTarget ? `${deleteTarget.nama_kriteria} (Bobot: ${deleteTarget.bobot}%)` : undefined}
        description="Apakah Anda yakin ingin menghapus kriteria seleksi ini? Bobot nilai akan terhapus dan mempengaruhi total pembobotan periode ini."
        isProcessing={isDeleting}
      />

      {/* ── MODAL TARIK / SALIN KRITERIA DARI GELOMBANG LAIN ── */}
      {isCopyModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl sm:rounded-3xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="bg-[#0E4A3E] text-white p-5 sm:p-6 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center">
                  <Copy className="w-5 h-5 text-emerald-300" />
                </div>
                <div>
                  <h3 className="font-black text-base sm:text-lg leading-tight">
                    Tarik Kriteria dari Gelombang Lain
                  </h3>
                  <p className="text-white/70 text-xs mt-0.5">
                    Salin paket kriteria seleksi & pembobotan dari periode sebelumnya
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsCopyModalOpen(false)}
                className="text-white/80 hover:text-white p-1.5 hover:bg-white/10 rounded-xl transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleExecuteCopy} className="p-6 space-y-4">
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700">
                  Gelombang Asal (Sumber Kriteria) <span className="text-red-500">*</span>
                </label>
                <select
                  value={copySourcePeriode}
                  onChange={(e) => setCopySourcePeriode(e.target.value)}
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-xs sm:text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0E4A3E] cursor-pointer"
                >
                  <option value="" disabled>-- Pilih Gelombang Sumber --</option>
                  {periodes.map((p) => (
                    <option key={p.id_periode} value={String(p.id_periode)} disabled={String(p.id_periode) === copyTargetPeriode}>
                      {p.nama_periode} ({p.tahun}) {p.status === 'Aktif' ? '• [Aktif]' : `• [${p.status}]`}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700">
                  Gelombang Tujuan (Target Penyalinan) <span className="text-red-500">*</span>
                </label>
                <select
                  value={copyTargetPeriode}
                  onChange={(e) => setCopyTargetPeriode(e.target.value)}
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-xs sm:text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0E4A3E] cursor-pointer"
                >
                  <option value="" disabled>-- Pilih Gelombang Tujuan --</option>
                  {periodes.map((p) => (
                    <option key={p.id_periode} value={String(p.id_periode)} disabled={String(p.id_periode) === copySourcePeriode}>
                      {p.nama_periode} ({p.tahun}) {p.status === 'Aktif' ? '• [Aktif]' : `• [${p.status}]`}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5 pt-1">
                <label className="block text-xs font-bold text-slate-700">Metode Penarikan:</label>
                <div className="space-y-2 text-xs">
                  <label className="flex items-start gap-2.5 p-3 rounded-xl border border-emerald-300 bg-emerald-50/40 hover:bg-emerald-50 cursor-pointer transition-colors">
                    <input
                      type="radio"
                      name="copyKriteriaMode"
                      value="replace"
                      checked={copyMode === 'replace'}
                      onChange={() => setCopyMode('replace')}
                      className="mt-0.5 text-[#0E4A3E] focus:ring-[#0E4A3E]"
                    />
                    <div>
                      <span className="font-bold text-[#0E4A3E]">
                        Ganti & Samakan Semua Kriteria (Direkomendasikan)
                      </span>
                      <p className="text-slate-500 text-[11px] mt-0.5">
                        Menghapus kriteria lama di gelombang tujuan dan menggantinya dengan paket kriteria lengkap dari gelombang asal sehingga total bobot tepat 100%.
                      </p>
                    </div>
                  </label>

                  <label className="flex items-start gap-2.5 p-3 rounded-xl border border-slate-200 hover:bg-slate-50 cursor-pointer transition-colors">
                    <input
                      type="radio"
                      name="copyKriteriaMode"
                      value="append"
                      checked={copyMode === 'append'}
                      onChange={() => setCopyMode('append')}
                      className="mt-0.5 text-[#0E4A3E] focus:ring-[#0E4A3E]"
                    />
                    <div>
                      <span className="font-bold text-slate-800">
                        Tambahkan yang Belum Ada
                      </span>
                      <p className="text-slate-500 text-[11px] mt-0.5">
                        Menambahkan kriteria baru yang belum ada di gelombang tujuan tanpa menghapus kriteria yang sudah dibuat sebelumnya.
                      </p>
                    </div>
                  </label>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200 mt-2">
                <button
                  type="button"
                  onClick={() => setIsCopyModalOpen(false)}
                  disabled={isCopying}
                  className="px-5 py-2.5 rounded-xl border border-slate-300 text-slate-700 text-xs sm:text-sm font-bold hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isCopying || !copySourcePeriode || !copyTargetPeriode}
                  className="px-6 py-2.5 rounded-xl bg-[#0E4A3E] hover:bg-[#0a382f] text-white text-xs sm:text-sm font-bold shadow-md transition-all hover:scale-102 active:scale-98 disabled:opacity-50 flex items-center gap-2 cursor-pointer"
                >
                  {isCopying ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Copy className="w-4 h-4" />}
                  <span>{isCopying ? 'Menyalin Kriteria...' : 'Tarik & Salin Kriteria'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
