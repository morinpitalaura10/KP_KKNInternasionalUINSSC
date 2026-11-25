'use client';

import React, { useEffect, useState } from 'react';
import {
  StaffDashboardView,
  StaffStats,
  RecentApplicant,
} from '@/components/staff';

export default function StaffDashboardPage() {
  const [stats, setStats] = useState<StaffStats>({
    totalPendaftar: 0,
    menungguVerifikasi: 0,
    verifikasiDokumen: 0,
    lolosSeleksi: 0,
    progressPercent: 0,
  });
  const [recentApplicants, setRecentApplicants] = useState<RecentApplicant[]>([]);
  const [activePeriode, setActivePeriode] = useState<{ id_periode: number; nama_periode: string; tahun: number } | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [userName, setUserName] = useState<string>('Staff LP2M');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('currentUser');
      if (stored) {
        try {
          const user = JSON.parse(stored);
          setUserName(user.name || 'Staff LP2M');
        } catch {
          // ignore
        }
      }
    }

    async function loadData() {
      try {
        const res = await fetch('/api/staff/dashboard');
        const json = await res.json();
        if (json.success) {
          setStats(json.stats);
          setRecentApplicants(json.recentApplicants || []);
          if (json.activePeriode) setActivePeriode(json.activePeriode);
        }
      } catch (err) {
        console.error('Failed to load staff dashboard stats:', err);
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, []);

  return (
    <StaffDashboardView
      userName={userName}
      stats={stats}
      recentApplicants={recentApplicants}
      activePeriode={activePeriode}
      isLoading={isLoading}
    />
  );
}
