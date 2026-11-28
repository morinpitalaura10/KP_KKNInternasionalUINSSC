'use client';

import React, { useEffect, useState } from 'react';
import { AdminPeriodeView, PeriodeItem } from '@/components/admin';

export default function KelolaPeriodePage() {
  const [periodes, setPeriodes] = useState<PeriodeItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Modal Form State (Create / Edit)
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form Fields
  const [nama, setNama] = useState('');
  const [tahunAkademik, setTahunAkademik] = useState('2026/2027');
  const [semester, setSemester] = useState('Ganjil');
  const [tanggalMulai, setTanggalMulai] = useState('');
  const [tanggalSelesai, setTanggalSelesai] = useState('');
  const [kuota, setKuota] = useState('10');
  const [status, setStatus] = useState<'Aktif' | 'Belum Aktif' | 'Selesai'>('Aktif');
  const [ketuaLp2m, setKetuaLp2m] = useState('Dr. Faqiuddin Abdul Kodir, MA');
  const [deskripsi, setDeskripsi] = useState('');

  // Delete Confirm Modal State
  const [deleteTarget, setDeleteTarget] = useState<PeriodeItem | null>(null);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);
  const [togglingId, setTogglingId] = useState<string | null>(null);

  // Fetch all periodes from MySQL API
  const fetchPeriodes = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/periode');
      const json = await res.json();
      if (json.success && Array.isArray(json.data)) {
        setPeriodes(json.data);
      }
    } catch (e) {
      console.error(e);
      setStatusMessage({ type: 'error', text: 'Gagal memuat data periode dari database MySQL.' });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPeriodes();
  }, []);

  // Format Date Helper
  const formatDate = (dateStr: string) => {
    if (!dateStr) return '-';
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString('id-ID', {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
      });
    } catch {
      return dateStr;
    }
  };

  // Convert Date to YYYY-MM-DD for input[type="date"]
  const toInputDate = (dateStr: string) => {
    if (!dateStr) return '';
    try {
      const d = new Date(dateStr);
      return d.toISOString().split('T')[0];
    } catch {
      return '';
    }
  };

  // Open Create Modal
  const handleOpenCreate = () => {
    setEditingId(null);
    setNama('');
    setTahunAkademik('2026/2027');
    setSemester('Ganjil');
    setTanggalMulai('');
    setTanggalSelesai('');
    setKuota('10');
    setStatus('Aktif');
    setKetuaLp2m('Dr. Faqiuddin Abdul Kodir, MA');
    setDeskripsi('');
    setIsModalOpen(true);
  };

  // Open Edit Modal
  const handleOpenEdit = (item: PeriodeItem) => {
    setEditingId(item.id);
    setNama(item.nama);
    setTahunAkademik(item.tahunAkademik);
    setSemester(item.semester || 'Ganjil');
    setTanggalMulai(toInputDate(item.tanggalMulai));
    setTanggalSelesai(toInputDate(item.tanggalSelesai));
    setKuota(item.kuota !== undefined && item.kuota !== null ? String(item.kuota) : '10');
    setStatus((item.status as any) || 'Aktif');
    setKetuaLp2m(item.ketuaLp2m || item.ketua_lp2m || 'Dr. Faqiuddin Abdul Kodir, MA');
    setDeskripsi(item.deskripsi || '');
    setIsModalOpen(true);
  };

  // Submit Handler (Create or Update)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nama.trim() || !tanggalMulai || !tanggalSelesai) {
      alert('Harap lengkapi nama periode, tanggal mulai, dan tanggal selesai.');
      return;
    }

    setIsSubmitting(true);
    setStatusMessage(null);

    const payload = {
      id: editingId,
      nama,
      tahunAkademik,
      semester,
      tanggalMulai,
      tanggalSelesai,
      kuota: parseInt(kuota, 10) || 10,
      status,
      ketua_lp2m: ketuaLp2m || 'Dr. Faqiuddin Abdul Kodir, MA',
      deskripsi,
    };

    try {
      const res = await fetch('/api/periode', {
        method: editingId ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const json = await res.json();

      if (json.success) {
        setIsModalOpen(false);
        setStatusMessage({
          type: 'success',
          text: json.message || (editingId
            ? `Periode "${nama}" berhasil diperbarui!`
            : `Periode "${nama}" berhasil ditambahkan ke database!`),
        });
        await fetchPeriodes();
      } else {
        setStatusMessage({ type: 'error', text: json.message || 'Gagal menyimpan data periode.' });
      }
    } catch {
      setStatusMessage({ type: 'error', text: 'Gagal terhubung ke database. Pastikan MySQL XAMPP aktif.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Toggle Aktivasi Periode
  const handleToggleAktif = async (item: PeriodeItem) => {
    const willActivate = item.status !== 'Aktif';

    setTogglingId(item.id);
    setStatusMessage(null);

    const previousPeriodes = [...periodes];
    setPeriodes((prev) =>
      prev.map((p) => {
        if (p.id === item.id) {
          return { ...p, status: willActivate ? 'Aktif' : 'Belum Aktif' };
        }
        if (willActivate && p.status === 'Aktif') {
          return { ...p, status: 'Selesai' };
        }
        return p;
      })
    );

    try {
      const res = await fetch('/api/periode', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: item.id, status: willActivate ? 'Aktif' : 'Belum Aktif' }),
      });
      const json = await res.json();
      if (json.success) {
        setStatusMessage({
          type: 'success',
          text: json.message || `Periode "${item.nama}" berhasil ${willActivate ? 'diaktifkan' : 'dinonaktifkan'}.`,
        });
        await fetchPeriodes();
      } else {
        setPeriodes(previousPeriodes);
        setStatusMessage({ type: 'error', text: json.message || 'Gagal mengubah status periode.' });
      }
    } catch {
      setPeriodes(previousPeriodes);
      setStatusMessage({ type: 'error', text: 'Gagal terhubung ke database. Pastikan MySQL XAMPP aktif.' });
    } finally {
      setTogglingId(null);
    }
  };

  // Delete Action
  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;

    setIsDeleting(true);
    try {
      const res = await fetch(`/api/periode?id=${deleteTarget.id}`, {
        method: 'DELETE',
      });
      const json = await res.json();
      if (json.success) {
        setStatusMessage({ type: 'success', text: `Periode "${deleteTarget.nama}" berhasil dihapus!` });
        setDeleteTarget(null);
        await fetchPeriodes();
      } else {
        setStatusMessage({ type: 'error', text: json.message || 'Gagal menghapus periode.' });
      }
    } catch {
      setStatusMessage({ type: 'error', text: 'Terjadi kesalahan saat menghapus data periode.' });
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <AdminPeriodeView
      periodes={periodes}
      isLoading={isLoading}
      statusMessage={statusMessage}
      setStatusMessage={setStatusMessage}
      formatDate={formatDate}
      isModalOpen={isModalOpen}
      setIsModalOpen={setIsModalOpen}
      isSubmitting={isSubmitting}
      editingId={editingId}
      nama={nama}
      setNama={setNama}
      tahunAkademik={tahunAkademik}
      setTahunAkademik={setTahunAkademik}
      semester={semester}
      setSemester={setSemester}
      tanggalMulai={tanggalMulai}
      setTanggalMulai={setTanggalMulai}
      tanggalSelesai={tanggalSelesai}
      setTanggalSelesai={setTanggalSelesai}
      kuota={kuota}
      setKuota={setKuota}
      status={status}
      setStatus={setStatus}
      ketuaLp2m={ketuaLp2m}
      setKetuaLp2m={setKetuaLp2m}
      deskripsi={deskripsi}
      setDeskripsi={setDeskripsi}
      handleOpenCreate={handleOpenCreate}
      handleOpenEdit={handleOpenEdit}
      handleSubmit={handleSubmit}
      togglingId={togglingId}
      handleToggleAktif={handleToggleAktif}
      deleteTarget={deleteTarget}
      setDeleteTarget={setDeleteTarget}
      isDeleting={isDeleting}
      handleDeleteConfirm={handleDeleteConfirm}
    />
  );
}
