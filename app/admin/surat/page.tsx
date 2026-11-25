'use client';

import AdminSuratView from '@/components/admin/AdminSuratView';
import React, { useEffect, useState, useCallback, useMemo } from 'react';
import {
  Plus,
  Edit3,
  Trash2,
  X,
  RefreshCw,
  FileText,
  Calendar,
  Upload,
  Loader2,
} from 'lucide-react';
import { PageHeader, AlertBanner, ConfirmModal, FilterBar } from '@/components/ui';

interface SuratItem {
  id_surat: number;
  id_periode: number | null;
  id_pendaftaran: number | null;
  id_user: number;
  nama_surat: string;
  file_path: string;
  tanggal_upload: string | null;
  status: boolean;
  status_label: 'Publish' | 'Draft';
  nama_periode: string;
  nama_pembuat: string;
}

interface PeriodeOption {
  id_periode: number;
  nama_periode: string;
  tahun: number;
  status: string;
}

export default function AdminSuratPage() {
  const [items, setItems] = useState<SuratItem[]>([]);
  const [periodes, setPeriodes] = useState<PeriodeOption[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [filterPeriode, setFilterPeriode] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<'all' | 'publish' | 'draft'>('all');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingItem, setEditingItem] = useState<SuratItem | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<SuratItem | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Form Fields ('all' = Semua Periode)
  const [formNamaSurat, setFormNamaSurat] = useState('');
  const [formPeriodeId, setFormPeriodeId] = useState<string>('all');
  const [formFilePath, setFormFilePath] = useState('');
  const [formStatus, setFormStatus] = useState<boolean>(true);
  const [isUploadingTemplate, setIsUploadingTemplate] = useState(false);
  const [uploadedFileName, setUploadedFileName] = useState('');

  const fetchSurat = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/surat');
      const json = await res.json();
      if (json.success) {
        setItems(json.data || []);
        if (json.periodes) setPeriodes(json.periodes);
      } else {
        setStatusMessage({ type: 'error', text: json.message || 'Gagal memuat data surat.' });
      }
    } catch {
      setStatusMessage({ type: 'error', text: 'Gagal terhubung ke database server.' });
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void fetchSurat();
  }, [fetchSurat]);

  const handleTemplateFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingTemplate(true);
    try {
      const payload = new FormData();
      payload.append('file', file);

      const res = await fetch('/api/surat/upload', {
        method: 'POST',
        body: payload,
      });

      const json = await res.json();
      if (res.ok && json.success) {
        setFormFilePath(json.filePath);
        setUploadedFileName(file.name);
        if (!formNamaSurat) {
          const rawName = file.name.replace(/\.[^/.]+$/, '').replace(/_/g, ' ');
          setFormNamaSurat(rawName);
        }
      } else {
        alert(json.message || 'Gagal mengunggah berkas template.');
      }
    } catch {
      alert('Terjadi kesalahan saat mengunggah berkas template.');
    } finally {
      setIsUploadingTemplate(false);
      e.target.value = '';
    }
  };

  const handleOpenCreate = () => {
    setEditingItem(null);
    setFormNamaSurat('');
    setFormPeriodeId('all'); // Default ke "Semua Periode"
    setFormFilePath('');
    setUploadedFileName('');
    setFormStatus(true);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (item: SuratItem) => {
    setEditingItem(item);
    setFormNamaSurat(item.nama_surat);
    setFormPeriodeId(item.id_periode === null ? 'all' : String(item.id_periode));
    setFormFilePath(item.file_path);
    setUploadedFileName(item.file_path ? item.file_path.split('/').pop() || '' : '');
    setFormStatus(item.status);
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formNamaSurat.trim()) {
      setStatusMessage({ type: 'error', text: 'Nama surat wajib diisi!' });
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        id_surat: editingItem?.id_surat,
        id_periode: formPeriodeId === 'all' ? null : Number(formPeriodeId),
        nama_surat: formNamaSurat.trim(),
        file_path: formFilePath.trim() || `/documents/${formNamaSurat.toLowerCase().replace(/[^a-z0-9]/g, '_')}.pdf`,
        status: formStatus,
      };

      const res = await fetch('/api/surat', {
        method: editingItem ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const json = await res.json();
      if (json.success) {
        setIsModalOpen(false);
        setStatusMessage({
          type: 'success',
          text: editingItem
            ? `Template surat "${formNamaSurat}" berhasil diperbarui!`
            : `Template surat "${formNamaSurat}" berhasil ditambahkan!`,
        });
        await fetchSurat();
      } else {
        setStatusMessage({ type: 'error', text: json.message || 'Gagal menyimpan template surat.' });
      }
    } catch {
      setStatusMessage({ type: 'error', text: 'Terjadi kesalahan sistem saat menyimpan surat.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      // 1. Search Query
      const matchSearch =
        searchQuery.trim() === '' ||
        item.nama_surat.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.file_path.toLowerCase().includes(searchQuery.toLowerCase());

      // 2. Filter Periode: jika dipilih gelombang tertentu, tampilkan surat gelombang tersebut DAN surat "Semua Periode" (null)
      let matchPeriode = true;
      if (filterPeriode !== 'all') {
        const targetPid = Number(filterPeriode);
        matchPeriode = item.id_periode === targetPid || item.id_periode === null;
      }

      // 3. Filter Status
      let matchStatus = true;
      if (filterStatus === 'publish') matchStatus = item.status === true;
      if (filterStatus === 'draft') matchStatus = item.status === false;

      return matchSearch && matchPeriode && matchStatus;
    });
  }, [items, searchQuery, filterPeriode, filterStatus]);

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/surat?id=${deleteTarget.id_surat}`, { method: 'DELETE' });
      const json = await res.json();
      if (json.success) {
        setStatusMessage({ type: 'success', text: `Template surat "${deleteTarget.nama_surat}" berhasil dihapus!` });
        setDeleteTarget(null);
        await fetchSurat();
      } else {
        setStatusMessage({ type: 'error', text: json.message || 'Gagal menghapus surat.' });
      }
    } catch {
      setStatusMessage({ type: 'error', text: 'Terjadi kesalahan saat menghapus data surat.' });
    } finally {
      setIsDeleting(false);
    }
  };

  const formatDate = (dateStr: string | null) => {
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
    <AdminSuratView
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
      editingItem={editingItem}
      deleteTarget={deleteTarget}
      setDeleteTarget={setDeleteTarget}
      isDeleting={isDeleting}
      formNamaSurat={formNamaSurat}
      setFormNamaSurat={setFormNamaSurat}
      formPeriodeId={formPeriodeId}
      setFormPeriodeId={setFormPeriodeId}
      formFilePath={formFilePath}
      formStatus={formStatus}
      setFormStatus={setFormStatus}
      isUploadingTemplate={isUploadingTemplate}
      uploadedFileName={uploadedFileName}
      handleOpenCreate={handleOpenCreate}
      handleOpenEdit={handleOpenEdit}
      handleTemplateFileUpload={handleTemplateFileUpload}
      handleSubmit={handleSubmit}
      handleDeleteConfirm={handleDeleteConfirm}
      formatDate={formatDate}
    />
  );
}
