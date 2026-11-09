'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Download, RefreshCw, Printer } from 'lucide-react';
import { PageHeader, StageStepper } from '@/components/ui';

const STAGES = [
  { label: 'Draft' },
  { label: 'Menunggu Verifikasi' },
  { label: 'Perbaikan Dokumen' },
  { label: 'Verifikasi Dokumen' },
  { label: 'Wawancara' },
  { label: 'Lolos/Tidak Lolos' },
];

interface DashboardData {
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

const TEMPLATE_CARDS_FALLBACK = [
  { label: 'Template Surat Rekomendasi', desc: 'Surat dari Rektor / Dekan untuk mengikuti KKN Internasional' },
  { label: 'Template Surat Rekomendasi', desc: 'Surat Izin Orang Tua / Wali Mahasiswa Peserta KKN Internasional' },
  { label: 'Template Surat Pernyataan', desc: 'Surat Pernyataan Kesanggupan dan Tanggung Jawab Peserta' },
  { label: 'Template Surat Rekomendasi', desc: 'Surat Rekomendasi dari Dosen Pembimbing Akademik' },
];

export default function MahasiswaDashboardPage() {
  const [displayName, setDisplayName] = useState('MAHASISWA');
  const [isLoading, setIsLoading] = useState(true);
  const [dashData, setDashData] = useState<DashboardData>({
    hasPendaftaran: false,
    statusPendaftaran: 'Belum Mendaftar',
    statusDokumen: '-',
    statusSeleksi: '-',
    catatanRevisi: null,
    currentStage: 0,
  });

  useEffect(() => {
    let userId: string | null = null;

    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('currentUser');
      if (stored) {
        try {
          const user = JSON.parse(stored);
          // eslint-disable-next-line react-hooks/set-state-in-effect
          setDisplayName(user.name?.toUpperCase() ?? 'MAHASISWA');
          userId = user.id;
        } catch {
          // ignore
        }
      }
    }

    async function loadDashboard() {
      if (!userId) {
        setIsLoading(false);
        return;
      }
      try {
        const res = await fetch(`/api/mahasiswa/dashboard?userId=${userId}`);
        const json = await res.json();
        if (json.success && json.data) {
          setDashData(json.data);
        }
      } catch (err) {
        console.error('Failed to load mahasiswa dashboard:', err);
      } finally {
        setIsLoading(false);
      }
    }

    loadDashboard();
  }, []);

  const statusPendaftaranColor = () => {
    const s = dashData.statusPendaftaran;
    if (s === 'Lolos' || s === 'Terverifikasi') return 'text-emerald-600';
    if (s === 'Tidak Lolos') return 'text-red-500';
    if (s === 'Draft') return 'text-slate-500';
    return 'text-[#0E4A3E]';
  };

  const statusDokumenColor = () => {
    const s = dashData.statusDokumen;
    if (s === 'Terverifikasi') return 'text-emerald-600';
    if (s === 'Perlu Revisi') return 'text-red-500';
    return 'text-[#0E4A3E]';
  };

  const statusSeleksiColor = () => {
    const s = dashData.statusSeleksi;
    if (s === 'Lolos') return 'text-emerald-600';
    if (s === 'Tidak Lolos') return 'text-red-500';
    if (s === 'Cadangan') return 'text-amber-500';
    if (s === '-') return 'text-slate-400';
    return 'text-amber-500';
  };

  const catatanColor = () => {
    if (dashData.catatanRevisi) return 'text-red-500';
    return 'text-slate-400';
  };

  const templateCards = dashData.suratTemplates && dashData.suratTemplates.length > 0
    ? dashData.suratTemplates.map((s) => ({
        label: s.nama,
        desc: s.file_path ? s.file_path.split('/').pop() || 'Template Dokumen Resmi' : 'Format Dokumen Resmi',
        file_path: s.file_path,
        id: s.id,
      }))
    : TEMPLATE_CARDS_FALLBACK.map((c, i) => ({ ...c, id: i, file_path: '' }));

