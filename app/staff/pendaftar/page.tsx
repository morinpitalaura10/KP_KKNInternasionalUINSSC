'use client';

import React, { useEffect, useState, useCallback } from 'react';
import {
  Search,
  Filter,
  RefreshCw,
  Eye,
  X,
  FileText,
  Calendar,
  ChevronLeft,
  ChevronRight,
  GraduationCap,
  MapPin,
  Phone,
  User,
} from 'lucide-react';
import { PageHeader, StatusBadge } from '@/components/ui';

interface PendaftarItem {
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

interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export default function StaffPendaftarPage() {
  const [items, setItems] = useState<PendaftarItem[]>([]);
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
  const [selectedDetail, setSelectedDetail] = useState<PendaftarItem | null>(null);
  const [activePeriode, setActivePeriode] = useState<{
    id_periode: number;
    nama_periode: string;
    tahun: number;
  } | null>(null);

  const fetchPendaftar = useCallback(async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      params.set('active_only', 'true');
      if (search.trim()) params.set('search', search.trim());
      if (statusFilter !== 'all') params.set('status', statusFilter);
      params.set('page', String(currentPage));
      params.set('limit', '10');

      const res = await fetch(`/api/pendaftaran?${params.toString()}`);
      const json = await res.json();
      if (json.success) {
        setItems(json.data || []);
        if (json.pagination) setPagination(json.pagination);
        if (json.activePeriode) setActivePeriode(json.activePeriode);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, [search, statusFilter, currentPage]);

  useEffect(() => {
    fetchPendaftar();
  }, [fetchPendaftar]);

  const formatDate = (dateStr: string) => {
    try {
      return new Date(dateStr).toLocaleDateString('id-ID', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="w-full max-w-7xl space-y-6 pb-12 font-sans">
      {/* ── Top Header Area ── */}
      <PageHeader
        title="DATA PENDAFTAR"
        subtitle="KULIAH KERJA NYATA INTERNASIONAL"
        description="Berikut adalah daftar mahasiswa yang mendaftar KKN Internasional pada periode aktif."
        action={
          activePeriode ? (
            <div className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[#DDF2E8] border border-emerald-200 text-[#0E4A3E] text-xs font-extrabold shadow-2xs">
              <Calendar className="w-4 h-4 text-[#0E4A3E]" />
              <span>
                Periode Aktif: {activePeriode.nama_periode} ({activePeriode.tahun})
              </span>
            </div>
          ) : undefined
        }
      />

      {/* ── Search & Filter Bar ── */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Cari data pendaftar disini..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-300 rounded-xl text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0E4A3E] shadow-2xs"
          />
        </div>

        <div className="relative min-w-[180px]">
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-xs sm:text-sm font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#0E4A3E] shadow-2xs appearance-none pr-8 cursor-pointer"
          >
            <option value="all">Semua Status</option>
            <option value="Verifikasi_Dokumen">Terverifikasi</option>
            <option value="Menunggu_Verifikasi">Menunggu</option>
            <option value="Perbaikan_Dokumen">Perlu Perbaikan</option>
            <option value="Lolos">Lolos</option>
          </select>
          <Filter className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
        </div>
      </div>

      {/* ── Table Card ── */}
      <div className="bg-white rounded-2xl border border-slate-300 shadow-sm overflow-hidden">
        {/* Header */}
        <div className="bg-[#0E4A3E] text-white px-6 py-4">
          <div className="grid grid-cols-12 text-xs font-extrabold tracking-wider uppercase items-center">
            <span className="col-span-1 text-center">No</span>
            <span className="col-span-3">NIM / Nama Mahasiswa</span>
            <span className="col-span-3">Fakultas / Program Studi</span>
            <span className="col-span-3">Tgl Daftar & Tujuan</span>
            <span className="col-span-1 text-center">Status</span>
            <span className="col-span-1 text-center">Aksi</span>
          </div>
        </div>

        {/* Content */}
        {isLoading ? (
          <div className="py-16 flex flex-col items-center justify-center text-slate-400 gap-2">
            <RefreshCw className="w-6 h-6 animate-spin text-[#0E4A3E]" />
            <span className="text-xs font-semibold">Memuat data pendaftar dari MySQL...</span>
          </div>
        ) : items.length === 0 ? (
          <div className="py-16 px-4 text-center space-y-1">
            <p className="text-sm font-bold text-slate-700">
              Belum ada pendaftar pada periode aktif{' '}
              {activePeriode ? `(${activePeriode.nama_periode})` : ''}
            </p>
            <p className="text-xs text-slate-400">
              Data pendaftar hanya menampilkan mahasiswa yang mendaftar pada periode yang sedang aktif.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {items.map((item, idx) => (
              <div
                key={item.id_pendaftaran}
                className="grid grid-cols-12 items-center px-6 py-4 hover:bg-slate-50 transition-colors text-xs sm:text-sm"
              >
                <span className="col-span-1 text-center font-bold text-slate-500">
                  {(pagination.page - 1) * pagination.limit + idx + 1}
                </span>

                <div className="col-span-3 pr-3">
                  <p className="font-bold text-slate-800 leading-snug">{item.nama}</p>
                  <p className="text-[11px] text-slate-500 font-mono mt-0.5">NIM: {item.nim}</p>
                </div>

                <div className="col-span-3 pr-3">
                  <p className="font-semibold text-slate-800">{item.nama_prodi}</p>
                  <span className="inline-block text-[11px] font-bold text-[#0E4A3E] bg-[#0E4A3E]/10 px-2 py-0.5 rounded-md mt-0.5">
                    {item.nama_fakultas}
                  </span>
                </div>

                <div className="col-span-3 pr-3 text-slate-700">
                  <p className="font-semibold text-xs">{formatDate(item.tanggal_daftar)}</p>
                  <span className="text-[11px] text-slate-400 block mt-0.5">
                    Negara Tujuan: <strong>{item.nama_negara || 'Malaysia'}</strong>
                  </span>
                </div>

                {/* Status Badges matching global design */}
                <div className="col-span-1 flex justify-center">
                  <StatusBadge status={item.status_pendaftaran || item.status_badge_type} />
                </div>

                {/* Aksi: Green Button "Detail" matching mockup */}
                <div className="col-span-1 flex justify-center">
                  <button
                    onClick={() => setSelectedDetail(item)}
                    className="px-3 py-1.5 bg-[#0E4A3E] hover:bg-[#09352c] text-white rounded-lg text-xs font-bold transition-all shadow-xs cursor-pointer"
                  >
                    Detail
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Footer */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-slate-600">
          <div>
            Menampilkan <strong className="text-slate-800">1</strong>-
            <strong className="text-slate-800">{items.length}</strong> data dari{' '}
            <strong className="text-slate-800">{pagination.total}</strong> data
          </div>

          <div className="flex items-center gap-1.5 self-center">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage <= 1 || isLoading}
              className="p-1.5 rounded-lg border border-slate-300 bg-white hover:bg-slate-100 disabled:opacity-40 cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="w-8 h-8 rounded-lg bg-[#0E4A3E] text-white flex items-center justify-center font-bold text-xs shadow-xs">
              {currentPage}
            </span>
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

      {/* ── Detail Modal ── */}
      {selectedDetail && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden border border-slate-200">
            <div className="bg-[#0E4A3E] text-white px-6 py-4 flex items-center justify-between">
              <h3 className="font-extrabold text-base tracking-wide uppercase">
                Detail Pendaftar KKN
              </h3>
              <button
                onClick={() => setSelectedDetail(null)}
                className="text-white/80 hover:text-white p-1 rounded-lg hover:bg-white/10 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
              <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200">
                <div className="w-12 h-12 rounded-full bg-[#0E4A3E] text-white flex items-center justify-center font-bold text-lg">
                  {selectedDetail.nama.charAt(0)}
                </div>
                <div>
                  <h4 className="font-bold text-slate-800 text-sm">{selectedDetail.nama}</h4>
                  <p className="text-xs text-slate-500">NIM: {selectedDetail.nim}</p>
                  <p className="text-xs text-slate-500">
                    {selectedDetail.nama_prodi} ({selectedDetail.nama_fakultas})
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3 bg-slate-50 rounded-lg">
                  <span className="text-slate-400 block font-bold">IPK Terakhir</span>
                  <span className="font-black text-slate-800 text-sm">
                    {selectedDetail.ipk ? selectedDetail.ipk.toFixed(2) : '-'}
                  </span>
                </div>
                <div className="p-3 bg-slate-50 rounded-lg">
                  <span className="text-slate-400 block font-bold">Alokasi Penempatan Negara</span>
                  <span className="font-black text-slate-800 text-sm">
                    {selectedDetail.nama_negara}
                  </span>
                </div>
              </div>

              <div>
                <h5 className="font-bold text-xs uppercase tracking-wider text-slate-700 mb-2">
                  Dokumen Persyaratan ({selectedDetail.dokumen?.length || 0})
                </h5>
                <div className="space-y-1.5">
                  {selectedDetail.dokumen?.map((d, i) => (
                    <div
                      key={i}
                      className="p-2.5 rounded-lg border border-slate-200 flex items-center justify-between text-xs"
                    >
                      <div className="flex items-center gap-2">
                        <FileText className="w-4 h-4 text-[#0E4A3E]" />
                        <span className="font-semibold text-slate-700">{d.nama_persyaratan}</span>
                      </div>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
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
                onClick={() => setSelectedDetail(null)}
                className="px-5 py-2 rounded-xl bg-slate-200 text-slate-700 font-bold text-xs hover:bg-slate-300 cursor-pointer"
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
