'use client';

import React, { useEffect, useState, useCallback, useMemo } from 'react';
import Link from 'next/link';
import { Calendar, RefreshCw, ChevronRight, Bell } from 'lucide-react';
import { UserAccount } from '@/lib/dummyData';

interface PeriodeOption {
  id_periode: number;
  nama_periode: string;
  tahun: number;
  status: string;
  kuota: number;
}

interface DashboardData {
  activePeriode: {
    id_periode: number;
    nama_periode: string;
    tahun: number;
    kuota: number;
    status: string;
    tanggal_mulai: string;
    tanggal_selesai: string;
    isOngoing: boolean;
  } | null;
  periodes?: PeriodeOption[];
  stats: {
    totalPendaftaran: number;
    menungguVerifikasi: number;
    verifikasiDokumen: number;
    perluPerbaikan: number;
    wawancaraCount: number;
    lolosSeleksi: number;
    tidakLolos: number;
    draftCount: number;
    totalMahasiswa: number;
    totalStaff: number;
    totalPengumuman: number;
  };
  tahapan: {
    id: number;
    nama: string;
    count: number;
    isActive: boolean;
  }[];
  dailyRegistrations: {
    date: string;
    label: string;
    count: number;
  }[];
  recentPengumuman: {
    id_pengumuman: number;
    judul: string;
    isi: string;
    tanggal_publish: string;
  }[];
}

import { PageHeader, StatCardMint, PipelineStepper, RegistrationChart } from '@/components/ui';

