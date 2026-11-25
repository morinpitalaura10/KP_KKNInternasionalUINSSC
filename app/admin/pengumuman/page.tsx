'use client';

import AdminPengumumanView from '@/components/admin/AdminPengumumanView';
import React, { useEffect, useState, useCallback, useMemo } from 'react';
import {
  Plus,
  Edit3,
  Trash2,
  AlertCircle,
  CheckCircle2,
  X,
  RefreshCw,
  Newspaper,
  Calendar,
  ChevronLeft,
  ChevronRight,
  History,
  Eye,
  EyeOff,
} from 'lucide-react';
import { PageHeader, AlertBanner, ConfirmModal, LogPublikasiModal, FilterBar } from '@/components/ui';

interface PeriodeOption {
  id: number;
  nama: string;
  tahunAkademik: string;
  status?: string;
}

interface PengumumanItem {
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

const ADMIN_USER_ID = 3;

export default function AdminPengumumanPage() {
  const [items, setItems] = useState<PengumumanItem[]>([]);
  const [periodes, setPeriodes] = useState<PeriodeOption[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Search & Filter
  const [searchQuery, setSearchQuery] = useState('');
  const [filterPeriode, setFilterPeriode] = useState<string>('');
  const [filterStatus, setFilterStatus] = useState<string>('semua');

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLogModalOpen, setIsLogModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<PengumumanItem | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Form fields
  const [idPeriode, setIdPeriode] = useState('');
  const [judul, setJudul] = useState('');
  const [isi, setIsi] = useState('');
  const [tanggalPublish, setTanggalPublish] = useState('');
  const [formStatus, setFormStatus] = useState<boolean>(true);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [pengRes, perRes] = await Promise.all([
        fetch('/api/pengumuman?admin=true'),
        fetch('/api/periode'),
      ]);
      const pengJson = await pengRes.json();
      const perJson = await perRes.json();

      if (pengJson.success) setItems(pengJson.data);
      if (perJson.success) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const mapped: PeriodeOption[] = perJson.data.map((p: any) => ({
          id: p.id_periode || p.id,
          nama: p.nama_periode || p.nama,
          tahunAkademik: p.tahunAkademik || String(p.tahun),
          status: p.status,
        }));
        setPeriodes(mapped);

        // Otomatis jadikan periode yang berstatus Aktif sebagai default yang muncul pertama kali
        const activeP = mapped.find((p) => p.status === 'Aktif') || mapped[0];
        if (activeP) {
          setFilterPeriode((prev) => (prev ? prev : String(activeP.id)));
          setIdPeriode((prev) => (!prev ? String(activeP.id) : prev));
        }
      }
    } catch {
      setStatusMessage({ type: 'error', text: 'Gagal memuat data dari database MySQL.' });
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Filtered List
  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      const matchSearch =
        searchQuery.trim() === '' ||
        item.judul.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.isi.toLowerCase().includes(searchQuery.toLowerCase());

      const matchPeriode =
        !filterPeriode || filterPeriode === 'semua' || String(item.id_periode) === filterPeriode;

      const matchStatus =
        filterStatus === 'semua' ||
        (filterStatus === 'publish' && item.status) ||
        (filterStatus === 'private' && !item.status);

      return matchSearch && matchPeriode && matchStatus;
    });
  }, [items, searchQuery, filterPeriode, filterStatus]);

  const resetForm = () => {
    setJudul('');
    setIsi('');
    const activeP = periodes.find((p) => p.status === 'Aktif');
    let targetPId = '1';
    if (filterPeriode && filterPeriode !== 'semua') {
      targetPId = filterPeriode;
    } else if (activeP) {
      targetPId = String(activeP.id);
    } else if (periodes.length > 0) {
      targetPId = String(periodes[0].id);
    }
    setIdPeriode(targetPId);
    setTanggalPublish(new Date().toISOString().split('T')[0]);
    setFormStatus(true);
    setEditingId(null);
  };

  const handleOpenCreate = () => {
    resetForm();
    setIsModalOpen(true);
  };

  const handleOpenEdit = (item: PengumumanItem) => {
    setEditingId(item.id);
    setJudul(item.judul);
    setIsi(item.isi);
    setIdPeriode(String(item.id_periode));
    setTanggalPublish(item.tanggal_publish ? item.tanggal_publish.split('T')[0] : '');
    setFormStatus(item.status);
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!judul.trim() || !isi.trim() || !idPeriode) {
      alert('Periode, judul, dan isi wajib diisi!');
      return;
    }
    setIsSubmitting(true);
    setStatusMessage(null);

    try {
      const res = await fetch('/api/pengumuman', {
        method: editingId ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: editingId,
          id_periode: parseInt(idPeriode, 10),
          id_user: ADMIN_USER_ID,
          judul,
          isi,
          tanggal_publish: tanggalPublish,
          status: formStatus,
        }),
      });
      const json = await res.json();
      if (json.success) {
        setIsModalOpen(false);
        setStatusMessage({
          type: 'success',
          text: editingId
            ? `Pengumuman "${judul}" berhasil diperbarui!`
            : `Pengumuman "${judul}" berhasil ditambahkan!`,
        });
        await fetchData();
      } else {
        setStatusMessage({ type: 'error', text: json.message || 'Gagal menyimpan pengumuman.' });
      }
    } catch {
      setStatusMessage({ type: 'error', text: 'Gagal terhubung ke database MySQL.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleStatus = async (item: PengumumanItem) => {
    const nextStatus = !item.status;
    try {
      const res = await fetch('/api/pengumuman', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: item.id,
          status: nextStatus,
        }),
      });
      const json = await res.json();
      if (json.success) {
        setItems((prev) => prev.map((i) => (i.id === item.id ? { ...i, status: nextStatus } : i)));
        setStatusMessage({
          type: 'success',
          text: `Status pengumuman "${item.judul}" diubah menjadi ${nextStatus ? 'Publish' : 'Private'} dan tercatat di Log Audit!`,
        });
      }
    } catch {
      setStatusMessage({ type: 'error', text: 'Gagal mengubah status publikasi pengumuman.' });
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/pengumuman?id=${deleteTarget.id}`, { method: 'DELETE' });
      const json = await res.json();
      if (json.success) {
        setStatusMessage({ type: 'success', text: `Pengumuman "${deleteTarget.judul}" berhasil dihapus!` });
        setDeleteTarget(null);
        await fetchData();
      } else {
        setStatusMessage({ type: 'error', text: json.message || 'Gagal menghapus pengumuman.' });
      }
    } catch {
      setStatusMessage({ type: 'error', text: 'Terjadi kesalahan saat menghapus pengumuman.' });
    } finally {
      setIsDeleting(false);
    }
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '-';
    try {
      return new Date(dateStr).toLocaleDateString('id-ID', {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
      });
    } catch {
      return dateStr;
    }
  };


  return (
    <AdminPengumumanView
      periodes={periodes}
      filteredItems={filteredItems}
      isLoading={isLoading}
      statusMessage={statusMessage}
      setStatusMessage={setStatusMessage}
      searchQuery={searchQuery}
      setSearchQuery={setSearchQuery}
      filterPeriode={filterPeriode}
      setFilterPeriode={setFilterPeriode}
      filterStatus={filterStatus}
      setFilterStatus={setFilterStatus}
      isModalOpen={isModalOpen}
      setIsModalOpen={setIsModalOpen}
      isLogModalOpen={isLogModalOpen}
      setIsLogModalOpen={setIsLogModalOpen}
      isSubmitting={isSubmitting}
      editingId={editingId}
      deleteTarget={deleteTarget}
      setDeleteTarget={setDeleteTarget}
      isDeleting={isDeleting}
      idPeriode={idPeriode}
      setIdPeriode={setIdPeriode}
      judul={judul}
      setJudul={setJudul}
      isi={isi}
      setIsi={setIsi}
      tanggalPublish={tanggalPublish}
      setTanggalPublish={setTanggalPublish}
      formStatus={formStatus}
      setFormStatus={setFormStatus}
      handleOpenCreate={handleOpenCreate}
      handleOpenEdit={handleOpenEdit}
      handleSubmit={handleSubmit}
      handleToggleStatus={handleToggleStatus}
      handleDeleteConfirm={handleDeleteConfirm}
      formatDate={formatDate}
    />
  );
}
