'use client';

import React from 'react';
import Image from 'next/image';
import { Menu } from 'lucide-react';

interface HeaderMhsProps {
  onToggleSidebar?: () => void;
  isSidebarOpen?: boolean;
}

export default function HeaderMhs({
  onToggleSidebar,
  isSidebarOpen = true,
}: HeaderMhsProps) {
  return (
    <header className="w-full bg-[#568E7D] text-white shadow-md fixed top-0 left-0 right-0 z-50 h-[52px] sm:h-[60px] flex items-center shrink-0 print:hidden">
      <div className="w-full px-4 sm:px-6 flex items-center">
        {/* Toggle Sidebar Button */}
        {onToggleSidebar && (
          <button
            type="button"
            onClick={onToggleSidebar}
            aria-label={isSidebarOpen ? 'Tutup sidebar' : 'Buka sidebar'}
            title={isSidebarOpen ? 'Sembunyikan sidebar' : 'Tampilkan sidebar'}
            className="p-2 -ml-1 mr-2 sm:mr-3 rounded-lg text-white/90 hover:text-white hover:bg-white/15 active:bg-white/25 transition-all cursor-pointer flex items-center justify-center shrink-0"
          >
            <Menu className="w-5 h-5 text-white" />
          </button>
        )}

        {/* Logo + Nama Website */}
        <div className="flex items-center gap-2.5 sm:gap-3 min-w-0 flex-1 overflow-hidden select-none">
          <div className="relative w-8 h-8 sm:w-10 sm:h-10 lg:w-11 lg:h-11 shrink-0">
            <Image
              src="/uinssc.png"
              alt="Logo UINSSC"
              width={48}
              height={48}
              className="object-contain w-full h-full"
              priority
            />
          </div>
          <div className="flex flex-col leading-tight min-w-0 flex-1 overflow-hidden">
            <h1 className="text-[11px] xs:text-xs sm:text-sm lg:text-base font-extrabold tracking-tight sm:tracking-wide text-white uppercase truncate">
              Kuliah Kerja Nyata Internasional
            </h1>
            <p className="text-[8px] sm:text-[9px] lg:text-[10px] font-semibold text-white/85 uppercase tracking-normal sm:tracking-wider truncate">
              <span className="hidden sm:inline">Universitas Islam Negeri Siber Syekh Nurjati Cirebon</span>
              <span className="sm:hidden">UIN Siber Syekh Nurjati Cirebon</span>
            </p>
          </div>
        </div>
      </div>
    </header>
  );
}
