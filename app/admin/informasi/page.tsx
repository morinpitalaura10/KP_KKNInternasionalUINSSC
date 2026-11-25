'use client';

import AdminInformasiView from '@/components/admin/AdminInformasiView';
import React, { useEffect, useState, useCallback, useMemo } from 'react';
import {
  Plus, Edit3, Trash2, AlertCircle, CheckCircle2, X, RefreshCw,
  Info, Calendar, Search, FileText, Filter,
  AlertTriangle, Globe2, Upload, Loader2, Image as ImageIcon, Check,
} from 'lucide-react';
import { PageHeader, StatCardMint, AlertBanner, ConfirmModal, FilterBar } from '@/components/ui';

interface PeriodeOption {
  id: number;
  nama: string;
  tahunAkademik: string;
}

interface InformasiItem {
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

// Dummy admin id_user - seharusnya dari session/auth
const ADMIN_USER_ID = 1;

export default function AdminKelolaInformasiPage() {
  const [items, setItems] = useState<InformasiItem[]>([]);
  const [periodes, setPeriodes] = useState<PeriodeOption[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Search & Filter
  const [searchQuery, setSearchQuery] = useState('');
  const [filterPeriode, setFilterPeriode] = useState<string>('semua');
  const [filterStatus, setFilterStatus] = useState<'semua' | 'aktif' | 'nonaktif'>('semua');

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<InformasiItem | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [togglingId, setTogglingId] = useState<number | null>(null);

  // Form fields
  const [idPeriode, setIdPeriode] = useState('');
  const [judul, setJudul] = useState('');
  const [isi, setIsi] = useState('');
  const [gambar, setGambar] = useState('');
  const [isUploadingGambar, setIsUploadingGambar] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [infoRes, perRes] = await Promise.all([
        fetch('/api/informasi?admin=true'),
        fetch('/api/periode'),
      ]);
      const infoJson = await infoRes.json();
      const perJson = await perRes.json();

      if (infoJson.success) setItems(infoJson.data);
      if (perJson.success) {
        setPeriodes(perJson.data.map((p: any) => ({
          id: p.id_periode || p.id,
          nama: p.nama_periode || p.nama,
          tahunAkademik: p.tahunAkademik || String(p.tahun),
        })));
      }
    } catch {
      setStatusMessage({ type: 'error', text: 'Gagal memuat data dari database MySQL.' });
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  // Filtered items
  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      const matchSearch = searchQuery.trim() === '' ||
        item.judul.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.isi.toLowerCase().includes(searchQuery.toLowerCase());
      const matchStatus =
        filterStatus === 'semua' ||
        (filterStatus === 'aktif' && item.status) ||
        (filterStatus === 'nonaktif' && !item.status);
      const matchPeriode =
        filterPeriode === 'semua' ||
        (filterPeriode === 'umum' && item.id_periode === null) ||
        (item.id_periode !== null && String(item.id_periode) === filterPeriode);
      return matchSearch && matchStatus && matchPeriode;
    });
  }, [items, searchQuery, filterStatus, filterPeriode]);

  // Stats
  const totalInfo = items.length;
  const totalAktif = items.filter((i) => i.status).length;
  const totalSelaluAktif = items.filter((i) => i.id_periode === null).length;
  const totalDenganPeriode = items.filter((i) => i.id_periode !== null).length;

  const resetForm = () => {
    setJudul(''); setIsi(''); setGambar(''); setIdPeriode('');
    setEditingId(null);
    setUploadError(null);
  };

  const handleOpenCreate = () => {
    resetForm();
    setIsModalOpen(true);
  };

  const handleOpenEdit = (item: InformasiItem) => {
    setEditingId(item.id);
    setJudul(item.judul);
    setIsi(item.isi);
    setGambar(item.gambar || '');
    setIdPeriode(item.id_periode ? String(item.id_periode) : '');
    setUploadError(null);
    setIsModalOpen(true);
  };

  const handleUploadGambar = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingGambar(true);
    setUploadError(null);

    try {
      const data = new FormData();
      data.append('file', file);

      const res = await fetch('/api/informasi/upload', {
        method: 'POST',
        body: data,
      });

      const json = await res.json();
      if (json.success && json.filePath) {
        setGambar(json.filePath);
      } else {
        setUploadError(json.message || 'Gagal mengunggah berkas gambar.');
      }
    } catch {
      setUploadError('Terjadi kesalahan jaringan saat mengunggah gambar.');
    } finally {
      setIsUploadingGambar(false);
      e.target.value = '';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!judul.trim() || !isi.trim()) {
      setStatusMessage({ type: 'error', text: 'Judul dan isi informasi wajib diisi!' });
      return;
    }
    setIsSubmitting(true);
    setStatusMessage(null);

    try {
      const body: Record<string, unknown> = {
        id_user: ADMIN_USER_ID,
        judul,
        isi,
        gambar: gambar || null,
        id_periode: idPeriode ? parseInt(idPeriode, 10) : null,
      };
      if (editingId) body.id = editingId;

      const res = await fetch('/api/informasi', {
        method: editingId ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const json = await res.json();
      if (json.success) {
        setIsModalOpen(false);
        setStatusMessage({ type: 'success', text: editingId ? `Informasi "${judul}" berhasil diperbarui!` : `Informasi "${judul}" berhasil ditambahkan!` });
        await fetchData();
      } else {
        setStatusMessage({ type: 'error', text: json.message || 'Gagal menyimpan informasi.' });
      }
    } catch {
      setStatusMessage({ type: 'error', text: 'Gagal terhubung ke database MySQL.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleStatus = async (item: InformasiItem) => {
    setTogglingId(item.id);
    try {
      const res = await fetch('/api/informasi', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: item.id, status: !item.status }),
      });
      const json = await res.json();
      if (json.success) {
        setStatusMessage({ type: 'success', text: `Status "${item.judul}" berhasil diubah menjadi ${!item.status ? 'Aktif' : 'Nonaktif'}.` });
        await fetchData();
      } else {
        setStatusMessage({ type: 'error', text: json.message || 'Gagal mengubah status informasi.' });
      }
    } catch {
      setStatusMessage({ type: 'error', text: 'Gagal mengubah status informasi.' });
    } finally {
      setTogglingId(null);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/informasi?id=${deleteTarget.id}`, { method: 'DELETE' });
      const json = await res.json();
      if (json.success) {
        setStatusMessage({ type: 'success', text: `Informasi "${deleteTarget.judul}" berhasil dihapus!` });
        setDeleteTarget(null);
        await fetchData();
      } else {
        setStatusMessage({ type: 'error', text: json.message || 'Gagal menghapus informasi.' });
      }
    } catch {
      setStatusMessage({ type: 'error', text: 'Terjadi kesalahan saat menghapus informasi.' });
    } finally {
      setIsDeleting(false);
    }
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '-';
    try { return new Date(dateStr).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' }); }
    catch { return dateStr; }
  };


  return (
    <AdminInformasiView
      items={items}
      filteredItems={filteredItems}
      periodes={periodes}
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
      isSubmitting={isSubmitting}
      editingId={editingId}
      deleteTarget={deleteTarget}
      setDeleteTarget={setDeleteTarget}
      isDeleting={isDeleting}
      togglingId={togglingId}
      idPeriode={idPeriode}
      setIdPeriode={setIdPeriode}
      judul={judul}
      setJudul={setJudul}
      isi={isi}
      setIsi={setIsi}
      gambar={gambar}
      setGambar={setGambar}
      isUploadingGambar={isUploadingGambar}
      uploadError={uploadError}
      handleOpenCreate={handleOpenCreate}
      handleOpenEdit={handleOpenEdit}
      handleUploadGambar={handleUploadGambar}
      handleSubmit={handleSubmit}
      handleToggleStatus={handleToggleStatus}
      handleDeleteConfirm={handleDeleteConfirm}
      totalInfo={totalInfo}
      totalAktif={totalAktif}
      totalSelaluAktif={totalSelaluAktif}
      totalDenganPeriode={totalDenganPeriode}
      formatDate={formatDate}
    />
  );
}
