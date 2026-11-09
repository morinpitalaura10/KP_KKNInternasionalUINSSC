import React from 'react';
import { Check } from 'lucide-react';

export interface PipelineStep {
  id: number | string;
  nama: string;
  count: number;
  isActive: boolean;
}

interface PipelineStepperProps {
  tahapan?: PipelineStep[];
  className?: string;
  onStepClick?: (step: PipelineStep) => void;
}

const DEFAULT_TAHAPAN: PipelineStep[] = [
  { id: 1, nama: 'Pendaftaran', count: 0, isActive: true },
  { id: 2, nama: 'Verifikasi Dokumen', count: 0, isActive: true },
  { id: 3, nama: 'Seleksi', count: 0, isActive: true },
  { id: 4, nama: 'Wawancara', count: 0, isActive: false },
  { id: 5, nama: 'Pengumuman', count: 0, isActive: false },
];

export default function PipelineStepper({
  tahapan = DEFAULT_TAHAPAN,
  className = '',
  onStepClick,
}: PipelineStepperProps) {
  const steps = tahapan && tahapan.length > 0 ? tahapan : DEFAULT_TAHAPAN;
  const numSteps = steps.length;
  const stepWidthPercent = 100 / Math.max(numSteps, 1);
  const halfStepPercent = stepWidthPercent / 2;

  // Hitung posisi langkah aktif terakhir
  const lastActiveIdx = steps.reduce(
    (acc, step, idx) => (step.isActive ? idx : acc),
    0
  );
  const activeLineWidthPercent = numSteps > 1 ? lastActiveIdx * stepWidthPercent : 0;

  return (
    <div className={`w-full ${className}`}>
      <div className="relative w-full pb-2 pt-1">
        {/* Base Track Line - Terkunci persis di pusat titik pertama s/d titik terakhir */}
        <div
          className="absolute top-[13px] sm:top-[15px] h-1.5 bg-slate-100 border border-slate-200/60 rounded-full z-0"
          style={{
            left: `${halfStepPercent}%`,
            right: `${halfStepPercent}%`,
          }}
        />

        {/* Active Progress Track Line dengan gradien modern & soft glow */}
        <div
          className="absolute top-[13px] sm:top-[15px] h-1.5 bg-gradient-to-r from-[#0E4A3E] via-emerald-600 to-teal-400 rounded-full transition-all duration-700 ease-out z-0 shadow-[0_0_8px_rgba(16,185,129,0.35)]"
          style={{
            left: `${halfStepPercent}%`,
            width: `${activeLineWidthPercent}%`,
          }}
        />

        {/* Node Langkah-langkah */}
        <div className="relative z-10 flex items-start justify-between">
          {steps.map((step, idx) => {
            const isLastActive = idx === lastActiveIdx && step.isActive;
            const isCompleted = idx < lastActiveIdx && step.isActive;

            return (
              <div
                key={step.id}
                onClick={() => onStepClick?.(step)}
                style={{ width: `${stepWidthPercent}%` }}
                className={`group flex flex-col items-center text-center px-1 transition-all duration-200 ${
                  onStepClick ? 'cursor-pointer' : ''
                }`}
              >
                {/* Node Circle */}
                <div
                  className={`relative w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center font-bold text-xs transition-all duration-300 ring-4 ${
                    isLastActive
                      ? 'bg-gradient-to-tr from-[#0E4A3E] to-emerald-600 text-white ring-emerald-400/30 shadow-[0_4px_12px_rgba(14,74,62,0.25)] scale-110'
                      : isCompleted
                      ? 'bg-[#0E4A3E] text-white ring-white shadow-xs'
                      : 'bg-white border-2 border-slate-200 text-slate-400 ring-white group-hover:border-slate-300'
                  }`}
                >
                  {isCompleted ? (
                    <Check className="w-3.5 h-3.5 stroke-[3] text-emerald-300" />
                  ) : isLastActive ? (
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-200 opacity-75" />
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-white" />
                    </span>
                  ) : (
                    <span className="text-[10px] font-bold text-slate-400">
                      {idx + 1}
                    </span>
                  )}
                </div>

                {/* Step Label */}
                <span
                  className={`text-[10px] sm:text-xs font-bold mt-2.5 line-clamp-2 leading-tight transition-colors ${
                    step.isActive
                      ? 'text-[#0E4A3E]'
                      : 'text-slate-400 group-hover:text-slate-600'
                  }`}
                >
                  {step.nama}
                </span>

                {/* Counter Pill Badge */}
                <span
                  className={`mt-1.5 px-2.5 py-0.5 rounded-full text-[10px] sm:text-[11px] font-black transition-all ${
                    step.isActive
                      ? 'bg-[#D6F2E5] text-[#0E4A3E] border border-[#a2dfc7] shadow-[0_2px_6px_rgba(14,74,62,0.06)]'
                      : 'bg-slate-50 text-slate-400 border border-slate-200/80'
                  }`}
                >
                  {step.count.toLocaleString()}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
