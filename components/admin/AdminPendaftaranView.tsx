'use client';

import React from 'react';
import {
  FileText,
  RefreshCw,
  Eye,
  Trash2,
  Globe2,
  Globe,
  MapPin,
  ExternalLink,
  GraduationCap,
  HeartHandshake,
  User,
  Check,
  AlertTriangle,
  Edit3,
  X,
} from 'lucide-react';
import PageHeader from '@/components/ui/PageHeader';
import FilterBar from '@/components/ui/FilterBar';
import StatCardMint from '@/components/ui/StatCardMint';
import StatusBadge from '@/components/ui/StatusBadge';
import ConfirmModal from '@/components/ui/ConfirmModal';

export interface PendaftaranItem {
  id_pendaftaran: number;
  nim: string;
  nama: string;
  email: string;
  id_periode: number;
  nama_periode: string;
  tahun_periode: string;
  id_periode_negara: number;
  nama_negara: string;
  status_pendaftaran: string;
  status_label: string;
  tanggal_daftar: string;
  catatan: string | null;
  jenis_kelamin: string;
  tempat_lahir: string;
  tanggal_lahir: string;
  no_hp: string;
  alamat: string;
  golongan_darah: string;
  riwayat_penyakit: string | null;
  alergi: string | null;
  ukuran_kaos: string;
  nama_fakultas: string;
  nama_prodi: string;
  total_sks: number;
  ipk: number | null;
  asal_sekolah: string;
  deskripsi_diri: string;
  dokumen: Array<{
    id_dokumen: number;
    nama_persyaratan: string;
    file_path: string;
    format_file: string;
    status: string;
  }>;
  orang_tua: {
    nama_ayah: string;
    pekerjaan_ayah: string;
    nama_ibu: string;
    pekerjaan_ibu: string;
    no_hp_orang_tua: string;
    alamat_orang_tua: string;
  } | null;
}

export interface AdminPendaftaranViewProps {
  isLoading: boolean;
  statusMessage: { type: 'success' | 'error'; text: string } | null;
  setStatusMessage: (m: { type: 'success' | 'error'; text: string } | null) => void;
  stats: {
    total: number;
    menunggu: number;
    terverifikasi: number;
    perluPerbaikan: number;
    lolos: number;
  };
  activeFilteredPeriode?: { id: number; nama: string; tahunAkademik: string } | null;
  search: string;
  setSearch: (s: string) => void;
  selectedPeriode: string;
  selectedStatus: string;
  periodes: Array<{ id: number; nama: string; tahunAkademik: string; status?: string }>;
  STATUS_OPTIONS: Array<{ value: string; label: string }>;
  pagination: { page: number; limit: number; total: number; totalPages: number } | null;
  items: any[];
  currentPage: number;
  setCurrentPage: (p: number) => void;
  isExporting: boolean;
  handleSearchSubmit: (e: React.FormEvent) => void;
  handlePeriodeFilterChange: (per: string) => void;
  handleStatusFilterChange: (st: string) => void;
  handleResetFilters: () => void;
  handleExportCSV: () => void;
  handleOpenDetail: (item: any) => void;
  selectedDetail: any;
  setSelectedDetail: (item: any) => void;
  activeTab: 'akademik' | 'pribadi' | 'orangtua' | 'dokumen';
  setActiveTab: (t: 'akademik' | 'pribadi' | 'orangtua' | 'dokumen') => void;
  editStatusValue: string;
  setEditStatusValue: (s: string) => void;
  editNegaraId: number | '';
  setEditNegaraId: (n: number | '') => void;
  editCatatan: string;
  setEditCatatan: (c: string) => void;
  negaraList: Array<{ id_periode_negara: number; nama_negara: string }>;
  isUpdatingStatus: boolean;
  handleSaveStatus: () => void;
  handleQuickDocStatus: (id_dokumen: number, status: 'Valid' | 'Revisi') => void;
  deleteTarget: any;
  setDeleteTarget: (item: any) => void;
  isDeleting: boolean;
  handleDeletePendaftaran: () => void;
  fetchData: (s?: string, st?: string, per?: string, p?: number) => void;
}

