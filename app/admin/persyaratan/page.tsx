'use client';

import React, { useEffect, useState, useCallback, useMemo } from 'react';
import {
  AdminPersyaratanView,
  PersyaratanItem,
  TEMPLATES,
} from '@/components/admin';
import type { PeriodeOption } from '@/components/admin/AdminPersyaratanView';

export default function AdminKelolaPersyaratanPage() {
  // Dokumen State
  const [items, setItems] = useState<PersyaratanItem[]>([]);
  const [periodes, setPeriodes] = useState<PeriodeOption[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Search & Filter Dokumen
  const [searchQuery, setSearchQuery] = useState('');
  const [filterPeriode, setFilterPeriode] = useState<string>('semua');
  const [filterStatus, setFilterStatus] = useState<'semua' | 'aktif' | 'nonaktif'>('semua');

  // Modal Create / Edit Dokumen
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<PersyaratanItem | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [togglingId, setTogglingId] = useState<number | null>(null);

  // Modal Tarik / Salin dari Periode Lain
  const [isCopyModalOpen, setIsCopyModalOpen] = useState(false);
  const [copySourcePeriode, setCopySourcePeriode] = useState<string>('');
  const [copyTargetPeriode, setCopyTargetPeriode] = useState<string>('');
  const [copyMode, setCopyMode] = useState<'append' | 'replace'>('append');
  const [isCopying, setIsCopying] = useState(false);

  // Form Dokumen fields
  const [idPeriode, setIdPeriode] = useState('');
  const [namaPersyaratan, setNamaPersyaratan] = useState('');
  const [deskripsi, setDeskripsi] = useState('');
  const [formatFile, setFormatFile] = useState('');
  const [ukuranMaksimal, setUkuranMaksimal] = useState('2048');
  const [wajib, setWajib] = useState(true);

  // Fetch Dokumen
  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [persRes, perRes] = await Promise.all([
        fetch('/api/persyaratan?admin=true'),
        fetch('/api/periode'),
      ]);
      const persJson = await persRes.json();
      const perJson = await perRes.json();

      if (persJson.success) setItems(persJson.data);
      if (perJson.success) {
        const mapped: PeriodeOption[] = perJson.data.map((p: any) => ({
          id: p.id_periode || p.id,
          nama: p.nama_periode || p.nama,
          tahunAkademik: p.tahunAkademik || String(p.tahun),
          status: p.status,
        }));
        setPeriodes(mapped);

        // Otomatis jadikan periode yang berstatus Aktif sebagai default filter
        const activeP = mapped.find((p) => p.status === 'Aktif') || mapped[0];
        if (activeP) {
          setFilterPeriode((prev) => (prev === 'semua' ? String(activeP.id) : prev));
        }
      }
    } catch {
      setStatusMessage({ type: 'error', text: 'Gagal memuat data persyaratan dokumen dari MySQL.' });
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Filtered items Dokumen
  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      const matchSearch =
        searchQuery.trim() === '' ||
        item.nama_persyaratan.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.deskripsi.toLowerCase().includes(searchQuery.toLowerCase());
      const matchStatus =
        filterStatus === 'semua' ||
        (filterStatus === 'aktif' && item.status) ||
        (filterStatus === 'nonaktif' && !item.status);
      const matchPeriode =
        filterPeriode === 'semua' || String(item.id_periode) === filterPeriode;
      return matchSearch && matchStatus && matchPeriode;
    });
  }, [items, searchQuery, filterStatus, filterPeriode]);

  // Scoped Items untuk Stat Cards
  const scopedItems = useMemo(() => {
    if (filterPeriode === 'semua') return items;
    return items.filter((item) => String(item.id_periode) === filterPeriode);
  }, [items, filterPeriode]);

  const totalPersyaratan = scopedItems.length;
  const totalAktif = scopedItems.filter((i) => i.status).length;
  const totalWajib = scopedItems.filter((i) => i.wajib).length;
  const totalOpsional = scopedItems.filter((i) => !i.wajib).length;

  const activeFilteredPeriode = useMemo(() => {
    if (filterPeriode === 'semua') return null;
    return periodes.find((p) => String(p.id) === filterPeriode) || null;
  }, [filterPeriode, periodes]);

  const resetForm = () => {
    setNamaPersyaratan('');
    setDeskripsi('');
    setFormatFile('');
    setUkuranMaksimal('2048');
    setWajib(true);
    setIdPeriode('');
    setEditingId(null);
  };

  const handleOpenCreate = () => {
    resetForm();
    const activeP = periodes.find((p) => p.status === 'Aktif');
    if (filterPeriode !== 'semua') {
      setIdPeriode(filterPeriode);
    } else if (activeP) {
      setIdPeriode(String(activeP.id));
    } else if (periodes.length > 0) {
      setIdPeriode(String(periodes[0].id));
    }
    setIsModalOpen(true);
  };

  const handleApplyTemplate = (tmpl: typeof TEMPLATES[0]) => {
    setNamaPersyaratan(tmpl.nama);
    setDeskripsi(tmpl.deskripsi);
    setFormatFile(tmpl.format);
    setUkuranMaksimal(tmpl.ukuran);
    setWajib(tmpl.wajib);
  };

  const handleOpenCopyModal = () => {
    const activeP = periodes.find((p) => p.status === 'Aktif') || periodes[0];
    const defaultTargetId = filterPeriode !== 'semua' ? filterPeriode : activeP ? String(activeP.id) : '';

    setCopyTargetPeriode(defaultTargetId);

    const otherPeriode =
      periodes.find((p) => String(p.id) !== defaultTargetId && items.some((i) => i.id_periode === p.id)) ||
      periodes.find((p) => String(p.id) !== defaultTargetId);

    if (otherPeriode) {
      setCopySourcePeriode(String(otherPeriode.id));
    }
    setCopyMode('append');
    setIsCopyModalOpen(true);
  };

  const handleExecuteCopy = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!copySourcePeriode || !copyTargetPeriode) {
      setStatusMessage({ type: 'error', text: 'Pilih periode asal dan periode tujuan terlebih dahulu!' });
      return;
    }
    if (copySourcePeriode === copyTargetPeriode) {
      setStatusMessage({ type: 'error', text: 'Periode asal dan periode tujuan tidak boleh sama!' });
      return;
    }

    setIsCopying(true);
    setStatusMessage(null);
    try {
      const res = await fetch('/api/persyaratan/copy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          source_id_periode: parseInt(copySourcePeriode, 10),
          target_id_periode: parseInt(copyTargetPeriode, 10),
          mode: copyMode,
        }),
      });
      const json = await res.json();
      if (json.success) {
        setStatusMessage({ type: 'success', text: json.message });
        setIsCopyModalOpen(false);
        setFilterPeriode(copyTargetPeriode);
        await fetchData();
      } else {
        setStatusMessage({ type: 'error', text: json.message || 'Gagal menyalin dokumen persyaratan.' });
      }
    } catch {
      setStatusMessage({ type: 'error', text: 'Gagal terhubung ke database MySQL.' });
    } finally {
      setIsCopying(false);
    }
  };

  const handleOpenEdit = (item: PersyaratanItem) => {
    setEditingId(item.id);
    setNamaPersyaratan(item.nama_persyaratan);
    setDeskripsi(item.deskripsi);
    setFormatFile(item.format_file);
    setUkuranMaksimal(String(item.ukuran_maksimal));
    setWajib(item.wajib);
    setIdPeriode(item.id_periode ? String(item.id_periode) : '');
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!namaPersyaratan.trim() || !deskripsi.trim() || !formatFile.trim() || !idPeriode) {
      setStatusMessage({ type: 'error', text: 'Semua field wajib diisi (Periode, Nama, Deskripsi, Format File)!' });
      return;
    }
    setIsSubmitting(true);
    setStatusMessage(null);

    try {
      const body: Record<string, unknown> = {
        id_periode: parseInt(idPeriode, 10),
        nama_persyaratan: namaPersyaratan,
        deskripsi,
        format_file: formatFile,
        ukuran_maksimal: parseInt(ukuranMaksimal, 10) || 2048,
        wajib,
      };
      if (editingId) body.id = editingId;

      const res = await fetch('/api/persyaratan', {
        method: editingId ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const json = await res.json();
      if (json.success) {
        setIsModalOpen(false);
        setStatusMessage({
          type: 'success',
          text: editingId
            ? `Persyaratan "${namaPersyaratan}" berhasil diperbarui!`
            : `Persyaratan "${namaPersyaratan}" berhasil ditambahkan!`,
        });
        await fetchData();
      } else {
        setStatusMessage({ type: 'error', text: json.message || 'Gagal menyimpan persyaratan.' });
      }
    } catch {
      setStatusMessage({ type: 'error', text: 'Gagal terhubung ke database MySQL.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleStatus = async (item: PersyaratanItem) => {
    setTogglingId(item.id);
    try {
      const res = await fetch('/api/persyaratan', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: item.id, status: !item.status }),
      });
      const json = await res.json();
      if (json.success) {
        setItems((prev) => prev.map((p) => (p.id === item.id ? { ...p, status: !p.status } : p)));
        setStatusMessage({
          type: 'success',
          text: `Status persyaratan "${item.nama_persyaratan}" diubah menjadi ${!item.status ? 'Aktif' : 'Nonaktif'}.`,
        });
      }
    } catch {
      setStatusMessage({ type: 'error', text: 'Gagal mengubah status persyaratan.' });
    } finally {
      setTogglingId(null);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/persyaratan?id=${deleteTarget.id}`, { method: 'DELETE' });
      const json = await res.json();
      if (json.success) {
        setItems((prev) => prev.filter((p) => p.id !== deleteTarget.id));
        setStatusMessage({
          type: 'success',
          text: `Persyaratan "${deleteTarget.nama_persyaratan}" berhasil dihapus dari database.`,
        });
      } else {
        setStatusMessage({ type: 'error', text: json.message || 'Gagal menghapus persyaratan.' });
      }
    } catch {
      setStatusMessage({ type: 'error', text: 'Gagal menghapus data dari database.' });
    } finally {
      setIsDeleting(false);
      setDeleteTarget(null);
    }
  };

  function formatFileSize(kb: number): string {
    if (kb >= 1024) return `${(kb / 1024).toFixed(0)} MB`;
    return `${kb} KB`;
  }

  return (
    <AdminPersyaratanView
      items={items}
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
      filteredItems={filteredItems}
      scopedItems={scopedItems}
      activeFilteredPeriode={activeFilteredPeriode}
      totalPersyaratan={totalPersyaratan}
      totalAktif={totalAktif}
      totalWajib={totalWajib}
      totalOpsional={totalOpsional}
      formatFileSize={formatFileSize}
      isModalOpen={isModalOpen}
      setIsModalOpen={setIsModalOpen}
      isSubmitting={isSubmitting}
      editingId={editingId}
      idPeriode={idPeriode}
      setIdPeriode={setIdPeriode}
      namaPersyaratan={namaPersyaratan}
      setNamaPersyaratan={setNamaPersyaratan}
      deskripsi={deskripsi}
      setDeskripsi={setDeskripsi}
      formatFile={formatFile}
      setFormatFile={setFormatFile}
      ukuranMaksimal={ukuranMaksimal}
      setUkuranMaksimal={setUkuranMaksimal}
      wajib={wajib}
      setWajib={setWajib}
      handleOpenCreate={handleOpenCreate}
      handleOpenEdit={handleOpenEdit}
      handleApplyTemplate={handleApplyTemplate}
      handleSubmit={handleSubmit}
      isCopyModalOpen={isCopyModalOpen}
      setIsCopyModalOpen={setIsCopyModalOpen}
      copySourcePeriode={copySourcePeriode}
      setCopySourcePeriode={setCopySourcePeriode}
      copyTargetPeriode={copyTargetPeriode}
      setCopyTargetPeriode={setCopyTargetPeriode}
      copyMode={copyMode}
      setCopyMode={setCopyMode}
      isCopying={isCopying}
      handleOpenCopyModal={handleOpenCopyModal}
      handleExecuteCopy={handleExecuteCopy}
      togglingId={togglingId}
      handleToggleStatus={handleToggleStatus}
      deleteTarget={deleteTarget}
      setDeleteTarget={setDeleteTarget}
      isDeleting={isDeleting}
      handleDeleteConfirm={handleDeleteConfirm}
    />
  );
}
