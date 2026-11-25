'use client';

import React from 'react';
import {
  Plus, Edit3, Trash2, X, RefreshCw,
  Calendar, AlertTriangle, CalendarDays, History, MapPin, Award,
  Check, Clock, Eye, EyeOff, Layers, Sparkles,
} from 'lucide-react';
import { PageHeader, StatCardMint, AlertBanner, ConfirmModal, FilterBar, LogPublikasiModal } from '@/components/ui';

export interface PeriodeOption {
  id: number;
  nama: string;
  tahunAkademik: string;
  status?: string;
}

export interface TimelineItem {
  id: number;
  id_timeline: number;
  id_periode: number;
  nama_periode: string | null;
  tahun_periode: number | null;
  nama_tahapan: string;
  tanggal_mulai: string;
  tanggal_selesai: string;
  tanggal_format: string;
  urutan: number;
  deskripsi: string;
  status: boolean;
  is_pelaksanaan: boolean;
  is_pengumuman: boolean;
  status_tahapan: 'Belum Dimulai' | 'Berlangsung' | 'Selesai';
}

export interface AdminTimelineViewProps {
  items: TimelineItem[];
  periodes: PeriodeOption[];
  isLoading: boolean;
  statusMessage: { type: 'success' | 'error'; text: string } | null;
  setStatusMessage: (msg: { type: 'success' | 'error'; text: string } | null) => void;
  // Search & Filter
  searchQuery: string;
  setSearchQuery: (val: string) => void;
  filterPeriode: string;
  setFilterPeriode: (val: string) => void;
  filterStatus: string;
  setFilterStatus: (val: string) => void;
  filteredItems: TimelineItem[];
  totalStages: number;
  totalBerlangsung: number;
  totalBelumDimulai: number;
  totalSelesai: number;
  activeFilteredPeriode: PeriodeOption | null;
  fetchData: () => Promise<void>;
  // Create / Edit Modal
  isModalOpen: boolean;
  setIsModalOpen: (val: boolean) => void;
  isSubmitting: boolean;
  editingId: number | null;
  idPeriode: string;
  setIdPeriode: (val: string) => void;
  namaTahapan: string;
  setNamaTahapan: (val: string) => void;
  tanggalMulai: string;
  setTanggalMulai: (val: string) => void;
  tanggalSelesai: string;
  setTanggalSelesai: (val: string) => void;
  urutan: string;
  deskripsi: string;
  setDeskripsi: (val: string) => void;
  statusActive: boolean;
  setStatusActive: (val: boolean) => void;
  isPelaksanaan: boolean;
  setIsPelaksanaan: (val: boolean) => void;
  isPengumuman: boolean;
  setIsPengumuman: (val: boolean) => void;
  handleOpenCreate: () => void;
  handleOpenEdit: (item: TimelineItem) => void;
  handleSubmit: (e: React.FormEvent) => Promise<void>;
  modalLiveStatus: 'Belum Dimulai' | 'Berlangsung' | 'Selesai';
  chronologyValidation: { valid: boolean; message?: string };
  // Toggle Status
  togglingId: number | null;
  handleToggleStatus: (item: TimelineItem) => Promise<void>;
  // Confirm Delete
  deleteTarget: TimelineItem | null;
  setDeleteTarget: (val: TimelineItem | null) => void;
  isDeleting: boolean;
  handleDeleteConfirm: () => Promise<void>;
  // Log Modal
  isLogModalOpen: boolean;
  setIsLogModalOpen: (val: boolean) => void;
}

