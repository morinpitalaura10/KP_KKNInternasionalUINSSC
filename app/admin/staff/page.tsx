'use client';

import AdminStaffView from '@/components/admin/AdminStaffView';
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
  Filter,
  UserCog,
  Phone,
  Mail,
  ShieldX,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { PageHeader, StatCardMint, AlertBanner, ConfirmModal, FilterBar } from '@/components/ui';
import { validateStrongPassword } from '@/lib/passwordPolicy';

interface StaffItem {
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

export default function AdminStaffPage() {
  const [items, setItems] = useState<StaffItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState<'semua' | 'aktif' | 'nonaktif'>('semua');
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<StaffItem | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Form fields
  const [nama, setNama] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [nip, setNip] = useState('');
  const [noHp, setNoHp] = useState('');
  const [formStatus, setFormStatus] = useState<boolean>(true);

  const fetchData = useCallback(async (q = '') => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/staff${q ? `?search=${encodeURIComponent(q)}` : ''}`);
      const json = await res.json();
      if (json.success) setItems(json.data);
    } catch {
      setStatusMessage({ type: 'error', text: 'Gagal memuat data staff dari database MySQL.' });
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
        search.trim() === '' ||
        item.nama.toLowerCase().includes(search.toLowerCase()) ||
        item.email.toLowerCase().includes(search.toLowerCase()) ||
        item.nip.toLowerCase().includes(search.toLowerCase());
      const isAktif = Boolean(item.status ?? item.status_akun);
      const matchStatus =
        filterStatus === 'semua' ||
        (filterStatus === 'aktif' && isAktif) ||
        (filterStatus === 'nonaktif' && !isAktif);
      return matchSearch && matchStatus;
    });
  }, [items, search, filterStatus]);

  const totalStaff = items.length;
  const totalAktif = items.filter((i) => i.status ?? i.status_akun).length;
  const totalNonaktif = items.filter((i) => !(i.status ?? i.status_akun)).length;

  const resetForm = () => {
    setNama('');
    setEmail('');
    setPassword('');
    setNip('');
    setNoHp('');
    setFormStatus(true);
    setEditingId(null);
  };

  const handleOpenCreate = () => {
    resetForm();
    setIsModalOpen(true);
  };

  const handleOpenEdit = (item: StaffItem) => {
    setEditingId(item.id);
    setNama(item.nama);
    setEmail(item.email);
    setPassword('');
    setNip(item.nip);
    setNoHp(item.no_hp);
    setFormStatus(item.status);
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nama.trim() || !email.trim() || !nip.trim()) {
      alert('Nama, Email, dan NIP wajib diisi!');
      return;
    }
    if (!editingId && !password) {
      alert('Password wajib diisi untuk akun baru!');
      return;
    }

    if (!editingId || (password && password.trim())) {
      const pwCheck = validateStrongPassword(password);
      if (!pwCheck.valid) {
        setStatusMessage({ type: 'error', text: pwCheck.message });
        return;
      }
    }

    setIsSubmitting(true);
    setStatusMessage(null);

    try {
      const res = await fetch('/api/staff', {
        method: editingId ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: editingId,
          nama: nama.trim(),
          email: email.trim(),
          password: password || undefined,
          nip: nip.trim(),
          no_hp: noHp.trim(),
          status: formStatus,
        }),
      });

      const json = await res.json();
      if (json.success) {
        setIsModalOpen(false);
        setStatusMessage({
          type: 'success',
          text: editingId ? `Akun staff "${nama}" berhasil diperbarui!` : `Akun staff "${nama}" berhasil ditambahkan!`,
        });
        await fetchData(search);
      } else {
        setStatusMessage({ type: 'error', text: json.message || 'Gagal menyimpan data staff.' });
      }
    } catch {
      setStatusMessage({ type: 'error', text: 'Gagal terhubung ke database MySQL.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/staff?id=${deleteTarget.id}`, { method: 'DELETE' });
      const json = await res.json();
      if (json.success) {
        setStatusMessage({ type: 'success', text: `Akun staff "${deleteTarget.nama}" berhasil dihapus!` });
        setDeleteTarget(null);
        await fetchData(search);
      } else {
        setStatusMessage({ type: 'error', text: json.message || 'Gagal menghapus staff.' });
      }
    } catch {
      setStatusMessage({ type: 'error', text: 'Terjadi kesalahan saat menghapus data staff.' });
    } finally {
      setIsDeleting(false);
    }
  };


  return (
    <AdminStaffView
      items={items}
      filteredItems={filteredItems}
      isLoading={isLoading}
      search={search}
      setSearch={setSearch}
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
      nama={nama}
      setNama={setNama}
      email={email}
      setEmail={setEmail}
      password={password}
      setPassword={setPassword}
      nip={nip}
      setNip={setNip}
      noHp={noHp}
      setNoHp={setNoHp}
      formStatus={formStatus}
      setFormStatus={setFormStatus}
      handleOpenCreate={handleOpenCreate}
      handleOpenEdit={handleOpenEdit}
      handleSubmit={handleSubmit}
      handleDeleteConfirm={handleDeleteConfirm}
      totalStaff={totalStaff}
      totalAktif={totalAktif}
      totalNonaktif={totalNonaktif}
    />
  );
}
