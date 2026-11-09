import React from 'react';

interface ProgressBarProps {
  percent: number; // 0 to 100
  label?: string;
  showPercentText?: boolean;
}

export default function ProgressBar({
  percent,
  label,
  showPercentText = true,
}: ProgressBarProps) {
  const clamped = Math.max(0, Math.min(100, Math.round(percent)));

  // Map to nearest 5% Tailwind width class to avoid any inline styles
  const widthClassMap: Record<number, string> = {
    0: 'w-0',
    5: 'w-[5%]',
    10: 'w-[10%]',
    15: 'w-[15%]',
    20: 'w-[20%]',
    25: 'w-[25%]',
    30: 'w-[30%]',
    35: 'w-[35%]',
    40: 'w-[40%]',
    45: 'w-[45%]',
    50: 'w-1/2',
    55: 'w-[55%]',
    60: 'w-[60%]',
    65: 'w-[65%]',
    70: 'w-[70%]',
    75: 'w-3/4',
    80: 'w-[80%]',
    85: 'w-[85%]',
    90: 'w-[90%]',
    95: 'w-[95%]',
    100: 'w-full',
  };

  const nearest5 = Math.round(clamped / 5) * 5;
  const widthClass = widthClassMap[nearest5] || 'w-0';

  return (
    <div className="w-full space-y-1.5">
      {(label || showPercentText) && (
        <div className="flex items-center justify-between text-xs font-bold text-slate-700">
          {label && <span>{label}</span>}
          {showPercentText && <span className="text-[#0E4A3E] font-black">{clamped}%</span>}
        </div>
      )}
      <div className="w-full bg-slate-200/80 rounded-full h-3 overflow-hidden">
        <div
          className={`h-full bg-linear-to-r from-[#568E7D] to-[#0E4A3E] rounded-full transition-all duration-500 ease-out ${widthClass}`}
        />
      </div>
    </div>
  );
}
