'use client';

import React, { useEffect, useState, useCallback, useMemo } from 'react';
import {
  Search,
  Filter,
  RefreshCw,
  AlertCircle,
  CheckCircle2,
  X,
  Edit3,
  Calendar,
  User,
  GraduationCap,
  SlidersHorizontal,
  ChevronLeft,
  ChevronRight,
  Award,
  Check,
  Building2,
  FileSpreadsheet,
  Plus,
  Trash2,
  Calculator,
  HelpCircle,
} from 'lucide-react';
import { PageHeader, AlertBanner, ConfirmModal } from '@/components/ui';
import {
  RUBRIK_BAHASA_JENJANG,
  RUBRIK_ARAB_JENJANG,
  isKriteriaBahasa,
  RubrikJenjang,
} from '@/lib/rubrikBahasa';

interface NilaiDetailItem {
  id_nilai_wawancara: number;
  id_kriteria_wawancara: number;
  nama_kriteria: string;
  bobot: number;
  nilai: number;
  catatan: string;
}

interface WawancaraItem {
  id_wawancara: number;
  id_pendaftaran: number;
  id_staff: number;
  pewawancara: string;
  nip_pewawancara: string;
  nim: string;
  nama: string;
  email: string;
  nama_fakultas: string;
  nama_prodi: string;
  ipk: number | null;
  tanggal_wawancara: string | null;
  catatan: string;
  status_db: string;
  is_dinilai: boolean;
  status_label: 'Dinilai' | 'Belum Dinilai';
  nilai_akhir: number | null;
  nilai_detail: NilaiDetailItem[];
  nama_periode: string;
  id_periode: number | null;
}

interface KriteriaWawancaraItem {
  id_kriteria_wawancara: number;
  id_periode?: number;
  nama_kriteria: string;
  bobot: number;
  nilai_maksimal: number;
}

interface StaffItem {
  id_staff: number;
  nama: string;
  nip: string;
}

interface PeriodeItem {
  id_periode: number;
  nama_periode: string;
  tahun: number;
  status: string;
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

const FAKULTAS_LIST = ['Semua Fakultas', 'FITK', 'FEBI', 'FASYA', 'FUA', 'FDKI', 'FASTIH'];

export default function AdminWawancaraPage() {
  const [items, setItems] = useState<WawancaraItem[]>([]);
  const [kriteriaList, setKriteriaList] = useState<KriteriaWawancaraItem[]>([]);
  const [staffList, setStaffList] = useState<StaffItem[]>([]);
  const [periodes, setPeriodes] = useState<PeriodeItem[]>([]);
  const [selectedPeriodeId, setSelectedPeriodeId] = useState<number | null>(null);

  const [pagination, setPagination] = useState<Pagination>({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 1,
  });
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Filters matching mockup
  const [search, setSearch] = useState<string>('');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedFakultas, setSelectedFakultas] = useState<string>('Semua Fakultas');
  const [currentPage, setCurrentPage] = useState<number>(1);

  // Toast Status Message
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Modal Input Nilai State
  const [editingTarget, setEditingTarget] = useState<WawancaraItem | null>(null);
  const [modalScores, setModalScores] = useState<{ [key: number]: number | '' }>({});
  const [modalCatatan, setModalCatatan] = useState<string>('');
  const [modalStaffId, setModalStaffId] = useState<number>(1);
  const [modalTanggal, setModalTanggal] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Modal Kelola Kriteria Wawancara State
  const [isKriteriaModalOpen, setIsKriteriaModalOpen] = useState<boolean>(false);
  const [editingKriteriaId, setEditingKriteriaId] = useState<number | null>(null);
  const [kriteriaNama, setKriteriaNama] = useState<string>('');
  const [kriteriaBobot, setKriteriaBobot] = useState<string>('');
  const [kriteriaMaksimal, setKriteriaMaksimal] = useState<string>('100');
  const [isSavingKriteria, setIsSavingKriteria] = useState<boolean>(false);
  const [deleteKriteriaTarget, setDeleteKriteriaTarget] = useState<KriteriaWawancaraItem | null>(null);
  const [isDeletingKriteria, setIsDeletingKriteria] = useState<boolean>(false);

