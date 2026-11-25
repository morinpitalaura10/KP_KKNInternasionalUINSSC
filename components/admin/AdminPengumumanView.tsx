'use client';

import React from 'react';
import {
  Plus,
  Edit3,
  Trash2,
  X,
  RefreshCw,
  Newspaper,
  Calendar,
  History,
  Eye,
  EyeOff,
} from 'lucide-react';
import PageHeader from '@/components/ui/PageHeader';
import AlertBanner from '@/components/ui/AlertBanner';
import ConfirmModal from '@/components/ui/ConfirmModal';
import { LogPublikasiModal } from '@/components/ui';
import FilterBar from '@/components/ui/FilterBar';

export interface PeriodeOption {
  id: number;
  nama: string;
  tahunAkademik: string;
  status?: string;
}

export interface PengumumanItem {
  id: number;
  id_pengumuman: number;
  id_periode: number;
  id_user: number;
  judul: string;
  isi: string;
  tanggal_publish: string;
  status: boolean;
  nama_user: string | null;
  nama_periode: string | null;
}

export interface AdminPengumumanViewProps {
  periodes: PeriodeOption[];
  filteredItems: PengumumanItem[];
  isLoading: boolean;
  statusMessage: { type: 'success' | 'error'; text: string } | null;
  setStatusMessage: (msg: { type: 'success' | 'error'; text: string } | null) => void;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  filterPeriode: string;
  setFilterPeriode: (p: string) => void;
  filterStatus: string;
  setFilterStatus: (s: string) => void;
  isModalOpen: boolean;
  setIsModalOpen: (open: boolean) => void;
  isLogModalOpen: boolean;
  setIsLogModalOpen: (open: boolean) => void;
  isSubmitting: boolean;
  editingId: number | null;
  deleteTarget: PengumumanItem | null;
  setDeleteTarget: (item: PengumumanItem | null) => void;
  isDeleting: boolean;
  idPeriode: string;
  setIdPeriode: (id: string) => void;
  judul: string;
  setJudul: (j: string) => void;
  isi: string;
  setIsi: (i: string) => void;
  tanggalPublish: string;
  setTanggalPublish: (t: string) => void;
  formStatus: boolean;
  setFormStatus: (s: boolean) => void;
  handleOpenCreate: () => void;
  handleOpenEdit: (item: PengumumanItem) => void;
  handleSubmit: (e: React.FormEvent) => void;
  handleToggleStatus: (item: PengumumanItem) => void;
  handleDeleteConfirm: () => void;
  formatDate: (dateStr: string) => string;
}

