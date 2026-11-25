'use client';

import React from 'react';
import {
  Plus,
  Edit3,
  Trash2,
  AlertCircle,
  X,
  RefreshCw,
  Info,
  Calendar,
  FileText,
  Globe2,
  Upload,
  Loader2,
  Image as ImageIcon,
  Check,
} from 'lucide-react';
import PageHeader from '@/components/ui/PageHeader';
import StatCardMint from '@/components/ui/StatCardMint';
import AlertBanner from '@/components/ui/AlertBanner';
import ConfirmModal from '@/components/ui/ConfirmModal';
import FilterBar from '@/components/ui/FilterBar';

export interface PeriodeOption {
  id: number;
  nama: string;
  tahunAkademik: string;
}

export interface InformasiItem {
  id: number;
  id_informasi: number;
  id_periode: number | null;
  id_user: number;
  judul: string;
  isi: string;
  gambar: string | null;
  status: boolean;
  created_at: string;
  updated_at?: string;
  nama_user: string | null;
  nama_periode: string | null;
}

export interface AdminInformasiViewProps {
  items: InformasiItem[];
  filteredItems: InformasiItem[];
  periodes: PeriodeOption[];
  isLoading: boolean;
  statusMessage: { type: 'success' | 'error'; text: string } | null;
  setStatusMessage: (msg: { type: 'success' | 'error'; text: string } | null) => void;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  filterPeriode: string;
  setFilterPeriode: (p: string) => void;
  filterStatus: 'semua' | 'aktif' | 'nonaktif';
  setFilterStatus: (s: 'semua' | 'aktif' | 'nonaktif') => void;
  isModalOpen: boolean;
  setIsModalOpen: (open: boolean) => void;
  isSubmitting: boolean;
  editingId: number | null;
  deleteTarget: InformasiItem | null;
  setDeleteTarget: (item: InformasiItem | null) => void;
  isDeleting: boolean;
  togglingId: number | null;
  idPeriode: string;
  setIdPeriode: (id: string) => void;
  judul: string;
  setJudul: (j: string) => void;
  isi: string;
  setIsi: (i: string) => void;
  gambar: string;
  setGambar: (g: string) => void;
  isUploadingGambar: boolean;
  uploadError: string | null;
  handleOpenCreate: () => void;
  handleOpenEdit: (item: InformasiItem) => void;
  handleUploadGambar: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleSubmit: (e: React.FormEvent) => void;
  handleToggleStatus: (item: InformasiItem) => void;
  handleDeleteConfirm: () => void;
  totalInfo: number;
  totalAktif: number;
  totalSelaluAktif: number;
  totalDenganPeriode: number;
  formatDate: (dateStr: string) => string;
}

