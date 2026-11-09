'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X, ChevronDown } from 'lucide-react';

export default function Header() {
  const pathname = usePathname();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Active state checks
  const isBeranda = pathname === '/';
  const isInformasi = pathname === '/informasi' || pathname.startsWith('/informasi?');
  const isPersyaratan = pathname === '/persyaratan';
  const isTimeline = pathname === '/timeline';
  const isPersyaratanOrTimeline = isPersyaratan || isTimeline;
  const isPengumuman = pathname === '/pengumuman' || pathname.startsWith('/pengumuman/');

  return (
    <header className="w-full bg-[#568E7D] text-white shadow-md sticky top-0 z-50 shrink-0 font-sans">
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2.5 flex items-center justify-between">
        
        {/* Left: Logo & University Title (Standardized to match HeaderMhs) */}
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

        {/* Center: Navigation Items (Desktop) */}
        <nav className="hidden md:flex items-center gap-6 lg:gap-8">
          {/* Beranda */}
          <Link
            href="/"
            className={`transition-all duration-150 py-1 ${
              isBeranda
                ? 'text-[#0E4A3E] font-bold border-b-2 border-[#0E4A3E]'
                : 'text-white/90 hover:text-white font-semibold text-sm'
            }`}
          >
            Beranda
          </Link>

          {/* Informasi */}
          <Link
            href="/informasi"
            className={`transition-all duration-150 py-1 ${
              isInformasi
                ? 'text-[#0E4A3E] font-bold border-b-2 border-[#0E4A3E]'
                : 'text-white/90 hover:text-white font-semibold text-sm'
            }`}
          >
            Informasi
          </Link>

          {/* Persyaratan & Timeline Dropdown */}
          <div
            className="relative"
            onMouseEnter={() => setDropdownOpen(true)}
            onMouseLeave={() => setDropdownOpen(false)}
          >
            <div
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                isPersyaratanOrTimeline || dropdownOpen
                  ? 'bg-[#0E4A3E] text-white font-bold text-sm'
                  : 'text-white/90 hover:text-white font-semibold text-sm hover:bg-white/10'
              }`}
            >
              <span>{isTimeline ? 'Timeline' : isPersyaratan ? 'Persyaratan' : 'Persyaratan & Timeline'}</span>
              <ChevronDown
                className={`w-4 h-4 transition-transform duration-200 ${
                  dropdownOpen ? 'rotate-180' : ''
                }`}
              />
            </div>

            {/* Dropdown Menu */}
            {dropdownOpen && (
              <div className="absolute left-0 mt-1 w-44 bg-[#0E4A3E] shadow-xl py-1 z-50 flex flex-col rounded-lg border border-[#1b6354] overflow-hidden">
                <Link
                  href="/persyaratan"
                  className={`px-4 py-2 text-xs font-semibold text-left block w-full transition-colors ${
                    isPersyaratan
                      ? 'bg-[#1b6354] text-white font-bold'
                      : 'text-white/90 hover:bg-[#1b6354] hover:text-white'
                  }`}
                >
                  Persyaratan
                </Link>
                <Link
                  href="/timeline"
                  className={`px-4 py-2 text-xs font-semibold text-left block w-full transition-colors ${
                    isTimeline
                      ? 'bg-[#1b6354] text-white font-bold'
                      : 'text-white/90 hover:bg-[#1b6354] hover:text-white'
                  }`}
                >
                  Timeline
                </Link>
              </div>
            )}
          </div>

          {/* Pengumuman */}
          <Link
            href="/pengumuman"
            className={`transition-all duration-150 py-1 ${
              isPengumuman
                ? 'text-[#0E4A3E] font-bold border-b-2 border-[#0E4A3E]'
                : 'text-white/90 hover:text-white font-semibold text-sm'
            }`}
          >
            Pengumuman
          </Link>
        </nav>

        {/* Right: Login Button (Desktop) & Hamburger (Mobile) */}
        <div className="flex items-center gap-2">
          <Link
            href="/login"
            className="hidden sm:inline-flex bg-[#0E4A3E] hover:bg-[#09352c] text-white border border-white/40 px-5 py-1.5 rounded-full font-bold text-xs sm:text-sm shadow-sm transition-all hover:scale-105 active:scale-95"
          >
            Login
          </Link>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen((prev) => !prev)}
            aria-label="Toggle menu"
            className="p-1.5 rounded-lg text-white hover:bg-white/15 transition-colors md:hidden cursor-pointer"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Navigation */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-[#497c6d] border-t border-white/20 px-4 py-3 space-y-2 text-sm font-semibold">
          <Link
            href="/"
            onClick={() => setMobileMenuOpen(false)}
            className={`block px-3 py-2 rounded-lg transition-colors ${
              isBeranda ? 'bg-[#0E4A3E] text-white' : 'text-white/90 hover:bg-white/10'
            }`}
          >
            Beranda
          </Link>
          <Link
            href="/informasi"
            onClick={() => setMobileMenuOpen(false)}
            className={`block px-3 py-2 rounded-lg transition-colors ${
              isInformasi ? 'bg-[#0E4A3E] text-white' : 'text-white/90 hover:bg-white/10'
            }`}
          >
            Informasi
          </Link>
          <Link
            href="/persyaratan"
            onClick={() => setMobileMenuOpen(false)}
            className={`block px-3 py-2 rounded-lg transition-colors ${
              isPersyaratan ? 'bg-[#0E4A3E] text-white' : 'text-white/90 hover:bg-white/10'
            }`}
          >
            Persyaratan
          </Link>
          <Link
            href="/timeline"
            onClick={() => setMobileMenuOpen(false)}
            className={`block px-3 py-2 rounded-lg transition-colors ${
              isTimeline ? 'bg-[#0E4A3E] text-white' : 'text-white/90 hover:bg-white/10'
            }`}
          >
            Timeline
          </Link>
          <Link
            href="/pengumuman"
            onClick={() => setMobileMenuOpen(false)}
            className={`block px-3 py-2 rounded-lg transition-colors ${
              isPengumuman ? 'bg-[#0E4A3E] text-white' : 'text-white/90 hover:bg-white/10'
            }`}
          >
            Pengumuman
          </Link>
          <div className="pt-2 border-t border-white/20">
            <Link
              href="/login"
              onClick={() => setMobileMenuOpen(false)}
              className="block text-center bg-[#0E4A3E] text-white py-2 rounded-full font-bold shadow-sm"
            >
              Login
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
