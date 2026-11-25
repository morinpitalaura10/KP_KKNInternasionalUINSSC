'use client';

import React, { useEffect, useState } from 'react';
import HeaderMhs from '@/components/HeaderMhs';
import SidebarStaff from '@/components/SidebarStaff';
import AuthGuard from '@/components/AuthGuard';
import { UserAccount } from '@/lib/dummyData';

export default function StaffLayout({ children }: { children: React.ReactNode }) {
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
    <AuthGuard allowedRoles={['staff']}>
      <div className="fixed inset-0 h-dvh max-h-dvh w-full flex flex-col bg-slate-50 font-sans overflow-hidden pt-[52px] sm:pt-[60px]">
        <HeaderMhs onToggleSidebar={handleToggle} isSidebarOpen={sidebarOpen} />
        <div className="flex flex-1 overflow-hidden relative min-h-0">
          <SidebarStaff user={user} isOpen={sidebarOpen} onToggle={handleToggle} />
          <main className="flex-1 overflow-y-auto overscroll-contain transition-all duration-300 ease-in-out p-4 sm:p-6 lg:p-8">
            <div className="w-full max-w-7xl mx-auto">
              {children}
            </div>
          </main>
        </div>
      </div>
    </AuthGuard>
  );
}