export default function AdminPengumumanView({
  periodes,
  filteredItems,
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
  isLogModalOpen,
  setIsLogModalOpen,
  isSubmitting,
  editingId,
  deleteTarget,
  setDeleteTarget,
  isDeleting,
  idPeriode,
  setIdPeriode,
  judul,
  setJudul,
  isi,
  setIsi,
  tanggalPublish,
  setTanggalPublish,
  formStatus,
  setFormStatus,
  handleOpenCreate,
  handleOpenEdit,
  handleSubmit,
  handleToggleStatus,
  handleDeleteConfirm,
  formatDate,
}: AdminPengumumanViewProps) {
  return (
    <div className="w-full max-w-7xl space-y-6 pb-12 font-sans">
      {/* ── Top Header Area matching Archivo Black Design ── */}
      <PageHeader
        title="KELOLA PENGUMUMAN"
        subtitle="KULIAH KERJA NYATA INTERNASIONAL"
        description="Buat dan kelola pengumuman terkait KKN Internasional."
        action={
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsLogModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-[#0E4A3E] text-xs font-bold transition-colors shadow-xs cursor-pointer"
              title="Lihat Riwayat Publikasi (Log Audit)"
            >
              <History className="w-4 h-4" />
              <span>Log Publikasi</span>
            </button>
            <button onClick={handleOpenCreate} className="btn-primary-add">
              <Plus className="w-4 h-4 stroke-[3]" />
              <span>Tambah Pengumuman</span>
            </button>
          </div>
        }
      />

      {/* ── Status Message Alert ── */}
      <AlertBanner message={statusMessage} onClose={() => setStatusMessage(null)} />

      {/* ── Filter & Search Bar - Filter per Gelombang & Status ── */}
      <FilterBar
        searchValue={searchQuery}
        onSearchChange={setSearchQuery}
        searchPlaceholder="Cari judul atau isi pengumuman..."
        searchWidth="flex-1"
        filters={[
          {
            value: filterPeriode,
            onChange: setFilterPeriode,
            options: [
              ...[...periodes]
                .sort((a, b) => (b.status === 'Aktif' ? 1 : 0) - (a.status === 'Aktif' ? 1 : 0))
                .map((p) => ({
                  value: String(p.id),
                  label: `${p.nama} (${p.tahunAkademik})${p.status === 'Aktif' ? ' — [Aktif]' : ''}`,
                })),
              { value: 'semua', label: 'Semua Gelombang / Periode' },
            ],
          },
          {
            value: filterStatus,
            onChange: setFilterStatus,
            options: [
              { value: 'semua', label: 'Semua Status' },
              { value: 'publish', label: 'Publish' },
              { value: 'private', label: 'Private' },
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
            <span className="col-span-4">Judul Pengumuman</span>
            <span className="col-span-2">Periode</span>
            <span className="col-span-3">Tgl Publish</span>
            <span className="col-span-1 text-center">Status</span>
            <span className="col-span-1 text-center">Aksi</span>
          </div>
        </div>

        {/* Table Content */}
        {isLoading ? (
          <div className="py-12 flex flex-col items-center justify-center text-slate-400 gap-2">
            <RefreshCw className="w-6 h-6 animate-spin text-[#0E4A3E]" />
            <span className="text-xs font-semibold">Memuat data pengumuman...</span>
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="py-12 text-center text-slate-500 text-sm space-y-1.5">
            <p className="font-bold text-slate-700">
              Tidak ada pengumuman untuk {periodes.find((p) => String(p.id) === filterPeriode)?.nama || 'filter yang dipilih'}.
            </p>
            <p className="text-xs text-slate-400">
              {searchQuery || filterStatus !== 'semua'
                ? 'Coba sesuaikan kata kunci atau filter status Anda.'
                : 'Belum ada pengumuman yang diterbitkan untuk periode ini. Klik "+ Tambah Pengumuman" untuk membuat pengumuman baru.'}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {filteredItems.map((item, idx) => (
              <div key={item.id} className="kkn-table-row">
                <span className="col-span-1 text-center font-bold text-slate-500">{idx + 1}</span>

                <div className="col-span-4 pr-3">
                  <p className="font-bold text-slate-800 leading-snug truncate">{item.judul}</p>
                  <p className="text-[11px] text-slate-400 truncate mt-0.5">{item.isi}</p>
                </div>

                <div className="col-span-2 text-slate-600">
                  <span className="font-semibold text-xs text-slate-700">{item.nama_periode || '-'}</span>
                </div>

                <div className="col-span-3 text-slate-600 flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span className="font-semibold text-xs">{formatDate(item.tanggal_publish)}</span>
                </div>

                {/* Status Badges: Publish vs Private (klik untuk toggle) */}
                <div className="col-span-1 flex justify-center">
                  <button
                    type="button"
                    onClick={() => handleToggleStatus(item)}
                    title={item.status ? 'Klik untuk ubah ke Private' : 'Klik untuk ubah ke Publish'}
                    className="cursor-pointer hover:scale-105 transition-transform"
                  >
                    {item.status ? (
                      <span className="inline-block bg-[#C0E6D8] text-[#0E4A3E] border border-emerald-300 font-bold text-[11px] px-3.5 py-1 rounded-full shadow-2xs whitespace-nowrap">
                        <Eye className="w-3 h-3 inline mr-1" /> Publish
                      </span>
                    ) : (
                      <span className="inline-block bg-slate-100 text-slate-600 border border-slate-300 font-bold text-[11px] px-3.5 py-1 rounded-full whitespace-nowrap">
                        <EyeOff className="w-3 h-3 inline mr-1" /> Private
                      </span>
                    )}
                  </button>
                </div>

                {/* Aksi: Edit & Delete */}
                <div className="col-span-1 flex items-center justify-center gap-2">
                  <button
                    onClick={() => handleOpenEdit(item)}
                    title="Edit Pengumuman"
                    className="btn-action-edit"
                  >
                    <Edit3 className="w-4 h-4 stroke-[2.2]" />
                  </button>
                  <button
                    onClick={() => setDeleteTarget(item)}
                    title="Hapus Pengumuman"
                    className="btn-action-delete"
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

      {/* ── Bottom Summary / Pagination Mint Green Card ── */}
      <div className="bg-[#C0E6D8] border border-[#99d1c1] rounded-2xl px-6 py-4 flex items-center justify-between text-xs text-[#0E4A3E] font-bold shadow-2xs">
        <div>
          Menampilkan {filteredItems.length > 0 ? 1 : 0}-{filteredItems.length} data dari {filteredItems.length} data
          {filterPeriode !== 'semua' && (
            <span className="ml-1 text-emerald-800">
              ({periodes.find((p) => String(p.id) === filterPeriode)?.nama || 'Periode Terpilih'})
            </span>
          )}
        </div>
        <div className="flex items-center gap-1">
          <span className="w-8 h-8 rounded-lg bg-[#0E4A3E] text-white flex items-center justify-center font-bold text-xs shadow-xs">
            1
          </span>
        </div>
      </div>

      {/* ── Modal Create / Edit ── */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden border border-slate-200">
            <div className="bg-[#0E4A3E] text-white px-6 py-4 flex items-center justify-between">
              <h3 className="font-extrabold text-base tracking-wide uppercase flex items-center gap-2">
                <Newspaper className="w-5 h-5 text-emerald-300" />
                {editingId ? 'Edit Pengumuman' : 'Tambah Pengumuman'}
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
                  value={idPeriode}
                  onChange={(e) => setIdPeriode(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-slate-800 text-xs sm:text-sm font-semibold outline-none focus:border-[#0E4A3E] focus:ring-1 focus:ring-[#0E4A3E]"
                >
                  {periodes.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.nama} ({p.tahunAkademik})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Tanggal Publish *
                </label>
                <input
                  type="date"
                  required
                  value={tanggalPublish}
                  onChange={(e) => setTanggalPublish(e.target.value)}
                  className="w-full px-4 py-2 rounded-xl border border-slate-300 text-slate-800 text-xs sm:text-sm outline-none focus:border-[#0E4A3E]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Judul Pengumuman *
                </label>
                <input
                  type="text"
                  required
                  value={judul}
                  onChange={(e) => setJudul(e.target.value)}
                  placeholder="Contoh: Pengumuman Seleksi KKN Internasional Gelombang 1"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-slate-800 text-xs sm:text-sm font-semibold outline-none focus:border-[#0E4A3E] focus:ring-1 focus:ring-[#0E4A3E]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Isi Pengumuman *
                </label>
                <textarea
                  rows={4}
                  required
                  value={isi}
                  onChange={(e) => setIsi(e.target.value)}
                  placeholder="Tuliskan isi pengumuman lengkap di sini..."
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-slate-800 text-xs sm:text-sm leading-relaxed outline-none focus:border-[#0E4A3E] focus:ring-1 focus:ring-[#0E4A3E] resize-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Status Pengumuman
                </label>
                <select
                  value={formStatus ? 'true' : 'false'}
                  onChange={(e) => setFormStatus(e.target.value === 'true')}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-slate-800 text-xs sm:text-sm font-semibold outline-none focus:border-[#0E4A3E]"
                >
                  <option value="true">Publish (Dapat dilihat publik & mahasiswa)</option>
                  <option value="false">Private (Disembunyikan / Draft Admin)</option>
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
                  <span>{editingId ? 'Simpan Perubahan' : 'Publish Pengumuman'}</span>
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
        title="Konfirmasi Hapus Pengumuman"
        itemName={deleteTarget ? deleteTarget.judul : undefined}
        description="Apakah Anda yakin ingin menghapus pengumuman ini? Tindakan ini tidak dapat dibatalkan."
        isProcessing={isDeleting}
      />

      {/* ── Modal Riwayat Publikasi (Audit Log) ── */}
      <LogPublikasiModal
        isOpen={isLogModalOpen}
        onClose={() => setIsLogModalOpen(false)}
        defaultJenis="pengumuman"
        idPeriode={filterPeriode !== 'semua' ? filterPeriode : null}
      />
    </div>
  );
}
