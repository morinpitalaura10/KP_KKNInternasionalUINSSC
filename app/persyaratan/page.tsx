import React from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import SectionTitle from '@/components/SectionTitle';
import { prisma } from '@/lib/prisma';
import { getPersyaratanAkademik } from '@/lib/persyaratanAkademik';
import {
  FileCheck,
  AlertCircle,
  FileText,
  HardDrive,
  Star,
  GraduationCap,
  Layers,
  BookOpen,
  CheckCircle2,
  ShieldCheck,
} from 'lucide-react';

export const dynamic = 'force-dynamic';

interface PersyaratanItem {
  id_persyaratan: number;
  nama_persyaratan: string;
  deskripsi: string;
  format_file: string;
  ukuran_maksimal: number;
  wajib: boolean;
  status: boolean;
}

function formatFileSize(kb: number): string {
  if (kb >= 1024) {
    return `${(kb / 1024).toFixed(0)} MB`;
  }
  return `${kb} KB`;
}

export default async function PersyaratanPage() {
  let persyaratanItems: PersyaratanItem[] = [];
  let activePeriode: { nama_periode: string; tahun: number } | null = null;
  const akademikConfig = await getPersyaratanAkademik();

  try {
    // Get active period
    let periode = await prisma.periode.findFirst({ where: { status: 'Aktif' } });
    if (!periode) {
      periode = await prisma.periode.findFirst({ orderBy: { id_periode: 'desc' } });
    }

    if (periode) {
      activePeriode = { nama_periode: periode.nama_periode, tahun: periode.tahun };
      persyaratanItems = await prisma.persyaratan.findMany({
        where: { id_periode: periode.id_periode, status: true },
        orderBy: { id_persyaratan: 'asc' },
      });
      if (persyaratanItems.length === 0) {
        persyaratanItems = await prisma.persyaratan.findMany({
          where: { status: true },
          orderBy: { id_persyaratan: 'asc' },
          take: 6,
        });
      }
    } else {
      persyaratanItems = await prisma.persyaratan.findMany({
        where: { status: true },
        orderBy: { id_persyaratan: 'asc' },
      });
    }
  } catch (error) {
    console.warn('Tidak dapat terhubung ke database di PersyaratanPage:', error);
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-50/50 font-sans">
      <Header />

      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10">
        <SectionTitle
          prefixTitle="PERSYARATAN - PERSYARATAN PENDAFTARAN"
          metaInfo={activePeriode ? `Periode Pendaftaran: ${activePeriode.nama_periode} (${activePeriode.tahun})` : undefined}
          description="Pastikan Anda telah memenuhi kriteria akademik serta menyiapkan seluruh dokumen persyaratan sebelum melakukan pendaftaran."
        />

        {/* ── BAGIAN 1: PERSYARATAN AKADEMIK (IPK, JURUSAN, SEMESTER) ── */}
        {akademikConfig.status && (
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-8 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-[#0E4A3E] text-white flex items-center justify-center shrink-0 shadow-xs">
                  <GraduationCap className="w-5 h-5 text-emerald-300" />
                </div>
                <div>
                  <h2 className="text-base sm:text-lg font-extrabold text-[#0E4A3E]">
                    1. Kriteria Persyaratan Akademik
                  </h2>
                  <p className="text-xs text-slate-500">
                    Standar kelayakan akademik yang divalidasi langsung secara otomatis oleh sistem.
                  </p>
                </div>
              </div>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#DDF2E8] text-[#0E4A3E] border border-[#a6d8c3] rounded-full text-xs font-extrabold self-start sm:self-auto">
                <ShieldCheck className="w-3.5 h-3.5" />
                Validasi Sistem Otomatis
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {/* Syarat IPK */}
              <div className="p-5 rounded-2xl bg-emerald-50/40 border border-emerald-200/80 space-y-2">
                <div className="flex items-center gap-2 text-emerald-800">
                  <Star className="w-4 h-4 fill-emerald-600 text-emerald-600" />
                  <span className="text-xs font-bold uppercase tracking-wider">Minimal IPK Kumulatif</span>
                </div>
                <div className="text-3xl font-black text-[#0E4A3E]">
                  ≥ {akademikConfig.min_ipk.toFixed(2)}
                </div>
                <p className="text-xs text-slate-600">
                  Wajib memiliki Indeks Prestasi Kumulatif minimal {akademikConfig.min_ipk.toFixed(2)} (skala 4.00) dari SIAKAD resmi.
                </p>
              </div>

              {/* Syarat Semester */}
              <div className="p-5 rounded-2xl bg-teal-50/40 border border-teal-200/80 space-y-2">
                <div className="flex items-center gap-2 text-teal-800">
                  <Layers className="w-4 h-4 text-teal-600" />
                  <span className="text-xs font-bold uppercase tracking-wider">Jenjang Semester</span>
                </div>
                <div className="text-3xl font-black text-[#0E4A3E]">
                  Semester {akademikConfig.min_semester} - {akademikConfig.max_semester}
                </div>
                <p className="text-xs text-slate-600">
                  Terbuka khusus mahasiswa aktif yang berada pada rentang semester {akademikConfig.min_semester} hingga {akademikConfig.max_semester}.
                </p>
              </div>

              {/* Syarat SKS & Jurusan */}
              <div className="p-5 rounded-2xl bg-blue-50/40 border border-blue-200/80 space-y-2">
                <div className="flex items-center gap-2 text-blue-800">
                  <BookOpen className="w-4 h-4 text-blue-600" />
                  <span className="text-xs font-bold uppercase tracking-wider">Cakupan Jurusan / Prodi</span>
                </div>
                <div className="text-xl sm:text-2xl font-black text-[#0E4A3E]">
                  {akademikConfig.all_prodi ? 'Semua Jurusan Terbuka' : 'Program Studi Terpilih'}
                </div>
                <p className="text-xs text-slate-600">
                  {akademikConfig.all_prodi
                    ? 'Seluruh program studi jenjang S1/Sarjana di lingkungan UINSSC berhak mendaftar.'
                    : `Hanya program studi tertentu yang telah dialokasikan untuk kuota KKN Internasional periode ini.`}
                </p>
              </div>
            </div>

            {akademikConfig.catatan && (
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700 leading-relaxed">
                <span className="font-bold text-[#0E4A3E]">Catatan Tambahan: </span>
                {akademikConfig.catatan}
              </div>
            )}
          </div>
        )}

        {/* ── BAGIAN 2: DOKUMEN PERSYARATAN BERKAS ── */}
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#0E4A3E] text-white flex items-center justify-center shrink-0 shadow-xs">
              <FileCheck className="w-5 h-5 text-emerald-300" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-extrabold text-[#0E4A3E]">
                2. Dokumen Persyaratan yang Wajib Diunggah
              </h2>
              <p className="text-xs text-slate-500">
                Berkas resmi yang perlu dipersiapkan dalam format digital sebelum mengisi formulir pendaftaran.
              </p>
            </div>
          </div>

          {persyaratanItems.length === 0 ? (
            <div className="my-12 text-center bg-white p-12 rounded-3xl border border-slate-200">
              <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertCircle className="w-8 h-8 text-slate-400" />
              </div>
              <p className="text-sm font-bold text-slate-700">Belum ada data dokumen persyaratan</p>
              <p className="text-xs text-slate-500 mt-1">
                Data berkas persyaratan belum tersedia untuk periode yang aktif saat ini.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 my-6">
              {persyaratanItems.map((item, idx) => (
                <div
                  key={item.id_persyaratan}
                  className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-7 flex flex-col space-y-4 transition-all hover:shadow-md hover:border-[#568E7D]/40"
                >
                  {/* Header with Number & Title */}
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 shrink-0 rounded-full bg-[#0E4A3E] text-white flex items-center justify-center font-black text-sm shadow-xs">
                      {String(idx + 1).padStart(2, '0')}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="text-base sm:text-lg font-bold text-[#0E4A3E] leading-tight">
                          {item.nama_persyaratan}
                        </h3>
                        {item.wajib ? (
                          <span className="inline-flex items-center gap-1 bg-red-50 text-red-700 border border-red-200 text-[10px] font-bold px-2 py-0.5 rounded-full">
                            <Star className="w-2.5 h-2.5 fill-red-500" />
                            Wajib
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 bg-slate-100 text-slate-600 border border-slate-200 text-[10px] font-bold px-2 py-0.5 rounded-full">
                            Opsional
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Description */}
                  <p className="text-xs sm:text-sm text-slate-700 leading-relaxed whitespace-pre-line">
                    {item.deskripsi}
                  </p>

                  {/* Meta info: Format & Size */}
                  <div className="flex flex-wrap gap-2.5 pt-1">
                    <div className="flex items-center gap-1.5 bg-emerald-50 border border-emerald-200 text-emerald-800 px-3 py-1.5 rounded-lg text-xs font-bold">
                      <FileText className="w-3.5 h-3.5" />
                      <span>Format: {item.format_file.toUpperCase()}</span>
                    </div>
                    <div className="flex items-center gap-1.5 bg-blue-50 border border-blue-200 text-blue-800 px-3 py-1.5 rounded-lg text-xs font-bold">
                      <HardDrive className="w-3.5 h-3.5" />
                      <span>Maks: {formatFileSize(item.ukuran_maksimal)}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
