'use client';

import React, { useEffect, useState } from 'react';
import {
  Plus,
  Edit3,
  Trash2,
  Calendar,
  Users,
  CheckCircle2,
  AlertCircle,
  X,
  RefreshCw,
} from 'lucide-react';

import { PageHeader, AlertBanner, ConfirmModal } from '@/components/ui';

interface PeriodeItem {
  id: string;
  nama: string;
  tahunAkademik: string;
  semester?: string | null;
  tanggalMulai: string;
  tanggalSelesai: string;
  kuota?: number | null;
  deskripsi?: string | null;
  status: 'Aktif' | 'Belum Aktif' | 'Selesai' | string;
}

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
  const [deskripsi, setDeskripsi] = useState('');

  // Delete Confirm Modal State
  const [deleteTarget, setDeleteTarget] = useState<PeriodeItem | null>(null);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);

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

  // Toggle Aktivasi Periode (hanya 1 periode yang boleh Aktif)
  const [togglingId, setTogglingId] = useState<string | null>(null);
  const handleToggleAktif = async (item: PeriodeItem) => {
    const willActivate = item.status !== 'Aktif';

    setTogglingId(item.id);
    setStatusMessage(null);

    // Optimistic UI update: langsung ubah state agar cepat & responsif seketika
    const previousPeriodes = [...periodes];
    setPeriodes((prev) =>
      prev.map((p) => {
        if (p.id === item.id) {
          return { ...p, status: willActivate ? 'Aktif' : 'Belum Aktif' };
        }
        // Jika periode ini dinyalakan, periode aktif lainnya otomatis Selesai
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
    <div className="w-full max-w-7xl space-y-6 pb-12 font-sans">
      
      {/* ── Top Header Area matching Archivo Black Design ── */}
      <PageHeader
        title="KELOLA PERIODE PENDAFTARAN"
        subtitle="KULIAH KERJA NYATA INTERNASIONAL"
        description="Atur jadwal periode pendaftaran KKN Internasional."
        action={
          <button onClick={handleOpenCreate} className="btn-primary-add">
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>Tambah Periode</span>
          </button>
        }
      />

      {/* ── Status Message Alert ── */}
      <AlertBanner message={statusMessage} onClose={() => setStatusMessage(null)} />

      {/* ── Main Table Card matching Figma Design ── */}
      <div className="kkn-table-card">
        {/* Table Header Bar */}
        <div className="kkn-table-header">
          <div className="kkn-table-header-grid">
            <span className="col-span-1 text-center">No</span>
            <span className="col-span-4">Nama Periode</span>
            <span className="col-span-2">Tahun / Smt</span>
            <span className="col-span-3">Jadwal Pendaftaran</span>
            <span className="col-span-1 text-center">Status</span>
            <span className="col-span-1 text-center">Aksi</span>
          </div>
        </div>

        {/* Table Content Rows */}
        {isLoading ? (
          <div className="py-12 flex flex-col items-center justify-center text-slate-400 gap-2">
            <RefreshCw className="w-6 h-6 animate-spin text-[#0E4A3E]" />
            <span className="text-xs font-semibold">Memuat data periode dari MySQL...</span>
          </div>
        ) : periodes.length === 0 ? (
          <div className="py-12 text-center text-slate-500 text-sm">
            Belum ada periode pendaftaran. Klik tombol <span className="font-bold text-[#0D6EFD]">+ Tambah Periode</span> untuk memulai.
          </div>
        ) : (
          <div className="divide-y divide-slate-200">
            {periodes.map((p, idx) => (
              <div key={p.id} className="kkn-table-row">
                {/* No */}
                <span className="col-span-1 text-center font-bold text-slate-500">
                  {idx + 1}
                </span>

                {/* Nama Periode */}
                <div className="col-span-4 pr-3">
                  <p className="font-bold text-slate-800 leading-snug">{p.nama}</p>
                  {p.deskripsi && (
                    <p className="text-[11px] text-slate-500 truncate mt-0.5">{p.deskripsi}</p>
                  )}
                </div>

                {/* Tahun Akademik / Semester */}
                <div className="col-span-2 text-slate-600">
                  <span className="font-semibold">{p.tahunAkademik}</span>
                  <span className="block text-[11px] text-slate-400">Semester {p.semester || 'Ganjil'}</span>
                </div>

                {/* Jadwal Pendaftaran */}
                <div className="col-span-3 pr-2 text-slate-700">
                  <div className="flex items-center gap-1.5 text-slate-800 font-semibold">
                    <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>{formatDate(p.tanggalMulai)} – {formatDate(p.tanggalSelesai)}</span>
                  </div>
                  <span className="text-[11px] text-slate-400 block mt-0.5">
                    Kuota: {p.kuota ?? 10} Mahasiswa
                  </span>
                </div>

                {/* Status Toggle Switch: Langsung on/off seketika */}
                <div className="col-span-1 flex flex-col items-center justify-center gap-1.5">
                  <button
                    type="button"
                    role="switch"
                    aria-checked={p.status === 'Aktif'}
                    onClick={() => handleToggleAktif(p)}
                    disabled={togglingId === p.id}
                    title={p.status === 'Aktif' ? 'Klik untuk menonaktifkan periode ini' : 'Klik untuk mengaktifkan periode ini'}
                    className={`group relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-[#0E4A3E] focus:ring-offset-1 ${
                      p.status === 'Aktif' ? 'bg-[#0E4A3E]' : 'bg-slate-300 hover:bg-slate-400'
                    } ${togglingId === p.id ? 'opacity-60 cursor-wait' : ''}`}
                  >
                    <span className="sr-only">Toggle Status Periode</span>
                    <span
                      className={`inline-flex items-center justify-center h-4 w-4 transform rounded-full bg-white shadow-md transition duration-200 ease-in-out ${
                        p.status === 'Aktif' ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    >
                      {togglingId === p.id && (
                        <RefreshCw className="w-2.5 h-2.5 animate-spin text-[#0E4A3E]" />
                      )}
                    </span>
                  </button>

                  <span
                    className={`inline-block font-bold text-[10px] px-2.5 py-0.5 rounded-full transition-all ${
                      p.status === 'Aktif'
                        ? 'bg-[#C0E6D8] text-emerald-900 border border-emerald-300 shadow-2xs'
                        : p.status === 'Belum Aktif'
                        ? 'bg-slate-100 text-slate-600 border border-slate-300'
                        : 'bg-red-50 text-red-700 border border-red-200'
                    }`}
                  >
                    {p.status}
                  </span>
                </div>

                {/* Action Buttons (Yellow Edit & Red Delete) */}
                <div className="col-span-1 flex items-center justify-center gap-2">
                  {/* Edit Button */}
                  <button
                    onClick={() => handleOpenEdit(p)}
                    title="Edit Periode"
                    className="p-1.5 text-amber-500 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors cursor-pointer"
                  >
                    <Edit3 className="w-4 h-4 stroke-[2.2]" />
                  </button>

                  {/* Delete Button */}
                  <button
                    onClick={() => setDeleteTarget(p)}
                    title="Hapus Periode"
                    className="p-1.5 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4 stroke-[2.2]" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

      </div>

      {/* ── MODAL FORM: CREATE / EDIT PERIODE ── */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full overflow-hidden border border-slate-200 animate-in fade-in duration-200">
            
            {/* Modal Header */}
            <div className="bg-[#0E4A3E] text-white px-6 py-4 flex items-center justify-between">
              <h3 className="font-extrabold text-base tracking-wide uppercase">
                {editingId ? 'Edit Periode Pendaftaran' : 'Tambah Periode Pendaftaran'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-white/80 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              
              {/* Field 1: Nama Periode */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Nama Periode *
                </label>
                <input
                  type="text"
                  required
                  value={nama}
                  onChange={(e) => setNama(e.target.value)}
                  placeholder="Contoh: KKN Internasional Gelombang 1"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-slate-800 text-xs sm:text-sm font-semibold outline-none focus:border-[#0E4A3E] focus:ring-1 focus:ring-[#0E4A3E]"
                />
              </div>

              {/* Field 2 & 3: Tahun Akademik & Semester */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Tahun Akademik *
                  </label>
                  <input
                    type="text"
                    required
                    value={tahunAkademik}
                    onChange={(e) => setTahunAkademik(e.target.value)}
                    placeholder="2026/2027"
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-slate-800 text-xs sm:text-sm outline-none focus:border-[#0E4A3E]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Semester
                  </label>
                  <select
                    value={semester}
                    onChange={(e) => setSemester(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-slate-800 text-xs sm:text-sm outline-none focus:border-[#0E4A3E]"
                  >
                    <option value="Ganjil">Ganjil</option>
                    <option value="Genap">Genap</option>
                    <option value="Antara">Antara</option>
                  </select>
                </div>
              </div>

              {/* Field 4 & 5: Tanggal Mulai & Tanggal Selesai */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Tanggal Mulai *
                  </label>
                  <input
                    type="date"
                    required
                    value={tanggalMulai}
                    onChange={(e) => setTanggalMulai(e.target.value)}
                    className="w-full px-4 py-2 rounded-xl border border-slate-300 text-slate-800 text-xs sm:text-sm outline-none focus:border-[#0E4A3E]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Tanggal Selesai *
                  </label>
                  <input
                    type="date"
                    required
                    value={tanggalSelesai}
                    onChange={(e) => setTanggalSelesai(e.target.value)}
                    className="w-full px-4 py-2 rounded-xl border border-slate-300 text-slate-800 text-xs sm:text-sm outline-none focus:border-[#0E4A3E]"
                  />
                </div>
              </div>

              {/* Field 6 & 7: Kuota & Status */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Kuota Peserta
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={kuota}
                    onChange={(e) => setKuota(e.target.value)}
                    placeholder="10"
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-slate-800 text-xs sm:text-sm outline-none focus:border-[#0E4A3E]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Status Periode *
                  </label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as any)}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-slate-800 text-xs sm:text-sm font-semibold outline-none focus:border-[#0E4A3E]"
                  >
                    <option value="Aktif">Aktif (Sedang Berlangsung)</option>
                    <option value="Belum Aktif">Belum Aktif</option>
                    <option value="Selesai">Selesai</option>
                  </select>
                  {status === 'Aktif' && (
                    <p className="text-[10px] text-amber-600 font-semibold mt-1">
                      Hanya 1 periode yang boleh Aktif. Periode aktif lainnya akan otomatis ditandai Selesai.
                    </p>
                  )}
                </div>
              </div>

              {/* Field 8: Deskripsi / Catatan */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Deskripsi / Catatan Tambahan (Opsional)
                </label>
                <textarea
                  rows={2}
                  value={deskripsi}
                  onChange={(e) => setDeskripsi(e.target.value)}
                  placeholder="Keterangan penempatan negara atau petunjuk pendaftaran..."
                  className="w-full px-4 py-2 rounded-xl border border-slate-300 text-slate-800 text-xs sm:text-sm outline-none focus:border-[#0E4A3E]"
                />
              </div>

              {/* Action Buttons */}
              <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  disabled={isSubmitting}
                  className="px-5 py-2 rounded-xl border border-slate-300 text-slate-700 text-xs sm:text-sm font-bold hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-2 rounded-xl bg-[#0E4A3E] hover:bg-[#09352c] text-white text-xs sm:text-sm font-bold shadow-sm transition-all hover:scale-102 active:scale-98 disabled:opacity-50 flex items-center gap-2 cursor-pointer"
                >
                  {isSubmitting && <RefreshCw className="w-4 h-4 animate-spin" />}
                  {isSubmitting ? 'Menyimpan...' : editingId ? 'Simpan Perubahan' : 'Simpan Periode'}
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

      {/* ── MODAL CONFIRM DELETE ── */}
      <ConfirmModal
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDeleteConfirm}
        title="Konfirmasi Hapus Periode"
        itemName={deleteTarget?.nama}
        description="Apakah Anda yakin ingin menghapus periode pendaftaran ini? Seluruh data yang terkait akan terhapus dan tindakan ini tidak dapat dibatalkan."
        isProcessing={isDeleting}
      />

    </div>
  );
}
