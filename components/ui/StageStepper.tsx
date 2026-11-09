import React from 'react';
import { CheckCircle2 } from 'lucide-react';

export interface StageItem {
  label: string;
}

interface StageStepperProps {
  stages: StageItem[];
  currentStage: number; // 1-indexed
  className?: string;
}

export default function StageStepper({
  stages,
  currentStage,
  className = '',
}: StageStepperProps) {
  const stageCount = stages.length;
  const stageWidth = 100 / Math.max(stageCount, 1);
  const halfStage = stageWidth / 2;
  const activeIndex = Math.max(0, Math.min(stageCount - 1, currentStage - 1));
  const activeLineWidthPercent = stageCount > 1 ? activeIndex * stageWidth : 0;

  return (
    <div className={`relative px-2 sm:px-4 py-4 ${className}`}>
      {/* Background Track Bar (Starts at center of first dot, ends at center of last dot) */}
      <div
        className="absolute top-[31px] h-1.5 bg-slate-200 rounded-full"
        style={{
          left: `${halfStage}%`,
          right: `${halfStage}%`,
        }}
      />

      {/* Active Filled Track Bar */}
      <div
        className="absolute top-[31px] h-1.5 overflow-hidden rounded-full transition-all duration-500 ease-out"
        style={{
          left: `${halfStage}%`,
          width: `${activeLineWidthPercent}%`,
        }}
      >
        <div className="w-full h-full bg-linear-to-r from-[#0E4A3E] to-emerald-500 rounded-full" />
      </div>

      {/* Stage Nodes */}
      <div className="relative z-10 flex items-start justify-between">
        {stages.map((stage, i) => {
          const stepNum = i + 1;
          const isDone = stepNum < currentStage;
          const isCurrent = stepNum === currentStage;

          return (
            <div
              key={i}
              style={{ width: `${stageWidth}%` }}
              className="flex flex-col items-center gap-1.5 px-1 min-w-0"
            >
              <div
                className={`w-9 h-9 rounded-full flex items-center justify-center font-black text-xs transition-all ${
                  isDone
                    ? 'bg-emerald-600 text-white shadow-2xs'
                    : isCurrent
                    ? 'bg-[#0E4A3E] text-white ring-4 ring-[#0E4A3E]/20 shadow-xs'
                    : 'bg-white border-2 border-slate-300 text-slate-400'
                }`}
              >
                {isDone ? <CheckCircle2 className="w-4 h-4 stroke-[2.5]" /> : stepNum}
              </div>

              <span
                className={`text-[10px] sm:text-xs text-center font-bold max-w-[80px] sm:max-w-[100px] leading-tight ${
                  isCurrent
                    ? 'text-[#0E4A3E]'
                    : isDone
                    ? 'text-emerald-800'
                    : 'text-slate-400'
                }`}
              >
                {stage.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
