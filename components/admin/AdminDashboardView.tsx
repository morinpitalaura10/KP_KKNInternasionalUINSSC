'use client';

import React from 'react';
import Link from 'next/link';
import { Calendar, RefreshCw, ChevronRight, Bell, ShieldCheck, ChevronDown, Users, Clock, FileCheck, Award } from 'lucide-react';
import { HeroBanner, StatCardMint, PipelineStepper, RegistrationChart } from '@/components/ui';

export interface PeriodeOption {
  id_periode: number;
  nama_periode: string;
  tahun: number;
  status: string;
  kuota: number;
}

export interface DashboardData {
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

export interface AdminDashboardViewProps {
  adminName: string;
  data: DashboardData | null;
  selectedPeriodeId: number | null;
  isLoading: boolean;
  onRefresh: (forcedId?: number) => void;
  formatDateRange: (mulaiStr?: string, selesaiStr?: string) => string;
  formatShortDate: (dateStr: string) => string;
}

export default function AdminDashboardView({
  adminName,
  data,
  selectedPeriodeId,
  isLoading,
  onRefresh,
  formatDateRange,
  formatShortDate,
}: AdminDashboardViewProps) {
  return (
    <div className="kkn-page-container font-sans">
      {/* ── 1. Hero Sambutan (Sama dengan Staff & Mahasiswa - Rapi & Compact) ── */}
      <HeroBanner
        badgeIcon={<ShieldCheck className="w-3.5 h-3.5 text-[#C0E6D8]" />}
        badgeText="Portal Resmi Administrator LP2M"
        title={
          <>
            Selamat Datang, <span className="text-[#C0E6D8]">{adminName}</span>! 👋
          </>
        }
        description="Kelola seluruh proses pendaftaran, verifikasi berkas, tahapan seleksi, dan pengumuman KKN Internasional secara terpadu."
        aside={
          data?.activePeriode ? (
            <div className="kkn-hero-aside-card space-y-2 self-start md:self-auto min-w-[220px] max-w-full">
              <div className="flex items-center justify-between gap-3">
                <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#C0E6D8] block">
                  Periode Aktif
                </span>
                <button
                  onClick={() => onRefresh()}
                  disabled={isLoading}
                  className="text-[#C0E6D8] hover:text-white transition-colors cursor-pointer p-1 rounded-md hover:bg-white/10 active:scale-95 disabled:opacity-50 flex items-center gap-1 text-[11px] font-bold"
                  title="Segarkan Data"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
                  <span className="hidden sm:inline">Segarkan</span>
                </button>
              </div>

              {data.periodes && data.periodes.length > 1 ? (
                <div className="relative">
                  <select
                    value={selectedPeriodeId || data.activePeriode.id_periode}
                    onChange={(e) => {
                      const newId = Number(e.target.value);
                      onRefresh(newId);
                    }}
                    className="w-full min-w-0 max-w-full truncate bg-white/10 hover:bg-white/15 transition-colors border border-white/20 rounded-xl px-3 py-1.5 pr-8 text-white font-extrabold text-sm sm:text-base focus:outline-none cursor-pointer appearance-none [&>option]:text-slate-900"
                  >
                    {data.periodes.map((p) => (
                      <option key={p.id_periode} value={p.id_periode}>
                        {p.nama_periode}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="w-4 h-4 text-[#C0E6D8] absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              ) : (
                <div className="font-extrabold text-base sm:text-lg leading-tight text-white">
                  {data.activePeriode.nama_periode}
                </div>
              )}

              <div className="flex items-center gap-2 text-xs text-emerald-100/90 pt-1 border-t border-white/15">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shrink-0" />
                <span>Tahun Akademik {data.activePeriode.tahun}</span>
              </div>
            </div>
          ) : undefined
        }
      />

      {/* ── 2. Top 4 Stat Cards (Menggunakan Komponen Reusable StatCardMint) ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <StatCardMint
          value={data ? data.stats.totalPendaftaran : 0}
          label="Total Pendaftar"
          badge="Semua Berkas"
          subLabel="Seluruh pendaftar periode ini"
          icon={<Users className="w-4 h-4 sm:w-5 sm:h-5" />}
        />
        <StatCardMint
          value={data ? data.stats.menungguVerifikasi : 0}
          label="Menunggu Verifikasi"
          badge="Antrean"
          subLabel="Menunggu review staf"
          icon={<Clock className="w-4 h-4 sm:w-5 sm:h-5 text-[#FFE082]" />}
        />
        <StatCardMint
          value={data ? data.stats.verifikasiDokumen + data.stats.wawancaraCount : 0}
          label="Verifikasi Dokumen"
          badge="Tahap 2"
          subLabel="Lolos berkas / dalam proses"
          icon={<FileCheck className="w-4 h-4 sm:w-5 sm:h-5 text-cyan-200" />}
        />
        <StatCardMint
          value={data ? data.stats.lolosSeleksi : 0}
          label="Lolos Seleksi"
          badge="Lolos Akhir"
          subLabel="Ditetapkan lolos seleksi"
          icon={<Award className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-200" />}
        />
      </div>

      {/* ── 3. Middle Section: Tahapan Pendaftaran & Periode Aktif ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        {/* Panel Kiri: Tahapan Pendaftaran (Pipeline Stepper) */}
        <div className="lg:col-span-8 bg-gradient-to-br from-[#EAF5F0]/70 via-white to-[#F2F8F5] rounded-2xl sm:rounded-3xl border border-[#C0E6D8] p-6 sm:p-7 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between mb-6 sm:mb-8">
            <h3 className="text-sm sm:text-base font-black text-[#0E4A3E] uppercase tracking-wider font-archivo">
              TAHAPAN PENDAFTARAN
            </h3>
            <span className="text-[11px] font-bold text-[#0E4A3E] bg-[#C0E6D8]/50 border border-[#A7F3D0] px-3 py-1 rounded-full">
              Live Pipeline
            </span>
          </div>

          <PipelineStepper tahapan={data?.tahapan} />
        </div>

        {/* Panel Kanan: Periode Pendaftaran Aktif */}
        <div className="lg:col-span-4 bg-gradient-to-br from-[#EAF5F0]/70 via-white to-[#F2F8F5] rounded-2xl sm:rounded-3xl border border-[#C0E6D8] p-6 sm:p-7 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <h3 className="text-sm sm:text-base font-black text-[#0E4A3E] font-archivo">
                Periode Pendaftaran Aktif
              </h3>
              <div className="w-8 h-8 rounded-xl bg-[#0E4A3E] text-[#C0E6D8] flex items-center justify-center">
                <Calendar className="w-4 h-4" />
              </div>
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
              <span className="text-xs font-bold text-slate-600">
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
          className="!bg-gradient-to-br !from-[#EAF5F0]/70 !via-white !to-[#F2F8F5] !border-[#C0E6D8]"
        />

        {/* Panel Kanan: Pengumuman Terbaru */}
        <div className="bg-gradient-to-br from-[#EAF5F0]/70 via-white to-[#F2F8F5] rounded-2xl sm:rounded-3xl border border-[#C0E6D8] p-6 sm:p-7 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm sm:text-base font-black text-[#0E4A3E] font-archivo">
              Pengumuman Terbaru
            </h3>
            <Link
              href="/admin/pengumuman"
              className="text-xs text-[#0E4A3E] hover:text-[#0E4A3E]/80 font-bold transition-colors flex items-center gap-0.5 bg-white px-2.5 py-1 rounded-full border border-[#C0E6D8]"
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
