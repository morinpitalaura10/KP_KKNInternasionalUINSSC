'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import {
  Home,
  FileText,
  BarChart2,
  Activity,
  CheckSquare,
  ChevronLeft,
  User,
} from 'lucide-react';
import { UserAccount } from '@/lib/dummyData';

// Custom Clipboard Chart Icon matching reference design
function ClipboardChartIcon({ className }: { className?: string }) {
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
      <rect width="8" height="4" x="8" y="2" rx="1" ry="1" />
      <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
      <path d="M9 17v-2" />
      <path d="M12 17v-4" />
      <path d="M15 17v-6" />
    </svg>
  );
}

const NAV_ITEMS = [
  { label: 'Dashboard',           href: '/staff',               icon: Home               },
  { label: 'Data Pendaftar',      href: '/staff/pendaftar',     icon: ClipboardChartIcon },
  { label: 'Verifikasi Dokumen',  href: '/staff/verifikasi',    icon: FileText           },
  { label: 'Hasil Perangkingan',  href: '/staff/perangkingan',  icon: BarChart2          },
  { label: 'Nilai Wawancara',     href: '/staff/wawancara',     icon: Activity           },
  { label: 'Hasil Seleksi',       href: '/staff/seleksi',       icon: CheckSquare        },
];

interface SidebarStaffProps {
  user?: UserAccount | null;
  isOpen?: boolean;
  onToggle?: () => void;
}

export default function SidebarStaff({
  user,
  isOpen = true,
  onToggle,
}: SidebarStaffProps) {
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
                href === '/staff'
                  ? pathname === '/staff'
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

          {/* ── User Profile & Logout (Pinned at bottom) ── */}
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
                  Staff LP2M
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
