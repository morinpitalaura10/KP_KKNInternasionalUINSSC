'use client';

import React, { useEffect, useState, useCallback, useMemo } from 'react';
import {
  Search,
  RefreshCw,
  AlertCircle,
  CheckCircle2,
  Users,
  Eye,
  Trash2,
  X,
  FileText,
  User,
  GraduationCap,
  Globe2,
  Clock,
  AlertTriangle,
  Award,
  ChevronDown,
  Building2,
  Phone,
  MapPin,
  Calendar,
  HeartHandshake,
  Check,
  Edit3,
  ExternalLink,
  Globe,
  Download,
  FileSpreadsheet,
  Loader2,
} from 'lucide-react';
import AdminPendaftaranView from '@/components/admin/AdminPendaftaranView';
import { PageHeader, StatCardMint, AlertBanner, ConfirmModal, StatusBadge, FilterBar } from '@/components/ui';

interface PeriodeOption {
  id: number;
  nama: string;
  tahunAkademik: string;
  status?: string;
}

interface NegaraPeriodeOption {
  id_periode_negara: number;
  nama_negara: string;
}

interface DokumenItem {
  id_dokumen: number;
  id_persyaratan: number;
  nama_persyaratan: string;
  format_file: string;
  file_path: string;
  status: string;
  uploaded_at: string;
}

interface OrangTuaData {
  nama_ayah: string;
  pekerjaan_ayah: string;
  nama_ibu: string;
  pekerjaan_ibu: string;
  alamat_orang_tua: string;
  no_hp_orang_tua: string;
}

interface PendaftaranItem {
  id_pendaftaran: number;
  id_mahasiswa: number;
  id_periode: number;
  id_periode_negara: number;
  nim: string;
  nama: string;
  email: string;
  nama_fakultas: string;
  nama_prodi: string;
  nama_periode: string;
  tahun_periode: number | null;
  nama_negara: string;
  jenis_kelamin: 'L' | 'P';
  no_hp: string;
  alamat: string;
  tempat_lahir: string;
  tanggal_lahir: string;
  asal_sekolah: string;
  total_sks: number;
  ipk: number | null;
  deskripsi_diri: string;
  golongan_darah: string;
  riwayat_penyakit: string | null;
  alergi: string | null;
  ukuran_kaos: string;
  tanggal_daftar: string;
  status_pendaftaran: string;
  status_label: string;
  status_badge_type: 'terverifikasi' | 'menunggu' | 'perlu_perbaikan' | 'draft' | 'lolos';
  catatan: string;
  dokumen: DokumenItem[];
  orang_tua: OrangTuaData | null;
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

const STATUS_OPTIONS = [
  { label: 'Semua Status', value: 'all' },
  { label: 'Menunggu Verifikasi', value: 'Menunggu_Verifikasi' },
  { label: 'Terverifikasi (Verifikasi Dokumen)', value: 'Verifikasi_Dokumen' },
  { label: 'Perlu Perbaikan', value: 'Perbaikan_Dokumen' },
  { label: 'Wawancara', value: 'Wawancara' },
  { label: 'Lolos Seleksi', value: 'Lolos' },
  { label: 'Tidak Lolos', value: 'Tidak_Lolos' },
  { label: 'Draft', value: 'Draft' },
];

export default function AdminPendaftaranPage() {
  const [items, setItems] = useState<PendaftaranItem[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedPeriode, setSelectedPeriode] = useState<string>('all');
  const [periodes, setPeriodes] = useState<PeriodeOption[]>([]);
  const [currentPage, setCurrentPage] = useState(1);

  // Status message (Toast)
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Detail / Verification Modal
  const [selectedDetail, setSelectedDetail] = useState<PendaftaranItem | null>(null);
  const [activeTab, setActiveTab] = useState<'akademik' | 'pribadi' | 'orangtua' | 'dokumen'>('akademik');
  const [editStatusValue, setEditStatusValue] = useState<string>('');
  const [editCatatan, setEditCatatan] = useState<string>('');
  const [isUpdatingStatus, setIsUpdatingStatus] = useState<boolean>(false);

  // Delete Modal
  const [deleteTarget, setDeleteTarget] = useState<PendaftaranItem | null>(null);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);

