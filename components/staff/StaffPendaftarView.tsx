'use client';

import React from 'react';
import {
  X,
  FileText,
  ChevronLeft,
  ChevronRight,
  Users,
} from 'lucide-react';
import {
  HeroBanner,
  HeroAsideCard,
  SearchFilterBar,
  ResponsiveTableCard,
  StatusBadge,
} from '@/components/ui';

export interface PendaftarItem {
  id_pendaftaran: number;
  nim: string;
  nama: string;
  email: string;
  nama_fakultas: string;
  nama_prodi: string;
  nama_negara: string;
  nama_periode: string;
  ipk: number | null;
  tanggal_daftar: string;
  status_pendaftaran: string;
  status_label: string;
  status_badge_type: 'terverifikasi' | 'menunggu' | 'perlu_perbaikan' | 'draft' | 'lolos';
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  dokumen: any[];
}

export interface PendaftarPagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface StaffPendaftarViewProps {
  items: PendaftarItem[];
  pagination: PendaftarPagination;
  isLoading: boolean;
  search: string;
  onSearchChange: (val: string) => void;
  statusFilter: string;
  onStatusFilterChange: (val: string) => void;
  currentPage: number;
  onPageChange: (page: number) => void;
  selectedDetail: PendaftarItem | null;
  onSelectDetail: (item: PendaftarItem | null) => void;
  activePeriode: { id_periode: number; nama_periode: string; tahun: number } | null;
  formatDate: (dateStr: string) => string;
}

const STATUS_OPTIONS = [
  { value: 'all', label: 'Semua Status Pendaftaran' },
  { value: 'Verifikasi_Dokumen', label: 'Terverifikasi' },
  { value: 'Menunggu_Verifikasi', label: 'Menunggu Verifikasi' },
  { value: 'Perbaikan_Dokumen', label: 'Perlu Perbaikan' },
  { value: 'Lolos', label: 'Lolos Seleksi' },
];

