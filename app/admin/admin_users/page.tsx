'use client';

import React, { useEffect, useState, useCallback, useMemo } from 'react';
import {
  Plus,
  Edit3,
  Trash2,
  AlertCircle,
  CheckCircle2,
  X,
  RefreshCw,
  Search,
  ShieldCheck,
  ShieldAlert,
  Shield,
  Mail,
  Lock,
  User,
  Users,
  Eye,
  EyeOff,
  Filter,
} from 'lucide-react';
import { PageHeader, StatCardMint, AlertBanner, ConfirmModal, FilterBar } from '@/components/ui';
import { validateStrongPassword } from '@/lib/passwordPolicy';

interface AdminItem {
  id: number;
  id_user: number;
  nama: string;
  email: string;
  role: string;
  status: boolean;
  created_at: string;
}

export default function KelolaAkunAdminPage() {
  const [items, setItems] = useState<AdminItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<'semua' | 'aktif' | 'nonaktif'>('semua');
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<AdminItem | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [currentAdmin, setCurrentAdmin] = useState<{ id_user?: number; email?: string } | null>(null);

  // Ambil data admin yang sedang login untuk identifikasi diri
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem('currentUser');
        if (stored) {
          const parsed = JSON.parse(stored);
          setCurrentAdmin({
            id_user: parsed.id_user || (parsed.id ? Number(parsed.id) : undefined),
            email: parsed.email,
          });
        }
      } catch (e) {
        console.error('Error parsing currentUser:', e);
      }
    }
  }, []);

  const isSelf = useCallback(
    (item: AdminItem | null) => {
      if (!item || !currentAdmin) return false;
      if (currentAdmin.id_user && item.id_user === currentAdmin.id_user) return true;
      if (currentAdmin.email && item.email.toLowerCase() === currentAdmin.email.toLowerCase()) return true;
      return false;
    },
    [currentAdmin]
  );

  // Form Fields
  const [nama, setNama] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [status, setStatus] = useState(true);
  const [showPassword, setShowPassword] = useState(false);

  const fetchData = useCallback(async (q = '') => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/admin/users${q ? `?search=${encodeURIComponent(q)}` : ''}`);
      const json = await res.json();
      if (json.success && json.data) {
        setItems(json.data);
      } else {
        setStatusMessage({ type: 'error', text: json.message || 'Gagal memuat data admin.' });
      }
    } catch {
      setStatusMessage({ type: 'error', text: 'Gagal terhubung ke database MySQL.' });
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      const matchSearch =
        searchQuery.trim() === '' ||
        item.nama.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.email.toLowerCase().includes(searchQuery.toLowerCase());
      const matchStatus =
        filterStatus === 'semua' ||
        (filterStatus === 'aktif' && item.status) ||
        (filterStatus === 'nonaktif' && !item.status);
      return matchSearch && matchStatus;
    });
  }, [items, searchQuery, filterStatus]);

  const totalAdmin = items.length;
  const totalAktif = items.filter((i) => i.status).length;
  const totalNonaktif = items.filter((i) => !i.status).length;

  const resetForm = () => {
    setNama('');
    setEmail('');
    setPassword('');
    setStatus(true);
    setEditingId(null);
    setShowPassword(false);
  };

  const handleOpenCreate = () => {
    resetForm();
    setIsModalOpen(true);
  };

  const handleOpenEdit = (item: AdminItem) => {
    setEditingId(item.id_user);
    setNama(item.nama);
    setEmail(item.email);
    setPassword('');
    setStatus(item.status);
    setShowPassword(false);
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nama.trim() || !email.trim()) {
      setStatusMessage({ type: 'error', text: 'Nama dan Email wajib diisi!' });
      return;
    }
    if (!editingId && !password.trim()) {
      setStatusMessage({ type: 'error', text: 'Password wajib diisi untuk akun baru!' });
      return;
    }

    if (!editingId || password.trim()) {
      const pwCheck = validateStrongPassword(password);
      if (!pwCheck.valid) {
        setStatusMessage({ type: 'error', text: pwCheck.message });
        return;
      }
    }

    setIsSubmitting(true);
    setStatusMessage(null);

    try {
      const body: Record<string, any> = {
        nama: nama.trim(),
        email: email.trim().toLowerCase(),
        status,
      };
      if (editingId) {
        body.id_user = editingId;
        if (password.trim()) body.password = password.trim();
      } else {
        body.password = password.trim();
      }

      const res = await fetch('/api/admin/users', {
        method: editingId ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      const json = await res.json();
      if (json.success) {
        setIsModalOpen(false);
        setStatusMessage({
          type: 'success',
          text: json.message || (editingId ? 'Akun Admin berhasil diperbarui!' : 'Akun Admin baru berhasil dibuat!'),
        });
        await fetchData();
      } else {
        setStatusMessage({ type: 'error', text: json.message || 'Gagal menyimpan akun admin.' });
      }
    } catch {
      setStatusMessage({ type: 'error', text: 'Gagal terhubung ke database MySQL.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleStatus = async (item: AdminItem) => {
    const isDeactivatingSelf = isSelf(item) && item.status === true;
    if (isDeactivatingSelf) {
      const confirmDeactivate = window.confirm(
        'PERHATIAN: Anda akan menonaktifkan akun Anda sendiri yang sedang aktif login. Setelah dinonaktifkan, Anda akan otomatis keluar (logout) dari sistem. Lanjutkan?'
      );
      if (!confirmDeactivate) return;
    }

    try {
      const res = await fetch('/api/admin/users', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id_user: item.id_user, status: !item.status }),
      });
      const json = await res.json();
      if (json.success) {
        if (isDeactivatingSelf || json.isDeactivatedSelf) {
          setStatusMessage({
            type: 'success',
            text: `Akun Anda telah dinonaktifkan. Mengarahkan keluar dari sistem...`,
          });
          if (typeof window !== 'undefined') {
            localStorage.removeItem('currentUser');
            document.cookie = 'user_role=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
            document.cookie = 'user_session=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
            document.cookie = 'bridge_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
          }
          setTimeout(() => {
            window.location.replace('/login?status=inactive');
          }, 1200);
          return;
        }

        setItems((prev) =>
          prev.map((i) => (i.id_user === item.id_user ? { ...i, status: !i.status } : i))
        );
        setStatusMessage({
          type: 'success',
          text: `Status akun admin "${item.nama}" diubah menjadi ${!item.status ? 'Aktif' : 'Nonaktif'}.`,
        });
      } else {
        setStatusMessage({ type: 'error', text: json.message || 'Gagal mengubah status admin.' });
      }
    } catch {
      setStatusMessage({ type: 'error', text: 'Gagal mengubah status akun admin.' });
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    const selfDeleted = isSelf(deleteTarget);

    try {
      const res = await fetch(`/api/admin/users?id=${deleteTarget.id_user}`, { method: 'DELETE' });
      const json = await res.json();
      if (json.success) {
        if (selfDeleted || json.isSelf) {
          setStatusMessage({
            type: 'success',
            text: `Akun Anda ("${deleteTarget.nama}") telah berhasil dihapus. Mengarahkan keluar dari sistem...`,
          });
          // Bersihkan seluruh sesi lokal & cookie seketika
          if (typeof window !== 'undefined') {
            localStorage.removeItem('currentUser');
            document.cookie = 'user_role=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
            document.cookie = 'user_session=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
            document.cookie = 'bridge_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
          }
          // Redirect otomatis ke login dengan status akun dihapus
          setTimeout(() => {
            window.location.replace('/login?status=deleted');
          }, 1200);
          return;
        }

        setItems((prev) => prev.filter((i) => i.id_user !== deleteTarget.id_user));
        setStatusMessage({
          type: 'success',
          text: `Akun Admin "${deleteTarget.nama}" berhasil dihapus.`,
        });
      } else {
        setStatusMessage({ type: 'error', text: json.message || 'Gagal menghapus akun admin.' });
      }
    } catch {
      setStatusMessage({ type: 'error', text: 'Gagal menghapus data dari database.' });
    } finally {
      setIsDeleting(false);
      setDeleteTarget(null);
    }
  };

  return (
    <div className="w-full max-w-7xl space-y-6 pb-12 font-sans">
      {/* ── Page Header ── */}
      <PageHeader
        title="KELOLA AKUN ADMINISTRATOR"
        subtitle="PUSAT KONTROL PENGGUNA SISTEM LP2M"
        description="Kelola hak akses dan akun administrator LP2M dengan otoritas penuh pada portal KKN Internasional."
        action={
          <button
            onClick={handleOpenCreate}
            className="btn-primary-add"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            Tambah Admin Baru
          </button>
        }
      />


      {/* ── Stat Cards ── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
        <StatCardMint value={totalAdmin} label="Total Akun Admin" subLabel="Pengelola sistem LP2M" />
        <StatCardMint value={totalAktif} label="Admin Aktif" subLabel="Memiliki hak akses login" />
        <StatCardMint value={totalNonaktif} label="Admin Nonaktif" subLabel="Akses ditangguhkan" />
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
              <div
                key={item.id_user}
                className="kkn-table-row"
              >
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