  // Export CSV state
  const [isExporting, setIsExporting] = useState(false);

  // Negara list for allocation dropdown
  const [negaraList, setNegaraList] = useState<NegaraPeriodeOption[]>([]);
  const [editNegaraId, setEditNegaraId] = useState<number | ''>('');

  // Fetch Data from MySQL via API
  const fetchData = useCallback(
    async (
      q = search,
      status = selectedStatus,
      per = selectedPeriode,
      page = currentPage
    ) => {
      setIsLoading(true);
      try {
        const params = new URLSearchParams({
          page: String(page),
          limit: '10',
        });
        if (q.trim()) params.set('search', q.trim());
        if (status && status !== 'all') params.set('status', status);
        if (per && per !== 'all' && per !== 'semua') params.set('id_periode', per);

        const res = await fetch(`/api/pendaftaran?${params.toString()}`);
        const json = await res.json();
        if (json.success) {
          setItems(json.data);
          setPagination(json.pagination);
        } else {
          setStatusMessage({ type: 'error', text: json.message || 'Gagal memuat data pendaftaran' });
        }
      } catch {
        setStatusMessage({ type: 'error', text: 'Terjadi kesalahan koneksi ke server MySQL.' });
      } finally {
        setIsLoading(false);
      }
    },
    [search, selectedStatus, selectedPeriode, currentPage]
  );

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Fetch daftar gelombang/periode untuk filter dropdown
  useEffect(() => {
    async function loadPeriodes() {
      try {
        const res = await fetch('/api/periode');
        const json = await res.json();
        if (json.success && Array.isArray(json.data)) {
          const list: PeriodeOption[] = json.data.map((p: any) => ({
            id: p.id,
            nama: p.nama,
            tahunAkademik: p.tahunAkademik,
            status: p.status,
          }));
          setPeriodes(list);
        }
      } catch (err) {
        console.error('Error fetching periodes for filter:', err);
      }
    }
    loadPeriodes();
  }, []);

  // Periode yang sedang aktif difilter (untuk sublabel stat card)
  const activeFilteredPeriode = useMemo(() => {
    if (selectedPeriode === 'all' || selectedPeriode === 'semua') return null;
    return periodes.find((p) => String(p.id) === selectedPeriode) || null;
  }, [selectedPeriode, periodes]);

  // Fetch negara options for allocation dropdown
  useEffect(() => {
    async function loadNegara() {
      try {
        const res = await fetch('/api/negara');
        const json = await res.json();
        if (json.success) {
          const options: NegaraPeriodeOption[] = [];
          (json.data || []).forEach((n: { id_periode_negara: number | null; nama_negara: string; status: boolean }) => {
            // Tampilkan semua negara yang punya id_periode_negara (sudah terhubung ke periode apapun)
            if (n.id_periode_negara) {
              options.push({ id_periode_negara: n.id_periode_negara, nama_negara: n.nama_negara });
            }
          });
          setNegaraList(options);
        }
      } catch {
        // silent
      }
    }
    loadNegara();
  }, []);

  // Compute stat summary counts
  const stats = useMemo(() => {
    return {
      total: pagination?.total || 0,
      menunggu: items.filter((i) => i.status_pendaftaran === 'Menunggu_Verifikasi').length,
      terverifikasi: items.filter((i) => i.status_pendaftaran === 'Verifikasi_Dokumen').length,
      perluPerbaikan: items.filter((i) => i.status_pendaftaran === 'Perbaikan_Dokumen').length,
      lolos: items.filter((i) => i.status_pendaftaran === 'Lolos').length,
    };
  }, [items, pagination]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchData(search, selectedStatus, selectedPeriode, 1);
  };

  const handlePeriodeFilterChange = (per: string) => {
    setSelectedPeriode(per);
    setCurrentPage(1);
    fetchData(search, selectedStatus, per, 1);
  };

  const handleStatusFilterChange = (status: string) => {
    setSelectedStatus(status);
    setCurrentPage(1);
    fetchData(search, status, selectedPeriode, 1);
  };

