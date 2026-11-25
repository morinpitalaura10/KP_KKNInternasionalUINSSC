'use client';

import React from 'react';
import {
  Globe,
  Plus,
  Loader2,
  Calendar,
  Edit3,
  Trash2,
} from 'lucide-react';
import { PageHeader, StatCardMint, AlertBanner, ConfirmModal, FilterBar } from '@/components/ui';
import NegaraModal from '@/components/NegaraModal';

export interface NegaraItem {
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

export interface ActivePeriode {
  id_periode: number;
  nama_periode: string;
  tahun: number;
}

export interface AdminNegaraViewProps {
  items: NegaraItem[];
  activePeriode: ActivePeriode | null;
  isLoading: boolean;
  search: string;
  setSearch: (val: string) => void;
  statusFilter: 'all' | 'aktif' | 'nonaktif';
  setStatusFilter: (val: 'all' | 'aktif' | 'nonaktif') => void;
  statusMessage: { type: 'success' | 'error'; text: string } | null;
  setStatusMessage: (val: { type: 'success' | 'error'; text: string } | null) => void;
  stats: { total: number; aktif: number; diPeriodeAktif: number };
  fetchNegara: () => Promise<void>;
  // Modal State & Props
  isModalOpen: boolean;
  setIsModalOpen: (val: boolean) => void;
  modalMode: 'create' | 'edit';
  formNama: string;
  setFormNama: (val: string) => void;
  formStatus: boolean;
  setFormStatus: (val: boolean) => void;
  formFoto: string;
  setFormFoto: (val: string) => void;
  formDeskripsi: string;
  setFormDeskripsi: (val: string) => void;
  formAddToPeriode: boolean;
  setFormAddToPeriode: (val: boolean) => void;
  isSubmitting: boolean;
  isUploadingFoto: boolean;
  uploadError: string | null;
  handleOpenCreate: () => void;
  handleOpenEdit: (item: NegaraItem) => void;
  handleUploadFoto: (e: React.ChangeEvent<HTMLInputElement>) => Promise<void>;
  handleSubmit: (e: React.FormEvent) => Promise<void>;
  // Quick Toggles
  handleToggleSystemStatus: (item: NegaraItem) => Promise<void>;
  handleToggleActivePeriode: (item: NegaraItem) => Promise<void>;
  // Delete confirm
  deleteTarget: NegaraItem | null;
  setDeleteTarget: (val: NegaraItem | null) => void;
  isDeleting: boolean;
  handleConfirmDelete: () => Promise<void>;
}

export function AdminNegaraView({
  items,
  activePeriode,
  isLoading,
  search,
  setSearch,
  statusFilter,
  setStatusFilter,
  statusMessage,
  setStatusMessage,
  stats,
  fetchNegara,
  isModalOpen,
  setIsModalOpen,
  modalMode,
  formNama,
  setFormNama,
  formStatus,
  setFormStatus,
  formFoto,
  setFormFoto,
  formDeskripsi,
  setFormDeskripsi,
  formAddToPeriode,
  setFormAddToPeriode,
  isSubmitting,
  isUploadingFoto,
  uploadError,
  handleOpenCreate,
  handleOpenEdit,
  handleUploadFoto,
  handleSubmit,
  handleToggleSystemStatus,
  handleToggleActivePeriode,
  deleteTarget,
  setDeleteTarget,
  isDeleting,
  handleConfirmDelete,
}: AdminNegaraViewProps) {
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
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3.5 sm:gap-6">
        <StatCardMint
          value={stats.total}
          label="Total Negara Terdaftar"
          subLabel="Mitra kerja sama global"
        />
        <StatCardMint
          value={stats.aktif}
          label="Negara Aktif Sistem"
          subLabel="Tersedia di master sistem"
        />
        <StatCardMint
          value={stats.diPeriodeAktif}
          label="Buka di Periode Aktif"
          subLabel="Dibuka pada gelombang ini"
          className="col-span-2 sm:col-span-1"
        />
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
        <div className="kkn-table-scroll">
          <div className="kkn-table-inner">
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
                <div className="col-span-2 flex flex-col items-center justify-center gap-1">
                  <button
                    type="button"
                    role="switch"
                    aria-checked={item.status}
                    onClick={() => handleToggleSystemStatus(item)}
                    className={`group relative inline-flex h-5 w-9 shrink-0 cursor-pointer items-center rounded-full transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-[#0E4A3E] focus:ring-offset-1 ${
                      item.status ? 'bg-[#0E4A3E]' : 'bg-slate-300 hover:bg-slate-400'
                    }`}
                    title={item.status ? 'Klik untuk nonaktifkan status sistem' : 'Klik untuk aktifkan status sistem'}
                  >
                    <span className="sr-only">Toggle Status Sistem</span>
                    <span
                      className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow-md transition duration-200 ease-in-out ${
                        item.status ? 'translate-x-4' : 'translate-x-1'
                      }`}
                    />
                  </button>
                  <span className={`text-[9px] font-bold tracking-tight ${item.status ? 'text-emerald-700' : 'text-slate-400'}`}>
                    {item.status ? 'Aktif' : 'Nonaktif'}
                  </span>
                </div>

                {/* Dibuka di Periode Aktif */}
                <div className="col-span-2 flex flex-col items-center justify-center gap-1">
                  <button
                    type="button"
                    role="switch"
                    aria-checked={item.isActiveInCurrentPeriode}
                    onClick={() => handleToggleActivePeriode(item)}
                    className={`group relative inline-flex h-5 w-9 shrink-0 cursor-pointer items-center rounded-full transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-[#0E4A3E] focus:ring-offset-1 ${
                      item.isActiveInCurrentPeriode ? 'bg-[#0E4A3E]' : 'bg-slate-300 hover:bg-slate-400'
                    }`}
                    title={item.isActiveInCurrentPeriode ? 'Klik untuk tutup negara pada periode aktif' : 'Klik untuk buka negara pada periode aktif'}
                  >
                    <span className="sr-only">Toggle Buka Periode</span>
                    <span
                      className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow-md transition duration-200 ease-in-out ${
                        item.isActiveInCurrentPeriode ? 'translate-x-4' : 'translate-x-1'
                      }`}
                    />
                  </button>
                  <span className={`text-[9px] font-bold tracking-tight ${item.isActiveInCurrentPeriode ? 'text-emerald-700' : 'text-slate-400'}`}>
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
