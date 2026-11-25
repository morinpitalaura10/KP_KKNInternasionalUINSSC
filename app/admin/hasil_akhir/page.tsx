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
  Trophy,
  ChevronLeft,
  ChevronRight,
  Award,
  Check,
  Building2,
  FileSpreadsheet,
  HelpCircle,
  AlertTriangle,
  UserCheck,
  ChevronDown,
  Calculator,
  Layers,
  Sparkles,
  Globe2,
  Users,
  SlidersHorizontal,
  Loader2,
  Settings2,
  Percent,
  Lock,
  Unlock,
  Eye,
  EyeOff,
  History,
  Send,
  Clock,
} from 'lucide-react';
import { PageHeader, AlertBanner, LogPublikasiModal, ConfirmModal } from '@/components/ui';
import AdminHasilAkhirView from '@/components/admin/AdminHasilAkhirView';

interface FakultasStat {
  nama_fakultas: string;
  total: number;
  lolos: number;
  cadangan: number;
}

interface HasilAkhirItem {
  id_hasil: number;
  id_pendaftaran: number;
  ranking_akhir: number;
  ranking_awal: number;
  nim: string;
  nama: string;
  email: string;
  nama_fakultas: string;
  nama_prodi: string;
  ipk: number | null;
  nilai_substansi: number;
  nilai_wawancara: number;
  bobot_substansi: number;
  bobot_wawancara: number;
  nilai_akhir: number;
  status: 'Lolos' | 'Cadangan' | 'Tidak_Lolos';
  status_label: 'Lolos' | 'Cadangan' | 'Tidak Lolos';
  catatan: string;
  hasRekomendasiDekan?: boolean;
  ditetapkan_oleh: string;
  tanggal_penetapan: string | null;
  nama_periode: string;
  id_periode: number | null;
  nama_negara: string;
}

interface SummaryStats {
  totalPeserta: number;
  totalLolos: number;
  totalCadangan: number;
  totalTidakLolos: number;
  persenLolos: number;
  persenTidakLolos: number;
  persenCadangan: number;
  targetKuota: number;
  bobotSubstansi?: number;
  bobotWawancara?: number;
  fakultasBreakdown?: FakultasStat[];
}

interface PeriodeItem {
  id_periode: number;
  nama_periode: string;
  tahun: number;
  status: string;
  kuota: number;
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

interface PublikasiInfo {
  locked: boolean;
  alasan: string | null;
  dipublikasi: boolean;
  tanggal_publikasi: string | null;
  dipublikasi_oleh: number | null;
  nama_user_publikasi: string | null;
  batas_penetapan: string | null;
  lewat_batas_waktu: boolean;
}

const FAKULTAS_LIST = ['Semua Fakultas', 'FITK', 'FEBI', 'FASYA', 'FUA', 'FDKI', 'FASTIH'];

export default function AdminHasilAkhirPage() {
  const [items, setItems] = useState<HasilAkhirItem[]>([]);
  const [summary, setSummary] = useState<SummaryStats>({
    totalPeserta: 0,
    totalLolos: 0,
    totalCadangan: 0,
    totalTidakLolos: 0,
    persenLolos: 0,
    persenTidakLolos: 0,
    persenCadangan: 0,
    targetKuota: 10,
  });
  const [periodes, setPeriodes] = useState<PeriodeItem[]>([]);
  const [selectedPeriodeId, setSelectedPeriodeId] = useState<number | null>(null);

  const [pagination, setPagination] = useState<Pagination>({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 1,
  });
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Filters
  const [search, setSearch] = useState<string>('');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedFakultas, setSelectedFakultas] = useState<string>('Semua Fakultas');
  const [currentPage, setCurrentPage] = useState<number>(1);

  // Status Message Toast
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Modal Update Status State
  const [selectedDetail, setSelectedDetail] = useState<HasilAkhirItem | null>(null);
  const [modalNewStatus, setModalNewStatus] = useState<'Lolos' | 'Cadangan' | 'Tidak Lolos'>('Lolos');
  const [modalCatatan, setModalCatatan] = useState<string>('');
  const [isUpdating, setIsUpdating] = useState<boolean>(false);

  // Modal Atur Kuota State
  const [isKuotaModalOpen, setIsKuotaModalOpen] = useState<boolean>(false);
  const [inputKuota, setInputKuota] = useState<number>(10);
  const [inputCadangan, setInputCadangan] = useState<number>(3);
  const [applyRankingStatus, setApplyRankingStatus] = useState<boolean>(true);
  const [isSavingKuota, setIsSavingKuota] = useState<boolean>(false);
  const [isCalculatingSPK, setIsCalculatingSPK] = useState<boolean>(false);

