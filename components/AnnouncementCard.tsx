import React from 'react';
import Link from 'next/link';

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
}

export default function AnnouncementCard({
  id,
  day,
  month,
  year,
  title,
  summary,
}: AnnouncementCardProps) {
  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-md overflow-hidden flex flex-col sm:flex-row items-center justify-between transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5">
      {/* Left Mint Date Block */}
      <div className="bg-[#a8d5c2] text-[#0E4A3E] w-full sm:w-36 p-6 flex flex-col items-center justify-center shrink-0 h-full text-center">
        <span className="text-3xl font-extrabold font-archivo leading-none">
          {day}
        </span>
        <span className="text-sm font-bold mt-1">
          {month}
        </span>
        <span className="text-xs font-semibold">
          {year}
        </span>
      </div>

      {/* Middle Text Information */}
      <div className="p-6 flex-1 space-y-1">
        <h3 className="text-base sm:text-lg font-bold text-gray-900 leading-snug">
          {title}
        </h3>
        <p className="text-xs sm:text-sm text-gray-500 font-normal">
          {summary}
        </p>
      </div>

      {/* Right Action Button */}
      <div className="p-6 shrink-0 w-full sm:w-auto flex justify-end">
        <Link
          href={`/pengumuman/${id}`}
          className="bg-[#0E4A3E] text-white hover:bg-[#0a382f] border border-white/20 text-xs sm:text-sm font-semibold px-6 py-2.5 rounded-full shadow-md transition-all hover:scale-105 inline-block text-center"
        >
          Selengkapnya
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
}

export function AnnouncementDetailCard({
  day,
  month,
  year,
  title,
  content,
}: AnnouncementDetailCardProps) {
  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-lg overflow-hidden flex flex-col md:flex-row min-h-[350px]">
      {/* Left Date Block */}
      <div className="bg-[#a8d5c2] text-[#0E4A3E] w-full md:w-44 p-8 flex flex-col items-center justify-center shrink-0 text-center">
        <span className="text-4xl font-extrabold font-archivo leading-none">
          {day}
        </span>
        <span className="text-base font-bold mt-2">
          {month}
        </span>
        <span className="text-sm font-semibold">
          {year}
        </span>
      </div>

      {/* Right Full Content Area */}
      <div className="p-8 md:p-10 flex-1 space-y-4">
        <h2 className="text-lg sm:text-xl font-bold text-gray-900 leading-snug border-b border-gray-100 pb-3">
          {title}
        </h2>
        <div className="text-xs sm:text-sm text-gray-700 font-normal leading-relaxed space-y-3 whitespace-pre-line">
          {content}
        </div>
      </div>
    </div>
  );
}
