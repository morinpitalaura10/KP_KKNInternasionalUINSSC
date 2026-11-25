'use client';

import React from 'react';
import {
  Plus,
  Edit3,
  Trash2,
  X,
  RefreshCw,
  FileCheck,
  FileText,
  Copy,
  Sparkles,
} from 'lucide-react';
import { PageHeader, StatCardMint, AlertBanner, ConfirmModal, FilterBar } from '@/components/ui';

export interface PeriodeOption {
  id: number;
  nama: string;
  tahunAkademik: string;
  status?: string;
}

export interface PersyaratanItem {
  id: number;
  id_persyaratan: number;
  id_periode: number;
  nama_persyaratan: string;
  deskripsi: string;
  format_file: string;
  ukuran_maksimal: number;
  wajib: boolean;
  status: boolean;
  nama_periode: string | null;
}

export const TEMPLATES = [
  {
    nama: 'Curriculum Vitae (CV) & Portfolio',
    deskripsi: 'Persyaratan wajib dokumen Curriculum Vitae (CV) & Portfolio pendaftar',
    format: 'pdf',
    ukuran: '2048',
    wajib: true,
  },
  {
    nama: 'Transkrip Nilai Sementara (IPK >= 3.50)',
    deskripsi: 'Persyaratan wajib dokumen Transkrip Nilai Sementara resmi dari SIAKAD',
    format: 'pdf',
    ukuran: '2048',
    wajib: true,
  },
  {
    nama: 'Sertifikat Kemampuan Bahasa Asing (TOEFL/IELTS/TOAFL)',
    deskripsi: 'Sertifikat kecakapan bahasa Inggris (TOEFL/IELTS/TOEIC) atau bahasa Arab (TOAFL)',
    format: 'pdf',
    ukuran: '2048',
    wajib: true,
  },
  {
    nama: 'Surat Rekomendasi Ketua Jurusan / Dekan',
    deskripsi: 'Surat rekomendasi resmi dari pimpinan jurusan atau fakultas mahasiswa',
    format: 'pdf',
    ukuran: '2048',
    wajib: true,
  },
  {
    nama: 'Surat Persetujuan / Izin Orang Tua / Wali',
    deskripsi: 'Surat pernyataan izin dan persetujuan resmi dari orang tua atau wali mahasiswa',
    format: 'pdf',
    ukuran: '2048',
    wajib: true,
  },
  {
    nama: 'Pas Foto Formal Background Merah 4x6',
    deskripsi: 'Pas foto resmi terbaru pendaftar berlatar belakang merah ukuran 4x6',
    format: 'jpg,png',
    ukuran: '1024',
    wajib: true,
  },
];

export interface AdminPersyaratanViewProps {
  items: PersyaratanItem[];
  periodes: PeriodeOption[];
  isLoading: boolean;
  statusMessage: { type: 'success' | 'error'; text: string } | null;
  setStatusMessage: (msg: { type: 'success' | 'error'; text: string } | null) => void;
  // Search & Filter
  searchQuery: string;
  setSearchQuery: (val: string) => void;
  filterPeriode: string;
  setFilterPeriode: (val: string) => void;
  filterStatus: 'semua' | 'aktif' | 'nonaktif';
  setFilterStatus: (val: 'semua' | 'aktif' | 'nonaktif') => void;
  filteredItems: PersyaratanItem[];
  scopedItems: PersyaratanItem[];
  activeFilteredPeriode: PeriodeOption | null;
  totalPersyaratan: number;
  totalAktif: number;
  totalWajib: number;
  totalOpsional: number;
  formatFileSize: (kb: number) => string;
  // Modals
  isModalOpen: boolean;
  setIsModalOpen: (val: boolean) => void;
  isSubmitting: boolean;
  editingId: number | null;
  idPeriode: string;
  setIdPeriode: (val: string) => void;
  namaPersyaratan: string;
  setNamaPersyaratan: (val: string) => void;
  deskripsi: string;
  setDeskripsi: (val: string) => void;
  formatFile: string;
  setFormatFile: (val: string) => void;
  ukuranMaksimal: string;
  setUkuranMaksimal: (val: string) => void;
  wajib: boolean;
  setWajib: (val: boolean) => void;
  handleOpenCreate: () => void;
  handleOpenEdit: (item: PersyaratanItem) => void;
  handleApplyTemplate: (tmpl: typeof TEMPLATES[0]) => void;
  handleSubmit: (e: React.FormEvent) => Promise<void>;
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
  // Toggle Status
  togglingId: number | null;
  handleToggleStatus: (item: PersyaratanItem) => Promise<void>;
  // Delete confirm
  deleteTarget: PersyaratanItem | null;
  setDeleteTarget: (val: PersyaratanItem | null) => void;
  isDeleting: boolean;
  handleDeleteConfirm: () => Promise<void>;
}

