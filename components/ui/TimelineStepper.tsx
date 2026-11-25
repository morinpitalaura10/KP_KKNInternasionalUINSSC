'use client';

import React from 'react';
import { CheckCircle2, ChevronRight, Clock } from 'lucide-react';

export interface TimelineStageItem {
  id_timeline: number;
  nama_tahapan: string;
  tanggal_format: string;
  status_tahapan: 'Selesai' | 'Berlangsung' | 'Belum Dimulai' | 'Mendatang' | string;
  urutan: number;
}

interface TimelineStepperProps {
  stages: TimelineStageItem[];
  selectedStageId?: number | null;
  onSelectStage: (id: number) => void;
  className?: string;
}

export default function TimelineStepper({
  stages,
  selectedStageId,
  onSelectStage,
  className = '',
}: TimelineStepperProps) {
  if (!stages || stages.length === 0) return null;

  return (
    <div className={`w-full overflow-x-auto pb-4 pt-2 scrollbar-thin scrollbar-thumb-[#C0E6D8] scrollbar-track-transparent ${className}`}>
      <div className="inline-flex items-start gap-0 relative min-w-max px-4">
        {stages.map((step, idx) => {
          const isBerlangsung = step.status_tahapan === 'Berlangsung';
          const isSelesai = step.status_tahapan === 'Selesai';
          const isSelected = selectedStageId === step.id_timeline;
          const isLast = idx === stages.length - 1;

          return (
            <div
              key={step.id_timeline}
              className="relative w-[140px] sm:w-[160px] shrink-0 flex flex-col items-center"
            >
              {/* Connecting Line to next step */}
              {!isLast && (
                <div
                  className={`absolute top-5 sm:top-5.5 left-1/2 w-full h-1 z-0 transition-colors ${
                    isSelesai
                      ? 'bg-[#0E4A3E]'
                      : isBerlangsung
                      ? 'bg-gradient-to-r from-emerald-500 to-slate-200'
                      : 'bg-slate-200'
                  }`}
                />
              )}

              {/* Clickable Step Button */}
              <button
                type="button"
                onClick={() => onSelectStage(step.id_timeline)}
                className={`relative z-10 w-full flex flex-col items-center text-center group cursor-pointer px-2 transition-all duration-200 focus:outline-hidden ${
                  isSelected ? 'scale-102' : 'hover:scale-101'
                }`}
              >
                {/* Step Circle Node */}
                <div
                  className={`w-10 h-10 sm:w-11 sm:h-11 rounded-full flex items-center justify-center font-extrabold text-xs sm:text-sm transition-all shadow-xs ${
                    isSelected
                      ? 'bg-[#0E4A3E] text-white ring-4 ring-[#C0E6D8] shadow-md scale-105'
                      : isBerlangsung
                      ? 'bg-gradient-to-tr from-[#0E4A3E] to-emerald-600 text-white ring-4 ring-emerald-300 shadow-md animate-pulse'
                      : isSelesai
                      ? 'bg-[#0E4A3E] text-white border-2 border-[#0E4A3E]'
                      : 'bg-white text-slate-600 border-2 border-slate-300 group-hover:border-[#0E4A3E] group-hover:text-[#0E4A3E]'
                  }`}
                >
                  {isSelesai ? (
                    <CheckCircle2 className="w-5 h-5 text-[#C0E6D8] stroke-[2.5]" />
                  ) : (
                    <span>{step.urutan}</span>
                  )}
                </div>

                {/* Stage Title */}
                <div className="w-full mt-2.5 px-1 min-h-[36px] flex items-center justify-center">
                  <p
                    className={`text-xs font-bold leading-tight transition-colors line-clamp-2 ${
                      isSelected
                        ? 'text-[#0E4A3E] font-black'
                        : 'text-slate-800 group-hover:text-[#0E4A3E]'
                    }`}
                    title={step.nama_tahapan}
                  >
                    {step.nama_tahapan}
                  </p>
                </div>

                {/* Date */}
                <p className="text-[10px] text-slate-500 font-medium mt-1 leading-tight">
                  {step.tanggal_format}
                </p>

                {/* Status Badge */}
                <div className="mt-2">
                  <span
                    className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold border transition-all whitespace-nowrap ${
                      isBerlangsung
                        ? 'bg-emerald-100 text-emerald-800 border-emerald-300 shadow-2xs'
                        : isSelesai
                        ? 'bg-[#0E4A3E] text-white border-[#0E4A3E]'
                        : 'bg-slate-100 text-slate-600 border-slate-200'
                    }`}
                  >
                    {step.status_tahapan}
                  </span>
                </div>
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
