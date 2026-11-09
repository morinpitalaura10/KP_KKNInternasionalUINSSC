'use client';

import React, { useEffect, useState, useCallback, useMemo } from 'react';
import {
  Globe,
  Plus,
  Search,
  RefreshCw,
  Edit3,
  Trash2,
  Calendar,
  Check,
  X,
  Loader2,
} from 'lucide-react';
import { PageHeader, StatCardMint, AlertBanner, ConfirmModal, FilterBar } from '@/components/ui';
import NegaraModal from '@/components/NegaraModal';

interface NegaraItem {
  id_negara: number;
  nama_negara: string;
  status: boolean;
  foto?: string;
  deskripsi?: string;
  isActiveInCurrentPeriode: boolean;
  id_periode_negara: number | null;
  totalPeriode: number;
  totalPendaftar?: number;
}

interface ActivePeriode {
  id_periode: number;
  nama_periode: string;
  tahun: number;
}

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
    <div className="w-full max-w-7xl space-y-6 pb-12 font-sans">
      {/* ── Top Header Area ── */}
      <PageHeader
        title="KELOLA NEGARA TUJUAN KKN"
        subtitle="KULIAH KERJA NYATA INTERNASIONAL"
        description="Kelola daftar negara mitra kerja sama KKN Internasional dan alokasi tujuan pada periode aktif."
        action={
          <button onClick={handleOpenCreate} className="btn-primary-add">
            <Plus className="w-4 h-4 stroke-[3]" />
            Tambah Negara Baru
          </button>
        }
      />

      {/* ── Notification Banner ── */}
      <AlertBanner message={statusMessage} onClose={() => setStatusMessage(null)} />

      {/* ── 3 Stat Cards in Mint Green ── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
        <StatCardMint value={stats.total} label="Total Negara Terdaftar" />
        <StatCardMint value={stats.aktif} label="Negara Aktif Sistem" />
        <StatCardMint value={stats.diPeriodeAktif} label="Buka di Periode Aktif" />
      </div>

      {/* ── Active Period Info Box ── */}
      {activePeriode && (
        <div className="bg-emerald-50/70 border border-emerald-200 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs sm:text-sm">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#0E4A3E] text-white flex items-center justify-center shrink-0">
              <Calendar className="w-5 h-5 text-amber-300" />
            </div>
            <div>
              <span className="font-bold text-[#0E4A3E]">Periode Aktif Saat Ini:</span>{' '}
              <span className="font-semibold text-slate-800">{activePeriode.nama_periode} ({activePeriode.tahun})</span>
            </div>
          </div>
          <span className="text-xs bg-emerald-100 text-emerald-800 px-3 py-1 rounded-full font-bold self-start sm:self-auto">
            {stats.diPeriodeAktif} Negara Terbuka untuk Pendaftaran
          </span>
        </div>
      )}

      {/* ── Search & Filter Controls ── */}
      <FilterBar
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Cari nama negara..."
        filters={[
          {
            value: statusFilter,
            onChange: (val) => setStatusFilter(val as 'all' | 'aktif' | 'nonaktif'),
            options: [
              { value: 'all', label: 'Semua Status' },
              { value: 'aktif', label: 'Status Aktif' },
              { value: 'nonaktif', label: 'Status Nonaktif' },
            ],
          },
        ]}
        onRefresh={() => fetchNegara()}
        isRefreshing={isLoading}
        refreshTitle="Muat Ulang Data Negara"
      />

      {/* ── Table Card ── */}
      <div className="kkn-table-card">
        {/* Table Header Bar */}
        <div className="kkn-table-header">
          <div className="kkn-table-header-grid">
            <span className="col-span-1 text-center">No</span>
            <span className="col-span-4">Nama Negara Tujuan</span>
            <span className="col-span-2 text-center">Status Sistem</span>
            <span className="col-span-2 text-center">Buka di Periode Aktif</span>
            <span className="col-span-2 text-center">Riwayat Periode</span>
            <span className="col-span-1 text-center">Aksi</span>
          </div>
        </div>

        {/* Table Content Rows */}
        <div className="divide-y divide-slate-100">
          {isLoading ? (
            <div className="py-16 text-center text-slate-400 flex flex-col items-center justify-center gap-3">
              <Loader2 className="w-8 h-8 text-[#0E4A3E] animate-spin mx-auto" />
              <span className="text-sm font-medium">Memuat data negara dari database MySQL...</span>
            </div>
          ) : items.length === 0 ? (
            <div className="py-16 text-center text-slate-400">
              <Globe className="w-12 h-12 text-slate-300 mx-auto mb-3 opacity-40" />
              <p className="font-bold text-slate-700 text-sm">Tidak ada data negara ditemukan</p>
              <p className="text-xs text-slate-400 mt-1">
                Tambahkan negara tujuan baru menggunakan tombol <span className="font-bold text-[#0D6EFD]">+ Tambah Negara Baru</span> di pojok kanan atas.
              </p>
            </div>
          ) : (
            items.map((item, index) => (
              <div key={item.id_negara} className="kkn-table-row">
                {/* No */}
                <div className="col-span-1 text-center font-bold text-slate-400">
                  {index + 1}
                </div>

                {/* Nama Negara & Foto */}
                <div className="col-span-4 pr-3 flex items-center gap-3">
                  <div className="w-12 h-9 rounded-lg overflow-hidden border border-slate-200 bg-slate-100 shrink-0 shadow-2xs">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={item.foto || '/thailand_kkn.jpg'}
                      alt={item.nama_negara}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <span className="font-extrabold text-[#0E4A3E] text-sm block truncate">
                      {item.nama_negara}
                    </span>
                    <span className="text-[11px] text-slate-500 line-clamp-1">
                      {item.deskripsi || `ID #${item.id_negara}`}
                    </span>
                  </div>
                </div>

                {/* Status Sistem */}
                <div className="col-span-2 flex items-center justify-center">
                  <button
                    onClick={() => handleToggleSystemStatus(item)}
                    className="relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 focus:outline-none cursor-pointer"
                    style={{ backgroundColor: item.status ? '#0E4A3E' : '#cbd5e1' }}
                    title={item.status ? 'Klik untuk nonaktifkan status sistem' : 'Klik untuk aktifkan status sistem'}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition-transform duration-200 ${
                        item.status ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                  <span className={`ml-2 text-[10px] font-bold ${item.status ? 'text-emerald-700' : 'text-slate-400'}`}>
                    {item.status ? 'Aktif' : 'Nonaktif'}
                  </span>
                </div>

                {/* Dibuka di Periode Aktif */}
                <div className="col-span-2 flex items-center justify-center">
                  <button
                    onClick={() => handleToggleActivePeriode(item)}
                    className="relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 focus:outline-none cursor-pointer"
                    style={{ backgroundColor: item.isActiveInCurrentPeriode ? '#0E4A3E' : '#cbd5e1' }}
                    title={item.isActiveInCurrentPeriode ? 'Klik untuk tutup negara pada periode aktif' : 'Klik untuk buka negara pada periode aktif'}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition-transform duration-200 ${
                        item.isActiveInCurrentPeriode ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                  <span className={`ml-2 text-[10px] font-bold ${item.isActiveInCurrentPeriode ? 'text-emerald-700' : 'text-slate-400'}`}>
                    {item.isActiveInCurrentPeriode ? 'Dibuka' : 'Tidak Dibuka'}
                  </span>
                </div>

                {/* Riwayat Periode */}
                <div className="col-span-2 text-center">
                  <span className="font-bold text-slate-700 text-xs px-2.5 py-1 bg-slate-100 rounded-lg border border-slate-200">
                    {item.totalPeriode} Periode
                  </span>
                </div>

                {/* Aksi */}
                <div className="col-span-1 text-center">
                  <div className="flex items-center justify-center gap-1.5">
                    <button
                      onClick={() => handleOpenEdit(item)}
                      className="p-1.5 rounded-lg text-amber-600 hover:bg-amber-50 hover:text-amber-700 transition-colors cursor-pointer"
                      title="Edit Negara"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setDeleteTarget(item)}
                      className="p-1.5 rounded-lg text-red-500 hover:bg-red-50 hover:text-red-700 transition-colors cursor-pointer"
                      title="Hapus Negara"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* ── Modal Tambah / Edit Negara ── */}
      <NegaraModal
        isOpen={isModalOpen}
        modalMode={modalMode}
        activePeriode={activePeriode}
        formNama={formNama}
        setFormNama={setFormNama}
        formFoto={formFoto}
        setFormFoto={setFormFoto}
        formDeskripsi={formDeskripsi}
        setFormDeskripsi={setFormDeskripsi}
        formStatus={formStatus}
        setFormStatus={setFormStatus}
        formAddToPeriode={formAddToPeriode}
        setFormAddToPeriode={setFormAddToPeriode}
        isSubmitting={isSubmitting}
        isUploadingFoto={isUploadingFoto}
        uploadError={uploadError}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleSubmit}
        onUploadFoto={handleUploadFoto}
      />

      {/* ── Modal Konfirmasi Hapus ── */}
      <ConfirmModal
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleConfirmDelete}
        title={`Hapus Negara ${deleteTarget?.nama_negara}?`}
        description={
          (deleteTarget?.totalPendaftar || 0) > 0
            ? `Negara ini memiliki ${deleteTarget?.totalPendaftar} peserta pendaftar. Sistem akan menonaktifkannya agar riwayat peserta tetap aman.`
            : 'Tindakan ini akan menghapus negara dari daftar master sistem.'
        }
        isProcessing={isDeleting}
      />
    </div>
  );
}