export default function AdminDashboard() {
  const [user, setUser] = useState<UserAccount | null>(null);
  const [data, setData] = useState<DashboardData | null>(null);
  const [selectedPeriodeId, setSelectedPeriodeId] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchDashboard = useCallback(async (forcedId?: number) => {
    setIsLoading(true);
    try {
      const pid = forcedId !== undefined ? forcedId : selectedPeriodeId;
      const url = pid ? `/api/admin/dashboard?id_periode=${pid}` : '/api/admin/dashboard';
      const res = await fetch(url);
      const json = await res.json();
      if (json.success && json.data) {
        setData(json.data);
        if (forcedId !== undefined) {
          setSelectedPeriodeId(forcedId);
        } else if (!selectedPeriodeId && json.data.activePeriode?.id_periode) {
          setSelectedPeriodeId(json.data.activePeriode.id_periode);
        }
      }
    } catch (err) {
      console.error('Failed to load admin dashboard data:', err);
    } finally {
      setIsLoading(false);
    }
  }, [selectedPeriodeId]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('currentUser');
      if (stored) {
        try {
          setUser(JSON.parse(stored));
        } catch (e) {
          console.error(e);
        }
      }
    }
    fetchDashboard();
  }, [fetchDashboard]);

  // Format date range: e.g. "05 Oktober 2026 - 09 Oktober 2026"
  const formatDateRange = (mulaiStr?: string, selesaiStr?: string) => {
    if (!mulaiStr || !selesaiStr) return '05 Oktober 2026 - 09 Oktober 2026';
    try {
      const options: Intl.DateTimeFormatOptions = { day: '2-digit', month: 'long', year: 'numeric' };
      const mulai = new Date(mulaiStr).toLocaleDateString('id-ID', options);
      const selesai = new Date(selesaiStr).toLocaleDateString('id-ID', options);
      return `${mulai} - ${selesai}`;
    } catch {
      return `${mulaiStr} - ${selesaiStr}`;
    }
  };

  // Format short date for announcements
  const formatShortDate = (dateStr: string) => {
    try {
      return new Date(dateStr).toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      });
    } catch {
      return dateStr;
    }
  };

  // Nama pengguna yang disesuaikan (Default MORIN PITA LAURA! sesuai desain atau nama akun)
  const adminName = useMemo(() => {
    if (user?.name && !user.name.toLowerCase().includes('administrator')) {
      return user.name.toUpperCase();
    }
    return 'MORIN PITA LAURA!';
  }, [user]);



  return (
    <div className="w-full max-w-7xl mx-auto space-y-6 pb-12 font-sans">
      {/* ── 1. Header Sambutan ── */}
      <PageHeader
        title="SELAMAT DATANG,"
        subtitle={adminName}
        description="Kelola seluruh proses pendaftaran, seleksi, dan pengumuman KKN Internasional."
        action={
          <div className="flex flex-wrap items-center gap-2.5">
            {data?.periodes && data.periodes.length > 0 && (
              <div className="flex items-center gap-2 bg-white px-3.5 py-2 rounded-xl border border-slate-300 shadow-2xs">
                <Calendar className="w-4 h-4 text-[#0E4A3E]" />
                <select
                  value={selectedPeriodeId || data.activePeriode?.id_periode || ''}
                  onChange={(e) => {
                    const newId = Number(e.target.value);
                    fetchDashboard(newId);
                  }}
                  className="text-xs sm:text-sm font-bold text-slate-700 bg-transparent focus:outline-none cursor-pointer"
                >
                  {data.periodes.map((p) => (
                    <option key={p.id_periode} value={p.id_periode}>
                      {p.nama_periode} ({p.tahun})
                    </option>
                  ))}
                </select>
              </div>
            )}
            <button
              onClick={() => fetchDashboard()}
              disabled={isLoading}
              className="p-2.5 rounded-xl bg-white border border-slate-200 text-[#0E4A3E] hover:bg-[#C0E6D8]/30 transition-colors shadow-xs cursor-pointer"
              title="Segarkan Data Dashboard"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        }
      />

      {/* ── 2. Top 4 Stat Cards (Sesuai Desain: Mint Green Rounded Boxes) ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <StatCardMint
          value={data ? data.stats.totalPendaftaran : 0}
          label="Total Pendaftar"
        />
        <StatCardMint
          value={data ? data.stats.menungguVerifikasi : 0}
          label="Menunggu Verifikasi"
        />
        <StatCardMint
          value={data ? data.stats.verifikasiDokumen + data.stats.wawancaraCount : 0}
          label="Verifikasi Dokumen"
        />
        <StatCardMint
          value={data ? data.stats.lolosSeleksi : 0}
          label="Lolos Seleksi"
        />
      </div>

      {/* ── 3. Middle Section: Tahapan Pendaftaran & Periode Aktif ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        {/* Panel Kiri: Tahapan Pendaftaran (Pipeline Stepper) */}
        <div className="lg:col-span-8 bg-white rounded-2xl sm:rounded-3xl border border-slate-200/80 p-6 sm:p-7 shadow-[0_4px_20px_-4px_rgba(14,74,62,0.06)] flex flex-col justify-between">
          <div className="flex items-center justify-between mb-6 sm:mb-8">
            <h3 className="text-sm sm:text-base font-black text-[#0E4A3E] uppercase tracking-wider font-archivo">
              TAHAPAN PENDAFTARAN
            </h3>
            <span className="text-[11px] font-bold text-emerald-800 bg-emerald-50 border border-emerald-200/80 px-2.5 py-0.5 rounded-full">
              Live Pipeline
            </span>
          </div>

          <PipelineStepper tahapan={data?.tahapan} />
        </div>

        {/* Panel Kanan: Periode Pendaftaran Aktif */}
        <div className="lg:col-span-4 bg-white rounded-2xl sm:rounded-3xl border border-slate-200 p-6 sm:p-7 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <h3 className="text-sm sm:text-base font-extrabold text-slate-800">
                Periode Pendaftaran Aktif
              </h3>
              <Calendar className="w-5 h-5 text-slate-400" />
            </div>

            <h4 className="text-sm font-black text-[#0E4A3E] mt-3">
              {data?.activePeriode?.nama_periode || 'KKN Internasional Gelombang 1'}
            </h4>

            <p className="text-xs sm:text-sm text-slate-600 font-medium mt-1">
              {formatDateRange(
                data?.activePeriode?.tanggal_mulai,
                data?.activePeriode?.tanggal_selesai
              )}
            </p>
          </div>

          <div className="mt-6 flex items-center justify-between">
            <span
              className={`inline-block border font-bold text-xs px-4 py-1.5 rounded-full ${
                data?.activePeriode?.status === 'Aktif' || data?.activePeriode?.isOngoing
                  ? 'bg-[#C0E6D8] text-[#0E4A3E] border-emerald-400/50'
                  : data?.activePeriode?.status === 'Belum Aktif'
                  ? 'bg-slate-100 text-slate-600 border-slate-300'
                  : 'bg-amber-100 text-amber-800 border-amber-300'
              }`}
            >
              {data?.activePeriode?.status === 'Aktif' || data?.activePeriode?.isOngoing
                ? 'Sedang Berlangsung'
                : data?.activePeriode?.status === 'Belum Aktif'
                ? 'Belum Dimulai'
                : 'Selesai'}
            </span>

            {data?.activePeriode?.kuota && (
              <span className="text-xs font-bold text-slate-500">
                Kuota: <span className="text-[#0E4A3E] font-black">{data.activePeriode.kuota}</span>
              </span>
            )}
          </div>
        </div>
      </div>

      {/* ── 4. Bottom Section: Grafik Pendaftar per Hari & Pengumuman Terbaru ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
        {/* Panel Kiri: Grafik Pendaftar per Hari Organism */}
        <RegistrationChart
          data={data?.dailyRegistrations}
          title="Grafik Pendaftar per Hari"
          subtitle="Tren pendaftaran harian pada periode ini"
        />

        {/* Panel Kanan: Pengumuman Terbaru */}
        <div className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200 p-6 sm:p-7 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm sm:text-base font-bold text-[#0E4A3E]">
              Pengumuman Terbaru
            </h3>
            <Link
              href="/admin/pengumuman"
              className="text-xs text-slate-500 hover:text-[#0E4A3E] font-semibold transition-colors flex items-center gap-0.5"
            >
              Lihat Semua <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="flex-1 space-y-3 min-h-[140px] flex flex-col justify-center">
            {isLoading ? (
              <div className="flex items-center justify-center py-6 text-slate-400 text-xs">
                <RefreshCw className="w-4 h-4 animate-spin mr-2" />
                Memuat pengumuman...
              </div>
            ) : !data?.recentPengumuman || data.recentPengumuman.length === 0 ? (
              <div className="text-center py-6 text-slate-400 text-xs">
                <Bell className="w-6 h-6 mx-auto mb-2 text-slate-300" />
                Belum ada pengumuman yang diterbitkan.
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {data.recentPengumuman.slice(0, 3).map((item) => (
                  <Link
                    key={item.id_pengumuman}
                    href={`/admin/pengumuman`}
                    className="block py-2.5 first:pt-0 last:pb-0 hover:bg-slate-50 rounded-lg px-2 -mx-2 transition-colors group"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <h4 className="text-xs sm:text-sm font-bold text-slate-800 line-clamp-1 group-hover:text-[#0E4A3E] transition-colors">
                        {item.judul}
                      </h4>
                      <span className="text-[10px] text-slate-400 shrink-0 font-medium">
                        {formatShortDate(item.tanggal_publish)}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">
                      {item.isi}
                    </p>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
