import React from 'react';
import { CheckCircle2, AlertTriangle } from 'lucide-react';

interface RekomendasiDekanBadgeProps {
  hasRekomendasi?: boolean;
}

export default function RekomendasiDekanBadge({ hasRekomendasi = true }: RekomendasiDekanBadgeProps) {
  if (hasRekomendasi) {
    return (
      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-1.5 py-0.5 rounded">
        <CheckCircle2 className="w-2.5 h-2.5 text-emerald-600 shrink-0" />
        Rekomendasi Dekan
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-700 bg-amber-50 border border-amber-200 px-1.5 py-0.5 rounded">
      <AlertTriangle className="w-2.5 h-2.5 text-amber-600 shrink-0" />
      Perlu Rekomendasi
    </span>
  );
}
