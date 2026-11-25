'use client';

import React from 'react';
import {
  Plus,
  Edit3,
  Trash2,
  X,
  RefreshCw,
  FileText,
  Calendar,
  Upload,
  Loader2,
} from 'lucide-react';
import PageHeader from '@/components/ui/PageHeader';
import AlertBanner from '@/components/ui/AlertBanner';
import ConfirmModal from '@/components/ui/ConfirmModal';
import FilterBar from '@/components/ui/FilterBar';

export interface SuratItem {
  id_surat: number;
  id_periode: number | null;
  id_pendaftaran: number | null;
  id_user: number;
  nama_surat: string;
  file_path: string;
  tanggal_upload: string | null;
  status: boolean;
  status_label: 'Publish' | 'Draft';
  nama_periode: string;
  nama_pembuat: string;
}

export interface PeriodeOption {
  id_periode: number;
  nama_periode: string;
  tahun: number;
  status: string;
}

export interface AdminSuratViewProps {
  items: SuratItem[];
  filteredItems: SuratItem[];
  periodes: PeriodeOption[];
  isLoading: boolean;
  statusMessage: { type: 'success' | 'error'; text: string } | null;
  setStatusMessage: (msg: { type: 'success' | 'error'; text: string } | null) => void;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  filterPeriode: string;
  setFilterPeriode: (p: string) => void;
  filterStatus: 'all' | 'publish' | 'draft';
  setFilterStatus: (s: 'all' | 'publish' | 'draft') => void;
  isModalOpen: boolean;
  setIsModalOpen: (open: boolean) => void;
  isSubmitting: boolean;
  editingItem: SuratItem | null;
  deleteTarget: SuratItem | null;
  setDeleteTarget: (item: SuratItem | null) => void;
  isDeleting: boolean;
  formNamaSurat: string;
  setFormNamaSurat: (n: string) => void;
  formPeriodeId: string;
  setFormPeriodeId: (p: string) => void;
  formFilePath: string;
  formStatus: boolean;
  setFormStatus: (s: boolean) => void;
  isUploadingTemplate: boolean;
  uploadedFileName: string;
  handleOpenCreate: () => void;
  handleOpenEdit: (item: SuratItem) => void;
  handleTemplateFileUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleSubmit: (e: React.FormEvent) => void;
  handleDeleteConfirm: () => void;
  formatDate: (dateStr: string | null) => string;
}

