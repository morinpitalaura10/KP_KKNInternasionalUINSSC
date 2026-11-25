'use client';

import React from 'react';
import {
  GraduationCap,
  Star,
  Layers,
  BookOpen,
  CheckCircle2,
  RefreshCw,
  Save,
  HelpCircle,
  Plus,
  Building2,
  X,
  Trash2,
  Search,
  Pencil,
  ArrowRightLeft,
  AlertCircle,
} from 'lucide-react';
import { PageHeader, StatCardMint, AlertBanner } from '@/components/ui';

export interface ProdiItem {
  id_prodi: number;
  id_fakultas: number;
  nama_prodi: string;
  status: boolean;
  fakultas: {
    id_fakultas: number;
    nama_fakultas: string;
  };
}

export interface FakultasItem {
  id_fakultas: number;
  nama_fakultas: string;
}

export interface AdminPersyaratanAkademikViewProps {
  isLoading: boolean;
  isSaving: boolean;
  statusMessage: { type: 'success' | 'error'; text: string } | null;
  setStatusMessage: (msg: { type: 'success' | 'error'; text: string } | null) => void;
  // Form Fields
  minIpk: number;
  setMinIpk: (val: number) => void;
  minSemester: number;
  setMinSemester: (val: number) => void;
  maxSemester: number;
  setMaxSemester: (val: number) => void;
  minSks: number;
  setMinSks: (val: number) => void;
  allProdi: boolean;
  setAllProdi: (val: boolean) => void;
  allowedProdiIds: number[];
  akademikStatus: boolean;
  setAkademikStatus: (val: boolean) => void;
  catatanAkademik: string;
  setCatatanAkademik: (val: string) => void;
  prodiList: ProdiItem[];
  prodiSearch: string;
  setProdiSearch: (val: string) => void;
  prodiByFakultas: Record<string, { id_fakultas: number; prodis: ProdiItem[] }>;
  uniqueFaculties: { id: number; name: string }[];
  toggleProdi: (id: number) => void;
  selectAllProdi: () => void;
  deselectAllProdi: () => void;
  handleSave: (e: React.FormEvent) => Promise<void>;
  // Modal Fakultas
  isFacultyModalOpen: boolean;
  setIsFacultyModalOpen: (val: boolean) => void;
  newFacultyName: string;
  setNewFacultyName: (val: string) => void;
  newFacultyInitialProdi: string;
  setNewFacultyInitialProdi: (val: string) => void;
  isSubmittingNew: boolean;
  handleCreateFaculty: (e: React.FormEvent) => Promise<void>;
  // Modal Prodi
  isProdiModalOpen: boolean;
  setIsProdiModalOpen: (val: boolean) => void;
  selectedFakultasId: number | '';
  setSelectedFakultasId: (val: number | '') => void;
  newProdiName: string;
  setNewProdiName: (val: string) => void;
  handleCreateProdi: (e: React.FormEvent) => Promise<void>;
  // Edit / Hapus Prodi
  editingProdi: { id_prodi: number; id_fakultas: number; nama_prodi: string } | null;
  setEditingProdi: (val: { id_prodi: number; id_fakultas: number; nama_prodi: string } | null) => void;
  deletingProdi: { id_prodi: number; nama_prodi: string } | null;
  setDeletingProdi: (val: { id_prodi: number; nama_prodi: string } | null) => void;
  handleUpdateProdi: (e: React.FormEvent) => Promise<void>;
  handleDeleteProdi: () => Promise<void>;
  // Edit / Hapus Fakultas
  editingFaculty: { id_fakultas: number; nama_fakultas: string } | null;
  setEditingFaculty: (val: { id_fakultas: number; nama_fakultas: string } | null) => void;
  deletingFaculty: { id_fakultas: number; nama_fakultas: string; prodiCount: number } | null;
  setDeletingFaculty: (val: { id_fakultas: number; nama_fakultas: string; prodiCount: number } | null) => void;
  handleUpdateFaculty: (e: React.FormEvent) => Promise<void>;
  handleDeleteFaculty: () => Promise<void>;
  isActionLoading: boolean;
}

