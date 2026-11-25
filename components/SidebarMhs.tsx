'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Home,
  Info,
  FileEdit,
  RefreshCw,
  CheckSquare,
  Megaphone,
  ChevronLeft,
  Camera,
} from 'lucide-react';
import { UserAccount } from '@/lib/dummyData';

const NAV_ITEMS = [
  { label: 'Dashboard',          href: '/mahasiswa',                    icon: Home        },
  { label: 'Informasi',          href: '/mahasiswa/informasi',          icon: Info        },
  { label: 'Form Pendaftaran',   href: '/mahasiswa/form_pendaftaran',   icon: FileEdit    },
  { label: 'Status Pendaftaran', href: '/mahasiswa/status_pendaftaran', icon: RefreshCw   },
  { label: 'Hasil Seleksi',      href: '/mahasiswa/hasil_seleksi',      icon: CheckSquare },
  { label: 'Pengumuman',         href: '/mahasiswa/pengumuman',         icon: Megaphone   },
];

interface SidebarMhsProps {
  user?: UserAccount | null;
  isOpen?: boolean;
  onToggle?: () => void;
}

export default function SidebarMhs({ user, isOpen = true, onToggle }: SidebarMhsProps) {
  const pathname = usePathname();
  const fileInputRef = React.useRef<HTMLInputElement | null>(null);
  const [avatarSrc, setAvatarSrc] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedCustomAvatar = localStorage.getItem(`avatar_${user?.identifier || user?.id || 'mhs'}`);
      if (savedCustomAvatar) {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setAvatarSrc(savedCustomAvatar);
      } else if (user?.avatarUrl) {
        setAvatarSrc(user.avatarUrl);
      } else {
        setAvatarSrc(null);
      }
    }
  }, [user]);

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 3 * 1024 * 1024) {
        alert('Ukuran foto maksimal 3MB');
        return;
      }
      const reader = new FileReader();
      reader.onload = (event) => {
        const base64 = event.target?.result as string;
        if (base64) {
          setAvatarSrc(base64);
          if (typeof window !== 'undefined') {
            localStorage.setItem(`avatar_${user?.identifier || user?.id || 'mhs'}`, base64);
            const stored = localStorage.getItem('currentUser');
            if (stored) {
              try {
                const parsed = JSON.parse(stored);
                parsed.avatarUrl = base64;
                localStorage.setItem('currentUser', JSON.stringify(parsed));
              } catch {}
            }
          }
        }
      };
      reader.readAsDataURL(file);
    }
  };

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

          {/* ── Nav Items ── */}
          <nav className="flex-1 px-3 pt-2 pb-2 space-y-1 overflow-y-auto overflow-x-hidden">
            {NAV_ITEMS.map(({ label, href, icon: Icon }) => {
              const isActive =
                href === '/mahasiswa'
                  ? pathname === '/mahasiswa'
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
                      ? 'bg-[#245D50] text-white shadow-xs font-semibold'
                      : 'text-white/80 hover:bg-white/10 hover:text-white font-medium'
                  }`}
                >
                  <Icon
                    className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-white/70'}`}
                  />
                  <span className="truncate">{label}</span>
                </Link>
              );
            })}
          </nav>

          {/* ── User Profile + Logout (Pinned perfectly at bottom) ── */}
          <div className="px-3.5 pb-4 pt-2.5 shrink-0 mt-auto border-t border-white/20 bg-[#0E4A3E]">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleAvatarChange}
              accept="image/png, image/jpeg, image/jpg, image/webp"
              className="hidden"
            />
            <div className="flex items-center gap-2.5 mb-2 px-1">
              <div
                onClick={() => fileInputRef.current?.click()}
                title="Klik untuk mengganti foto profil"
                className="relative group w-9 h-9 rounded-full border border-white/60 flex items-center justify-center shrink-0 overflow-hidden shadow-xs cursor-pointer bg-[#1b4332]"
              >
                {avatarSrc ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={avatarSrc}
                    alt="Avatar"
                    className="object-cover w-full h-full"
                    onError={() => setAvatarSrc(null)}
                  />
                ) : (
                  <span className="text-white font-bold text-[11px]">
                    {(user?.name || 'Morin Pita Laura')
                      .split(' ')
                      .slice(0, 2)
                      .map((n) => n[0])
                      .join('')
                      .toUpperCase()}
                  </span>
                )}
                {/* Hover camera overlay */}
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <Camera className="w-3.5 h-3.5 text-white" />
                </div>
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-white text-xs font-semibold truncate leading-tight">
                  {user?.name || 'Morin Pita Laura'}
                </p>
                <p className="text-white/70 text-[10px] truncate leading-tight mt-0.5">
                  {user?.faculty || 'Fakultas Ilmu Tarbiyah dan Keguruan'}
                </p>
              </div>
            </div>

            <div className="flex justify-end pr-1">
              <button
                onClick={handleLogout}
                className="flex items-center gap-1.5 bg-[#09352c] hover:bg-[#062720] text-white border border-white/60 px-4 py-1 rounded-full text-[11px] font-medium shadow-xs transition-all hover:border-white active:scale-95 cursor-pointer"
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