export default function AdminSuratView({
  items,
  filteredItems,
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
  isModalOpen,
  setIsModalOpen,
  isSubmitting,
  editingItem,
  deleteTarget,
  setDeleteTarget,
  isDeleting,
  formNamaSurat,
  setFormNamaSurat,
  formPeriodeId,
  setFormPeriodeId,
  formFilePath,
  formStatus,
  setFormStatus,
  isUploadingTemplate,
  uploadedFileName,
  handleOpenCreate,
  handleOpenEdit,
  handleTemplateFileUpload,
  handleSubmit,
  handleDeleteConfirm,
  formatDate,
}: AdminSuratViewProps) {
  return (
    <div className="w-full max-w-7xl space-y-6 pb-12 font-sans">
      {/* ── Top Header Area matching Archivo Black Design ── */}
      <PageHeader
        title="KELOLA SURAT DAN SK"
        subtitle="KULIAH KERJA NYATA INTERNASIONAL"
        description="Kelola surat keputusan dan dokumen pendukung KKN Internasional."
        action={
          <button onClick={handleOpenCreate} className="btn-primary-add">
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>Tambah Surat</span>
          </button>
        }
      />

      {/* ── Status Message Alert ── */}
      <AlertBanner message={statusMessage} onClose={() => setStatusMessage(null)} />

      {/* ── Search & Filter Bar ── */}
      <FilterBar
        searchValue={searchQuery}
        onSearchChange={setSearchQuery}
        searchPlaceholder="Cari nama dokumen / template surat..."
        searchWidth="flex-1 max-w-md"
        filters={[
          {
            value: filterPeriode,
            onChange: (val) => setFilterPeriode(val),
            options: [
              { value: 'all', label: 'Semua Gelombang / Periode' },
              ...periodes.map((p) => ({
                value: String(p.id_periode),
                label: `${p.nama_periode} (${p.tahun})${p.status === 'Aktif' ? ' [Aktif]' : ''}`,
              })),
            ],
          },
          {
            value: filterStatus,
            onChange: (val) => setFilterStatus(val as 'all' | 'publish' | 'draft'),
            options: [
              { value: 'all', label: 'Semua Status' },
              { value: 'publish', label: 'Publish' },
              { value: 'draft', label: 'Draft' },
            ],
          },
        ]}
      />

      {/* ── Main Table Card matching Figma Design ── */}
      <div className="kkn-table-card">
        <div className="kkn-table-scroll">
          <div className="kkn-table-inner">
        {/* Table Header Bar (#0E4A3E) */}
        <div className="kkn-table-header">
          <div className="kkn-table-header-grid">
            <span className="col-span-1 text-center">No</span>
            <span className="col-span-4">Nama Surat / Template</span>
            <span className="col-span-2">Periode</span>
            <span className="col-span-3">Tanggal Upload</span>
            <span className="col-span-1 text-center">Status</span>
            <span className="col-span-1 text-center">Aksi</span>
          </div>
        </div>

        {/* Table Content */}
        {isLoading ? (
          <div className="py-16 flex flex-col items-center justify-center text-slate-400 gap-2">
            <RefreshCw className="w-6 h-6 animate-spin text-[#0E4A3E]" />
            <span className="text-xs font-semibold">Memuat data template surat...</span>
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="py-16 text-center text-slate-500 text-sm">
            {items.length === 0 ? (
              <>
                Belum ada template surat. Klik <span className="font-bold text-[#0D6EFD]">+ Tambah Surat</span> untuk memulai.
              </>
            ) : (
              'Tidak ada template surat yang sesuai dengan filter pencarian.'
            )}
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {filteredItems.map((item, idx) => (
              <div key={item.id_surat} className="kkn-table-row">
                {/* 1. No */}
                <span className="col-span-1 text-center font-bold text-slate-500">{idx + 1}</span>

                {/* 2. Nama Surat */}
                <div className="col-span-4 pr-3">
                  <p className="font-bold text-slate-800 leading-snug">{item.nama_surat}</p>
                  <p className="text-[11px] text-slate-400 font-mono mt-0.5 truncate">{item.file_path}</p>
                </div>

                {/* 3. Periode */}
                <div className="col-span-2 pr-2">
                  {item.id_periode === null ? (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#E8F5F1] text-[#0E4A3E] border border-[#C0E6D8]">
                      Semua Periode
                    </span>
                  ) : (
                    <span className="font-semibold text-xs text-slate-700">{item.nama_periode}</span>
                  )}
                </div>

                {/* 4. Tanggal Upload */}
                <div className="col-span-3 text-slate-600 flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span className="font-semibold text-xs">{formatDate(item.tanggal_upload)}</span>
                </div>

                {/* 5. Status Badges */}
                <div className="col-span-1 flex justify-center">
                  {item.status ? (
                    <span className="inline-block bg-[#C0E6D8] text-[#0E4A3E] border border-emerald-300 font-bold text-[11px] px-3.5 py-1 rounded-full shadow-2xs whitespace-nowrap">
                      Publish
                    </span>
                  ) : (
                    <span className="inline-block bg-slate-100 text-slate-600 border border-slate-300 font-bold text-[11px] px-3.5 py-1 rounded-full whitespace-nowrap">
                      Draft
                    </span>
                  )}
                </div>

                {/* 6. Aksi */}
                <div className="col-span-1 flex items-center justify-center gap-1.5">
                  <button
                    onClick={() => handleOpenEdit(item)}
                    title="Edit Surat"
                    className="btn-action-edit"
                  >
                    <Edit3 className="w-4 h-4 stroke-[2.2]" />
                  </button>
                  <button
                    onClick={() => setDeleteTarget(item)}
                    title="Hapus Surat"
                    className="btn-action-delete"
                  >
                    <Trash2 className="w-4 h-4 stroke-[2.2]" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ── Table Footer / Pagination ── */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-slate-600">
          <div>
            Menampilkan <strong className="text-slate-800">{filteredItems.length > 0 ? 1 : 0}</strong>-
            <strong className="text-slate-800">{filteredItems.length}</strong> data dari{' '}
            <strong className="text-slate-800">{items.length}</strong> total template
          </div>

          <div className="flex items-center gap-1.5 self-center">
            <span className="w-8 h-8 rounded-lg bg-[#0E4A3E] text-white flex items-center justify-center font-bold text-xs shadow-xs">
              1
            </span>
          </div>
        </div>
          </div>
        </div>
      </div>

      {/* ── Modal Create / Edit Surat ── */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden border border-slate-200">
            <div className="bg-[#0E4A3E] text-white px-6 py-4 flex items-center justify-between">
              <h3 className="font-extrabold text-base tracking-wide uppercase flex items-center gap-2">
                <FileText className="w-5 h-5 text-emerald-300" />
                {editingItem ? 'Edit Template Surat' : 'Tambah Template Surat'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-white/80 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Periode KKN *
                </label>
                <select
                  required
                  value={formPeriodeId}
                  onChange={(e) => setFormPeriodeId(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-slate-800 text-xs sm:text-sm font-semibold outline-none focus:border-[#0E4A3E] focus:ring-1 focus:ring-[#0E4A3E]"
                >
                  <option value="all">🌟 Semua Periode (Berlaku untuk Semua Gelombang)</option>
                  <optgroup label="Atau Berlaku Khusus Periode Tertentu:">
                    {periodes.map((p) => (
                      <option key={p.id_periode} value={p.id_periode}>
                        {p.nama_periode} ({p.tahun}) {p.status === 'Aktif' ? '— [Aktif]' : ''}
                      </option>
                    ))}
                  </optgroup>
                </select>
                <p className="text-[11px] text-slate-500 mt-1">
                  Pilih <strong>Semua Periode</strong> agar template surat otomatis tersedia dan dapat diunduh mahasiswa di seluruh gelombang KKN.
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Nama Dokumen / Surat *
                </label>
                <input
                  type="text"
                  required
                  value={formNamaSurat}
                  onChange={(e) => setFormNamaSurat(e.target.value)}
                  placeholder="Contoh: Template Surat Rekomendasi Dekan / Fakultas"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-slate-800 text-xs sm:text-sm font-semibold outline-none focus:border-[#0E4A3E] focus:ring-1 focus:ring-[#0E4A3E]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Unggah Berkas Template (.docx / .pdf / .doc)
                </label>
                
                <div className="border-2 border-dashed border-slate-300 rounded-2xl p-4 text-center hover:border-[#0E4A3E] transition-colors bg-slate-50/50">
                  {formFilePath ? (
                    <div className="flex items-center justify-between bg-white border border-emerald-300 rounded-xl p-3 shadow-2xs">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <FileText className="w-5 h-5 text-emerald-600 shrink-0" />
                        <div className="text-left truncate">
                          <p className="text-xs font-bold text-slate-800 truncate">
                            {uploadedFileName || formFilePath.split('/').pop()}
                          </p>
                          <span className="text-[10px] text-emerald-700 font-medium">✓ Berkas Siap Diunduh Mahasiswa</span>
                        </div>
                      </div>
                      <label className="shrink-0 cursor-pointer text-xs font-bold text-[#0E4A3E] hover:underline px-2.5 py-1 bg-emerald-50 rounded-lg border border-emerald-200">
                        Ganti File
                        <input
                          type="file"
                          disabled={isUploadingTemplate}
                          className="hidden"
                          accept=".pdf,.doc,.docx"
                          onChange={handleTemplateFileUpload}
                        />
                      </label>
                    </div>
                  ) : (
                    <div>
                      <Upload className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                      <p className="text-xs text-slate-600 font-medium mb-2">
                        Pilih file template resmi dari folder komputer Anda
                      </p>
                      <label className="cursor-pointer inline-flex items-center gap-1.5 px-4 py-2 bg-[#0E4A3E] hover:bg-[#08362d] text-white text-xs font-bold rounded-xl shadow-xs transition-all">
                        {isUploadingTemplate ? (
                          <>
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            <span>Mengunggah...</span>
                          </>
                        ) : (
                          <>
                            <Upload className="w-3.5 h-3.5" />
                            <span>Pilih Berkas dari Komputer</span>
                          </>
                        )}
                        <input
                          type="file"
                          disabled={isUploadingTemplate}
                          className="hidden"
                          accept=".pdf,.doc,.docx"
                          onChange={handleTemplateFileUpload}
                        />
                      </label>
                    </div>
                  )}
                </div>

                {formFilePath && (
                  <p className="text-[10px] text-slate-400 mt-1 font-mono truncate">
                    Lokasi file: {formFilePath}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Status Publikasi
                </label>
                <select
                  value={formStatus ? 'true' : 'false'}
                  onChange={(e) => setFormStatus(e.target.value === 'true')}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-slate-800 text-xs sm:text-sm font-semibold outline-none focus:border-[#0E4A3E]"
                >
                  <option value="true">Publish (Dapat Diunduh Mahasiswa)</option>
                  <option value="false">Draft (Belum Dipublikasikan)</option>
                </select>
              </div>

              <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  disabled={isSubmitting}
                  className="px-5 py-2 rounded-xl border border-slate-300 text-slate-700 text-xs sm:text-sm font-bold hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-2 rounded-xl bg-[#0D6EFD] hover:bg-[#0b5ed7] text-white text-xs sm:text-sm font-bold shadow-md transition-all hover:scale-102 active:scale-98 disabled:opacity-50 flex items-center gap-2 cursor-pointer"
                >
                  {isSubmitting && <RefreshCw className="w-4 h-4 animate-spin" />}
                  <span>{editingItem ? 'Simpan Perubahan' : 'Upload Template Surat'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Modal Confirm Delete ── */}
      <ConfirmModal
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDeleteConfirm}
        title="Konfirmasi Hapus Template Surat"
        itemName={deleteTarget ? deleteTarget.nama_surat : undefined}
        description="Apakah Anda yakin ingin menghapus template surat ini? Tindakan ini tidak dapat dibatalkan."
        isProcessing={isDeleting}
      />
    </div>
  );
}
