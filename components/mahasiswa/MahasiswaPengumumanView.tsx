'use client';

import React from 'react';
import Link from 'next/link';
import {
  Megaphone,
  RefreshCw,
  BellRing,
  Calendar,
  ArrowRight,
  Info,
  UserCheck,
} from 'lucide-react';
import { HeroBanner } from '@/components/ui';

export interface PengumumanItem {
  id: number;
  judul: string;
  isi: string;
  tanggal_publish: string;
  nama_user: string | null;
}

export interface MahasiswaPengumumanViewProps {
  items: PengumumanItem[];
  isLoading: boolean;
  formatDate: (dateStr: string) => string;
  getTag: (judul: string) => string;
}

export default function MahasiswaPengumumanView({
  items,
  isLoading,
  formatDate,
  getTag,
}: MahasiswaPengumumanViewProps) {
  return (
    <div className="kkn-page-container font-sans">
      <HeroBanner
        badgeIcon={<Megaphone className="w-3.5 h-3.5 text-[#C0E6D8]" />}
        badgeText="Warta & Publikasi Resmi LP2M"
        title="PENGUMUMAN RESMI"
        description="Informasi dan pengumuman resmi terkait seleksi, administrasi, dan pembekalan KKN Internasional dari LP2M UIN Siber Syekh Nurjati Cirebon."
        aside={
          <div className="kkn-hero-aside-card space-y-1 min-w-[200px] self-start md:self-auto">
            <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#C0E6D8] block">
              Publikasi Aktif
            </span>
            <p className="font-extrabold text-2xl sm:text-3xl font-archivo leading-tight">
              {items.length} <span className="text-xs font-normal text-emerald-200">Pengumuman</span>
            </p>
            <span className="text-[11px] text-emerald-100/80 block pt-0.5">
              Update berkala panitia
            </span>
          </div>
        }
      />

      {isLoading ? (
        <div className="py-16 flex flex-col items-center justify-center text-slate-400 gap-2">
          <RefreshCw className="w-6 h-6 animate-spin text-[#0E4A3E]" />
          <span className="text-xs font-semibold">Memuat pengumuman dari database...</span>
        </div>
      ) : items.length === 0 ? (
        <div className="w-full bg-gradient-to-b from-[#F6FAF8] to-white border border-[#C0E6D8] rounded-3xl p-8 sm:p-12 text-center shadow-xs">
          <div className="mx-auto w-20 h-20 rounded-3xl bg-[#E8F5F1] border border-[#C0E6D8] flex items-center justify-center text-[#0E4A3E] shadow-xs mb-5">
            <BellRing className="w-9 h-9 text-[#0E4A3E] stroke-[2.2]" />
          </div>

          <h3 className="text-lg sm:text-xl font-extrabold text-slate-800 tracking-tight">
            Belum Ada Pengumuman Baru
          </h3>
          <p className="text-xs sm:text-sm text-slate-600 max-w-lg mx-auto mt-2 leading-relaxed">
            Saat ini panitia belum menerbitkan pengumuman terbaru untuk periode KKN yang sedang berjalan.
            Segala pembaruan informasi, jadwal wawancara, dan hasil seleksi akan diumumkan di sini.
          </p>

          <div className="mt-8 pt-8 border-t border-slate-200/80 max-w-2xl mx-auto">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-3.5">
              Menu Mahasiswa Terkait:
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-left">
              <Link
                href="/mahasiswa/informasi"
                className="group p-4 rounded-2xl bg-white hover:bg-emerald-50/60 border border-slate-200 hover:border-emerald-300 transition-all shadow-2xs flex items-center justify-between gap-3"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-xl bg-[#E8F5F1] text-[#0E4A3E] flex items-center justify-center shrink-0">
                    <Info className="w-5 h-5 text-[#0E4A3E]" />
                  </div>
                  <div className="min-w-0">
                    <h4 className="font-bold text-xs sm:text-sm text-slate-900 group-hover:text-[#0E4A3E] transition-colors truncate">
                      Informasi &amp; Panduan
                    </h4>
                    <p className="text-[11px] text-slate-500 truncate">
                      Cek alur dan pengarahan umum KKN
                    </p>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-[#0E4A3E] group-hover:translate-x-1 transition-all shrink-0" />
              </Link>

              <Link
                href="/mahasiswa/status_pendaftaran"
                className="group p-4 rounded-2xl bg-white hover:bg-emerald-50/60 border border-slate-200 hover:border-emerald-300 transition-all shadow-2xs flex items-center justify-between gap-3"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-xl bg-[#E8F5F1] text-[#0E4A3E] flex items-center justify-center shrink-0">
                    <UserCheck className="w-5 h-5 text-[#0E4A3E]" />
                  </div>
                  <div className="min-w-0">
                    <h4 className="font-bold text-xs sm:text-sm text-slate-900 group-hover:text-[#0E4A3E] transition-colors truncate">
                      Status Pendaftaran
                    </h4>
                    <p className="text-[11px] text-slate-500 truncate">
                      Pantau berkas &amp; verifikasi Anda
                    </p>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-[#0E4A3E] group-hover:translate-x-1 transition-all shrink-0" />
              </Link>
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {items.map((ann) => (
            <Link
              key={ann.id}
              href={`/pengumuman/${ann.id}`}
              className="group block bg-gradient-to-br from-white to-[#F2F8F5] rounded-2xl sm:rounded-3xl border border-[#C0E6D8] p-5 sm:p-6 shadow-xs hover:shadow-md hover:border-[#0E4A3E] transition-all duration-200 cursor-pointer"
            >
              <div className="flex items-start gap-4">
                <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-[#0E4A3E] text-[#C0E6D8] flex items-center justify-center shrink-0 shadow-xs group-hover:scale-105 transition-transform">
                  <Megaphone className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0 space-y-1.5">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="bg-[#EAF5F0] text-[#0E4A3E] border border-[#C0E6D8] text-[10px] font-extrabold px-3 py-0.5 rounded-full uppercase tracking-wider">
                      {getTag(ann.judul)}
                    </span>
                    <span className="flex items-center gap-1 text-xs text-slate-500 font-medium">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      {formatDate(ann.tanggal_publish)}
                    </span>
                  </div>

                  <h3 className="font-bold text-sm sm:text-base text-slate-900 group-hover:text-[#0E4A3E] transition-colors leading-snug">
                    {ann.judul}
                  </h3>

                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed line-clamp-2">
                    {ann.isi}
                  </p>

                  <div className="pt-2 flex items-center gap-1 text-xs font-bold text-[#0E4A3E] group-hover:translate-x-1 transition-transform">
                    <span>Baca Selengkapnya</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
