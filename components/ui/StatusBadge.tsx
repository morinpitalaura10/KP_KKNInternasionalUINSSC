import React from 'react';
import { CheckCircle2, Clock, AlertTriangle, XCircle, FileCheck, Award, Users } from 'lucide-react';

export type StatusType =
  | 'Lolos'
  | 'Cadangan'
  | 'Tidak Lolos'
  | 'Tidak_Lolos'
  | 'Menunggu'
  | 'Menunggu_Verifikasi'
  | 'Verifikasi_Dokumen'
  | 'Terverifikasi'
  | 'Perlu Perbaikan'
  | 'Perbaikan_Dokumen'
  | 'Draft'
  | 'Wawancara';

interface StatusBadgeProps {
  status: StatusType | string;
  size?: 'sm' | 'md';
}

export default function StatusBadge({ status, size = 'sm' }: StatusBadgeProps) {
  const norm = (status || '').replace(/_/g, ' ').toLowerCase().trim();

  const sizeClasses = size === 'sm' ? 'text-[11px] px-2.5 py-0.5' : 'text-xs px-3.5 py-1';

  // 1. Menunggu / Menunggu Verifikasi (Warna Kuning/Amber)
  if (norm.includes('menunggu')) {
    return (
      <span className={`inline-flex items-center gap-1.5 font-bold rounded-full bg-amber-100 text-amber-900 border border-amber-300 shadow-2xs whitespace-nowrap ${sizeClasses}`}>
        <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
        <Clock className="w-3 h-3 text-amber-600" />
        Menunggu Verifikasi
      </span>
    );
  }

  // 2. Terverifikasi / Verifikasi Dokumen / Sesuai (Warna Biru Langit / Sky Blue) -> BEDA DARI LOLOS
  if (
    norm.includes('verifikasi dokumen') ||
    norm.includes('terverifikasi') ||
    norm === 'sesuai' ||
    norm === 'valid'
  ) {
    return (
      <span className={`inline-flex items-center gap-1.5 font-bold rounded-full bg-sky-100 text-sky-900 border border-sky-300 shadow-2xs whitespace-nowrap ${sizeClasses}`}>
        <FileCheck className="w-3 h-3 text-sky-600" />
        Terverifikasi
      </span>
    );
  }

  // 3. Wawancara (Warna Ungu / Indigo)
  if (norm.includes('wawancara')) {
    return (
      <span className={`inline-flex items-center gap-1.5 font-bold rounded-full bg-indigo-100 text-indigo-900 border border-indigo-300 shadow-2xs whitespace-nowrap ${sizeClasses}`}>
        <Users className="w-3 h-3 text-indigo-600" />
        Wawancara
      </span>
    );
  }

  // 4. Lolos Seleksi (Warna Hijau Emerald Juara / Brand KKN) -> HIJAU
  if (norm.includes('lolos') && !norm.includes('tidak')) {
    return (
      <span className={`inline-flex items-center gap-1.5 font-extrabold rounded-full bg-emerald-100 text-emerald-900 border border-emerald-300 shadow-2xs whitespace-nowrap ${sizeClasses}`}>
        <Award className="w-3.5 h-3.5 text-emerald-700" />
        Lolos Seleksi
      </span>
    );
  }

  // 5. Perlu Perbaikan / Revisi (Warna Oranye)
  if (norm.includes('perbaikan') || norm.includes('revisi')) {
    return (
      <span className={`inline-flex items-center gap-1.5 font-bold rounded-full bg-orange-100 text-orange-900 border border-orange-300 shadow-2xs whitespace-nowrap ${sizeClasses}`}>
        <AlertTriangle className="w-3 h-3 text-orange-600" />
        Perlu Perbaikan
      </span>
    );
  }

  // 6. Cadangan (Warna Ungu Muda)
  if (norm.includes('cadangan')) {
    return (
      <span className={`inline-flex items-center gap-1.5 font-bold rounded-full bg-purple-100 text-purple-900 border border-purple-300 shadow-2xs whitespace-nowrap ${sizeClasses}`}>
        <Clock className="w-3 h-3 text-purple-600" />
        Cadangan
      </span>
    );
  }

  // 7. Tidak Lolos (Warna Merah / Rose)
  if (norm.includes('tidak lolos') || norm.includes('tidak sesuai') || norm.includes('ditolak')) {
    return (
      <span className={`inline-flex items-center gap-1.5 font-bold rounded-full bg-rose-100 text-rose-900 border border-rose-300 shadow-2xs whitespace-nowrap ${sizeClasses}`}>
        <XCircle className="w-3 h-3 text-rose-600" />
        Tidak Lolos
      </span>
    );
  }

  // 8. Draft (Warna Abu-abu Netral)
  if (norm.includes('draft')) {
    return (
      <span className={`inline-flex items-center gap-1.5 font-bold rounded-full bg-slate-100 text-slate-700 border border-slate-300 shadow-2xs whitespace-nowrap ${sizeClasses}`}>
        Draft
      </span>
    );
  }

  // Fallback default
  return (
    <span className={`inline-flex items-center gap-1.5 font-bold rounded-full bg-slate-100 text-slate-700 border border-slate-300 ${sizeClasses}`}>
      {status}
    </span>
  );
}
