'use client';

import React, { useEffect, useState, useCallback } from 'react';
import {
  StaffPendaftarView,
  PendaftarItem,
  PendaftarPagination,
} from '@/components/staff';

export default function StaffPendaftarPage() {
  const [items, setItems] = useState<PendaftarItem[]>([]);
  const [pagination, setPagination] = useState<PendaftarPagination>({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 1,
  });
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [search, setSearch] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [selectedDetail, setSelectedDetail] = useState<PendaftarItem | null>(null);
  const [activePeriode, setActivePeriode] = useState<{
    id_periode: number;
    nama_periode: string;
    tahun: number;
  } | null>(null);

  const fetchPendaftar = useCallback(async (signal?: AbortSignal) => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      params.set('active_only', 'true');
      if (search.trim()) params.set('search', search.trim());
      if (statusFilter !== 'all') params.set('status', statusFilter);
      params.set('page', String(currentPage));
      params.set('limit', '10');

      const res = await fetch(`/api/pendaftaran?${params.toString()}`, { signal });
      if (!res.ok || signal?.aborted) return;
      const json = await res.json();
      if (signal?.aborted) return;

      if (json.success) {
        setItems(json.data || []);
        if (json.pagination) setPagination(json.pagination);
        if (json.activePeriode) setActivePeriode(json.activePeriode);
      }
    } catch (err: any) {
      if (err?.name === 'AbortError') return;
      console.error(err);
    } finally {
      if (!signal?.aborted) {
        setIsLoading(false);
      }
    }
  }, [search, statusFilter, currentPage]);

  useEffect(() => {
    const controller = new AbortController();
    fetchPendaftar(controller.signal);
    return () => {
      controller.abort();
    };
  }, [fetchPendaftar]);

  const formatDate = (dateStr: string) => {
    try {
      return new Date(dateStr).toLocaleDateString('id-ID', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <StaffPendaftarView
      items={items}
      pagination={pagination}
      isLoading={isLoading}
      search={search}
      onSearchChange={(val) => {
        setSearch(val);
        setCurrentPage(1);
      }}
      statusFilter={statusFilter}
      onStatusFilterChange={(val) => {
        setStatusFilter(val);
        setCurrentPage(1);
      }}
      currentPage={currentPage}
      onPageChange={setCurrentPage}
      selectedDetail={selectedDetail}
      onSelectDetail={setSelectedDetail}
      activePeriode={activePeriode}
      formatDate={formatDate}
    />
  );
}
