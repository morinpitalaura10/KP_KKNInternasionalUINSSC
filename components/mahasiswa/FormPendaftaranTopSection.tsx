'use client';

import React from 'react';
import Link from 'next/link';
import {
  FileText,
  Lock,
  Award,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Check,
} from 'lucide-react';
import { HeroBanner, AlertBanner } from '@/components/ui';

export interface FormPendaftaranClosedViewProps {
  closedMessage: string;
}

export function FormPendaftaranClosedView({ closedMessage }: FormPendaftaranClosedViewProps) {
  return (
    <div className="kkn-page-container font-sans">
      <HeroBanner
        badgeIcon={<Lock className="w-3.5 h-3.5 text-[#C0E6D8]" />}
        badgeText="Pendaftaran KKN Internasional"
        title="Formulir Pendaftaran"
        description="Lengkapi data pendaftaran Anda dengan cermat sesuai dokumen resmi."
      />

      <div className="bg-white rounded-2xl border-2 border-red-200 shadow-xs p-8 sm:p-10 text-center max-w-2xl mx-auto my-8 space-y-5">
        <div className="w-16 h-16 rounded-2xl bg-red-50 border border-red-200 text-red-600 flex items-center justify-center mx-auto shadow-2xs">
          <Lock className="w-8 h-8" />
        </div>
        <div className="space-y-2">
          <span className="inline-flex items-center gap-1.5 text-[11px] font-extrabold uppercase tracking-wider text-red-700 bg-red-50 border border-red-200 px-3 py-1 rounded-full">
            Pendaftaran Ditutup
          </span>
          <h3 className="text-xl font-extrabold text-slate-900">
            Tidak Ada Periode Pendaftaran yang Aktif
          </h3>
          <p className="text-sm text-slate-600 leading-relaxed">
            {closedMessage ||
              'Saat ini tidak ada gelombang pendaftaran KKN Internasional yang berstatus Aktif atau jadwal pendaftaran telah berakhir. Formulir pendaftaran baru dapat diakses kembali apabila Admin LP2M telah membuka periode/gelombang pendaftaran berikutnya.'}
          </p>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
          <Link
            href="/mahasiswa/informasi"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#0E4A3E] hover:bg-[#08362d] text-white rounded-full text-xs font-bold transition-all shadow-xs"
          >
            <FileText className="w-4 h-4" />
            Lihat Informasi &amp; Jadwal Periode
          </Link>
          <Link
            href="/mahasiswa/status_pendaftaran"
            className="inline-flex items-center gap-2 px-5 py-2.5 border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-full text-xs font-bold transition-colors"
          >
            Lihat Status Pendaftaran
          </Link>
        </div>
      </div>
    </div>
  );
}

export interface FormPendaftaranTopSectionProps {
  activePeriodeInfo: { nama_periode: string; tahun: number } | null;
  isUploadWindowOpen: boolean;
  uploadWindowMessage: string;
  isHasilPublished: boolean;
  statusMessage: { type: 'success' | 'error'; text: string } | null;
  onCloseStatusMessage: () => void;
  isEligibleToSubmit: boolean;
  isProdiValid: boolean;
  isMahasiswaAktif: boolean;
  isSemesterValid: boolean;
  isIpkValid: boolean;
  minSemReq: number;
  maxSemReq: number;
  minIpkReq: number;
  allowedProdiNames: string;
  prodi: string;
  semester: number;
  ipk: number | null;
  formSteps: string[];
  activeStep: number;
  onSelectStep: (step: number) => void;
}

