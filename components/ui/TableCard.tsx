import React from 'react';
import { RefreshCw, Inbox } from 'lucide-react';

interface TableCardProps {
  header: React.ReactNode;
  children?: React.ReactNode;
  isLoading?: boolean;
  loadingText?: string;
  isEmpty?: boolean;
  emptyText?: React.ReactNode;
  emptyAction?: React.ReactNode;
  emptyIcon?: React.ReactNode;
  className?: string;
  headerClassName?: string;
}

export default function TableCard({
  header,
  children,
  isLoading = false,
  loadingText = 'Memuat data...',
  isEmpty = false,
  emptyText = 'Belum ada data tersedia.',
  emptyAction,
  emptyIcon,
  className = '',
  headerClassName = '',
}: TableCardProps) {
  return (
    <div
      className={`bg-white rounded-2xl sm:rounded-3xl border border-slate-300 shadow-xs overflow-hidden ${className}`}
    >
      {/* ── Table Header Bar with Brand Color #0E4A3E ── */}
      <div
        className={`bg-[#0E4A3E] text-white px-6 py-4 border-b border-[#0a352c] ${headerClassName}`}
      >
        {header}
      </div>

      {/* ── Table Body / States ── */}
      {isLoading ? (
        <div className="py-16 flex flex-col items-center justify-center text-slate-400 gap-2.5">
          <RefreshCw className="w-6 h-6 animate-spin text-[#0E4A3E]" />
          <span className="text-xs sm:text-sm font-semibold">{loadingText}</span>
        </div>
      ) : isEmpty ? (
        <div className="py-16 px-6 text-center flex flex-col items-center justify-center text-slate-500">
          {emptyIcon || <Inbox className="w-10 h-10 text-slate-300 mb-2 stroke-[1.5]" />}
          <div className="text-xs sm:text-sm font-medium max-w-md">{emptyText}</div>
          {emptyAction && <div className="mt-4">{emptyAction}</div>}
        </div>
      ) : (
        <div className="divide-y divide-slate-100">{children}</div>
      )}
    </div>
  );
}