export default function AdminPendaftaranView({
  isLoading,
  statusMessage,
  setStatusMessage,
  stats,
  activeFilteredPeriode,
  search,
  setSearch,
  selectedPeriode,
  selectedStatus,
  periodes,
  STATUS_OPTIONS,
  pagination,
  items,
  currentPage,
  setCurrentPage,
  isExporting,
  handleSearchSubmit,
  handlePeriodeFilterChange,
  handleStatusFilterChange,
  handleResetFilters,
  handleExportCSV,
  handleOpenDetail,
  selectedDetail,
  setSelectedDetail,
  activeTab,
  setActiveTab,
  editStatusValue,
  setEditStatusValue,
  editNegaraId,
  setEditNegaraId,
  editCatatan,
  setEditCatatan,
  negaraList,
  isUpdatingStatus,
  handleSaveStatus,
  handleQuickDocStatus,
  deleteTarget,
  setDeleteTarget,
  isDeleting,
  handleDeletePendaftaran,
  fetchData,
}: AdminPendaftaranViewProps) {
  return (
    <div className="w-full max-w-7xl space-y-6 pb-16 font-sans">
      {/* Page Title & Subtitle */}
      <PageHeader
        title="DATA PENDAFTARAN"
        subtitle="KULIAH KERJA NYATA INTERNASIONAL"
        description="Kelola verifikasi berkas, pantau kelengkapan persyaratan, dan perbarui status seleksi mahasiswa."
        action={
          <button
            onClick={() => fetchData()}
            disabled={isLoading}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-white hover:bg-slate-100 border border-slate-300 rounded-xl text-xs font-bold text-slate-700 shadow-xs transition-colors cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-[#0E4A3E] ${isLoading ? 'animate-spin' : ''}`} />
            Segarkan Data
          </button>
        }
      />

      {/* Toast Alert Message */}
      {statusMessage && (
        <div
          className={`p-4 rounded-xl text-xs font-bold flex items-center justify-between ${
            statusMessage.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
              : 'bg-red-50 text-red-800 border border-red-200'
          }`}
        >
          <span>{statusMessage.text}</span>
          <button onClick={() => setStatusMessage(null)} className="cursor-pointer font-black text-sm">
            ×
          </button>
        </div>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5 sm:gap-4">
        <StatCardMint
          value={stats.total}
          label="Total Pendaftar"
          subLabel={activeFilteredPeriode ? activeFilteredPeriode.nama : 'Keseluruhan gelombang'}
        />
        <StatCardMint
          value={stats.menunggu}
          label="Menunggu"
          subLabel="Menunggu Verifikasi"
        />
        <StatCardMint
          value={stats.terverifikasi}
          label="Terverifikasi"
          subLabel="Verifikasi Dokumen"
        />
        <StatCardMint
          value={stats.perluPerbaikan}
          label="Perlu Perbaikan"
          subLabel="Perbaikan Dokumen"
        />
        <StatCardMint
          value={stats.lolos}
          label="Lolos Seleksi"
          subLabel="Lolos Seleksi Akhir"
          className="col-span-2 sm:col-span-1"
        />
      </div>

      {/* Filter & Search Bar */}
      <FilterBar
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Cari nama mahasiswa atau NIM..."
        onSearchSubmit={handleSearchSubmit}
        searchWidth="flex-1 min-w-[200px]"
        filters={[
          {
            value: selectedPeriode,
            onChange: handlePeriodeFilterChange,
            options: [
              { value: 'all', label: 'Semua Gelombang' },
              ...periodes.map((p) => ({
                value: String(p.id),
                label: `${p.nama} (${p.tahunAkademik})${p.status === 'Aktif' ? ' — [Aktif]' : ''}`,
              })),
            ],
          },
          {
            value: selectedStatus,
            onChange: handleStatusFilterChange,
            options: STATUS_OPTIONS,
          },
        ]}
        countBadge={pagination?.total || items.length}
        countLabel="pendaftar"
        actions={
          <button
            type="button"
            onClick={handleExportCSV}
            disabled={isExporting || isLoading}
            className="h-10 px-5 bg-[#0E4A3E] hover:bg-[#08362d] text-white rounded-xl text-xs sm:text-sm font-bold transition-all shadow-xs cursor-pointer disabled:opacity-50 inline-flex items-center justify-center shrink-0"
            title="Unduh seluruh data pendaftar terfilter ke berkas Excel"
          >
            {isExporting ? 'Mengekspor...' : 'Ekspor Excel'}
          </button>
        }
      />

      {/* Main Table Container */}
      <div className="kkn-table-card">
        <div className="kkn-table-scroll">
          <div className="kkn-table-inner">
        {/* Table Header */}
        <div className="kkn-table-header">
          <div className="kkn-table-header-grid">
            <span className="col-span-1 text-center">No</span>
            <span className="col-span-3">Mahasiswa</span>
            <span className="col-span-2">Fakultas / Prodi</span>
            <span className="col-span-2">Periode & Negara</span>
            <span className="col-span-1 text-center">IPK / SKS</span>
            <span className="col-span-2 text-center">Status</span>
            <span className="col-span-1 text-center">Aksi</span>
          </div>
        </div>

        {/* Table Content */}
        {isLoading ? (
          <div className="py-16 flex flex-col items-center justify-center text-slate-400 gap-3">
            <RefreshCw className="w-7 h-7 animate-spin text-[#0E4A3E]" />
            <span className="text-xs sm:text-sm font-semibold">Memuat data pendaftaran dari database MySQL...</span>
          </div>
        ) : items.length === 0 ? (
          <div className="py-16 text-center space-y-3">
            <FileText className="w-12 h-12 text-slate-300 mx-auto" />
            <p className="text-slate-600 text-sm font-bold">
              {search || selectedStatus !== 'all' || selectedPeriode !== 'all'
                ? 'Tidak ada data pendaftaran yang cocok dengan filter yang dipilih.'
                : 'Belum ada data pendaftaran mahasiswa.'}
            </p>
            {(search || selectedStatus !== 'all' || selectedPeriode !== 'all') && (
              <button
                onClick={handleResetFilters}
                className="text-xs font-bold text-[#0E4A3E] underline hover:text-[#09352c] cursor-pointer"
              >
                Kembalikan semua filter
              </button>
            )}
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {items.map((item, idx) => (
              <div
                key={item.id_pendaftaran}
                className="kkn-table-row"
              >
                {/* No */}
                <span className="col-span-1 text-center font-bold text-slate-400">
                  {((pagination?.page || 1) - 1) * (pagination?.limit || 10) + idx + 1}
                </span>

                {/* Mahasiswa Info */}
                <div className="col-span-3 pr-3">
                  <p className="font-bold text-slate-800 leading-snug">{item.nama}</p>
                  <p className="font-mono text-[11px] text-[#0E4A3E] font-semibold">{item.nim}</p>
                  <p className="text-[10px] text-slate-400 truncate">{item.email}</p>
                </div>

                {/* Fakultas & Prodi */}
                <div className="col-span-2 pr-3">
                  <span className="inline-block px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-slate-100 text-slate-700 border border-slate-200 mb-1">
                    {item.nama_fakultas}
                  </span>
                  <p className="text-[11px] font-semibold text-slate-700 line-clamp-1">{item.nama_prodi}</p>
                </div>

                {/* Periode & Negara */}
                <div className="col-span-2 pr-3">
                  <div className="flex items-center gap-1.5 font-bold text-slate-800 text-[11px]">
                    <Globe2 className="w-3.5 h-3.5 text-[#568E7D] shrink-0" />
                    <span>{item.nama_negara}</span>
                  </div>
                  <p className="text-[10px] text-slate-500 line-clamp-1">{item.nama_periode}</p>
                </div>

                {/* IPK / SKS */}
                <div className="col-span-1 text-center">
                  <span
                    className={`font-black text-xs ${
                      item.ipk && item.ipk >= 3.7
                        ? 'text-emerald-700'
                        : item.ipk && item.ipk >= 3.5
                        ? 'text-teal-700'
                        : 'text-slate-700'
                    }`}
                  >
                    {item.ipk ? item.ipk.toFixed(2) : '-'}
                  </span>
                  <p className="text-[10px] text-slate-400">{item.total_sks} SKS</p>
                </div>

                {/* Status */}
                <div className="col-span-2 flex flex-col items-center justify-center gap-1">
                  <StatusBadge status={item.status_pendaftaran} />
                  {item.catatan && item.status_pendaftaran === 'Perbaikan_Dokumen' && (
                    <span className="text-[9px] text-orange-600 font-semibold max-w-[140px] truncate text-center" title={item.catatan}>
                      Catatan: {item.catatan}
                    </span>
                  )}
                </div>

                {/* Aksi */}
                <div className="col-span-1 flex items-center justify-center gap-1.5">
                  <button
                    onClick={() => handleOpenDetail(item)}
                    title="Lihat Detail & Verifikasi"
                    className="p-1.5 rounded-lg bg-[#0E4A3E]/10 text-[#0E4A3E] hover:bg-[#0E4A3E] hover:text-white transition-all cursor-pointer shadow-2xs"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setDeleteTarget(item)}
                    title="Hapus Pendaftaran"
                    className="p-1.5 rounded-lg bg-red-50 text-red-600 hover:bg-red-600 hover:text-white transition-all cursor-pointer shadow-2xs"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination Footer */}
        {pagination && pagination.totalPages > 1 && (
          <div className="px-6 py-4 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3">
            <p className="text-xs text-slate-500 font-medium">
              Menampilkan{' '}
              <strong className="text-slate-700">
                {(pagination.page - 1) * pagination.limit + 1}–
                {Math.min(pagination.page * pagination.limit, pagination.total)}
              </strong>{' '}
              dari <strong className="text-slate-800">{pagination.total}</strong> pendaftaran
            </p>
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => {
                  const p = currentPage - 1;
                  setCurrentPage(p);
                  fetchData(search, selectedStatus, selectedPeriode, p);
                }}
                disabled={currentPage === 1}
                className="px-3 py-1.5 text-xs font-bold text-slate-600 border border-slate-300 rounded-lg hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-colors"
              >
                ← Prev
              </button>
              {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  onClick={() => {
                    setCurrentPage(page);
                    fetchData(search, selectedStatus, selectedPeriode, page);
                  }}
                  className={`px-3 py-1.5 text-xs font-bold rounded-lg cursor-pointer transition-colors ${
                    page === currentPage
                      ? 'bg-[#0E4A3E] text-white border border-[#0E4A3E] shadow-2xs'
                      : 'text-slate-600 border border-slate-300 hover:bg-slate-100'
                  }`}
                >
                  {page}
                </button>
              ))}
              <button
                onClick={() => {
                  const p = currentPage + 1;
                  setCurrentPage(p);
                  fetchData(search, selectedStatus, selectedPeriode, p);
                }}
                disabled={currentPage === pagination.totalPages}
                className="px-3 py-1.5 text-xs font-bold text-slate-600 border border-slate-300 rounded-lg hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-colors"
              >
                Next →
              </button>
            </div>
          </div>
        )}
          </div>
        </div>
      </div>

      {/* DETAIL & VERIFIKASI MODAL */}
      {selectedDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-4xl my-8 overflow-hidden flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="bg-[#0E4A3E] text-white p-6 relative shrink-0">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pr-10">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[10px] font-black uppercase tracking-widest px-2 py-0.5 bg-white/20 rounded">
                      ID #{selectedDetail.id_pendaftaran}
                    </span>
                    <span className="text-white/70 text-xs">
                      Terdaftar: {new Date(selectedDetail.tanggal_daftar).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                    </span>
                  </div>
                  <h3 className="text-xl sm:text-2xl font-black">{selectedDetail.nama}</h3>
                  <p className="text-xs text-emerald-200 font-mono font-semibold">
                    {selectedDetail.nim} • {selectedDetail.nama_fakultas} ({selectedDetail.nama_prodi})
                  </p>
                </div>
                <div className="shrink-0"><StatusBadge status={selectedDetail.status_pendaftaran} /></div>
              </div>

              <button
                onClick={() => setSelectedDetail(null)}
                className="absolute top-5 right-5 text-white/70 hover:text-white p-2 rounded-xl hover:bg-white/10 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Tabs Header */}
            <div className="flex border-b border-slate-200 bg-slate-50 px-6 gap-2 shrink-0 overflow-x-auto">
              <button
                onClick={() => setActiveTab('akademik')}
                className={`py-3.5 px-4 text-xs font-bold border-b-2 transition-colors cursor-pointer flex items-center gap-2 whitespace-nowrap ${
                  activeTab === 'akademik'
                    ? 'border-[#0E4A3E] text-[#0E4A3E]'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                <GraduationCap className="w-4 h-4" />
                Data Akademik & Program
              </button>
              <button
                onClick={() => setActiveTab('pribadi')}
                className={`py-3.5 px-4 text-xs font-bold border-b-2 transition-colors cursor-pointer flex items-center gap-2 whitespace-nowrap ${
                  activeTab === 'pribadi'
                    ? 'border-[#0E4A3E] text-[#0E4A3E]'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                <User className="w-4 h-4" />
                Biodata Pribadi
              </button>
              <button
                onClick={() => setActiveTab('orangtua')}
                className={`py-3.5 px-4 text-xs font-bold border-b-2 transition-colors cursor-pointer flex items-center gap-2 whitespace-nowrap ${
                  activeTab === 'orangtua'
                    ? 'border-[#0E4A3E] text-[#0E4A3E]'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                <HeartHandshake className="w-4 h-4" />
                Orang Tua / Wali
              </button>
              <button
                onClick={() => setActiveTab('dokumen')}
                className={`py-3.5 px-4 text-xs font-bold border-b-2 transition-colors cursor-pointer flex items-center gap-2 whitespace-nowrap ${
                  activeTab === 'dokumen'
                    ? 'border-[#0E4A3E] text-[#0E4A3E]'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                <FileText className="w-4 h-4" />
                Dokumen Persyaratan ({selectedDetail.dokumen.length})
              </button>
            </div>

            {/* Modal Body Scrollable */}
            <div className="p-6 overflow-y-auto flex-1 space-y-6 text-xs sm:text-sm">
              {/* TAB 1: AKADEMIK & PROGRAM */}
              {activeTab === 'akademik' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
                      <h4 className="font-extrabold text-[#0E4A3E] uppercase text-xs tracking-wider flex items-center gap-2">
                        <GraduationCap className="w-4 h-4" /> Riwayat Akademik
                      </h4>
                      <div className="space-y-2 text-slate-700">
                        <div className="flex justify-between py-1 border-b border-slate-200/60">
                          <span className="text-slate-500">Fakultas:</span>
                          <span className="font-bold text-slate-800">{selectedDetail.nama_fakultas}</span>
                        </div>
                        <div className="flex justify-between py-1 border-b border-slate-200/60">
                          <span className="text-slate-500">Program Studi:</span>
                          <span className="font-bold text-slate-800">{selectedDetail.nama_prodi}</span>
                        </div>
                        <div className="flex justify-between py-1 border-b border-slate-200/60">
                          <span className="text-slate-500">Indeks Prestasi Kumulatif (IPK):</span>
                          <span className="font-bold text-emerald-700">{selectedDetail.ipk?.toFixed(2) || '-'}</span>
                        </div>
                        <div className="flex justify-between py-1">
                          <span className="text-slate-500">Total SKS Lulus:</span>
                          <span className="font-bold text-slate-800">{selectedDetail.total_sks} SKS</span>
                        </div>
                      </div>
                    </div>

                    <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
                      <h4 className="font-extrabold text-[#0E4A3E] uppercase text-xs tracking-wider flex items-center gap-2">
                        <Globe2 className="w-4 h-4" /> Program & Alokasi Penempatan Negara
                      </h4>
                      <div className="space-y-2 text-slate-700">
                        <div className="flex justify-between py-1 border-b border-slate-200/60">
                          <span className="text-slate-500">Periode KKN:</span>
                          <span className="font-bold text-slate-800">{selectedDetail.nama_periode}</span>
                        </div>
                        <div className="flex justify-between py-1 border-b border-slate-200/60">
                          <span className="text-slate-500">Negara Tujuan:</span>
                          <span className="font-bold text-[#0E4A3E]">{selectedDetail.nama_negara}</span>
                        </div>
                        <div className="flex justify-between py-1 border-b border-slate-200/60">
                          <span className="text-slate-500">Tahun Akademik:</span>
                          <span className="font-bold text-slate-800">{selectedDetail.tahun_periode || '2026'}</span>
                        </div>
                        <div className="flex justify-between py-1">
                          <span className="text-slate-500">Tanggal Daftar:</span>
                          <span className="font-bold text-slate-800">
                            {new Date(selectedDetail.tanggal_daftar).toLocaleDateString('id-ID', {
                              day: 'numeric',
                              month: 'long',
                              year: 'numeric',
                            })}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Deskripsi Diri & Motivasi */}
                  <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                    <h4 className="font-extrabold text-[#0E4A3E] uppercase text-xs tracking-wider">
                      Deskripsi Diri & Motivasi KKN Internasional
                    </h4>
                    <p className="text-slate-700 leading-relaxed italic bg-white p-3.5 rounded-xl border border-slate-200/60">
                      &quot;{selectedDetail.deskripsi_diri}&quot;
                    </p>
                  </div>
                </div>
              )}

              {/* TAB 2: BIODATA PRIBADI */}
              {activeTab === 'pribadi' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
                    <h4 className="font-extrabold text-[#0E4A3E] uppercase text-xs tracking-wider flex items-center gap-2">
                      <User className="w-4 h-4" /> Informasi Personal
                    </h4>
                    <div className="space-y-2 text-slate-700">
                      <div className="flex justify-between py-1 border-b border-slate-200/60">
                        <span className="text-slate-500">Jenis Kelamin:</span>
                        <span className="font-bold text-slate-800">
                          {selectedDetail.jenis_kelamin === 'L' ? 'Laki-Laki' : 'Perempuan'}
                        </span>
                      </div>
                      <div className="flex justify-between py-1 border-b border-slate-200/60">
                        <span className="text-slate-500">Tempat, Tanggal Lahir:</span>
                        <span className="font-bold text-slate-800">
                          {selectedDetail.tempat_lahir},{' '}
                          {new Date(selectedDetail.tanggal_lahir).toLocaleDateString('id-ID', {
                            day: 'numeric',
                            month: 'long',
                            year: 'numeric',
                          })}
                        </span>
                      </div>
                      <div className="flex justify-between py-1 border-b border-slate-200/60">
                        <span className="text-slate-500">Nomor WhatsApp / HP:</span>
                        <span className="font-bold text-emerald-800 font-mono">{selectedDetail.no_hp}</span>
                      </div>
                      <div className="flex justify-between py-1 border-b border-slate-200/60">
                        <span className="text-slate-500">Email Kampus:</span>
                        <span className="font-bold text-slate-800">{selectedDetail.email}</span>
                      </div>
                      <div className="flex justify-between py-1">
                        <span className="text-slate-500">Asal Sekolah Menengah:</span>
                        <span className="font-bold text-slate-800">{selectedDetail.asal_sekolah}</span>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
                    <h4 className="font-extrabold text-[#0E4A3E] uppercase text-xs tracking-wider flex items-center gap-2">
                      <MapPin className="w-4 h-4" /> Alamat & Data Kesehatan
                    </h4>
                    <div className="space-y-2 text-slate-700">
                      <div className="py-1 border-b border-slate-200/60">
                        <span className="text-slate-500 block mb-0.5">Alamat Domisili:</span>
                        <span className="font-bold text-slate-800">{selectedDetail.alamat}</span>
                      </div>
                      <div className="flex justify-between py-1 border-b border-slate-200/60">
                        <span className="text-slate-500">Golongan Darah:</span>
                        <span className="font-bold text-slate-800">{selectedDetail.golongan_darah || '-'}</span>
                      </div>
                      <div className="flex justify-between py-1 border-b border-slate-200/60">
                        <span className="text-slate-500">Riwayat Penyakit:</span>
                        <span className="font-bold text-slate-800">{selectedDetail.riwayat_penyakit || 'Tidak Ada'}</span>
                      </div>
                      <div className="flex justify-between py-1 border-b border-slate-200/60">
                        <span className="text-slate-500">Alergi:</span>
                        <span className="font-bold text-slate-800">{selectedDetail.alergi || 'Tidak Ada'}</span>
                      </div>
                      <div className="flex justify-between py-1">
                        <span className="text-slate-500">Ukuran Kaos KKN:</span>
                        <span className="font-bold text-slate-800 uppercase px-2.5 py-0.5 bg-white border border-slate-200 rounded">
                          {selectedDetail.ukuran_kaos}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 3: DATA ORANG TUA / WALI */}
              {activeTab === 'orangtua' && (
                <div className="space-y-4">
                  {selectedDetail.orang_tua ? (
                    <div className="p-5 bg-slate-50 rounded-2xl border border-slate-200 space-y-4">
                      <h4 className="font-extrabold text-[#0E4A3E] uppercase text-xs tracking-wider flex items-center gap-2">
                        <HeartHandshake className="w-4 h-4" /> Data Orang Tua / Wali Mahasiswa
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <div className="flex justify-between py-1 border-b border-slate-200/60">
                            <span className="text-slate-500">Nama Ayah / Wali:</span>
                            <span className="font-bold text-slate-800">{selectedDetail.orang_tua.nama_ayah}</span>
                          </div>
                          <div className="flex justify-between py-1 border-b border-slate-200/60">
                            <span className="text-slate-500">Pekerjaan Ayah:</span>
                            <span className="font-bold text-slate-800">{selectedDetail.orang_tua.pekerjaan_ayah}</span>
                          </div>
                          <div className="flex justify-between py-1">
                            <span className="text-slate-500">Nomor Telepon Ayah/Wali:</span>
                            <span className="font-bold text-emerald-800 font-mono">
                              {selectedDetail.orang_tua.no_hp_orang_tua}
                            </span>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <div className="flex justify-between py-1 border-b border-slate-200/60">
                            <span className="text-slate-500">Nama Ibu:</span>
                            <span className="font-bold text-slate-800">{selectedDetail.orang_tua.nama_ibu}</span>
                          </div>
                          <div className="flex justify-between py-1 border-b border-slate-200/60">
                            <span className="text-slate-500">Pekerjaan Ibu:</span>
                            <span className="font-bold text-slate-800">{selectedDetail.orang_tua.pekerjaan_ibu}</span>
                          </div>
                          <div className="py-1">
                            <span className="text-slate-500 block mb-0.5">Alamat Orang Tua:</span>
                            <span className="font-bold text-slate-800">
                              {selectedDetail.orang_tua.alamat_orang_tua}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="py-8 text-center text-slate-400">
                      <p className="font-semibold text-xs">Belum ada data orang tua yang tercatat.</p>
                    </div>
                  )}
                </div>
              )}

              {/* TAB 4: DOKUMEN PERSYARATAN */}
              {activeTab === 'dokumen' && (
                <div className="space-y-3">
                  <h4 className="font-extrabold text-[#0E4A3E] uppercase text-xs tracking-wider flex items-center gap-2">
                    <FileText className="w-4 h-4" /> Berkas Dokumen Persyaratan Pendaftaran
                  </h4>
                  {selectedDetail.dokumen.length === 0 ? (
                    <p className="text-slate-400 text-xs italic">Belum ada berkas dokumen yang diunggah.</p>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {selectedDetail.dokumen.map((doc: any) => (
                        <div
                          key={doc.id_dokumen}
                          className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 flex flex-col justify-between gap-3 hover:border-slate-300 transition-colors"
                        >
                          <div className="flex items-start justify-between gap-2.5">
                            <div className="flex items-start gap-2.5 min-w-0">
                              <div className="p-2 bg-emerald-100 text-[#0E4A3E] rounded-xl shrink-0">
                                <FileText className="w-4 h-4" />
                              </div>
                              <div className="min-w-0">
                                <p className="font-bold text-slate-800 text-xs leading-snug">{doc.nama_persyaratan}</p>
                                <p className="text-[10px] text-slate-400 uppercase font-bold mt-0.5">
                                   Format: {doc.format_file}
                                </p>
                                <span
                                  className={`inline-block mt-1 px-2 py-0.5 rounded text-[10px] font-bold ${
                                    doc.status === 'Valid'
                                      ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                                      : doc.status === 'Revisi'
                                      ? 'bg-orange-100 text-orange-800 border border-orange-300'
                                      : 'bg-amber-100 text-amber-800 border border-amber-300'
                                  }`}
                                >
                                  Status: {doc.status}
                                </span>
                              </div>
                            </div>

                            <a
                              href={doc.file_path}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-1.5 text-slate-400 hover:text-[#0E4A3E] hover:bg-slate-200 rounded-lg transition-colors cursor-pointer shrink-0"
                              title="Buka / Pratinjau Berkas"
                            >
                              <ExternalLink className="w-4 h-4" />
                            </a>
                          </div>

                          {/* Quick Document Verification Action Buttons */}
                          <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between gap-2">
                            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                              Verifikasi Berkas:
                            </span>
                            <div className="flex items-center gap-1.5">
                              <button
                                type="button"
                                onClick={() => handleQuickDocStatus(doc.id_dokumen, 'Valid')}
                                className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all cursor-pointer flex items-center gap-1 ${
                                  doc.status === 'Valid'
                                    ? 'bg-emerald-600 text-white shadow-2xs'
                                    : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200'
                                }`}
                              >
                                <Check className="w-3 h-3" /> Valid
                              </button>
                              <button
                                type="button"
                                onClick={() => handleQuickDocStatus(doc.id_dokumen, 'Revisi')}
                                className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all cursor-pointer flex items-center gap-1 ${
                                  doc.status === 'Revisi'
                                    ? 'bg-orange-600 text-white shadow-2xs'
                                    : 'bg-orange-50 text-orange-700 hover:bg-orange-100 border border-orange-200'
                                }`}
                              >
                                <AlertTriangle className="w-3 h-3" /> Revisi
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* ACTION: UPDATE VERIFIKASI STATUS & CATATAN */}
              <div className="mt-6 pt-5 border-t border-slate-200 space-y-4 bg-emerald-50/50 p-4 rounded-2xl border border-emerald-200/60">
                <h4 className="font-black text-[#0E4A3E] text-xs uppercase tracking-wider flex items-center gap-2">
                  <Edit3 className="w-4 h-4 text-[#0E4A3E]" /> Form Verifikasi & Pembaruan Status
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Pilih Status Pendaftaran
                    </label>
                    <select
                      value={editStatusValue}
                      onChange={(e) => setEditStatusValue(e.target.value)}
                      className="w-full py-2.5 px-3 border border-slate-300 rounded-xl text-xs font-bold text-slate-800 bg-white focus:outline-none focus:border-[#0E4A3E] focus:ring-1 focus:ring-[#0E4A3E]"
                    >
                      <option value="Menunggu_Verifikasi">Menunggu Verifikasi</option>
                      <option value="Verifikasi_Dokumen">Verifikasi Dokumen (Terverifikasi)</option>
                      <option value="Perbaikan_Dokumen">Perbaikan Dokumen (Perlu Perbaikan)</option>
                      <option value="Wawancara">Wawancara</option>
                      <option value="Lolos">Lolos Seleksi</option>
                      <option value="Tidak_Lolos">Tidak Lolos</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1.5">
                      <Globe className="w-3.5 h-3.5 text-[#0E4A3E]" />
                      Alokasi Penempatan Negara
                    </label>
                    <select
                      value={editNegaraId}
                      onChange={(e) => setEditNegaraId(e.target.value ? Number(e.target.value) : '')}
                      className="w-full py-2.5 px-3 border border-slate-300 rounded-xl text-xs font-bold text-slate-800 bg-white focus:outline-none focus:border-[#0E4A3E] focus:ring-1 focus:ring-[#0E4A3E]"
                    >
                      {negaraList.map((n) => (
                        <option key={n.id_periode_negara} value={n.id_periode_negara}>
                          {n.nama_negara}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Catatan / Feedback untuk Mahasiswa
                    </label>
                    <textarea
                      value={editCatatan}
                      onChange={(e) => setEditCatatan(e.target.value)}
                      rows={2}
                      placeholder="Contoh: Dokumen transkrip nilai belum dilegalisir dekanat..."
                      className="w-full py-2 px-3 border border-slate-300 rounded-xl text-xs text-slate-800 bg-white focus:outline-none focus:border-[#0E4A3E] focus:ring-1 focus:ring-[#0E4A3E]"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Actions Footer */}
            <div className="bg-slate-100 px-6 py-4 border-t border-slate-200 flex items-center justify-end gap-3 shrink-0">
              <button
                type="button"
                onClick={() => setSelectedDetail(null)}
                className="px-4 py-2 border border-slate-300 text-slate-600 rounded-xl text-xs font-bold hover:bg-slate-200 transition-colors cursor-pointer"
              >
                Tutup
              </button>
              <button
                type="button"
                onClick={handleSaveStatus}
                disabled={isUpdatingStatus}
                className="px-5 py-2 bg-[#0E4A3E] hover:bg-[#09352c] text-white rounded-xl text-xs font-bold transition-colors cursor-pointer flex items-center gap-2 shadow-xs disabled:opacity-50"
              >
                {isUpdatingStatus ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    Menyimpan...
                  </>
                ) : (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    Simpan Perubahan Status
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      <ConfirmModal
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDeletePendaftaran}
        title="Konfirmasi Hapus Pendaftaran"
        itemName={deleteTarget ? `${deleteTarget.nama} (${deleteTarget.nim})` : undefined}
        description="Apakah Anda yakin ingin menghapus data pendaftaran mahasiswa ini? Tindakan ini akan menghapus data pendaftaran beserta relasi dokumen dan orang tua."
        isProcessing={isDeleting}
      />
    </div>
  );
}