  // Modal Atur Bobot Formula State
  const [isBobotModalOpen, setIsBobotModalOpen] = useState<boolean>(false);
  const [inputBobotSubstansi, setInputBobotSubstansi] = useState<number>(70);
  const [inputBobotWawancara, setInputBobotWawancara] = useState<number>(30);
  const [recalculateWeights, setRecalculateWeights] = useState<boolean>(true);
  const [isSavingBobot, setIsSavingBobot] = useState<boolean>(false);

  // Dynamic Weights (from DB Summary or fallback to item/70:30)
  const currentBobotSubstansi = summary.bobotSubstansi ?? (items[0]?.bobot_substansi ?? 70);
  const currentBobotWawancara = summary.bobotWawancara ?? (items[0]?.bobot_wawancara ?? 30);

  // Modal SAW State
  const [isSawModalOpen, setIsSawModalOpen] = useState<boolean>(false);
  const [sawTab, setSawTab] = useState<'keputusan' | 'normalisasi' | 'preferensi'>('preferensi');

  // Publikasi State
  const [publikasiInfo, setPublikasiInfo] = useState<PublikasiInfo | null>(null);
  const [isPublishing, setIsPublishing] = useState<boolean>(false);
  const [isLogModalOpen, setIsLogModalOpen] = useState<boolean>(false);
  const [confirmPublishModal, setConfirmPublishModal] = useState<{
    willPublish: boolean;
    namaPeriodeLabel: string;
    activePeriode: number;
  } | null>(null);

  // SPK Simple Additive Weighting (SAW) Calculation
  const sawCalculation = useMemo(() => {
    if (items.length === 0) return null;

    // Benefit criteria max values
    const maxSubstansi = Math.max(...items.map((i) => i.nilai_substansi || 1));
    const maxWawancara = Math.max(...items.map((i) => i.nilai_wawancara || 1));

    // Dynamic weights from DB
    const wSubstansi = currentBobotSubstansi / 100;
    const wWawancara = currentBobotWawancara / 100;

    const rows = items.map((item) => {
      // Normalization: r_ij = x_ij / max(x_j) [Benefit criterion]
      const rSubstansi = maxSubstansi > 0 ? item.nilai_substansi / maxSubstansi : 0;
      const rWawancara = maxWawancara > 0 ? item.nilai_wawancara / maxWawancara : 0;

      // Preference value: V_i = (w1 * r1) + (w2 * r2)
      const vPreference = (wSubstansi * rSubstansi) + (wWawancara * rWawancara);

      return {
        id_hasil: item.id_hasil,
        nim: item.nim,
        nama: item.nama,
        fakultas: item.nama_fakultas,
        xSubstansi: item.nilai_substansi,
        xWawancara: item.nilai_wawancara,
        rSubstansi: parseFloat(rSubstansi.toFixed(4)),
        rWawancara: parseFloat(rWawancara.toFixed(4)),
        vPreference: parseFloat(vPreference.toFixed(4)),
        ranking_akhir: item.ranking_akhir,
        status: item.status_label,
        hasRekomendasiDekan: item.hasRekomendasiDekan,
      };
    });

    return {
      maxSubstansi,
      maxWawancara,
      wSubstansi,
      wWawancara,
      rows,
    };
  }, [items]);

