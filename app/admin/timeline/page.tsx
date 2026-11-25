'use client';

import React, { useEffect, useState, useCallback, useMemo } from 'react';
import {
  AdminTimelineView,
  TimelineItem,
} from '@/components/admin';
import type { PeriodeOption } from '@/components/admin/AdminTimelineView';

function computeLiveStatus(startDateStr: string, endDateStr: string): 'Belum Dimulai' | 'Berlangsung' | 'Selesai' {
  if (!startDateStr || !endDateStr) return 'Belum Dimulai';
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const todayStr = `${year}-${month}-${day}`;

  if (todayStr < startDateStr) return 'Belum Dimulai';
  if (todayStr > endDateStr) return 'Selesai';
  return 'Berlangsung';
}

export default function AdminKelolaTimelinePage() {
  const [items, setItems] = useState<TimelineItem[]>([]);
  const [periodes, setPeriodes] = useState<PeriodeOption[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Search & Filter
  const [searchQuery, setSearchQuery] = useState('');
  const [filterPeriode, setFilterPeriode] = useState<string>('semua');
  const [filterStatus, setFilterStatus] = useState<string>('semua');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLogModalOpen, setIsLogModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  // Form Fields
  const [idPeriode, setIdPeriode] = useState<string>('');
  const [namaTahapan, setNamaTahapan] = useState('');
  const [tanggalMulai, setTanggalMulai] = useState('');
  const [tanggalSelesai, setTanggalSelesai] = useState('');
  const [urutan, setUrutan] = useState('1');
  const [deskripsi, setDeskripsi] = useState('');
  const [statusActive, setStatusActive] = useState(true);
  const [isPelaksanaan, setIsPelaksanaan] = useState(false);
  const [isPengumuman, setIsPengumuman] = useState(false);

  // Delete Confirm Modal State
  const [deleteTarget, setDeleteTarget] = useState<TimelineItem | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [togglingId, setTogglingId] = useState<number | null>(null);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [tlRes, perRes] = await Promise.all([
        fetch('/api/timeline?admin=true'),
        fetch('/api/periode'),
      ]);
      const tlJson = await tlRes.json();
      const perJson = await perRes.json();

      if (tlJson.success && Array.isArray(tlJson.data)) {
        setItems(tlJson.data);
      }
      if (perJson.success && Array.isArray(perJson.data)) {
        const perList: PeriodeOption[] = perJson.data.map((p: any) => ({
          id: p.id_periode || p.id,
          nama: p.nama_periode || p.nama,
          tahunAkademik: p.tahunAkademik || String(p.tahun),
          status: p.status,
        }));
        setPeriodes(perList);

        const activeP = perList.find((p) => p.status === 'Aktif') || perList[0];
        if (activeP) {
          setFilterPeriode((prev) => (prev === 'semua' ? String(activeP.id) : prev));
          setIdPeriode((prev) => (!prev ? String(activeP.id) : prev));
        } else if (perList.length > 0 && !idPeriode) {
          setIdPeriode(String(perList[0].id));
        }
      }
    } catch (err) {
      console.error(err);
      setStatusMessage({ type: 'error', text: 'Gagal memuat data timeline dari database MySQL.' });
    } finally {
      setIsLoading(false);
    }
  }, [idPeriode]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    if (statusMessage) {
      const timer = setTimeout(() => setStatusMessage(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [statusMessage]);

  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      const matchSearch =
        searchQuery.trim() === '' ||
        item.nama_tahapan.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.deskripsi.toLowerCase().includes(searchQuery.toLowerCase());

      const matchPeriode =
        filterPeriode === 'semua' || String(item.id_periode) === filterPeriode;

      const matchStatus =
        filterStatus === 'semua' ||
        (filterStatus === 'aktif' && item.status) ||
        (filterStatus === 'nonaktif' && !item.status) ||
        item.status_tahapan === filterStatus;

      return matchSearch && matchPeriode && matchStatus;
    });
  }, [items, searchQuery, filterPeriode, filterStatus]);

  const scopedItems = useMemo(() => {
    if (filterPeriode === 'semua') return items;
    return items.filter((item) => String(item.id_periode) === filterPeriode);
  }, [items, filterPeriode]);

  const totalStages = scopedItems.length;
  const totalBerlangsung = scopedItems.filter((i) => i.status_tahapan === 'Berlangsung' && i.status).length;
  const totalBelumDimulai = scopedItems.filter((i) => i.status_tahapan === 'Belum Dimulai' && i.status).length;
  const totalSelesai = scopedItems.filter((i) => i.status_tahapan === 'Selesai' && i.status).length;

  const activeFilteredPeriode = useMemo(() => {
    if (filterPeriode === 'semua') return null;
    return periodes.find((p) => String(p.id) === filterPeriode) || null;
  }, [filterPeriode, periodes]);

  const getAutoUrutan = useCallback(
    (periodeId: string, startDate: string, currentEditingId: number | null = null) => {
      const stagesInPeriode = items
        .filter((item) => String(item.id_periode) === String(periodeId) && item.id_timeline !== currentEditingId)
        .sort((a, b) => {
          if (a.tanggal_mulai !== b.tanggal_mulai) {
            return a.tanggal_mulai.localeCompare(b.tanggal_mulai);
          }
          if (a.tanggal_selesai !== b.tanggal_selesai) {
            return a.tanggal_selesai.localeCompare(b.tanggal_selesai);
          }
          return a.id_timeline - b.id_timeline;
        });

      if (!startDate) return stagesInPeriode.length + 1;

      let pos = 1;
      for (const stage of stagesInPeriode) {
        if (stage.tanggal_mulai <= startDate) {
          pos++;
        } else {
          break;
        }
      }
      return pos;
    },
    [items]
  );

  const handleOpenCreate = () => {
    setEditingId(null);
    const activeP = periodes.find((p) => p.status === 'Aktif');
    let targetPId = '';
    if (filterPeriode !== 'semua') {
      targetPId = filterPeriode;
    } else if (activeP) {
      targetPId = String(activeP.id);
    } else if (periodes.length > 0) {
      targetPId = String(periodes[0].id);
    }
    setIdPeriode(targetPId);
    setNamaTahapan('');
    const today = new Date().toISOString().split('T')[0];
    setTanggalMulai(today);
    setTanggalSelesai(today);
    const calculatedUrutan = getAutoUrutan(targetPId, today, null);
    setUrutan(String(calculatedUrutan));
    setDeskripsi('');
    setStatusActive(true);
    setIsPelaksanaan(false);
    setIsPengumuman(false);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (item: TimelineItem) => {
    setEditingId(item.id_timeline);
    setIdPeriode(String(item.id_periode));
    setNamaTahapan(item.nama_tahapan);
    setTanggalMulai(item.tanggal_mulai);
    setTanggalSelesai(item.tanggal_selesai);
    setUrutan(String(item.urutan));
    setDeskripsi(item.deskripsi || '');
    setStatusActive(item.status);
    setIsPelaksanaan(Boolean(item.is_pelaksanaan));
    setIsPengumuman(Boolean(item.is_pengumuman));
    setIsModalOpen(true);
  };

  const validateFormChronology = useCallback(
    (targetPeriodeId: string, startDateStr: string, endDateStr: string, currentEditingId: number | null, name: string): { valid: boolean; message?: string } => {
      if (!startDateStr || !endDateStr) return { valid: true };
      if (endDateStr < startDateStr) {
        return { valid: false, message: 'Tanggal selesai tidak boleh lebih awal dari tanggal mulai!' };
      }

      const stagesInPeriode = items
        .filter((item) => String(item.id_periode) === String(targetPeriodeId) && item.id_timeline !== currentEditingId)
        .map((s) => ({
          nama_tahapan: s.nama_tahapan,
          start: s.tanggal_mulai,
          end: s.tanggal_selesai,
        }));

      const simulated = [
        ...stagesInPeriode,
        {
          nama_tahapan: name.trim() || 'Tahapan Ini',
          start: startDateStr,
          end: endDateStr,
        },
      ].sort((a, b) => {
        if (a.start !== b.start) return a.start.localeCompare(b.start);
        if (a.end !== b.end) return a.end.localeCompare(b.end);
        return 0;
      });

      const todayStr = new Date().toISOString().split('T')[0];
      const getStat = (start: string, end: string) => {
        if (todayStr > end) return { level: 1, label: 'Selesai' };
        if (todayStr >= start && todayStr <= end) return { level: 2, label: 'Berlangsung' };
        return { level: 3, label: 'Belum Dimulai' };
      };

      for (let i = 0; i < simulated.length - 1; i++) {
        const prev = simulated[i];
        const next = simulated[i + 1];

        const prevStat = getStat(prev.start, prev.end);
        const nextStat = getStat(next.start, next.end);

        if (next.end < prev.end) {
          return {
            valid: false,
            message: `Alur tidak valid! Tahapan "${next.nama_tahapan}" selesai (${next.end}) lebih awal dari tahapan sebelumnya "${prev.nama_tahapan}" (${prev.end}).`,
          };
        }

        if (nextStat.level < prevStat.level) {
          return {
            valid: false,
            message: `Alur tidak valid! Tahapan "${next.nama_tahapan}" berstatus "${nextStat.label}" (${next.start} s/d ${next.end}), tidak boleh berada setelah tahapan "${prev.nama_tahapan}" yang masih berstatus "${prevStat.label}" (${prev.start} s/d ${prev.end}).`,
          };
        }
      }

      return { valid: true };
    },
    [items]
  );

  const chronologyValidation = useMemo(() => {
    if (!isModalOpen || !idPeriode) return { valid: true };
    return validateFormChronology(idPeriode, tanggalMulai, tanggalSelesai, editingId, namaTahapan);
  }, [isModalOpen, idPeriode, tanggalMulai, tanggalSelesai, editingId, namaTahapan, validateFormChronology]);

  useEffect(() => {
    if (isModalOpen && idPeriode) {
      const calculated = getAutoUrutan(idPeriode, tanggalMulai, editingId);
      setUrutan(String(calculated));
    }
  }, [isModalOpen, idPeriode, tanggalMulai, editingId, getAutoUrutan]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!idPeriode || !namaTahapan.trim() || !tanggalMulai || !tanggalSelesai) {
      setStatusMessage({ type: 'error', text: 'Periode, Nama Tahapan, dan Tanggal wajib diisi!' });
      return;
    }

    if (!chronologyValidation.valid) {
      setStatusMessage({ type: 'error', text: chronologyValidation.message || 'Alur kronologis tidak valid!' });
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        id_periode: parseInt(idPeriode, 10),
        nama_tahapan: namaTahapan.trim(),
        tanggal_mulai: tanggalMulai,
        tanggal_selesai: tanggalSelesai,
        urutan: parseInt(urutan, 10) || 1,
        deskripsi: deskripsi.trim(),
        status: statusActive,
        is_pelaksanaan: isPelaksanaan,
        is_pengumuman: isPengumuman,
      };

      let res;
      if (editingId) {
        res = await fetch('/api/timeline', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id_timeline: editingId, ...payload }),
        });
      } else {
        res = await fetch('/api/timeline', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
      }

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.message || 'Gagal menyimpan tahapan timeline');
      }

      setStatusMessage({
        type: 'success',
        text: editingId ? 'Tahapan timeline berhasil diperbarui!' : 'Tahapan timeline baru berhasil ditambahkan!',
      });
      setIsModalOpen(false);
      fetchData();
    } catch (err: any) {
      setStatusMessage({ type: 'error', text: err.message || 'Terjadi kesalahan sistem' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleStatus = async (item: TimelineItem) => {
    const nextStatus = !item.status;
    setTogglingId(item.id_timeline);
    try {
      const res = await fetch('/api/timeline', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id_timeline: item.id_timeline,
          status: nextStatus,
        }),
      });
      const json = await res.json();
      if (json.success) {
        setItems((prev) =>
          prev.map((i) => (i.id_timeline === item.id_timeline ? { ...i, status: nextStatus } : i))
        );
        setStatusMessage({
          type: 'success',
          text: `Status tahapan "${item.nama_tahapan}" berhasil diubah menjadi ${nextStatus ? 'Publish' : 'Private'}.`,
        });
      }
    } catch {
      setStatusMessage({ type: 'error', text: 'Gagal memperbarui status tahapan' });
    } finally {
      setTogglingId(null);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/timeline?id=${deleteTarget.id_timeline}`, {
        method: 'DELETE',
      });
      const json = await res.json();
      if (json.success) {
        setItems((prev) => prev.filter((i) => i.id_timeline !== deleteTarget.id_timeline));
        setStatusMessage({ type: 'success', text: 'Tahapan timeline berhasil dihapus dari database!' });
        setDeleteTarget(null);
      } else {
        throw new Error(json.message);
      }
    } catch (err: any) {
      setStatusMessage({ type: 'error', text: err.message || 'Gagal menghapus tahapan timeline' });
    } finally {
      setIsDeleting(false);
    }
  };

  const modalLiveStatus = computeLiveStatus(tanggalMulai, tanggalSelesai);

  return (
    <AdminTimelineView
      items={items}
      periodes={periodes}
      isLoading={isLoading}
      statusMessage={statusMessage}
      setStatusMessage={setStatusMessage}
      searchQuery={searchQuery}
      setSearchQuery={setSearchQuery}
      filterPeriode={filterPeriode}
      setFilterPeriode={setFilterPeriode}
      filterStatus={filterStatus}
      setFilterStatus={setFilterStatus}
      filteredItems={filteredItems}
      totalStages={totalStages}
      totalBerlangsung={totalBerlangsung}
      totalBelumDimulai={totalBelumDimulai}
      totalSelesai={totalSelesai}
      activeFilteredPeriode={activeFilteredPeriode}
      fetchData={fetchData}
      isModalOpen={isModalOpen}
      setIsModalOpen={setIsModalOpen}
      isSubmitting={isSubmitting}
      editingId={editingId}
      idPeriode={idPeriode}
      setIdPeriode={setIdPeriode}
      namaTahapan={namaTahapan}
      setNamaTahapan={setNamaTahapan}
      tanggalMulai={tanggalMulai}
      setTanggalMulai={setTanggalMulai}
      tanggalSelesai={tanggalSelesai}
      setTanggalSelesai={setTanggalSelesai}
      urutan={urutan}
      deskripsi={deskripsi}
      setDeskripsi={setDeskripsi}
      statusActive={statusActive}
      setStatusActive={setStatusActive}
      isPelaksanaan={isPelaksanaan}
      setIsPelaksanaan={setIsPelaksanaan}
      isPengumuman={isPengumuman}
      setIsPengumuman={setIsPengumuman}
      handleOpenCreate={handleOpenCreate}
      handleOpenEdit={handleOpenEdit}
      handleSubmit={handleSubmit}
      modalLiveStatus={modalLiveStatus}
      chronologyValidation={chronologyValidation}
      togglingId={togglingId}
      handleToggleStatus={handleToggleStatus}
      deleteTarget={deleteTarget}
      setDeleteTarget={setDeleteTarget}
      isDeleting={isDeleting}
      handleDeleteConfirm={handleDeleteConfirm}
      isLogModalOpen={isLogModalOpen}
      setIsLogModalOpen={setIsLogModalOpen}
    />
  );
}
