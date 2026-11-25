'use client';

import React, { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Menu,
  X,
  ChevronDown,
  ChevronRight,
  Home,
  Info,
  FileText,
  CalendarDays,
  Megaphone,
  LogIn,
} from 'lucide-react';

export default function Header() {
  const pathname = usePathname();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleMouseEnter = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setDropdownOpen(true);
  };

  const handleMouseLeave = () => {
    timeoutRef.current = setTimeout(() => {
      setDropdownOpen(false);
    }, 250); // Grace period 250ms prevents accidental disappearing
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  // Close dropdown on pathname change
  useEffect(() => {
    setDropdownOpen(false);
  }, [pathname]);

  // Active state checks
  const isBeranda = pathname === '/';
  const isInformasi = pathname === '/informasi' || pathname.startsWith('/informasi?');
  const isPersyaratan = pathname === '/persyaratan';
  const isTimeline = pathname === '/timeline';
  const isPersyaratanOrTimeline = isPersyaratan || isTimeline;
  const isPengumuman = pathname === '/pengumuman' || pathname.startsWith('/pengumuman/');

  const mobileNavItems = [
    {
      href: '/',
      label: 'Beranda',
      subtitle: 'Halaman Utama Portal KKN',
      icon: Home,
      isActive: isBeranda,
    },
    {
      href: '/informasi',
      label: 'Informasi',
      subtitle: 'Panduan & Berita Terkini',
      icon: Info,
      isActive: isInformasi,
    },
    {
      href: '/persyaratan',
      label: 'Persyaratan',
      subtitle: 'Ketentuan & Berkas Pendaftaran',
      icon: FileText,
      isActive: isPersyaratan,
    },
    {
      href: '/timeline',
      label: 'Timeline',
      subtitle: 'Jadwal Lengkap & Alur Seleksi',
      icon: CalendarDays,
      isActive: isTimeline,
    },
    {
      href: '/pengumuman',
      label: 'Pengumuman',
      subtitle: 'Hasil Seleksi & Kelulusan Peserta',
      icon: Megaphone,
      isActive: isPengumuman,
    },
  ];

  return (
    <header className="w-full bg-[#568E7D] text-white shadow-md sticky top-0 z-50 shrink-0 font-sans">
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2.5 flex items-center justify-between gap-3 lg:gap-6">
        
        {/* Left: Logo & University Title (Standardized to match HeaderMhs) */}
        <Link href="/" className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1 md:flex-initial shrink-0">
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
          <div className="flex flex-col leading-tight min-w-0">
            <h1 className="text-xs sm:text-sm lg:text-base font-bold tracking-wide text-white uppercase truncate md:whitespace-nowrap">
              Kuliah Kerja Nyata Internasional
            </h1>
            <p className="text-[8px] sm:text-[9px] lg:text-[10px] font-semibold text-white/80 uppercase tracking-wider truncate md:whitespace-nowrap">
              <span className="hidden sm:inline">Universitas Islam Negeri Siber Syekh Nurjati Cirebon</span>
              <span className="sm:hidden">UIN Siber Syekh Nurjati Cirebon</span>
            </p>
          </div>
        </Link>

        {/* Center: Navigation Items (Desktop) */}
        <nav className="hidden md:flex items-center gap-2 lg:gap-5 xl:gap-7 shrink-0">
          {/* Beranda */}
          <Link
            href="/"
            className={`transition-all duration-150 px-1.5 lg:px-2 py-1 text-xs lg:text-sm shrink-0 whitespace-nowrap ${
              isBeranda
                ? 'text-[#0E4A3E] font-bold border-b-2 border-[#0E4A3E]'
                : 'text-white/90 hover:text-white font-semibold'
            }`}
          >
            Beranda
          </Link>

          {/* Informasi */}
          <Link
            href="/informasi"
            className={`transition-all duration-150 px-1.5 lg:px-2 py-1 text-xs lg:text-sm shrink-0 whitespace-nowrap ${
              isInformasi
                ? 'text-[#0E4A3E] font-bold border-b-2 border-[#0E4A3E]'
                : 'text-white/90 hover:text-white font-semibold'
            }`}
          >
            Informasi
          </Link>

          {/* Persyaratan & Timeline Dropdown */}
          <div
            ref={dropdownRef}
            className="relative shrink-0"
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
          >
            {/* Trigger Button with Click Toggle support */}
            <button
              type="button"
              onClick={() => {
                if (timeoutRef.current) clearTimeout(timeoutRef.current);
                setDropdownOpen((prev) => !prev);
              }}
              className={`flex items-center gap-1.5 px-2.5 lg:px-3 py-1.5 rounded-lg transition-all cursor-pointer text-xs lg:text-sm whitespace-nowrap select-none ${
                isPersyaratanOrTimeline || dropdownOpen
                  ? 'bg-[#0E4A3E] text-white font-bold shadow-xs'
                  : 'text-white/90 hover:text-white font-semibold hover:bg-white/10'
              }`}
              aria-expanded={dropdownOpen}
              aria-haspopup="true"
            >
              <span>{isTimeline ? 'Timeline' : isPersyaratan ? 'Persyaratan' : 'Persyaratan & Timeline'}</span>
              <ChevronDown
                className={`w-3.5 h-3.5 lg:w-4 lg:h-4 transition-transform duration-200 ${
                  dropdownOpen ? 'rotate-180' : ''
                }`}
              />
            </button>

            {/* Dropdown Menu - Bridge gap with pt-1.5 so cursor never leaves hitbox */}
            {dropdownOpen && (
              <div
                className="absolute left-0 top-full pt-1.5 w-48 z-50 animate-in fade-in slide-in-from-top-1 duration-150"
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
              >
                <div className="bg-[#0E4A3E] shadow-2xl py-1.5 rounded-xl border border-[#1b6354] overflow-hidden">
                  <Link
                    href="/persyaratan"
                    onClick={() => setDropdownOpen(false)}
                    className={`px-3.5 py-2.5 text-xs font-semibold flex items-center gap-2.5 w-full transition-colors ${
                      isPersyaratan
                        ? 'bg-[#1b6354] text-white font-bold'
                        : 'text-white/90 hover:bg-[#1b6354] hover:text-white'
                    }`}
                  >
                    <FileText className="w-3.5 h-3.5 text-emerald-300 shrink-0" />
                    <span>Persyaratan</span>
                  </Link>
                  <Link
                    href="/timeline"
                    onClick={() => setDropdownOpen(false)}
                    className={`px-3.5 py-2.5 text-xs font-semibold flex items-center gap-2.5 w-full transition-colors ${
                      isTimeline
                        ? 'bg-[#1b6354] text-white font-bold'
                        : 'text-white/90 hover:bg-[#1b6354] hover:text-white'
                    }`}
                  >
                    <CalendarDays className="w-3.5 h-3.5 text-emerald-300 shrink-0" />
                    <span>Timeline</span>
                  </Link>
                </div>
              </div>
            )}
          </div>

          {/* Pengumuman */}
          <Link
            href="/pengumuman"
            className={`transition-all duration-150 px-1.5 lg:px-2 py-1 text-xs lg:text-sm shrink-0 whitespace-nowrap ${
              isPengumuman
                ? 'text-[#0E4A3E] font-bold border-b-2 border-[#0E4A3E]'
                : 'text-white/90 hover:text-white font-semibold'
            }`}
          >
            Pengumuman
          </Link>
        </nav>

        {/* Right: Login Button (Desktop) & Hamburger (Mobile) */}
        <div className="flex items-center gap-2 shrink-0 ml-1 lg:ml-2">
          <Link
            href="/login"
            className="hidden md:inline-flex bg-[#0E4A3E] hover:bg-[#09352c] text-white border border-white/40 px-3.5 lg:px-5 py-1.5 rounded-full font-bold text-xs lg:text-sm shadow-sm transition-all hover:scale-105 active:scale-95 shrink-0 whitespace-nowrap"
          >
            Login
          </Link>

          {/* Mobile Menu Button - 44x44 touch target dengan visual button border & feedback sentuhan instan */}
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setMobileMenuOpen((prev) => !prev);
            }}
            aria-label="Toggle menu"
            className="w-10 h-10 rounded-xl bg-white/15 border border-white/30 text-white hover:bg-white/25 active:bg-white/40 active:scale-90 transition-all md:hidden cursor-pointer flex items-center justify-center shrink-0 touch-manipulation select-none shadow-xs"
          >
            {mobileMenuOpen ? <X className="w-6 h-6 stroke-[2.5]" /> : <Menu className="w-6 h-6 stroke-[2.5]" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Navigation (Clean White Modern Card Style) */}
      {mobileMenuOpen && (
        <div className="md:hidden w-full bg-white border-t border-slate-200/80 px-4 py-5 space-y-2 rounded-b-3xl shadow-[0_25px_50px_-12px_rgba(0,0,0,0.25)] transition-all duration-300">
          <div className="space-y-1.5">
            {mobileNavItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center justify-between px-3.5 py-3 rounded-2xl transition-all duration-200 group active:scale-[0.98] ${
                    item.isActive
                      ? 'bg-[#EAF5F0] border border-[#568E7D]/40 text-[#0E4A3E] shadow-2xs'
                      : 'text-slate-700 hover:text-slate-900 hover:bg-slate-50 active:bg-slate-100 border border-transparent'
                  }`}
                >
                  <div className="flex items-center gap-3.5 min-w-0">
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 transition-all duration-200 ${
                        item.isActive
                          ? 'bg-[#0E4A3E] text-white shadow-xs'
                          : 'bg-slate-100 text-slate-600 group-hover:bg-[#C0E6D8]/60 group-hover:text-[#0E4A3E]'
                      }`}
                    >
                      <Icon className="w-4 h-4 stroke-[2.2]" />
                    </div>
                    <div className="flex flex-col min-w-0 text-left">
                      <span className={`text-sm tracking-wide ${item.isActive ? 'font-extrabold text-[#0E4A3E]' : 'font-bold text-slate-800'}`}>
                        {item.label}
                      </span>
                      <span className={`text-[11px] truncate ${item.isActive ? 'text-[#0E4A3E]/75 font-medium' : 'text-slate-400 font-normal'}`}>
                        {item.subtitle}
                      </span>
                    </div>
                  </div>
                  <ChevronRight
                    className={`w-4 h-4 shrink-0 transition-transform duration-200 ${
                      item.isActive
                        ? 'text-[#0E4A3E] translate-x-0.5'
                        : 'text-slate-300 group-hover:text-slate-600 group-hover:translate-x-0.5'
                    }`}
                  />
                </Link>
              );
            })}
          </div>

          {/* Login Button CTA */}
          <div className="pt-3 mt-2 border-t border-slate-100">
            <Link
              href="/login"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full py-3.5 px-4 rounded-2xl bg-[#0E4A3E] hover:bg-[#08362d] text-white font-black text-sm tracking-wider uppercase shadow-lg shadow-[#0E4A3E]/20 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
            >
              <LogIn className="w-4 h-4 stroke-[2.5]" />
              <span>Login ke Portal KKN</span>
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
