'use client';

import React, { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

function CategoryBarContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialTab = searchParams.get('tab') || 'tentang';
  const [activeTab, setActiveTab] = useState(initialTab);

  useEffect(() => {
    const tab = searchParams.get('tab');
    if (tab) {
      setActiveTab(tab);
      const target = document.getElementById(tab);
      if (target) {
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
  }, [searchParams]);

  const handleSelectTab = (tabKey: string) => {
    setActiveTab(tabKey);
    // Menggunakan query string aman (?tab=...) tanpa hash (#)
    router.replace(`/informasi?tab=${tabKey}`, { scroll: false });
    const target = document.getElementById(tabKey);
    if (target) {
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <div className="w-full max-w-md mx-auto bg-slate-100 p-1.5 rounded-full border border-slate-200 shadow-xs flex items-center justify-center gap-1">
      <button
        type="button"
        onClick={() => handleSelectTab('tentang')}
        className={`flex-1 py-2 sm:py-2.5 px-3 sm:px-4 rounded-full font-bold text-xs sm:text-sm transition-all cursor-pointer text-center truncate ${
          activeTab === 'tentang'
            ? 'bg-[#0E4A3E] text-white shadow-sm'
            : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
        }`}
      >
        Tentang KKN
      </button>

      <button
        type="button"
        onClick={() => handleSelectTab('tujuan')}
        className={`flex-1 py-2 sm:py-2.5 px-3 sm:px-4 rounded-full font-bold text-xs sm:text-sm transition-all cursor-pointer text-center truncate ${
          activeTab === 'tujuan'
            ? 'bg-[#0E4A3E] text-white shadow-sm'
            : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
        }`}
      >
        Negara & Pelaksanaan
      </button>
    </div>
  );
}

export default function InformasiCategoryBar() {
  return (
    <Suspense
      fallback={
        <div className="bg-slate-100 rounded-full p-2 border border-slate-200 max-w-md mx-auto flex justify-center items-center h-11">
          <div className="h-4 w-40 bg-slate-200 animate-pulse rounded-full" />
        </div>
      }
    >
      <CategoryBarContent />
    </Suspense>
  );
}