  // Fetch Wawancara Data
  const fetchWawancara = useCallback(async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      if (selectedPeriodeId) params.set('id_periode', String(selectedPeriodeId));
      if (selectedStatus !== 'all') params.set('status', selectedStatus);
      if (selectedFakultas !== 'Semua Fakultas') params.set('fakultas', selectedFakultas);
      if (search.trim()) params.set('search', search.trim());
      params.set('page', String(currentPage));
      params.set('limit', '10');

      const res = await fetch(`/api/wawancara?${params.toString()}`);
      const json = await res.json();

      if (json.success) {
        setItems(json.data || []);
        if (json.kriteria_wawancara) setKriteriaList(json.kriteria_wawancara);
        if (json.staff_list) setStaffList(json.staff_list);
        if (json.periodes) {
          setPeriodes(json.periodes);
          if (!selectedPeriodeId && json.periodes.length > 0) {
            const activeP = json.periodes.find((p: any) => p.status === 'Aktif') || json.periodes[0];
            setSelectedPeriodeId(activeP.id_periode);
          }
        }
        if (json.pagination) setPagination(json.pagination);
      } else {
        setStatusMessage({ type: 'error', text: json.message || 'Gagal memuat data wawancara.' });
      }
    } catch (err) {
      console.error(err);
      setStatusMessage({ type: 'error', text: 'Terjadi kesalahan sistem saat menghubungi server.' });
    } finally {
      setIsLoading(false);
    }
  }, [selectedPeriodeId, selectedStatus, selectedFakultas, search, currentPage]);

  useEffect(() => {
    fetchWawancara();
  }, [fetchWawancara]);

  // Filter kriteria wawancara sesuai periode yang sedang dipilih
  const currentPeriodeKriteria = useMemo(() => {
    if (!selectedPeriodeId) return kriteriaList;
    const match = kriteriaList.filter((k) => k.id_periode === selectedPeriodeId);
    return match.length > 0 ? match : kriteriaList;
  }, [kriteriaList, selectedPeriodeId]);

  // Kriteria sesuai kandidat yang sedang dinilai
  const activeCandidateKriteria = useMemo(() => {
    if (!editingTarget) return currentPeriodeKriteria;
    const match = kriteriaList.filter((k) => k.id_periode === editingTarget.id_periode);
    return match.length > 0 ? match : currentPeriodeKriteria;
  }, [editingTarget, kriteriaList, currentPeriodeKriteria]);

  // Format Date Helper
  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return '-';
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString('id-ID', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      });
    } catch {
      return dateStr;
    }
  };

  // Open Score Modal
  const handleOpenScoreModal = (item: WawancaraItem) => {
    setEditingTarget(item);
    setModalStaffId(item.id_staff || staffList[0]?.id_staff || 1);
    setModalCatatan(item.catatan || '');

    // Convert date for date input
    if (item.tanggal_wawancara) {
      try {
        const d = new Date(item.tanggal_wawancara);
        setModalTanggal(d.toISOString().split('T')[0]);
      } catch {
        setModalTanggal('');
      }
    } else {
      setModalTanggal(new Date().toISOString().split('T')[0]);
    }

    const candidateKriteria = item.id_periode
      ? (kriteriaList.filter((k) => k.id_periode === item.id_periode).length > 0
          ? kriteriaList.filter((k) => k.id_periode === item.id_periode)
          : currentPeriodeKriteria)
      : currentPeriodeKriteria;

    // Populate existing scores if already graded, otherwise keep empty
    const scoreMap: { [key: number]: number | '' } = {};
    if (item.nilai_detail && item.nilai_detail.length > 0) {
      item.nilai_detail.forEach((nd) => {
        scoreMap[nd.id_kriteria_wawancara] = nd.nilai;
      });
    } else {
      candidateKriteria.forEach((k) => {
        scoreMap[k.id_kriteria_wawancara] = '';
      });
    }
    setModalScores(scoreMap);
  };

  // Dynamic calculated score in Modal
  const calculatedModalFinalScore = useMemo(() => {
    if (!activeCandidateKriteria || activeCandidateKriteria.length === 0) return null;
    let total = 0;
    let filledCount = 0;
    activeCandidateKriteria.forEach((k) => {
      const sc = modalScores[k.id_kriteria_wawancara];
      if (sc !== '' && sc !== undefined && !isNaN(Number(sc))) {
        total += Number(sc) * (k.bobot / 100);
        filledCount++;
      }
    });
    if (filledCount === 0) return null;
    return parseFloat(total.toFixed(2));
  }, [activeCandidateKriteria, modalScores]);

  // Submit Score Form
  const handleSubmitScore = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTarget) return;

    // Validate all scores are filled
    const hasUnfilled = activeCandidateKriteria.some(
      (k) => modalScores[k.id_kriteria_wawancara] === '' || modalScores[k.id_kriteria_wawancara] === undefined
    );
    if (hasUnfilled) {
      setStatusMessage({ type: 'error', text: 'Semua nilai kriteria wawancara wajib diisi (skala 0 - 100)!' });
      return;
    }

    setIsSubmitting(true);
    try {
      const formattedScores = activeCandidateKriteria.map((k) => ({
        id_kriteria_wawancara: k.id_kriteria_wawancara,
        nilai: Number(modalScores[k.id_kriteria_wawancara]),
        catatan: `Nilai kriteria ${k.nama_kriteria}`,
      }));

      const res = await fetch('/api/wawancara', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id_wawancara: editingTarget.id_wawancara,
          id_staff: modalStaffId,
          tanggal_wawancara: modalTanggal ? new Date(modalTanggal).toISOString() : undefined,
          catatan: modalCatatan.trim(),
          scores: formattedScores,
        }),
      });

      const json = await res.json();
      if (json.success) {
        setStatusMessage({
          type: 'success',
          text: `Nilai wawancara mahasiswa "${editingTarget.nama}" berhasil disimpan!`,
        });
        setEditingTarget(null);
        await fetchWawancara();
      } else {
        setStatusMessage({ type: 'error', text: json.message || 'Gagal menyimpan nilai wawancara.' });
      }
    } catch (err) {
      console.error(err);
      setStatusMessage({ type: 'error', text: 'Terjadi kesalahan sistem saat menyimpan nilai.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Kalkulasi total bobot kriteria wawancara untuk periode yang sedang dipilih
  const totalKriteriaBobot = useMemo(() => {
    return currentPeriodeKriteria.reduce((acc, k) => acc + (Number(k.bobot) || 0), 0);
  }, [currentPeriodeKriteria]);

  const handleOpenAddKriteria = () => {
    setEditingKriteriaId(null);
    setKriteriaNama('');
    setKriteriaBobot('');
    setKriteriaMaksimal('100');
  };

  const handleOpenEditKriteria = (k: KriteriaWawancaraItem) => {
    setEditingKriteriaId(k.id_kriteria_wawancara);
    setKriteriaNama(k.nama_kriteria);
    setKriteriaBobot(String(k.bobot));
    setKriteriaMaksimal(String(k.nilai_maksimal || 100));
  };

  const handleSaveKriteria = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!kriteriaNama.trim() || kriteriaBobot === '') {
      setStatusMessage({ type: 'error', text: 'Nama kriteria dan bobot (%) wajib diisi!' });
      return;
    }

    const bobotNum = parseFloat(kriteriaBobot);
    if (isNaN(bobotNum) || bobotNum <= 0 || bobotNum > 100) {
      setStatusMessage({ type: 'error', text: 'Bobot kriteria harus bernilai antara 1 - 100%!' });
      return;
    }

    setIsSavingKriteria(true);
    try {
      const activePeriode = selectedPeriodeId || periodes[0]?.id_periode || 1;
      const endpoint = '/api/wawancara/kriteria';
      const method = editingKriteriaId ? 'PUT' : 'POST';
      const payload = editingKriteriaId
        ? {
            id_kriteria_wawancara: editingKriteriaId,
            nama_kriteria: kriteriaNama.trim(),
            bobot: bobotNum,
            nilai_maksimal: parseFloat(kriteriaMaksimal) || 100,
          }
        : {
            id_periode: activePeriode,
            nama_kriteria: kriteriaNama.trim(),
            bobot: bobotNum,
            nilai_maksimal: parseFloat(kriteriaMaksimal) || 100,
          };

      const res = await fetch(endpoint, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const json = await res.json();
      if (json.success) {
        setStatusMessage({
          type: 'success',
          text: json.message || 'Kriteria wawancara berhasil disimpan!',
        });
        handleOpenAddKriteria();
        await fetchWawancara();
      } else {
        setStatusMessage({ type: 'error', text: json.message || 'Gagal menyimpan kriteria wawancara.' });
      }
    } catch (err) {
      console.error(err);
      setStatusMessage({ type: 'error', text: 'Terjadi kesalahan sistem saat menyimpan kriteria wawancara.' });
    } finally {
      setIsSavingKriteria(false);
    }
  };

  const handleConfirmDeleteKriteria = async () => {
    if (!deleteKriteriaTarget) return;

    setIsDeletingKriteria(true);
    try {
      const res = await fetch(`/api/wawancara/kriteria?id=${deleteKriteriaTarget.id_kriteria_wawancara}`, {
        method: 'DELETE',
      });
      const json = await res.json();
      if (json.success) {
        setStatusMessage({ type: 'success', text: `Kriteria "${deleteKriteriaTarget.nama_kriteria}" berhasil dihapus!` });
        if (editingKriteriaId === deleteKriteriaTarget.id_kriteria_wawancara) handleOpenAddKriteria();
        setDeleteKriteriaTarget(null);
        await fetchWawancara();
      } else {
        setStatusMessage({ type: 'error', text: json.message || 'Gagal menghapus kriteria wawancara.' });
      }
    } catch (err) {
      console.error(err);
      setStatusMessage({ type: 'error', text: 'Terjadi kesalahan sistem saat menghapus kriteria.' });
    } finally {
      setIsDeletingKriteria(false);
    }
  };

  return (
    <div className="w-full max-w-7xl space-y-6 pb-12 font-sans">
      {/* ── Top Header Area matching Archivo Black Design ── */}
      <PageHeader
        title="HASIL WAWANCARA"
        subtitle="KULIAH KERJA NYATA INTERNASIONAL"
        description="Lihat hasil penilaian wawancara mahasiswa dan kelola kriteria penilaian."
        action={
          <div className="flex flex-wrap items-center gap-2.5">
            {periodes.length > 0 && (
              <div className="flex items-center gap-2 bg-white px-3.5 py-2 rounded-xl border border-slate-300 shadow-2xs">
                <Calendar className="w-4 h-4 text-[#0E4A3E]" />
                <select
                  value={selectedPeriodeId || ''}
                  onChange={(e) => {
                    setSelectedPeriodeId(Number(e.target.value));
                    setCurrentPage(1);
                  }}
                  className="text-xs sm:text-sm font-bold text-slate-700 bg-transparent focus:outline-none cursor-pointer"
                >
                  {periodes.map((p) => (
                    <option key={p.id_periode} value={p.id_periode}>
                      {p.nama_periode} ({p.tahun})
                    </option>
                  ))}
                </select>
              </div>
            )}
            <button
              onClick={() => {
                handleOpenAddKriteria();
                setIsKriteriaModalOpen(true);
              }}
              className="flex items-center gap-2 px-3.5 py-2 bg-[#0E4A3E] hover:bg-[#09352c] text-white rounded-xl text-xs sm:text-sm font-bold shadow-xs transition-colors cursor-pointer"
            >
              <SlidersHorizontal className="w-4 h-4" />
              <span>Kelola Kriteria Wawancara</span>
            </button>
          </div>
        }
      />

      {/* ── Filters Bar (Matching mockup layout) ── */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3">
        {/* Search input with search icon */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Cari data hasil wawancara disini..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-300 rounded-xl text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0E4A3E] shadow-2xs"
          />
        </div>

        {/* Filter 1: Status (Semua Status, Dinilai, Belum Dinilai) */}
        <div className="relative min-w-[170px]">
          <select
            value={selectedStatus}
            onChange={(e) => {
              setSelectedStatus(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-xs sm:text-sm font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#0E4A3E] shadow-2xs appearance-none pr-8 cursor-pointer"
          >
            <option value="all">Semua Status</option>
            <option value="Dinilai">Dinilai</option>
            <option value="Belum Dinilai">Belum Dinilai</option>
          </select>
          <Filter className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
        </div>

        {/* Filter 2: Fakultas (Semua Fakultas, FITK, FEBI, dll) */}
        <div className="relative min-w-[170px]">
          <select
            value={selectedFakultas}
            onChange={(e) => {
              setSelectedFakultas(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-xs sm:text-sm font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#0E4A3E] shadow-2xs appearance-none pr-8 cursor-pointer"
          >
            {FAKULTAS_LIST.map((f) => (
              <option key={f} value={f}>
                {f}
              </option>
            ))}
          </select>
          <Filter className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
        </div>
      </div>

      {/* ── Status Message Alert / Toast ── */}
      <AlertBanner message={statusMessage} onClose={() => setStatusMessage(null)} />

      {/* ── Main Table Card matching Figma Design ── */}
      <div className="kkn-table-card">
        {/* Table Header Bar (#0E4A3E) */}
        <div className="kkn-table-header">
          <div className="kkn-table-header-grid">
            <span className="col-span-1 text-center">No</span>
            <span className="col-span-3">NIM / Nama Mahasiswa</span>
            <span className="col-span-3">Fakultas / Program Studi</span>
            <span className="col-span-3">Nilai Wawancara & Penguji</span>
            <span className="col-span-1 text-center">Status</span>
            <span className="col-span-1 text-center">Aksi</span>
          </div>
        </div>

        {/* Table Content Rows */}
        {isLoading ? (
          <div className="py-16 flex flex-col items-center justify-center text-slate-400 gap-2">
            <RefreshCw className="w-6 h-6 animate-spin text-[#0E4A3E]" />
            <span className="text-xs font-semibold">Memuat data hasil wawancara...</span>
          </div>
        ) : items.length === 0 ? (
          <div className="py-16 px-4 text-center">
            <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-3 text-slate-400">
              <FileSpreadsheet className="w-6 h-6" />
            </div>
            <p className="text-sm font-bold text-slate-700">Tidak ada data wawancara yang sesuai</p>
            <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
              Cobalah sesuaikan kata kunci pencarian atau ubah filter status dan fakultas.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-slate-200">
            {items.map((item, idx) => (
              <div
                key={item.id_wawancara}
                className="kkn-table-row"
              >
                {/* 1. No */}
                <span className="col-span-1 text-center font-bold text-slate-500">
                  {(pagination.page - 1) * pagination.limit + idx + 1}
                </span>

                {/* 2. Mahasiswa Info */}
                <div className="col-span-3 pr-3">
                  <p className="font-bold text-slate-800 leading-snug">{item.nama}</p>
                  <p className="text-[11px] font-semibold text-slate-500 mt-0.5">
                    NIM: <span className="text-slate-700">{item.nim}</span>
                  </p>
                </div>

                {/* 3. Fakultas / Prodi */}
                <div className="col-span-3 pr-3 text-slate-700">
                  <p className="font-semibold text-slate-800">{item.nama_prodi}</p>
                  <span className="inline-block text-[11px] font-bold text-[#0E4A3E] bg-[#0E4A3E]/10 px-2 py-0.5 rounded-md mt-0.5">
                    {item.nama_fakultas}
                  </span>
                </div>

                {/* 4. Nilai Wawancara & Penguji */}
                <div className="col-span-3 pr-3">
                  {item.is_dinilai && item.nilai_akhir !== null ? (
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-base font-extrabold text-[#0E4A3E]">
                          {item.nilai_akhir.toFixed(2)}
                        </span>
                        <span className="text-[11px] text-slate-400">/ 100</span>
                      </div>
                      <p className="text-[11px] text-slate-500 truncate mt-0.5">
                        Penguji: {item.pewawancara}
                      </p>
                    </div>
                  ) : (
                    <div>
                      <span className="text-xs font-semibold text-slate-400 italic">
                        Belum ada penilaian
                      </span>
                      <p className="text-[11px] text-slate-500 truncate mt-0.5">
                        Jadwal: {formatDate(item.tanggal_wawancara)}
                      </p>
                    </div>
                  )}
                </div>

                {/* 5. Status (Dinilai vs Belum Dinilai matching mockup) */}
                <div className="col-span-1 flex justify-center">
                  {item.is_dinilai ? (
                    <span className="inline-block bg-[#C0E6D8] text-[#0E4A3E] border border-emerald-300 font-bold text-[11px] px-3.5 py-1 rounded-full shadow-2xs whitespace-nowrap">
                      Dinilai
                    </span>
                  ) : (
                    <span className="inline-block bg-red-100 text-red-700 border border-red-300 font-bold text-[11px] px-3 py-1 rounded-full whitespace-nowrap">
                      Belum Dinilai
                    </span>
                  )}
                </div>

                {/* 6. Aksi (Yellow edit/input score icon matching mockup) */}
                <div className="col-span-1 flex items-center justify-center">
                  <button
                    onClick={() => handleOpenScoreModal(item)}
                    title={item.is_dinilai ? 'Edit Nilai Wawancara' : 'Input Nilai Wawancara'}
                    className="btn-action-edit"
                  >
                    <Edit3 className="w-4 h-4 stroke-[2.2]" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ── Table Footer / Pagination (Matching mockup) ── */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-slate-600">
          <div>
            Menampilkan{' '}
            <strong className="text-slate-800">
              {pagination.total > 0 ? (pagination.page - 1) * pagination.limit + 1 : 0}
            </strong>
            -
            <strong className="text-slate-800">
              {Math.min(pagination.page * pagination.limit, pagination.total)}
            </strong>{' '}
            data dari <strong className="text-slate-800">{pagination.total}</strong> data
          </div>

          <div className="flex items-center gap-1.5 self-center">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage <= 1 || isLoading}
              className="p-1.5 rounded-lg border border-slate-300 bg-white hover:bg-slate-100 disabled:opacity-40 transition-colors cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map((num) => (
              <button
                key={num}
                onClick={() => setCurrentPage(num)}
                disabled={isLoading}
                className={`w-8 h-8 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  currentPage === num
                    ? 'bg-[#0E4A3E] text-white shadow-xs'
                    : 'bg-white border border-slate-300 text-slate-700 hover:bg-slate-100'
                }`}
              >
                {num}
              </button>
            ))}

            <button
              onClick={() => setCurrentPage((p) => Math.min(pagination.totalPages, p + 1))}
              disabled={currentPage >= pagination.totalPages || isLoading}
              className="p-1.5 rounded-lg border border-slate-300 bg-white hover:bg-slate-100 disabled:opacity-40 transition-colors cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* ── MODAL INPUT / EDIT NILAI WAWANCARA ── */}
      {editingTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-xl border border-slate-200 overflow-hidden">
            {/* Modal Header */}
            <div className="bg-[#0E4A3E] text-white px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Award className="w-5 h-5 text-emerald-300" />
                <h3 className="font-bold text-base">Penilaian Wawancara Mahasiswa</h3>
              </div>
              <button
                onClick={() => setEditingTarget(null)}
                className="text-white/80 hover:text-white p-1 hover:bg-white/10 rounded-lg transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSubmitScore} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
              {/* Student Summary Card */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-slate-800 text-sm sm:text-base">
                    {editingTarget.nama}
                  </h4>
                  <p className="text-xs text-slate-500 mt-0.5">
                    NIM: {editingTarget.nim} • {editingTarget.nama_prodi} ({editingTarget.nama_fakultas})
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-[11px] font-bold text-slate-400 block uppercase">
                    Nilai Akhir
                  </span>
                  <span className="text-lg font-black text-[#0E4A3E]">
                    {calculatedModalFinalScore !== null ? calculatedModalFinalScore.toFixed(2) : '-'}
                  </span>
                </div>
              </div>

              {/* Pewawancara & Tanggal */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Dosen / Staff Pewawancara
                  </label>
                  <select
                    value={modalStaffId}
                    onChange={(e) => setModalStaffId(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs sm:text-sm font-semibold text-slate-800 bg-white focus:outline-none focus:ring-2 focus:ring-[#0E4A3E]"
                  >
                    {staffList.map((s) => (
                      <option key={s.id_staff} value={s.id_staff}>
                        {s.nama}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Tanggal Wawancara
                  </label>
                  <input
                    type="date"
                    value={modalTanggal}
                    onChange={(e) => setModalTanggal(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs sm:text-sm font-semibold text-slate-800 bg-white focus:outline-none focus:ring-2 focus:ring-[#0E4A3E]"
                  />
                </div>
              </div>

              {/* Kriteria Scores List */}
              <div className="space-y-3 pt-2">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Nilai Berdasarkan Kriteria (Skala 0 - 100)
                </label>
                {activeCandidateKriteria.map((k) => {
                  const isBahasa = isKriteriaBahasa(k.nama_kriteria);
                  return (
                    <div
                      key={k.id_kriteria_wawancara}
                      className={`p-3 rounded-xl border transition-colors ${
                        isBahasa
                          ? 'bg-emerald-50/30 border-emerald-300'
                          : 'bg-white border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="text-xs sm:text-sm font-bold text-slate-800 block">
                              {k.nama_kriteria}
                            </span>
                            {isBahasa && (
                              <span className="text-[9px] font-black bg-[#0E4A3E] text-white px-1.5 py-0.5 rounded uppercase">
                                Rubrik Standar
                              </span>
                            )}
                          </div>
                          <span className="text-[11px] font-semibold text-[#0E4A3E]">
                            Bobot: {k.bobot}% • Maks: {k.nilai_maksimal}
                          </span>
                        </div>
                        <div className="w-24">
                          <input
                            type="number"
                            min="0"
                            max="100"
                            step="1"
                            placeholder="0 - 100"
                            value={modalScores[k.id_kriteria_wawancara] === '' ? '' : modalScores[k.id_kriteria_wawancara] ?? ''}
                            onChange={(e) => {
                              const valStr = e.target.value;
                              if (valStr === '') {
                                setModalScores((prev) => ({ ...prev, [k.id_kriteria_wawancara]: '' }));
                              } else {
                                const val = parseFloat(valStr) || 0;
                                setModalScores((prev) => ({
                                  ...prev,
                                  [k.id_kriteria_wawancara]: Math.min(100, Math.max(0, val)),
                                }));
                              }
                            }}
                            className="w-full px-2.5 py-1.5 text-center font-black text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#0E4A3E]"
                          />
                        </div>
                      </div>

                      {/* Quick Tier Buttons for Kemampuan Bahasa */}
                      {isBahasa && (
                        <div className="mb-2 p-2 bg-white rounded-lg border border-emerald-200 space-y-1">
                          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                            Pilihan Skor Berjenjang (TOEFL / IELTS / TOEIC) — P0 = 0:
                          </span>
                          <div className="grid grid-cols-5 gap-1.5">
                            {RUBRIK_BAHASA_JENJANG.map((r) => {
                              const isActive = modalScores[k.id_kriteria_wawancara] === r.nilaiStandar;
                              return (
                                <button
                                  key={r.poin}
                                  type="button"
                                  onClick={() => {
                                    setModalScores((prev) => ({
                                      ...prev,
                                      [k.id_kriteria_wawancara]: r.nilaiStandar,
                                    }));
                                  }}
                                  className={`p-1.5 rounded-lg border text-center transition-all cursor-pointer ${
                                    isActive
                                      ? 'bg-[#0E4A3E] text-white border-[#0E4A3E] font-bold shadow-2xs'
                                      : 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-700'
                                  }`}
                                  title={`${r.predikat} • ${r.toeflLabel} / ${r.ieltsLabel} / ${r.toeicLabel}`}
                                >
                                  <div className="text-[10px] font-bold">P{r.poin}</div>
                                  <div className="text-xs font-black">{r.nilaiStandar}</div>
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      )}

                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={modalScores[k.id_kriteria_wawancara] === '' ? 0 : Number(modalScores[k.id_kriteria_wawancara])}
                        onChange={(e) => {
                          const val = parseInt(e.target.value, 10);
                          setModalScores((prev) => ({
                            ...prev,
                            [k.id_kriteria_wawancara]: val,
                          }));
                        }}
                        className="w-full accent-[#0E4A3E] cursor-pointer"
                      />
                    </div>
                  );
                })}
              </div>

              {/* Catatan Wawancara */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Catatan & Evaluasi Pewawancara
                </label>
                <textarea
                  rows={3}
                  placeholder="Tuliskan catatan hasil wawancara, kelebihan, atau catatan khusus peserta..."
                  value={modalCatatan}
                  onChange={(e) => setModalCatatan(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0E4A3E]"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200 mt-6">
                <button
                  type="button"
                  onClick={() => setEditingTarget(null)}
                  className="px-4 py-2.5 rounded-xl border border-slate-300 text-slate-700 font-bold text-xs sm:text-sm hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-2.5 rounded-xl bg-[#0D6EFD] hover:bg-[#0b5ed7] text-white font-bold text-xs sm:text-sm shadow-md transition-all hover:scale-102 active:scale-98 disabled:opacity-50 cursor-pointer flex items-center gap-2"
                >
                  {isSubmitting && <RefreshCw className="w-4 h-4 animate-spin" />}
                  <span>Simpan Nilai Wawancara</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Modal Kelola Kriteria Wawancara ── */}
      {isKriteriaModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl border border-slate-300 shadow-2xl w-full max-w-4xl max-h-[92vh] overflow-y-auto p-6 md:p-8 space-y-6">
            {/* Modal Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
              <div>
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-6 bg-[#0E4A3E] rounded-full inline-block" />
                  <h3 className="text-xl font-extrabold text-[#0E4A3E] uppercase tracking-wide">
                    Kelola Kriteria & Rubrik Wawancara
                  </h3>
                </div>
                <p className="text-xs text-slate-500 mt-1 pl-4.5">
                  Atur aspek penilaian, persentase bobot, dan skala nilai wawancara untuk periode yang dipilih.
                </p>
              </div>

              <div className="flex items-center gap-2.5 self-end sm:self-auto">
                {periodes.length > 0 && (
                  <div className="flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-300">
                    <Calendar className="w-4 h-4 text-[#0E4A3E]" />
                    <select
                      value={selectedPeriodeId || ''}
                      onChange={(e) => {
                        const newId = Number(e.target.value);
                        setSelectedPeriodeId(newId);
                      }}
                      className="text-xs font-bold text-slate-800 bg-transparent focus:outline-none cursor-pointer"
                    >
                      {periodes.map((p) => (
                        <option key={p.id_periode} value={p.id_periode}>
                          {p.nama_periode} ({p.tahun}) {p.status === 'Aktif' ? '• [Aktif]' : `• [${p.status}]`}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
                <button
                  onClick={() => setIsKriteriaModalOpen(false)}
                  className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Total Bobot Indicator */}
            <div
              className={`p-4 rounded-2xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                totalKriteriaBobot === 100
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                  : 'bg-amber-50 border-amber-200 text-amber-800'
              }`}
            >
              <div className="flex items-center gap-3">
                <Award className="w-5 h-5 text-[#0E4A3E]" />
                <div>
                  <p className="text-xs font-bold uppercase tracking-wide">Total Akumulasi Bobot Wawancara</p>
                  <p className="text-[11px] opacity-80">
                    {totalKriteriaBobot === 100
                      ? 'Total bobot kriteria sudah tepat 100%. Komposisi penilaian valid!'
                      : `Perhatian: Total bobot saat ini ${totalKriteriaBobot}%. Disarankan agar total bobot tepat 100%.`}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <span
                  className={`text-xl font-black ${
                    totalKriteriaBobot === 100 ? 'text-emerald-700' : 'text-amber-700'
                  }`}
                >
                  {totalKriteriaBobot}%
                </span>
                <span className="text-xs text-slate-500 block">/ 100%</span>
              </div>
            </div>

            {/* Criteria List Table */}
            <div className="bg-slate-50 rounded-2xl border border-slate-200 overflow-hidden">
              <div className="bg-[#0E4A3E] text-white px-5 py-3 text-xs font-extrabold uppercase grid grid-cols-12 items-center">
                <span className="col-span-1 text-center">No</span>
                <span className="col-span-5">Nama Kriteria Penilaian</span>
                <span className="col-span-2 text-center">Bobot (%)</span>
                <span className="col-span-2 text-center">Nilai Maks</span>
                <span className="col-span-2 text-center">Aksi</span>
              </div>

              {currentPeriodeKriteria.length === 0 ? (
                <div className="p-8 text-center text-xs text-slate-500">
                  Belum ada kriteria wawancara untuk periode ini. Silakan tambahkan kriteria baru di bawah.
                </div>
              ) : (
                <div className="divide-y divide-slate-200">
                  {currentPeriodeKriteria.map((k, idx) => (
                    <div
                      key={k.id_kriteria_wawancara}
                      className={`grid grid-cols-12 items-center px-5 py-3 text-xs ${
                        editingKriteriaId === k.id_kriteria_wawancara ? 'bg-amber-50/80 font-bold' : 'hover:bg-white'
                      }`}
                    >
                      <span className="col-span-1 text-center font-bold text-slate-500">{idx + 1}</span>
                      <span className="col-span-5 font-semibold text-slate-800">{k.nama_kriteria}</span>
                      <span className="col-span-2 text-center font-bold text-[#0E4A3E]">{k.bobot}%</span>
                      <span className="col-span-2 text-center text-slate-600">{k.nilai_maksimal || 100}</span>
                      <div className="col-span-2 flex items-center justify-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleOpenEditKriteria(k)}
                          className="p-1.5 text-amber-600 hover:bg-amber-100 rounded-lg transition-colors cursor-pointer"
                          title="Edit Kriteria"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setDeleteKriteriaTarget(k)}
                          className="p-1.5 text-red-600 hover:bg-red-100 rounded-lg transition-colors cursor-pointer"
                          title="Hapus Kriteria"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Form Tambah / Edit Kriteria */}
            <form onSubmit={handleSaveKriteria} className="bg-white rounded-2xl border border-slate-300 p-5 space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                <h4 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                  <Plus className="w-4 h-4 text-[#0E4A3E]" />
                  <span>{editingKriteriaId ? 'Edit Kriteria Wawancara' : 'Tambah Kriteria Wawancara Baru'}</span>
                </h4>
                {editingKriteriaId && (
                  <button
                    type="button"
                    onClick={handleOpenAddKriteria}
                    className="text-xs font-semibold text-slate-500 hover:text-slate-800 underline cursor-pointer"
                  >
                    Batal Edit / Buat Baru
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="md:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Nama Kriteria Wawancara <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: Kemampuan Bahasa Inggris, Wawasan Budaya..."
                    value={kriteriaNama}
                    onChange={(e) => setKriteriaNama(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0E4A3E]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Bobot Penilaian (%) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="100"
                    step="0.5"
                    required
                    placeholder="Contoh: 25"
                    value={kriteriaBobot}
                    onChange={(e) => setKriteriaBobot(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0E4A3E]"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="submit"
                  disabled={isSavingKriteria}
                  className="px-5 py-2.5 rounded-xl bg-[#0E4A3E] hover:bg-[#09352c] text-white font-bold text-xs sm:text-sm shadow-md transition-all hover:scale-102 active:scale-98 disabled:opacity-50 cursor-pointer flex items-center gap-2"
                >
                  {isSavingKriteria && <RefreshCw className="w-4 h-4 animate-spin" />}
                  <span>{editingKriteriaId ? 'Simpan Perubahan Kriteria' : '+ Tambah Kriteria'}</span>
                </button>
              </div>
            </form>

            {/* Matriks Standarisasi Rubrik Penilaian Bahasa (Kelompok Inggris & Arab) */}
            <div className="bg-slate-50 rounded-2xl border border-slate-200 p-5 space-y-4">
              <div className="flex items-center gap-2">
                <Calculator className="w-4 h-4 text-[#0E4A3E]" />
                <h4 className="text-xs font-extrabold text-[#0E4A3E] uppercase tracking-wide">
                  Standarisasi Rubrik Penilaian Kemampuan Bahasa Asing
                </h4>
              </div>
              <p className="text-xs text-slate-500">
                Rubrik scoring points berjenjang (Poin 0 s/d 4, di mana Poin 0 bernilai 0):
              </p>

              {/* Tabel Bahasa Inggris (TOEFL, IELTS, TOEIC) */}
              <div className="space-y-1.5">
                <span className="text-[11px] font-bold text-[#0E4A3E] uppercase tracking-wide">
                  1. Kelompok Bahasa Inggris (Standar Utama: TOEFL, IELTS, TOEIC)
                </span>
                <div className="overflow-x-auto bg-white rounded-xl border border-slate-200">
                  <table className="w-full text-left divide-y divide-slate-200 text-xs">
                    <thead className="bg-[#0E4A3E] text-white font-bold text-[11px]">
                      <tr>
                        <th className="px-3 py-2 text-center">Poin</th>
                        <th className="px-3 py-2">Tingkat Kemahiran</th>
                        <th className="px-3 py-2">Skor TOEFL</th>
                        <th className="px-3 py-2">Band IELTS</th>
                        <th className="px-3 py-2">Skor TOEIC</th>
                        <th className="px-3 py-2 text-center">Nilai Standar</th>
                        <th className="px-3 py-2">Indikator Penilaian</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-slate-700 text-[11px]">
                      {RUBRIK_BAHASA_JENJANG.map((r) => (
                        <tr key={r.poin} className="hover:bg-slate-50">
                          <td className="px-3 py-2 text-center font-bold text-[#0E4A3E]">
                            <span className="inline-block px-2 py-0.5 bg-slate-100 rounded">
                              Poin {r.poin}
                            </span>
                          </td>
                          <td className="px-3 py-2 font-bold">{r.predikat}</td>
                          <td className="px-3 py-2 font-mono text-slate-600">{r.toeflLabel}</td>
                          <td className="px-3 py-2 font-mono text-slate-600">{r.ieltsLabel}</td>
                          <td className="px-3 py-2 font-mono text-slate-600">{r.toeicLabel}</td>
                          <td className="px-3 py-2 text-center font-black text-[#0E4A3E]">{r.nilaiStandar}</td>
                          <td className="px-3 py-2 text-slate-600">{r.indikator}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Tabel Bahasa Arab (Opsional / Nilai Tambah) */}
              <div className="space-y-1.5 pt-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-teal-800 uppercase tracking-wide">
                    2. Kelompok Bahasa Arab (Opsional / Nilai Tambah)
                  </span>
                  <span className="text-[10px] font-bold bg-teal-50 text-teal-700 border border-teal-200 px-2 py-0.5 rounded-full">
                    Nilai Tambah
                  </span>
                </div>
                <div className="overflow-x-auto bg-white rounded-xl border border-slate-200">
                  <table className="w-full text-left divide-y divide-slate-200 text-xs">
                    <thead className="bg-teal-800 text-white font-bold text-[11px]">
                      <tr>
                        <th className="px-3 py-2 text-center">Poin</th>
                        <th className="px-3 py-2">Tingkat Kemahiran</th>
                        <th className="px-3 py-2">Skor TOAFL</th>
                        <th className="px-3 py-2">Kemampuan Lisan / Muhadatsah</th>
                        <th className="px-3 py-2 text-center">Nilai Standar</th>
                        <th className="px-3 py-2">Indikator Kompetensi</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-slate-700 text-[11px]">
                      {RUBRIK_ARAB_JENJANG.map((r) => (
                        <tr key={r.poin} className="hover:bg-slate-50">
                          <td className="px-3 py-2 text-center font-bold text-teal-800">
                            <span className="inline-block px-2 py-0.5 bg-slate-100 rounded">
                              Poin {r.poin}
                            </span>
                          </td>
                          <td className="px-3 py-2 font-bold">{r.predikat}</td>
                          <td className="px-3 py-2 font-mono text-slate-600">{r.toaflLabel}</td>
                          <td className="px-3 py-2 text-slate-600">{r.lisanLabel}</td>
                          <td className="px-3 py-2 text-center font-black text-teal-800">{r.nilaiStandar}</td>
                          <td className="px-3 py-2 text-slate-600">{r.indikator}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── DELETE KRITERIA CONFIRMATION MODAL ── */}
      <ConfirmModal
        isOpen={!!deleteKriteriaTarget}
        onClose={() => setDeleteKriteriaTarget(null)}
        onConfirm={handleConfirmDeleteKriteria}
        title="Hapus Kriteria Wawancara?"
        itemName={deleteKriteriaTarget ? `${deleteKriteriaTarget.nama_kriteria} (Bobot: ${deleteKriteriaTarget.bobot}%)` : undefined}
        description="Apakah Anda yakin ingin menghapus kriteria penilaian wawancara ini? Bobot nilai akan terhapus dan mempengaruhi total akumulasi bobot wawancara periode ini."
        isProcessing={isDeletingKriteria}
      />
    </div>
  );
}
