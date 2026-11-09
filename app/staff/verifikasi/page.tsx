'use client';

import React, { useEffect, useState, useCallback, useMemo } from 'react';
import {
  Search,
  Filter,
  RefreshCw,
  AlertCircle,
  CheckCircle2,
  X,
  FileText,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  Check,
  Eye,
  User,
  GraduationCap,
  Globe2,
  Clock,
  AlertTriangle,
  FileCheck2,
  FolderOpen,
  Send,
  Loader2,
  Users,
} from 'lucide-react';
import { PageHeader, AlertBanner } from '@/components/ui';

interface DokumenItem {
  id_dokumen: number;
  id_persyaratan: number;
  nama_persyaratan: string;
  format_file: string;
  ukuran_maksimal: number;
  wajib: boolean;
  file_path: string;
  status_db: string;
  status_label: 'Sesuai' | 'Menunggu' | 'Tidak Sesuai';
  uploaded_at: string | null;
  catatan_verifikasi: string;
  tanggal_verifikasi: string | null;
  verifikator: string | null;
}

interface MahasiswaVerifikasiItem {
  id_pendaftaran: number;
  id_mahasiswa: number;
  nim: string;
  nama: string;
  email: string;
  no_hp: string;
  nama_fakultas: string;
  nama_prodi: string;
  ipk: number | null;
  total_sks: number;
  nama_periode: string;
  negara_tujuan: string;
  status_pendaftaran: string;
  tanggal_daftar: string | null;
  status_verifikasi: 'Lengkap & Valid' | 'Perlu Revisi' | 'Menunggu Verifikasi' | 'Belum Upload';
  summary_docs: {
    total: number;
    valid: number;
    revisi: number;
    menunggu: number;
  };
  dokumen: DokumenItem[];
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export default function StaffVerifikasiPage() {
  const [items, setItems] = useState<MahasiswaVerifikasiItem[]>([]);
  const [pagination, setPagination] = useState<Pagination>({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 1,
  });
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [search, setSearch] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [activePeriode, setActivePeriode] = useState<{
    id_periode: number;
    nama_periode: string;
    tahun: number;
  } | null>(null);

  // ── Integrated Workspace Modal State (Grouping per Mahasiswa) ──
  const [selectedMahasiswa, setSelectedMahasiswa] = useState<MahasiswaVerifikasiItem | null>(null);
  const [draftVerifikasi, setDraftVerifikasi] = useState<
    Record<number, { status: 'Sesuai' | 'Tidak Sesuai' | 'Menunggu'; catatan: string }>
  >({});
  const [isSaving, setIsSaving] = useState<boolean>(false);

  // Fetch data grouped per mahasiswa (periode aktif saja)
  const fetchVerifikasi = useCallback(async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      params.set('mode', 'grouped');
      params.set('active_only', 'true');
      if (search.trim()) params.set('search', search.trim());
      if (statusFilter !== 'all') params.set('status', statusFilter);
      params.set('page', String(currentPage));
      params.set('limit', '10');

      const res = await fetch(`/api/verifikasi?${params.toString()}`);
      const json = await res.json();
      if (json.success && Array.isArray(json.data)) {
        setItems(json.data);
        if (json.pagination) setPagination(json.pagination);
        if (json.activePeriode) setActivePeriode(json.activePeriode);
      } else {
        setStatusMessage({ type: 'error', text: json.message || 'Gagal memuat data verifikasi.' });
      }
    } catch (err) {
      console.error('Error fetching verifikasi:', err);
      setStatusMessage({ type: 'error', text: 'Gagal terhubung ke database.' });
    } finally {
      setIsLoading(false);
    }
  }, [search, statusFilter, currentPage]);

  useEffect(() => {
    fetchVerifikasi();
  }, [fetchVerifikasi]);

  // Overall Statistics from loaded items
  const stats = useMemo(() => {
    const totalPendaftar = pagination.total || items.length;
    const lengkap = items.filter((i) => i.status_verifikasi === 'Lengkap & Valid').length;
    const perluRevisi = items.filter((i) => i.status_verifikasi === 'Perlu Revisi').length;
    const menunggu = items.filter((i) => i.status_verifikasi === 'Menunggu Verifikasi').length;
    return { totalPendaftar, lengkap, perluRevisi, menunggu };
  }, [items, pagination.total]);

  // Open Integrated Verification Workspace Modal for a Student
  const handleOpenWorkspace = (mhs: MahasiswaVerifikasiItem) => {
    setSelectedMahasiswa(mhs);
    const initialDraft: Record<number, { status: 'Sesuai' | 'Tidak Sesuai' | 'Menunggu'; catatan: string }> = {};
    mhs.dokumen.forEach((doc) => {
      initialDraft[doc.id_dokumen] = {
        status: doc.status_label,
        catatan: doc.catatan_verifikasi || '',
      };
    });
    setDraftVerifikasi(initialDraft);
  };

  // Change status of one document inside the workspace
  const handleDocStatusChange = (
    docId: number,
    newStatus: 'Sesuai' | 'Tidak Sesuai' | 'Menunggu'
  ) => {
    setDraftVerifikasi((prev) => ({
      ...prev,
      [docId]: {
        ...(prev[docId] || { catatan: '' }),
        status: newStatus,
      },
    }));
  };

  // Change note of one document inside the workspace
  const handleDocNoteChange = (docId: number, newCatatan: string) => {
    setDraftVerifikasi((prev) => ({
      ...prev,
      [docId]: {
        status: prev[docId]?.status || 'Menunggu',
        catatan: newCatatan,
      },
    }));
  };

  // Shortcut: One-click "Tandai Semua Sesuai (Valid)"
  const handleApproveAll = () => {
    if (!selectedMahasiswa) return;
    const updated: Record<number, { status: 'Sesuai' | 'Tidak Sesuai' | 'Menunggu'; catatan: string }> = {};
    selectedMahasiswa.dokumen.forEach((doc) => {
      updated[doc.id_dokumen] = {
        status: 'Sesuai',
        catatan: draftVerifikasi[doc.id_dokumen]?.catatan || 'Dokumen telah diverifikasi dan memenuhi persyaratan.',
      };
    });
    setDraftVerifikasi(updated);
  };

  // Save All Document Verifications for the Student (Integrated Batch)
  const handleSaveWorkspace = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMahasiswa) return;

    setIsSaving(true);
    setStatusMessage(null);

    const payloadDokumen = selectedMahasiswa.dokumen.map((doc) => ({
      id_dokumen: doc.id_dokumen,
      status: draftVerifikasi[doc.id_dokumen]?.status || 'Menunggu',
      catatan: draftVerifikasi[doc.id_dokumen]?.catatan || '',
    }));

    try {
      const res = await fetch('/api/verifikasi', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id_pendaftaran: selectedMahasiswa.id_pendaftaran,
          dokumen: payloadDokumen,
        }),
      });

      const json = await res.json();
      if (json.success) {
        setStatusMessage({
          type: 'success',
          text: json.message || `Verifikasi berkas mahasiswa "${selectedMahasiswa.nama}" berhasil disimpan!`,
        });
        setSelectedMahasiswa(null);
        await fetchVerifikasi();
      } else {
        setStatusMessage({ type: 'error', text: json.message || 'Gagal menyimpan hasil verifikasi berkas.' });
      }
    } catch (err) {
      console.error(err);
      setStatusMessage({ type: 'error', text: 'Terjadi kesalahan sistem saat menyimpan hasil verifikasi.' });
    } finally {
      setIsSaving(false);
    }
  };

  // Summary counts inside active modal
  const modalDraftSummary = useMemo(() => {
    if (!selectedMahasiswa) return { total: 0, valid: 0, revisi: 0, menunggu: 0 };
    const total = selectedMahasiswa.dokumen.length;
    let valid = 0;
    let revisi = 0;
    let menunggu = 0;

    selectedMahasiswa.dokumen.forEach((d) => {
      const st = draftVerifikasi[d.id_dokumen]?.status || d.status_label;
      if (st === 'Sesuai') valid++;
      else if (st === 'Tidak Sesuai') revisi++;
      else menunggu++;
    });

    return { total, valid, revisi, menunggu };
  }, [selectedMahasiswa, draftVerifikasi]);

  return (
    <div className="w-full max-w-7xl space-y-6 pb-12 font-sans">
      {/* ── Top Header Section ── */}
      <PageHeader
        title="VERIFIKASI DOKUMEN MAHASISWA"
        subtitle="KULIAH KERJA NYATA INTERNASIONAL"
        description="Pemeriksaan berkas persyaratan pendaftaran secara terpadu per mahasiswa pada periode aktif."
        action={
          <div className="flex items-center gap-2.5 flex-wrap">
            {activePeriode && (
              <div className="inline-flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-[#DDF2E8] border border-emerald-200 text-[#0E4A3E] text-xs font-extrabold shadow-2xs">
                <span>
                  Periode Aktif: {activePeriode.nama_periode} ({activePeriode.tahun})
                </span>
              </div>
            )}
            <button
              onClick={fetchVerifikasi}
              disabled={isLoading}
              className="p-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-[#0E4A3E] transition-colors shadow-xs cursor-pointer inline-flex items-center gap-2 text-xs font-bold"
              title="Muat ulang data verifikasi"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
              <span>Segarkan</span>
            </button>
          </div>
        }
      />

      {/* ── Feedback Message Toast ── */}
      <AlertBanner message={statusMessage} onClose={() => setStatusMessage(null)} />

      {/* ── Ringkasan Statistik Status Verifikasi ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Pendaftar</span>
            <div className="w-9 h-9 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-black text-slate-800">{stats.totalPendaftar}</div>
          <span className="text-[11px] text-slate-400 font-medium">Mahasiswa terdaftar</span>
        </div>

        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-emerald-200 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider">Lengkap & Valid</span>
            <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-black text-emerald-900">{stats.lengkap}</div>
          <span className="text-[11px] text-emerald-600 font-medium">Seluruh berkas terverifikasi</span>
        </div>

        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-amber-200 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-amber-800 uppercase tracking-wider">Menunggu Verifikasi</span>
            <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-black text-amber-900">{stats.menunggu}</div>
          <span className="text-[11px] text-amber-600 font-medium">Perlu ditinjau verifikator</span>
        </div>

        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-rose-200 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-rose-800 uppercase tracking-wider">Perlu Revisi</span>
            <div className="w-9 h-9 rounded-xl bg-rose-100 text-rose-800 flex items-center justify-center">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-black text-rose-900">{stats.perluRevisi}</div>
          <span className="text-[11px] text-rose-600 font-medium">Terdapat berkas tidak sesuai</span>
        </div>
      </div>

      {/* ── Search & Filter Bar ── */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Cari nama mahasiswa atau NIM pendaftar..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-300 rounded-xl text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0E4A3E] shadow-2xs"
          />
        </div>

        <div className="relative min-w-[210px]">
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-xs sm:text-sm font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#0E4A3E] shadow-2xs appearance-none pr-8 cursor-pointer"
          >
            <option value="all">Semua Status Berkas</option>
            <option value="Sesuai">Lengkap & Valid (Semua Dokumen Sesuai)</option>
            <option value="Menunggu">Menunggu Verifikasi (Ada Dokumen Baru)</option>
            <option value="Tidak Sesuai">Perlu Revisi (Terdapat Dokumen Belum Sesuai)</option>
          </select>
          <Filter className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
        </div>
      </div>

      {/* ── Table Card: Grouping per Mahasiswa ── */}
      <div className="bg-white rounded-2xl border border-slate-300 shadow-xs overflow-hidden">
        {/* Table Header */}
        <div className="bg-[#0E4A3E] text-white px-6 py-4">
          <div className="grid grid-cols-12 text-xs font-extrabold tracking-wider uppercase items-center">
            <span className="col-span-1 text-center">No</span>
            <span className="col-span-3">Mahasiswa (NIM / Nama)</span>
            <span className="col-span-3">Program Studi & Fakultas</span>
            <span className="col-span-2 text-center">Destinasi</span>
            <span className="col-span-2 text-center">Status Berkas</span>
            <span className="col-span-1 text-center">Aksi</span>
          </div>
        </div>

        {/* Table Content */}
        {isLoading ? (
          <div className="py-16 flex flex-col items-center justify-center text-slate-400 gap-2">
            <RefreshCw className="w-6 h-6 animate-spin text-[#0E4A3E]" />
            <span className="text-xs font-semibold">Memuat daftar verifikasi mahasiswa...</span>
          </div>
        ) : items.length === 0 ? (
          <div className="py-16 text-center text-slate-500 text-sm">
            <FolderOpen className="w-10 h-10 text-slate-300 mx-auto mb-2" />
            <p className="font-bold text-slate-700">Tidak ada data pendaftaran mahasiswa</p>
            <p className="text-xs text-slate-400 mt-1">
              {search || statusFilter !== 'all'
                ? 'Sesuaikan kata kunci pencarian atau ubah filter status.'
                : 'Belum ada pendaftaran berkas yang masuk dari mahasiswa.'}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {items.map((mhs, idx) => (
              <div
                key={mhs.id_pendaftaran}
                className="grid grid-cols-12 items-center px-6 py-4 hover:bg-slate-50/80 transition-colors text-xs sm:text-sm"
              >
                {/* 1. No */}
                <span className="col-span-1 text-center font-bold text-slate-500">
                  {(pagination.page - 1) * pagination.limit + idx + 1}
                </span>

                {/* 2. Mahasiswa Info */}
                <div className="col-span-3 pr-3">
                  <p className="font-bold text-slate-800 leading-snug">{mhs.nama}</p>
                  <p className="text-[11px] text-slate-500 font-mono mt-0.5">NIM: {mhs.nim}</p>
                  <div className="flex items-center gap-2 text-[10px] text-slate-400 mt-1">
                    <span>IPK: <strong className="text-slate-600">{mhs.ipk ?? '-'}</strong></span>
                    <span>•</span>
                    <span>{mhs.total_sks} SKS</span>
                  </div>
                </div>

                {/* 3. Prodi & Fakultas */}
                <div className="col-span-3 pr-3">
                  <span className="font-bold text-slate-800 text-xs block leading-tight">
                    {mhs.nama_prodi}
                  </span>
                  <span className="text-[11px] text-[#0E4A3E] font-semibold block mt-0.5">
                    {mhs.nama_fakultas}
                  </span>
                </div>

                {/* 4. Destinasi */}
                <div className="col-span-2 text-center">
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-sky-50 text-sky-800 border border-sky-200">
                    <Globe2 className="w-3 h-3 text-sky-600 shrink-0" />
                    <span>{mhs.negara_tujuan}</span>
                  </span>
                  <span className="block text-[10px] text-slate-400 mt-1 truncate">
                    {mhs.nama_periode}
                  </span>
                </div>

                {/* 5. Status Berkas Ringkasan */}
                <div className="col-span-2 flex flex-col items-center justify-center gap-1">
                  {mhs.status_verifikasi === 'Lengkap & Valid' ? (
                    <span className="inline-flex items-center gap-1 bg-[#C0E6D8] text-[#0E4A3E] border border-emerald-300 font-bold text-[11px] px-3 py-1 rounded-full shadow-2xs whitespace-nowrap">
                      <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                      <span>Lengkap & Valid</span>
                    </span>
                  ) : mhs.status_verifikasi === 'Perlu Revisi' ? (
                    <span className="inline-flex items-center gap-1 bg-red-100 text-red-700 border border-red-300 font-bold text-[11px] px-3 py-1 rounded-full whitespace-nowrap">
                      <AlertTriangle className="w-3 h-3 text-red-600" />
                      <span>Perlu Revisi</span>
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 bg-amber-100 text-amber-800 border border-amber-300 font-bold text-[11px] px-3 py-1 rounded-full shadow-2xs whitespace-nowrap">
                      <Clock className="w-3 h-3 text-amber-600" />
                      <span>Menunggu</span>
                    </span>
                  )}

                  {/* Dokumen Count Chips */}
                  <span className="text-[10px] font-semibold text-slate-500">
                    {mhs.summary_docs.valid}/{mhs.summary_docs.total} Dokumen Sah
                    {mhs.summary_docs.revisi > 0 && (
                      <span className="text-red-600 ml-1">({mhs.summary_docs.revisi} revisi)</span>
                    )}
                  </span>
                </div>

                {/* 6. Aksi: Periksa Berkas Terpadu */}
                <div className="col-span-1 flex justify-center">
                  <button
                    onClick={() => handleOpenWorkspace(mhs)}
                    className="px-3 py-1.5 bg-[#0E4A3E] hover:bg-[#09352c] text-white rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer whitespace-nowrap hover:scale-105 active:scale-95 flex items-center gap-1"
                    title="Periksa seluruh dokumen pendaftaran mahasiswa ini dalam 1 tampilan"
                  >
                    <FileCheck2 className="w-3.5 h-3.5 text-emerald-300" />
                    <span>Periksa</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Table Footer / Pagination */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-slate-600">
          <div>
            Menampilkan <strong className="text-slate-800">{items.length}</strong> mahasiswa dari{' '}
            <strong className="text-slate-800">{pagination.total}</strong> pendaftar
          </div>

          <div className="flex items-center gap-1.5 self-center">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage <= 1 || isLoading}
              className="p-1.5 rounded-lg border border-slate-300 bg-white hover:bg-slate-100 disabled:opacity-40 cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map((num) => (
              <button
                key={num}
                onClick={() => setCurrentPage(num)}
                disabled={isLoading}
                className={`w-8 h-8 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  currentPage === num
                    ? 'bg-[#0E4A3E] text-white shadow-xs'
                    : 'bg-white border border-slate-300 text-slate-700 hover:bg-slate-100'
                }`}
              >
                {num}
              </button>
            ))}

            <button
              onClick={() => setCurrentPage((p) => Math.min(pagination.totalPages, p + 1))}
              disabled={currentPage >= pagination.totalPages || isLoading}
              className="p-1.5 rounded-lg border border-slate-300 bg-white hover:bg-slate-100 disabled:opacity-40 cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* ── MODAL WORKSPACE: PEMERIKSAAN DOKUMEN TERPADU PER MAHASISWA ── */}
      {selectedMahasiswa && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/55 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-4xl w-full shadow-2xl border border-slate-200 max-h-[92vh] flex flex-col overflow-hidden">
            {/* Modal Header */}
            <div className="px-6 py-4 bg-[#0E4A3E] text-white flex items-center justify-between">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 rounded-2xl bg-white/15 text-emerald-200 flex items-center justify-center shrink-0">
                  <FileCheck2 className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <h3 className="text-base sm:text-lg font-black tracking-wide truncate">
                    VERIFIKASI BERKAS: {selectedMahasiswa.nama}
                  </h3>
                  <p className="text-xs text-emerald-100">
                    NIM: {selectedMahasiswa.nim} • {selectedMahasiswa.nama_prodi} ({selectedMahasiswa.nama_fakultas})
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedMahasiswa(null)}
                className="p-1.5 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition-colors cursor-pointer shrink-0"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Profile Summary Strip */}
            <div className="px-6 py-3 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-4 flex-wrap text-slate-600">
                <span>
                  IPK: <strong className="text-slate-800">{selectedMahasiswa.ipk ?? '-'}</strong>
                </span>
                <span>
                  SKS: <strong className="text-slate-800">{selectedMahasiswa.total_sks}</strong>
                </span>
                <span>
                  No. HP: <strong className="text-slate-800">{selectedMahasiswa.no_hp}</strong>
                </span>
                <span>
                  Destinasi: <strong className="text-[#0E4A3E]">{selectedMahasiswa.negara_tujuan}</strong>
                </span>
              </div>

              {/* Progress Chip */}
              <div className="flex items-center gap-2">
                <div className="text-[11px] font-bold text-slate-500">
                  Status Draf:{' '}
                  <span className="text-emerald-700">{modalDraftSummary.valid} Sesuai</span> •{' '}
                  <span className="text-red-600">{modalDraftSummary.revisi} Revisi</span> •{' '}
                  <span className="text-amber-600">{modalDraftSummary.menunggu} Menunggu</span>
                </div>
                <button
                  type="button"
                  onClick={handleApproveAll}
                  className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer flex items-center gap-1.5"
                  title="Tandai seluruh dokumen mahasiswa ini sebagai Sesuai (Valid)"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Tandai Semua Sesuai</span>
                </button>
              </div>
            </div>

            {/* Modal Body: Daftar Dokumen Terpadu */}
            <form onSubmit={handleSaveWorkspace} className="flex-1 overflow-y-auto p-6 space-y-4">
              {selectedMahasiswa.dokumen.length === 0 ? (
                <div className="py-12 text-center text-slate-400">
                  <FileText className="w-10 h-10 mx-auto mb-2 text-slate-300" />
                  <p className="font-bold text-slate-600">Mahasiswa ini belum mengunggah dokumen persyaratan.</p>
                </div>
              ) : (
                selectedMahasiswa.dokumen.map((doc, dIdx) => {
                  const currentDraft = draftVerifikasi[doc.id_dokumen] || {
                    status: doc.status_label,
                    catatan: doc.catatan_verifikasi || '',
                  };
                  const isSesuai = currentDraft.status === 'Sesuai';
                  const isTidakSesuai = currentDraft.status === 'Tidak Sesuai';

                  return (
                    <div
                      key={doc.id_dokumen}
                      className={`p-4 rounded-2xl border transition-all ${
                        isSesuai
                          ? 'bg-emerald-50/50 border-emerald-300'
                          : isTidakSesuai
                          ? 'bg-rose-50/50 border-rose-300'
                          : 'bg-white border-slate-200'
                      }`}
                    >
                      {/* Document Top Row */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div className="flex items-start gap-3">
                          <div
                            className={`w-9 h-9 rounded-xl flex items-center justify-center font-black text-xs shrink-0 ${
                              isSesuai
                                ? 'bg-emerald-600 text-white'
                                : isTidakSesuai
                                ? 'bg-rose-600 text-white'
                                : 'bg-slate-200 text-slate-700'
                            }`}
                          >
                            {dIdx + 1}
                          </div>
                          <div>
                            <div className="flex items-center gap-2 flex-wrap">
                              <h4 className="font-extrabold text-xs sm:text-sm text-slate-800">
                                {doc.nama_persyaratan}
                              </h4>
                              {doc.wajib && (
                                <span className="text-[10px] font-bold text-red-600 bg-red-50 border border-red-200 px-1.5 py-0.2 rounded">
                                  Wajib
                                </span>
                              )}
                            </div>
                            <span className="text-[11px] text-slate-400 font-mono block mt-0.5">
                              Format: {doc.format_file} (Maks. {doc.ukuran_maksimal}MB)
                            </span>
                          </div>
                        </div>

                        {/* Preview / View Link & Direct Status Buttons */}
                        <div className="flex items-center gap-2 self-start sm:self-auto flex-wrap">
                          {doc.file_path ? (
                            <a
                              href={doc.file_path}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-100 text-slate-700 text-xs font-bold transition-colors cursor-pointer shadow-2xs"
                              title="Buka dan periksa isi dokumen di tab baru"
                            >
                              <Eye className="w-3.5 h-3.5 text-[#0E4A3E]" />
                              <span>Lihat Berkas</span>
                              <ExternalLink className="w-3 h-3 text-slate-400" />
                            </a>
                          ) : (
                            <span className="text-xs text-slate-400 italic">Belum ada file</span>
                          )}

                          {/* Toggle Button Sesuai */}
                          <button
                            type="button"
                            onClick={() => handleDocStatusChange(doc.id_dokumen, 'Sesuai')}
                            className={`px-3 py-1.5 rounded-xl text-xs font-extrabold flex items-center gap-1.5 cursor-pointer transition-all ${
                              isSesuai
                                ? 'bg-emerald-700 text-white shadow-xs'
                                : 'bg-white border border-slate-300 text-slate-600 hover:bg-emerald-50 hover:text-emerald-700'
                            }`}
                          >
                            <Check className="w-3.5 h-3.5" />
                            <span>Sesuai (Valid)</span>
                          </button>

                          {/* Toggle Button Tidak Sesuai */}
                          <button
                            type="button"
                            onClick={() => handleDocStatusChange(doc.id_dokumen, 'Tidak Sesuai')}
                            className={`px-3 py-1.5 rounded-xl text-xs font-extrabold flex items-center gap-1.5 cursor-pointer transition-all ${
                              isTidakSesuai
                                ? 'bg-rose-700 text-white shadow-xs'
                                : 'bg-white border border-slate-300 text-slate-600 hover:bg-rose-50 hover:text-rose-700'
                            }`}
                          >
                            <X className="w-3.5 h-3.5" />
                            <span>Perlu Revisi</span>
                          </button>
                        </div>
                      </div>

                      {/* Catatan / Feedback Box */}
                      <div className="mt-3 pt-3 border-t border-slate-200/70">
                        <label className="block text-[11px] font-bold text-slate-600 mb-1">
                          Catatan / Keterangan Verifikator {isTidakSesuai && <span className="text-red-500">* (Wajib diisi jika perlu revisi)</span>}:
                        </label>
                        <input
                          type="text"
                          value={currentDraft.catatan}
                          onChange={(e) => handleDocNoteChange(doc.id_dokumen, e.target.value)}
                          placeholder={
                            isTidakSesuai
                              ? 'Jelaskan kekurangan dokumen (contoh: Tanda tangan basah belum ada, scan buram)...'
                              : 'Catatan verifikasi (opsional)...'
                          }
                          className={`w-full px-3.5 py-2 rounded-xl text-xs font-medium border transition-all ${
                            isTidakSesuai
                              ? 'bg-rose-50 border-rose-300 text-rose-900 placeholder-rose-300 focus:bg-white focus:border-rose-600'
                              : 'bg-white border-slate-200 text-slate-800 placeholder-slate-400 focus:border-[#0E4A3E]'
                          }`}
                        />
                      </div>
                    </div>
                  );
                })
              )}

              {/* Modal Footer */}
              <div className="pt-4 border-t border-slate-200 flex items-center justify-between flex-wrap gap-3">
                <span className="text-xs text-slate-500">
                  Menyimpan akan otomatis memperbarui status berkas dan alur pendaftaran mahasiswa.
                </span>

                <div className="flex items-center gap-2.5">
                  <button
                    type="button"
                    onClick={() => setSelectedMahasiswa(null)}
                    disabled={isSaving}
                    className="px-4 py-2.5 rounded-xl border border-slate-300 text-slate-700 font-bold text-xs hover:bg-slate-100 transition-colors cursor-pointer"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    disabled={isSaving}
                    className="px-6 py-2.5 rounded-xl bg-[#0E4A3E] hover:bg-[#09352c] text-white font-bold text-xs shadow-md transition-all hover:scale-102 active:scale-98 disabled:opacity-50 cursor-pointer flex items-center gap-2"
                  >
                    {isSaving ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Send className="w-4 h-4 text-emerald-300" />
                    )}
                    <span>{isSaving ? 'Menyimpan...' : 'Simpan Hasil Verifikasi Mahasiswa'}</span>
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
