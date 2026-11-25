'use client';

import React from 'react';
import {
  Search, RefreshCw, Users,
  GraduationCap, ShieldCheck, ShieldX,
} from 'lucide-react';
import { PageHeader, AlertBanner } from '@/components/ui';

export interface MahasiswaItem {
  id: number;
  id_mahasiswa: number;
  id_user: number;
  nim: string;
  nama: string;
  email: string;
  status_akun: boolean;
  nama_fakultas: string;
  nama_prodi: string;
  ipk: number | null;
  semester: number;
  kelas: string;
  last_sync: string | null;
}

export interface MahasiswaPagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface AdminMahasiswaViewProps {
  items: MahasiswaItem[];
  pagination: MahasiswaPagination | null;
  isLoading: boolean;
  search: string;
  setSearch: (val: string) => void;
  currentPage: number;
  statusMessage: { type: 'success' | 'error'; text: string } | null;
  setStatusMessage: (msg: { type: 'success' | 'error'; text: string } | null) => void;
  handleSearch: (e: React.FormEvent) => void;
  handleResetSearch: () => void;
  handleToggleStatus: (item: MahasiswaItem) => Promise<void>;
  handlePageChange: (page: number) => void;
}

export function AdminMahasiswaView({
  items,
  pagination,
  isLoading,
  search,
  setSearch,
  currentPage,
  statusMessage,
  setStatusMessage,
  handleSearch,
  handleResetSearch,
  handleToggleStatus,
  handlePageChange,
}: AdminMahasiswaViewProps) {
  return (
    <div className="w-full max-w-7xl space-y-6 pb-12 font-sans">
      {/* Header */}
      <PageHeader
        title="DATA MAHASISWA"
        subtitle="KULIAH KERJA NYATA INTERNASIONAL"
        description="Kelola data akun mahasiswa yang tersinkronisasi dari SIAKAD."
      />

      {/* Status Message */}
      <AlertBanner message={statusMessage} onClose={() => setStatusMessage(null)} />

      {/* Stats + Search Row */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
        {pagination && (
          <div className="bg-white border border-slate-200 rounded-2xl px-5 py-3 flex items-center gap-3 shadow-xs">
            <div className="p-2 bg-[#0E4A3E]/10 rounded-xl">
              <Users className="w-5 h-5 text-[#0E4A3E]" />
            </div>
            <div>
              <p className="text-[11px] text-slate-500 font-semibold">Total Mahasiswa Terdaftar</p>
              <p className="text-xl font-black text-slate-800">{pagination.total.toLocaleString('id-ID')}</p>
            </div>
          </div>
        )}
        <form onSubmit={handleSearch} className="flex gap-2 flex-1 max-w-md">
          <div className="relative flex-1">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari nama atau NIM mahasiswa..."
              className="w-full pl-9 pr-4 py-2.5 border border-slate-300 rounded-xl text-xs sm:text-sm focus:outline-none focus:border-[#0E4A3E] focus:ring-1 focus:ring-[#0E4A3E]"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          </div>
          <button type="submit" className="px-4 py-2 bg-[#0E4A3E] text-white rounded-xl text-xs font-bold hover:bg-[#09352c] transition-colors cursor-pointer">
            Cari
          </button>
          {search && (
            <button type="button" onClick={handleResetSearch} className="px-4 py-2 border border-slate-300 text-slate-600 rounded-xl text-xs font-bold hover:bg-slate-100 cursor-pointer">
              Reset
            </button>
          )}
        </form>
      </div>

      {/* Table */}
      <div className="kkn-table-card">
        <div className="kkn-table-scroll">
          <div className="kkn-table-inner">
        <div className="kkn-table-header">
          <div className="kkn-table-header-grid">
            <span className="col-span-1 text-center">No</span>
            <span className="col-span-1">NIM</span>
            <span className="col-span-2">Nama Mahasiswa</span>
            <span className="col-span-2">Fakultas</span>
            <span className="col-span-2">Program Studi</span>
            <span className="col-span-1 text-center">Smt</span>
            <span className="col-span-1 text-center">IPK</span>
            <span className="col-span-1 text-center">Status</span>
            <span className="col-span-1 text-center">Aksi</span>
          </div>
        </div>

        {isLoading ? (
          <div className="py-12 flex flex-col items-center justify-center text-slate-400 gap-2">
            <RefreshCw className="w-6 h-6 animate-spin text-[#0E4A3E]" />
            <span className="text-xs font-semibold">Memuat data mahasiswa...</span>
          </div>
        ) : items.length === 0 ? (
          <div className="py-12 text-center space-y-2">
            <GraduationCap className="w-12 h-12 text-slate-300 mx-auto" />
            <p className="text-slate-500 text-sm font-semibold">
              {search ? `Tidak ditemukan mahasiswa dengan kata kunci "${search}"` : 'Belum ada data mahasiswa. Lakukan sinkronisasi SIAKAD terlebih dahulu.'}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {items.map((item, idx) => (
              <div key={item.id} className="kkn-table-row">
                <span className="col-span-1 text-center font-bold text-slate-400">
                  {(currentPage - 1) * 15 + idx + 1}
                </span>
                <span className="col-span-1 font-mono text-[11px] text-slate-600 pr-2">{item.nim}</span>
                <div className="col-span-2 pr-2">
                  <p className="font-bold text-slate-800 leading-tight">{item.nama}</p>
                  <p className="text-[10px] text-slate-400">{item.email}</p>
                </div>
                <span className="col-span-2 text-slate-600 text-[11px] pr-2">{item.nama_fakultas}</span>
                <span className="col-span-2 text-slate-600 text-[11px] pr-2">{item.nama_prodi}</span>
                <span className="col-span-1 text-center font-bold text-slate-700">{item.semester || '-'}</span>
                <span className={`col-span-1 text-center font-bold ${item.ipk && item.ipk >= 3.5 ? 'text-emerald-700' : item.ipk && item.ipk >= 3.0 ? 'text-blue-700' : 'text-slate-700'}`}>
                  {item.ipk ? item.ipk.toFixed(2) : '-'}
                </span>
                <div className="col-span-1 flex justify-center">
                  {item.status_akun ? (
                    <span className="bg-emerald-100 text-emerald-800 border border-emerald-300 font-bold text-[10px] px-2.5 py-1 rounded-full">Aktif</span>
                  ) : (
                    <span className="bg-red-100 text-red-700 border border-red-300 font-bold text-[10px] px-2 py-1 rounded-full">Nonaktif</span>
                  )}
                </div>
                <div className="col-span-1 flex items-center justify-center gap-1">
                  <button
                    onClick={() => handleToggleStatus(item)}
                    title={item.status_akun ? 'Nonaktifkan akun' : 'Aktifkan akun'}
                    className={`p-1.5 rounded-lg transition-colors cursor-pointer ${item.status_akun ? 'text-red-400 hover:text-red-600 hover:bg-red-50' : 'text-emerald-500 hover:text-emerald-700 hover:bg-emerald-50'}`}
                  >
                    {item.status_akun ? <ShieldX className="w-3.5 h-3.5" /> : <ShieldCheck className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {pagination && pagination.totalPages > 1 && (
          <div className="px-6 py-4 border-t border-slate-200 flex items-center justify-between">
            <p className="text-xs text-slate-500">
              Menampilkan {(pagination.page - 1) * pagination.limit + 1}–{Math.min(pagination.page * pagination.limit, pagination.total)} dari <strong>{pagination.total}</strong> mahasiswa
            </p>
            <div className="flex items-center gap-1">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="px-3 py-1.5 text-xs font-bold text-slate-600 border border-slate-300 rounded-lg hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                ← Prev
              </button>
              {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                const start = Math.max(1, currentPage - 2);
                const page = start + i;
                if (page > pagination.totalPages) return null;
                return (
                  <button
                    key={page}
                    onClick={() => handlePageChange(page)}
                    className={`px-3 py-1.5 text-xs font-bold border rounded-lg cursor-pointer transition-colors ${page === currentPage ? 'bg-[#0E4A3E] text-white border-[#0E4A3E]' : 'text-slate-600 border-slate-300 hover:bg-slate-100'}`}
                  >
                    {page}
                  </button>
                );
              })}
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === pagination.totalPages}
                className="px-3 py-1.5 text-xs font-bold text-slate-600 border border-slate-300 rounded-lg hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                Next →
              </button>
            </div>
          </div>
        )}
          </div>
        </div>
      </div>
    </div>
  );
}
