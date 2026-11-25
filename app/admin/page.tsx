'use client';

import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { UserAccount } from '@/lib/dummyData';
import { AdminDashboardView, type DashboardData } from '@/components/admin';

export default function AdminDashboard() {
  const [user, setUser] = useState<UserAccount | null>(null);
  const [data, setData] = useState<DashboardData | null>(null);
  const [selectedPeriodeId, setSelectedPeriodeId] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchDashboard = useCallback(async (forcedId?: number) => {
    setIsLoading(true);
    try {
      const pid = forcedId !== undefined ? forcedId : selectedPeriodeId;
      const url = pid ? `/api/admin/dashboard?id_periode=${pid}` : '/api/admin/dashboard';
      const res = await fetch(url);
      const json = await res.json();
      if (json.success && json.data) {
        setData(json.data);
        if (forcedId !== undefined) {
          setSelectedPeriodeId(forcedId);
        } else if (!selectedPeriodeId && json.data.activePeriode?.id_periode) {
          setSelectedPeriodeId(json.data.activePeriode.id_periode);
        }
      }
    } catch (err) {
      console.error('Failed to load admin dashboard data:', err);
    } finally {
      setIsLoading(false);
    }
  }, [selectedPeriodeId]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('currentUser');
      if (stored) {
        try {
          setUser(JSON.parse(stored));
        } catch (e) {
          console.error(e);
        }
      }
    }
    fetchDashboard();
  }, [fetchDashboard]);

  const formatDateRange = (mulaiStr?: string, selesaiStr?: string) => {
    if (!mulaiStr || !selesaiStr) return '05 Oktober 2026 - 09 Oktober 2026';
    try {
      const options: Intl.DateTimeFormatOptions = { day: '2-digit', month: 'long', year: 'numeric' };
      const mulai = new Date(mulaiStr).toLocaleDateString('id-ID', options);
      const selesai = new Date(selesaiStr).toLocaleDateString('id-ID', options);
      return `${mulai} - ${selesai}`;
    } catch {
      return `${mulaiStr} - ${selesaiStr}`;
    }
  };

  const formatShortDate = (dateStr: string) => {
    try {
      return new Date(dateStr).toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      });
    } catch {
      return dateStr;
    }
  };

  const adminName = useMemo(() => {
    if (user?.name && !user.name.toLowerCase().includes('administrator')) {
      return user.name.replace(/\s*\([^)]*\)/g, '').trim().toUpperCase();
    }
    return 'MORIN PITA LAURA';
  }, [user]);

  return (
    <AdminDashboardView
      adminName={adminName}
      data={data}
      selectedPeriodeId={selectedPeriodeId}
      isLoading={isLoading}
      onRefresh={fetchDashboard}
      formatDateRange={formatDateRange}
      formatShortDate={formatShortDate}
    />
  );
}
