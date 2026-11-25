'use client';

import React from 'react';
import {
  Plus,
  Edit3,
  Trash2,
  RefreshCw,
  ShieldCheck,
  ShieldAlert,
  Mail,
  Lock,
  User,
  Eye,
  EyeOff,
  X,
} from 'lucide-react';
import PageHeader from '@/components/ui/PageHeader';
import StatCardMint from '@/components/ui/StatCardMint';
import AlertBanner from '@/components/ui/AlertBanner';
import ConfirmModal from '@/components/ui/ConfirmModal';
import FilterBar from '@/components/ui/FilterBar';

export interface AdminItem {
  id: number;
  id_user: number;
  nama: string;
  email: string;
  role: string;
  status: boolean;
  created_at: string;
}

export interface AdminUsersViewProps {
  items: AdminItem[];
  filteredItems: AdminItem[];
  isLoading: boolean;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  filterStatus: 'semua' | 'aktif' | 'nonaktif';
  setFilterStatus: (s: 'semua' | 'aktif' | 'nonaktif') => void;
  statusMessage: { type: 'success' | 'error'; text: string } | null;
  setStatusMessage: (msg: { type: 'success' | 'error'; text: string } | null) => void;
  isModalOpen: boolean;
  setIsModalOpen: (open: boolean) => void;
  isSubmitting: boolean;
  editingId: number | null;
  deleteTarget: AdminItem | null;
  setDeleteTarget: (item: AdminItem | null) => void;
  isDeleting: boolean;
  isSelf: (item: AdminItem | null) => boolean;
  nama: string;
  setNama: (n: string) => void;
  email: string;
  setEmail: (e: string) => void;
  password: string;
  setPassword: (p: string) => void;
  status: boolean;
  setStatus: (s: boolean) => void;
  showPassword: boolean;
  setShowPassword: (show: boolean) => void;
  deactivateSelfTarget: AdminItem | null;
  setDeactivateSelfTarget: (target: AdminItem | null) => void;
  isTogglingSelf: boolean;
  handleOpenCreate: () => void;
  handleOpenEdit: (item: AdminItem) => void;
  handleSubmit: (e: React.FormEvent) => void;
  handleToggleStatus: (item: AdminItem) => void;
  executeToggleStatus: (item: AdminItem, isDeactivatingSelf: boolean) => void;
  handleDeleteConfirm: () => void;
  totalAdmin: number;
  totalAktif: number;
  totalNonaktif: number;
}