  // Fetch Data
  const fetchHasilAkhir = useCallback(async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      if (selectedPeriodeId) params.set('id_periode', String(selectedPeriodeId));
      if (selectedStatus !== 'all') params.set('status', selectedStatus);
      if (selectedFakultas !== 'Semua Fakultas') params.set('fakultas', selectedFakultas);
      if (search.trim()) params.set('search', search.trim());
      params.set('page', String(currentPage));
      params.set('limit', '10');

      const res = await fetch(`/api/hasil_akhir?${params.toString()}`);
      const json = await res.json();

      if (json.success) {
        setItems(json.data || []);
        if (json.summary) setSummary(json.summary);
        if (json.publikasi !== undefined) setPublikasiInfo(json.publikasi);
        if (json.periodes) {
          setPeriodes(json.periodes);
          const currentId = selectedPeriodeId || json.activePeriodeId || json.periodes[0]?.id_periode;
          if (currentId && currentId !== selectedPeriodeId) {
            setSelectedPeriodeId(currentId);
          }
        }
        if (json.pagination) setPagination(json.pagination);
      } else {
        setStatusMessage({ type: 'error', text: json.message || 'Gagal memuat data hasil akhir.' });
      }
    } catch (err) {
      console.error(err);
      setStatusMessage({ type: 'error', text: 'Terjadi kesalahan sistem saat menghubungi server.' });
    } finally {
      setIsLoading(false);
    }
  }, [selectedPeriodeId, selectedStatus, selectedFakultas, search, currentPage]);

  useEffect(() => {
    fetchHasilAkhir();
  }, [fetchHasilAkhir]);

  // Open Edit / Detail Modal
  const handleOpenDetailModal = (item: HasilAkhirItem) => {
    setSelectedDetail(item);
    setModalNewStatus(item.status_label);
    setModalCatatan(item.catatan || '');
  };

  // Publikasi / Tarik Publikasi Hasil Seleksi (Fleksibel & Manual)
  const handleTogglePublish = () => {
    const activePeriode = selectedPeriodeId || periodes[0]?.id_periode;
    if (!activePeriode) {
      setStatusMessage({ type: 'error', text: 'Pilih periode KKN terlebih dahulu!' });
      return;
    }

    const selPeriode = periodes.find((p) => p.id_periode === activePeriode);
    const namaPeriodeLabel = selPeriode ? `${selPeriode.nama_periode} (${selPeriode.tahun})` : 'periode ini';

    const willPublish = !publikasiInfo?.dipublikasi;

    if (willPublish && items.length === 0 && summary.totalPeserta === 0) {
      setStatusMessage({
        type: 'error',
        text: 'Belum ada data hasil seleksi pada periode ini. Silakan klik tombol "Kalkulasi SPK" terlebih dahulu.',
      });
      return;
    }

    setConfirmPublishModal({
      willPublish,
      namaPeriodeLabel,
      activePeriode,
    });
  };

  const handleConfirmTogglePublish = async () => {
    if (!confirmPublishModal) return;
    const { activePeriode, willPublish } = confirmPublishModal;

    setIsPublishing(true);
    setStatusMessage(null);
    try {
      const res = await fetch('/api/hasil_akhir/publikasi', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id_periode: activePeriode, dipublikasi: willPublish }),
      });
      const json = await res.json();
      if (json.success) {
        setConfirmPublishModal(null);
        setStatusMessage({
          type: 'success',
          text: json.message || (willPublish ? 'Hasil seleksi berhasil dipublikasikan!' : 'Publikasi hasil seleksi berhasil ditarik ke Draft.'),
        });
        await fetchHasilAkhir();
      } else {
        setStatusMessage({
          type: 'error',
          text: json.message || 'Gagal mengubah status publikasi hasil seleksi.',
        });
      }
    } catch {
      setStatusMessage({
        type: 'error',
        text: 'Terjadi kesalahan sistem saat mempublikasikan hasil seleksi.',
      });
    } finally {
      setIsPublishing(false);
    }
  };

  // Submit Status Update
  const handleSaveStatus = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDetail) return;

    setIsUpdating(true);
    try {
      const res = await fetch('/api/hasil_akhir', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id_hasil: selectedDetail.id_hasil,
          status: modalNewStatus,
          catatan: modalCatatan.trim(),
        }),
      });

      const json = await res.json();
      if (json.success) {
        setStatusMessage({
          type: 'success',
          text: `Status kelulusan peserta "${selectedDetail.nama}" berhasil diperbarui menjadi ${modalNewStatus}!`,
        });
        setSelectedDetail(null);
        await fetchHasilAkhir();
      } else {
        setStatusMessage({ type: 'error', text: json.message || 'Gagal memperbarui status hasil akhir.' });
      }
    } catch (err) {
      console.error(err);
      setStatusMessage({ type: 'error', text: 'Terjadi kesalahan saat menyimpan perubahan status.' });
    } finally {
      setIsUpdating(false);
    }
  };

  // Open Kuota Modal
  const handleOpenKuotaModal = () => {
    const activePeriodeId = selectedPeriodeId || periodes[0]?.id_periode;
    const activePeriodeObj = periodes.find((p) => p.id_periode === activePeriodeId);
    const currentK = activePeriodeObj?.kuota || summary.targetKuota || 10;
    setInputKuota(currentK);
    setInputCadangan(3);
    setApplyRankingStatus(true);
    setIsKuotaModalOpen(true);
  };

  // Submit Kuota & Apply Ranking
  const handleSaveKuota = async (e: React.FormEvent) => {
    e.preventDefault();
    const activePeriode = selectedPeriodeId || periodes[0]?.id_periode;
    if (!activePeriode) {
      setStatusMessage({ type: 'error', text: 'Periode KKN belum dipilih!' });
      return;
    }

    if (inputKuota <= 0) {
      setStatusMessage({ type: 'error', text: 'Jumlah kuota kelulusan harus lebih dari 0!' });
      return;
    }

    setIsSavingKuota(true);
    try {
      const res = await fetch('/api/hasil_akhir', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id_periode: activePeriode,
          kuota: inputKuota,
          kuota_cadangan: inputCadangan,
          apply_ranking: applyRankingStatus,
        }),
      });

      const json = await res.json();
      if (json.success) {
        setStatusMessage({
          type: 'success',
          text: json.message || 'Pengaturan kuota kelulusan berhasil disimpan!',
        });
        setIsKuotaModalOpen(false);
        // Langsung update state lokal agar UI seketika menampilkan kuota yang baru
        setSelectedPeriodeId(activePeriode);
        setPeriodes((prev) =>
          prev.map((p) => (p.id_periode === activePeriode ? { ...p, kuota: inputKuota } : p))
        );
        setSummary((prev) => ({ ...prev, targetKuota: inputKuota }));
        await fetchHasilAkhir();
      } else {
        setStatusMessage({ type: 'error', text: json.message || 'Gagal menyimpan kuota kelulusan.' });
      }
    } catch (err) {
      console.error(err);
      setStatusMessage({ type: 'error', text: 'Terjadi kesalahan sistem saat menyimpan kuota.' });
    } finally {
      setIsSavingKuota(false);
    }
  };

  // Run SPK Calculation and Synchronize Participants
  const handleRunSPK = async () => {
    const activePeriode = selectedPeriodeId || periodes[0]?.id_periode;
    if (!activePeriode) {
      setStatusMessage({ type: 'error', text: 'Periode aktif tidak ditemukan!' });
      return;
    }
    setIsCalculatingSPK(true);
    try {
      const res = await fetch('/api/hasil_akhir', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id_periode: activePeriode,
          kuota: summary.targetKuota || 10,
          kuota_cadangan: 3,
          calculate_spk: true,
          apply_ranking: true,
        }),
      });
      const json = await res.json();
      if (json.success) {
        setStatusMessage({
          type: 'success',
          text: json.message || 'Kalkulasi SPK berhasil diperbarui!',
        });
        await fetchHasilAkhir();
      } else {
        setStatusMessage({ type: 'error', text: json.message || 'Gagal kalkulasi SPK.' });
      }
    } catch {
      setStatusMessage({ type: 'error', text: 'Terjadi kesalahan sistem saat kalkulasi SPK.' });
    } finally {
      setIsCalculatingSPK(false);
    }
  };

  // Atur Bobot Formula Seleksi Dinamis
  const handleSaveBobot = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPeriodeId) {
      setStatusMessage({ type: 'error', text: 'Pilih periode aktif terlebih dahulu!' });
      return;
    }
    if (inputBobotSubstansi + inputBobotWawancara !== 100) {
      setStatusMessage({ type: 'error', text: 'Total penjumlahan bobot Substansi dan Wawancara harus tepat 100%!' });
      return;
    }
    setIsSavingBobot(true);
    setStatusMessage(null);

    try {
      const res = await fetch('/api/hasil_akhir', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id_periode: selectedPeriodeId,
          bobot_substansi: inputBobotSubstansi,
          bobot_wawancara: inputBobotWawancara,
          recalculate_weights: recalculateWeights,
        }),
      });

      const json = await res.json();
      if (json.success) {
        setIsBobotModalOpen(false);
        setStatusMessage({
          type: 'success',
          text: json.message || 'Formula bobot seleksi berhasil diperbarui!',
        });
        await fetchHasilAkhir();
      } else {
        setStatusMessage({ type: 'error', text: json.message || 'Gagal mengubah bobot formula.' });
      }
    } catch {
      setStatusMessage({ type: 'error', text: 'Gagal terhubung ke database untuk mengubah bobot formula.' });
    } finally {
      setIsSavingBobot(false);
    }
  };

  // Export Hasil Seleksi to Excel/CSV
  const handleExportCSV = () => {
    if (items.length === 0) {
      setStatusMessage({ type: 'error', text: 'Tidak ada data hasil seleksi untuk diekspor.' });
      return;
    }

    const headers = [
      'Ranking Akhir',
      'NIM',
      'Nama Mahasiswa',
      'Fakultas',
      'Program Studi',
      'IPK',
      `Nilai Substansi (${currentBobotSubstansi}%)`,
      `Nilai Wawancara (${currentBobotWawancara}%)`,
      'Nilai Akhir (Skor)',
      'Status Kelulusan',
      'Negara Penempatan',
      'Rekomendasi Dekan',
      'Catatan Panitia',
    ];

    const rows = items.map((item) => [
      item.ranking_akhir,
      `"${item.nim}"`,
      `"${item.nama.replace(/"/g, '""')}"`,
      `"${item.nama_fakultas}"`,
      `"${item.nama_prodi}"`,
      item.ipk !== null ? item.ipk : '-',
      item.nilai_substansi,
      item.nilai_wawancara,
      item.nilai_akhir,
      `"${item.status_label}"`,
      `"${item.nama_negara}"`,
      item.hasRekomendasiDekan ? 'Ada' : 'Belum Ada',
      `"${(item.catatan || '').replace(/"/g, '""')}"`,
    ]);

    const csvContent =
      '\uFEFF' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\r\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    const dateStr = new Date().toISOString().slice(0, 10);
    link.setAttribute('download', `Hasil_Akhir_Seleksi_KKN_Internasional_${dateStr}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    setStatusMessage({
      type: 'success',
      text: `Berhasil mengekspor ${items.length} data hasil seleksi ke file Excel/CSV!`,
    });
  };

  return (
    <AdminHasilAkhirView
      periodes={periodes}
      selectedPeriodeId={selectedPeriodeId}
      setSelectedPeriodeId={setSelectedPeriodeId}
      setSummary={setSummary}
      summary={summary}
      publikasiInfo={publikasiInfo}
      isPublishing={isPublishing}
      handleTogglePublish={handleTogglePublish}
      currentBobotSubstansi={currentBobotSubstansi}
      currentBobotWawancara={currentBobotWawancara}
      setInputBobotSubstansi={setInputBobotSubstansi}
      setInputBobotWawancara={setInputBobotWawancara}
      setIsBobotModalOpen={setIsBobotModalOpen}
      handleOpenKuotaModal={handleOpenKuotaModal}
      search={search}
      setSearch={setSearch}
      setCurrentPage={setCurrentPage}
      selectedStatus={selectedStatus}
      setSelectedStatus={setSelectedStatus}
      selectedFakultas={selectedFakultas}
      setSelectedFakultas={setSelectedFakultas}
      FAKULTAS_LIST={FAKULTAS_LIST}
      handleExportCSV={handleExportCSV}
      statusMessage={statusMessage}
      setStatusMessage={setStatusMessage}
      isLoading={isLoading}
      items={items}
      pagination={pagination}
      currentPage={currentPage}
      handleOpenDetailModal={handleOpenDetailModal}
      selectedDetail={selectedDetail}
      setSelectedDetail={setSelectedDetail}
      handleSaveStatus={handleSaveStatus}
      modalNewStatus={modalNewStatus}
      setModalNewStatus={setModalNewStatus}
      modalCatatan={modalCatatan}
      setModalCatatan={setModalCatatan}
      isUpdating={isUpdating}
      isSawModalOpen={isSawModalOpen}
      setIsSawModalOpen={setIsSawModalOpen}
      sawTab={sawTab}
      setSawTab={setSawTab}
      sawCalculation={sawCalculation}
      isKuotaModalOpen={isKuotaModalOpen}
      setIsKuotaModalOpen={setIsKuotaModalOpen}
      handleSaveKuota={handleSaveKuota}
      inputKuota={inputKuota}
      setInputKuota={setInputKuota}
      inputCadangan={inputCadangan}
      setInputCadangan={setInputCadangan}
      applyRankingStatus={applyRankingStatus}
      setApplyRankingStatus={setApplyRankingStatus}
      isSavingKuota={isSavingKuota}
      isBobotModalOpen={isBobotModalOpen}
      handleSaveBobot={handleSaveBobot}
      inputBobotSubstansi={inputBobotSubstansi}
      inputBobotWawancara={inputBobotWawancara}
      recalculateWeights={recalculateWeights}
      setRecalculateWeights={setRecalculateWeights}
      isSavingBobot={isSavingBobot}
      confirmPublishModal={confirmPublishModal}
      setConfirmPublishModal={setConfirmPublishModal}
      handleConfirmTogglePublish={handleConfirmTogglePublish}
      isLogModalOpen={isLogModalOpen}
      setIsLogModalOpen={setIsLogModalOpen}
      handleRunSPK={handleRunSPK}
      isCalculatingSPK={isCalculatingSPK}
    />
  );
}