export function AdminPersyaratanAkademikView({
  isLoading,
  isSaving,
  statusMessage,
  setStatusMessage,
  minIpk,
  setMinIpk,
  minSemester,
  setMinSemester,
  maxSemester,
  setMaxSemester,
  minSks,
  setMinSks,
  allProdi,
  setAllProdi,
  allowedProdiIds,
  akademikStatus,
  setAkademikStatus,
  catatanAkademik,
  setCatatanAkademik,
  prodiList,
  prodiSearch,
  setProdiSearch,
  prodiByFakultas,
  uniqueFaculties,
  toggleProdi,
  selectAllProdi,
  deselectAllProdi,
  handleSave,
  isFacultyModalOpen,
  setIsFacultyModalOpen,
  newFacultyName,
  setNewFacultyName,
  newFacultyInitialProdi,
  setNewFacultyInitialProdi,
  isSubmittingNew,
  handleCreateFaculty,
  isProdiModalOpen,
  setIsProdiModalOpen,
  selectedFakultasId,
  setSelectedFakultasId,
  newProdiName,
  setNewProdiName,
  handleCreateProdi,
  editingProdi,
  setEditingProdi,
  deletingProdi,
  setDeletingProdi,
  handleUpdateProdi,
  handleDeleteProdi,
  editingFaculty,
  setEditingFaculty,
  deletingFaculty,
  setDeletingFaculty,
  handleUpdateFaculty,
  handleDeleteFaculty,
  isActionLoading,
}: AdminPersyaratanAkademikViewProps) {
  return (
    <div className="w-full max-w-7xl space-y-6 pb-12 font-sans">
      {/* ── Page Header matching Archivo Black design ── */}
      <PageHeader
        title="KELOLA PERSYARATAN AKADEMIK"
        subtitle="KULIAH KERJA NYATA INTERNASIONAL"
        description="Atur kriteria kelayakan akademik yang divalidasi secara otomatis oleh sistem bagi calon peserta KKN Internasional."
        action={
          <div className="flex flex-wrap items-center gap-2.5">
            <button
              type="button"
              onClick={() => setIsFacultyModalOpen(true)}
              className="inline-flex items-center gap-2 px-3.5 py-2.5 bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 rounded-xl text-xs sm:text-sm font-bold shadow-2xs transition-all cursor-pointer whitespace-nowrap"
            >
              <Building2 className="w-4 h-4 text-[#0E4A3E]" />
              <span>+ Fakultas</span>
            </button>
            <button
              type="button"
              onClick={() => {
                if (uniqueFaculties.length > 0) {
                  setSelectedFakultasId(uniqueFaculties[0].id);
                }
                setIsProdiModalOpen(true);
              }}
              className="inline-flex items-center gap-2 px-3.5 py-2.5 bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 rounded-xl text-xs sm:text-sm font-bold shadow-2xs transition-all cursor-pointer whitespace-nowrap"
            >
              <Plus className="w-4 h-4 text-emerald-600" />
              <span>+ Program Studi</span>
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={isSaving}
              className="inline-flex items-center gap-2 bg-[#0E4A3E] hover:bg-[#08362d] text-white font-bold text-xs sm:text-sm px-5 py-2.5 rounded-xl shadow-xs transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer shrink-0 disabled:opacity-50 whitespace-nowrap"
            >
              {isSaving ? <RefreshCw className="w-4 h-4 animate-spin text-emerald-300" /> : <Save className="w-4 h-4 text-emerald-300" />}
              <span>{isSaving ? 'Menyimpan...' : 'Simpan Kriteria'}</span>
            </button>
          </div>
        }
      />

      {/* ── Stat Cards ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <StatCardMint
          value={minIpk.toFixed(2)}
          label="Standar IPK Minimal"
          subLabel="Skala 4.00 SIAKAD"
        />
        <StatCardMint
          value={`Smt ${minSemester} - ${maxSemester}`}
          label="Batas Semester"
          subLabel="Status Mahasiswa Aktif"
        />
        <StatCardMint
          value={`${minSks} SKS`}
          label="Minimal Beban SKS"
          subLabel="Lulus Semester Lalu"
        />
        <StatCardMint
          value={akademikStatus ? 'Aktif' : 'Nonaktif'}
          label="Status Validasi"
          subLabel={allProdi ? 'Semua Prodi Dibuka' : `${allowedProdiIds.length} Prodi Terpilih`}
        />
      </div>

      {/* ── Status Message Banner ── */}
      <AlertBanner message={statusMessage} onClose={() => setStatusMessage(null)} />

      {isLoading ? (
        <div className="py-20 text-center text-slate-400 flex flex-col items-center justify-center gap-3 bg-white rounded-2xl border border-slate-200">
          <RefreshCw className="w-8 h-8 animate-spin text-[#0E4A3E]" />
          <span className="text-sm font-semibold text-slate-600">Memuat konfigurasi persyaratan akademik...</span>
        </div>
      ) : (
        <form onSubmit={handleSave} className="space-y-6">
          {/* ── CARD 1: Parameter Kriteria Akademik Utama ── */}
          <div className="bg-gradient-to-br from-[#EAF5F0]/70 via-white to-[#F2F8F5] rounded-2xl sm:rounded-3xl border border-[#C0E6D8] shadow-xs overflow-hidden">
            {/* Header Box */}
            <div className="bg-[#EAF5F0]/90 border-b border-[#C0E6D8] px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#0E4A3E] text-emerald-300 flex items-center justify-center shrink-0 shadow-xs">
                  <GraduationCap className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-extrabold text-[#0E4A3E] uppercase tracking-wide">
                    Standar Parameter Akademik
                  </h3>
                  <p className="text-xs text-slate-500 font-medium">
                    Atur batas nilai IPK, jenjang semester, dan akumulasi SKS untuk validasi otomatis sistem.
                  </p>
                </div>
              </div>

              {/* Toggle Status Switch */}
              <div className="flex items-center gap-2.5 self-start sm:self-auto bg-white px-3.5 py-1.5 rounded-xl border border-[#C0E6D8] shadow-2xs">
                <span className="text-xs font-bold text-slate-600">Validasi Sistem:</span>
                <button
                  type="button"
                  onClick={() => setAkademikStatus(!akademikStatus)}
                  className={`px-3 py-1 rounded-lg text-xs font-black transition-all cursor-pointer ${
                    akademikStatus
                      ? 'bg-[#0E4A3E] text-white shadow-xs'
                      : 'bg-slate-200 text-slate-600 hover:bg-slate-300'
                  }`}
                >
                  {akademikStatus ? 'AKTIF' : 'NONAKTIF'}
                </button>
              </div>
            </div>

            {/* 3 Parameter Columns */}
            <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* 1. IPK Minimal */}
              <div className="bg-white/90 rounded-2xl border border-[#C0E6D8] p-5 space-y-3 shadow-2xs">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-extrabold text-[#0E4A3E] uppercase tracking-wider flex items-center gap-1.5">
                    <Star className="w-4 h-4 text-emerald-600 fill-emerald-600" />
                    1. Standar IPK Minimal
                  </span>
                  <span className="text-[11px] font-bold text-slate-400">Skala 4.00</span>
                </div>
                <p className="text-[11px] text-slate-500 leading-relaxed">
                  Batas Indeks Prestasi Kumulatif terendah yang berhak mengirim pendaftaran.
                </p>

                <div className="relative">
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    max="4.00"
                    value={minIpk}
                    onChange={(e) => setMinIpk(parseFloat(e.target.value) || 0)}
                    required
                    className="w-full px-4 py-2.5 bg-white rounded-xl border border-slate-300 text-lg font-black text-[#0E4A3E] focus:outline-none focus:ring-2 focus:ring-[#0E4A3E] shadow-2xs"
                  />
                  <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">
                    / 4.00
                  </span>
                </div>

                <div className="flex items-center gap-1.5 pt-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Preset:</span>
                  {[3.0, 3.25, 3.5, 3.75].map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => setMinIpk(preset)}
                      className={`text-[11px] font-bold px-2 py-0.5 rounded-md border transition-all cursor-pointer ${
                        minIpk === preset
                          ? 'bg-[#0E4A3E] text-white border-[#0E4A3E] shadow-2xs'
                          : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      {preset.toFixed(2)}
                    </button>
                  ))}
                </div>
              </div>

              {/* 2. Rentang Semester */}
              <div className="bg-white/90 rounded-2xl border border-[#C0E6D8] p-5 space-y-3 shadow-2xs">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-extrabold text-[#0E4A3E] uppercase tracking-wider flex items-center gap-1.5">
                    <Layers className="w-4 h-4 text-emerald-600" />
                    2. Batas Jenjang Semester
                  </span>
                  <span className="text-[11px] font-bold text-slate-400">Aktif</span>
                </div>
                <p className="text-[11px] text-slate-500 leading-relaxed">
                  Jenjang semester mahasiswa aktif yang diizinkan mengikuti seleksi.
                </p>

                <div className="grid grid-cols-2 gap-2.5">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">Semester Minimal</label>
                    <input
                      type="number"
                      min="1"
                      max="14"
                      value={minSemester}
                      onChange={(e) => setMinSemester(parseInt(e.target.value, 10) || 1)}
                      required
                      className="w-full px-3 py-2 bg-white rounded-xl border border-slate-300 text-sm font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0E4A3E] shadow-2xs"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">Semester Maksimal</label>
                    <input
                      type="number"
                      min="1"
                      max="14"
                      value={maxSemester}
                      onChange={(e) => setMaxSemester(parseInt(e.target.value, 10) || 14)}
                      required
                      className="w-full px-3 py-2 bg-white rounded-xl border border-slate-300 text-sm font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0E4A3E] shadow-2xs"
                    />
                  </div>
                </div>

                <div className="bg-[#DDF2E8] text-[#0E4A3E] px-2.5 py-1.5 rounded-lg border border-[#c2e5d6] text-[11px] font-bold">
                  Target: Mahasiswa Semester {minSemester} s/d {maxSemester}
                </div>
              </div>

              {/* 3. Beban SKS Lulus */}
              <div className="bg-white/90 rounded-2xl border border-[#C0E6D8] p-5 space-y-3 shadow-2xs">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-extrabold text-[#0E4A3E] uppercase tracking-wider flex items-center gap-1.5">
                    <BookOpen className="w-4 h-4 text-emerald-600" />
                    3. Beban SKS Lulus
                  </span>
                  <span className="text-[11px] font-bold text-slate-400">Akumulasi</span>
                </div>
                <p className="text-[11px] text-slate-500 leading-relaxed">
                  Minimal total SKS yang telah diselesaikan pada semester sebelumnya.
                </p>

                <div className="relative">
                  <input
                    type="number"
                    min="0"
                    max="160"
                    value={minSks}
                    onChange={(e) => setMinSks(parseInt(e.target.value, 10) || 0)}
                    required
                    className="w-full px-4 py-2.5 bg-white rounded-xl border border-slate-300 text-lg font-black text-[#0E4A3E] focus:outline-none focus:ring-2 focus:ring-[#0E4A3E] shadow-2xs"
                  />
                  <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">
                    SKS
                  </span>
                </div>

                <p className="text-[11px] text-slate-500 pt-1">
                  Standar kelayakan KKN Internasional umumnya minimal 100 SKS telah ditempuh.
                </p>
              </div>
            </div>
          </div>

          {/* ── CARD 2: Aturan Jurusan / Program Studi ── */}
          <div className="bg-gradient-to-br from-[#EAF5F0]/70 via-white to-[#F2F8F5] rounded-2xl sm:rounded-3xl border border-[#C0E6D8] shadow-xs overflow-hidden">
            {/* Header Box */}
            <div className="bg-[#EAF5F0]/90 border-b border-[#C0E6D8] px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#0E4A3E] text-emerald-300 flex items-center justify-center shrink-0 shadow-xs">
                  <Building2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-extrabold text-[#0E4A3E] uppercase tracking-wide">
                    Ketentuan Jurusan / Program Studi yang Dibuka
                  </h3>
                  <p className="text-xs text-slate-500 font-medium">
                    Tentukan apakah pendaftaran dibuka untuk semua program studi atau dibatasi untuk jurusan tertentu.
                  </p>
                </div>
              </div>

              {/* Mode Segmented Switch */}
              <div className="flex items-center gap-1.5 bg-white p-1 rounded-xl border border-slate-200 shadow-2xs">
                <button
                  type="button"
                  onClick={() => setAllProdi(true)}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    allProdi
                      ? 'bg-[#0E4A3E] text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  Semua Jurusan Terbuka
                </button>
                <button
                  type="button"
                  onClick={() => setAllProdi(false)}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    !allProdi
                      ? 'bg-[#0E4A3E] text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  Pilih Jurusan Tertentu
                </button>
              </div>
            </div>

            {/* Content Area */}
            <div className="p-6">
              {allProdi ? (
                <div className="p-6 bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-start gap-3.5">
                    <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                      <CheckCircle2 className="w-6 h-6" />
                    </div>
                    <div>
                      <h4 className="text-sm font-extrabold text-emerald-950">
                        Seluruh Program Studi Terbuka untuk Pendaftaran KKN Internasional
                      </h4>
                      <p className="text-xs text-emerald-800 mt-1 leading-relaxed">
                        Mahasiswa aktif dari seluruh fakultas dan jurusan diizinkan mengajukan pendaftaran selama memenuhi syarat IPK minimal ({minIpk.toFixed(2)}) dan rentang semester ({minSemester} - {maxSemester}).
                      </p>
                    </div>
                  </div>
                  <span className="text-xs font-extrabold text-emerald-900 bg-white/90 px-4 py-2 rounded-xl border border-emerald-300 shadow-2xs shrink-0 self-start sm:self-auto">
                    {prodiList.length} Program Studi Aktif
                  </span>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Filter & Selection Bar */}
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-3.5 bg-slate-50 rounded-xl border border-slate-200">
                    <div className="relative flex-1 max-w-sm">
                      <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        placeholder="Cari program studi atau fakultas..."
                        value={prodiSearch}
                        onChange={(e) => setProdiSearch(e.target.value)}
                        className="w-full pl-9 pr-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-medium focus:outline-none focus:ring-1 focus:ring-[#0E4A3E]"
                      />
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={selectAllProdi}
                        className="px-3 py-1.5 bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 rounded-lg text-xs font-bold transition-all shadow-2xs cursor-pointer"
                      >
                        Pilih Semua
                      </button>
                      <button
                        type="button"
                        onClick={deselectAllProdi}
                        className="px-3 py-1.5 bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 rounded-lg text-xs font-bold transition-all shadow-2xs cursor-pointer"
                      >
                        Batalkan Semua
                      </button>
                      <span className="text-xs font-extrabold text-[#0E4A3E] bg-[#DDF2E8] px-3 py-1.5 rounded-lg border border-[#b2decb]">
                        {allowedProdiIds.length} / {prodiList.length} Terpilih
                      </span>
                    </div>
                  </div>

                  {/* Faculties Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {Object.entries(prodiByFakultas).map(([fakultas, item]) => (
                      <div key={fakultas} className="border border-slate-200 rounded-xl p-4 bg-white shadow-2xs space-y-3">
                        {/* Header Box Fakultas */}
                        <div className="pb-2 border-b border-slate-100 flex items-center justify-between gap-1">
                          <span className="text-xs font-extrabold text-[#0E4A3E] truncate">
                            {fakultas}
                          </span>
                          <div className="flex items-center gap-1 shrink-0">
                            <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
                              {item.prodis.length} Prodi
                            </span>
                            <button
                              type="button"
                              onClick={() => {
                                setEditingFaculty({
                                  id_fakultas: item.id_fakultas,
                                  nama_fakultas: fakultas,
                                });
                              }}
                              title={`Ubah nama fakultas ${fakultas}`}
                              className="p-1 rounded text-slate-400 hover:text-emerald-700 hover:bg-emerald-50 transition-colors cursor-pointer"
                            >
                              <Pencil className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                setSelectedFakultasId(item.id_fakultas);
                                setIsProdiModalOpen(true);
                              }}
                              title={`Tambah program studi di ${fakultas}`}
                              className="p-1 rounded text-emerald-700 hover:bg-emerald-100 transition-colors cursor-pointer"
                            >
                              <Plus className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                setDeletingFaculty({
                                  id_fakultas: item.id_fakultas,
                                  nama_fakultas: fakultas,
                                  prodiCount: item.prodis.length,
                                });
                              }}
                              title={`Hapus fakultas ${fakultas}`}
                              className="p-1 rounded text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>

                        {item.prodis.length === 0 ? (
                          <div className="py-4 text-center space-y-2">
                            <p className="text-[11px] text-slate-400 italic">Belum ada prodi terdaftar</p>
                            <button
                              type="button"
                              onClick={() => {
                                setSelectedFakultasId(item.id_fakultas);
                                setIsProdiModalOpen(true);
                              }}
                              className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 hover:text-emerald-900 bg-emerald-50 hover:bg-emerald-100 px-2.5 py-1 rounded-md border border-emerald-200 transition-colors cursor-pointer"
                            >
                              <Plus className="w-3 h-3" />
                              Tambah Prodi
                            </button>
                          </div>
                        ) : (
                          <div className="space-y-1.5">
                            {item.prodis.map((p) => {
                              const isSelected = allowedProdiIds.includes(p.id_prodi);
                              return (
                                <div
                                  key={p.id_prodi}
                                  className={`group flex items-center justify-between gap-2 p-2 rounded-lg text-xs font-medium transition-all ${
                                    isSelected
                                      ? 'bg-[#DDF2E8] text-[#0E4A3E] font-bold border border-[#a6d8c3]'
                                      : 'hover:bg-slate-50 text-slate-700 border border-transparent'
                                  }`}
                                >
                                  <label className="flex items-center gap-2.5 flex-1 min-w-0 cursor-pointer">
                                    <input
                                      type="checkbox"
                                      checked={isSelected}
                                      onChange={() => toggleProdi(p.id_prodi)}
                                      className="w-4 h-4 text-[#0E4A3E] rounded border-slate-300 focus:ring-[#0E4A3E] accent-[#0E4A3E] shrink-0"
                                    />
                                    <span className="truncate" title={p.nama_prodi}>
                                      {p.nama_prodi}
                                    </span>
                                  </label>

                                  <div className="flex items-center gap-1 shrink-0 opacity-70 group-hover:opacity-100 transition-opacity">
                                    <button
                                      type="button"
                                      onClick={(e) => {
                                        e.preventDefault();
                                        e.stopPropagation();
                                        setEditingProdi({
                                          id_prodi: p.id_prodi,
                                          id_fakultas: p.id_fakultas,
                                          nama_prodi: p.nama_prodi,
                                        });
                                      }}
                                      title="Edit nama prodi atau pindah ke fakultas lain"
                                      className="p-1 rounded text-slate-400 hover:text-emerald-700 hover:bg-white/80 transition-colors cursor-pointer"
                                    >
                                      <Pencil className="w-3.5 h-3.5" />
                                    </button>
                                    <button
                                      type="button"
                                      onClick={(e) => {
                                        e.preventDefault();
                                        e.stopPropagation();
                                        setDeletingProdi({
                                          id_prodi: p.id_prodi,
                                          nama_prodi: p.nama_prodi,
                                        });
                                      }}
                                      title="Hapus program studi ini"
                                      className="p-1 rounded text-slate-400 hover:text-red-600 hover:bg-white/80 transition-colors cursor-pointer"
                                    >
                                      <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* ── CARD 3: Keterangan / Petunjuk Resmi Mahasiswa ── */}
          <div className="bg-gradient-to-br from-[#EAF5F0]/70 via-white to-[#F2F8F5] rounded-2xl sm:rounded-3xl border border-[#C0E6D8] shadow-xs overflow-hidden">
            <div className="bg-[#EAF5F0]/90 border-b border-[#C0E6D8] px-6 py-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#0E4A3E] text-emerald-300 flex items-center justify-center shrink-0 shadow-xs">
                <HelpCircle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-extrabold text-[#0E4A3E] uppercase tracking-wide">
                  Keterangan & Petunjuk Resmi untuk Mahasiswa
                </h3>
                <p className="text-xs text-slate-500 font-medium">
                  Teks penjelasan ini akan ditampilkan kepada mahasiswa di portal pendaftaran dan informasi publik.
                </p>
              </div>
            </div>

            <div className="p-6">
              <textarea
                rows={3}
                value={catatanAkademik}
                onChange={(e) => setCatatanAkademik(e.target.value)}
                placeholder="Contoh: Wajib berstatus Mahasiswa Aktif, minimal semester 6, IPK minimal 3.50, dan terdaftar pada program studi yang dibuka..."
                className="w-full px-4 py-3 rounded-xl border border-slate-300 text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0E4A3E] resize-none shadow-2xs"
              />
            </div>
          </div>

          {/* ── Bottom Submit Bar ── */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="submit"
              disabled={isSaving}
              className="inline-flex items-center gap-2 bg-[#0E4A3E] hover:bg-[#08362d] text-white font-bold text-xs sm:text-sm px-8 py-3 rounded-xl shadow-md transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer disabled:opacity-50"
            >
              {isSaving ? <RefreshCw className="w-4 h-4 animate-spin text-emerald-300" /> : <Save className="w-4 h-4 text-emerald-300" />}
              <span>{isSaving ? 'Menyimpan Perubahan...' : 'Simpan Kriteria Persyaratan Akademik'}</span>
            </button>
          </div>
        </form>
      )}

      {/* ── Modal Tambah Fakultas Baru ── */}
      {isFacultyModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden animate-in fade-in zoom-in duration-150">
            <div className="bg-[#0E4A3E] text-white px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <Building2 className="w-5 h-5 text-emerald-300" />
                <h3 className="font-extrabold text-sm sm:text-base">Tambah Fakultas Baru</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsFacultyModalOpen(false)}
                className="text-white/80 hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateFaculty} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Nama Fakultas Baru *
                </label>
                <input
                  type="text"
                  placeholder="Contoh: Fakultas Sains dan Teknologi / FST"
                  value={newFacultyName}
                  onChange={(e) => setNewFacultyName(e.target.value)}
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm font-medium focus:outline-none focus:ring-1 focus:ring-[#0E4A3E]"
                />
                <span className="text-[11px] text-slate-400 mt-1 block">
                  Anda bebas mengetikkan nama fakultas apa saja sesuai struktur fakultas kampus.
                </span>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Nama Jurusan / Program Studi Awal (Opsional)
                </label>
                <input
                  type="text"
                  placeholder="Contoh: Sistem Informasi / Teknik Lingkungan"
                  value={newFacultyInitialProdi}
                  onChange={(e) => setNewFacultyInitialProdi(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm font-medium focus:outline-none focus:ring-1 focus:ring-[#0E4A3E]"
                />
                <span className="text-[11px] text-slate-400 mt-1 block">
                  Bisa langsung menambahkan 1 prodi perdana di bawah fakultas baru ini.
                </span>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200 mt-6">
                <button
                  type="button"
                  onClick={() => setIsFacultyModalOpen(false)}
                  disabled={isSubmittingNew}
                  className="px-5 py-2.5 rounded-xl border border-slate-300 text-slate-700 text-xs sm:text-sm font-bold hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingNew}
                  className="px-6 py-2.5 rounded-xl bg-[#0E4A3E] hover:bg-[#08362d] text-white text-xs sm:text-sm font-bold shadow-md transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 flex items-center gap-2 cursor-pointer"
                >
                  {isSubmittingNew && <RefreshCw className="w-4 h-4 animate-spin" />}
                  {isSubmittingNew ? 'Menyimpan...' : 'Simpan Fakultas Baru'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Modal Tambah Program Studi / Jurusan ── */}
      {isProdiModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden animate-in fade-in zoom-in duration-150">
            <div className="bg-[#0E4A3E] text-white px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <GraduationCap className="w-5 h-5 text-emerald-300" />
                <h3 className="font-extrabold text-sm sm:text-base">Tambah Jurusan / Program Studi</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsProdiModalOpen(false)}
                className="text-white/80 hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateProdi} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Pilih Fakultas *
                </label>
                <select
                  value={selectedFakultasId}
                  onChange={(e) => setSelectedFakultasId(Number(e.target.value))}
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm font-medium focus:outline-none focus:ring-1 focus:ring-[#0E4A3E]"
                >
                  <option value="">-- Pilih Fakultas Naungan --</option>
                  {uniqueFaculties.map((f) => (
                    <option key={f.id} value={f.id}>
                      {f.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Nama Program Studi / Jurusan Baru *
                </label>
                <input
                  type="text"
                  placeholder="Contoh: Sains Data / Teknik Informatika / Ilmu Falak"
                  value={newProdiName}
                  onChange={(e) => setNewProdiName(e.target.value)}
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm font-medium focus:outline-none focus:ring-1 focus:ring-[#0E4A3E]"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200 mt-6">
                <button
                  type="button"
                  onClick={() => setIsProdiModalOpen(false)}
                  disabled={isSubmittingNew}
                  className="px-5 py-2.5 rounded-xl border border-slate-300 text-slate-700 text-xs sm:text-sm font-bold hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingNew}
                  className="px-6 py-2.5 rounded-xl bg-[#0E4A3E] hover:bg-[#08362d] text-white text-xs sm:text-sm font-bold shadow-md transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 flex items-center gap-2 cursor-pointer"
                >
                  {isSubmittingNew && <RefreshCw className="w-4 h-4 animate-spin" />}
                  {isSubmittingNew ? 'Menyimpan...' : 'Simpan Program Studi'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Modal Edit / Pindah Fakultas Program Studi ── */}
      {editingProdi && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden animate-in fade-in zoom-in duration-150">
            <div className="bg-[#0E4A3E] text-white px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <ArrowRightLeft className="w-5 h-5 text-emerald-300" />
                <h3 className="font-extrabold text-sm sm:text-base">Edit & Pindah Fakultas Prodi</h3>
              </div>
              <button
                type="button"
                onClick={() => setEditingProdi(null)}
                className="text-white/80 hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUpdateProdi} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Nama Program Studi *
                </label>
                <input
                  type="text"
                  value={editingProdi.nama_prodi}
                  onChange={(e) =>
                    setEditingProdi({ ...editingProdi, nama_prodi: e.target.value })
                  }
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm font-medium focus:outline-none focus:ring-1 focus:ring-[#0E4A3E]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Fakultas Naungan (Pindah Fakultas) *
                </label>
                <select
                  value={editingProdi.id_fakultas}
                  onChange={(e) =>
                    setEditingProdi({ ...editingProdi, id_fakultas: Number(e.target.value) })
                  }
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm font-medium focus:outline-none focus:ring-1 focus:ring-[#0E4A3E]"
                >
                  {uniqueFaculties.map((f) => (
                    <option key={f.id} value={f.id}>
                      {f.name}
                    </option>
                  ))}
                </select>
                <span className="text-[11px] text-slate-500 mt-1 block">
                  Anda dapat memindahkan prodi ini ke fakultas lain. Sistem akan otomatis menyinkronkan data mahasiswa yang terdaftar di prodi ini.
                </span>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200 mt-6">
                <button
                  type="button"
                  onClick={() => setEditingProdi(null)}
                  disabled={isActionLoading}
                  className="px-5 py-2.5 rounded-xl border border-slate-300 text-slate-700 text-xs sm:text-sm font-bold hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isActionLoading}
                  className="px-6 py-2.5 rounded-xl bg-[#0E4A3E] hover:bg-[#08362d] text-white text-xs sm:text-sm font-bold shadow-md transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 flex items-center gap-2 cursor-pointer"
                >
                  {isActionLoading && <RefreshCw className="w-4 h-4 animate-spin" />}
                  {isActionLoading ? 'Menyimpan...' : 'Simpan Perubahan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Modal Konfirmasi Hapus Program Studi ── */}
      {deletingProdi && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-150">
            <div className="bg-red-600 text-white px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <Trash2 className="w-5 h-5 text-red-200" />
                <h3 className="font-extrabold text-sm sm:text-base">Hapus Program Studi</h3>
              </div>
              <button
                type="button"
                onClick={() => setDeletingProdi(null)}
                className="text-white/80 hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
                Apakah Anda yakin ingin menghapus program studi{' '}
                <strong className="text-slate-900 font-extrabold">&quot;{deletingProdi.nama_prodi}&quot;</strong>?
              </p>
              <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-amber-800 text-[11px] leading-relaxed">
                <AlertCircle className="w-4 h-4 inline mr-1 -mt-0.5 text-amber-600" />
                Jika sudah ada mahasiswa yang terdaftar pada program studi ini, sistem keamanan akan membatalkan penghapusan demi menjaga integritas data pendaftaran.
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setDeletingProdi(null)}
                  disabled={isActionLoading}
                  className="px-5 py-2.5 rounded-xl border border-slate-300 text-slate-700 text-xs sm:text-sm font-bold hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="button"
                  onClick={handleDeleteProdi}
                  disabled={isActionLoading}
                  className="px-6 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs sm:text-sm font-bold shadow-md transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 flex items-center gap-2 cursor-pointer"
                >
                  {isActionLoading && <RefreshCw className="w-4 h-4 animate-spin" />}
                  {isActionLoading ? 'Menghapus...' : 'Ya, Hapus Prodi'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Modal Edit Nama Fakultas ── */}
      {editingFaculty && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-150">
            <div className="bg-[#0E4A3E] text-white px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <Pencil className="w-5 h-5 text-emerald-300" />
                <h3 className="font-extrabold text-sm sm:text-base">Edit Nama Fakultas</h3>
              </div>
              <button
                type="button"
                onClick={() => setEditingFaculty(null)}
                className="text-white/80 hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUpdateFaculty} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Nama Fakultas *
                </label>
                <input
                  type="text"
                  value={editingFaculty.nama_fakultas}
                  onChange={(e) =>
                    setEditingFaculty({ ...editingFaculty, nama_fakultas: e.target.value })
                  }
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm font-medium focus:outline-none focus:ring-1 focus:ring-[#0E4A3E]"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setEditingFaculty(null)}
                  disabled={isActionLoading}
                  className="px-5 py-2.5 rounded-xl border border-slate-300 text-slate-700 text-xs sm:text-sm font-bold hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isActionLoading}
                  className="px-6 py-2.5 rounded-xl bg-[#0E4A3E] hover:bg-[#08362d] text-white text-xs sm:text-sm font-bold shadow-md transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 flex items-center gap-2 cursor-pointer"
                >
                  {isActionLoading && <RefreshCw className="w-4 h-4 animate-spin" />}
                  {isActionLoading ? 'Menyimpan...' : 'Simpan Nama'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Modal Konfirmasi Hapus Fakultas ── */}
      {deletingFaculty && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-150">
            <div className="bg-red-600 text-white px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <Trash2 className="w-5 h-5 text-red-200" />
                <h3 className="font-extrabold text-sm sm:text-base">Hapus Fakultas</h3>
              </div>
              <button
                type="button"
                onClick={() => setDeletingFaculty(null)}
                className="text-white/80 hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
                Apakah Anda yakin ingin menghapus fakultas{' '}
                <strong className="text-slate-900 font-extrabold">&quot;{deletingFaculty.nama_fakultas}&quot;</strong>
                {deletingFaculty.prodiCount > 0 ? ` beserta ${deletingFaculty.prodiCount} program studi di dalamnya` : ''}?
              </p>
              <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-amber-800 text-[11px] leading-relaxed">
                <AlertCircle className="w-4 h-4 inline mr-1 -mt-0.5 text-amber-600" />
                Jika ada mahasiswa yang terdaftar pada fakultas ini, penghapusan akan diblokir otomatis demi keamanan data pendaftar.
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setDeletingFaculty(null)}
                  disabled={isActionLoading}
                  className="px-5 py-2.5 rounded-xl border border-slate-300 text-slate-700 text-xs sm:text-sm font-bold hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="button"
                  onClick={handleDeleteFaculty}
                  disabled={isActionLoading}
                  className="px-6 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs sm:text-sm font-bold shadow-md transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 flex items-center gap-2 cursor-pointer"
                >
                  {isActionLoading && <RefreshCw className="w-4 h-4 animate-spin" />}
                  {isActionLoading ? 'Menghapus...' : 'Ya, Hapus Fakultas'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