export default function AdminUsersView({
  filteredItems,
  isLoading,
  searchQuery,
  setSearchQuery,
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
  isSelf,
  nama,
  setNama,
  email,
  setEmail,
  password,
  setPassword,
  status,
  setStatus,
  showPassword,
  setShowPassword,
  deactivateSelfTarget,
  setDeactivateSelfTarget,
  isTogglingSelf,
  handleOpenCreate,
  handleOpenEdit,
  handleSubmit,
  handleToggleStatus,
  executeToggleStatus,
  handleDeleteConfirm,
  totalAdmin,
  totalAktif,
  totalNonaktif,
}: AdminUsersViewProps) {
  return (
    <div className="w-full max-w-7xl space-y-6 pb-12 font-sans">
      {/* ── Page Header ── */}
      <PageHeader
        title="KELOLA AKUN ADMINISTRATOR"
        subtitle="PUSAT KONTROL PENGGUNA SISTEM LP2M"
        description="Kelola hak akses dan akun administrator LP2M dengan otoritas penuh pada portal KKN Internasional."
        action={
          <button onClick={handleOpenCreate} className="btn-primary-add">
            <Plus className="w-4 h-4 stroke-[3]" />
            Tambah Admin Baru
          </button>
        }
      />

      {/* ── Stat Cards ── */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3.5 sm:gap-6">
        <StatCardMint value={totalAdmin} label="Total Akun Admin" subLabel="Pengelola sistem LP2M" />
        <StatCardMint value={totalAktif} label="Admin Aktif" subLabel="Memiliki hak akses login" />
        <StatCardMint value={totalNonaktif} label="Admin Nonaktif" subLabel="Akses ditangguhkan" className="col-span-2 sm:col-span-1" />
      </div>

      {/* ── Status Message Banner ── */}
      <AlertBanner message={statusMessage} onClose={() => setStatusMessage(null)} />

      {/* ── Search & Filter Bar ── */}
      <FilterBar
        searchValue={searchQuery}
        onSearchChange={setSearchQuery}
        searchPlaceholder="Cari nama atau email admin..."
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
        countLabel="akun"
      />

      {/* ── Table Card ── */}
      <div className="kkn-table-card">
        <div className="kkn-table-scroll">
          <div className="kkn-table-inner">
        {/* Table Header */}
        <div className="kkn-table-header">
          <div className="kkn-table-header-grid">
            <div className="col-span-1 text-center">No</div>
            <div className="col-span-4">Nama Administrator</div>
            <div className="col-span-3">Email Akun</div>
            <div className="col-span-2 text-center">Hak Akses</div>
            <div className="col-span-1 text-center">Status</div>
            <div className="col-span-1 text-center">Aksi</div>
          </div>
        </div>

        {/* Table Body */}
        <div className="divide-y divide-slate-100">
          {isLoading ? (
            <div className="py-16 text-center text-slate-400 flex flex-col items-center justify-center gap-3">
              <RefreshCw className="w-8 h-8 animate-spin text-[#0E4A3E]" />
              <span className="text-sm font-medium">Memuat data administrator dari database MySQL...</span>
            </div>
          ) : filteredItems.length === 0 ? (
            <div className="py-16 text-center text-slate-400">
              <ShieldAlert className="w-12 h-12 mx-auto mb-3 opacity-30 text-slate-400" />
              <span className="text-sm font-medium">Tidak ada akun admin yang sesuai.</span>
            </div>
          ) : (
            filteredItems.map((item, idx) => (
              <div key={item.id_user} className="kkn-table-row">
                <div className="col-span-1 text-center font-bold text-slate-400">{idx + 1}</div>

                <div className="col-span-4 flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-[#DDF2E8] border border-[#a6d8c3] text-[#0E4A3E] font-extrabold flex items-center justify-center text-xs shrink-0">
                    {item.nama.charAt(0).toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-800 truncate">{item.nama}</span>
                      {isSelf(item) && (
                        <span className="shrink-0 inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-[#E8F5F1] text-[#0E4A3E] border border-[#C0E6D8]">
                          <User className="w-2.5 h-2.5" />
                          Akun Anda
                        </span>
                      )}
                    </div>
                    <span className="text-[11px] text-slate-400">ID User: #{item.id_user}</span>
                  </div>
                </div>

                <div className="col-span-3 text-slate-600 flex items-center gap-1.5 truncate">
                  <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span className="truncate">{item.email}</span>
                </div>

                <div className="col-span-2 text-center">
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-extrabold bg-[#0E4A3E] text-white">
                    <ShieldCheck className="w-3 h-3 text-emerald-300" />
                    Super Admin
                  </span>
                </div>

                <div className="col-span-1 text-center">
                  <button
                    onClick={() => handleToggleStatus(item)}
                    title={item.status ? 'Klik untuk nonaktifkan akun' : 'Klik untuk aktifkan akun'}
                    className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold transition-all cursor-pointer ${
                      item.status
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100'
                        : 'bg-red-50 text-red-700 border border-red-200 hover:bg-red-100'
                    }`}
                  >
                    {item.status ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                    {item.status ? 'Aktif' : 'Nonaktif'}
                  </button>
                </div>

                <div className="col-span-1 flex items-center justify-center gap-2">
                  <button
                    onClick={() => handleOpenEdit(item)}
                    className="btn-action-edit"
                    title="Edit akun admin"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setDeleteTarget(item)}
                    className="btn-action-delete"
                    title={isSelf(item) ? 'Hapus akun Anda sendiri (Akan otomatis logout)' : 'Hapus akun admin'}
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

      {/* ── Modal Create / Edit Admin ── */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden animate-in fade-in zoom-in duration-150">
            <div className="bg-[#0E4A3E] text-white px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <ShieldCheck className="w-5 h-5 text-emerald-300" />
                <h3 className="font-extrabold text-sm sm:text-base">
                  {editingId ? 'Edit Data Akun Administrator' : 'Tambah Akun Administrator Baru'}
                </h3>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-white/80 hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Nama Lengkap Administrator *</label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Contoh: Dr. H. Ahmad Fauzi, M.Ag"
                    value={nama}
                    onChange={(e) => setNama(e.target.value)}
                    required
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm font-medium focus:outline-none focus:ring-1 focus:ring-[#0E4A3E]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Email Resmi *</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    placeholder="Contoh: admin.kkn2@syekhnurjati.ac.id"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm font-medium focus:outline-none focus:ring-1 focus:ring-[#0E4A3E]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {editingId ? 'Password Baru (Kosongkan jika tidak diubah)' : 'Password Akun *'}
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder={editingId ? 'Ketik password baru jika ingin mereset' : '8-16 karakter (kombinasi A-Z, a-z, 0-9)'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required={!editingId}
                    className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm font-medium focus:outline-none focus:ring-1 focus:ring-[#0E4A3E]"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                <p className="text-[11px] text-slate-500 mt-1 font-medium">
                  * Password harus 8-16 karakter dan mengandung kombinasi huruf kapital, huruf kecil, dan angka.
                </p>
              </div>

              <div className="flex items-center gap-3 pt-2">
                <label className="flex items-center gap-2 text-xs font-bold text-slate-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={status}
                    onChange={(e) => setStatus(e.target.checked)}
                    className="w-4 h-4 text-[#0E4A3E] rounded border-slate-300 focus:ring-[#0E4A3E]"
                  />
                  <span>Akun Aktif (Dapat masuk ke dashboard admin)</span>
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
                  {isSubmitting ? 'Menyimpan...' : editingId ? 'Simpan Perubahan' : 'Buat Akun Admin'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Modal Confirm Deactivate Self ── */}
      <ConfirmModal
        isOpen={!!deactivateSelfTarget}
        onClose={() => setDeactivateSelfTarget(null)}
        onConfirm={() => {
          if (deactivateSelfTarget) {
            return executeToggleStatus(deactivateSelfTarget, true);
          }
        }}
        title="Nonaktifkan Akun Sendiri?"
        itemName={deactivateSelfTarget?.nama}
        description="PERHATIAN: Anda akan menonaktifkan akun Anda sendiri yang sedang aktif login. Setelah dinonaktifkan, Anda akan otomatis keluar (logout) dari sistem."
        confirmLabel="Ya, Nonaktifkan & Logout"
        type="warning"
        isProcessing={isTogglingSelf}
      />

      {/* ── Modal Confirm Delete Admin ── */}
      <ConfirmModal
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDeleteConfirm}
        title={deleteTarget && isSelf(deleteTarget) ? 'Hapus Akun Anda Sendiri?' : 'Hapus Akun Administrator?'}
        itemName={deleteTarget?.nama}
        description={
          deleteTarget && isSelf(deleteTarget)
            ? `PERHATIAN: Anda akan menghapus akun "${deleteTarget.nama}" (${deleteTarget.email}) yang sedang aktif Anda gunakan saat ini. Tindakan ini tidak dapat dibatalkan. Setelah akun dihapus, sesi Anda akan langsung berakhir dan Anda akan otomatis keluar (logout) dari sistem.`
            : `Apakah Anda yakin ingin menghapus akun admin "${deleteTarget?.nama}" (${deleteTarget?.email})? Tindakan ini akan mencabut seluruh hak akses administratif.`
        }
        confirmLabel={deleteTarget && isSelf(deleteTarget) ? 'Hapus & Logout Otomatis' : 'Ya, Hapus Admin'}
        type="danger"
        isProcessing={isDeleting}
      />
    </div>
  );
}