export function AdminPersyaratanView({
  items,
  periodes,
  isLoading,
  statusMessage,
  setStatusMessage,
  searchQuery,
  setSearchQuery,
  filterPeriode,
  setFilterPeriode,
  filterStatus,
  setFilterStatus,
  filteredItems,
  scopedItems,
  activeFilteredPeriode,
  totalPersyaratan,
  totalAktif,
  totalWajib,
  totalOpsional,
  formatFileSize,
  isModalOpen,
  setIsModalOpen,
  isSubmitting,
  editingId,
  idPeriode,
  setIdPeriode,
  namaPersyaratan,
  setNamaPersyaratan,
  deskripsi,
  setDeskripsi,
  formatFile,
  setFormatFile,
  ukuranMaksimal,
  setUkuranMaksimal,
  wajib,
  setWajib,
  handleOpenCreate,
  handleOpenEdit,
  handleApplyTemplate,
  handleSubmit,
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
  togglingId,
  handleToggleStatus,
  deleteTarget,
  setDeleteTarget,
  isDeleting,
  handleDeleteConfirm,
}: AdminPersyaratanViewProps) {
  return (
    <div className="w-full max-w-7xl space-y-6 pb-12 font-sans">
      {/* ── Header ── */}
      <PageHeader
        title="KELOLA PERSYARATAN BERKAS"
        subtitle="KULIAH KERJA NYATA INTERNASIONAL"
        description="Kelola kelengkapan dokumen persyaratan berkas pendaftaran KKN Internasional yang wajib diunggah oleh mahasiswa."
        action={
          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={handleOpenCopyModal}
              className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl border border-emerald-300 bg-white hover:bg-emerald-50 text-[#0E4A3E] text-xs font-bold transition-all shadow-xs cursor-pointer hover:scale-102"
              title="Salin dokumen persyaratan dari periode/gelombang sebelumnya"
            >
              <Copy className="w-4 h-4 text-[#0E4A3E]" />
              <span>Tarik dari Periode Lain</span>
            </button>

            <button onClick={handleOpenCreate} className="btn-primary-add">
              <Plus className="w-4 h-4 stroke-[3]" />
              <span>Tambah Dokumen</span>
            </button>
          </div>
        }
      />

      {/* ── Status Message ── */}
      <AlertBanner message={statusMessage} onClose={() => setStatusMessage(null)} />

      {/* ── Main Content: Dokumen Persyaratan ── */}
      <div className="space-y-6">
        {/* Stat Cards - Berubah dinamis mengikuti periode yang difilter */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          <StatCardMint
            value={totalPersyaratan}
            label="Total Persyaratan"
            subLabel={activeFilteredPeriode ? activeFilteredPeriode.nama : 'Keseluruhan berkas'}
          />
          <StatCardMint
            value={totalAktif}
            label="Aktif"
            subLabel={activeFilteredPeriode ? 'Aktif di periode ini' : 'Ditampilkan ke publik'}
          />
          <StatCardMint
            value={totalWajib}
            label="Wajib"
            subLabel={activeFilteredPeriode ? 'Wajib periode ini' : 'Harus diunggah'}
          />
          <StatCardMint
            value={totalOpsional}
            label="Opsional"
            subLabel={activeFilteredPeriode ? 'Opsional periode ini' : 'Tidak wajib diunggah'}
          />
        </div>

        {/* Search & Filter Bar - Mendukung Filter per Gelombang / Periode */}
        <FilterBar
          searchValue={searchQuery}
          onSearchChange={setSearchQuery}
          searchPlaceholder="Cari nama atau deskripsi persyaratan..."
          searchWidth="flex-1"
          filters={[
            {
              value: filterPeriode,
              onChange: (val) => setFilterPeriode(val),
              options: [
                { value: 'semua', label: 'Semua Gelombang / Periode' },
                ...periodes.map((p) => ({
                  value: String(p.id),
                  label: `${p.nama} (${p.tahunAkademik})${p.status === 'Aktif' ? ' — [Aktif]' : ''}`,
                })),
              ],
            },
            {
              value: filterStatus,
              onChange: (val) => setFilterStatus(val as 'semua' | 'aktif' | 'nonaktif'),
              options: [
                { value: 'semua', label: 'Semua Status' },
                { value: 'aktif', label: 'Aktif' },
                { value: 'nonaktif', label: 'Nonaktif' },
              ],
            },
          ]}
          countBadge={filteredItems.length}
          countLabel="berkas"
        />

        {/* Banner CTA Bantuan jika Gelombang yang dipilih masih kosong berkasnya */}
        {activeFilteredPeriode && scopedItems.length === 0 && (
          <div className="bg-[#E8F5F1] border-2 border-[#a8d5c2] rounded-2xl p-5 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm animate-in fade-in duration-200">
            <div className="flex items-center gap-3.5">
              <div className="w-11 h-11 rounded-2xl bg-[#0E4A3E] text-white flex items-center justify-center shrink-0 shadow-md">
                <FileCheck className="w-6 h-6 text-emerald-300" />
              </div>
              <div>
                <h4 className="font-bold text-sm sm:text-base text-[#0E4A3E]">
                  {activeFilteredPeriode.nama} Belum Memiliki Dokumen Persyaratan
                </h4>
                <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">
                  Tarik berkas standar dari gelombang/periode sebelumnya dengan 1-klik, atau tambah berkas baru secara manual.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0 w-full sm:w-auto">
              <button
                type="button"
                onClick={handleOpenCopyModal}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#0E4A3E] hover:bg-[#0a382f] text-white text-xs font-bold transition-all shadow-md cursor-pointer hover:scale-102"
              >
                <Copy className="w-4 h-4" />
                <span>Salin dari Periode Sebelumnya</span>
              </button>
              <button
                type="button"
                onClick={handleOpenCreate}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold transition-all shadow-xs cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Buat Manual</span>
              </button>
            </div>
          </div>
        )}

        {/* Table Card */}
        <div className="kkn-table-card">
          <div className="kkn-table-scroll">
            <div className="kkn-table-inner">
          <div className="kkn-table-header">
            <div className="kkn-table-header-grid">
              <div className="col-span-1 text-center">No</div>
              <div className="col-span-4">Nama Persyaratan</div>
              <div className="col-span-2 text-center">Format & Ukuran</div>
              <div className="col-span-2 text-center">Sifat</div>
              <div className="col-span-1 text-center">Status</div>
              <div className="col-span-2 text-center">Aksi</div>
            </div>
          </div>

          <div className="divide-y divide-slate-100">
            {isLoading ? (
              <div className="py-16 text-center text-slate-400 flex flex-col items-center justify-center gap-3">
                <RefreshCw className="w-8 h-8 animate-spin text-[#0E4A3E]" />
                <span className="text-sm font-medium">Memuat data persyaratan dari database MySQL...</span>
              </div>
            ) : filteredItems.length === 0 ? (
              <div className="py-16 text-center text-slate-400">
                <FileText className="w-12 h-12 mx-auto mb-3 opacity-30 text-slate-400" />
                <span className="text-sm font-medium">
                  {filterPeriode !== 'semua'
                    ? `Tidak ada persyaratan ditemukan untuk ${activeFilteredPeriode?.nama || 'periode ini'}.`
                    : 'Tidak ada persyaratan ditemukan.'}
                </span>
              </div>
            ) : (
              filteredItems.map((item, idx) => (
                <div key={item.id} className="kkn-table-row">
                  <div className="col-span-1 text-center font-bold text-slate-400">{idx + 1}</div>

                  <div className="col-span-4 pr-4">
                    <p className="font-bold text-slate-800 leading-snug">{item.nama_persyaratan}</p>
                    <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">{item.deskripsi}</p>
                    {item.nama_periode && (
                      <span className="inline-block mt-1.5 text-[10px] font-semibold text-[#0E4A3E] bg-[#E8F5F1] border border-[#C0E6D8] px-2 py-0.5 rounded">
                        Periode: {item.nama_periode}
                      </span>
                    )}
                  </div>

                  <div className="col-span-2 text-center space-y-1">
                    <span className="inline-block px-2.5 py-0.5 bg-slate-100 text-slate-700 font-mono text-xs font-bold rounded uppercase">
                      .{item.format_file}
                    </span>
                    <p className="text-[11px] text-slate-500">Maks. {formatFileSize(item.ukuran_maksimal)}</p>
                  </div>

                  <div className="col-span-2 text-center">
                    <span
                      className={`inline-block px-3 py-1 rounded-full text-xs font-extrabold ${
                        item.wajib
                          ? 'bg-red-50 text-red-600 border border-red-200'
                          : 'bg-slate-100 text-slate-600 border border-slate-200'
                      }`}
                    >
                      {item.wajib ? 'Wajib' : 'Opsional'}
                    </span>
                  </div>

                  <div className="col-span-1 flex flex-col items-center justify-center gap-1">
                    <button
                      type="button"
                      role="switch"
                      aria-checked={item.status}
                      onClick={() => handleToggleStatus(item)}
                      disabled={togglingId === item.id}
                      className={`group relative inline-flex h-5 w-9 shrink-0 cursor-pointer items-center rounded-full transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-[#0E4A3E] focus:ring-offset-1 disabled:opacity-50 ${
                        item.status ? 'bg-[#0E4A3E]' : 'bg-slate-300 hover:bg-slate-400'
                      }`}
                      title={item.status ? 'Klik untuk nonaktifkan' : 'Klik untuk aktifkan'}
                    >
                      <span className="sr-only">Toggle Status Persyaratan</span>
                      <span
                        className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow-md transition duration-200 ease-in-out ${
                          item.status ? 'translate-x-4' : 'translate-x-1'
                        }`}
                      />
                    </button>
                    <span className={`text-[9px] font-bold tracking-tight ${item.status ? 'text-emerald-700' : 'text-slate-400'}`}>
                      {togglingId === item.id ? '...' : item.status ? 'Aktif' : 'Nonaktif'}
                    </span>
                  </div>

                  <div className="col-span-2 flex items-center justify-center gap-2">
                    <button
                      onClick={() => handleOpenEdit(item)}
                      className="p-1.5 rounded-lg text-amber-600 hover:bg-amber-50 hover:text-amber-700 transition-colors cursor-pointer"
                      title="Edit persyaratan"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setDeleteTarget(item)}
                      className="p-1.5 rounded-lg text-red-500 hover:bg-red-50 hover:text-red-700 transition-colors cursor-pointer"
                      title="Hapus persyaratan"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Modal Tarik / Salin Dokumen dari Periode Sebelumnya ── */}
      {isCopyModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-xl overflow-hidden animate-in fade-in zoom-in duration-150">
            {/* Header Modal */}
            <div className="bg-[#0E4A3E] text-white px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <Copy className="w-5 h-5 text-emerald-300" />
                <div>
                  <h3 className="font-extrabold text-sm sm:text-base">
                    Tarik Dokumen dari Periode Sebelumnya
                  </h3>
                  <p className="text-[11px] text-emerald-200">
                    Salin kelengkapan berkas dari gelombang/periode lain secara instan
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsCopyModalOpen(false)}
                className="text-white/80 hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleExecuteCopy} className="p-6 space-y-4">
              {/* Periode Asal (Sumber) */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  1. Pilih Periode Sumber (Asal Berkas) *
                </label>
                <select
                  value={copySourcePeriode}
                  onChange={(e) => setCopySourcePeriode(e.target.value)}
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm font-semibold text-slate-800 focus:outline-none focus:ring-1 focus:ring-[#0E4A3E]"
                >
                  <option value="">-- Pilih Periode Asal --</option>
                  {periodes.map((p) => {
                    const count = items.filter((i) => i.id_periode === p.id).length;
                    return (
                      <option key={p.id} value={p.id}>
                        {p.nama} ({p.tahunAkademik}){p.status === 'Aktif' ? ' — [Aktif]' : ''} — {count} dokumen tersedia
                      </option>
                    );
                  })}
                </select>
              </div>

              {/* Periode Tujuan (Target) */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  2. Pilih Periode Tujuan (Yang Akan Menerima Berkas) *
                </label>
                <select
                  value={copyTargetPeriode}
                  onChange={(e) => setCopyTargetPeriode(e.target.value)}
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm font-semibold text-slate-800 focus:outline-none focus:ring-1 focus:ring-[#0E4A3E]"
                >
                  <option value="">-- Pilih Periode Tujuan --</option>
                  {periodes.map((p) => {
                    const count = items.filter((i) => i.id_periode === p.id).length;
                    return (
                      <option key={p.id} value={p.id}>
                        {p.nama} ({p.tahunAkademik}){p.status === 'Aktif' ? ' — [Aktif]' : ''} {count > 0 ? `— saat ini ${count} dokumen` : '— (masih kosong)'}
                      </option>
                    );
                  })}
                </select>
              </div>

              {/* Preview Berkas Periode Sumber */}
              {copySourcePeriode && (
                <div className="bg-[#F2F8F5] border border-[#C0E6D8] rounded-xl p-3.5 space-y-2">
                  <div className="flex items-center justify-between text-xs font-bold text-[#0E4A3E]">
                    <span className="flex items-center gap-1.5">
                      <FileCheck className="w-4 h-4 text-emerald-600" />
                      Pratinjau Dokumen dari Periode Sumber:
                    </span>
                    <span className="bg-[#C0E6D8] text-[#0E4A3E] px-2 py-0.5 rounded-full text-[10px] font-extrabold">
                      {items.filter((i) => String(i.id_periode) === copySourcePeriode).length} Dokumen
                    </span>
                  </div>

                  <div className="max-h-36 overflow-y-auto space-y-1 pr-1 text-xs divide-y divide-[#C0E6D8]/60">
                    {items.filter((i) => String(i.id_periode) === copySourcePeriode).map((doc, idx) => (
                      <div key={doc.id} className="pt-1.5 first:pt-0 flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2 truncate">
                          <span className="w-5 h-5 rounded-full bg-[#0E4A3E] text-white text-[10px] font-bold flex items-center justify-center shrink-0">
                            {idx + 1}
                          </span>
                          <span className="font-semibold text-slate-800 truncate">{doc.nama_persyaratan}</span>
                        </div>
                        <div className="flex items-center gap-1.5 shrink-0">
                          {doc.wajib && (
                            <span className="text-[9px] font-bold uppercase text-red-600 bg-red-50 border border-red-200 px-1.5 py-0.2 rounded">
                              Wajib
                            </span>
                          )}
                          <span className="text-[10px] font-mono uppercase bg-white border border-[#C0E6D8] px-1.5 py-0.5 rounded text-slate-600">
                            .{doc.format_file}
                          </span>
                        </div>
                      </div>
                    ))}
                    {items.filter((i) => String(i.id_periode) === copySourcePeriode).length === 0 && (
                      <p className="text-xs text-amber-700 py-1 font-medium">
                        Periode asal yang dipilih belum memiliki berkas persyaratan untuk disalin.
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* Mode Salin Radio */}
              <div className="space-y-1.5 pt-1">
                <label className="block text-xs font-bold text-slate-700">Metode Penarikan:</label>
                <div className="space-y-2 text-xs">
                  <label className="flex items-start gap-2.5 p-3 rounded-xl border border-emerald-300 bg-emerald-50/40 hover:bg-emerald-50 cursor-pointer">
                    <input
                      type="radio"
                      name="copyMode"
                      value="append"
                      checked={copyMode === 'append'}
                      onChange={() => setCopyMode('append')}
                      className="mt-0.5 text-[#0E4A3E] focus:ring-[#0E4A3E]"
                    />
                    <div>
                      <span className="font-bold text-[#0E4A3E]">
                        Tambahkan yang Belum Ada (Direkomendasikan & Aman)
                      </span>
                      <p className="text-slate-500 text-[11px] mt-0.5">
                        Menyalin berkas yang belum ada di periode tujuan. Berkas yang sudah dibuat sebelumnya tidak akan terhapus.
                      </p>
                    </div>
                  </label>

                  <label className="flex items-start gap-2.5 p-3 rounded-xl border border-slate-200 hover:bg-slate-50 cursor-pointer">
                    <input
                      type="radio"
                      name="copyMode"
                      value="replace"
                      checked={copyMode === 'replace'}
                      onChange={() => setCopyMode('replace')}
                      className="mt-0.5 text-red-600 focus:ring-red-600"
                    />
                    <div>
                      <span className="font-bold text-slate-800">
                        Timpa Semua Dokumen di Periode Tujuan
                      </span>
                      <p className="text-slate-500 text-[11px] mt-0.5">
                        Menghapus dokumen lama di periode tujuan lalu menggantinya persis dengan dokumen dari periode sumber.
                      </p>
                    </div>
                  </label>
                </div>
              </div>

              {/* Actions Footer */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200 mt-4">
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
                  className="px-6 py-2.5 rounded-xl bg-[#0E4A3E] hover:bg-[#0a382f] text-white text-xs sm:text-sm font-bold shadow-md transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 flex items-center gap-2 cursor-pointer"
                >
                  {isCopying ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Copy className="w-4 h-4" />}
                  <span>{isCopying ? 'Menyalin Dokumen...' : 'Tarik & Salin Berkas'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Modal Create / Edit Dokumen ── */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-xl overflow-hidden animate-in fade-in zoom-in duration-150">
            <div className="bg-[#0E4A3E] text-white px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <FileCheck className="w-5 h-5 text-emerald-300" />
                <h3 className="font-extrabold text-sm sm:text-base">
                  {editingId ? 'Edit Dokumen Persyaratan' : 'Tambah Dokumen Persyaratan Baru'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="text-white/80 hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {/* Template Shortcut Buttons */}
              {!editingId && (
                <div className="bg-[#F2F8F5] border border-[#C0E6D8] rounded-xl p-3 space-y-2">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-[#0E4A3E]">
                    <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                    <span>Template Cepat (Klik untuk auto-fill):</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {TEMPLATES.map((tmpl) => (
                      <button
                        key={tmpl.nama}
                        type="button"
                        onClick={() => handleApplyTemplate(tmpl)}
                        className="text-[11px] font-semibold bg-white text-[#0E4A3E] hover:bg-emerald-100 border border-[#C0E6D8] px-2.5 py-1 rounded-lg transition-colors cursor-pointer text-left shadow-2xs"
                      >
                        + {tmpl.nama.split('(')[0].trim()}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Pilih Periode KKN *</label>
                <select
                  value={idPeriode}
                  onChange={(e) => setIdPeriode(e.target.value)}
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm font-semibold focus:outline-none focus:ring-1 focus:ring-[#0E4A3E]"
                >
                  <option value="">-- Pilih Periode Pendaftaran --</option>
                  {periodes.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.nama} ({p.tahunAkademik}){p.status === 'Aktif' ? ' — [Aktif]' : ''}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Nama Dokumen Persyaratan *</label>
                <input
                  type="text"
                  placeholder="Contoh: Scan KTP Asli / Transkrip Nilai / Surat Izin Orang Tua"
                  value={namaPersyaratan}
                  onChange={(e) => setNamaPersyaratan(e.target.value)}
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm font-medium focus:outline-none focus:ring-1 focus:ring-[#0E4A3E]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Deskripsi / Petunjuk Pengunggahan *</label>
                <textarea
                  rows={3}
                  placeholder="Jelaskan ketentuan berkas, legalitas, format tanda tangan, dll..."
                  value={deskripsi}
                  onChange={(e) => setDeskripsi(e.target.value)}
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm font-medium focus:outline-none focus:ring-1 focus:ring-[#0E4A3E] resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Format File *</label>
                  <input
                    type="text"
                    placeholder="Contoh: pdf atau jpg, png"
                    value={formatFile}
                    onChange={(e) => setFormatFile(e.target.value)}
                    required
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm font-medium focus:outline-none focus:ring-1 focus:ring-[#0E4A3E]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Ukuran Maksimal (KB)</label>
                  <input
                    type="number"
                    min="100"
                    max="20480"
                    value={ukuranMaksimal}
                    onChange={(e) => setUkuranMaksimal(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm font-medium focus:outline-none focus:ring-1 focus:ring-[#0E4A3E]"
                  />
                  <span className="text-[10px] text-slate-400 mt-0.5 block">2048 KB = 2 MB</span>
                </div>
              </div>

              <div className="flex items-center gap-3 pt-2">
                <label className="flex items-center gap-2 text-xs font-bold text-slate-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={wajib}
                    onChange={(e) => setWajib(e.target.checked)}
                    className="w-4 h-4 text-[#0E4A3E] rounded border-slate-300 focus:ring-[#0E4A3E]"
                  />
                  <span>Dokumen Wajib Diunggah (Harus ada untuk verifikasi)</span>
                </label>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200 mt-6">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  disabled={isSubmitting}
                  className="px-5 py-2.5 rounded-xl border border-slate-300 text-slate-700 text-xs sm:text-sm font-bold hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-2.5 rounded-xl bg-[#0D6EFD] hover:bg-[#0b5ed7] text-white text-xs sm:text-sm font-bold shadow-md transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 flex items-center gap-2 cursor-pointer"
                >
                  {isSubmitting && <RefreshCw className="w-4 h-4 animate-spin" />}
                  {isSubmitting ? 'Menyimpan...' : editingId ? 'Simpan Perubahan' : 'Simpan Dokumen'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Modal Confirm Delete Dokumen ── */}
      <ConfirmModal
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDeleteConfirm}
        title="Hapus Dokumen Persyaratan?"
        itemName={deleteTarget?.nama_persyaratan}
        description="Apakah Anda yakin ingin menghapus persyaratan dokumen ini? Tindakan ini tidak dapat dibatalkan dan dokumen terkait mungkin terpengaruh."
        isProcessing={isDeleting}
      />
    </div>
  );
}
