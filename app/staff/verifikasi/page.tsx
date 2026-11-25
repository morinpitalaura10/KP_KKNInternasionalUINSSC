'use client';

import React, { useEffect, useState, useCallback, useMemo } from 'react';
import {
  StaffVerifikasiView,
  MahasiswaVerifikasiItem,
  VerifikasiPagination,
} from '@/components/staff';

export default function StaffVerifikasiPage() {
  const [items, setItems] = useState<MahasiswaVerifikasiItem[]>([]);
  const [pagination, setPagination] = useState<VerifikasiPagination>({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 1,
  });
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [search, setSearch] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [activePeriode, setActivePeriode] = useState<{
    id_periode: number;
    nama_periode: string;
    tahun: number;
  } | null>(null);
  const [timelineGuard, setTimelineGuard] = useState<{
    isOpen: boolean;
    status: string;
    stageName?: string;
    tanggalMulai?: string;
    tanggalSelesai?: string;
    message?: string;
  } | null>(null);

  const [selectedMahasiswa, setSelectedMahasiswa] = useState<MahasiswaVerifikasiItem | null>(null);
  const [draftVerifikasi, setDraftVerifikasi] = useState<
    Record<number, { status: 'Sesuai' | 'Tidak Sesuai' | 'Menunggu'; catatan: string }>
  >({});
  const [isSaving, setIsSaving] = useState<boolean>(false);

  const fetchVerifikasi = useCallback(async (signal?: AbortSignal) => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      params.set('mode', 'grouped');
      params.set('active_only', 'true');
      if (search.trim()) params.set('search', search.trim());
      if (statusFilter !== 'all') params.set('status', statusFilter);
      params.set('page', String(currentPage));
      params.set('limit', '10');

      const res = await fetch(`/api/verifikasi?${params.toString()}`, { signal });
      if (!res.ok || signal?.aborted) return;
      const json = await res.json();
      if (signal?.aborted) return;

      if (json.success && Array.isArray(json.data)) {
        setItems(json.data);
        if (json.pagination) setPagination(json.pagination);
        if (json.activePeriode) setActivePeriode(json.activePeriode);
        if (json.timelineGuard) setTimelineGuard(json.timelineGuard);
      } else {
        setStatusMessage({ type: 'error', text: json.message || 'Gagal memuat data verifikasi.' });
      }
    } catch (err: any) {
      if (err?.name === 'AbortError') return;
      console.error('Error fetching verifikasi:', err);
      setStatusMessage({ type: 'error', text: 'Gagal terhubung ke database.' });
    } finally {
      if (!signal?.aborted) {
        setIsLoading(false);
      }
    }
  }, [search, statusFilter, currentPage]);

  useEffect(() => {
    const controller = new AbortController();
    fetchVerifikasi(controller.signal);
    return () => {
      controller.abort();
    };
  }, [fetchVerifikasi]);

  const stats = useMemo(() => {
    const totalPendaftar = pagination.total || items.length;
    const lengkap = items.filter((i) => i.status_verifikasi === 'Lengkap & Valid').length;
    const perluRevisi = items.filter((i) => i.status_verifikasi === 'Perlu Revisi').length;
    const menunggu = items.filter((i) => i.status_verifikasi === 'Menunggu Verifikasi').length;
    return { totalPendaftar, lengkap, perluRevisi, menunggu };
  }, [items, pagination.total]);

  const handleOpenWorkspace = (mhs: MahasiswaVerifikasiItem) => {
    setSelectedMahasiswa(mhs);
    const initialDraft: Record<number, { status: 'Sesuai' | 'Tidak Sesuai' | 'Menunggu'; catatan: string }> = {};
    mhs.dokumen.forEach((doc) => {
      initialDraft[doc.id_dokumen] = {
        status: doc.status_label,
        catatan: doc.catatan_verifikasi || '',
      };
    });
    setDraftVerifikasi(initialDraft);
  };

  const handleDocStatusChange = (docId: number, newStatus: 'Sesuai' | 'Tidak Sesuai') => {
    setDraftVerifikasi((prev) => ({
      ...prev,
      [docId]: {
        ...prev[docId],
        status: newStatus,
        catatan:
          newStatus === 'Sesuai' && !prev[docId]?.catatan
            ? 'Dokumen telah diverifikasi dan memenuhi persyaratan.'
            : prev[docId]?.catatan || '',
      },
    }));
  };

  const handleDocNoteChange = (docId: number, newCatatan: string) => {
    setDraftVerifikasi((prev) => ({
      ...prev,
      [docId]: {
        status: prev[docId]?.status || 'Menunggu',
        catatan: newCatatan,
      },
    }));
  };

  const handleApproveAll = () => {
    if (!selectedMahasiswa) return;
    const updated: Record<number, { status: 'Sesuai' | 'Tidak Sesuai' | 'Menunggu'; catatan: string }> = {};
    selectedMahasiswa.dokumen.forEach((doc) => {
      updated[doc.id_dokumen] = {
        status: 'Sesuai',
        catatan: draftVerifikasi[doc.id_dokumen]?.catatan || 'Dokumen telah diverifikasi dan memenuhi persyaratan.',
      };
    });
    setDraftVerifikasi(updated);
  };

  const handleSaveWorkspace = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMahasiswa) return;

    setIsSaving(true);
    setStatusMessage(null);

    const payloadDokumen = selectedMahasiswa.dokumen.map((doc) => ({
      id_dokumen: doc.id_dokumen,
      status: draftVerifikasi[doc.id_dokumen]?.status || 'Menunggu',
      catatan: draftVerifikasi[doc.id_dokumen]?.catatan || '',
    }));

    try {
      const res = await fetch('/api/verifikasi', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id_pendaftaran: selectedMahasiswa.id_pendaftaran,
          dokumen: payloadDokumen,
        }),
      });

      const json = await res.json();
      if (json.success) {
        setStatusMessage({
          type: 'success',
          text: json.message || `Verifikasi berkas untuk ${selectedMahasiswa.nama} berhasil disimpan!`,
        });
        setSelectedMahasiswa(null);
        await fetchVerifikasi();
      } else {
        setStatusMessage({ type: 'error', text: json.message || 'Gagal menyimpan hasil verifikasi.' });
      }
    } catch (err) {
      console.error('Error saving batch verifikasi:', err);
      setStatusMessage({ type: 'error', text: 'Terjadi kesalahan saat menyimpan verifikasi.' });
    } finally {
      setIsSaving(false);
    }
  };

  const modalDraftSummary = useMemo(() => {
    if (!selectedMahasiswa) return { total: 0, valid: 0, revisi: 0, menunggu: 0 };
    const total = selectedMahasiswa.dokumen.length;
    let valid = 0;
    let revisi = 0;
    let menunggu = 0;

    selectedMahasiswa.dokumen.forEach((d) => {
      const st = draftVerifikasi[d.id_dokumen]?.status || d.status_label;
      if (st === 'Sesuai') valid++;
      else if (st === 'Tidak Sesuai') revisi++;
      else menunggu++;
    });

    return { total, valid, revisi, menunggu };
  }, [selectedMahasiswa, draftVerifikasi]);

  return (
    <StaffVerifikasiView
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
      statusMessage={statusMessage}
      onCloseStatusMessage={() => setStatusMessage(null)}
      activePeriode={activePeriode}
      timelineGuard={timelineGuard}
      stats={stats}
      onRefresh={() => fetchVerifikasi()}
      selectedMahasiswa={selectedMahasiswa}
      onOpenWorkspace={handleOpenWorkspace}
      onCloseWorkspace={() => setSelectedMahasiswa(null)}
      draftVerifikasi={draftVerifikasi}
      onDocStatusChange={handleDocStatusChange}
      onDocNoteChange={handleDocNoteChange}
      onApproveAll={handleApproveAll}
      onSaveWorkspace={handleSaveWorkspace}
      isSaving={isSaving}
      modalDraftSummary={modalDraftSummary}
    />
  );
}