export function AdminTimelineView({
  items,
  periodes,
  isLoading,
  statusMessage,
  setStatusMessage,
  searchQuery,
  setSearchQuery,
  filterPeriode,
  setFilterPeriode,
  filterStatus,
  setFilterStatus,
  filteredItems,
  totalStages,
  totalBerlangsung,
  totalBelumDimulai,
  totalSelesai,
  activeFilteredPeriode,
  fetchData,
  isModalOpen,
  setIsModalOpen,
  isSubmitting,
  editingId,
  idPeriode,
  setIdPeriode,
  namaTahapan,
  setNamaTahapan,
  tanggalMulai,
  setTanggalMulai,
  tanggalSelesai,
  setTanggalSelesai,
  urutan,
  deskripsi,
  setDeskripsi,
  statusActive,
  setStatusActive,
  isPelaksanaan,
  setIsPelaksanaan,
  isPengumuman,
  setIsPengumuman,
  handleOpenCreate,
  handleOpenEdit,
  handleSubmit,
  modalLiveStatus,
  chronologyValidation,
  togglingId,
  handleToggleStatus,
  deleteTarget,
  setDeleteTarget,
  isDeleting,
  handleDeleteConfirm,
  isLogModalOpen,
  setIsLogModalOpen,
}: AdminTimelineViewProps) {
  return (
    <div className="w-full max-w-7xl space-y-6 pb-12 font-sans">
      {/* ── Top Header Section ── */}
      <PageHeader
        title="KELOLA TIMELINE KEGIATAN"
        subtitle="KULIAH KERJA NYATA INTERNASIONAL"
        description="Atur tahapan pelaksanaan dan jadwal seleksi KKN Internasional. Status tahapan otomatis berganti sesuai tanggal berjalan."
        action={
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsLogModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-[#0E4A3E] text-xs font-bold transition-colors shadow-xs cursor-pointer"
              title="Lihat Riwayat Publikasi (Log Audit)"
            >
              <History className="w-4 h-4" />
              <span>Log Publikasi</span>
            </button>
            <button
              onClick={fetchData}
              disabled={isLoading}
              className="p-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-[#0E4A3E] transition-colors shadow-xs cursor-pointer"
              title="Muat ulang data"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            </button>
            <button
              onClick={handleOpenCreate}
              className="btn-primary-add"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              <span>Tambah Tahapan</span>
            </button>
          </div>
        }
      />

      {/* ── Feedback Message ── */}
      <AlertBanner message={statusMessage} onClose={() => setStatusMessage(null)} />

      {/* ── Stat Cards ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <StatCardMint
          value={totalStages}
          label="Total Tahapan"
          subLabel={activeFilteredPeriode ? activeFilteredPeriode.nama : 'Keseluruhan jadwal'}
        />
        <StatCardMint
          value={totalBerlangsung}
          label="Berlangsung"
          subLabel={activeFilteredPeriode ? 'Tahapan aktif periode ini' : 'Tahapan aktif saat ini'}
        />
        <StatCardMint
          value={totalBelumDimulai}
          label="Belum Dimulai"
          subLabel={activeFilteredPeriode ? 'Mendatang periode ini' : 'Tahapan mendatang'}
        />
        <StatCardMint
          value={totalSelesai}
          label="Telah Selesai"
          subLabel={activeFilteredPeriode ? 'Selesai periode ini' : 'Tahapan lampau'}
        />
      </div>

      {/* ── Filter & Search Bar ── */}
      <FilterBar
        searchValue={searchQuery}
        onSearchChange={setSearchQuery}
        searchPlaceholder="Cari tahapan atau deskripsi..."
        searchWidth="flex-1"
        filters={[
          {
            value: filterPeriode,
            onChange: setFilterPeriode,
            options: [
              { value: 'semua', label: 'Semua Periode' },
              ...periodes.map((p) => ({
                value: String(p.id),
                label: `${p.nama} (${p.tahunAkademik})${p.status === 'Aktif' ? ' — [Aktif]' : ''}`,
              })),
            ],
          },
          {
            value: filterStatus,
            onChange: setFilterStatus,
            options: [
              { value: 'semua', label: 'Semua Status' },
              { value: 'Berlangsung', label: '🟢 Berlangsung' },
              { value: 'Belum Dimulai', label: '🔵 Belum Dimulai' },
              { value: 'Selesai', label: '⚪ Selesai' },
              { value: 'aktif', label: 'Publikasi: Publish' },
              { value: 'nonaktif', label: 'Publikasi: Private' },
            ],
          },
        ]}
        countBadge={filteredItems.length}
        countLabel="tahapan"
      />

      {/* ── Timeline Visual Stepper List ── */}
      <div className="space-y-4">
        {/* Quick Legend / Status Guide */}
        <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-3.5 bg-gradient-to-r from-[#EAF5F0] via-white to-blue-50/40 rounded-2xl border border-[#C0E6D8] shadow-2xs">
          <div className="flex items-center gap-2 text-xs font-bold text-[#0E4A3E]">
            <Layers className="w-4 h-4 text-[#0E4A3E]" />
            <span>Alur Kronologis Jadwal KKN Internasional</span>
          </div>
          <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-[11px] font-bold">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-600 text-white shadow-2xs">
              <span className="w-2 h-2 rounded-full bg-white animate-ping" />
              Berlangsung (Aktif Hari Ini)
            </span>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
              <Clock className="w-3 h-3 text-blue-600" />
              Belum Dimulai
            </span>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
              <Check className="w-3 h-3 text-emerald-600" />
              Selesai
            </span>
          </div>
        </div>

        {/* Timeline Cards Container */}
        <div className="bg-white rounded-3xl border border-[#C0E6D8] p-4 sm:p-6 shadow-xs">
          {isLoading ? (
            <div className="p-12 text-center space-y-3">
              <div className="w-8 h-8 border-3 border-[#0E4A3E] border-t-transparent rounded-full animate-spin mx-auto" />
              <p className="text-xs text-slate-500 font-semibold">Memuat data jadwal tahapan...</p>
            </div>
          ) : filteredItems.length === 0 ? (
            <div className="p-12 text-center space-y-3">
              <CalendarDays className="w-12 h-12 text-slate-300 mx-auto" />
              <h3 className="text-base font-bold text-slate-700">Tidak Ada Data Tahapan</h3>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                {searchQuery || filterStatus !== 'semua' || filterPeriode !== 'semua'
                  ? 'Tidak ada tahapan yang cocok dengan filter pencarian Anda.'
                  : 'Belum ada data tahapan timeline yang ditambahkan untuk periode ini.'}
              </p>
              <button
                onClick={handleOpenCreate}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#0E4A3E] text-white text-xs font-bold shadow-xs hover:bg-[#155a4c] transition-colors cursor-pointer mt-2"
              >
                <Plus className="w-4 h-4" /> Tambah Tahapan Pertama
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredItems.map((item, index) => {
                const isBerlangsung = item.status_tahapan === 'Berlangsung';
                const isSelesai = item.status_tahapan === 'Selesai';
                const isLast = index === filteredItems.length - 1;

                return (
                  <div key={item.id_timeline} className="relative flex items-start gap-3 sm:gap-5 group">
                    {/* Vertical Connector Line */}
                    {!isLast && (
                      <div
                        className={`absolute left-[19px] sm:left-[23px] top-[46px] bottom-[-20px] w-[3px] rounded-full transition-colors z-0 ${
                          isSelesai
                            ? 'bg-emerald-300'
                            : isBerlangsung
                            ? 'bg-gradient-to-b from-[#0E4A3E] via-[#568E7D] to-slate-200'
                            : 'bg-slate-200'
                        }`}
                      />
                    )}

                    {/* Step Node Icon / Number */}
                    <div className="relative z-10 shrink-0 mt-0.5">
                      {isBerlangsung ? (
                        <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-[#0E4A3E] text-white font-black text-sm sm:text-base flex items-center justify-center shadow-lg shadow-emerald-950/20 ring-4 ring-[#C0E6D8] ring-offset-2 animate-pulse">
                          {String(item.urutan).padStart(2, '0')}
                        </div>
                      ) : isSelesai ? (
                        <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-emerald-600 text-white font-bold flex items-center justify-center shadow-md ring-2 ring-emerald-100">
                          <Check className="w-5 h-5 sm:w-6 sm:h-6 stroke-[3]" />
                        </div>
                      ) : (
                        <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-white text-slate-600 font-extrabold border-2 border-slate-300 flex items-center justify-center text-xs sm:text-sm shadow-2xs group-hover:border-[#568E7D] group-hover:text-[#0E4A3E] transition-colors">
                          {String(item.urutan).padStart(2, '0')}
                        </div>
                      )}
                    </div>

                    {/* Stage Card */}
                    <div
                      className={`flex-1 rounded-2xl p-4 sm:p-5 transition-all duration-200 border ${
                        isBerlangsung
                          ? 'bg-gradient-to-br from-[#EAF5F0] via-white to-[#F2FBF6] border-2 border-[#568E7D] shadow-md shadow-emerald-950/5 ring-1 ring-[#568E7D]/30'
                          : isSelesai
                          ? 'bg-slate-50/70 border-slate-200 shadow-2xs'
                          : 'bg-white hover:bg-slate-50/80 border-slate-200 shadow-xs hover:border-slate-300'
                      } ${!item.status ? 'opacity-65 border-dashed' : ''}`}
                    >
                      {/* Top Header of Card: Title & Status Badge */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h3
                              className={`font-black text-base sm:text-lg leading-tight ${
                                isBerlangsung ? 'text-[#0E4A3E]' : 'text-slate-800'
                              }`}
                            >
                              {item.nama_tahapan}
                            </h3>

                            {item.nama_periode && (
                              <span className="bg-[#EAF5F0] text-[#0E4A3E] border border-[#C0E6D8] text-[10px] font-extrabold px-2.5 py-0.5 rounded-full">
                                {item.nama_periode}
                              </span>
                            )}
                            {item.is_pelaksanaan && (
                              <span className="bg-amber-100 text-amber-900 border border-amber-300 text-[10px] font-black px-2.5 py-0.5 rounded-full flex items-center gap-1 shadow-2xs">
                                <MapPin className="w-3 h-3 text-amber-700" />
                                Pelaksanaan Utama KKN
                              </span>
                            )}
                            {item.is_pengumuman && (
                              <span className="bg-purple-100 text-purple-900 border border-purple-300 text-[10px] font-black px-2.5 py-0.5 rounded-full flex items-center gap-1 shadow-2xs">
                                <Award className="w-3 h-3 text-purple-700" />
                                Pengumuman Hasil Seleksi
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Status Badge */}
                        <div className="shrink-0 self-start sm:self-auto">
                          {isBerlangsung ? (
                            <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#0E4A3E] text-white text-xs font-black shadow-sm">
                              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                              Sedang Berlangsung
                            </span>
                          ) : isSelesai ? (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-300 text-xs font-bold">
                              <Check className="w-3.5 h-3.5 text-emerald-600" />
                              Selesai
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-200 text-xs font-bold">
                              <Clock className="w-3.5 h-3.5 text-blue-500" />
                              Belum Dimulai
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Description */}
                      {item.deskripsi && (
                        <p className="text-xs sm:text-sm text-slate-600 leading-relaxed mt-2.5">
                          {item.deskripsi}
                        </p>
                      )}

                      {/* Bottom Bar: Date & Interactive Actions */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mt-4 pt-3.5 border-t border-slate-100">
                        {/* Date Pill */}
                        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white border border-[#C0E6D8] text-slate-800 text-xs font-bold shadow-2xs">
                          <Calendar className="w-4 h-4 text-[#0E4A3E]" />
                          <span>{item.tanggal_format}</span>
                        </div>

                        {/* Right: Publish Toggle & Edit/Delete Action Buttons */}
                        <div className="flex items-center justify-between sm:justify-end gap-2.5 flex-wrap">
                          {/* Toggle Visibility (Publish / Private) */}
                          <div
                            className={`flex items-center gap-2 px-3 py-1 rounded-xl border transition-colors shadow-2xs ${
                              item.status
                                ? 'bg-emerald-50/60 border-emerald-200'
                                : 'bg-slate-100 border-slate-200'
                            }`}
                          >
                            <span className="text-[11px] font-bold flex items-center gap-1">
                              {item.status ? (
                                <Eye className="w-3.5 h-3.5 text-emerald-700" />
                              ) : (
                                <EyeOff className="w-3.5 h-3.5 text-slate-400" />
                              )}
                              <span className={item.status ? 'text-emerald-800' : 'text-slate-500'}>
                                {item.status ? 'Publik' : 'Private'}
                              </span>
                            </span>

                            <button
                              type="button"
                              role="switch"
                              aria-checked={item.status}
                              onClick={() => handleToggleStatus(item)}
                              disabled={togglingId === item.id_timeline}
                              className={`group relative inline-flex h-5 w-9 shrink-0 cursor-pointer items-center rounded-full transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-[#0E4A3E] focus:ring-offset-1 disabled:opacity-50 ${
                                item.status ? 'bg-[#0E4A3E]' : 'bg-slate-300 hover:bg-slate-400'
                              }`}
                              title={
                                item.status
                                  ? 'Klik untuk ubah ke Private (Sembunyikan dari portal mahasiswa)'
                                  : 'Klik untuk ubah ke Publish (Tampilkan di portal mahasiswa)'
                              }
                            >
                              <span className="sr-only">Toggle Status Timeline</span>
                              <span
                                className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow-md transition duration-200 ease-in-out ${
                                  item.status ? 'translate-x-4' : 'translate-x-1'
                                }`}
                              />
                            </button>
                          </div>

                          {/* Action Buttons */}
                          <div className="flex items-center gap-1.5">
                            <button
                              onClick={() => handleOpenEdit(item)}
                              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 text-xs font-bold transition-all shadow-2xs cursor-pointer hover:scale-102"
                              title="Edit Jadwal Tahapan"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                              <span>Edit</span>
                            </button>

                            <button
                              onClick={() => setDeleteTarget(item)}
                              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 text-xs font-bold transition-all shadow-2xs cursor-pointer hover:scale-102"
                              title="Hapus Jadwal Tahapan"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                              <span>Hapus</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* ── CREATE / EDIT MODAL ── */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-[#E8F5F1] text-[#0E4A3E] flex items-center justify-center">
                  <CalendarDays className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-bold text-slate-800">
                    {editingId ? 'Edit Tahapan Timeline' : 'Tambah Tahapan Timeline Baru'}
                  </h3>
                  <p className="text-xs text-slate-500">Jadwal seleksi KKN Internasional</p>
                </div>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Periode */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Periode Pendaftaran <span className="text-red-500">*</span>
                </label>
                <select
                  value={idPeriode}
                  onChange={(e) => setIdPeriode(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-semibold focus:outline-hidden focus:ring-2 focus:ring-[#0E4A3E] focus:bg-white"
                  required
                >
                  {periodes.map((p) => (
                    <option key={p.id} value={String(p.id)}>
                      {p.nama} ({p.tahunAkademik})
                    </option>
                  ))}
                </select>
              </div>

              {/* Nama Tahapan & Urutan */}
              <div className="grid grid-cols-4 gap-3">
                <div className="col-span-3">
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Nama Tahapan <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="Contoh: Seleksi Wawancara"
                    value={namaTahapan}
                    onChange={(e) => setNamaTahapan(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-hidden focus:ring-2 focus:ring-[#0E4A3E] focus:bg-white"
                    required
                  />
                </div>
                <div className="col-span-1">
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-xs font-bold text-slate-700">
                      Urutan
                    </label>
                    <span className="text-[9px] font-bold text-[#0E4A3E] bg-[#E8F5F1] px-1 py-0.5 rounded">
                      Auto
                    </span>
                  </div>
                  <input
                    type="number"
                    min="1"
                    value={urutan}
                    readOnly
                    className="w-full px-3.5 py-2.5 bg-slate-100 border border-slate-200 rounded-xl text-xs sm:text-sm font-extrabold text-center text-[#0E4A3E] cursor-not-allowed select-none shadow-inner"
                    title="Urutan otomatis ditentukan berdasarkan urutan kronologis tanggal mulai pada periode ini"
                  />
                </div>
              </div>

              {/* Tanggal Mulai & Tanggal Selesai */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Tanggal Mulai <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    value={tanggalMulai}
                    onChange={(e) => setTanggalMulai(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-semibold focus:outline-hidden focus:ring-2 focus:ring-[#0E4A3E] focus:bg-white"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Tanggal Selesai <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    value={tanggalSelesai}
                    onChange={(e) => setTanggalSelesai(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-semibold focus:outline-hidden focus:ring-2 focus:ring-[#0E4A3E] focus:bg-white"
                    required
                  />
                </div>
              </div>

              {/* Live Status Calculation & Kronologis Preview */}
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-slate-500 font-medium">Prediksi Status:</span>
                  <span
                    className={`px-2.5 py-0.5 rounded-full font-bold border ${
                      modalLiveStatus === 'Berlangsung'
                        ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                        : modalLiveStatus === 'Selesai'
                        ? 'bg-slate-200 text-slate-700 border-slate-300'
                        : 'bg-blue-100 text-blue-800 border-blue-300'
                    }`}
                  >
                    {modalLiveStatus === 'Berlangsung' && '🟢 Sedang Berlangsung'}
                    {modalLiveStatus === 'Belum Dimulai' && '🔵 Belum Dimulai'}
                    {modalLiveStatus === 'Selesai' && '⚪ Telah Selesai'}
                  </span>
                </div>
                <div className="flex items-center justify-between pt-1 border-t border-slate-200/60 text-[11px]">
                  <span className="text-slate-500">Posisi Urutan Otomatis:</span>
                  <span className="font-bold text-[#0E4A3E]">
                    Tahapan ke-{urutan} dari {items.filter(i => String(i.id_periode) === idPeriode && i.id_timeline !== editingId).length + 1} (Kronologis)
                  </span>
                </div>
              </div>

              {/* Warning Alert if Chronology is Violated */}
              {!chronologyValidation.valid && (
                <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 flex items-start gap-2.5 animate-fadeIn">
                  <AlertTriangle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-bold">Konflik Alur Kronologis</p>
                    <p className="text-[11px] text-red-600 mt-0.5 leading-relaxed">
                      {chronologyValidation.message}
                    </p>
                  </div>
                </div>
              )}

              {/* Deskripsi */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Deskripsi / Keterangan Tahapan
                </label>
                <textarea
                  rows={3}
                  placeholder="Penjelasan ringkas mengenai tahapan ini..."
                  value={deskripsi}
                  onChange={(e) => setDeskripsi(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-hidden focus:ring-2 focus:ring-[#0E4A3E] focus:bg-white resize-none"
                />
              </div>

              {/* Status Switch (Publish / Private) */}
              <div className="pt-2 flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-slate-800 block">
                    Status Publikasi ({statusActive ? 'Publish' : 'Private'})
                  </span>
                  <span className="text-[11px] text-slate-400">
                    {statusActive
                      ? 'Publish: Ditampilkan ke halaman publik & portal mahasiswa'
                      : 'Private: Disembunyikan dari publik & mahasiswa'}
                  </span>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={statusActive}
                    onChange={(e) => setStatusActive(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-slate-200 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#0E4A3E]"></div>
                </label>
              </div>

              {/* Toggle Jadwal Utama Pelaksanaan KKN */}
              <div className="p-3.5 rounded-xl border border-emerald-200 bg-emerald-50/60 flex items-center justify-between gap-3">
                <div className="space-y-0.5">
                  <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-[#0E4A3E]" />
                    Jadikan Jadwal Utama Pelaksanaan KKN
                  </span>
                  <span className="text-[11px] text-slate-600 block leading-relaxed">
                    Tanggal tahapan ini akan otomatis dijadikan acuan pada kartu <b>&quot;Waktu &amp; Periode&quot;</b> di halaman informasi.
                  </span>
                </div>
                <label className="relative inline-flex items-center cursor-pointer shrink-0">
                  <input
                    type="checkbox"
                    checked={isPelaksanaan}
                    onChange={(e) => setIsPelaksanaan(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-slate-200 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#0E4A3E]"></div>
                </label>
              </div>

              {/* Toggle Jadwal Pengumuman Hasil Seleksi */}
              <div className="p-3.5 rounded-xl border border-amber-200 bg-amber-50/60 flex items-center justify-between gap-3">
                <div className="space-y-0.5">
                  <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                    <Award className="w-3.5 h-3.5 text-amber-700" />
                    Jadikan Jadwal Pengumuman Hasil Seleksi
                  </span>
                  <span className="text-[11px] text-slate-600 block leading-relaxed">
                    Batas akhir tahapan ini dijadikan acuan penguncian otomatis keputusan hasil seleksi dan pengumuman kelulusan di portal publik/mahasiswa.
                  </span>
                </div>
                <label className="relative inline-flex items-center cursor-pointer shrink-0">
                  <input
                    type="checkbox"
                    checked={isPengumuman}
                    onChange={(e) => setIsPengumuman(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-slate-200 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-600"></div>
                </label>
              </div>

              {/* Buttons */}
              <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-slate-100 mt-6">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  disabled={isSubmitting}
                  className="px-4 py-2.5 rounded-xl border border-slate-300 text-slate-700 text-xs sm:text-sm font-bold hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || !chronologyValidation.valid}
                  className="px-5 py-2.5 rounded-xl bg-[#0E4A3E] hover:bg-[#155a4c] text-white text-xs sm:text-sm font-bold shadow-md transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer flex items-center gap-2"
                  title={!chronologyValidation.valid ? chronologyValidation.message : undefined}
                >
                  {isSubmitting && <RefreshCw className="w-4 h-4 animate-spin" />}
                  {editingId ? 'Simpan Perubahan' : 'Tambah Tahapan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── DELETE CONFIRMATION MODAL ── */}
      <ConfirmModal
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDeleteConfirm}
        title="Hapus Tahapan?"
        itemName={deleteTarget?.nama_tahapan}
        description="Apakah Anda yakin ingin menghapus tahapan timeline ini? Tindakan ini tidak dapat dibatalkan."
        isProcessing={isDeleting}
      />

      {/* ── LOG AUDIT PUBLIKASI MODAL ── */}
      <LogPublikasiModal
        isOpen={isLogModalOpen}
        onClose={() => setIsLogModalOpen(false)}
        defaultJenis="timeline"
        idPeriode={filterPeriode !== 'semua' ? filterPeriode : null}
      />
    </div>
  );
}
