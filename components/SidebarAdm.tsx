'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import {
  Home,
  Info,
  FileCheck,
  UserCheck,
  LayoutGrid,
  SlidersHorizontal,
  FileInput,
  Megaphone,
  CircleUser,
  ChevronLeft,
  Globe,
  CalendarDays,
  ShieldCheck,
  User,
  GraduationCap,
} from 'lucide-react';
import { UserAccount } from '@/lib/dummyData';

// Custom SVG Icons matching design reference exactly
function InterviewIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
      <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
      <line x1="12" y1="17" x2="12.01" y2="17" />
    </svg>
  );
}

function LetterManageIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
      <rect x="3" y="14" width="7" height="6" rx="1" />
      <path d="M3 14l3.5 3 3.5-3" />
    </svg>
  );
}

const NAV_ITEMS = [
  { label: 'Dashboard',           href: '/admin',             icon: Home              },
  { label: 'Kelola Informasi',     href: '/admin/informasi',     icon: Info              },
  { label: 'Kelola Dokumen Persyaratan', href: '/admin/persyaratan',   icon: FileCheck         },
  { label: 'Kelola Syarat Akademik', href: '/admin/persyaratan_akademik', icon: GraduationCap },
  { label: 'Kelola Timeline',      href: '/admin/timeline',      icon: CalendarDays      },
  { label: 'Kelola Periode',       href: '/admin/periode',       icon: UserCheck         },
  { label: 'Kelola Negara',        href: '/admin/negara',      icon: Globe             },
  { label: 'Kelola Pendaftaran',   href: '/admin/pendaftaran', icon: LayoutGrid        },
  { label: 'Kelola Kriteria',      href: '/admin/kriteria',    icon: SlidersHorizontal },
  { label: 'Kelola Wawancara',     href: '/admin/wawancara',   icon: InterviewIcon     },
  { label: 'Kelola Hasil Akhir',   href: '/admin/hasil_akhir', icon: FileInput         },
  { label: 'Kelola Pengumuman',    href: '/admin/pengumuman',  icon: Megaphone         },
  { label: 'Kelola Akun Admin',    href: '/admin/admin_users', icon: ShieldCheck       },
  { label: 'Kelola Akun Staff',    href: '/admin/staff',       icon: CircleUser        },
  { label: 'Kelola Surat',         href: '/admin/surat',       icon: LetterManageIcon  },
];

interface SidebarAdmProps {
  user?: UserAccount | null;
  isOpen?: boolean;
  onToggle?: () => void;
}

export default function SidebarAdm({
  user,
  isOpen = true,
  onToggle,
}: SidebarAdmProps) {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } catch {
      // ignore
    }
    if (typeof window !== 'undefined') {
      localStorage.removeItem('currentUser');
      document.cookie = 'user_role=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
      document.cookie = 'user_session=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
      window.location.replace('/login');
    }
  };

  const handleToggleClick = () => {
    if (onToggle) {
      onToggle();
    }
  };

  return (
    <>
      {/* ====== MOBILE: Backdrop overlay ====== */}
      {isOpen && (
        <div
          className="fixed inset-0 top-[52px] sm:top-[60px] md:top-0 z-30 bg-black/40 backdrop-blur-xs md:hidden print:hidden"
          onClick={handleToggleClick}
        />
      )}

      {/* ====== SIDEBAR CONTAINER ====== */}
      <div className="relative z-40 shrink-0 flex h-full print:hidden">
        <aside
          className={`
            fixed top-[52px] sm:top-[60px] md:top-0 left-0 z-40 h-[calc(100dvh-52px)] sm:h-[calc(100dvh-60px)] md:h-full bg-[#0E4A3E] flex flex-col shadow-2xl md:shadow-lg
            transition-all duration-300 ease-in-out select-none pointer-events-auto
            md:relative
            ${isOpen ? 'translate-x-0 w-60 sm:w-64' : '-translate-x-full md:translate-x-0 md:w-0 md:overflow-hidden'}
          `}
        >
          {/* ── Top Header / Close Button ── */}
          <div className="px-4 pt-4 pb-1.5 flex items-center justify-between shrink-0">
            <span className="text-[11px] font-semibold tracking-wider uppercase text-white/60 pl-1">Menu</span>
            <button
              onClick={handleToggleClick}
              aria-label="Tutup sidebar"
              title="Tutup sidebar"
              className="p-1 rounded-lg text-white/70 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4 text-white" />
            </button>
          </div>

          {/* ── Navigation Items ── */}
          <nav className="flex-1 px-3 py-1.5 space-y-1 overflow-y-auto overflow-x-hidden scrollbar-thin scrollbar-thumb-white/20">
            {NAV_ITEMS.map(({ label, href, icon: Icon }) => {
              const isActive =
                href === '/admin'
                  ? pathname === '/admin'
                  : pathname === href || pathname.startsWith(href + '/');

              return (
                <Link
                  key={href}
                  href={href}
                  onClick={() => {
                    if (typeof window !== 'undefined' && window.innerWidth < 768 && onToggle) {
                      onToggle();
                    }
                  }}
                  className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs transition-all duration-150 whitespace-nowrap ${
                    isActive
                      ? 'bg-[#2E685B] text-white shadow-xs font-semibold'
                      : 'text-white/80 hover:bg-white/10 hover:text-white font-medium'
                  }`}
                >
                  <Icon
                    className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-white/70'}`}
                  />
                  <span className="truncate tracking-wide">{label}</span>
                </Link>
              );
            })}
          </nav>

          {/* ── User Profile & Logout (Pinned perfectly at bottom) ── */}
          <div className="px-3.5 pb-4 pt-2.5 shrink-0 mt-auto bg-[#0E4A3E]">
            {/* White Divider Line */}
            <div className="w-full h-px bg-white/30 mb-2.5" />

            <div className="flex items-center gap-2.5 mb-2.5 px-1">
              <div className="w-9 h-9 rounded-full border border-white/60 flex items-center justify-center shrink-0 overflow-hidden shadow-xs bg-white/20">
                {user?.avatarUrl ? (
                  <Image
                    src={user.avatarUrl}
                    alt="Avatar Profile"
                    width={36}
                    height={36}
                    className="object-cover w-full h-full"
                  />
                ) : (
                  <User className="w-4 h-4 text-white" />
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-white text-xs font-semibold truncate leading-tight">
                  {user?.name || 'Morin Pita Laura'}
                </p>
                <p className="text-white/70 text-[10px] truncate leading-tight mt-0.5">
                  {user?.department || 'Admin LP2M'}
                </p>
              </div>
            </div>

            {/* Logout Button */}
            <div className="flex justify-end pr-1">
              <button
                onClick={handleLogout}
                className="bg-[#09352c] hover:bg-[#062720] text-white border border-white/60 hover:border-white px-4 py-1 rounded-full text-[11px] font-medium shadow-xs transition-all active:scale-95 cursor-pointer"
              >
                Logout
              </button>
            </div>
          </div>
        </aside>
      </div>
    </>
  );
}
