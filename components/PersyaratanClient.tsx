'use client';

import React, { useState } from 'react';
import {
  FileCheck,
  AlertCircle,
  FileText,
  HardDrive,
  Star,
  GraduationCap,
  Layers,
  BookOpen,
  ShieldCheck,
  CheckCircle2,
  Sparkles,
  Check,
  Info,
} from 'lucide-react';

export interface PersyaratanItem {
  id_persyaratan: number;
  nama_persyaratan: string;
  deskripsi: string;
  format_file: string;
  ukuran_maksimal: number;
  wajib: boolean;
  status: boolean;
}

interface PersyaratanClientProps {
  persyaratanItems: PersyaratanItem[];
  activePeriode: { nama_periode: string; tahun: number } | null;
  akademikConfig: {
    min_ipk: number;
    min_semester: number;
    max_semester: number;
    all_prodi: boolean;
    catatan?: string | null;
    status: boolean;
  };
}

function formatFileSize(kb: number): string {
  if (kb >= 1024) {
    return `${(kb / 1024).toFixed(0)} MB`;
  }
  return `${kb} KB`;
}

export default function PersyaratanClient({
  persyaratanItems,
  activePeriode,
  akademikConfig,
}: PersyaratanClientProps) {
  const [activeTab, setActiveTab] = useState<'akademik' | 'dokumen'>('akademik');
  
  // Interactive checklist state: set of checked document IDs
  const [checkedIds, setCheckedIds] = useState<number[]>([]);

  const handleToggleCheck = (id: number) => {
    setCheckedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleSelectTab = (tab: 'akademik' | 'dokumen') => {
    setActiveTab(tab);
    const target = document.getElementById(tab);
    if (target) {
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const totalDocs = persyaratanItems.length;
  const checkedCount = checkedIds.length;
  const progressPercent = totalDocs > 0 ? Math.round((checkedCount / totalDocs) * 100) : 0;
  const wajibCount = persyaratanItems.filter((p) => p.wajib).length;

  return (
    <main className="flex-1 w-full">
      {/* ── TOP SECTION: White Background (Identik & Konsisten dengan /informasi) ── */}
      <section className="py-6 sm:py-10 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-5 sm:space-y-6">
          
          {/* Title Block */}
          <div className="text-left space-y-1.5 sm:space-y-2">
            <h1 className="text-base sm:text-2xl md:text-3xl lg:text-4xl font-archivo text-[#0E4A3E] tracking-tight leading-tight uppercase">
              PERSYARATAN - PERSYARATAN PENDAFTARAN <br className="hidden sm:block" />
              KULIAH KERJA NYATA INTERNASIONAL
            </h1>
            <h2 className="text-[10px] sm:text-base md:text-lg lg:text-xl font-archivo text-[#0E4A3E] uppercase tracking-wide leading-tight">
              UNIVERSITAS ISLAM NEGERI SIBER SYEKH NURJATI CIREBON
            </h2>
            {activePeriode && (
              <p className="text-[11px] sm:text-sm font-semibold text-gray-500 pt-0.5">
                Periode Pendaftaran: {activePeriode.nama_periode} ({activePeriode.tahun})
              </p>
            )}
            <p className="text-[11px] sm:text-sm text-gray-600 max-w-2xl text-left font-normal leading-relaxed pt-0.5 sm:pt-1">
              Pastikan Anda telah memenuhi kriteria akademik serta menyiapkan seluruh dokumen persyaratan sebelum melakukan pendaftaran.
            </p>
          </div>

          {/* Segmented Pill Navigation Bar (Identik dengan Category Bar di /informasi) */}
          <div className="pt-1 sm:pt-2">
            <div className="w-full max-w-md mx-auto bg-slate-100 p-1.5 rounded-full border border-slate-200 shadow-xs flex items-center justify-between gap-1">
              <button
                type="button"
                onClick={() => handleSelectTab('akademik')}
                className={`flex-1 py-2 sm:py-2.5 px-3 sm:px-4 rounded-full font-bold text-xs sm:text-sm transition-all cursor-pointer text-center truncate ${
                  activeTab === 'akademik'
                    ? 'bg-[#0E4A3E] text-white shadow-sm'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
                }`}
              >
                Syarat Akademik
              </button>

              <button
                type="button"
                onClick={() => handleSelectTab('dokumen')}
                className={`flex-1 py-2 sm:py-2.5 px-3 sm:px-4 rounded-full font-bold text-xs sm:text-sm transition-all cursor-pointer text-center truncate ${
                  activeTab === 'dokumen'
                    ? 'bg-[#0E4A3E] text-white shadow-sm'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
                }`}
              >
                Berkas Dokumen
              </button>
            </div>
          </div>

        </div>
      </section>

      {/* ── MAIN CONTENT AREA: Sage Green (#568E7D - Identik dengan /informasi) ── */}
      <section className="bg-[#568E7D] text-white py-8 sm:py-14">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 sm:space-y-12">
          
          {/* 1. BAGIAN KRITERIA AKADEMIK (Dengan Foto Delegasi seperti /informasi) */}
          {akademikConfig.status && (
            <div id="akademik" className="scroll-mt-24 bg-white/10 border border-white/25 rounded-2xl sm:rounded-3xl p-5 sm:p-8 md:p-10 shadow-xl space-y-5 sm:space-y-6">
              {/* Header Box */}
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/20 pb-3 sm:pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center text-white shrink-0 shadow-xs">
                    <GraduationCap className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h2 className="text-base sm:text-2xl font-archivo text-white tracking-wide uppercase">
                      1. KRITERIA PERSYARATAN AKADEMIK
                    </h2>
                    <p className="text-[11px] sm:text-xs text-emerald-100/90 font-medium">
                      Standar kelayakan akademik yang divalidasi langsung secara otomatis oleh sistem SIAKAD.
                    </p>
                  </div>
                </div>

                <span className="text-xs font-bold bg-[#C0E6D8] text-[#0E4A3E] px-3.5 py-1 rounded-full shadow-xs flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  Validasi Sistem Otomatis
                </span>
              </div>

              {/* 3 Academic Metric Cards (Theme Hijau Khas UINSSC, bukan kotak putih polos) */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 pt-1">
                
                {/* Metric 1: IPK */}
                <div className="bg-[#0E4A3E]/60 hover:bg-[#0E4A3E]/85 backdrop-blur-md rounded-2xl p-5 sm:p-6 shadow-lg border border-white/25 flex flex-col justify-between space-y-3 transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-[#C0E6D8] flex items-center gap-1.5">
                      <Star className="w-4 h-4 fill-amber-300 text-amber-300" />
                      Minimal IPK
                    </span>
                    <span className="text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full bg-white/15 text-[#C0E6D8] border border-white/20">
                      Skala 4.00
                    </span>
                  </div>

                  <div className="text-3xl sm:text-4xl font-archivo font-black text-white tracking-tight">
                    ≥ {akademikConfig.min_ipk.toFixed(2)}
                  </div>

                  <p className="text-xs text-emerald-100/90 leading-relaxed font-normal">
                    Wajib memiliki Indeks Prestasi Kumulatif minimal {akademikConfig.min_ipk.toFixed(2)} dari data resmi SIAKAD UINSSC.
                  </p>
                </div>

                {/* Metric 2: Semester */}
                <div className="bg-[#0E4A3E]/60 hover:bg-[#0E4A3E]/85 backdrop-blur-md rounded-2xl p-5 sm:p-6 shadow-lg border border-white/25 flex flex-col justify-between space-y-3 transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-[#C0E6D8] flex items-center gap-1.5">
                      <Layers className="w-4 h-4 text-cyan-300" />
                      Jenjang Semester
                    </span>
                    <span className="text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full bg-white/15 text-[#C0E6D8] border border-white/20">
                      Mahasiswa Aktif
                    </span>
                  </div>

                  <div className="text-2xl sm:text-3xl font-archivo font-black text-white tracking-tight">
                    Semester {akademikConfig.min_semester} – {akademikConfig.max_semester}
                  </div>

                  <p className="text-xs text-emerald-100/90 leading-relaxed font-normal">
                    Terbuka khusus mahasiswa program Sarjana (S1) yang berada pada rentang semester {akademikConfig.min_semester} hingga {akademikConfig.max_semester}.
                  </p>
                </div>

                {/* Metric 3: Program Studi */}
                <div className="bg-[#0E4A3E]/60 hover:bg-[#0E4A3E]/85 backdrop-blur-md rounded-2xl p-5 sm:p-6 shadow-lg border border-white/25 flex flex-col justify-between space-y-3 transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-[#C0E6D8] flex items-center gap-1.5">
                      <BookOpen className="w-4 h-4 text-emerald-300" />
                      Cakupan Prodi
                    </span>
                    <span className="text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full bg-white/15 text-[#C0E6D8] border border-white/20">
                      Jenjang S1
                    </span>
                  </div>

                  <div className="text-xl sm:text-2xl font-archivo font-black text-white tracking-tight">
                    {akademikConfig.all_prodi ? 'Semua Jurusan S1' : 'Program Studi Terpilih'}
                  </div>

                  <p className="text-xs text-emerald-100/90 leading-relaxed font-normal">
                    {akademikConfig.all_prodi
                      ? 'Seluruh program studi jenjang S1/Sarjana di lingkungan UINSSC berhak mendaftar.'
                      : 'Khusus program studi tertentu yang telah dialokasikan kuota KKN Internasional.'}
                  </p>
                </div>

              </div>

              {/* Catatan Akademik Tambahan */}
              {akademikConfig.catatan && (
                <div className="p-3.5 sm:p-4 rounded-xl bg-white/10 border border-white/20 text-xs text-white leading-relaxed flex items-start gap-2">
                  <Info className="w-4 h-4 text-[#C0E6D8] shrink-0 mt-0.5" />
                  <span>
                    <strong className="text-[#C0E6D8]">Catatan Panitia: </strong>
                    <span className="text-emerald-100/95">{akademikConfig.catatan}</span>
                  </span>
                </div>
              )}

            </div>
          )}

          {/* 2. BAGIAN DOKUMEN PERSYARATAN: INTERACTIVE CHECKLIST TOOL */}
          <div id="dokumen" className="scroll-mt-24 bg-white/10 border border-white/25 rounded-2xl sm:rounded-3xl p-5 sm:p-8 md:p-10 shadow-xl space-y-5 sm:space-y-6">
            
            {/* Header Box */}
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/20 pb-3 sm:pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center text-white shrink-0 shadow-xs">
                  <FileCheck className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="text-base sm:text-2xl font-archivo text-white tracking-wide uppercase">
                    2. DOKUMEN PERSYARATAN DIGITAL
                  </h2>
                  <p className="text-[11px] sm:text-xs text-emerald-100/90 font-medium">
                    Tandai dokumen yang sudah Anda siapkan untuk memeriksa kesiapan pendaftaran secara interaktif.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs font-bold bg-[#C0E6D8] text-[#0E4A3E] px-3.5 py-1 rounded-full shadow-xs">
                  {wajibCount} Berkas Wajib
                </span>
              </div>
            </div>

            {/* Interactive Readiness Progress Bar */}
            {totalDocs > 0 && (
              <div className="bg-white/15 backdrop-blur-md rounded-2xl p-4 sm:p-5 border border-white/25 shadow-sm space-y-2.5">
                <div className="flex items-center justify-between text-xs sm:text-sm font-bold text-white">
                  <span className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-amber-300" />
                    Kesiapan Berkas Anda: <span className="text-[#C0E6D8] font-extrabold">{checkedCount}</span> dari {totalDocs} Dokumen
                  </span>
                  <span className="text-sm font-black text-[#C0E6D8]">
                    {progressPercent}%
                  </span>
                </div>

                {/* Progress Track */}
                <div className="w-full h-3 bg-black/25 rounded-full overflow-hidden p-0.5 border border-white/20">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      progressPercent === 100
                        ? 'bg-gradient-to-r from-emerald-400 to-teal-300 shadow-md'
                        : 'bg-[#C0E6D8]'
                    }`}
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>

                {progressPercent === 100 ? (
                  <p className="text-xs font-extrabold text-emerald-200 flex items-center gap-1.5 pt-1">
                    <CheckCircle2 className="w-4 h-4 text-emerald-300" />
                    Hebat! Seluruh berkas Anda sudah lengkap dan siap diunggah saat pendaftaran dibuka.
                  </p>
                ) : (
                  <p className="text-[11px] text-white/80 font-normal">
                    Klik kotak centang pada setiap dokumen di bawah ini setelah Anda menyiapkannya.
                  </p>
                )}
              </div>
            )}

            {/* Empty State */}
            {persyaratanItems.length === 0 ? (
              <div className="p-8 text-center bg-white/10 rounded-2xl border border-white/20 text-white">
                <AlertCircle className="w-8 h-8 text-white/80 mx-auto mb-2" />
                <p className="text-sm font-bold">Belum ada data dokumen persyaratan</p>
                <p className="text-xs text-emerald-100/80 mt-1">
                  Data berkas persyaratan belum tersedia untuk periode aktif saat ini.
                </p>
              </div>
            ) : (
              /* Checklist Items List */
              <div className="space-y-3 pt-1">
                {persyaratanItems.map((item, idx) => {
                  const isChecked = checkedIds.includes(item.id_persyaratan);

                  return (
                    <div
                      key={item.id_persyaratan}
                      onClick={() => handleToggleCheck(item.id_persyaratan)}
                      className={`rounded-2xl p-4 sm:p-5 border transition-all duration-200 cursor-pointer flex flex-col md:flex-row md:items-center justify-between gap-3 group select-none ${
                        isChecked
                          ? 'bg-[#0E4A3E] text-white border-[#C0E6D8] shadow-lg ring-2 ring-[#C0E6D8]/50'
                          : 'bg-[#0E4A3E]/60 hover:bg-[#0E4A3E]/85 backdrop-blur-md text-white border-white/20 shadow-sm hover:shadow-lg hover:border-white/40'
                      }`}
                    >
                      {/* Left: Checkbox Icon + Number + Title + Description */}
                      <div className="flex items-start gap-3.5 min-w-0 flex-1">
                        
                        {/* Interactive Checkbox Button */}
                        <div className="pt-0.5 shrink-0">
                          {isChecked ? (
                            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-[#C0E6D8] text-[#0E4A3E] flex items-center justify-center shadow-xs transition-transform transform scale-105">
                              <Check className="w-4 h-4 stroke-[3]" />
                            </div>
                          ) : (
                            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl border-2 border-white/40 group-hover:border-[#C0E6D8] flex items-center justify-center text-white/70 group-hover:text-white transition-colors bg-white/10">
                              <span className="text-xs font-bold">{String(idx + 1).padStart(2, '0')}</span>
                            </div>
                          )}
                        </div>

                        {/* Title & Desc */}
                        <div className="min-w-0 flex-1 space-y-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h3
                              className={`text-sm sm:text-base font-bold transition-colors leading-snug ${
                                isChecked
                                  ? 'text-white/80 line-through decoration-[#C0E6D8]/70'
                                  : 'text-white group-hover:text-[#C0E6D8]'
                              }`}
                            >
                              {item.nama_persyaratan}
                            </h3>

                            {item.wajib ? (
                              <span className="inline-flex items-center gap-1 bg-red-500/25 text-red-200 border border-red-400/40 text-[10px] font-extrabold px-2.5 py-0.5 rounded-full shrink-0 shadow-2xs">
                                <Star className="w-2.5 h-2.5 fill-red-400 text-red-400" />
                                Wajib
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 bg-white/10 text-white/80 border border-white/20 text-[10px] font-bold px-2.5 py-0.5 rounded-full shrink-0">
                                Opsional
                              </span>
                            )}

                            {isChecked && (
                              <span className="inline-flex items-center gap-1 bg-[#C0E6D8] text-[#0E4A3E] text-[10px] font-black px-2 py-0.5 rounded-full shadow-xs">
                                Siap Diunggah
                              </span>
                            )}
                          </div>

                          <p className="text-xs text-emerald-100/90 leading-relaxed font-normal whitespace-pre-line">
                            {item.deskripsi}
                          </p>
                        </div>
                      </div>

                      {/* Right: File Format & Size Chips */}
                      <div className="flex items-center gap-2 shrink-0 self-start md:self-center pl-10 md:pl-0 pt-1 md:pt-0">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/15 border border-white/20 text-[#C0E6D8] text-[11px] font-bold shrink-0">
                          <FileText className="w-3.5 h-3.5" />
                          <span>{item.format_file.toUpperCase()}</span>
                        </span>
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/10 border border-white/20 text-white/90 text-[11px] font-bold shrink-0">
                          <HardDrive className="w-3.5 h-3.5" />
                          <span>Maks. {formatFileSize(item.ukuran_maksimal)}</span>
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

        </div>
      </section>
    </main>
  );
}
