import React from 'react';
import { Calendar, Check, Clock } from 'lucide-react';

export interface TimelineData {
  id: number;
  title: string;
  date: string;
  deskripsi?: string;
  status: 'Berlangsung' | 'Belum Dimulai' | 'Selesai';
}

interface TimelineItemProps {
  stepNumber: number;
  title: string;
  date: string;
  deskripsi?: string;
  status: 'Berlangsung' | 'Belum Dimulai' | 'Selesai';
  isLast?: boolean;
}

export default function TimelineItem({
  stepNumber,
  title,
  date,
  deskripsi,
  status,
  isLast = false,
}: TimelineItemProps) {
  const isBerlangsung = status === 'Berlangsung';
  const isSelesai = status === 'Selesai';

  return (
    <div className="relative flex items-start gap-3.5 sm:gap-6 group">
      {/* Vertical Connecting Line */}
      {!isLast && (
        <div
          className={`absolute left-[19px] sm:left-[23px] top-[42px] bottom-[-20px] w-[2px] transition-colors ${
            isSelesai
              ? 'bg-[#C0E6D8]/60'
              : isBerlangsung
              ? 'bg-gradient-to-b from-[#C0E6D8] to-white/20'
              : 'bg-white/20'
          }`}
        />
      )}

      {/* Step Node Icon / Number */}
      <div className="relative z-10 shrink-0 mt-1">
        {isBerlangsung ? (
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-[#C0E6D8] text-[#0E4A3E] font-black text-sm sm:text-base flex items-center justify-center shadow-lg shadow-[#0E4A3E]/40 ring-4 ring-[#C0E6D8]/40 animate-pulse">
            {String(stepNumber).padStart(2, '0')}
          </div>
        ) : isSelesai ? (
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-[#0E4A3E] text-[#C0E6D8] font-bold border-2 border-[#C0E6D8] flex items-center justify-center shadow-md">
            <Check className="w-5 h-5 sm:w-6 sm:h-6 stroke-[3]" />
          </div>
        ) : (
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-white/10 text-white/80 font-bold border border-white/25 flex items-center justify-center text-xs sm:text-sm">
            {String(stepNumber).padStart(2, '0')}
          </div>
        )}
      </div>

      {/* Stage Card */}
      <div
        className={`flex-1 rounded-2xl p-4 sm:p-6 transition-all duration-300 ${
          isBerlangsung
            ? 'bg-[#0E4A3E] border-2 border-[#C0E6D8] shadow-2xl text-white'
            : isSelesai
            ? 'bg-[#0E4A3E]/60 hover:bg-[#0E4A3E]/80 border border-white/20 text-white shadow-md'
            : 'bg-[#0E4A3E]/40 hover:bg-[#0E4A3E]/60 border border-white/15 text-white/90'
        }`}
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-4 mb-2">
          {/* Stage Title */}
          <h3
            className={`text-sm sm:text-lg font-bold leading-snug ${
              isBerlangsung ? 'text-[#C0E6D8]' : 'text-white'
            }`}
          >
            {title}
          </h3>

          {/* Status Badge */}
          <div className="shrink-0 self-start sm:self-auto">
            {isBerlangsung ? (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#C0E6D8] text-[#0E4A3E] text-xs font-black shadow-xs">
                <span className="w-2 h-2 rounded-full bg-[#0E4A3E] animate-ping" />
                Sedang Berlangsung
              </span>
            ) : isSelesai ? (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/15 text-emerald-200 border border-emerald-400/30 text-xs font-bold">
                <Check className="w-3.5 h-3.5" />
                Tahapan Selesai
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-white/70 border border-white/15 text-xs font-medium">
                <Clock className="w-3.5 h-3.5" />
                Belum Dimulai
              </span>
            )}
          </div>
        </div>

        {/* Date Row */}
        <div className="flex items-center gap-2 text-xs sm:text-sm font-semibold text-emerald-100/95 mb-2">
          <Calendar className="w-4 h-4 text-[#C0E6D8] shrink-0" />
          <span>{date}</span>
        </div>

        {/* Description */}
        {deskripsi && (
          <p className="text-xs sm:text-sm text-emerald-100/80 leading-relaxed font-normal pt-2 border-t border-white/10">
            {deskripsi}
          </p>
        )}
      </div>
    </div>
  );
}
