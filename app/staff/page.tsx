'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Users,
  Clock,
  FileCheck,
  Award,
  CheckCircle2,
  ChevronRight,
  ArrowRight,
  User,
  GraduationCap,
  Calendar,
  Layers,
} from 'lucide-react';
import { PageHeader, StatCardMint, ProgressBar, StatusBadge } from '@/components/ui';

interface StaffStats {
  totalPendaftar: number;
  menungguVerifikasi: number;
  verifikasiDokumen: number;
  lolosSeleksi: number;
  progressPercent: number;
}

interface RecentApplicant {
  id_pendaftaran: number;
  nama: string;
  nim: string;
  prodi: string;
  fakultas: string;
  status: string;
  tanggal_daftar: string;
}

export default function StaffDashboardPage() {
  const [stats, setStats] = useState<StaffStats>({
    totalPendaftar: 0,
    menungguVerifikasi: 0,
    verifikasiDokumen: 0,
    lolosSeleksi: 0,
    progressPercent: 0,
  });
  const [recentApplicants, setRecentApplicants] = useState<RecentApplicant[]>([]);
  const [activePeriode, setActivePeriode] = useState<{ id_periode: number; nama_periode: string; tahun: number } | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [userName, setUserName] = useState<string>('Staff');

  useEffect(() => {
    // Get logged-in user name from localStorage
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('currentUser');
      if (stored) {
        try {
          const user = JSON.parse(stored);
          setUserName(user.name || 'Staff');
        } catch {
          // ignore
        }
      }
    }

    async function loadData() {
      try {
        const res = await fetch('/api/staff/dashboard');
        const json = await res.json();
        if (json.success) {
          setStats(json.stats);
          setRecentApplicants(json.recentApplicants || []);
          if (json.activePeriode) setActivePeriode(json.activePeriode);
        }
      } catch (err) {
        console.error('Failed to load staff dashboard stats:', err);
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, []);

  return (
    <div className="w-full max-w-7xl space-y-6 pb-12 font-sans">
      {/* ── Top Header Area matching Design Mockup ── */}
      <PageHeader
        title="SELAMAT DATANG,"
        subtitle={`${userName.toUpperCase()}!`}
        description="Kelola proses verifikasi dokumen dan penilaian peserta KKN Internasional pada periode aktif."
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

      {/* ── 4 Stat Cards in Mint Green ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <StatCardMint value={stats.totalPendaftar} label="Total Pendaftar" />
        <StatCardMint value={stats.menungguVerifikasi} label="Menunggu Verifikasi" />
        <StatCardMint value={stats.verifikasiDokumen} label="Menunggu Wawancara" />
        <StatCardMint value={stats.lolosSeleksi} label="Lolos Seleksi" />
      </div>

      {/* ── Status Pendaftaran Progress Bar Card (Using Reusable ProgressBar without inline styles) ── */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-2xs space-y-3">
        <ProgressBar
          percent={stats.progressPercent}
          label="STATUS PROSES VERIFIKASI PENDAFTARAN"
        />
        <p className="text-[11px] text-slate-400 font-medium">Proses verifikasi dokumen sedang berjalan sesuai jadwal.</p>
      </div>

      {/* ── Bottom 2 Widgets Grid (Matching Mockup) ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Widget: Tahapan Verifikasi */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-2xs">
          <h3 className="font-extrabold text-sm text-slate-800 uppercase tracking-wider mb-6">
            Tahapan Verifikasi
          </h3>

          <div className="relative pl-6 space-y-8 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
            {/* Step 1 */}
            <div className="relative flex items-center justify-between">
              <div className="absolute -left-6 w-5 h-5 rounded-full bg-[#0E4A3E] text-white flex items-center justify-center text-[10px] font-bold">
                ✓
              </div>
              <div>
                <p className="text-sm font-bold text-slate-800">Penerimaan Berkas Pendaftaran</p>
                <p className="text-xs text-slate-400">Tahap unggah formulir & dokumen persyaratan</p>
              </div>
              <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                Selesai
              </span>
            </div>

            {/* Step 2 */}
            <div className="relative flex items-center justify-between">
              <div className="absolute -left-6 w-5 h-5 rounded-full bg-[#0E4A3E] text-white flex items-center justify-center text-[10px] font-bold">
                2
              </div>
              <div>
                <p className="text-sm font-bold text-slate-800">Verifikasi Dokumen oleh Staff</p>
                <p className="text-xs text-slate-400">Pemeriksaan keabsahan berkas & portofolio</p>
              </div>
              <span className="text-[11px] font-bold text-amber-700 bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-200">
                Sedang Proses
              </span>
            </div>

            {/* Step 3 */}
            <div className="relative flex items-center justify-between">
              <div className="absolute -left-6 w-5 h-5 rounded-full bg-slate-300 text-slate-600 flex items-center justify-center text-[10px] font-bold">
                3
              </div>
              <div>
                <p className="text-sm font-bold text-slate-600">Pelaksanaan Seleksi Wawancara</p>
                <p className="text-xs text-slate-400">Penilaian kompetensi bahasa & komitmen</p>
              </div>
              <span className="text-[11px] font-bold text-slate-500 bg-slate-100 px-2.5 py-0.5 rounded-full border border-slate-200">
                Dalam Antrean
              </span>
            </div>
          </div>
        </div>

        {/* Right Widget: Pendaftar Terbaru */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-2xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-extrabold text-sm text-slate-800 uppercase tracking-wider">
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
                  <div key={app.id_pendaftaran} className="py-3 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-[#0E4A3E]/10 text-[#0E4A3E] flex items-center justify-center font-bold text-xs shrink-0">
                        {app.nama.charAt(0)}
                      </div>
                      <div>
                        <p className="text-xs sm:text-sm font-bold text-slate-800 leading-snug">
                          {app.nama}
                        </p>
                        <p className="text-[11px] text-slate-400">
                          {app.nim} • {app.prodi}
                        </p>
                      </div>
                    </div>

                    <div>
                      <StatusBadge status={app.status} />
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <Link
            href="/staff/verifikasi"
            className="w-full mt-4 py-2.5 rounded-xl bg-[#0E4A3E] hover:bg-[#09352c] text-white text-xs font-bold text-center shadow-xs transition-colors flex items-center justify-center gap-2"
          >
            <span>Mulai Verifikasi Berkas</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </div>
  );
}
