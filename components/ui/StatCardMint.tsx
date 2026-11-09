import React from 'react';

interface StatCardMintProps {
  value: string | number;
  label: string;
  subLabel?: string;
  icon?: React.ReactNode;
  className?: string;
}

export default function StatCardMint({
  value,
  label,
  subLabel,
  icon,
  className = '',
}: StatCardMintProps) {
  return (
    <div
      className={`bg-gradient-to-b from-[#D4F1E4] to-[#BEE6D7] border border-[#9fd3c3]/90 rounded-xl sm:rounded-2xl py-3 px-3 sm:py-3.5 sm:px-4 flex flex-col items-center justify-center text-center shadow-[0_4px_14px_rgba(14,74,62,0.12)] hover:shadow-[0_8px_20px_rgba(14,74,62,0.18)] hover:-translate-y-0.5 transition-all duration-200 ${className}`}
    >
      {icon && <div className="mb-1 text-[#0E4A3E]">{icon}</div>}
      <span className="text-2xl sm:text-3xl font-black text-[#0E4A3E] tracking-tight font-archivo leading-none">
        {value}
      </span>
      <span className="text-[10px] sm:text-xs font-bold text-[#0E4A3E]/90 mt-1.5 uppercase tracking-wider leading-snug">
        {label}
      </span>
      {subLabel && (
        <span className="text-[9px] sm:text-[10px] font-medium text-[#0E4A3E]/75 mt-0.5">
          {subLabel}
        </span>
      )}
    </div>
  );
}