export default function FormPendaftaranTopSection({
  activePeriodeInfo,
  isUploadWindowOpen,
  uploadWindowMessage,
  isHasilPublished,
  statusMessage,
  onCloseStatusMessage,
  isEligibleToSubmit,
  isProdiValid,
  isMahasiswaAktif,
  isSemesterValid,
  isIpkValid,
  minSemReq,
  maxSemReq,
  minIpkReq,
  allowedProdiNames,
  prodi,
  semester,
  ipk,
  formSteps,
  activeStep,
  onSelectStep,
}: FormPendaftaranTopSectionProps) {
  return (
    <>
      <HeroBanner
        badgeIcon={<FileText className="w-3.5 h-3.5 text-[#C0E6D8]" />}
        badgeText="Formulir Pendaftaran & Berkas Resmi"
        title="Formulir Pendaftaran"
        description="Lengkapi data pendaftaran Anda dengan cermat sesuai dokumen resmi sebelum jadwal pendaftaran berakhir."
        aside={
          activePeriodeInfo ? (
            <div className="kkn-hero-aside-card space-y-2 min-w-[240px] self-start md:self-auto">
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#C0E6D8] block">
                Periode Pendaftaran
              </span>
              <p className="font-extrabold text-base sm:text-lg leading-tight">
                {activePeriodeInfo.nama_periode}
              </p>
              <div className="flex items-center gap-2 text-xs text-emerald-100/90 pt-1 border-t border-white/15">
                <span
                  className={`w-2 h-2 rounded-full ${
                    isUploadWindowOpen ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'
                  }`}
                />
                <span>
                  {isUploadWindowOpen
                    ? `Tahun Akademik ${activePeriodeInfo.tahun}`
                    : 'Formulir Dikunci'}
                </span>
              </div>
            </div>
          ) : undefined
        }
      />

      <AlertBanner message={statusMessage} onClose={onCloseStatusMessage} />

      {!isUploadWindowOpen && uploadWindowMessage && (
        <div
          className={`rounded-2xl sm:rounded-3xl p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border shadow-xs transition-all ${
            isHasilPublished
              ? 'bg-gradient-to-br from-[#EAF5F0] via-white to-[#F2F8F5] border-[#C0E6D8]'
              : 'bg-gradient-to-br from-red-50 to-white border-red-200'
          }`}
        >
          <div className="flex items-start gap-3.5 flex-1">
            <div
              className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 shadow-xs ${
                isHasilPublished
                  ? 'bg-[#0E4A3E] text-[#C0E6D8]'
                  : 'bg-red-600 text-white'
              }`}
            >
              <Lock className="w-5 h-5" />
            </div>
            <div className="space-y-1 flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h4
                  className={`font-black text-sm sm:text-base ${
                    isHasilPublished ? 'text-[#0E4A3E]' : 'text-red-950'
                  }`}
                >
                  {isHasilPublished
                    ? 'Formulir Pendaftaran Terkunci — Hasil Seleksi Telah Dipublikasikan'
                    : 'Jadwal Pendaftaran Ditutup'}
                </h4>
                <span
                  className={`text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full border ${
                    isHasilPublished
                      ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                      : 'bg-red-100 text-red-800 border-red-200'
                  }`}
                >
                  {isHasilPublished ? 'Hasil Seleksi Terbit' : 'Arsip Mode'}
                </span>
              </div>
              <p
                className={`text-xs leading-relaxed ${
                  isHasilPublished ? 'text-slate-600 font-medium' : 'text-red-800'
                }`}
              >
                {uploadWindowMessage}
              </p>
            </div>
          </div>
          {isHasilPublished && (
            <Link
              href="/mahasiswa/hasil_seleksi"
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-[#0E4A3E] hover:bg-[#08362d] text-white rounded-full text-xs font-bold transition-all shadow-xs hover:shadow-md shrink-0 cursor-pointer"
            >
              <Award className="w-4 h-4 text-[#C0E6D8]" />
              <span>Lihat Hasil Seleksi &amp; SK</span>
            </Link>
          )}
        </div>
      )}

      {isUploadWindowOpen && (
        !isEligibleToSubmit ? (
          <div className="bg-gradient-to-br from-amber-50 to-white border border-amber-300 rounded-2xl p-4 sm:p-5 flex items-start gap-3.5 mb-6 text-amber-950 shadow-xs">
            <AlertTriangle className="w-6 h-6 text-amber-600 shrink-0 mt-0.5" />
            <div className="space-y-1.5 flex-1">
              <h4 className="font-extrabold text-sm sm:text-base text-amber-900 leading-tight">
                {!isProdiValid
                  ? 'Program Studi Tidak Dibuka untuk Periode Ini'
                  : 'Persyaratan Akademik Belum Terpenuhi'}
              </h4>
              <p className="text-xs text-amber-800">
                {!isProdiValid
                  ? `Pendaftaran KKN Internasional periode aktif ini tidak dibuka untuk program studi ${prodi || 'Anda'}. Hanya dibuka khusus untuk: ${allowedProdiNames}.`
                  : 'Sesuai ketentuan LP2M, pendaftaran resmi KKN Internasional hanya dapat diajukan oleh mahasiswa yang memenuhi kriteria berikut:'}
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 pt-1">
                <div
                  className={`p-2.5 rounded-xl border text-xs font-bold flex items-center gap-2 ${
                    isMahasiswaAktif
                      ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                      : 'bg-red-50 border-red-200 text-red-800'
                  }`}
                >
                  {isMahasiswaAktif ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  ) : (
                    <XCircle className="w-4 h-4 text-red-600 shrink-0" />
                  )}
                  <span>Mahasiswa Aktif</span>
                </div>

                <div
                  className={`p-2.5 rounded-xl border text-xs font-bold flex items-center gap-2 ${
                    isSemesterValid
                      ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                      : 'bg-red-50 border-red-200 text-red-800'
                  }`}
                >
                  {isSemesterValid ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  ) : (
                    <XCircle className="w-4 h-4 text-red-600 shrink-0" />
                  )}
                  <span>
                    Semester {minSemReq}–{maxSemReq} (Anda: Smt {semester})
                  </span>
                </div>

                <div
                  className={`p-2.5 rounded-xl border text-xs font-bold flex items-center gap-2 ${
                    isIpkValid
                      ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                      : 'bg-red-50 border-red-200 text-red-800'
                  }`}
                >
                  {isIpkValid ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  ) : (
                    <XCircle className="w-4 h-4 text-red-600 shrink-0" />
                  )}
                  <span>
                    IPK Min. {minIpkReq.toFixed(2)} (Anda: {ipk ? ipk.toFixed(2) : '0.00'})
                  </span>
                </div>

                <div
                  className={`p-2.5 rounded-xl border text-xs font-bold flex items-center gap-2 ${
                    isProdiValid
                      ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                      : 'bg-red-50 border-red-200 text-red-800'
                  }`}
                >
                  {isProdiValid ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  ) : (
                    <XCircle className="w-4 h-4 text-red-600 shrink-0" />
                  )}
                  <span
                    className="truncate"
                    title={
                      isProdiValid
                        ? `Prodi Dibuka: ${prodi}`
                        : `Prodi ${prodi} Tidak Dibuka (Hanya dibuka: ${allowedProdiNames})`
                    }
                  >
                    {isProdiValid ? `Prodi Dibuka: ${prodi}` : `Prodi Tidak Dibuka: ${prodi}`}
                  </span>
                </div>
              </div>
              <p className="text-[11px] font-bold text-amber-900 bg-amber-100/70 px-3 py-1.5 rounded-lg border border-amber-200 mt-2">
                {!isProdiValid
                  ? `⚠ Karena Program Studi ${prodi} tidak termasuk dalam jurusan yang dibuka untuk periode ini, Anda hanya dapat menyimpan data sebagai Draft. Tombol "Kirim Pendaftaran" dinonaktifkan.`
                  : '⚠ Karena kriteria akademik belum memenuhi, Anda hanya dapat menyimpan data sebagai Draft. Tombol "Kirim Pendaftaran" dinonaktifkan.'}
              </p>
            </div>
          </div>
        ) : (
          <div className="bg-gradient-to-br from-[#EAF5F0] to-white border border-[#C0E6D8] rounded-2xl p-3.5 mb-6 flex items-center gap-3 text-xs font-semibold text-slate-700 shadow-xs">
            <div className="w-7 h-7 rounded-lg bg-[#0E4A3E] text-white flex items-center justify-center shrink-0">
              <Check className="w-4 h-4 stroke-[2.5]" />
            </div>
            <span>
              <strong className="text-[#0E4A3E]">Persyaratan Akademik Terpenuhi:</strong> Mahasiswa Aktif • Semester {semester} (Syarat: {minSemReq}–{maxSemReq}) • IPK {ipk ? ipk.toFixed(2) : '0.00'} (Min: {minIpkReq.toFixed(2)}) • Prodi {prodi} (Terbuka).
            </span>
          </div>
        )
      )}

      <div className="kkn-sticky-nav-docked">
        <div className="max-w-7xl mx-auto w-full">
          <div className="bg-gradient-to-br from-[#EAF5F0]/80 via-white to-[#F2F8F5] rounded-xl sm:rounded-2xl border border-[#C0E6D8] shadow-xs p-2.5 sm:p-3">
            <div className="block md:hidden space-y-2.5">
              <div className="flex items-center justify-between text-xs px-1">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#568E7D]">
                  Langkah {activeStep + 1} dari {formSteps.length}
                </span>
                <span className="font-extrabold text-[#0E4A3E] text-xs">
                  {formSteps[activeStep]}
                </span>
              </div>

              <div className="grid grid-cols-6 gap-1 h-1.5 px-0.5">
                {formSteps.map((_, i) => (
                  <div
                    key={i}
                    className={`h-full rounded-full transition-all duration-300 ${
                      i < activeStep
                        ? 'bg-[#0E4A3E]'
                        : i === activeStep
                        ? 'bg-emerald-500 shadow-2xs'
                        : 'bg-slate-200'
                    }`}
                  />
                ))}
              </div>

              <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5 px-0.5">
                {formSteps.map((step, i) => {
                  const isActive = i === activeStep;
                  const isPast = i < activeStep;
                  return (
                    <button
                      key={i}
                      type="button"
                      onClick={() => onSelectStep(i)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all shrink-0 cursor-pointer select-none ${
                        isActive
                          ? 'bg-[#0E4A3E] text-white shadow-xs'
                          : isPast
                          ? 'bg-[#EAF5F0] text-[#0E4A3E] border border-[#C0E6D8]'
                          : 'bg-white text-slate-500 border border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      <span
                        className={`w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-black shrink-0 ${
                          isActive
                            ? 'bg-white/20 text-white'
                            : isPast
                            ? 'bg-[#0E4A3E] text-white'
                            : 'bg-slate-200 text-slate-500'
                        }`}
                      >
                        {isPast ? <Check className="w-2.5 h-2.5 stroke-[3]" /> : i + 1}
                      </span>
                      <span>{step}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="hidden md:grid md:grid-cols-6 gap-1.5">
              {formSteps.map((step, i) => {
                const isActive = i === activeStep;
                const isPast = i < activeStep;

                return (
                  <button
                    key={i}
                    type="button"
                    onClick={() => onSelectStep(i)}
                    className={`group flex items-center gap-2 p-1.5 rounded-lg text-left transition-all duration-200 cursor-pointer select-none ${
                      isActive
                        ? 'bg-[#EAF5F0] border border-[#C0E6D8] shadow-2xs'
                        : 'hover:bg-white/70'
                    }`}
                  >
                    <div
                      className={`w-6 h-6 rounded-lg flex items-center justify-center text-xs font-black shrink-0 transition-all ${
                        isActive
                          ? 'bg-[#0E4A3E] text-white shadow-xs scale-105'
                          : isPast
                          ? 'bg-[#568E7D] text-white'
                          : 'bg-slate-100 text-slate-400 group-hover:bg-slate-200 group-hover:text-slate-600'
                      }`}
                    >
                      {isPast ? <Check className="w-3 h-3 stroke-[3]" /> : i + 1}
                    </div>
                    <div className="min-w-0 flex-1">
                      <span
                        className={`block text-[8px] font-extrabold uppercase tracking-wider ${
                          isActive ? 'text-[#0E4A3E]' : isPast ? 'text-[#568E7D]' : 'text-slate-400'
                        }`}
                      >
                        Tahap {i + 1}
                      </span>
                      <span
                        className={`block text-[11px] font-bold truncate leading-tight ${
                          isActive
                            ? 'text-[#0E4A3E]'
                            : isPast
                            ? 'text-slate-700'
                            : 'text-slate-400 group-hover:text-slate-600'
                        }`}
                      >
                        {step}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
