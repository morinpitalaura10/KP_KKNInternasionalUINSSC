'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Megaphone, Clock, RefreshCw, BellRing, Calendar, FileText, ArrowRight, Info, UserCheck } from 'lucide-react';
import { PageHeader } from '@/components/ui';

interface PengumumanItem {
  id: number;
  judul: string;
  isi: string;
  tanggal_publish: string;
  nama_user: string | null;
}

export default function PengumumanMahasiswaPage() {
  const [items, setItems] = useState<PengumumanItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadPengumuman() {
      try {
        const res = await fetch('/api/pengumuman');
        const json = await res.json();
        if (json.success && Array.isArray(json.data)) {
          setItems(json.data);
        }
      } catch (err) {
        console.error('Failed to load pengumuman:', err);
      } finally {
        setIsLoading(false);
      }
    }
    loadPengumuman();
  }, []);

  const formatDate = (dateStr: string) => {
    try {
      return new Date(dateStr).toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      });
    } catch {
      return dateStr;
    }
  };

  const getTag = (judul: string) => {
    const lower = judul.toLowerCase();
    if (lower.includes('verifikasi')) return 'Verifikasi';
    if (lower.includes('wawancara')) return 'Wawancara';
    if (lower.includes('seleksi') || lower.includes('hasil')) return 'Seleksi';
    if (lower.includes('pembekalan')) return 'Pembekalan';
    if (lower.includes('pelaksanaan')) return 'Pelaksanaan';
    return 'Pendaftaran';
  };

  return (
    <div className="w-full max-w-7xl space-y-6 pb-12 font-sans">
      <PageHeader
        title="PENGUMUMAN"
        subtitle="KULIAH KERJA NYATA INTERNASIONAL"
        description="Informasi dan pengumuman resmi dari panitia KKN Internasional LP2M UINSSC."
      />

      {isLoading ? (
        <div className="py-16 flex flex-col items-center justify-center text-slate-400 gap-2">
          <RefreshCw className="w-6 h-6 animate-spin text-[#0E4A3E]" />
          <span className="text-xs font-semibold">Memuat pengumuman dari database...</span>
        </div>
      ) : items.length === 0 ? (
        <div className="w-full bg-gradient-to-b from-[#F6FAF8] to-white border border-[#C0E6D8] rounded-3xl p-8 sm:p-12 text-center shadow-xs">
          {/* Icon Illustration */}
          <div className="mx-auto w-20 h-20 rounded-3xl bg-[#E8F5F1] border border-[#C0E6D8] flex items-center justify-center text-[#0E4A3E] shadow-xs mb-5">
            <BellRing className="w-9 h-9 text-[#0E4A3E] stroke-[2.2]" />
          </div>

          {/* Title & Description */}
          <h3 className="text-lg sm:text-xl font-extrabold text-slate-800 tracking-tight">
            Belum Ada Pengumuman Baru
          </h3>
          <p className="text-xs sm:text-sm text-slate-600 max-w-lg mx-auto mt-2 leading-relaxed">
            Saat ini panitia belum menerbitkan pengumuman terbaru untuk periode KKN yang sedang berjalan.
            Segala pembaruan informasi, jadwal wawancara, dan hasil seleksi akan diumumkan di sini.
          </p>

          {/* Quick Navigation Cards */}
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
            <div key={ann.id} className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 hover:border-[#568E7D]/50 transition-all">
              <div className="flex items-start gap-4">
                <div className="p-2.5 bg-[#C8E6C9]/50 rounded-xl shrink-0">
                  <Megaphone className="w-5 h-5 text-[#0E4A3E]" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="bg-[#0E4A3E] text-white text-[10px] font-bold px-2.5 py-0.5 rounded-full">
                      {getTag(ann.judul)}
                    </span>
                    <span className="flex items-center gap-1 text-[11px] text-slate-400">
                      <Clock className="w-3 h-3" /> {formatDate(ann.tanggal_publish)}
                    </span>
                  </div>
                  <h3 className="font-bold text-sm text-slate-800 mb-1.5">{ann.judul}</h3>
                  <p className="text-xs text-slate-500 leading-relaxed line-clamp-3">{ann.isi}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
