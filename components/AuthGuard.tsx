'use client';

import React, { useEffect, useState } from 'react';
import type { Role, UserAccount } from '@/lib/dummyData';

interface AuthGuardProps {
  /** Role yang diizinkan untuk mengakses halaman ini */
  allowedRoles: Role[];
  children: React.ReactNode;
}

/**
 * AuthGuard: Komponen proteksi route tingkat klien.
 * Memastikan konten hanya dirender jika sesi cookie dan localStorage valid.
 * Mencegah kebocoran dashboard saat user menggunakan panah browser (Back/Forward).
 */
export default function AuthGuard({ allowedRoles, children }: AuthGuardProps) {
  const [isAuthorized, setIsAuthorized] = useState<boolean>(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const verifySession = async () => {
      // 1. Cek keberadaan cookie autentikasi
      const hasRoleCookie = document.cookie
        .split('; ')
        .some((row) => row.startsWith('user_role='));

      // 2. Cek localStorage
      const stored = localStorage.getItem('currentUser');

      if (!stored || !hasRoleCookie) {
        setIsAuthorized(false);
        localStorage.removeItem('currentUser');
        document.cookie = 'user_role=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
        document.cookie = 'user_session=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
        window.location.replace('/login');
        return false;
      }

      try {
        const user: UserAccount = JSON.parse(stored);

        if (!user || !user.role || !allowedRoles.includes(user.role)) {
          setIsAuthorized(false);
          window.location.replace('/login');
          return false;
        }

        setIsAuthorized(true);

        // 3. Verifikasi ke database server: apakah akun masih ada atau sudah dihapus/dinonaktifkan
        try {
          const res = await fetch('/api/auth/verify', { cache: 'no-store' });
          if (res.status === 401 || res.status === 403) {
            const data = await res.json().catch(() => ({}));
            setIsAuthorized(false);
            localStorage.removeItem('currentUser');
            document.cookie = 'user_role=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
            document.cookie = 'user_session=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
            document.cookie = 'bridge_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
            const statusParam = data.reason === 'deleted' ? 'deleted' : 'inactive';
            window.location.replace(`/login?status=${statusParam}`);
            return false;
          }
        } catch {
          // Abaikan jika server/jaringan sedang offline sementara
        }

        return true;
      } catch {
        localStorage.removeItem('currentUser');
        setIsAuthorized(false);
        window.location.replace('/login');
        return false;
      }
    };

    verifySession();

    // Deteksi jika halaman dipulihkan dari browser Back/Forward Cache (BFCache)
    const handlePageShow = () => {
      verifySession();
    };

    window.addEventListener('pageshow', handlePageShow);
    return () => {
      window.removeEventListener('pageshow', handlePageShow);
    };
  }, [allowedRoles]);

  // Selama belum terverifikasi atau jika tidak berhak, jangan pernah render children dashboard
  if (!isAuthorized) {
    return (
      <div className="h-screen w-screen bg-slate-50 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-[#0E4A3E] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return <>{children}</>;
}