export default function AdminInformasiView({
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
  editingId,
  deleteTarget,
  setDeleteTarget,
  isDeleting,
  togglingId,
  idPeriode,
  setIdPeriode,
  judul,
  setJudul,
  isi,
  setIsi,
  gambar,
  setGambar,
  isUploadingGambar,
  uploadError,
  handleOpenCreate,
  handleOpenEdit,
  handleUploadGambar,
  handleSubmit,
  handleToggleStatus,
  handleDeleteConfirm,
  totalInfo,
  totalAktif,
  totalSelaluAktif,
  totalDenganPeriode,
  formatDate,
}: AdminInformasiViewProps) {
  return (
    <div className="w-full max-w-7xl space-y-6 pb-12 font-sans">
      {/* ── Header ── */}
      <PageHeader
        title="KELOLA INFORMASI PROGRAM"
        subtitle="KULIAH KERJA NYATA INTERNASIONAL"
        description="Atur dan kelola informasi lengkap mengenai program KKN Internasional."
        action={
          <button onClick={handleOpenCreate} className="btn-primary-add">
            <Plus className="w-4 h-4 stroke-[3]" />
            Tambah Informasi
          </button>
        }
      />

      {/* ── Stat Cards ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <StatCardMint value={totalInfo} label="Total Informasi" subLabel="Keseluruhan data" />
        <StatCardMint value={totalAktif} label="Aktif" subLabel="Ditampilkan ke publik" />
        <StatCardMint value={totalSelaluAktif} label="Selalu Aktif" subLabel="Berlaku semua periode" />
        <StatCardMint value={totalDenganPeriode} label="Khusus Periode" subLabel="Terikat periode tertentu" />
      </div>

      {/* ── Status Message ── */}
      <AlertBanner message={statusMessage} onClose={() => setStatusMessage(null)} />

      {/* ── Search & Filter Bar ── */}
      <FilterBar
        searchValue={searchQuery}
        onSearchChange={setSearchQuery}
        searchPlaceholder="Cari judul atau isi informasi..."
        searchWidth="flex-1 max-w-md"
        filters={[
          {
            value: filterPeriode,
            onChange: (val) => setFilterPeriode(val),
            options: [
              { value: 'semua', label: 'Semua Periode' },
              { value: 'umum', label: '🌐 Informasi Umum (Semua Periode)' },
              ...periodes.map((p) => ({
                value: String(p.id),
                label: `${p.nama} (${p.tahunAkademik})`,
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
        countLabel="hasil"
      />

      {/* ── Table Card ── */}
      <div className="kkn-table-card">
        <div className="kkn-table-scroll">
          <div className="kkn-table-inner">
        {/* Table Header */}
        <div className="kkn-table-header">
          <div className="kkn-table-header-grid">
            <span className="col-span-1 text-center">No</span>
            <span className="col-span-4">Judul Informasi</span>
            <span className="col-span-2">Periode</span>
            <span className="col-span-2">Dibuat Oleh</span>
            <span className="col-span-1 text-center">Tanggal</span>
            <span className="col-span-1 text-center">Status</span>
            <span className="col-span-1 text-center">Aksi</span>
          </div>
        </div>

        {isLoading ? (
          <div className="py-16 flex flex-col items-center justify-center text-slate-400 gap-2">
            <RefreshCw className="w-6 h-6 animate-spin text-[#0E4A3E]" />
            <span className="text-xs font-semibold">Memuat data informasi...</span>
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="py-16 px-4 text-center">
            <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-3 text-slate-400">
              <FileText className="w-6 h-6" />
            </div>
            <p className="text-sm font-bold text-slate-700">
              {items.length === 0 ? 'Belum ada informasi' : 'Tidak ada informasi yang cocok'}
            </p>
            <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
              {items.length === 0 ? (
                <>Klik <span className="font-bold text-[#0D6EFD]">+ Tambah Informasi</span> untuk memulai.</>
              ) : (
                'Coba ubah kata kunci pencarian atau filter status.'
              )}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {filteredItems.map((item, idx) => (
              <div key={item.id} className="kkn-table-row group">
                {/* No */}
                <span className="col-span-1 text-center font-bold text-slate-500">{idx + 1}</span>

                {/* Judul & Cuplikan */}
                <div className="col-span-4 pr-3">
                  <div className="flex items-start gap-2.5">
                    {item.gambar && (
                      <div className="w-10 h-10 rounded-lg overflow-hidden bg-slate-100 shrink-0 border border-slate-200">
                        <img src={item.gambar} alt="" className="w-full h-full object-cover" onError={(e) => { e.currentTarget.parentElement!.classList.add('hidden'); }} />
                      </div>
                    )}
                    <div className="min-w-0">
                      <p className="font-bold text-slate-800 leading-tight truncate">{item.judul}</p>
                      <p className="text-[11px] text-slate-400 truncate mt-0.5">{item.isi.substring(0, 80)}...</p>
                    </div>
                  </div>
                </div>

                {/* Periode */}
                <div className="col-span-2 text-slate-600 text-[11px]">
                  {item.id_periode === null ? (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-300">
                      <Globe2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      Semua Periode
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 text-slate-700 font-medium">
                      <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      {item.nama_periode}
                    </span>
                  )}
                </div>

                {/* Dibuat Oleh */}
                <div className="col-span-2 text-slate-600 text-[11px]">
                  {item.nama_user || 'Admin LP2M'}
                </div>

                {/* Tanggal */}
                <div className="col-span-1 text-center text-[11px] text-slate-500">
                  <div className="flex items-center gap-1 justify-center">
                    <Calendar className="w-3 h-3 text-slate-400" />
                    <span>{formatDate(item.created_at)}</span>
                  </div>
                </div>

                {/* Status: Interactive Toggle Switch */}
                <div className="col-span-1 flex flex-col items-center justify-center gap-1">
                  <button
                    type="button"
                    role="switch"
                    aria-checked={item.status}
                    onClick={() => handleToggleStatus(item)}
                    disabled={togglingId === item.id}
                    title={item.status ? 'Klik untuk nonaktifkan' : 'Klik untuk aktifkan'}
                    className={`group relative inline-flex h-5 w-9 shrink-0 cursor-pointer items-center rounded-full transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-[#0E4A3E] focus:ring-offset-1 ${
                      item.status ? 'bg-[#0E4A3E]' : 'bg-slate-300 hover:bg-slate-400'
                    } ${togglingId === item.id ? 'opacity-60 cursor-wait' : ''}`}
                  >
                    <span className="sr-only">Toggle Status Informasi</span>
                    <span
                      className={`inline-flex items-center justify-center h-3.5 w-3.5 transform rounded-full bg-white shadow-md transition duration-200 ease-in-out ${
                        item.status ? 'translate-x-4' : 'translate-x-1'
                      }`}
                    >
                      {togglingId === item.id && (
                        <Loader2 className="w-2 h-2 text-[#0E4A3E] animate-spin" />
                      )}
                    </span>
                  </button>
                  <span className={`text-[9px] font-bold tracking-tight ${item.status ? 'text-emerald-700' : 'text-slate-400'}`}>
                    {item.status ? 'Aktif' : 'Nonaktif'}
                  </span>
                </div>

                {/* Aksi: Edit & Hapus */}
                <div className="col-span-1 flex items-center justify-center gap-1">
                  <button
                    onClick={() => handleOpenEdit(item)}
                    title="Edit Informasi"
                    className="btn-action-edit"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => setDeleteTarget(item)}
                    title="Hapus Informasi"
                    className="btn-action-delete"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
          </div>
        </div>
      </div>

      {/* ── Modal Create / Edit ── */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full overflow-hidden border border-slate-200">
            {/* Modal Header */}
            <div className="bg-[#0E4A3E] text-white px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Info className="w-5 h-5 text-emerald-300" />
                <h3 className="font-bold text-base">
                  {editingId ? 'Edit Informasi' : 'Tambah Informasi Baru'}
                </h3>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="text-white/80 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Periode KKN <span className="text-slate-400 font-normal normal-case">(Pilih &quot;Semua Periode&quot; agar selalu aktif)</span>
                </label>
                <select
                  value={idPeriode}
                  onChange={(e) => setIdPeriode(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-slate-800 text-xs sm:text-sm outline-none focus:border-[#0E4A3E] focus:ring-1 focus:ring-[#0E4A3E] cursor-pointer bg-white"
                >
                  <option value="">🌐 Semua Periode</option>
                  {periodes.map((p) => (
                    <option key={p.id} value={p.id}>{p.nama} ({p.tahunAkademik})</option>
                  ))}
                </select>
                <div className="mt-2 p-2.5 bg-emerald-50 border border-emerald-200/80 rounded-xl text-[11px] text-emerald-800 flex items-start gap-2">
                  <Globe2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold">Tips Periode Selalu Aktif:</span> Pilih <strong>&ldquo;Semua Periode (Selalu Aktif / Berlaku Terus)&rdquo;</strong> agar artikel informasi umum (seperti profil atau ketentuan umum program) tetap selalu tampil untuk publik dan mahasiswa di setiap pergantian gelombang tanpa terhapus atau hilang.
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Judul Informasi <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={judul}
                  onChange={(e) => setJudul(e.target.value)}
                  placeholder="Contoh: Tentang Program KKN Internasional"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-slate-800 text-xs sm:text-sm font-semibold outline-none focus:border-[#0E4A3E] focus:ring-1 focus:ring-[#0E4A3E]"
                />
              </div>

              {/* Upload Gambar Informasi */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Foto / Gambar Informasi <span className="text-slate-400 font-normal normal-case">(Opsional)</span>
                </label>
                <div className="flex items-start gap-3 p-3 bg-slate-50 border border-slate-200 rounded-xl">
                  {/* Thumbnail Preview */}
                  <div className="w-24 h-20 rounded-lg overflow-hidden border border-slate-200 bg-white shrink-0 shadow-2xs relative flex items-center justify-center">
                    {gambar ? (
                      /* eslint-disable-next-line @next/next/no-img-element */
                      <img
                        src={gambar}
                        alt="Preview"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="flex flex-col items-center justify-center p-1 text-center text-slate-400">
                        <ImageIcon className="w-5 h-5 mb-1 text-slate-300" />
                        <span className="text-[10px] font-medium leading-tight">Belum ada gambar</span>
                      </div>
                    )}
                    {isUploadingGambar && (
                      <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center text-white">
                        <Loader2 className="w-5 h-5 animate-spin" />
                        <span className="text-[9px] mt-1 font-semibold">Mengunggah...</span>
                      </div>
                    )}
                  </div>

                  {/* Actions & Description */}
                  <div className="flex-1 min-w-0 space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <label className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-[#0E4A3E] hover:bg-[#09352c] text-white text-xs font-bold rounded-lg cursor-pointer transition-colors shadow-2xs">
                        {isUploadingGambar ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <Upload className="w-3.5 h-3.5" />
                        )}
                        <span>{isUploadingGambar ? 'Mengunggah...' : 'Unggah Gambar Langsung'}</span>
                        <input
                          type="file"
                          accept="image/jpeg,image/png,image/webp,image/gif"
                          onChange={handleUploadGambar}
                          className="hidden"
                          disabled={isUploadingGambar}
                        />
                      </label>

                      {gambar && (
                        <button
                          type="button"
                          onClick={() => setGambar('')}
                          className="px-2.5 py-1.5 text-xs text-rose-600 hover:text-rose-700 hover:bg-rose-50 border border-rose-200 rounded-lg font-semibold transition-colors cursor-pointer flex items-center gap-1"
                        >
                          <Trash2 className="w-3 h-3" />
                          Hapus
                        </button>
                      )}
                    </div>

                    <p className="text-[11px] text-slate-500">
                      Mendukung format JPG, PNG, WEBP, GIF (Maksimal 5MB)
                    </p>

                    {gambar && (
                      <p className="text-[11px] text-emerald-700 font-semibold flex items-center gap-1 truncate">
                        <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        <span className="truncate">Terpasang: {gambar.split('/').pop()}</span>
                      </p>
                    )}

                    {uploadError && (
                      <p className="text-[11px] font-semibold text-rose-600 flex items-center gap-1">
                        <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                        <span>{uploadError}</span>
                      </p>
                    )}
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Isi Informasi <span className="text-red-500">*</span>{' '}
                  <span className="text-slate-400 font-normal normal-case">(mendukung HTML dasar)</span>
                </label>
                <textarea
                  rows={8}
                  required
                  value={isi}
                  onChange={(e) => setIsi(e.target.value)}
                  placeholder="Tuliskan isi informasi lengkap di sini..."
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-slate-800 text-xs sm:text-sm leading-relaxed outline-none focus:border-[#0E4A3E] focus:ring-1 focus:ring-[#0E4A3E] resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200 mt-6">
                <button type="button" onClick={() => setIsModalOpen(false)} disabled={isSubmitting} className="px-5 py-2.5 rounded-xl border border-slate-300 text-slate-700 text-xs sm:text-sm font-bold hover:bg-slate-100 transition-colors cursor-pointer">
                  Batal
                </button>
                <button type="submit" disabled={isSubmitting} className="px-6 py-2.5 rounded-xl bg-[#0D6EFD] hover:bg-[#0b5ed7] text-white text-xs sm:text-sm font-bold shadow-md transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 flex items-center gap-2 cursor-pointer">
                  {isSubmitting && <RefreshCw className="w-4 h-4 animate-spin" />}
                  {isSubmitting ? 'Menyimpan...' : editingId ? 'Simpan Perubahan' : 'Simpan Informasi'}
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
        title="Hapus Informasi?"
        itemName={deleteTarget?.judul}
        description="Apakah Anda yakin ingin menghapus informasi ini? Tindakan ini tidak dapat dibatalkan."
        isProcessing={isDeleting}
      />
    </div>
  );
}
