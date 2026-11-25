'use client';

import AdminUsersView from '@/components/admin/AdminUsersView';
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

  //Form Fields
  const [nama, setNama] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [status, setStatus] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [deactivateSelfTarget, setDeactivateSelfTarget] = useState<AdminItem | null>(null);
  const [isTogglingSelf, setIsTogglingSelf] = useState(false);

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

  const executeToggleStatus = async (item: AdminItem, isDeactivatingSelf: boolean) => {
    if (isDeactivatingSelf) setIsTogglingSelf(true);
    try {
      const res = await fetch('/api/admin/users', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id_user: item.id_user, status: !item.status }),
      });
      const json = await res.json();
      if (json.success) {
        setDeactivateSelfTarget(null);
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
    } finally {
      setIsTogglingSelf(false);
    }
  };

  const handleToggleStatus = async (item: AdminItem) => {
    const isDeactivatingSelf = isSelf(item) && item.status === true;
    if (isDeactivatingSelf) {
      setDeactivateSelfTarget(item);
      return;
    }
    await executeToggleStatus(item, false);
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
    <AdminUsersView
      items={items}
      filteredItems={filteredItems}
      isLoading={isLoading}
      searchQuery={searchQuery}
      setSearchQuery={setSearchQuery}
      filterStatus={filterStatus}
      setFilterStatus={setFilterStatus}
      statusMessage={statusMessage}
      setStatusMessage={setStatusMessage}
      isModalOpen={isModalOpen}
      setIsModalOpen={setIsModalOpen}
      isSubmitting={isSubmitting}
      editingId={editingId}
      deleteTarget={deleteTarget}
      setDeleteTarget={setDeleteTarget}
      isDeleting={isDeleting}
      isSelf={isSelf}
      nama={nama}
      setNama={setNama}
      email={email}
      setEmail={setEmail}
      password={password}
      setPassword={setPassword}
      status={status}
      setStatus={setStatus}
      showPassword={showPassword}
      setShowPassword={setShowPassword}
      deactivateSelfTarget={deactivateSelfTarget}
      setDeactivateSelfTarget={setDeactivateSelfTarget}
      isTogglingSelf={isTogglingSelf}
      handleOpenCreate={handleOpenCreate}
      handleOpenEdit={handleOpenEdit}
      handleSubmit={handleSubmit}
      handleToggleStatus={handleToggleStatus}
      executeToggleStatus={executeToggleStatus}
      handleDeleteConfirm={handleDeleteConfirm}
      totalAdmin={totalAdmin}
      totalAktif={totalAktif}
      totalNonaktif={totalNonaktif}
    />
  );
}
