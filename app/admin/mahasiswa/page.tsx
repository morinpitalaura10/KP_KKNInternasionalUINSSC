'use client';

import React, { useEffect, useState, useCallback } from 'react';
import {
  AdminMahasiswaView,
  MahasiswaItem,
  MahasiswaPagination,
} from '@/components/admin';

export default function AdminMahasiswaPage() {
  const [items, setItems] = useState<MahasiswaItem[]>([]);
  const [pagination, setPagination] = useState<MahasiswaPagination | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const fetchData = useCallback(async (q = '', page = 1) => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams({ page: String(page), limit: '15' });
      if (q) params.set('search', q);
      const res = await fetch(`/api/mahasiswa?${params.toString()}`);
      const json = await res.json();
      if (json.success) {
        setItems(json.data);
        setPagination(json.pagination);
      }
    } catch {
      setStatusMessage({ type: 'error', text: 'Gagal memuat data mahasiswa dari database MySQL.' });
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchData(search, 1);
  };

  const handleResetSearch = () => {
    setSearch('');
    setCurrentPage(1);
    fetchData('', 1);
  };

  const handleToggleStatus = async (item: MahasiswaItem) => {
    try {
      const res = await fetch('/api/mahasiswa', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id_user: item.id_user, status: !item.status_akun }),
      });
      const json = await res.json();
      if (json.success) {
        setStatusMessage({ type: 'success', text: `Status akun "${item.nama}" berhasil diubah!` });
        await fetchData(search, currentPage);
      }
    } catch {
      setStatusMessage({ type: 'error', text: 'Gagal mengubah status akun.' });
    }
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    fetchData(search, page);
  };

  return (
    <AdminMahasiswaView
      items={items}
      pagination={pagination}
      isLoading={isLoading}
      search={search}
      setSearch={setSearch}
      currentPage={currentPage}
      statusMessage={statusMessage}
      setStatusMessage={setStatusMessage}
      handleSearch={handleSearch}
      handleResetSearch={handleResetSearch}
      handleToggleStatus={handleToggleStatus}
      handlePageChange={handlePageChange}
    />
  );
}
