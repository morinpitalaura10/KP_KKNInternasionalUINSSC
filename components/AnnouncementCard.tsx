import React from 'react';
import Link from 'next/link';
import { Calendar, ArrowRight, User, Megaphone, FileText } from 'lucide-react';

export interface AnnouncementData {
  id: string;
  day: string;
  month: string;
  year: string;
  title: string;
  summary: string;
  dateStr: string;
  authorStr?: string;
  fullContent?: string;
}

interface AnnouncementCardProps {
  id: string;
  day: string;
  month: string;
  year: string;
  title: string;
  summary: string;
  authorStr?: string;
}

export default function AnnouncementCard({
  id,
  day,
  month,
  year,
  title,
  summary,
  authorStr = 'Panitia Seleksi LP2M',
}: AnnouncementCardProps) {
  return (
    <div className="bg-[#0E4A3E]/60 hover:bg-[#0E4A3E]/85 backdrop-blur-md rounded-2xl border border-white/25 p-5 sm:p-7 shadow-lg text-white transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 flex flex-col justify-between gap-4 group">
      
      {/* Top Meta Bar */}
      <div className="flex flex-wrap items-center justify-between gap-2.5">
        {/* Date Chip */}
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 text-[#C0E6D8] border border-white/20 text-xs font-bold">
          <Calendar className="w-3.5 h-3.5 text-[#C0E6D8] shrink-0" />
          <span>{day} {month} {year}</span>
        </div>

        {/* Category Badge */}
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#C0E6D8]/20 text-[#C0E6D8] border border-[#C0E6D8]/30 text-[11px] font-bold">
          <Megaphone className="w-3 h-3 shrink-0" />
          Edaran Resmi
        </span>
      </div>

      {/* Middle Content */}
      <div className="space-y-2">
        <Link href={`/pengumuman/${id}`}>
          <h3 className="text-base sm:text-xl font-bold text-white group-hover:text-[#C0E6D8] transition-colors leading-snug cursor-pointer">
            {title}
          </h3>
        </Link>
        <p className="text-xs sm:text-sm text-emerald-100/90 leading-relaxed font-normal line-clamp-3">
          {summary}
        </p>
      </div>

      {/* Bottom Bar: Author & Read CTA */}
      <div className="pt-3 border-t border-white/15 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-xs text-emerald-200/90 font-medium">
          <User className="w-3.5 h-3.5 text-[#C0E6D8] shrink-0" />
          <span>Diterbitkan oleh: <strong className="text-white">{authorStr}</strong></span>
        </div>

        <Link
          href={`/pengumuman/${id}`}
          className="inline-flex items-center justify-center gap-2 bg-[#C0E6D8] hover:bg-white text-[#0E4A3E] font-black text-xs sm:text-sm px-5 py-2 rounded-full shadow-md hover:scale-105 active:scale-95 transition-all self-start sm:self-auto"
        >
          <span>Baca Selengkapnya</span>
          <ArrowRight className="w-4 h-4 stroke-[2.5]" />
        </Link>
      </div>

    </div>
  );
}

interface AnnouncementDetailCardProps {
  day: string;
  month: string;
  year: string;
  title: string;
  content: string;
  authorStr?: string;
}

export function AnnouncementDetailCard({
  day,
  month,
  year,
  title,
  content,
  authorStr = 'Panitia LP2M',
}: AnnouncementDetailCardProps) {
  return (
    <article className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200/80 shadow-md p-6 sm:p-10 md:p-12 space-y-6 text-slate-800">
      
      {/* Top Header Information */}
      <div className="border-b border-slate-100 pb-5 space-y-3">
        <div className="flex flex-wrap items-center gap-2.5 text-xs">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-[#0E4A3E] border border-emerald-200 font-bold">
            <Calendar className="w-3.5 h-3.5" />
            <span>{day} {month} {year}</span>
          </span>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 text-slate-600 font-medium">
            <User className="w-3.5 h-3.5" />
            <span>Penerbit: {authorStr}</span>
          </span>
        </div>

        <h1 className="text-xl sm:text-3xl font-archivo font-extrabold text-[#0E4A3E] leading-tight">
          {title}
        </h1>
      </div>

      {/* Main Announcement Body */}
      <div className="text-sm sm:text-base text-slate-700 font-normal leading-relaxed space-y-4 whitespace-pre-line">
        {content}
      </div>

    </article>
  );
}
