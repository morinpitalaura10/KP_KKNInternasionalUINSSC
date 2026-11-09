'use client';

import React, { useEffect, useState, useCallback, useMemo } from 'react';
import {
  Plus, Edit3, Trash2, CheckCircle2, X, RefreshCw,
  Calendar, Search, Filter,
  AlertTriangle, Clock, CalendarDays, History, MapPin, Award,
} from 'lucide-react';
import { PageHeader, StatCardMint, AlertBanner, ConfirmModal, FilterBar, LogPublikasiModal } from '@/components/ui';

interface PeriodeOption {
  id: number;
  nama: string;
  tahunAkademik: string;
  status?: string;
}

interface TimelineItem {
  id: number;
  id_timeline: number;
  id_periode: number;
  nama_periode: string | null;
  tahun_periode: number | null;
  nama_tahapan: string;
  tanggal_mulai: string; // YYYY-MM-DD
  tanggal_selesai: string; // YYYY-MM-DD
  tanggal_format: string;
  urutan: number;
  deskripsi: string;
  status: boolean;
  is_pelaksanaan: boolean;
  is_pengumuman: boolean;
  status_tahapan: 'Belum Dimulai' | 'Berlangsung' | 'Selesai';
}

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

        // Otomatis jadikan periode yang berstatus Aktif sebagai default filter
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

  // Auto-dismiss status message after 4s
  useEffect(() => {
    if (statusMessage) {
      const timer = setTimeout(() => setStatusMessage(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [statusMessage]);

  // Filtered List
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

  // Scoped Items untuk Stat Cards (mengikuti filter periode yang aktif)
  const scopedItems = useMemo(() => {
    if (filterPeriode === 'semua') return items;
    return items.filter((item) => String(item.id_periode) === filterPeriode);
  }, [items, filterPeriode]);

  // Statistics (dinamis mengikuti periode)
  const totalStages = scopedItems.length;
  const totalBerlangsung = scopedItems.filter((i) => i.status_tahapan === 'Berlangsung' && i.status).length;
  const totalBelumDimulai = scopedItems.filter((i) => i.status_tahapan === 'Belum Dimulai' && i.status).length;
  const totalSelesai = scopedItems.filter((i) => i.status_tahapan === 'Selesai' && i.status).length;

  const activeFilteredPeriode = useMemo(() => {
    if (filterPeriode === 'semua') return null;
    return periodes.find((p) => String(p.id) === filterPeriode) || null;
  }, [filterPeriode, periodes]);

  // Hitung urutan kronologis otomatis berdasarkan id_periode dan tanggal_mulai
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

  // Open Create Modal
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

  // Open Edit Modal
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

  // Validasi real-time alur kronologis: tahapan berikutnya tidak boleh selesai sebelum tahapan sebelumnya,
  // dan tahapan setelahnya tidak boleh berstatus 'Selesai' jika tahapan sebelumnya masih 'Berlangsung' atau 'Belum Dimulai'
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

  // Otomatis sinkronkan urutan saat idPeriode atau tanggalMulai berubah
  useEffect(() => {
    if (isModalOpen && idPeriode) {
      const calculated = getAutoUrutan(idPeriode, tanggalMulai, editingId);
      setUrutan(String(calculated));
    }
  }, [isModalOpen, idPeriode, tanggalMulai, editingId, getAutoUrutan]);

  // Submit Modal (Create or Edit)
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

  // Toggle Visibility Status (Publish / Private)
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

  // Confirm Delete
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
    <div className="w-full max-w-7xl space-y-6 pb-12 font-sans">
      {/* ── Top Header Section ── */}
      <PageHeader
        title="KELOLA TIMELINE KEGIATAN"
        subtitle="KULIAH KERJA NYATA INTERNASIONAL"
        description="Atur tahapan pelaksanaan dan jadwal seleksi KKN Internasional. Status tahapan otomatis berganti sesuai tanggal berjalan."
        action={
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsLogModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-[#0E4A3E] text-xs font-bold transition-colors shadow-xs cursor-pointer"
              title="Lihat Riwayat Publikasi (Log Audit)"
            >
              <History className="w-4 h-4" />
              <span>Log Publikasi</span>
            </button>
            <button
              onClick={fetchData}
              disabled={isLoading}
              className="p-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-[#0E4A3E] transition-colors shadow-xs cursor-pointer"
              title="Muat ulang data"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            </button>
            <button
              onClick={handleOpenCreate}
              className="btn-primary-add"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              <span>Tambah Tahapan</span>
            </button>
          </div>
        }
      />

      {/* ── Feedback Message ── */}
      <AlertBanner message={statusMessage} onClose={() => setStatusMessage(null)} />

      {/* ── Stat Cards ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <StatCardMint
          value={totalStages}
          label="Total Tahapan"
          subLabel={activeFilteredPeriode ? activeFilteredPeriode.nama : 'Keseluruhan jadwal'}
        />
        <StatCardMint
          value={totalBerlangsung}
          label="Berlangsung"
          subLabel={activeFilteredPeriode ? 'Tahapan aktif periode ini' : 'Tahapan aktif saat ini'}
        />
        <StatCardMint
          value={totalBelumDimulai}
          label="Belum Dimulai"
          subLabel={activeFilteredPeriode ? 'Mendatang periode ini' : 'Tahapan mendatang'}
        />
        <StatCardMint
          value={totalSelesai}
          label="Telah Selesai"
          subLabel={activeFilteredPeriode ? 'Selesai periode ini' : 'Tahapan lampau'}
        />
      </div>

      {/* ── Filter & Search Bar ── */}
      <FilterBar
        searchValue={searchQuery}
        onSearchChange={setSearchQuery}
        searchPlaceholder="Cari tahapan atau deskripsi..."
        searchWidth="flex-1"
        filters={[
          {
            value: filterPeriode,
            onChange: setFilterPeriode,
            options: [
              { value: 'semua', label: 'Semua Periode' },
              ...periodes.map((p) => ({
                value: String(p.id),
                label: `${p.nama} (${p.tahunAkademik})${p.status === 'Aktif' ? ' — [Aktif]' : ''}`,
              })),
            ],
          },
          {
            value: filterStatus,
            onChange: setFilterStatus,
            options: [
              { value: 'semua', label: 'Semua Status' },
              { value: 'Berlangsung', label: '🟢 Berlangsung' },
              { value: 'Belum Dimulai', label: '🔵 Belum Dimulai' },
              { value: 'Selesai', label: '⚪ Selesai' },
              { value: 'aktif', label: 'Publikasi: Publish' },
              { value: 'nonaktif', label: 'Publikasi: Private' },
            ],
          },
        ]}
        countBadge={filteredItems.length}
        countLabel="tahapan"
      />

      {/* ── Timeline List / Table ── */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        {isLoading ? (
          <div className="p-12 text-center space-y-3">
            <div className="w-8 h-8 border-3 border-[#0E4A3E] border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-xs text-slate-500 font-semibold">Memuat data jadwal tahapan...</p>
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <CalendarDays className="w-12 h-12 text-slate-300 mx-auto" />
            <h3 className="text-base font-bold text-slate-700">Tidak Ada Data Tahapan</h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              {searchQuery || filterStatus !== 'semua' || filterPeriode !== 'semua'
                ? 'Tidak ada tahapan yang cocok dengan filter pencarian Anda.'
                : 'Belum ada data tahapan timeline yang ditambahkan untuk periode ini.'}
            </p>
            <button
              onClick={handleOpenCreate}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#0E4A3E] text-white text-xs font-bold shadow-xs hover:bg-[#155a4c] transition-colors cursor-pointer mt-2"
            >
              <Plus className="w-4 h-4" /> Tambah Tahapan Pertama
            </button>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {filteredItems.map((item) => {
              const isBerlangsung = item.status_tahapan === 'Berlangsung';
              const isSelesai = item.status_tahapan === 'Selesai';

              return (
                <div
                  key={item.id_timeline}
                  className={`p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 transition-colors hover:bg-slate-50/80 ${
                    !item.status ? 'opacity-60 bg-slate-50/40' : ''
                  }`}
                >
                  {/* Left: Urutan, Title, Period, Desc */}
                  <div className="flex items-start gap-3.5 flex-1 min-w-0">
                    <div
                      className={`w-10 h-10 rounded-2xl flex items-center justify-center font-extrabold text-sm shrink-0 shadow-xs ${
                        isBerlangsung
                          ? 'bg-[#0E4A3E] text-white ring-4 ring-emerald-100'
                          : isSelesai
                          ? 'bg-slate-200 text-slate-700'
                          : 'bg-[#E8F5F1] text-[#0E4A3E]'
                      }`}
                    >
                      {item.urutan}
                    </div>

                    <div className="flex-1 min-w-0 space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-bold text-sm sm:text-base text-slate-900 leading-tight">
                          {item.nama_tahapan}
                        </h3>
                        {item.nama_periode && (
                          <span className="bg-slate-100 text-slate-600 border border-slate-200 text-[10px] font-bold px-2 py-0.5 rounded-full">
                            {item.nama_periode}
                          </span>
                        )}
                        {item.is_pelaksanaan && (
                          <span className="bg-[#C0E6D8] text-[#0E4A3E] border border-[#9ed4c0] text-[10px] font-extrabold px-2.5 py-0.5 rounded-full flex items-center gap-1 shadow-2xs">
                            <MapPin className="w-3 h-3 text-[#0E4A3E]" />
                            Jadwal Utama Pelaksanaan KKN
                          </span>
                        )}
                        {item.is_pengumuman && (
                          <span className="bg-amber-100 text-amber-900 border border-amber-300 text-[10px] font-extrabold px-2.5 py-0.5 rounded-full flex items-center gap-1 shadow-2xs">
                            <Award className="w-3 h-3 text-amber-700" />
                            Jadwal Pengumuman Hasil Seleksi
                          </span>
                        )}
                      </div>

                      {item.deskripsi && (
                        <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                          {item.deskripsi}
                        </p>
                      )}

                      {/* Date details */}
                      <div className="flex items-center gap-2 text-xs text-slate-500 pt-0.5">
                        <Calendar className="w-3.5 h-3.5 text-[#0E4A3E]" />
                        <span className="font-semibold text-slate-700">{item.tanggal_format}</span>
                        <span className="text-slate-300">•</span>
                        <span className="text-[11px] text-slate-400">
                          ({item.tanggal_mulai} s/d {item.tanggal_selesai})
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Right: Status Badges & Action Buttons */}
                  <div className="flex items-center justify-between md:justify-end gap-3 shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-slate-100">
                    {/* Auto Computed Status Badge */}
                    <div className="flex flex-col items-end">
                      <span
                        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black border shadow-xs ${
                          isBerlangsung
                            ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                            : isSelesai
                            ? 'bg-slate-100 text-slate-700 border-slate-200'
                            : 'bg-blue-50 text-blue-700 border-blue-200'
                        }`}
                      >
                        <span
                          className={`w-2 h-2 rounded-full ${
                            isBerlangsung
                              ? 'bg-emerald-500 animate-ping'
                              : isSelesai
                              ? 'bg-slate-400'
                              : 'bg-blue-500'
                          }`}
                        />
                        {item.status_tahapan}
                      </span>
                      <span className="text-[10px] text-slate-400 mt-0.5 font-medium">
                        {isBerlangsung
                          ? 'Aktif Hari Ini'
                          : isSelesai
                          ? 'Waktu Terlewati'
                          : 'Tahapan Mendatang'}
                      </span>
                    </div>

                    {/* Toggle Visibility (Publish / Private) */}
                    <div className="flex items-center">
                      <button
                        onClick={() => handleToggleStatus(item)}
                        disabled={togglingId === item.id_timeline}
                        className="relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 focus:outline-none cursor-pointer disabled:opacity-50"
                        style={{ backgroundColor: item.status ? '#0E4A3E' : '#cbd5e1' }}
                        title={item.status ? 'Klik untuk ubah ke Private (Sembunyikan)' : 'Klik untuk ubah ke Publish (Tampilkan)'}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition-transform duration-200 ${
                            item.status ? 'translate-x-6' : 'translate-x-1'
                          }`}
                        />
                      </button>
                      <span className={`ml-2 text-[10px] font-bold ${item.status ? 'text-emerald-700' : 'text-slate-400'}`}>
                        {togglingId === item.id_timeline ? '...' : item.status ? 'Publish' : 'Private'}
                      </span>
                    </div>

                    <div className="flex items-center gap-1">
                      {/* Edit */}
                      <button
                        onClick={() => handleOpenEdit(item)}
                        className="p-1.5 rounded-lg text-amber-600 hover:bg-amber-50 hover:text-amber-700 transition-colors cursor-pointer"
                        title="Edit Tahapan"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>

                      {/* Delete */}
                      <button
                        onClick={() => setDeleteTarget(item)}
                        className="p-1.5 rounded-lg text-red-500 hover:bg-red-50 hover:text-red-700 transition-colors cursor-pointer"
                        title="Hapus Tahapan"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ── CREATE / EDIT MODAL ── */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-[#E8F5F1] text-[#0E4A3E] flex items-center justify-center">
                  <CalendarDays className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-bold text-slate-800">
                    {editingId ? 'Edit Tahapan Timeline' : 'Tambah Tahapan Timeline Baru'}
                  </h3>
                  <p className="text-xs text-slate-500">Jadwal seleksi KKN Internasional</p>
                </div>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Periode */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Periode Pendaftaran <span className="text-red-500">*</span>
                </label>
                <select
                  value={idPeriode}
                  onChange={(e) => setIdPeriode(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-semibold focus:outline-hidden focus:ring-2 focus:ring-[#0E4A3E] focus:bg-white"
                  required
                >
                  {periodes.map((p) => (
                    <option key={p.id} value={String(p.id)}>
                      {p.nama} ({p.tahunAkademik})
                    </option>
                  ))}
                </select>
              </div>

              {/* Nama Tahapan & Urutan */}
              <div className="grid grid-cols-4 gap-3">
                <div className="col-span-3">
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Nama Tahapan <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="Contoh: Seleksi Wawancara"
                    value={namaTahapan}
                    onChange={(e) => setNamaTahapan(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-hidden focus:ring-2 focus:ring-[#0E4A3E] focus:bg-white"
                    required
                  />
                </div>
                <div className="col-span-1">
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-xs font-bold text-slate-700">
                      Urutan
                    </label>
                    <span className="text-[9px] font-bold text-[#0E4A3E] bg-[#E8F5F1] px-1 py-0.5 rounded">
                      Auto
                    </span>
                  </div>
                  <input
                    type="number"
                    min="1"
                    value={urutan}
                    readOnly
                    className="w-full px-3.5 py-2.5 bg-slate-100 border border-slate-200 rounded-xl text-xs sm:text-sm font-extrabold text-center text-[#0E4A3E] cursor-not-allowed select-none shadow-inner"
                    title="Urutan otomatis ditentukan berdasarkan urutan kronologis tanggal mulai pada periode ini"
                  />
                </div>
              </div>

              {/* Tanggal Mulai & Tanggal Selesai */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Tanggal Mulai <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    value={tanggalMulai}
                    onChange={(e) => setTanggalMulai(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-semibold focus:outline-hidden focus:ring-2 focus:ring-[#0E4A3E] focus:bg-white"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Tanggal Selesai <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    value={tanggalSelesai}
                    onChange={(e) => setTanggalSelesai(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-semibold focus:outline-hidden focus:ring-2 focus:ring-[#0E4A3E] focus:bg-white"
                    required
                  />
                </div>
              </div>

              {/* Live Status Calculation & Kronologis Preview */}
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-slate-500 font-medium">Prediksi Status:</span>
                  <span
                    className={`px-2.5 py-0.5 rounded-full font-bold border ${
                      modalLiveStatus === 'Berlangsung'
                        ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                        : modalLiveStatus === 'Selesai'
                        ? 'bg-slate-200 text-slate-700 border-slate-300'
                        : 'bg-blue-100 text-blue-800 border-blue-300'
                    }`}
                  >
                    {modalLiveStatus === 'Berlangsung' && '🟢 Sedang Berlangsung'}
                    {modalLiveStatus === 'Belum Dimulai' && '🔵 Belum Dimulai'}
                    {modalLiveStatus === 'Selesai' && '⚪ Telah Selesai'}
                  </span>
                </div>
                <div className="flex items-center justify-between pt-1 border-t border-slate-200/60 text-[11px]">
                  <span className="text-slate-500">Posisi Urutan Otomatis:</span>
                  <span className="font-bold text-[#0E4A3E]">
                    Tahapan ke-{urutan} dari {items.filter(i => String(i.id_periode) === idPeriode && i.id_timeline !== editingId).length + 1} (Kronologis)
                  </span>
                </div>
              </div>

              {/* Warning Alert if Chronology is Violated */}
              {!chronologyValidation.valid && (
                <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 flex items-start gap-2.5 animate-fadeIn">
                  <AlertTriangle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-bold">Konflik Alur Kronologis</p>
                    <p className="text-[11px] text-red-600 mt-0.5 leading-relaxed">
                      {chronologyValidation.message}
                    </p>
                  </div>
                </div>
              )}

              {/* Deskripsi */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Deskripsi / Keterangan Tahapan
                </label>
                <textarea
                  rows={3}
                  placeholder="Penjelasan ringkas mengenai tahapan ini..."
                  value={deskripsi}
                  onChange={(e) => setDeskripsi(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-hidden focus:ring-2 focus:ring-[#0E4A3E] focus:bg-white resize-none"
                />
              </div>

              {/* Status Switch (Publish / Private) */}
              <div className="pt-2 flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-slate-800 block">
                    Status Publikasi ({statusActive ? 'Publish' : 'Private'})
                  </span>
                  <span className="text-[11px] text-slate-400">
                    {statusActive
                      ? 'Publish: Ditampilkan ke halaman publik & portal mahasiswa'
                      : 'Private: Disembunyikan dari publik & mahasiswa'}
                  </span>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={statusActive}
                    onChange={(e) => setStatusActive(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-slate-200 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#0E4A3E]"></div>
                </label>
              </div>

              {/* Toggle Jadwal Utama Pelaksanaan KKN */}
              <div className="p-3.5 rounded-xl border border-emerald-200 bg-emerald-50/60 flex items-center justify-between gap-3">
                <div className="space-y-0.5">
                  <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-[#0E4A3E]" />
                    Jadikan Jadwal Utama Pelaksanaan KKN
                  </span>
                  <span className="text-[11px] text-slate-600 block leading-relaxed">
                    Tanggal tahapan ini akan otomatis dijadikan acuan pada kartu <b>&quot;Waktu &amp; Periode&quot;</b> di halaman informasi.
                  </span>
                </div>
                <label className="relative inline-flex items-center cursor-pointer shrink-0">
                  <input
                    type="checkbox"
                    checked={isPelaksanaan}
                    onChange={(e) => setIsPelaksanaan(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-slate-200 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#0E4A3E]"></div>
                </label>
              </div>

              {/* Toggle Jadwal Pengumuman Hasil Seleksi */}
              <div className="p-3.5 rounded-xl border border-amber-200 bg-amber-50/60 flex items-center justify-between gap-3">
                <div className="space-y-0.5">
                  <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                    <Award className="w-3.5 h-3.5 text-amber-700" />
                    Jadikan Jadwal Pengumuman Hasil Seleksi
                  </span>
                  <span className="text-[11px] text-slate-600 block leading-relaxed">
                    Batas akhir tahapan ini dijadikan acuan penguncian otomatis keputusan hasil seleksi dan pengumuman kelulusan di portal publik/mahasiswa.
                  </span>
                </div>
                <label className="relative inline-flex items-center cursor-pointer shrink-0">
                  <input
                    type="checkbox"
                    checked={isPengumuman}
                    onChange={(e) => setIsPengumuman(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-slate-200 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-600"></div>
                </label>
              </div>

              {/* Buttons */}
              <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-slate-100 mt-6">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  disabled={isSubmitting}
                  className="px-4 py-2.5 rounded-xl border border-slate-300 text-slate-700 text-xs sm:text-sm font-bold hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || !chronologyValidation.valid}
                  className="px-5 py-2.5 rounded-xl bg-[#0E4A3E] hover:bg-[#155a4c] text-white text-xs sm:text-sm font-bold shadow-md transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer flex items-center gap-2"
                  title={!chronologyValidation.valid ? chronologyValidation.message : undefined}
                >
                  {isSubmitting && <RefreshCw className="w-4 h-4 animate-spin" />}
                  {editingId ? 'Simpan Perubahan' : 'Tambah Tahapan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── DELETE CONFIRMATION MODAL ── */}
      <ConfirmModal
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDeleteConfirm}
        title="Hapus Tahapan?"
        itemName={deleteTarget?.nama_tahapan}
        description="Apakah Anda yakin ingin menghapus tahapan timeline ini? Tindakan ini tidak dapat dibatalkan."
        isProcessing={isDeleting}
      />

      {/* ── LOG AUDIT PUBLIKASI MODAL ── */}
      <LogPublikasiModal
        isOpen={isLogModalOpen}
        onClose={() => setIsLogModalOpen(false)}
        defaultJenis="timeline"
        idPeriode={filterPeriode !== 'semua' ? filterPeriode : null}
      />
    </div>
  );
}
