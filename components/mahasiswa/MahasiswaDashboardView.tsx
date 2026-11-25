'use client';

import React from 'react';
import Link from 'next/link';
import {
  Download,
  RefreshCw,
  Printer,
  FileText,
  ShieldCheck,
  Award,
  CheckCircle2,
  AlertCircle,
  GraduationCap,
  FileDown,
  Sparkles,
} from 'lucide-react';
import { HeroBanner, StageStepper } from '@/components/ui';

export interface MahasiswaDashboardData {
  hasPendaftaran: boolean;
  id_pendaftaran?: number;
  statusPendaftaran: string | null;
  statusDokumen: string | null;
  statusSeleksi: string | null;
  catatanRevisi: string | null;
  currentStage: number;
  negaraTujuan?: string | null;
  suratTemplates?: { id: number; nama: string; file_path: string }[];
}

export interface TemplateCardItem {
  id: number;
  label: string;
  desc: string;
  file_path: string;
}

export interface MahasiswaDashboardViewProps {
  displayName: string;
  isLoading: boolean;
  dashData: MahasiswaDashboardData;
  stages: { label: string }[];
  templateCards: TemplateCardItem[];
}

export default function MahasiswaDashboardView({
  displayName,
  isLoading,
  dashData,
  stages,
  templateCards,
}: MahasiswaDashboardViewProps) {
  return (
    <div className="kkn-page-container font-sans">
      <HeroBanner
        badgeIcon={<GraduationCap className="w-3.5 h-3.5" />}
        badgeText="Portal Resmi Mahasiswa KKN Internasional"
        title={
          <>
            Selamat Datang, <span className="text-[#C0E6D8]">{displayName}</span>! 👋
          </>
        }
        description="Pantau status verifikasi berkas, tahapan seleksi, dan informasi pengumuman kelulusan KKN Internasional secara real-time di sini."
        aside={
          <div className="shrink-0 flex items-center gap-3 bg-black/20 backdrop-blur-md px-4 py-2.5 rounded-2xl border border-white/15 self-start md:self-auto">
            <div className="w-3 h-3 rounded-full bg-emerald-400 animate-pulse shrink-0" />
            <div className="text-xs">
              <span className="text-emerald-200/80 text-[10px] uppercase font-bold tracking-wider block">
                Status Kelulusan
              </span>
              <span className="font-extrabold text-white text-xs sm:text-sm">
                {dashData.statusSeleksi === 'Lolos'
                  ? '🎉 Dinyatakan Lolos'
                  : dashData.statusPendaftaran || 'Proses Pendaftaran'}
              </span>
            </div>
          </div>
        }
      />

      {isLoading ? (
        <div className="py-16 flex flex-col items-center justify-center text-slate-400 gap-2">
          <RefreshCw className="w-6 h-6 animate-spin text-[#0E4A3E]" />
          <span className="text-xs font-semibold">Memuat data dashboard...</span>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            <div className="bg-gradient-to-br from-[#EAF5F0] to-white rounded-2xl p-4 sm:p-5 border border-[#C0E6D8] shadow-xs hover:shadow-md transition-all flex flex-col justify-between gap-3 group">
              <div className="flex items-center justify-between">
                <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-[#0E4A3E] text-[#C0E6D8] flex items-center justify-center shrink-0 shadow-xs group-hover:scale-105 transition-transform">
                  <FileText className="w-4 h-4 sm:w-5 sm:h-5" />
                </div>
                <span className="text-[10px] text-[#0E4A3E] font-bold uppercase tracking-wider hidden sm:inline px-2 py-0.5 rounded-full bg-white border border-[#C0E6D8]">
                  Step 01
                </span>
              </div>
              <div>
                <span className="text-[11px] sm:text-xs font-semibold text-slate-600 block mb-1">
                  Pendaftaran
                </span>
                <div>
                  <span
                    className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs sm:text-sm font-extrabold ${
                      dashData.statusPendaftaran === 'Lolos' ||
                      dashData.statusPendaftaran === 'Terverifikasi'
                        ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                        : dashData.statusPendaftaran === 'Draft'
                        ? 'bg-slate-100 text-slate-700'
                        : 'bg-white text-[#0E4A3E] border border-[#C0E6D8]'
                    }`}
                  >
                    {dashData.statusPendaftaran === 'Lolos' ? (
                      <CheckCircle2 className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                    ) : null}
                    {dashData.statusPendaftaran || 'Belum Mendaftar'}
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 mt-1.5 leading-tight line-clamp-1">
                  {dashData.hasPendaftaran ? 'Formulir terkirim' : 'Belum mengirim formulir'}
                </p>
              </div>
            </div>

            <div className="bg-gradient-to-br from-[#E6F4F1] to-white rounded-2xl p-4 sm:p-5 border border-[#BDE3DB] shadow-xs hover:shadow-md transition-all flex flex-col justify-between gap-3 group">
              <div className="flex items-center justify-between">
                <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-[#0E4A3E] text-cyan-200 flex items-center justify-center shrink-0 shadow-xs group-hover:scale-105 transition-transform">
                  <ShieldCheck className="w-4 h-4 sm:w-5 sm:h-5" />
                </div>
                <span className="text-[10px] text-teal-800 font-bold uppercase tracking-wider hidden sm:inline px-2 py-0.5 rounded-full bg-white border border-[#BDE3DB]">
                  Step 02
                </span>
              </div>
              <div>
                <span className="text-[11px] sm:text-xs font-semibold text-slate-600 block mb-1">
                  Verifikasi Dokumen
                </span>
                <div>
                  <span
                    className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs sm:text-sm font-extrabold ${
                      dashData.statusDokumen === 'Terverifikasi'
                        ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                        : dashData.statusDokumen === 'Perlu Revisi'
                        ? 'bg-red-50 text-red-700 border border-red-200'
                        : 'bg-white text-slate-700 border border-[#BDE3DB]'
                    }`}
                  >
                    {dashData.statusDokumen === 'Terverifikasi' ? (
                      <CheckCircle2 className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                    ) : null}
                    {dashData.statusDokumen || 'Menunggu'}
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 mt-1.5 leading-tight line-clamp-1">
                  {dashData.statusDokumen === 'Terverifikasi'
                    ? 'Semua berkas valid'
                    : dashData.statusDokumen === 'Perlu Revisi'
                    ? 'Ada dokumen perbaikan'
                    : 'Pemeriksaan berkas'}
                </p>
              </div>
            </div>

            <div className="bg-gradient-to-br from-[#EAF7EE] to-white rounded-2xl p-4 sm:p-5 border border-[#C3E8CC] shadow-xs hover:shadow-md transition-all flex flex-col justify-between gap-3 group">
              <div className="flex items-center justify-between">
                <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-[#0E4A3E] text-emerald-200 flex items-center justify-center shrink-0 shadow-xs group-hover:scale-105 transition-transform">
                  <Award className="w-4 h-4 sm:w-5 sm:h-5" />
                </div>
                <span className="text-[10px] text-emerald-800 font-bold uppercase tracking-wider hidden sm:inline px-2 py-0.5 rounded-full bg-white border border-[#C3E8CC]">
                  Step 03
                </span>
              </div>
              <div>
                <span className="text-[11px] sm:text-xs font-semibold text-slate-600 block mb-1">
                  Hasil Seleksi
                </span>
                <div>
                  <span
                    className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs sm:text-sm font-extrabold ${
                      dashData.statusSeleksi === 'Lolos'
                        ? 'bg-[#0E4A3E] text-[#C0E6D8] shadow-xs'
                        : dashData.statusSeleksi === 'Tidak Lolos'
                        ? 'bg-red-50 text-red-700 border border-red-200'
                        : 'bg-amber-50 text-amber-700 border border-amber-200'
                    }`}
                  >
                    {dashData.statusSeleksi === 'Lolos' ? (
                      <Sparkles className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-amber-300" />
                    ) : null}
                    {dashData.statusSeleksi || 'Proses'}
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 mt-1.5 leading-tight line-clamp-1">
                  {dashData.statusSeleksi === 'Lolos'
                    ? 'Lolos seleksi resmi'
                    : 'Menunggu pengumuman'}
                </p>
              </div>
            </div>

            <div className="bg-gradient-to-br from-[#F5F8F7] to-white rounded-2xl p-4 sm:p-5 border border-[#D5E5DE] shadow-xs hover:shadow-md transition-all flex flex-col justify-between gap-3 group">
              <div className="flex items-center justify-between">
                <div
                  className={`w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center shrink-0 shadow-xs group-hover:scale-105 transition-transform ${
                    dashData.catatanRevisi
                      ? 'bg-red-500 text-white'
                      : 'bg-[#0E4A3E] text-[#C0E6D8]'
                  }`}
                >
                  {dashData.catatanRevisi ? (
                    <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5" />
                  ) : (
                    <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5" />
                  )}
                </div>
                <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider hidden sm:inline px-2 py-0.5 rounded-full bg-white border border-[#D5E5DE]">
                  Info
                </span>
              </div>
              <div>
                <span className="text-[11px] sm:text-xs font-semibold text-slate-600 block mb-1">
                  Catatan Panitia
                </span>
                <div>
                  <span
                    className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs sm:text-sm font-extrabold ${
                      dashData.catatanRevisi
                        ? 'bg-red-50 text-red-700 border border-red-200'
                        : 'bg-white text-slate-700 border border-[#D5E5DE]'
                    }`}
                  >
                    {dashData.catatanRevisi ? 'Perlu Revisi' : 'Tidak Ada'}
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 mt-1.5 leading-tight line-clamp-1">
                  {dashData.catatanRevisi ? 'Periksa catatan perbaikan' : 'Semua berkas aman'}
                </p>
              </div>
            </div>
          </div>

          {dashData.statusSeleksi === 'Lolos' && (
            <div className="flex flex-col sm:flex-row sm:items-center justify-between bg-gradient-to-r from-[#0E4A3E] to-[#156050] rounded-2xl p-4 sm:p-6 text-white shadow-sm gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-400/20 text-emerald-300 text-[11px] font-bold uppercase tracking-wider border border-emerald-400/30">
                    <Sparkles className="w-3 h-3" />
                    Dokumen Resmi
                  </span>
                </div>
                <h3 className="text-sm sm:text-base md:text-lg font-bold font-archivo">
                  Surat Keputusan (SK) Kelulusan Peserta KKN Internasional
                </h3>
                <p className="text-xs text-emerald-100/90 max-w-xl leading-relaxed">
                  Selamat atas kelulusan Anda! Unduh dan cetak Surat Keputusan resmi kelulusan untuk kelengkapan administrasi Anda.
                </p>
              </div>
              <div className="shrink-0">
                <Link
                  href="/mahasiswa/hasil_seleksi"
                  className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-white text-[#0E4A3E] hover:bg-emerald-50 rounded-xl text-xs sm:text-sm font-extrabold shadow-sm transition-all hover:scale-102 active:scale-98 w-full sm:w-auto"
                >
                  <Printer className="w-4 h-4" />
                  <span>Lihat &amp; Cetak SK</span>
                </Link>
              </div>
            </div>
          )}

          <div className="bg-gradient-to-br from-white to-[#F2F8F5] rounded-2xl border border-[#C0E6D8] shadow-xs p-5 sm:p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-[#C0E6D8]/60 pb-3">
              <div>
                <h2 className="text-xs sm:text-sm font-black text-[#0E4A3E] uppercase tracking-wider font-archivo">
                  Tahapan Pendaftaran &amp; Seleksi
                </h2>
                <p className="text-[11px] sm:text-xs text-slate-500">
                  Pantau alur tahapan seleksi Anda dari pendaftaran awal hingga pengumuman
                </p>
              </div>
            </div>

            <div className="overflow-x-auto pb-2">
              <div className="min-w-[580px] sm:min-w-0">
                <StageStepper stages={stages} currentStage={dashData.currentStage} />
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
              <div>
                <h2 className="text-xs sm:text-sm font-black text-[#0E4A3E] uppercase tracking-wider font-archivo">
                  Template Dokumen &amp; Format Berkas
                </h2>
                <p className="text-[11px] sm:text-xs text-slate-500">
                  Unduh format template resmi yang disiapkan panitia untuk kelengkapan pendaftaran Anda
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              {templateCards.map((card, i) => (
                <div
                  key={card.id ?? i}
                  className="bg-gradient-to-br from-[#F4FAF7] to-white hover:from-[#EAF5F0] hover:to-white border border-[#C0E6D8] rounded-2xl p-4 flex items-center justify-between gap-3 shadow-xs hover:shadow-sm transition-all group"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-[#0E4A3E] shrink-0 group-hover:scale-105 transition-transform">
                      <FileDown className="w-5 h-5 text-[#0E4A3E]" />
                    </div>
                    <div className="min-w-0">
                      <h3 className="text-xs sm:text-sm font-bold text-slate-800 group-hover:text-[#0E4A3E] transition-colors truncate">
                        {card.label}
                      </h3>
                      <p className="text-[11px] text-slate-500 truncate mt-0.5">{card.desc}</p>
                    </div>
                  </div>

                  {card.file_path ? (
                    <a
                      href={card.file_path}
                      download
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#0E4A3E] hover:bg-[#09372e] text-white rounded-xl text-xs font-bold transition-all shadow-2xs shrink-0 cursor-pointer"
                      title="Unduh Berkas Template"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">Unduh</span>
                    </a>
                  ) : (
                    <button
                      onClick={() => alert('Template berkas ini belum diunggah panitia.')}
                      className="text-slate-400 hover:text-slate-600 transition-colors shrink-0 p-1.5 cursor-not-allowed"
                      title="Belum Tersedia"
                    >
                      <Download className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
