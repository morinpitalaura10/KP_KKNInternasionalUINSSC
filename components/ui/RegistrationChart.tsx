'use client';

import React from 'react';
import { BarChart3 } from 'lucide-react';

export interface DailyRegistrationPoint {
  date: string;
  label: string;
  count: number;
}

export interface RegistrationChartProps {
  data?: DailyRegistrationPoint[];
  title?: string;
  subtitle?: string;
  className?: string;
}

export default function RegistrationChart({
  data = [],
  title = 'Grafik Pendaftar per Hari',
  subtitle = 'Tren pendaftaran harian pada periode ini',
  className = '',
}: RegistrationChartProps) {
  const maxCount = Math.max(...data.map((d) => d.count), 1);

  return (
    <div
      className={`bg-white rounded-2xl sm:rounded-3xl border border-slate-200 p-6 sm:p-7 shadow-xs flex flex-col justify-between ${className}`}
    >
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm sm:text-base font-bold text-[#0E4A3E]">{title}</h3>
          {subtitle && <p className="text-[11px] text-slate-500 mt-0.5">{subtitle}</p>}
        </div>
        <div className="w-8 h-8 rounded-xl bg-[#E8F5F1] text-[#0E4A3E] flex items-center justify-center">
          <BarChart3 className="w-4 h-4" />
        </div>
      </div>

      {data.length === 0 ? (
        <div className="flex-1 min-h-[140px] flex items-center justify-center text-xs text-slate-400">
          Belum ada data tren pendaftaran.
        </div>
      ) : (
        <div className="flex-1 flex items-end justify-between gap-2 pt-6 min-h-[150px]">
          {data.map((item) => {
            const heightPct = Math.max((item.count / maxCount) * 100, item.count > 0 ? 14 : 6);
            return (
              <div key={item.date} className="flex-1 flex flex-col items-center gap-1.5 group">
                <span className="text-[10px] font-extrabold text-[#0E4A3E] opacity-80 group-hover:opacity-100">
                  {item.count}
                </span>
                <div className="w-full max-w-[36px] h-28 bg-slate-100 rounded-xl flex items-end overflow-hidden p-0.5">
                  <div
                    className={`w-full rounded-lg transition-all duration-500 ${
                      item.count > 0 ? 'bg-[#0E4A3E] group-hover:bg-[#568E7D]' : 'bg-slate-200'
                    }`}
                    style={{ height: `${heightPct}%` }}
                  />
                </div>
                <span className="text-[10px] font-semibold text-slate-500 truncate max-w-full">
                  {item.label}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

