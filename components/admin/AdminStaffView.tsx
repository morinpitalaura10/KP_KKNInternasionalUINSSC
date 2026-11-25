'use client';

import React from 'react';
import {
  Plus,
  Edit3,
  Trash2,
  X,
  RefreshCw,
  UserCog,
} from 'lucide-react';
import PageHeader from '@/components/ui/PageHeader';
import StatCardMint from '@/components/ui/StatCardMint';
import AlertBanner from '@/components/ui/AlertBanner';
import ConfirmModal from '@/components/ui/ConfirmModal';
import FilterBar from '@/components/ui/FilterBar';

export interface StaffItem {
  id: number;
  id_staff: number;
  id_user: number;
  nama: string;
  email: string;
  nip: string;
  no_hp: string;
  status_akun: boolean;
  status: boolean;
}

export interface AdminStaffViewProps {
  items: StaffItem[];
  filteredItems: StaffItem[];
  isLoading: boolean;
  search: string;
  setSearch: (s: string) => void;
  filterStatus: 'semua' | 'aktif' | 'nonaktif';
  setFilterStatus: (s: 'semua' | 'aktif' | 'nonaktif') => void;
  statusMessage: { type: 'success' | 'error'; text: string } | null;
  setStatusMessage: (msg: { type: 'success' | 'error'; text: string } | null) => void;
  isModalOpen: boolean;
  setIsModalOpen: (open: boolean) => void;
  isSubmitting: boolean;
  editingId: number | null;
  deleteTarget: StaffItem | null;
  setDeleteTarget: (item: StaffItem | null) => void;
  isDeleting: boolean;
  nama: string;
  setNama: (n: string) => void;
  email: string;
  setEmail: (e: string) => void;
  password: string;
  setPassword: (p: string) => void;
  nip: string;
  setNip: (n: string) => void;
  noHp: string;
  setNoHp: (h: string) => void;
  formStatus: boolean;
  setFormStatus: (s: boolean) => void;
  handleOpenCreate: () => void;
  handleOpenEdit: (item: StaffItem) => void;
  handleSubmit: (e: React.FormEvent) => void;
  handleDeleteConfirm: () => void;
  totalStaff: number;
  totalAktif: number;
  totalNonaktif: number;
}

