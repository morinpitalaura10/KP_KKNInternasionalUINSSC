'use client';

import React from 'react';
import Image from 'next/image';
import {
  Trophy,
  CheckCircle2,
  Download,
  RefreshCw,
  XCircle,
  Clock,
  Printer,
  ShieldCheck,
  Award,
} from 'lucide-react';
import { HeroBanner } from '@/components/ui';

export interface HasilSeleksiData {
  hasResult: boolean;
  idHasil?: number;
  idPendaftaran?: number;
  nim?: string;
  nama?: string;
  fakultas?: string;
  prodi?: string;
  ipk?: number | null;
  status: string | null;
  nilaiSubstansi: number | null;
  nilaiWawancara: number | null;
  nilaiAkhir: number | null;
  ranking: number | null;
  catatan: string | null;
  negaraTujuan: string | null;
  namaPeriode: string | null;
  tahunPeriode?: number;
  tanggalPenetapan?: string | null;
}

export interface MahasiswaHasilSeleksiViewProps {
  isLoading: boolean;
  data: HasilSeleksiData;
  isGeneratingPdf: boolean;
  onDownloadSkPdf: () => void;
  onPrintSk: () => void;
}

export default function MahasiswaHasilSeleksiView({
  isLoading,
  data,
  isGeneratingPdf,
  onDownloadSkPdf,
  onPrintSk,
}: MahasiswaHasilSeleksiViewProps) {
  if (isLoading) {
    return (
      <div className="max-w-5xl mx-auto py-16 flex flex-col items-center justify-center text-slate-400 gap-2">
        <RefreshCw className="w-6 h-6 animate-spin text-[#0E4A3E]" />
        <span className="text-xs font-semibold">Memuat hasil seleksi dari database...</span>
      </div>
    );
  }

  if (!data.hasResult) {
    return (
      <div className="kkn-page-container font-sans">
        <HeroBanner
          badgeIcon={<Award className="w-3.5 h-3.5 text-[#C0E6D8]" />}
          badgeText="Pengumuman & Penetapan Resmi LP2M"
          title="Hasil Seleksi KKN Internasional"
          description="Berikut adalah hasil resmi seleksi pendaftaran KKN Internasional serta Surat Keputusan (SK) Kelulusan."
        />

        <div className="bg-[#C0E6D8]/50 border border-[#9ed4c0] rounded-3xl p-8 sm:p-12 text-center shadow-xs">
          <div className="w-16 h-16 rounded-full bg-amber-100 border border-amber-300 text-amber-600 flex items-center justify-center mx-auto mb-4 shadow-2xs">
            <Clock className="w-8 h-8" />
          </div>
          <h3 className="text-lg sm:text-xl font-black text-[#0E4A3E] mb-2 uppercase">
            Hasil Seleksi Belum Tersedia
          </h3>
          <p className="text-xs sm:text-sm text-slate-600 max-w-md mx-auto leading-relaxed">
            Hasil seleksi KKN Internasional untuk akun Anda belum diumumkan oleh panitia LP2M. Silakan cek kembali setelah seluruh tahapan seleksi berkas dan wawancara selesai dinilai serta dipublikasikan oleh panitia.
          </p>
        </div>
      </div>
    );
  }

  const isLolos = data.status === 'Lolos';
  const isCadangan = data.status === 'Cadangan';
  const skNumber = `B-${String(data.idHasil || data.idPendaftaran || 1).padStart(3, '0')}/In.08/LP2M/KKN-INT/${data.tahunPeriode || 2026}`;
  const tanggalCetak = (data.tanggalPenetapan ? new Date(data.tanggalPenetapan) : new Date()).toLocaleDateString(
    'id-ID',
    {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    }
  );

  return (
    <div className="kkn-page-container font-sans">
      <div className="space-y-6 print:hidden">
        <HeroBanner
          badgeIcon={<Award className="w-3.5 h-3.5 text-[#C0E6D8]" />}
          badgeText="Pengumuman & Penetapan Resmi LP2M"
          title="Hasil Seleksi KKN Internasional"
          description="Berikut adalah hasil resmi seleksi pendaftaran KKN Internasional serta Surat Keputusan (SK) Kelulusan."
          action={
            isLolos ? (
              <div className="shrink-0 flex items-center gap-2 self-start md:self-auto">
                <button
                  type="button"
                  onClick={onDownloadSkPdf}
                  disabled={isGeneratingPdf}
                  className="inline-flex items-center gap-2 px-4 py-2.5 bg-white/15 hover:bg-white/25 backdrop-blur-md border border-white/20 disabled:opacity-60 text-white rounded-full text-xs font-bold shadow-xs transition-all cursor-pointer"
                >
                  <Download className="w-4 h-4 text-[#C0E6D8]" />
                  <span>{isGeneratingPdf ? 'Menyiapkan...' : 'Unduh SK (PDF)'}</span>
                </button>
                <button
                  type="button"
                  onClick={onPrintSk}
                  className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#C0E6D8] hover:bg-[#a6d9c6] text-[#0E4A3E] rounded-full text-xs font-extrabold shadow-xs transition-all cursor-pointer"
                >
                  <Printer className="w-4 h-4" />
                  <span>Cetak SK</span>
                </button>
              </div>
            ) : undefined
          }
        />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 mb-5">
          <div
            className={`lg:col-span-7 rounded-3xl p-5 sm:p-6 border shadow-xs flex flex-col sm:flex-row items-center gap-5 ${
              isLolos
                ? 'bg-[#C0E6D8] border-[#9ed4c0]'
                : isCadangan
                ? 'bg-amber-50 border-amber-200'
                : 'bg-red-50 border-red-200'
            }`}
          >
            <div
              className={`w-24 h-24 sm:w-28 sm:h-28 rounded-full border-4 flex items-center justify-center shrink-0 shadow-lg ${
                isLolos
                  ? 'bg-[#0E4A3E] border-emerald-400/40'
                  : isCadangan
                  ? 'bg-amber-600 border-amber-300/40'
                  : 'bg-red-600 border-red-300/40'
              }`}
            >
              {isLolos ? (
                <Trophy className="w-12 h-12 sm:w-14 sm:h-14 text-amber-400 drop-shadow-md" />
              ) : isCadangan ? (
                <Clock className="w-12 h-12 sm:w-14 sm:h-14 text-white drop-shadow-md" />
              ) : (
                <XCircle className="w-12 h-12 sm:w-14 sm:h-14 text-white drop-shadow-md" />
              )}
            </div>

            <div className="flex-1 w-full space-y-2.5">
              <div className="bg-white rounded-xl py-2 px-3.5 shadow-xs flex items-center gap-2 border border-white/80">
                {isLolos ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                ) : isCadangan ? (
                  <Clock className="w-4 h-4 text-amber-600 shrink-0" />
                ) : (
                  <XCircle className="w-4 h-4 text-red-600 shrink-0" />
                )}
                <span
                  className={`text-xs sm:text-sm font-extrabold tracking-wide uppercase ${
                    isLolos ? 'text-[#0E4A3E]' : isCadangan ? 'text-amber-800' : 'text-red-800'
                  }`}
                >
                  {isLolos
                    ? 'SELAMAT! ANDA LOLOS SELEKSI UTAMA'
                    : isCadangan
                    ? 'ANDA MASUK DAFTAR CADANGAN'
                    : 'ANDA TIDAK LOLOS SELEKSI'}
                </span>
              </div>

              {data.negaraTujuan && (
                <div className="bg-white rounded-xl py-2 px-3.5 shadow-xs border border-white/80">
                  <span className="text-[11px] font-bold text-slate-500 block uppercase">
                    Negara Tujuan:
                  </span>
                  <span className="text-xs sm:text-sm font-bold text-[#0E4A3E]">
                    {data.negaraTujuan}
                  </span>
                </div>
              )}

              {data.namaPeriode && (
                <div className="bg-white rounded-xl py-2 px-3.5 shadow-xs border border-white/80">
                  <span className="text-[11px] font-bold text-slate-500 block uppercase">
                    Periode:
                  </span>
                  <span className="text-xs sm:text-sm font-semibold text-slate-700">
                    {data.namaPeriode}
                  </span>
                </div>
              )}

              {data.ranking && (
                <div className="bg-white rounded-xl py-2 px-3.5 shadow-xs border border-white/80">
                  <span className="text-[11px] font-bold text-slate-500 block uppercase">
                    Peringkat Akhir:
                  </span>
                  <span className="text-xs sm:text-sm font-black text-[#0E4A3E]">
                    #{data.ranking}
                  </span>
                </div>
              )}
            </div>
          </div>

          <div className="lg:col-span-5 bg-white rounded-3xl border-2 border-slate-200/90 p-5 shadow-xs flex flex-col justify-between">
            <div className="grid grid-cols-2 divide-x divide-slate-200 h-full">
              <div className="pr-4 flex flex-col justify-between">
                <div>
                  <div className="h-6 bg-[#C0E6D8]/60 rounded-md px-2 flex items-center mb-3">
                    <span className="text-[10px] font-bold text-[#0E4A3E] uppercase truncate">
                      Administrasi
                    </span>
                  </div>
                  <div className="bg-slate-50 rounded-xl p-3 border border-slate-100 text-center">
                    <span className="text-2xl font-black text-[#0E4A3E]">
                      {data.nilaiSubstansi !== null ? data.nilaiSubstansi.toFixed(1) : '-'}
                    </span>
                    <span className="text-[10px] text-slate-500 block font-semibold">
                      Skor Berkas
                    </span>
                  </div>
                </div>
              </div>

              <div className="pl-4 flex flex-col justify-between">
                <div>
                  <div className="h-6 bg-[#C0E6D8]/60 rounded-md px-2 flex items-center mb-3">
                    <span className="text-[10px] font-bold text-[#0E4A3E] uppercase truncate">
                      Wawancara &amp; Bahasa
                    </span>
                  </div>
                  <div className="bg-slate-50 rounded-xl p-3 border border-slate-100 text-center">
                    <span className="text-2xl font-black text-[#0E4A3E]">
                      {data.nilaiWawancara !== null ? data.nilaiWawancara.toFixed(1) : '-'}
                    </span>
                    <span className="text-[10px] text-slate-500 block font-semibold">
                      Skor Wawancara
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {data.nilaiAkhir !== null && (
              <div className="mt-4 bg-[#0E4A3E] rounded-xl p-3 text-center">
                <span className="text-[10px] text-white/70 font-bold uppercase block">
                  Nilai Akhir
                </span>
                <span className="text-2xl font-black text-white">{data.nilaiAkhir.toFixed(1)}</span>
              </div>
            )}
          </div>
        </div>

        {data.catatan && (
          <div className="bg-slate-50 rounded-3xl border border-slate-200 p-5 mb-5">
            <h3 className="font-bold text-sm text-slate-700 mb-2 uppercase tracking-wider">
              Catatan Panitia
            </h3>
            <p className="text-sm text-slate-600 leading-relaxed">{data.catatan}</p>
          </div>
        )}
      </div>

      {isLolos && (
        <div
          id="printable-sk-kelulusan"
          className="fixed left-[-9999px] top-0 pointer-events-none print:static print:pointer-events-auto max-w-[210mm] mx-auto bg-white p-8 sm:p-12 border-none print:p-6 print:m-0 print:w-full print:max-w-none text-slate-900 leading-relaxed z-[-1]"
        >
          <div className="flex items-center gap-4 pb-4 border-b-2 border-slate-900">
            <div className="w-20 h-20 sm:w-24 sm:h-24 shrink-0 flex items-center justify-center">
              <img
                src="/uinssc.png"
                alt="Logo UINSSC"
                className="w-20 h-20 sm:w-24 sm:h-24 object-contain"
              />
            </div>
            <div className="flex-1 text-center pr-2">
              <h3 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-slate-800 leading-tight">
                KEMENTERIAN AGAMA REPUBLIK INDONESIA
              </h3>
              <h2 className="text-sm sm:text-base md:text-lg font-black uppercase text-[#0E4A3E] leading-tight">
                UNIVERSITAS ISLAM NEGERI SIBER SYEKH NURJATI CIREBON
              </h2>
              <h4 className="text-xs sm:text-sm font-extrabold uppercase text-slate-800 leading-tight">
                LEMBAGA PENELITIAN DAN PENGABDIAN KEPADA MASYARAKAT (LP2M)
              </h4>
              <p className="text-[10px] sm:text-[11px] text-slate-600 mt-1 leading-snug">
                Pusat Pengabdian kepada Masyarakat &amp; Pengelolaan KKN Internasional
                <br />
                Jl. Perjuangan By Pass Sunyaragi, Cirebon, Jawa Barat 45132 | Laman: https://uinssc.ac.id
              </p>
            </div>
          </div>
          <div className="h-0.5 bg-slate-900 mt-0.5 mb-6" />

          <div className="text-center mb-6 space-y-1">
            <h2 className="text-sm sm:text-base font-black text-slate-900 uppercase underline tracking-wide">
              SURAT KEPUTUSAN PENETAPAN KELULUSAN PESERTA
            </h2>
            <p className="text-xs font-bold text-slate-700 uppercase">
              PROGRAM KULIAH KERJA NYATA (KKN) INTERNASIONAL TAHUN {data.tahunPeriode || 2026}
            </p>
            <div className="inline-flex items-center gap-1.5 mt-2 px-3.5 py-1 bg-[#DDF2E8] border border-[#9ed4c0] rounded-full text-[11px] font-extrabold text-[#0E4A3E]">
              <ShieldCheck className="w-3.5 h-3.5 text-[#0E4A3E]" />
              <span>NOMOR: {skNumber}</span>
            </div>
          </div>

          <p className="text-xs sm:text-sm text-slate-800 text-justify mb-4">
            Berdasarkan hasil verifikasi berkas administrasi, evaluasi dokumen akademik, serta penilaian seleksi wawancara dan kompetensi bahasa asing pada penyelenggaraan{' '}
            <strong>{data.namaPeriode || 'KKN Internasional'}</strong>, Ketua Lembaga Penelitian dan Pengabdian kepada Masyarakat (LP2M) Universitas Islam Negeri Siber Syekh Nurjati Cirebon dengan ini menetapkan bahwa mahasiswa di bawah ini:
          </p>

          <div className="my-5 p-4 sm:p-5 rounded-xl bg-slate-50 border border-slate-300">
            <table className="w-full text-xs sm:text-sm text-slate-800 border-collapse">
              <tbody>
                <tr className="border-b border-slate-200">
                  <td className="py-2 font-bold text-slate-600 w-44">Nama Lengkap</td>
                  <td className="py-2 font-black text-slate-900 uppercase">: {data.nama || '-'}</td>
                </tr>
                <tr className="border-b border-slate-200">
                  <td className="py-2 font-bold text-slate-600">NIM</td>
                  <td className="py-2 font-bold text-slate-900 font-mono">: {data.nim || '-'}</td>
                </tr>
                <tr className="border-b border-slate-200">
                  <td className="py-2 font-bold text-slate-600">Fakultas / Program Studi</td>
                  <td className="py-2 font-semibold text-slate-800">
                    : {data.fakultas || '-'} / {data.prodi || '-'}
                  </td>
                </tr>
                <tr className="border-b border-slate-200">
                  <td className="py-2 font-bold text-slate-600">Periode Penyelenggaraan</td>
                  <td className="py-2 font-semibold text-slate-800">
                    : {data.namaPeriode || 'KKN Internasional'} ({data.tahunPeriode || 2026})
                  </td>
                </tr>
                <tr className="border-b border-slate-200">
                  <td className="py-2 font-bold text-slate-600">Rincian Skor Evaluasi</td>
                  <td className="py-2 text-slate-800">
                    : Skor Berkas <strong>{data.nilaiSubstansi?.toFixed(1) ?? '-'}</strong> &nbsp;|&nbsp; Skor Wawancara{' '}
                    <strong>{data.nilaiWawancara?.toFixed(1) ?? '-'}</strong> &nbsp;|&nbsp; Nilai Akhir{' '}
                    <strong className="text-[#0E4A3E]">{data.nilaiAkhir?.toFixed(2) ?? '-'}</strong> (Peringkat #{data.ranking ?? '-'})
                  </td>
                </tr>
                <tr>
                  <td className="py-2 font-bold text-slate-600">Negara Penempatan</td>
                  <td className="py-2 font-black text-[#0E4A3E] uppercase">
                    : {data.negaraTujuan || 'Ditentukan Panitia LP2M'}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="my-5 p-4 rounded-xl bg-[#DDF2E8] border-2 border-[#0E4A3E] text-center">
            <span className="text-[11px] font-bold text-[#0E4A3E] uppercase tracking-widest block">
              Status Keputusan Akhir Seleksi
            </span>
            <span className="text-base sm:text-lg font-black text-[#0E4A3E] uppercase tracking-wide block mt-0.5">
              DINYATAKAN LOLOS SELEKSI UTAMA PESERTA KKN INTERNASIONAL
            </span>
          </div>

          <p className="text-xs sm:text-sm text-slate-800 text-justify mb-6">
            Surat Keputusan Penetapan Kelulusan ini berlaku secara sah sebagai bukti kelulusan resmi peserta untuk mengikuti seluruh rangkaian pembekalan (*Pre-Departure Training*), pengurusan dokumen perjalanan luar negeri, serta pelaksanaan pengabdian masyarakat internasional sesuai jadwal yang ditetapkan oleh LP2M UIN Siber Syekh Nurjati Cirebon.
          </p>

          <div className="grid grid-cols-2 gap-8 text-center text-xs text-slate-800 pt-4">
            <div className="flex flex-col items-center justify-center">
              <div className="p-2.5 border border-slate-300 rounded-xl bg-slate-50 flex flex-col items-center">
                <div className="w-20 h-20 bg-white border border-slate-200 rounded-lg flex items-center justify-center p-1">
                  <svg className="w-full h-full text-slate-800" viewBox="0 0 100 100" fill="currentColor">
                    <rect x="0" y="0" width="30" height="30" />
                    <rect x="5" y="5" width="20" height="20" fill="white" />
                    <rect x="10" y="10" width="10" height="10" />
                    <rect x="70" y="0" width="30" height="30" />
                    <rect x="75" y="5" width="20" height="20" fill="white" />
                    <rect x="80" y="10" width="10" height="10" />
                    <rect x="0" y="70" width="30" height="30" />
                    <rect x="5" y="75" width="20" height="20" fill="white" />
                    <rect x="10" y="80" width="10" height="10" />
                    <rect x="40" y="10" width="10" height="10" />
                    <rect x="55" y="10" width="5" height="20" />
                    <rect x="40" y="40" width="20" height="20" />
                    <rect x="70" y="40" width="10" height="10" />
                    <rect x="40" y="70" width="15" height="10" />
                    <rect x="65" y="65" width="10" height="20" />
                    <rect x="85" y="75" width="15" height="15" />
                  </svg>
                </div>
                <span className="text-[9px] font-bold text-slate-600 mt-1 uppercase">
                  VALIDASI SK DIGITAL
                </span>
                <span className="text-[8px] text-slate-400 font-mono">{skNumber}</span>
              </div>
            </div>

            <div className="flex flex-col items-center justify-between min-h-[130px] relative">
              <div>
                <p className="text-[11px] text-slate-600">Ditetapkan di: Cirebon</p>
                <p className="text-[11px] text-slate-600">Pada tanggal: {tanggalCetak}</p>
                <p className="font-bold mt-1">Ketua LP2M UIN Siber Syekh Nurjati Cirebon</p>
              </div>

              <div className="relative pt-2">
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-22 h-22 rounded-full border-2 border-emerald-700/35 text-emerald-800/45 flex items-center justify-center pointer-events-none rotate-[-12deg] select-none text-[8px] font-black uppercase text-center p-1">
                  LP2M UINSSC * SK KELULUSAN SAH *
                </div>
                <div className="pt-12">
                  <p className="font-extrabold uppercase underline tracking-wider">
                    Prof. Dr. H. Ahmad Dahlan, M.Ag.
                  </p>
                  <p className="text-[11px] text-slate-500 font-mono">
                    NIP. 19750812 200212 1 002
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-6 mt-6 border-t border-slate-200 flex justify-between items-center text-[9px] text-slate-400">
            <span>Dicetak resmi dari Sistem KKN Internasional UIN Siber Syekh Nurjati Cirebon</span>
            <span>{skNumber}</span>
          </div>
        </div>
      )}
    </div>
  );
}
