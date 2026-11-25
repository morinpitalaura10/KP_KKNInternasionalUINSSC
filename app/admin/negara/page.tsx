'use client';

import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { AdminNegaraView, NegaraItem, ActivePeriode } from '@/components/admin';

export default function AdminKelolaNegaraPage() {
  const [items, setItems] = useState<NegaraItem[]>([]);
  const [activePeriode, setActivePeriode] = useState<ActivePeriode | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'aktif' | 'nonaktif'>('all');
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  const [activeItem, setActiveItem] = useState<NegaraItem | null>(null);
  const [formNama, setFormNama] = useState('');
  const [formStatus, setFormStatus] = useState(true);
  const [formFoto, setFormFoto] = useState('/thailand_kkn.jpg');
  const [formDeskripsi, setFormDeskripsi] = useState('');
  const [formAddToPeriode, setFormAddToPeriode] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploadingFoto, setIsUploadingFoto] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  // Delete State
  const [deleteTarget, setDeleteTarget] = useState<NegaraItem | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Fetch negara list
  const fetchNegara = useCallback(async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      if (search.trim()) params.set('search', search.trim());
      if (statusFilter !== 'all') params.set('status', statusFilter);

      const res = await fetch(`/api/negara?${params.toString()}`);
      const json = await res.json();
      if (json.success) {
        setItems(json.data || []);
        setActivePeriode(json.activePeriode || null);
      } else {
        setStatusMessage({ type: 'error', text: json.message || 'Gagal memuat data' });
      }
    } catch {
      setStatusMessage({ type: 'error', text: 'Terjadi kendala jaringan saat memuat data.' });
    } finally {
      setIsLoading(false);
    }
  }, [search, statusFilter]);

  useEffect(() => {
    fetchNegara();
  }, [fetchNegara]);

  // Statistics
  const stats = useMemo(() => {
    const total = items.length;
    const aktif = items.filter((i) => i.status).length;
    const diPeriodeAktif = items.filter((i) => i.isActiveInCurrentPeriode).length;
    return { total, aktif, diPeriodeAktif };
  }, [items]);

  // Handle open modal
  const handleOpenCreate = () => {
    setModalMode('create');
    setActiveItem(null);
    setFormNama('');
    setFormStatus(true);
    setFormFoto('');
    setFormDeskripsi('');
    setFormAddToPeriode(true);
    setUploadError(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (item: NegaraItem) => {
    setModalMode('edit');
    setActiveItem(item);
    setFormNama(item.nama_negara);
    setFormStatus(item.status);
    setFormFoto(item.foto || '');
    setFormDeskripsi(item.deskripsi || '');
    setFormAddToPeriode(item.isActiveInCurrentPeriode);
    setUploadError(null);
    setIsModalOpen(true);
  };

  // Upload foto kegiatan
  const handleUploadFoto = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingFoto(true);
    setUploadError(null);

    try {
      const data = new FormData();
      data.append('file', file);

      const res = await fetch('/api/negara/upload', {
        method: 'POST',
        body: data,
      });

      const json = await res.json();
      if (json.success && json.filePath) {
        setFormFoto(json.filePath);
      } else {
        setUploadError(json.message || 'Gagal mengunggah foto.');
      }
    } catch {
      setUploadError('Terjadi kesalahan jaringan saat mengunggah foto.');
    } finally {
      setIsUploadingFoto(false);
      e.target.value = '';
    }
  };

  // Submit Modal
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formNama.trim()) return;

    setIsSubmitting(true);
    setStatusMessage(null);

    try {
      if (modalMode === 'create') {
        const res = await fetch('/api/negara', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            nama_negara: formNama.trim(),
            status: formStatus,
            foto: formFoto.trim(),
            deskripsi: formDeskripsi.trim(),
            addToActivePeriode: formAddToPeriode,
          }),
        });
        const json = await res.json();
        if (json.success) {
          setStatusMessage({ type: 'success', text: json.message });
          setIsModalOpen(false);
          fetchNegara();
        } else {
          setStatusMessage({ type: 'error', text: json.message });
        }
      } else if (activeItem) {
        const res = await fetch('/api/negara', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id_negara: activeItem.id_negara,
            nama_negara: formNama.trim(),
            status: formStatus,
            foto: formFoto.trim(),
            deskripsi: formDeskripsi.trim(),
            toggleCurrentPeriode: formAddToPeriode !== activeItem.isActiveInCurrentPeriode ? formAddToPeriode : undefined,
          }),
        });
        const json = await res.json();
        if (json.success) {
          setStatusMessage({ type: 'success', text: json.message });
          setIsModalOpen(false);
          fetchNegara();
        } else {
          setStatusMessage({ type: 'error', text: json.message });
        }
      }
    } catch {
      setStatusMessage({ type: 'error', text: 'Gagal memproses data negara.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Quick toggle status in active period
  const handleToggleActivePeriode = async (item: NegaraItem) => {
    try {
      const nextState = !item.isActiveInCurrentPeriode;
      const res = await fetch('/api/negara', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id_negara: item.id_negara,
          toggleCurrentPeriode: nextState,
        }),
      });
      const json = await res.json();
      if (json.success) {
        setStatusMessage({ type: 'success', text: json.message });
        fetchNegara();
      } else {
        setStatusMessage({ type: 'error', text: json.message });
      }
    } catch {
      setStatusMessage({ type: 'error', text: 'Gagal memperbarui status periode negara.' });
    }
  };

  // Quick toggle system status
  const handleToggleSystemStatus = async (item: NegaraItem) => {
    try {
      const nextState = !item.status;
      const res = await fetch('/api/negara', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id_negara: item.id_negara,
          status: nextState,
        }),
      });
      const json = await res.json();
      if (json.success) {
        setStatusMessage({ type: 'success', text: json.message });
        fetchNegara();
      } else {
        setStatusMessage({ type: 'error', text: json.message });
      }
    } catch {
      setStatusMessage({ type: 'error', text: 'Gagal memperbarui status negara.' });
    }
  };

  // Delete
  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    setStatusMessage(null);

    try {
      const res = await fetch(`/api/negara?id=${deleteTarget.id_negara}`, {
        method: 'DELETE',
      });
      const json = await res.json();
      if (json.success) {
        setStatusMessage({ type: 'success', text: json.message });
        setDeleteTarget(null);
        fetchNegara();
      } else {
        setStatusMessage({ type: 'error', text: json.message });
      }
    } catch {
      setStatusMessage({ type: 'error', text: 'Gagal menghapus negara.' });
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <AdminNegaraView
      items={items}
      activePeriode={activePeriode}
      isLoading={isLoading}
      search={search}
      setSearch={setSearch}
      statusFilter={statusFilter}
      setStatusFilter={setStatusFilter}
      statusMessage={statusMessage}
      setStatusMessage={setStatusMessage}
      stats={stats}
      fetchNegara={fetchNegara}
      isModalOpen={isModalOpen}
      setIsModalOpen={setIsModalOpen}
      modalMode={modalMode}
      formNama={formNama}
      setFormNama={setFormNama}
      formStatus={formStatus}
      setFormStatus={setFormStatus}
      formFoto={formFoto}
      setFormFoto={setFormFoto}
      formDeskripsi={formDeskripsi}
      setFormDeskripsi={setFormDeskripsi}
      formAddToPeriode={formAddToPeriode}
      setFormAddToPeriode={setFormAddToPeriode}
      isSubmitting={isSubmitting}
      isUploadingFoto={isUploadingFoto}
      uploadError={uploadError}
      handleOpenCreate={handleOpenCreate}
      handleOpenEdit={handleOpenEdit}
      handleUploadFoto={handleUploadFoto}
      handleSubmit={handleSubmit}
      handleToggleSystemStatus={handleToggleSystemStatus}
      handleToggleActivePeriode={handleToggleActivePeriode}
      deleteTarget={deleteTarget}
      setDeleteTarget={setDeleteTarget}
      isDeleting={isDeleting}
      handleConfirmDelete={handleConfirmDelete}
    />
  );
}