export default function AdminStaffView({
  items,
  filteredItems,
  isLoading,
  search,
  setSearch,
  filterStatus,
  setFilterStatus,
  statusMessage,
  setStatusMessage,
  isModalOpen,
  setIsModalOpen,
  isSubmitting,
  editingId,
  deleteTarget,
  setDeleteTarget,
  isDeleting,
  nama,
  setNama,
  email,
  setEmail,
  password,
  setPassword,
  nip,
  setNip,
  noHp,
  setNoHp,
  formStatus,
  setFormStatus,
  handleOpenCreate,
  handleOpenEdit,
  handleSubmit,
  handleDeleteConfirm,
  totalStaff,
  totalAktif,
  totalNonaktif,
}: AdminStaffViewProps) {
  return (
    <div className="w-full max-w-7xl space-y-6 pb-12 font-sans">
      {/* ── Top Header Area matching Archivo Black Design ── */}
      <PageHeader
        title="KELOLA AKUN STAFF"
        subtitle="KULIAH KERJA NYATA INTERNASIONAL"
        description="Atur akun reviewer dan staf penilai yang memiliki akses ke sistem."
        action={
          <button onClick={handleOpenCreate} className="btn-primary-add">
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>Tambah Akun</span>
          </button>
        }
      />

      {/* ── Stat Cards ── */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3.5 sm:gap-6">
        <StatCardMint value={totalStaff} label="Total Akun Staff" subLabel="Penilai & Verifikator LP2M" />
        <StatCardMint value={totalAktif} label="Staff Aktif" subLabel="Memiliki hak akses login" />
        <StatCardMint value={totalNonaktif} label="Staff Nonaktif" subLabel="Akses ditangguhkan" className="col-span-2 sm:col-span-1" />
      </div>

      {/* ── Status Message Alert ── */}
      <AlertBanner message={statusMessage} onClose={() => setStatusMessage(null)} />

      {/* ── Search & Filter Bar ── */}
      <FilterBar
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Cari nama, NIP, atau email staff..."
        searchWidth="flex-1 max-w-md"
        filters={[
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
        countLabel="staff"
      />

      {/* ── Main Table Card matching Figma Design ── */}
      <div className="kkn-table-card">
        <div className="kkn-table-scroll">
          <div className="kkn-table-inner">
        {/* Table Header Bar (#0E4A3E) */}
        <div className="kkn-table-header">
          <div className="kkn-table-header-grid">
            <span className="col-span-1 text-center">No</span>
            <span className="col-span-3">Nama Staff</span>
            <span className="col-span-2">NIP</span>
            <span className="col-span-3">Email & Kontak</span>
            <span className="col-span-2 text-center">Status</span>
            <span className="col-span-1 text-center">Aksi</span>
          </div>
        </div>

        {/* Table Content */}
        {isLoading ? (
          <div className="py-16 flex flex-col items-center justify-center text-slate-400 gap-2">
            <RefreshCw className="w-6 h-6 animate-spin text-[#0E4A3E]" />
            <span className="text-xs font-semibold">Memuat data akun staff...</span>
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="py-16 text-center text-slate-500 text-sm">
            {items.length === 0 ? (
              <>
                Belum ada akun staff. Klik <span className="font-bold text-[#0D6EFD]">+ Tambah Akun</span> untuk memulai.
              </>
            ) : (
              'Tidak ada akun staff yang cocok dengan pencarian atau filter status.'
            )}
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {filteredItems.map((item, idx) => (
              <div key={item.id} className="kkn-table-row">
                {/* 1. No */}
                <span className="col-span-1 text-center font-bold text-slate-500">{idx + 1}</span>

                {/* 2. Nama Staff */}
                <div className="col-span-3 pr-3">
                  <p className="font-bold text-slate-800 leading-snug">{item.nama}</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">Staff LP2M / Reviewer</p>
                </div>

                {/* 3. NIP */}
                <div className="col-span-2 pr-2">
                  <span className="font-semibold text-slate-700 text-xs font-mono">{item.nip}</span>
                </div>

                {/* 4. Email & Kontak */}
                <div className="col-span-3 pr-3 text-slate-700">
                  <p className="font-semibold text-slate-800 truncate">{item.email}</p>
                  <span className="text-[11px] text-slate-400 block mt-0.5">
                    {item.no_hp || '-'}
                  </span>
                </div>

                {/* 5. Status Badges */}
                <div className="col-span-2 flex justify-center">
                  {item.status ? (
                    <span className="inline-block bg-[#C0E6D8] text-[#0E4A3E] border border-emerald-300 font-bold text-[11px] px-3.5 py-1 rounded-full shadow-2xs whitespace-nowrap">
                      Aktif
                    </span>
                  ) : (
                    <span className="inline-block bg-red-100 text-red-700 border border-red-300 font-bold text-[11px] px-3 py-1 rounded-full whitespace-nowrap">
                      Nonaktif
                    </span>
                  )}
                </div>

                {/* 6. Aksi */}
                <div className="col-span-1 flex items-center justify-center gap-2">
                  <button
                    onClick={() => handleOpenEdit(item)}
                    title="Edit Akun Staff"
                    className="btn-action-edit"
                  >
                    <Edit3 className="w-4 h-4 stroke-[2.2]" />
                  </button>
                  <button
                    onClick={() => setDeleteTarget(item)}
                    title="Hapus Akun Staff"
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
            Menampilkan <strong className="text-slate-800">1</strong>-
            <strong className="text-slate-800">{items.length}</strong> data dari{' '}
            <strong className="text-slate-800">{items.length}</strong> data
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

      {/* ── Modal Create / Edit Akun Staff ── */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden border border-slate-200">
            <div className="bg-[#0E4A3E] text-white px-6 py-4 flex items-center justify-between">
              <h3 className="font-extrabold text-base tracking-wide uppercase flex items-center gap-2">
                <UserCog className="w-5 h-5 text-emerald-300" />
                {editingId ? 'Edit Akun Staff' : 'Tambah Akun Staff Baru'}
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
                  Nama Lengkap & Gelar *
                </label>
                <input
                  type="text"
                  required
                  value={nama}
                  onChange={(e) => setNama(e.target.value)}
                  placeholder="Contoh: Dr. H. Ahmad Fauzi, M.Pd."
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-slate-800 text-xs sm:text-sm font-semibold outline-none focus:border-[#0E4A3E] focus:ring-1 focus:ring-[#0E4A3E]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Nomor Induk Pegawai (NIP) *
                </label>
                <input
                  type="text"
                  required
                  value={nip}
                  onChange={(e) => setNip(e.target.value)}
                  placeholder="Contoh: 198503152010121002"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-slate-800 text-xs sm:text-sm font-semibold outline-none focus:border-[#0E4A3E] focus:ring-1 focus:ring-[#0E4A3E]"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Email Resmi *
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="email@syekhnurjati.ac.id"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-slate-800 text-xs sm:text-sm outline-none focus:border-[#0E4A3E] focus:ring-1 focus:ring-[#0E4A3E]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Nomor WhatsApp / HP
                  </label>
                  <input
                    type="tel"
                    value={noHp}
                    onChange={(e) => setNoHp(e.target.value)}
                    placeholder="081234567890"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-slate-800 text-xs sm:text-sm outline-none focus:border-[#0E4A3E] focus:ring-1 focus:ring-[#0E4A3E]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  {editingId ? 'Password Baru (Kosongkan jika tidak diubah)' : 'Password Akun *'}
                </label>
                <input
                  type="password"
                  required={!editingId}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={editingId ? '••••••••' : '8-16 karakter (kombinasi A-Z, a-z, 0-9)'}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-slate-800 text-xs sm:text-sm outline-none focus:border-[#0E4A3E] focus:ring-1 focus:ring-[#0E4A3E]"
                />
                <p className="text-[11px] text-slate-500 mt-1 font-medium">
                  * Wajib 8-16 karakter, kombinasi huruf kapital, huruf kecil, dan angka.
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Status Akun
                </label>
                <select
                  value={formStatus ? 'true' : 'false'}
                  onChange={(e) => setFormStatus(e.target.value === 'true')}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-slate-800 text-xs sm:text-sm font-semibold outline-none focus:border-[#0E4A3E]"
                >
                  <option value="true">Aktif (Dapat Login ke Sistem)</option>
                  <option value="false">Nonaktif (Akses Dinonaktifkan)</option>
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
                  <span>{editingId ? 'Simpan Perubahan' : 'Buat Akun Staff'}</span>
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
        title="Konfirmasi Hapus Akun Staff"
        itemName={deleteTarget ? `${deleteTarget.nama} (NIP: ${deleteTarget.nip})` : undefined}
        description="Apakah Anda yakin ingin menghapus akun staff ini? Tindakan ini tidak dapat dibatalkan."
        isProcessing={isDeleting}
      />
    </div>
  );
}
