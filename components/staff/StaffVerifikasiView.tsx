'use client';

import React from 'react';
import {
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
  Globe2,
  Clock,
  AlertTriangle,
  FileCheck2,
  FolderOpen,
  Send,
  Loader2,
  Users,
  Lock,
} from 'lucide-react';
import {
  HeroBanner,
  HeroAsideCard,
  SearchFilterBar,
  ResponsiveTableCard,
  AlertBanner,
} from '@/components/ui';

export interface DokumenItem {
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

export interface MahasiswaVerifikasiItem {
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

export interface VerifikasiPagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface StaffVerifikasiViewProps {
  items: MahasiswaVerifikasiItem[];
  pagination: VerifikasiPagination;
  isLoading: boolean;
  search: string;
  onSearchChange: (val: string) => void;
  statusFilter: string;
  onStatusFilterChange: (val: string) => void;
  currentPage: number;
  onPageChange: (page: number) => void;
  statusMessage: { type: 'success' | 'error'; text: string } | null;
  onCloseStatusMessage: () => void;
  activePeriode: { id_periode: number; nama_periode: string; tahun: number } | null;
  timelineGuard: {
    isOpen: boolean;
    status: string;
    stageName?: string;
    message?: string;
  } | null;
  stats: {
    totalPendaftar: number;
    lengkap: number;
    perluRevisi: number;
    menunggu: number;
  };
  onRefresh: () => void;
  selectedMahasiswa: MahasiswaVerifikasiItem | null;
  onOpenWorkspace: (mhs: MahasiswaVerifikasiItem) => void;
  onCloseWorkspace: () => void;
  draftVerifikasi: Record<number, { status: 'Sesuai' | 'Tidak Sesuai' | 'Menunggu'; catatan: string }>;
  onDocStatusChange: (docId: number, status: 'Sesuai' | 'Tidak Sesuai') => void;
  onDocNoteChange: (docId: number, catatan: string) => void;
  onApproveAll: () => void;
  onSaveWorkspace: (e: React.FormEvent) => void;
  isSaving: boolean;
  modalDraftSummary: {
    total: number;
    valid: number;
    revisi: number;
    menunggu: number;
  };
}

const VERIFIKASI_FILTER_OPTIONS = [
  { value: 'all', label: 'Semua Status Berkas' },
  { value: 'Sesuai', label: 'Lengkap & Valid (Semua Dokumen Sesuai)' },
  { value: 'Menunggu', label: 'Menunggu Verifikasi (Ada Dokumen Baru)' },
  { value: 'Tidak Sesuai', label: 'Perlu Revisi (Terdapat Dokumen Belum Sesuai)' },
];

export default function StaffVerifikasiView({
  items,
  pagination,
  isLoading,
  search,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
  currentPage,
  onPageChange,
  statusMessage,
  onCloseStatusMessage,
  activePeriode,
  timelineGuard,
  stats,
  onRefresh,
  selectedMahasiswa,
  onOpenWorkspace,
  onCloseWorkspace,
  draftVerifikasi,
  onDocStatusChange,
  onDocNoteChange,
  onApproveAll,
  onSaveWorkspace,
  isSaving,
  modalDraftSummary,
}: StaffVerifikasiViewProps) {
  return (
    <div className="kkn-page-container font-sans">
      <HeroBanner
        badgeIcon={<FileCheck2 className="w-3.5 h-3.5 text-[#C0E6D8]" />}
        badgeText="Verifikasi Dokumen Pendaftaran"
        title="VERIFIKASI DOKUMEN MAHASISWA"
        description="Pemeriksaan berkas persyaratan pendaftaran secara terpadu per mahasiswa pada periode aktif."
        aside={
          activePeriode ? (
            <HeroAsideCard
              label="Periode Pendaftaran Aktif"
              title={`${activePeriode.nama_periode} (${activePeriode.tahun})`}
              subtitle={`Total: ${pagination.total} Pendaftar`}
            />
          ) : undefined
        }
        action={
          <button
            onClick={onRefresh}
            disabled={isLoading}
            className="kkn-hero-action-btn shadow-xs w-full sm:w-auto"
            title="Muat ulang data verifikasi"
          >
            <RefreshCw className={`w-4 h-4 text-[#C0E6D8] ${isLoading ? 'animate-spin' : ''}`} />
            <span>Segarkan</span>
          </button>
        }
      />

      <AlertBanner message={statusMessage} onClose={onCloseStatusMessage} />

      {timelineGuard && !timelineGuard.isOpen && (
        <div className="bg-gradient-to-r from-amber-50 via-orange-50 to-amber-50 border border-amber-300 rounded-2xl p-4 sm:p-5 flex items-start gap-3.5 shadow-xs animate-in fade-in slide-in-from-top-2">
          <div className="w-9 h-9 rounded-xl bg-amber-100 border border-amber-300 flex items-center justify-center shrink-0 text-amber-800 shadow-2xs mt-0.5">
            <Lock className="w-5 h-5 text-amber-800" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h4 className="text-xs font-black uppercase text-amber-950 tracking-wider">
                Tahapan Verifikasi Berkas Belum Dibuka
              </h4>
              <span className="text-[10px] font-bold px-2 py-0.5 bg-amber-200/80 text-amber-900 rounded-full border border-amber-300/80">
                🔒 Mode Hanya Baca (Penilaian Terkunci)
              </span>
            </div>
            <p className="text-xs text-amber-900/90 mt-1 font-medium leading-relaxed">
              {timelineGuard.message}
            </p>
            <p className="text-[11px] text-amber-800/80 mt-1">
              Anda tetap dapat melihat dan memeriksa dokumen yang telah diunggah oleh pendaftar, namun aksi verifikasi dan penyimpanan status berkas dikunci hingga jadwal tahapan resmi dimulai.
            </p>
          </div>
        </div>
      )}

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
            <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider">Lengkap &amp; Valid</span>
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

      <SearchFilterBar
        searchValue={search}
        onSearchChange={onSearchChange}
        searchPlaceholder="Cari nama mahasiswa atau NIM pendaftar..."
        selectValue={statusFilter}
        onSelectChange={onStatusFilterChange}
        selectOptions={VERIFIKASI_FILTER_OPTIONS}
        selectMinWidth="min-w-[210px]"
      />

      <ResponsiveTableCard
        isLoading={isLoading}
        loadingText="Memuat daftar verifikasi mahasiswa..."
        isEmpty={items.length === 0}
        emptyContent={
          <>
            <FolderOpen className="w-10 h-10 text-slate-300 mx-auto mb-2" />
            <p className="font-bold text-slate-700">Tidak ada data pendaftaran mahasiswa</p>
            <p className="text-xs text-slate-400 mt-1">
              {search || statusFilter !== 'all'
                ? 'Sesuaikan kata kunci pencarian atau ubah filter status.'
                : 'Belum ada pendaftaran berkas yang masuk dari mahasiswa.'}
            </p>
          </>
        }
        minWidthClass="min-w-[760px]"
        thead={
          <tr>
            <th className="kkn-table-th px-3 text-center w-12">No</th>
            <th className="kkn-table-th min-w-[190px]">Mahasiswa (NIM / Nama)</th>
            <th className="kkn-table-th min-w-[170px]">Program Studi &amp; Fakultas</th>
            <th className="kkn-table-th min-w-[140px] text-center">Destinasi</th>
            <th className="kkn-table-th min-w-[170px] text-center">Status Berkas</th>
            <th className="kkn-table-th min-w-[100px] text-center">Aksi</th>
          </tr>
        }
        tbody={items.map((mhs, idx) => (
          <tr key={mhs.id_pendaftaran} className="hover:bg-slate-50/80 transition-colors">
            <td className="kkn-table-td px-3 text-center font-bold text-slate-500 whitespace-nowrap">
              {(pagination.page - 1) * pagination.limit + idx + 1}
            </td>
            <td className="kkn-table-td">
              <p className="font-bold text-slate-900 leading-snug">{mhs.nama}</p>
              <p className="text-[11px] text-slate-500 font-mono mt-0.5">NIM: {mhs.nim}</p>
              <div className="flex items-center gap-2 text-[10px] text-slate-400 mt-1 whitespace-nowrap">
                <span>
                  IPK: <strong className="text-slate-600">{mhs.ipk ?? '-'}</strong>
                </span>
                <span>•</span>
                <span>{mhs.total_sks} SKS</span>
              </div>
            </td>
            <td className="kkn-table-td">
              <span className="font-semibold text-slate-800 text-xs block leading-tight">
                {mhs.nama_prodi}
              </span>
              <span className="kkn-badge-fakultas mt-1">{mhs.nama_fakultas}</span>
            </td>
            <td className="kkn-table-td text-center whitespace-nowrap">
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-sky-50 text-sky-800 border border-sky-200">
                <Globe2 className="w-3 h-3 text-sky-600 shrink-0" />
                <span>{mhs.negara_tujuan}</span>
              </span>
              <span className="block text-[10px] text-slate-400 mt-1 truncate">
                {mhs.nama_periode}
              </span>
            </td>
            <td className="kkn-table-td text-center whitespace-nowrap">
              <div className="flex flex-col items-center justify-center gap-1">
                {mhs.status_verifikasi === 'Lengkap & Valid' ? (
                  <span className="inline-flex items-center gap-1 bg-[#C0E6D8] text-[#0E4A3E] border border-emerald-300 font-bold text-[11px] px-3 py-1 rounded-full shadow-2xs whitespace-nowrap">
                    <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                    <span>Lengkap &amp; Valid</span>
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
                <span className="text-[10px] font-semibold text-slate-500 whitespace-nowrap">
                  {mhs.summary_docs.valid}/{mhs.summary_docs.total} Dokumen Sah
                  {mhs.summary_docs.revisi > 0 && (
                    <span className="text-red-600 ml-1">({mhs.summary_docs.revisi} revisi)</span>
                  )}
                </span>
              </div>
            </td>
            <td className="kkn-table-td text-center whitespace-nowrap">
              <button
                onClick={() => onOpenWorkspace(mhs)}
                className="kkn-btn-table-action shadow-xs hover:shadow-sm"
                title="Periksa seluruh dokumen pendaftaran mahasiswa ini dalam 1 tampilan"
              >
                <FileCheck2 className="w-3.5 h-3.5 text-[#C0E6D8]" />
                <span>Periksa</span>
              </button>
            </td>
          </tr>
        ))}
        footer={
          <>
            <div>
              Menampilkan <strong className="text-slate-800">{items.length}</strong> mahasiswa dari{' '}
              <strong className="text-slate-800">{pagination.total}</strong> pendaftar
            </div>
            <div className="flex items-center gap-1.5 self-center">
              <button
                onClick={() => onPageChange(Math.max(1, currentPage - 1))}
                disabled={currentPage <= 1 || isLoading}
                className="p-1.5 rounded-lg border border-slate-300 bg-white hover:bg-slate-100 disabled:opacity-40 cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map((num) => (
                <button
                  key={num}
                  onClick={() => onPageChange(num)}
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
                onClick={() => onPageChange(Math.min(pagination.totalPages, currentPage + 1))}
                disabled={currentPage >= pagination.totalPages || isLoading}
                className="p-1.5 rounded-lg border border-slate-300 bg-white hover:bg-slate-100 disabled:opacity-40 cursor-pointer"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </>
        }
      />

      {selectedMahasiswa && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/55 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-4xl w-full shadow-2xl border border-slate-200 max-h-[92vh] flex flex-col overflow-hidden">
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
                onClick={onCloseWorkspace}
                className="p-1.5 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition-colors cursor-pointer shrink-0"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

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

              <div className="flex items-center gap-2">
                <div className="text-[11px] font-bold text-slate-500">
                  Status Draf:{' '}
                  <span className="text-emerald-700">{modalDraftSummary.valid} Sesuai</span> •{' '}
                  <span className="text-red-600">{modalDraftSummary.revisi} Revisi</span> •{' '}
                  <span className="text-amber-600">{modalDraftSummary.menunggu} Menunggu</span>
                </div>
                <button
                  type="button"
                  onClick={onApproveAll}
                  disabled={timelineGuard !== null && !timelineGuard.isOpen}
                  className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer flex items-center gap-1.5"
                  title="Tandai seluruh dokumen mahasiswa ini sebagai Sesuai (Valid)"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Tandai Semua Sesuai</span>
                </button>
              </div>
            </div>

            {timelineGuard && !timelineGuard.isOpen && (
              <div className="px-6 py-2.5 bg-amber-100 border-b border-amber-300 text-amber-950 flex items-center gap-2.5 text-xs font-medium">
                <Lock className="w-4 h-4 text-amber-800 shrink-0" />
                <span>
                  <strong>Mode Hanya Baca:</strong> {timelineGuard.message} Aksi verifikasi dinonaktifkan.
                </span>
              </div>
            )}

            <form onSubmit={onSaveWorkspace} className="flex-1 overflow-y-auto p-6 space-y-4">
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

                          <button
                            type="button"
                            disabled={timelineGuard !== null && !timelineGuard.isOpen}
                            onClick={() => onDocStatusChange(doc.id_dokumen, 'Sesuai')}
                            className={`px-3 py-1.5 rounded-xl text-xs font-extrabold flex items-center gap-1.5 transition-all ${
                              timelineGuard && !timelineGuard.isOpen ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'
                            } ${
                              isSesuai
                                ? 'bg-emerald-700 text-white shadow-xs'
                                : 'bg-white border border-slate-300 text-slate-600 hover:bg-emerald-50 hover:text-emerald-700'
                            }`}
                          >
                            <Check className="w-3.5 h-3.5" />
                            <span>Sesuai (Valid)</span>
                          </button>

                          <button
                            type="button"
                            disabled={timelineGuard !== null && !timelineGuard.isOpen}
                            onClick={() => onDocStatusChange(doc.id_dokumen, 'Tidak Sesuai')}
                            className={`px-3 py-1.5 rounded-xl text-xs font-extrabold flex items-center gap-1.5 transition-all ${
                              timelineGuard && !timelineGuard.isOpen ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'
                            } ${
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

                      <div className="mt-3 pt-3 border-t border-slate-200/70">
                        <label className="block text-[11px] font-bold text-slate-600 mb-1">
                          Catatan / Keterangan Verifikator{' '}
                          {isTidakSesuai && <span className="text-red-500">* (Wajib diisi jika perlu revisi)</span>}:
                        </label>
                        <input
                          type="text"
                          value={currentDraft.catatan}
                          onChange={(e) => onDocNoteChange(doc.id_dokumen, e.target.value)}
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

              <div className="pt-4 border-t border-slate-200 flex items-center justify-between flex-wrap gap-3">
                <span className="text-xs text-slate-500">
                  Menyimpan akan otomatis memperbarui status berkas dan alur pendaftaran mahasiswa.
                </span>

                <div className="flex items-center gap-2.5">
                  <button
                    type="button"
                    onClick={onCloseWorkspace}
                    disabled={isSaving}
                    className="px-4 py-2.5 rounded-xl border border-slate-300 text-slate-700 font-bold text-xs hover:bg-slate-100 transition-colors cursor-pointer"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    disabled={isSaving || (timelineGuard !== null && !timelineGuard.isOpen)}
                    className="px-6 py-2.5 rounded-xl bg-[#0E4A3E] hover:bg-[#09352c] text-white font-bold text-xs shadow-md transition-all hover:scale-102 active:scale-98 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer flex items-center gap-2"
                  >
                    {timelineGuard && !timelineGuard.isOpen ? (
                      <>
                        <Lock className="w-4 h-4 text-amber-300" />
                        <span>Verifikasi Terkunci (Belum Jadwalnya)</span>
                      </>
                    ) : isSaving ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Menyimpan...</span>
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4 text-emerald-300" />
                        <span>Simpan Hasil Verifikasi Mahasiswa</span>
                      </>
                    )}
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
