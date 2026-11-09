import React from 'react';
import { CheckCircle2 } from 'lucide-react';

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
  const stageCount = stages.length;
  const stageWidth = 100 / Math.max(stageCount, 1);
  const halfStage = stageWidth / 2;

  return (
    <div className={`overflow-x-auto pb-4 pt-2 -mx-2 px-2 scrollbar-thin scrollbar-thumb-slate-200 ${className}`}>
      <div className="min-w-[620px] relative flex items-start justify-between">
        {/* Horizontal Progress Guide Line (Terkunci tepat di tengah titik pertama s/d titik terakhir) */}
        <div
          className="absolute top-5 h-1.5 bg-slate-100 border border-slate-200/60 z-0 rounded-full"
          style={{
            left: `${halfStage}%`,
            right: `${halfStage}%`,
          }}
        />

        {stages.map((step) => {
          const isBerlangsung = step.status_tahapan === 'Berlangsung';
          const isSelesai = step.status_tahapan === 'Selesai';
          const isSelected = selectedStageId === step.id_timeline;

          return (
            <button
              key={step.id_timeline}
              onClick={() => onSelectStage(step.id_timeline)}
              style={{ width: `${stageWidth}%` }}
              className={`relative z-10 flex flex-col items-center text-center group cursor-pointer px-1 transition-all duration-200 ${
                isSelected ? 'scale-105' : 'hover:scale-102'
              }`}
            >
              {/* Step Circle */}
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center font-extrabold text-xs transition-all shadow-sm ${
                  isBerlangsung
                    ? 'bg-gradient-to-tr from-[#0E4A3E] to-emerald-600 text-white ring-4 ring-emerald-400/30 shadow-[0_4px_12px_rgba(14,74,62,0.25)] animate-pulse'
                    : isSelesai
                    ? 'bg-[#0E4A3E] text-white border-2 border-[#0E4A3E]'
                    : 'bg-white text-slate-600 border-2 border-slate-200 group-hover:border-[#0E4A3E]'
                }`}
              >
                {isSelesai ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-300 stroke-[2.5]" />
                ) : (
                  step.urutan
                )}
              </div>

              {/* Title */}
              <p
                className={`font-bold text-xs mt-2.5 line-clamp-2 leading-tight transition-colors ${
                  isSelected
                    ? 'text-[#0E4A3E] font-black underline underline-offset-4'
                    : 'text-slate-700 group-hover:text-[#0E4A3E]'
                }`}
              >
                {step.nama_tahapan}
              </p>

              {/* Date */}
              <p className="text-[10px] text-slate-500 font-medium mt-1">
                {step.tanggal_format}
              </p>

              {/* Status Pill */}
              <span
                className={`mt-1.5 px-2.5 py-0.5 rounded-full text-[9px] font-black border transition-all ${
                  isBerlangsung
                    ? 'bg-[#D6F2E5] text-[#0E4A3E] border-[#a2dfc7] shadow-2xs'
                    : isSelesai
                    ? 'bg-slate-100 text-slate-600 border-slate-200'
                    : 'bg-blue-50 text-blue-700 border-blue-200'
                }`}
              >
                {step.status_tahapan}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
