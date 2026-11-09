import React from 'react';
import Image from 'next/image';

export interface TimelineData {
  id: number;
  title: string;
  date: string;
  status: 'Berlangsung' | 'Belum Dimulai' | 'Selesai';
}

interface TimelineItemProps {
  title: string;
  date: string;
  status: 'Berlangsung' | 'Belum Dimulai' | 'Selesai';
}

export default function TimelineItem({ title, date, status }: TimelineItemProps) {
  const isBerlangsung = status === 'Berlangsung';
  const isSelesai = status === 'Selesai';

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-md p-5 sm:p-6 flex flex-col sm:flex-row items-center justify-between gap-4 transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5">
      {/* Left Icon & Information */}
      <div className="flex items-center gap-4 w-full sm:w-auto">
        <div className="w-12 h-12 shrink-0 rounded-full bg-[#0E4A3E] border-2 border-amber-400 flex items-center justify-center p-1 shadow-sm">
          <Image
            src="/uinssc.png"
            alt="UINSSC Seal"
            width={36}
            height={36}
            className="object-contain w-full h-full"
          />
        </div>

        <div className="space-y-0.5">
          <h3 className="text-sm sm:text-base font-bold text-gray-800 leading-snug">
            {title}
          </h3>
          <p className="text-xs sm:text-sm text-gray-500 font-medium">
            {date}
          </p>
        </div>
      </div>

      {/* Right Status Badge */}
      <div className="shrink-0 w-full sm:w-auto flex justify-end">
        <span
          className={`px-6 py-2 rounded-full text-xs sm:text-sm font-bold shadow-sm transition-colors text-center inline-block min-w-[140px] ${
            isBerlangsung
              ? 'bg-[#a8d5c2] text-[#0E4A3E]'
              : isSelesai
              ? 'bg-[#0E4A3E] text-white'
              : 'bg-gray-200 text-gray-600'
          }`}
        >
          {status}
        </span>
      </div>
    </div>
  );
}
