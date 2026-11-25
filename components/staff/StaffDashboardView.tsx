'use client';

import React from 'react';
import Link from 'next/link';
import {
  Users,
  Clock,
  FileCheck,
  Award,
  CheckCircle2,
  ChevronRight,
  ArrowRight,
  ShieldCheck,
  Sparkles,
  RefreshCw,
} from 'lucide-react';
import { HeroBanner, HeroAsideCard, StatusBadge } from '@/components/ui';

export interface StaffStats {
  totalPendaftar: number;
  menungguVerifikasi: number;
  verifikasiDokumen: number;
  lolosSeleksi: number;
  progressPercent: number;
}

export interface RecentApplicant {
  id_pendaftaran: number;
  nama: string;
  nim: string;
  prodi: string;
  fakultas: string;
  status: string;
  tanggal_daftar: string;
}

export interface StaffDashboardViewProps {
  userName: string;
  stats: StaffStats;
  recentApplicants: RecentApplicant[];
  activePeriode: { id_periode: number; nama_periode: string; tahun: number } | null;
  isLoading: boolean;
}

export default function StaffDashboardView({
  userName,
  stats,
  recentApplicants,
  activePeriode,
  isLoading,
}: StaffDashboardViewProps) {
  return (
    <div className="kkn-page-container font-sans">
      <HeroBanner
        badgeIcon={<ShieldCheck className="w-3.5 h-3.5" />}
        badgeText="Portal Resmi Staff Penilai LP2M"
        title={
          <>
            Selamat Datang, <span className="text-[#C0E6D8]">{userName}</span>! 👋
          </>
        }
        description="Kelola proses verifikasi dokumen administrasi, penilaian berkas persyaratan, serta pantau progres seleksi KKN Internasional secara real-time."
        aside={
          activePeriode ? (
            <HeroAsideCard
              label="Periode Penilaian Aktif"
              title={activePeriode.nama_periode}
              subtitle={`Tahun Akademik ${activePeriode.tahun}`}
              className="min-w-[240px]"
            />
          ) : undefined
        }
      />

      {isLoading ? (
        <div className="py-16 flex flex-col items-center justify-center text-slate-400 gap-2">
          <RefreshCw className="w-6 h-6 animate-spin text-[#0E4A3E]" />
          <span className="text-xs font-semibold">Memuat data dashboard staf...</span>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            <div className="bg-gradient-to-br from-[#EAF5F0] to-white rounded-2xl p-4 sm:p-5 border border-[#C0E6D8] shadow-xs hover:shadow-md transition-all flex flex-col justify-between gap-3 group">
              <div className="flex items-center justify-between">
                <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-[#0E4A3E] text-[#C0E6D8] flex items-center justify-center shrink-0 shadow-xs group-hover:scale-105 transition-transform">
                  <Users className="w-4 h-4 sm:w-5 sm:h-5" />
                </div>
                <span className="text-[10px] text-[#0E4A3E] font-bold uppercase tracking-wider hidden sm:inline px-2 py-0.5 rounded-full bg-white border border-[#C0E6D8]">
                  Semua Berkas
                </span>
              </div>
              <div>
                <span className="text-[11px] sm:text-xs font-semibold text-slate-600 block mb-0.5">
                  Total Pendaftar
                </span>
                <span className="text-2xl sm:text-3xl font-archivo font-extrabold text-[#0E4A3E] tracking-tight block">
                  {stats.totalPendaftar}
                </span>
                <p className="text-[11px] text-slate-500 mt-1 leading-tight line-clamp-1">
                  Seluruh pendaftar periode ini
                </p>
              </div>
            </div>

            <div className="bg-gradient-to-br from-[#FFF9E6] to-white rounded-2xl p-4 sm:p-5 border border-[#FFE082] shadow-xs hover:shadow-md transition-all flex flex-col justify-between gap-3 group">
              <div className="flex items-center justify-between">
                <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-amber-600 text-amber-100 flex items-center justify-center shrink-0 shadow-xs group-hover:scale-105 transition-transform">
                  <Clock className="w-4 h-4 sm:w-5 sm:h-5" />
                </div>
                <span className="text-[10px] text-amber-800 font-bold uppercase tracking-wider hidden sm:inline px-2 py-0.5 rounded-full bg-white border border-amber-200">
                  Antrean
                </span>
              </div>
              <div>
                <span className="text-[11px] sm:text-xs font-semibold text-slate-600 block mb-0.5">
                  Menunggu Verifikasi
                </span>
                <span className="text-2xl sm:text-3xl font-archivo font-extrabold text-amber-700 tracking-tight block">
                  {stats.menungguVerifikasi}
                </span>
                <p className="text-[11px] text-slate-500 mt-1 leading-tight line-clamp-1">
                  Menunggu review staf
                </p>
              </div>
            </div>

            <div className="bg-gradient-to-br from-[#E6F4F1] to-white rounded-2xl p-4 sm:p-5 border border-[#BDE3DB] shadow-xs hover:shadow-md transition-all flex flex-col justify-between gap-3 group">
              <div className="flex items-center justify-between">
                <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-[#0E4A3E] text-cyan-200 flex items-center justify-center shrink-0 shadow-xs group-hover:scale-105 transition-transform">
                  <FileCheck className="w-4 h-4 sm:w-5 sm:h-5" />
                </div>
                <span className="text-[10px] text-teal-800 font-bold uppercase tracking-wider hidden sm:inline px-2 py-0.5 rounded-full bg-white border border-[#BDE3DB]">
                  Tahap 2
                </span>
              </div>
              <div>
                <span className="text-[11px] sm:text-xs font-semibold text-slate-600 block mb-0.5">
                  Menunggu Wawancara
                </span>
                <span className="text-2xl sm:text-3xl font-archivo font-extrabold text-teal-800 tracking-tight block">
                  {stats.verifikasiDokumen}
                </span>
                <p className="text-[11px] text-slate-500 mt-1 leading-tight line-clamp-1">
                  Lolos berkas, siap wawancara
                </p>
              </div>
            </div>

            <div className="bg-gradient-to-br from-[#EAF7EE] to-white rounded-2xl p-4 sm:p-5 border border-[#C3E8CC] shadow-xs hover:shadow-md transition-all flex flex-col justify-between gap-3 group">
              <div className="flex items-center justify-between">
                <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-[#0E4A3E] text-emerald-200 flex items-center justify-center shrink-0 shadow-xs group-hover:scale-105 transition-transform">
                  <Award className="w-4 h-4 sm:w-5 sm:h-5" />
                </div>
                <span className="text-[10px] text-emerald-800 font-bold uppercase tracking-wider hidden sm:inline px-2 py-0.5 rounded-full bg-white border border-[#C3E8CC]">
                  Lolos Akhir
                </span>
              </div>
              <div>
                <span className="text-[11px] sm:text-xs font-semibold text-slate-600 block mb-0.5">
                  Lolos Seleksi
                </span>
                <span className="text-2xl sm:text-3xl font-archivo font-extrabold text-emerald-800 tracking-tight block">
                  {stats.lolosSeleksi}
                </span>
                <p className="text-[11px] text-slate-500 mt-1 leading-tight line-clamp-1">
                  Dinyatakan lolos utama
                </p>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-[#EAF5F0]/60 via-white to-[#F2F8F5] rounded-2xl sm:rounded-3xl border border-[#C0E6D8] p-5 sm:p-6 shadow-xs space-y-3">
            <div className="flex items-center justify-between text-xs sm:text-sm font-bold">
              <span className="flex items-center gap-2 text-[#0E4A3E] uppercase tracking-wide font-archivo text-xs">
                <Sparkles className="w-4 h-4 text-emerald-600" />
                Status Proses Verifikasi Pendaftaran
              </span>
              <span className="text-sm font-black text-[#0E4A3E]">
                {stats.progressPercent}%
              </span>
            </div>

            <div className="w-full h-3 bg-slate-200/80 rounded-full overflow-hidden p-0.5 border border-slate-300/50">
              <div
                className="h-full rounded-full transition-all duration-500 bg-gradient-to-r from-[#0E4A3E] to-emerald-500 shadow-2xs"
                style={{ width: `${stats.progressPercent}%` }}
              />
            </div>

            <p className="text-[11px] text-slate-500 font-medium">
              Proses verifikasi berkas administrasi dan evaluasi dokumen peserta sedang berjalan sesuai jadwal resmi LP2M.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 sm:gap-6">
            <div className="bg-gradient-to-br from-white to-[#F2F8F5] rounded-2xl sm:rounded-3xl border border-[#C0E6D8] p-6 shadow-xs space-y-5">
              <div className="flex items-center justify-between border-b border-[#C0E6D8]/60 pb-3">
                <h3 className="font-bold font-archivo text-sm sm:text-base text-[#0E4A3E] uppercase tracking-wide">
                  Alur Tahapan Verifikasi
                </h3>
                <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-[#EAF5F0] text-[#0E4A3E] border border-[#C0E6D8]">
                  SOP LP2M
                </span>
              </div>

              <div className="relative pl-7 space-y-7 before:absolute before:left-3 before:top-2 before:bottom-2 before:w-0.5 before:bg-[#C0E6D8]">
                <div className="relative flex items-center justify-between gap-3">
                  <div className="absolute -left-7 w-6 h-6 rounded-full bg-[#0E4A3E] text-[#C0E6D8] flex items-center justify-center text-xs font-bold shadow-xs">
                    <CheckCircle2 className="w-4 h-4 text-[#C0E6D8]" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-800 leading-snug">Penerimaan Berkas Pendaftaran</p>
                    <p className="text-xs text-slate-500">Tahap unggah formulir &amp; dokumen persyaratan</p>
                  </div>
                  <span className="text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300 shrink-0">
                    Selesai
                  </span>
                </div>

                <div className="relative flex items-center justify-between gap-3">
                  <div className="absolute -left-7 w-6 h-6 rounded-full bg-[#0E4A3E] text-white flex items-center justify-center text-xs font-bold shadow-xs ring-4 ring-[#C0E6D8]/60 animate-pulse">
                    2
                  </div>
                  <div>
                    <p className="text-sm font-bold text-[#0E4A3E] leading-snug">Verifikasi Dokumen oleh Staff</p>
                    <p className="text-xs text-slate-500">Pemeriksaan keabsahan berkas &amp; portofolio</p>
                  </div>
                  <span className="text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-300 shrink-0">
                    Sedang Proses
                  </span>
                </div>

                <div className="relative flex items-center justify-between gap-3">
                  <div className="absolute -left-7 w-6 h-6 rounded-full bg-white border-2 border-slate-300 text-slate-400 flex items-center justify-center text-xs font-bold">
                    3
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-600 leading-snug">Pelaksanaan Seleksi Wawancara</p>
                    <p className="text-xs text-slate-400">Penilaian kompetensi bahasa &amp; komitmen</p>
                  </div>
                  <span className="text-[10px] font-semibold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-500 border border-slate-200 shrink-0">
                    Dalam Antrean
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-white to-[#F2F8F5] rounded-2xl sm:rounded-3xl border border-[#C0E6D8] p-6 shadow-xs flex flex-col justify-between space-y-4">
              <div>
                <div className="flex items-center justify-between border-b border-[#C0E6D8]/60 pb-3 mb-3">
                  <h3 className="font-bold font-archivo text-sm sm:text-base text-[#0E4A3E] uppercase tracking-wide">
                    Pendaftar Terbaru
                  </h3>
                  <Link
                    href="/staff/pendaftar"
                    className="text-xs font-bold text-[#0E4A3E] hover:underline flex items-center gap-1"
                  >
                    <span>Lihat Semua</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </Link>
                </div>

                <div className="divide-y divide-slate-100">
                  {recentApplicants.length === 0 ? (
                    <p className="text-xs text-slate-400 py-6 text-center">Belum ada pendaftar terbaru</p>
                  ) : (
                    recentApplicants.slice(0, 4).map((app) => (
                      <div key={app.id_pendaftaran} className="py-2.5 flex items-center justify-between gap-3">
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-9 h-9 rounded-xl bg-[#EAF5F0] text-[#0E4A3E] border border-[#C0E6D8] flex items-center justify-center font-bold text-xs shrink-0 shadow-2xs">
                            {app.nama.charAt(0)}
                          </div>
                          <div className="min-w-0">
                            <p className="text-xs sm:text-sm font-bold text-slate-800 leading-snug truncate">
                              {app.nama}
                            </p>
                            <p className="text-[11px] text-slate-500 truncate">
                              {app.nim} • {app.prodi}
                            </p>
                          </div>
                        </div>
                        <div className="shrink-0">
                          <StatusBadge status={app.status} />
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              <Link
                href="/staff/verifikasi"
                className="w-full py-2.5 rounded-full bg-[#0E4A3E] hover:bg-[#09352c] text-white text-xs font-bold text-center shadow-xs hover:shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer mt-2"
              >
                <span>Mulai Verifikasi Berkas</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
