'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
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
    <header className="w-full bg-[#568E7D] text-white shadow-md sticky top-0 z-50 shrink-0">
      <div className="w-full px-4 sm:px-6 py-2.5 flex items-center">
        {/* Toggle Sidebar Button */}
        {onToggleSidebar && (
          <button
            onClick={onToggleSidebar}
            aria-label={isSidebarOpen ? 'Tutup sidebar' : 'Buka sidebar'}
            title={isSidebarOpen ? 'Sembunyikan sidebar' : 'Tampilkan sidebar'}
            className="p-2 -ml-1 mr-2 sm:mr-3 rounded-lg text-white/90 hover:text-white hover:bg-white/15 active:bg-white/25 transition-all cursor-pointer flex items-center justify-center shrink-0"
          >
            <Menu className="w-5 h-5 text-white" />
          </button>
        )}

        {/* Logo + Nama Website */}
        <Link href="/" className="flex items-center gap-3 shrink-0">
          <div className="relative w-9 h-9 sm:w-11 sm:h-11 shrink-0">
            <Image
              src="/uinssc.png"
              alt="Logo UINSSC"
              width={48}
              height={48}
              className="object-contain w-full h-full"
              priority
            />
          </div>
          <div className="flex flex-col leading-tight">
            <h1 className="text-sm sm:text-base font-bold tracking-wide text-white uppercase">
              Kuliah Kerja Nyata Internasional
            </h1>
            <p className="text-[9px] sm:text-[10px] font-semibold text-white/80 uppercase tracking-wider">
              Universitas Islam Negeri Siber Syekh Nurjati Cirebon
            </p>
          </div>
        </Link>
      </div>
    </header>
  );
}

