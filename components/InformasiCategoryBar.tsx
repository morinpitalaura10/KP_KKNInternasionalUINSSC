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
    <div className="w-full max-w-2xl mx-auto bg-[#0E4A3E] text-white rounded-2xl p-2 sm:p-2.5 shadow-xl grid grid-cols-1 sm:grid-cols-2 gap-2 text-center">
      <button
        type="button"
        onClick={() => handleSelectTab('tentang')}
        className={`w-full px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm md:text-base transition-all cursor-pointer text-center ${
          activeTab === 'tentang'
            ? 'bg-[#1b6354] text-white shadow-md ring-1 ring-white/30'
            : 'text-white/80 hover:text-white hover:bg-white/10'
        }`}
      >
        Tentang KKN
      </button>

      <button
        type="button"
        onClick={() => handleSelectTab('tujuan')}
        className={`w-full px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm md:text-base transition-all cursor-pointer text-center ${
          activeTab === 'tujuan'
            ? 'bg-[#1b6354] text-white shadow-md ring-1 ring-white/30'
            : 'text-white/80 hover:text-white hover:bg-white/10'
        }`}
      >
        Negara Tujuan & Pelaksanaan
      </button>
    </div>
  );
}

export default function InformasiCategoryBar() {
  return (
    <Suspense
      fallback={
        <div className="bg-[#0E4A3E] text-white rounded-2xl p-4 shadow-xl flex justify-center items-center h-14">
          <div className="h-4 w-48 bg-white/20 animate-pulse rounded" />
        </div>
      }
    >
      <CategoryBarContent />
    </Suspense>
  );
}
