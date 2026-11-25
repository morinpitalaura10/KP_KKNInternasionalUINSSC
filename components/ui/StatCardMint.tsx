'use client';

import React from 'react';
import {
  Users,
  Clock,
  FileCheck,
  Award,
  Globe2,
  GraduationCap,
  CheckCircle2,
  AlertCircle,
  FileText,
} from 'lucide-react';

export interface StatCardMintProps {
  value: string | number;
  label: string;
  subLabel?: string;
  badge?: React.ReactNode;
  icon?: React.ReactNode;
  className?: string;
}

const resolveIcon = (lbl: string, customIcon?: React.ReactNode) => {
  if (customIcon) return customIcon;
  const l = lbl.toLowerCase();
  if (
    l.includes('pendaftar') ||
    l.includes('mahasiswa') ||
    l.includes('user') ||
    l.includes('admin') ||
    l.includes('staff')
  ) {
    return <Users className="w-4 h-4 sm:w-5 sm:h-5" />;
  }
  if (
    l.includes('menunggu') ||
    l.includes('antrean') ||
    l.includes('jadwal') ||
    l.includes('agenda') ||
    l.includes('akan datang') ||
    l.includes('timeline')
  ) {
    return <Clock className="w-4 h-4 sm:w-5 sm:h-5" />;
  }
  if (
    l.includes('revisi') ||
    l.includes('perbaikan') ||
    l.includes('nonaktif') ||
    l.includes('ditolak')
  ) {
    return <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5" />;
  }
  if (
    l.includes('verifikasi') ||
    l.includes('dokumen') ||
    l.includes('berkas') ||
    l.includes('pdf')
  ) {
    return <FileCheck className="w-4 h-4 sm:w-5 sm:h-5" />;
  }
  if (
    l.includes('lolos') ||
    l.includes('selesai') ||
    l.includes('terverifikasi') ||
    l.includes('kuota')
  ) {
    return <Award className="w-4 h-4 sm:w-5 sm:h-5" />;
  }
  if (l.includes('negara')) {
    return <Globe2 className="w-4 h-4 sm:w-5 sm:h-5" />;
  }
  if (
    l.includes('akademik') ||
    l.includes('prodi') ||
    l.includes('ipk') ||
    l.includes('sks')
  ) {
    return <GraduationCap className="w-4 h-4 sm:w-5 sm:h-5" />;
  }
  if (l.includes('informasi')) {
    return <FileText className="w-4 h-4 sm:w-5 sm:h-5" />;
  }
  return <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5" />;
};

const resolveBadge = (lbl: string, customBadge?: React.ReactNode) => {
  if (customBadge) return customBadge;
  const l = lbl.toLowerCase();
  if (l.includes('total')) return 'Semua';
  if (l.includes('menunggu') || l.includes('antrean')) return 'Antrean';
  if (l.includes('verifikasi') || l.includes('berkas')) return 'Verifikasi';
  if (l.includes('lolos')) return 'Lolos Akhir';
  if (l.includes('aktif') && !l.includes('non')) return 'Aktif';
  if (l.includes('nonaktif')) return 'Nonaktif';
  if (l.includes('revisi') || l.includes('perbaikan')) return 'Revisi';
  if (l.includes('ditolak')) return 'Ditolak';
  if (l.includes('wajib')) return 'Wajib';
  if (l.includes('opsional')) return 'Opsional';
  if (l.includes('kuota')) return 'Kuota';
  return 'Data';
};

export default function StatCardMint({
  value,
  label,
  subLabel,
  badge,
  icon,
  className = '',
}: StatCardMintProps) {
  const renderedIcon = resolveIcon(label, icon);
  const badgeText = resolveBadge(label, badge);

  return (
    <div
      className={`bg-gradient-to-b from-[#D4F1E4] to-[#BEE6D7] rounded-2xl p-4 sm:p-5 border border-[#9FD3C3] shadow-[0_4px_14px_rgba(14,74,62,0.08)] hover:shadow-[0_8px_20px_rgba(14,74,62,0.14)] hover:-translate-y-0.5 transition-all flex flex-col justify-between gap-3 group text-left ${className}`}
    >
      <div className="flex items-center justify-between gap-2">
        <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-[#0E4A3E] text-[#C0E6D8] flex items-center justify-center shrink-0 shadow-xs group-hover:scale-105 transition-transform">
          {renderedIcon}
        </div>
        {typeof badgeText === 'string' ? (
          <span className="text-[10px] text-[#0E4A3E] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-white/70 border border-[#9FD3C3]">
            {badgeText}
          </span>
        ) : (
          badgeText
        )}
      </div>

      <div>
        <span className="text-[11px] sm:text-xs font-bold text-[#0E4A3E]/80 block mb-0.5">
          {label}
        </span>
        <span className="text-2xl sm:text-3xl font-archivo font-extrabold text-[#0E4A3E] tracking-tight block">
          {value}
        </span>
        {subLabel && (
          <p className="text-[11px] text-[#0E4A3E]/70 mt-1 leading-tight line-clamp-1">
            {subLabel}
          </p>
        )}
      </div>
    </div>
  );
}
