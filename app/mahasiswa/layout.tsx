'use client';

import React, { useEffect, useState } from 'react';
import HeaderMhs from '@/components/HeaderMhs';
import SidebarMhs from '@/components/SidebarMhs';
import AuthGuard from '@/components/AuthGuard';
import { UserAccount } from '@/lib/dummyData';

export default function MahasiswaLayout({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserAccount | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      if (window.innerWidth < 768) {
        setSidebarOpen(false);
      }
      const stored = localStorage.getItem('currentUser');
      if (stored) {
        try {
          setUser(JSON.parse(stored));
        } catch {
          // ignore
        }
      }

      const handlePopState = () => {
        if (window.location.pathname === '/login') {
          window.history.forward();
        }
      };
      window.addEventListener('popstate', handlePopState);
      return () => window.removeEventListener('popstate', handlePopState);
    }
  }, []);

  const handleToggle = () => setSidebarOpen((prev) => !prev);

  return (
    <AuthGuard allowedRoles={['mahasiswa']}>
      <div className="fixed inset-0 h-dvh max-h-dvh w-full flex flex-col bg-slate-50 font-sans overflow-hidden pt-[52px] sm:pt-[60px] print:static print:h-auto print:max-h-none print:overflow-visible print:bg-white print:block print:pt-0">
        <HeaderMhs onToggleSidebar={handleToggle} isSidebarOpen={sidebarOpen} />
        <div className="flex flex-1 overflow-hidden relative min-h-0 print:block print:overflow-visible print:h-auto">
          <SidebarMhs user={user} isOpen={sidebarOpen} onToggle={handleToggle} />
          <main className="flex-1 overflow-y-auto overscroll-contain transition-all duration-300 ease-in-out p-4 sm:p-6 lg:p-8 print:p-0 print:m-0 print:overflow-visible print:block print:w-full print:max-w-none">
            <div className="w-full max-w-7xl mx-auto print:max-w-none print:w-full">
              {children}
            </div>
          </main>
        </div>
      </div>
    </AuthGuard>
  );
}