export default function StaffPendaftarView({
  items,
  pagination,
  isLoading,
  search,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
  currentPage,
  onPageChange,
  selectedDetail,
  onSelectDetail,
  activePeriode,
  formatDate,
}: StaffPendaftarViewProps) {
  return (
    <div className="kkn-page-container font-sans">
      <HeroBanner
        badgeIcon={<Users className="w-3.5 h-3.5 text-[#C0E6D8]" />}
        badgeText="Database Pendaftaran Mahasiswa"
        title="DATA PENDAFTAR"
        description="Kelola dan pantau seluruh berkas pendaftaran mahasiswa KKN Internasional yang masuk pada periode aktif."
        aside={
          activePeriode ? (
            <HeroAsideCard
              label="Periode Pendaftaran Aktif"
              title={activePeriode.nama_periode}
              subtitle={`Total: ${pagination.total} Mahasiswa Terdaftar`}
              className="min-w-[240px]"
            />
          ) : undefined
        }
      />

      <SearchFilterBar
        searchValue={search}
        onSearchChange={onSearchChange}
        searchPlaceholder="Cari berdasarkan nama, NIM, atau program studi..."
        selectValue={statusFilter}
        onSelectChange={onStatusFilterChange}
        selectOptions={STATUS_OPTIONS}
        selectMinWidth="min-w-[200px]"
      />

      <ResponsiveTableCard
        isLoading={isLoading}
        loadingText="Memuat data pendaftar dari database..."
        isEmpty={items.length === 0}
        emptyContent={
          <div className="space-y-1.5">
            <p className="text-sm font-bold text-slate-700">
              Belum ada pendaftar pada periode aktif{' '}
              {activePeriode ? `(${activePeriode.nama_periode})` : ''}
            </p>
            <p className="text-xs text-slate-400">
              Data pendaftar hanya menampilkan mahasiswa yang mendaftar pada periode yang sedang aktif.
            </p>
          </div>
        }
        minWidthClass="min-w-[720px]"
        thead={
          <tr>
            <th className="kkn-table-th px-3 text-center w-12">No</th>
            <th className="kkn-table-th min-w-[200px]">NIM &amp; Nama Mahasiswa</th>
            <th className="kkn-table-th min-w-[180px]">Fakultas / Program Studi</th>
            <th className="kkn-table-th min-w-[160px]">Tgl Daftar &amp; Tujuan</th>
            <th className="kkn-table-th text-center min-w-[130px]">Status</th>
            <th className="kkn-table-th text-center min-w-[90px]">Aksi</th>
          </tr>
        }
        tbody={items.map((item, idx) => (
          <tr key={item.id_pendaftaran} className="hover:bg-slate-50/80 transition-colors">
            <td className="kkn-table-td px-3 text-center font-bold text-slate-500 whitespace-nowrap">
              {(pagination.page - 1) * pagination.limit + idx + 1}
            </td>
            <td className="kkn-table-td">
              <p className="font-bold text-slate-900 leading-snug">{item.nama}</p>
              <p className="text-[11px] text-slate-500 font-mono mt-0.5">NIM: {item.nim}</p>
            </td>
            <td className="kkn-table-td">
              <p className="font-semibold text-slate-800">{item.nama_prodi}</p>
              <span className="kkn-badge-fakultas">{item.nama_fakultas}</span>
            </td>
            <td className="kkn-table-td text-slate-700">
              <p className="font-semibold text-xs whitespace-nowrap">{formatDate(item.tanggal_daftar)}</p>
              <span className="text-[11px] text-slate-500 block mt-0.5 whitespace-nowrap">
                Tujuan: <strong className="text-[#0E4A3E]">{item.nama_negara || 'Malaysia'}</strong>
              </span>
            </td>
            <td className="kkn-table-td text-center whitespace-nowrap">
              <StatusBadge status={item.status_pendaftaran || item.status_badge_type} />
            </td>
            <td className="kkn-table-td text-center whitespace-nowrap">
              <button
                type="button"
                onClick={() => onSelectDetail(item)}
                className="kkn-btn-table-action shadow-xs hover:shadow-sm"
              >
                Detail
              </button>
            </td>
          </tr>
        ))}
        footer={
          <>
            <div>
              Menampilkan <strong className="text-slate-800">1</strong>-
              <strong className="text-slate-800">{items.length}</strong> data dari{' '}
              <strong className="text-slate-800">{pagination.total}</strong> data
            </div>
            <div className="flex items-center gap-1.5 self-center">
              <button
                onClick={() => onPageChange(Math.max(1, currentPage - 1))}
                disabled={currentPage <= 1 || isLoading}
                className="p-1.5 rounded-lg border border-slate-300 bg-white hover:bg-slate-100 disabled:opacity-40 cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="w-8 h-8 rounded-lg bg-[#0E4A3E] text-white flex items-center justify-center font-bold text-xs shadow-xs">
                {currentPage}
              </span>
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

      {selectedDetail && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl sm:rounded-3xl shadow-2xl max-w-lg w-full overflow-hidden border border-[#C0E6D8]">
            <div className="bg-[#0E4A3E] text-white px-6 py-4 flex items-center justify-between">
              <h3 className="font-extrabold text-base tracking-wide uppercase">
                Detail Pendaftar KKN
              </h3>
              <button
                onClick={() => onSelectDetail(null)}
                className="text-white/80 hover:text-white p-1 rounded-lg hover:bg-white/10 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
              <div className="flex items-center gap-3 p-3.5 bg-gradient-to-br from-[#EAF5F0] to-white rounded-2xl border border-[#C0E6D8]">
                <div className="w-12 h-12 rounded-2xl bg-[#0E4A3E] text-[#C0E6D8] flex items-center justify-center font-black text-lg shadow-xs shrink-0">
                  {selectedDetail.nama.charAt(0)}
                </div>
                <div className="min-w-0 flex-1">
                  <h4 className="font-extrabold text-slate-900 text-sm truncate">{selectedDetail.nama}</h4>
                  <p className="text-xs text-slate-500 font-mono">NIM: {selectedDetail.nim}</p>
                  <p className="text-xs text-slate-600 truncate">
                    {selectedDetail.nama_prodi} ({selectedDetail.nama_fakultas})
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="text-slate-400 block font-bold text-[10px] uppercase">IPK Terakhir</span>
                  <span className="font-black text-[#0E4A3E] text-base">
                    {selectedDetail.ipk ? selectedDetail.ipk.toFixed(2) : '-'}
                  </span>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="text-slate-400 block font-bold text-[10px] uppercase">Negara Penempatan</span>
                  <span className="font-black text-slate-800 text-sm">
                    {selectedDetail.nama_negara}
                  </span>
                </div>
              </div>

              <div>
                <h5 className="font-bold text-xs uppercase tracking-wider text-[#0E4A3E] mb-2">
                  Dokumen Persyaratan ({selectedDetail.dokumen?.length || 0})
                </h5>
                <div className="space-y-1.5">
                  {selectedDetail.dokumen?.map((d, i) => (
                    <div
                      key={i}
                      className="p-2.5 rounded-xl border border-slate-200 bg-white flex items-center justify-between text-xs"
                    >
                      <div className="flex items-center gap-2 min-w-0 flex-1 pr-2">
                        <FileText className="w-4 h-4 text-[#0E4A3E] shrink-0" />
                        <span className="font-semibold text-slate-700 truncate">{d.nama_persyaratan}</span>
                      </div>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 ${
                          d.status === 'Valid'
                            ? 'bg-emerald-100 text-emerald-800'
                            : d.status === 'Revisi'
                            ? 'bg-red-100 text-red-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {d.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end">
              <button
                onClick={() => onSelectDetail(null)}
                className="px-5 py-2 rounded-full bg-[#0E4A3E] text-white font-bold text-xs hover:bg-[#09352c] transition-colors cursor-pointer"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
