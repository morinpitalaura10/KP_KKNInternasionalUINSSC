'use client';

import React from 'react';
import { RefreshCw } from 'lucide-react';

export interface ResponsiveTableCardProps {
  isLoading?: boolean;
  loadingText?: string;
  isEmpty?: boolean;
  emptyContent?: React.ReactNode;
  minWidthClass?: string;
  thead: React.ReactNode;
  tbody: React.ReactNode;
  footer?: React.ReactNode;
  className?: string;
}

export default function ResponsiveTableCard({
  isLoading = false,
  loadingText = 'Memuat data dari database...',
  isEmpty = false,
  emptyContent,
  minWidthClass = 'min-w-[760px]',
  thead,
  tbody,
  footer,
  className = '',
}: ResponsiveTableCardProps) {
  return (
    <div className={`kkn-data-table-card ${className}`}>
      {isLoading ? (
        <div className="py-16 flex flex-col items-center justify-center text-slate-400 gap-2">
          <RefreshCw className="w-6 h-6 animate-spin text-[#0E4A3E]" />
          <span className="text-xs font-semibold">{loadingText}</span>
        </div>
      ) : isEmpty ? (
        <div className="py-16 px-4 text-center text-slate-500 text-sm">
          {emptyContent || 'Tidak ada data yang tersedia.'}
        </div>
      ) : (
        <div className="kkn-table-scroll scrollbar-thin scrollbar-thumb-[#C0E6D8] scrollbar-track-transparent">
          <table className={`kkn-responsive-table ${minWidthClass}`}>
            <thead className="kkn-table-thead">{thead}</thead>
            <tbody className="divide-y divide-slate-100">{tbody}</tbody>
          </table>
        </div>
      )}

      {footer && <div className="kkn-table-footer">{footer}</div>}
    </div>
  );
}