  const handleResetFilters = () => {
    setSearch('');
    setSelectedStatus('all');
    setSelectedPeriode('all');
    setCurrentPage(1);
    fetchData('', 'all', 'all', 1);
  };

  const handleOpenDetail = (item: PendaftaranItem) => {
    setSelectedDetail(item);
    setEditStatusValue(item.status_pendaftaran);
    setEditCatatan(item.catatan || '');
    setEditNegaraId(item.id_periode_negara || '');
    setActiveTab('akademik');
  };

  const handleQuickDocStatus = async (id_dokumen: number, newStatus: 'Valid' | 'Revisi') => {
    try {
      const defaultNote = newStatus === 'Revisi' 
        ? 'Dokumen belum sesuai persyaratan, mohon perbaiki dan unggah ulang berkas yang valid.' 
        : 'Dokumen telah diverifikasi dan valid.';
      const res = await fetch('/api/verifikasi', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id_dokumen,
          status: newStatus,
          catatan: defaultNote,
        }),
      });
      const json = await res.json();
      if (json.success) {
        setSelectedDetail((prev) => {
          if (!prev) return null;
          return {
            ...prev,
            dokumen: prev.dokumen.map((d) => (d.id_dokumen === id_dokumen ? { ...d, status: newStatus } : d)),
          };
        });
        if (newStatus === 'Revisi' && editStatusValue === 'Menunggu_Verifikasi') {
          setEditStatusValue('Perbaikan_Dokumen');
          if (!editCatatan) {
            setEditCatatan('Terdapat berkas yang memerlukan perbaikan. Silakan periksa rincian dokumen persyaratan.');
          }
        }
        setStatusMessage({ type: 'success', text: `Status dokumen berhasil diubah menjadi ${newStatus}!` });
        fetchData();
      } else {
        setStatusMessage({ type: 'error', text: json.message || 'Gagal mengubah status verifikasi dokumen.' });
      }
    } catch {
      setStatusMessage({ type: 'error', text: 'Gagal terhubung ke server verifikasi.' });
    }
  };

  const handleSaveStatus = async () => {
    if (!selectedDetail) return;
    setIsUpdatingStatus(true);
    try {
      const res = await fetch('/api/pendaftaran', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id_pendaftaran: selectedDetail.id_pendaftaran,
          status_pendaftaran: editStatusValue,
          catatan: editCatatan,
          id_periode_negara: editNegaraId || undefined,
        }),
      });
      const json = await res.json();
      if (json.success) {
        setStatusMessage({
          type: 'success',
          text: `Status pendaftaran "${selectedDetail.nama}" berhasil diperbarui menjadi ${editStatusValue.replace(/_/g, ' ')}!`,
        });
        setSelectedDetail(null);
        fetchData();
      } else {
        setStatusMessage({ type: 'error', text: json.message || 'Gagal memperbarui status pendaftaran.' });
      }
    } catch {
      setStatusMessage({ type: 'error', text: 'Terjadi kesalahan sistem saat memperbarui status.' });
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const handleDeletePendaftaran = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/pendaftaran?id=${deleteTarget.id_pendaftaran}`, {
        method: 'DELETE',
      });
      const json = await res.json();
      if (json.success) {
        setStatusMessage({
          type: 'success',
          text: `Data pendaftaran "${deleteTarget.nama}" berhasil dihapus.`,
        });
        setDeleteTarget(null);
        fetchData();
      } else {
        setStatusMessage({ type: 'error', text: json.message || 'Gagal menghapus data pendaftaran.' });
      }
    } catch {
      setStatusMessage({ type: 'error', text: 'Terjadi kesalahan sistem saat menghapus data.' });
    } finally {
      setIsDeleting(false);
    }
  };

  // Export to CSV / Excel
  const handleExportCSV = async () => {
    setIsExporting(true);
    try {
      const params = new URLSearchParams();
      if (search.trim()) params.set('search', search.trim());
      if (selectedStatus && selectedStatus !== 'all') params.set('status', selectedStatus);
      if (selectedPeriode && selectedPeriode !== 'all' && selectedPeriode !== 'semua') {
        params.set('id_periode', selectedPeriode);
      }
      params.set('page', '1');
      params.set('limit', '2000'); // Export all matching results

      const res = await fetch(`/api/pendaftaran?${params.toString()}`);
      const json = await res.json();

      if (!json.success || !json.data || json.data.length === 0) {
        setStatusMessage({ type: 'error', text: 'Tidak ada data pendaftar untuk diekspor.' });
        return;
      }

      const exportList: PendaftaranItem[] = json.data;
      const headers = [
        'No',
        'NIM',
        'Nama Mahasiswa',
        'Jenis Kelamin',
        'Fakultas',
        'Program Studi',
        'Total SKS',
        'IPK',
        'Asal Sekolah',
        'Nomor HP',
        'Negara Tujuan',
        'Tanggal Daftar',
        'Status Pendaftaran',
        'Catatan Panitia',
      ];

      const rows = exportList.map((item, idx) => [
        idx + 1,
        `"${item.nim}"`,
        `"${item.nama.replace(/"/g, '""')}"`,
        item.jenis_kelamin === 'L' ? 'Laki-laki' : 'Perempuan',
        `"${item.nama_fakultas || '-'}"`,
        `"${item.nama_prodi || '-'}"`,
        item.total_sks || 0,
        item.ipk !== null ? item.ipk : '-',
        `"${(item.asal_sekolah || '-').replace(/"/g, '""')}"`,
        `"${item.no_hp || '-'}"`,
        `"${item.nama_negara || 'Belum Ditentukan'}"`,
        `"${item.tanggal_daftar ? new Date(item.tanggal_daftar).toLocaleDateString('id-ID') : '-'}"`,
        `"${item.status_label || item.status_pendaftaran}"`,
        `"${(item.catatan || '-').replace(/"/g, '""')}"`,
      ]);

      const csvContent =
        '\uFEFF' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\r\n');
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      const dateStr = new Date().toISOString().slice(0, 10);
      link.setAttribute('download', `Data_Pendaftar_KKN_Internasional_${dateStr}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      setStatusMessage({
        type: 'success',
        text: `Berhasil mengekspor ${exportList.length} data pendaftar ke file Excel/CSV!`,
      });
    } catch {
      setStatusMessage({ type: 'error', text: 'Gagal mengekspor data pendaftaran.' });
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <AdminPendaftaranView
      isLoading={isLoading}
      statusMessage={statusMessage}
      setStatusMessage={setStatusMessage}
      stats={stats}
      activeFilteredPeriode={activeFilteredPeriode}
      search={search}
      setSearch={setSearch}
      selectedPeriode={selectedPeriode}
      selectedStatus={selectedStatus}
      periodes={periodes}
      STATUS_OPTIONS={STATUS_OPTIONS}
      pagination={pagination}
      items={items}
      currentPage={currentPage}
      setCurrentPage={setCurrentPage}
      isExporting={isExporting}
      handleSearchSubmit={handleSearchSubmit}
      handlePeriodeFilterChange={handlePeriodeFilterChange}
      handleStatusFilterChange={handleStatusFilterChange}
      handleResetFilters={handleResetFilters}
      handleExportCSV={handleExportCSV}
      handleOpenDetail={handleOpenDetail}
      selectedDetail={selectedDetail}
      setSelectedDetail={setSelectedDetail}
      activeTab={activeTab}
      setActiveTab={setActiveTab}
      editStatusValue={editStatusValue}
      setEditStatusValue={setEditStatusValue}
      editNegaraId={editNegaraId}
      setEditNegaraId={setEditNegaraId}
      editCatatan={editCatatan}
      setEditCatatan={setEditCatatan}
      negaraList={negaraList}
      isUpdatingStatus={isUpdatingStatus}
      handleSaveStatus={handleSaveStatus}
      handleQuickDocStatus={handleQuickDocStatus}
      deleteTarget={deleteTarget}
      setDeleteTarget={setDeleteTarget}
      isDeleting={isDeleting}
      handleDeletePendaftaran={handleDeletePendaftaran}
      fetchData={fetchData}
    />
  );
}