  return (
    <div className="w-full max-w-7xl space-y-6 pb-12 font-sans">

      {/* ===== Welcome Banner ===== */}
      <PageHeader
        title="Selamat Datang,"
        subtitle={`${displayName}!`}
        description="Semangat terus untuk pendaftaran KKN Internasionalnya!"
        className="mb-8"
      />

      {isLoading ? (
        <div className="py-16 flex flex-col items-center justify-center text-slate-400 gap-2">
          <RefreshCw className="w-6 h-6 animate-spin text-[#0E4A3E]" />
          <span className="text-xs font-semibold">Memuat data dashboard dari database...</span>
        </div>
      ) : (
        <>
          {/* ===== Status Cards Row ===== */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs text-center">
              <p className="text-xs text-slate-400 font-semibold mb-1.5">Status Pendaftaran</p>
              <p className={`text-lg font-black ${statusPendaftaranColor()}`}>
                {dashData.statusPendaftaran || 'Belum Mendaftar'}
              </p>
              <p className="text-[11px] text-slate-400 mt-1">
                {dashData.hasPendaftaran
                  ? 'Formulir pendaftaran telah terkirim'
                  : 'Formulir pendaftaran belum dikirim ke panitia'}
              </p>
            </div>

            <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs text-center">
              <p className="text-xs text-slate-400 font-semibold mb-1.5">Status Dokumen</p>
              <p className={`text-lg font-black ${statusDokumenColor()}`}>
                {dashData.statusDokumen || '-'}
              </p>
              <p className="text-[11px] text-slate-400 mt-1">
                {dashData.statusDokumen === 'Terverifikasi'
                  ? 'Semua dokumen sudah lengkap dan valid'
                  : dashData.statusDokumen === 'Perlu Revisi'
                  ? 'Ada dokumen yang perlu diperbaiki'
                  : 'Status verifikasi dokumen persyaratan'}
              </p>
            </div>

            <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs text-center">
              <p className="text-xs text-slate-400 font-semibold mb-1.5">Status Seleksi</p>
              <p className={`text-lg font-black ${statusSeleksiColor()}`}>
                {dashData.statusSeleksi || '-'}
              </p>
              <p className="text-[11px] text-slate-400 mt-1">
                {dashData.statusSeleksi === 'Lolos'
                  ? 'Selamat! Anda lolos seleksi KKN Internasional'
                  : dashData.statusSeleksi === '-'
                  ? 'Tahap seleksi belum dimulai'
                  : 'Tahap seleksi sedang diproses oleh panitia'}
              </p>
            </div>

            <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs text-center">
              <p className="text-xs text-slate-400 font-semibold mb-1.5">Catatan Revisi</p>
              <p className={`text-lg font-black ${catatanColor()}`}>
                {dashData.catatanRevisi ? 'Revisi' : 'Tidak Ada'}
              </p>
              <p className="text-[11px] text-slate-400 mt-1">
                {dashData.catatanRevisi
                  ? 'Ada dokumen yang perlu diperbaiki dan diunggah ulang'
                  : 'Tidak ada catatan revisi dari panitia'}
              </p>
            </div>
          </div>

          {/* ===== Banner SK Kelulusan (Hanya Tampil Jika Mahasiswa Dinyatakan Lolos) ===== */}
          {dashData.statusSeleksi === 'Lolos' && (
            <div className="flex flex-wrap items-center justify-between bg-gradient-to-r from-[#0E4A3E] to-[#176253] rounded-2xl p-4 sm:p-5 text-white mb-6 shadow-sm gap-4">
              <div className="space-y-1">
                <span className="text-[11px] font-bold text-emerald-300 uppercase tracking-wider block">
                  Dokumen Resmi Kelulusan
                </span>
                <h3 className="text-sm sm:text-base font-extrabold">
                  Surat Keputusan (SK) Kelulusan Peserta KKN Internasional
                </h3>
                <p className="text-xs text-white/80 max-w-xl">
                  Selamat! Anda dinyatakan Lolos Seleksi KKN Internasional. Silakan buka menu Hasil Seleksi untuk mengunduh dan mencetak SK Kelulusan resmi Anda.
                </p>
              </div>
              <div className="flex items-center gap-3">
                <Link
                  href="/mahasiswa/hasil_seleksi"
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-white text-[#0E4A3E] hover:bg-emerald-50 rounded-xl text-xs sm:text-sm font-bold shadow-sm transition-all transform hover:-translate-y-0.5 cursor-pointer"
                >
                  <Printer className="w-4 h-4" />
                  Lihat &amp; Cetak SK Kelulusan (PDF)
                </Link>
              </div>
            </div>
          )}

          {/* ===== STATUS DATA PENDAFTARAN — Stage Tracker ===== */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 mb-8">
            <h2 className="text-sm font-black text-[#0E4A3E] uppercase tracking-wider mb-2">
              Status Data Pendaftaran
            </h2>
            <StageStepper stages={STAGES} currentStage={dashData.currentStage} />
          </div>

          {/* ===== Template Surat Grid ===== */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <div>
                <h2 className="text-sm font-black text-[#0E4A3E] uppercase tracking-wider">
                  Template Dokumen & Surat Resmi
                </h2>
                <p className="text-xs text-slate-500">
                  Unduh format berkas resmi yang telah diunggah oleh panitia untuk melengkapi pendaftaran
                </p>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {templateCards.map((card, i) => (
                <div
                  key={card.id ?? i}
                  className="bg-[#C8E6C9]/40 border border-[#568E7D]/30 rounded-2xl p-4 sm:p-5 flex items-center justify-between gap-3 hover:border-[#568E7D]/60 hover:bg-[#C8E6C9]/60 transition-all group"
                >
                  <div className="flex-1 min-w-0">
                    <h3 className="text-xs sm:text-sm font-bold text-[#0E4A3E] group-hover:text-[#0a382f] transition-colors truncate">
                      {card.label}
                    </h3>
                    <p className="text-[11px] text-slate-600 mt-0.5 truncate font-mono">
                      {card.desc}
                    </p>
                  </div>
                  {card.file_path ? (
                    <a
                      href={card.file_path}
                      download
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#0E4A3E] hover:bg-[#09372e] text-white rounded-xl text-xs font-bold transition-all shadow-xs shrink-0 cursor-pointer"
                      title="Unduh Berkas Template"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Unduh</span>
                    </a>
                  ) : (
                    <button
                      onClick={() => alert('Template berkas ini belum diunggah panitia.')}
                      className="text-slate-400 hover:text-slate-600 transition-colors shrink-0 p-1 cursor-not-allowed"
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
