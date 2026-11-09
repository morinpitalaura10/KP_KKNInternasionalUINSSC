'use client';

import React, { useEffect, useState, useCallback, useMemo } from 'react';
import {
  Plus,
  Edit3,
  Trash2,
  CheckCircle2,
  AlertCircle,
  X,
  RefreshCw,
  SlidersHorizontal,
  Check,
  AlertTriangle,
  Layers,
  Percent,
  Calendar,
  Sparkles,
  Lock,
  Save,
  Calculator,
  Copy,
  Languages,
} from 'lucide-react';
import { PageHeader, AlertBanner, ConfirmModal, FilterBar } from '@/components/ui';

export const isToeflKriteria = (item: { nama_kriteria: string; metode_nilai?: string }) => {
  const nama = (item.nama_kriteria || '').toLowerCase();
  const metode = (item.metode_nilai || '').toLowerCase();
  return (
    nama.includes('toefl') ||
    nama.includes('ielts') ||
    nama.includes('bahasa') ||
    nama.includes('language') ||
    metode.includes('toefl') ||
    metode.includes('ielts')
  );
};

interface KriteriaItem {
  id_kriteria: number;
  id_periode: number;
  nama_kriteria: string;
  bobot: number;
  nilai_maksimal: number;
  jenis: string;
  metode_nilai: string;
  status: boolean;
  nama_periode: string;
}

interface PeriodeOption {
  id_periode: number;
  nama_periode: string;
  tahun: number;
  status: string;
}

const JENIS_KRITERIA_OPTIONS = [
  'Benefit (Semakin Tinggi Makin Baik)',
  'Cost (Semakin Rendah Makin Baik)',
  'Akademik',
  'Kompetensi',
  'Non-Akademik',
  'Substansi',
  'Administratif',
  'Wawancara',
  'Lainnya',
];

const METODE_NILAI_PRESETS = [
  'Simple Additive Weighting (SAW)',
  'Konversi Skala 100',
  'Penilaian Manual (Skala 1-100)',
  'Konversi Skor TOEFL',
  'Checklist Verifikasi',
  'Rubrik Penilaian 1-5',
  'Sistem Poin Terbobot',
];

export default function AdminKriteriaPage() {
  const [kriteriaList, setKriteriaList] = useState<KriteriaItem[]>([]);
  const [periodes, setPeriodes] = useState<PeriodeOption[]>([]);
  const [selectedPeriodeId, setSelectedPeriodeId] = useState<number | null>(null);
  const [totalBobot, setTotalBobot] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Status message (Toast)
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Modal Form State (Create / Edit)
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [editingItem, setEditingItem] = useState<KriteriaItem | null>(null);

  // Form Fields
  const [formPeriodeId, setFormPeriodeId] = useState<number>(1);
  const [formNamaKriteria, setFormNamaKriteria] = useState<string>('');
  const [formJenis, setFormJenis] = useState<string>('Akademik');
  const [formCustomJenis, setFormCustomJenis] = useState<string>('');
  const [formMetodeNilai, setFormMetodeNilai] = useState<string>('Konversi Skala 100');
  const [formNilaiMaksimal, setFormNilaiMaksimal] = useState<string>('100');
  const [formBobot, setFormBobot] = useState<string>('20');
  const [formStatus, setFormStatus] = useState<boolean>(true);
  const [formIsToefl, setFormIsToefl] = useState<boolean>(false);

  // Modal Tarik / Salin dari Periode / Gelombang Lain
  const [isCopyModalOpen, setIsCopyModalOpen] = useState(false);
  const [copySourcePeriode, setCopySourcePeriode] = useState<string>('');
  const [copyTargetPeriode, setCopyTargetPeriode] = useState<string>('');
  const [copyMode, setCopyMode] = useState<'append' | 'replace'>('replace');
  const [isCopying, setIsCopying] = useState(false);

  // Delete Confirm Modal State
  const [deleteTarget, setDeleteTarget] = useState<KriteriaItem | null>(null);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);

  // Konfigurasi Rubrik Skor Bahasa Dinamis (Sistem Otomatis)
  const [rubrikInggris, setRubrikInggris] = useState<any[]>([]);
  const [bonusArab, setBonusArab] = useState<{ toafl_min: number; skor_tambahan_toafl: number; skor_tambahan_lisan: number }>({
    toafl_min: 400,
    skor_tambahan_toafl: 10,
    skor_tambahan_lisan: 5,
  });
  const [isSavingRubrik, setIsSavingRubrik] = useState(false);
  const [rubrikStatusMessage, setRubrikStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const fetchRubrik = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/rubrik-bahasa');
      const json = await res.json();
      if (json.success && json.data) {
        setRubrikInggris(json.data.jenjang_inggris || []);
        if (json.data.bonus_arab) setBonusArab(json.data.bonus_arab);
      }
    } catch (e) {
      console.error(e);
    }
  }, []);

  useEffect(() => {
    fetchRubrik();
  }, [fetchRubrik]);

  const handleSaveRubrik = async () => {
    setIsSavingRubrik(true);
    setRubrikStatusMessage(null);
    try {
      const res = await fetch('/api/admin/rubrik-bahasa', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jenjang_inggris: rubrikInggris,
          bonus_arab: bonusArab,
        }),
      });
      const json = await res.json();
      if (json.success) {
        setRubrikStatusMessage({ type: 'success', text: 'Konfigurasi skor rubrik bahasa berhasil disimpan dinamis!' });
      } else {
        setRubrikStatusMessage({ type: 'error', text: json.message || 'Gagal menyimpan konfigurasi rubrik.' });
      }
    } catch {
      setRubrikStatusMessage({ type: 'error', text: 'Terjadi kesalahan sistem saat menyimpan rubrik.' });
    } finally {
      setIsSavingRubrik(false);
    }
  };

  // Fetch Kriteria Data
  const fetchKriteria = useCallback(async (periodeId?: number | null) => {
    setIsLoading(true);
    try {
      let url = '/api/kriteria';
      if (periodeId) {
        url += `?id_periode=${periodeId}`;
      }
      const res = await fetch(url);
      const json = await res.json();

      if (json.success) {
        setKriteriaList(json.data || []);
        setTotalBobot(json.totalBobot || 0);
        if (json.periodes && Array.isArray(json.periodes)) {
          setPeriodes(json.periodes);
        }
        if (json.activePeriodeId && !periodeId) {
          setSelectedPeriodeId(json.activePeriodeId);
        }
      } else {
        setStatusMessage({ type: 'error', text: json.message || 'Gagal memuat data kriteria.' });
      }
    } catch (err) {
      console.error(err);
      setStatusMessage({ type: 'error', text: 'Terjadi kesalahan saat memuat data dari server.' });
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchKriteria();
  }, [fetchKriteria]);

  // Handle Changing Periode filter
  const handlePeriodeChange = (newPeriodeId: number) => {
    setSelectedPeriodeId(newPeriodeId);
    fetchKriteria(newPeriodeId);
  };

  // Open Create Modal
  const handleOpenCreate = () => {
    setEditingItem(null);
    setFormPeriodeId(selectedPeriodeId || (periodes[0]?.id_periode ?? 1));
    setFormNamaKriteria('');
    setFormJenis('Akademik');
    setFormCustomJenis('');
    setFormMetodeNilai('Konversi Skala 100');
    setFormNilaiMaksimal('100');
    // Calculate remaining bobot to 100 if possible
    const sisaBobot = Math.max(0, 100 - totalBobot);
    setFormBobot(sisaBobot > 0 ? String(sisaBobot) : '20');
    setFormStatus(true);
    setFormIsToefl(false);
    setIsModalOpen(true);
  };

  // Open Edit Modal
  const handleOpenEdit = (item: KriteriaItem) => {
    setEditingItem(item);
    setFormPeriodeId(item.id_periode);
    setFormNamaKriteria(item.nama_kriteria);
    if (JENIS_KRITERIA_OPTIONS.includes(item.jenis)) {
      setFormJenis(item.jenis);
      setFormCustomJenis('');
    } else {
      setFormJenis('Lainnya');
      setFormCustomJenis(item.jenis);
    }
    setFormMetodeNilai(item.metode_nilai);
    setFormNilaiMaksimal(String(item.nilai_maksimal));
    setFormBobot(String(item.bobot));
    setFormStatus(item.status);
    setFormIsToefl(isToeflKriteria(item));
    setIsModalOpen(true);
  };

  // Modal Tarik / Salin Kriteria dari Gelombang Lain
  const handleOpenCopyModal = () => {
    const defaultTargetId = selectedPeriodeId
      ? String(selectedPeriodeId)
      : periodes[0]
      ? String(periodes[0].id_periode)
      : '';
    setCopyTargetPeriode(defaultTargetId);

    // Cari periode sumber lain yang berbeda dari target
    const otherPeriode =
      periodes.find((p) => String(p.id_periode) !== defaultTargetId) || periodes[0];
    if (otherPeriode) {
      setCopySourcePeriode(String(otherPeriode.id_periode));
    }
    setCopyMode('replace');
    setIsCopyModalOpen(true);
  };

  const handleExecuteCopy = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!copySourcePeriode || !copyTargetPeriode) {
      setStatusMessage({ type: 'error', text: 'Pilih gelombang asal dan gelombang tujuan terlebih dahulu!' });
      return;
    }
    if (copySourcePeriode === copyTargetPeriode) {
      setStatusMessage({ type: 'error', text: 'Gelombang asal dan gelombang tujuan tidak boleh sama!' });
      return;
    }

    setIsCopying(true);
    setStatusMessage(null);
    try {
      const res = await fetch('/api/kriteria/copy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          source_id_periode: parseInt(copySourcePeriode, 10),
          target_id_periode: parseInt(copyTargetPeriode, 10),
          mode: copyMode,
        }),
      });
      const json = await res.json();
      if (json.success) {
        setStatusMessage({ type: 'success', text: json.message });
        setIsCopyModalOpen(false);
        // Otomatis arahkan view ke periode tujuan
        const targetNum = parseInt(copyTargetPeriode, 10);
        setSelectedPeriodeId(targetNum);
        await fetchKriteria(targetNum);
      } else {
        setStatusMessage({ type: 'error', text: json.message || 'Gagal menyalin kriteria seleksi.' });
      }
    } catch {
      setStatusMessage({ type: 'error', text: 'Gagal terhubung ke database MySQL.' });
    } finally {
      setIsCopying(false);
    }
  };

  // Submit Create or Edit Form
  const handleSubmitForm = async (e: React.FormEvent) => {
    e.preventDefault();

    const actualJenis = formJenis === 'Lainnya' ? formCustomJenis.trim() : formJenis;
    if (!formNamaKriteria.trim()) {
      setStatusMessage({ type: 'error', text: 'Nama kriteria wajib diisi!' });
      return;
    }
    if (!actualJenis) {
      setStatusMessage({ type: 'error', text: 'Jenis kriteria wajib ditentukan!' });
      return;
    }
    const bobotNum = parseFloat(formBobot);
    if (isNaN(bobotNum) || bobotNum <= 0 || bobotNum > 100) {
      setStatusMessage({ type: 'error', text: 'Bobot harus berupa angka antara 1 sampai 100!' });
      return;
    }

    // Validasi pencegahan total bobot melebihi 100%
    const otherBobot = kriteriaList
      .filter((k) => (editingItem ? k.id_kriteria !== editingItem.id_kriteria : true) && k.status)
      .reduce((acc, k) => acc + Number(k.bobot), 0);

    if (formStatus && otherBobot + bobotNum > 100) {
      const sisaTersedia = Math.max(0, 100 - otherBobot);
      setStatusMessage({
        type: 'error',
        text: `Total bobot tidak boleh melebihi 100%! Saat ini kriteria aktif lainnya sudah berjumlah ${otherBobot}%. Bobot maksimal yang dapat dimasukkan adalah ${sisaTersedia}%.`,
      });
      return;
    }

    const nilaiMaksNum = parseFloat(formNilaiMaksimal);
    if (isNaN(nilaiMaksNum) || nilaiMaksNum <= 0) {
      setStatusMessage({ type: 'error', text: 'Nilai maksimal harus lebih besar dari 0!' });
      return;
    }

    setIsSubmitting(true);
    try {
      if (editingItem) {
        // UPDATE
        const res = await fetch('/api/kriteria', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id_kriteria: editingItem.id_kriteria,
            nama_kriteria: formNamaKriteria.trim(),
            bobot: bobotNum,
            nilai_maksimal: nilaiMaksNum,
            jenis: actualJenis,
            metode_nilai: formMetodeNilai.trim(),
            status: formStatus,
          }),
        });
        const json = await res.json();
        if (json.success) {
          setStatusMessage({ type: 'success', text: `Kriteria "${formNamaKriteria}" berhasil diperbarui!` });
          setIsModalOpen(false);
          await fetchKriteria(selectedPeriodeId);
        } else {
          setStatusMessage({ type: 'error', text: json.message || 'Gagal memperbarui kriteria.' });
        }
      } else {
        // CREATE
        const res = await fetch('/api/kriteria', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id_periode: formPeriodeId,
            nama_kriteria: formNamaKriteria.trim(),
            bobot: bobotNum,
            nilai_maksimal: nilaiMaksNum,
            jenis: actualJenis,
            metode_nilai: formMetodeNilai.trim(),
          }),
        });
        const json = await res.json();
        if (json.success) {
          setStatusMessage({ type: 'success', text: `Kriteria baru "${formNamaKriteria}" berhasil ditambahkan!` });
          setIsModalOpen(false);
          await fetchKriteria(selectedPeriodeId);
        } else {
          setStatusMessage({ type: 'error', text: json.message || 'Gagal menambahkan kriteria.' });
        }
      }
    } catch (err) {
      console.error(err);
      setStatusMessage({ type: 'error', text: 'Terjadi kesalahan sistem saat menyimpan data.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Delete Action
  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;

    setIsDeleting(true);
    try {
      const res = await fetch(`/api/kriteria?id=${deleteTarget.id_kriteria}`, {
        method: 'DELETE',
      });
      const json = await res.json();
      if (json.success) {
        setStatusMessage({ type: 'success', text: `Kriteria "${deleteTarget.nama_kriteria}" berhasil dihapus!` });
        setDeleteTarget(null);
        await fetchKriteria(selectedPeriodeId);
      } else {
        setStatusMessage({ type: 'error', text: json.message || 'Gagal menghapus kriteria.' });
      }
    } catch (err) {
      console.error(err);
      setStatusMessage({ type: 'error', text: 'Terjadi kesalahan saat menghapus data.' });
    } finally {
      setIsDeleting(false);
    }
  };

  // Selected Periode Object
  const currentPeriode = useMemo(() => {
    return periodes.find((p) => p.id_periode === selectedPeriodeId) || periodes[0] || null;
  }, [periodes, selectedPeriodeId]);

  // Color helper for Jenis badge
  const getJenisBadgeColor = (jenis: string) => {
    switch (jenis.toLowerCase()) {
      case 'akademik':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'kompetensi':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'non-akademik':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'substansi':
        return 'bg-purple-50 text-purple-700 border-purple-200';
      case 'administratif':
        return 'bg-slate-100 text-slate-700 border-slate-300';
      default:
        return 'bg-teal-50 text-teal-700 border-teal-200';
    }
  };

  return (
    <div className="w-full max-w-7xl space-y-6 pb-12 font-sans">
      {/* ── Top Header Area matching Archivo Black Design ── */}
      <PageHeader
        title="KELOLA KRITERIA DAN BOBOT"
        subtitle="KULIAH KERJA NYATA INTERNASIONAL"
        description="Atur kriteria penilaian dan bobot nilai untuk sistem seleksi."
        action={
          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={handleOpenCopyModal}
              className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl border border-emerald-300 bg-white hover:bg-emerald-50 text-[#0E4A3E] text-xs font-bold transition-all shadow-xs cursor-pointer hover:scale-102"
              title="Salin paket kriteria seleksi dari periode/gelombang lain"
            >
              <Copy className="w-4 h-4 text-[#0E4A3E]" />
              <span>Tarik dari Gelombang Lain</span>
            </button>

            <button onClick={handleOpenCreate} className="btn-primary-add">
              <Plus className="w-4 h-4 stroke-[3]" />
              <span>Tambah Kriteria</span>
            </button>
          </div>
        }
      />

      {/* ── Periode Selector & Quick Info Bar ── */}
      <FilterBar
        actions={
          <div className="flex items-center gap-3 shrink-0">
            {currentPeriode && (
              <span
                className={`text-xs font-bold px-3 py-1 rounded-full border ${
                  currentPeriode.status === 'Aktif'
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                    : currentPeriode.status === 'Selesai'
                    ? 'bg-red-50 text-red-700 border-red-200'
                    : 'bg-slate-100 text-slate-600 border-slate-200'
                }`}
              >
                Status Periode: {currentPeriode.status}
              </span>
            )}
            <span className="text-xs font-bold text-slate-500 bg-slate-100 px-3 py-1.5 rounded-full border border-slate-200">
              {kriteriaList.length} Kriteria Terdaftar
            </span>
          </div>
        }
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#0E4A3E]/10 flex items-center justify-center text-[#0E4A3E] shrink-0">
            <Calendar className="w-5 h-5" />
          </div>
          <div>
            <label htmlFor="periode-select" className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
              Pilih Periode KKN
            </label>
            <select
              id="periode-select"
              value={selectedPeriodeId || ''}
              onChange={(e) => handlePeriodeChange(Number(e.target.value))}
              className="bg-transparent font-bold text-sm sm:text-base text-slate-800 focus:outline-none cursor-pointer pr-4"
            >
              {periodes.map((p) => (
                <option key={p.id_periode} value={p.id_periode}>
                  {p.nama_periode} ({p.tahun}) {p.status === 'Aktif' ? '• [Aktif]' : `• [${p.status}]`}
                </option>
              ))}
            </select>
          </div>
        </div>
      </FilterBar>

      {/* ── Status Message Alert / Toast ── */}
      <AlertBanner message={statusMessage} onClose={() => setStatusMessage(null)} />

      {/* ── Main Table Card matching Figma Design ── */}
      <div className="kkn-table-card">
        {/* Table Header Bar */}
        <div className="kkn-table-header">
          <div className="kkn-table-header-grid">
            <span className="col-span-1 text-center">No</span>
            <span className="col-span-4">Nama Kriteria</span>
            <span className="col-span-2">Jenis Kriteria</span>
            <span className="col-span-3">Metode Penilaian & Skala</span>
            <span className="col-span-1 text-center">Bobot</span>
            <span className="col-span-1 text-center">Aksi</span>
          </div>
        </div>

        {/* Table Content Rows */}
        {isLoading ? (
          <div className="py-16 flex flex-col items-center justify-center text-slate-400 gap-2">
            <RefreshCw className="w-6 h-6 animate-spin text-[#0E4A3E]" />
            <span className="text-xs font-semibold">Memuat data kriteria seleksi...</span>
          </div>
        ) : kriteriaList.length === 0 ? (
          <div className="py-16 px-4 text-center">
            <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-3 text-slate-400">
              <SlidersHorizontal className="w-6 h-6" />
            </div>
            <p className="text-sm font-bold text-slate-700">Belum ada kriteria penilaian untuk periode ini</p>
            <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
              Silakan tambahkan kriteria seleksi dengan mengklik tombol{' '}
              <span className="font-bold text-[#0D6EFD]">+ Tambah Kriteria</span> di atas.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-slate-200">
            {kriteriaList.map((item, idx) => (
              <div key={item.id_kriteria} className="kkn-table-row">
                {/* 1. No */}
                <span className="col-span-1 text-center font-bold text-slate-500">
                  {idx + 1}
                </span>

                {/* 2. Nama Kriteria */}
                <div className="col-span-4 pr-3">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-bold text-slate-800 leading-snug">{item.nama_kriteria}</p>
                    {isToeflKriteria(item) && (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-md bg-[#C0E6D8] text-[#0E4A3E] border border-emerald-300">
                        <Languages className="w-3 h-3 text-[#0E4A3E]" />
                        Kriteria TOEFL / Bahasa
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    ID #{item.id_kriteria} • {item.nama_periode}
                  </p>
                </div>

                {/* 3. Jenis Kriteria */}
                <div className="col-span-2 pr-2">
                  <span
                    className={`inline-block font-semibold text-[11px] px-2.5 py-0.5 rounded-full border ${getJenisBadgeColor(
                      item.jenis
                    )}`}
                  >
                    {item.jenis}
                  </span>
                </div>

                {/* 4. Metode Penilaian & Nilai Maksimal */}
                <div className="col-span-3 pr-3 text-slate-700">
                  <p className="font-semibold text-slate-800">{item.metode_nilai}</p>
                  <span className="text-[11px] text-slate-400 block mt-0.5">
                    Nilai Maks: <span className="font-bold text-slate-600">{item.nilai_maksimal}</span>
                  </span>
                </div>

                {/* 5. Bobot (Matching mockup format) */}
                <div className="col-span-1 text-center">
                  <span className="text-sm sm:text-base font-extrabold text-slate-800">
                    {item.bobot}
                  </span>
                  <span className="text-[11px] text-slate-400 ml-0.5">%</span>
                </div>

                {/* 6. Aksi (Yellow Edit & Red Delete matching mockup) */}
                <div className="col-span-1 flex items-center justify-center gap-2">
                  {/* Edit Button */}
                  <button
                    onClick={() => handleOpenEdit(item)}
                    title="Edit Kriteria"
                    className="p-1.5 text-amber-500 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors cursor-pointer"
                  >
                    <Edit3 className="w-4 h-4 stroke-[2.2]" />
                  </button>

                  {/* Delete Button */}
                  <button
                    onClick={() => setDeleteTarget(item)}
                    title="Hapus Kriteria"
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

      {/* ── Total Bobot Bar (Matching the exact mint card in Figma design) ── */}
      <div
        className={`rounded-2xl px-6 py-4.5 flex items-center justify-between border transition-all ${
          totalBobot === 100
            ? 'bg-[#C0E6D8] border-[#99d1c1] text-[#0E4A3E]'
            : totalBobot < 100
            ? 'bg-amber-50 border-amber-300 text-amber-900'
            : 'bg-red-50 border-red-300 text-red-900'
        }`}
      >
        <div className="flex items-center gap-2.5">
          {totalBobot === 100 ? (
            <div className="w-6 h-6 rounded-full bg-[#0E4A3E] text-white flex items-center justify-center shrink-0">
              <Check className="w-4 h-4 stroke-[3]" />
            </div>
          ) : (
            <div
              className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 ${
                totalBobot < 100 ? 'bg-amber-600 text-white' : 'bg-red-600 text-white'
              }`}
            >
              <AlertTriangle className="w-4 h-4 stroke-[3]" />
            </div>
          )}
          <div>
            <span className="text-base sm:text-lg font-extrabold tracking-wide">
              Total Bobot
            </span>
            {totalBobot === 100 ? (
              <span className="ml-2 text-xs font-semibold opacity-85 hidden sm:inline">
                (Sempurna: 100% dialokasikan)
              </span>
            ) : totalBobot < 100 ? (
              <span className="ml-2 text-xs font-semibold opacity-90 hidden sm:inline">
                (Kurang {100 - totalBobot}% lagi untuk mencapai 100%)
              </span>
            ) : (
              <span className="ml-2 text-xs font-semibold opacity-90 hidden sm:inline">
                (Kelebihan {totalBobot - 100}%, bobot harus tepat 100%)
              </span>
            )}
          </div>
        </div>

        <div className="text-right">
          <span className="text-xl sm:text-2xl font-black tracking-tight">
            {totalBobot}%
          </span>
        </div>
      </div>

      {/* ── KONFIGURASI RUBRIK SKOR BAHASA ASING (OTOMATIS SISTEM) ── */}
      <div className="bg-white rounded-2xl border border-slate-300 shadow-sm p-6 space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#0E4A3E]/10 flex items-center justify-center text-[#0E4A3E] shrink-0">
              <Calculator className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="font-extrabold text-base text-[#0E4A3E]">
                  Standarisasi & Konfigurasi Rubrik Skor Bahasa Asing
                </h3>
                <span className="text-[10px] font-bold bg-[#C0E6D8] text-[#0E4A3E] px-2.5 py-0.5 rounded-full flex items-center gap-1 border border-emerald-300">
                  <Lock className="w-3 h-3" />
                  Terkunci di Staff (Otomatis Sistem)
                </span>
                {kriteriaList.some(isToeflKriteria) ? (
                  <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 px-2.5 py-0.5 rounded-full flex items-center gap-1 border border-emerald-300">
                    <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                    Aktif Digunakan di Periode Ini
                  </span>
                ) : (
                  <span className="text-[10px] font-bold bg-amber-50 text-amber-700 px-2.5 py-0.5 rounded-full flex items-center gap-1 border border-amber-300">
                    <AlertTriangle className="w-3 h-3 text-amber-600" />
                    Belum Ada Kriteria Bahasa di Periode Ini
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Admin dapat mengatur nilai skor (misal: 0, 20, 30, 40, 50) secara dinamis. Nilai ini dihitung otomatis oleh sistem dan staf pewawancara tidak dapat mengubahnya.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleSaveRubrik}
            disabled={isSavingRubrik}
            className="px-4 py-2 bg-[#0E4A3E] hover:bg-[#09352c] text-white text-xs font-bold rounded-xl transition-all shadow-xs flex items-center gap-2 cursor-pointer disabled:opacity-50 self-start sm:self-auto shrink-0"
          >
            {isSavingRubrik ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                <span>Menyimpan...</span>
              </>
            ) : (
              <>
                <Save className="w-3.5 h-3.5" />
                <span>Simpan Perubahan Skor Rubrik</span>
              </>
            )}
          </button>
        </div>

        {rubrikStatusMessage && (
          <div
            className={`p-3 rounded-xl border flex items-center justify-between gap-2 text-xs font-semibold ${
              rubrikStatusMessage.type === 'success'
                ? 'bg-emerald-50 border-emerald-300 text-emerald-800'
                : 'bg-red-50 border-red-300 text-red-800'
            }`}
          >
            <span>{rubrikStatusMessage.text}</span>
            <button onClick={() => setRubrikStatusMessage(null)}>
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Tabel Pengaturan Skor Jenjang Bahasa Inggris */}
        <div className="overflow-x-auto">
          <table className="w-full text-left divide-y divide-slate-200 text-xs">
            <thead className="bg-slate-50 font-bold text-slate-700">
              <tr>
                <th className="px-3.5 py-3 text-center">Tingkat</th>
                <th className="px-3.5 py-3">Predikat Kemahiran</th>
                <th className="px-3.5 py-3">Rentang TOEFL</th>
                <th className="px-3.5 py-3">Rentang IELTS</th>
                <th className="px-3.5 py-3">Rentang TOEIC</th>
                <th className="px-3.5 py-3 text-center w-36">Skor Sistem (Dinamis)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-800">
              {rubrikInggris.map((item, idx) => (
                <tr key={idx} className="hover:bg-slate-50">
                  <td className="px-3.5 py-3 text-center font-bold text-slate-500">
                    Jenjang {item.tingkat}
                  </td>
                  <td className="px-3.5 py-3 font-semibold text-slate-800">
                    {item.predikat}
                  </td>
                  <td className="px-3.5 py-3 font-mono text-slate-600">
                    {item.toeflLabel}
                  </td>
                  <td className="px-3.5 py-3 font-mono text-slate-600">
                    {item.ieltsLabel}
                  </td>
                  <td className="px-3.5 py-3 font-mono text-slate-600">
                    {item.toeicLabel}
                  </td>
                  <td className="px-3.5 py-3 text-center">
                    <div className="flex items-center justify-center gap-1.5">
                      <input
                        type="number"
                        min="0"
                        max="100"
                        value={item.skor}
                        onChange={(e) => {
                          const val = Math.max(0, Math.min(100, parseInt(e.target.value, 10) || 0));
                          setRubrikInggris((prev) => {
                            const clone = [...prev];
                            clone[idx] = { ...clone[idx], skor: val };
                            return clone;
                          });
                        }}
                        className="w-20 px-2 py-1.5 rounded-lg border border-slate-300 font-black text-center text-sm text-[#0E4A3E] focus:outline-none focus:ring-2 focus:ring-[#0E4A3E]"
                      />
                      <span className="text-[11px] font-bold text-slate-400">Poin</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Bonus Bahasa Arab */}
        <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
          <div>
            <span className="font-bold text-slate-800 block">
              Nilai Tambah Bahasa Arab (Opsional)
            </span>
            <p className="text-[11px] text-slate-500">
              Skor tambahan bagi mahasiswa yang memiliki TOAFL atau kemampuan muhadatsah lisan aktif.
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="text-slate-600 font-semibold">Bonus TOAFL (≥400):</span>
              <input
                type="number"
                min="0"
                max="30"
                value={bonusArab.skor_tambahan_toafl}
                onChange={(e) =>
                  setBonusArab((prev) => ({
                    ...prev,
                    skor_tambahan_toafl: parseInt(e.target.value, 10) || 0,
                  }))
                }
                className="w-16 px-2 py-1 rounded-lg border border-slate-300 font-bold text-center text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0E4A3E]"
              />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-slate-600 font-semibold">Bonus Lisan Aktif:</span>
              <input
                type="number"
                min="0"
                max="20"
                value={bonusArab.skor_tambahan_lisan}
                onChange={(e) =>
                  setBonusArab((prev) => ({
                    ...prev,
                    skor_tambahan_lisan: parseInt(e.target.value, 10) || 0,
                  }))
                }
                className="w-16 px-2 py-1 rounded-lg border border-slate-300 font-bold text-center text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0E4A3E]"
              />
            </div>
          </div>
        </div>
      </div>

      {/* ── CREATE / EDIT MODAL ── */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg border border-slate-200 overflow-hidden">
            {/* Header */}
            <div className="bg-[#0E4A3E] text-white px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <SlidersHorizontal className="w-5 h-5 text-emerald-300" />
                <h3 className="font-bold text-base">
                  {editingItem ? 'Edit Kriteria Penilaian' : 'Tambah Kriteria Penilaian'}
                </h3>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-white/80 hover:text-white p-1 hover:bg-white/10 rounded-lg transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmitForm} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
              {/* Periode */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Periode KKN <span className="text-red-500">*</span>
                </label>
                <select
                  disabled={!!editingItem}
                  value={formPeriodeId}
                  onChange={(e) => setFormPeriodeId(Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm font-semibold text-slate-800 bg-white focus:outline-none focus:ring-2 focus:ring-[#0E4A3E] disabled:bg-slate-100 disabled:text-slate-500 cursor-pointer"
                >
                  {periodes.map((p) => (
                    <option key={p.id_periode} value={p.id_periode}>
                      {p.nama_periode} ({p.tahun})
                    </option>
                  ))}
                </select>
                {editingItem && (
                  <p className="text-[11px] text-slate-400 mt-1">Periode tidak dapat diubah saat mode edit.</p>
                )}
              </div>

              {/* Checkbox Penanda Kriteria TOEFL / Bahasa Asing */}
              <div className={`p-3.5 rounded-xl border transition-all ${
                formIsToefl ? 'bg-emerald-50/80 border-emerald-300 ring-2 ring-[#0E4A3E]/10' : 'bg-slate-50 border-slate-200 hover:bg-slate-100/70'
              }`}>
                <label className="flex items-start gap-3 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={formIsToefl}
                    onChange={(e) => {
                      const checked = e.target.checked;
                      setFormIsToefl(checked);
                      if (checked) {
                        if (!formNamaKriteria || formNamaKriteria.trim() === '' || formNamaKriteria.includes('Indeks Prestasi')) {
                          setFormNamaKriteria('Kemampuan Bahasa Asing (TOEFL/IELTS)');
                        }
                        setFormJenis('Kompetensi');
                        setFormMetodeNilai('Konversi Skor TOEFL');
                      }
                    }}
                    className="mt-0.5 w-4 h-4 rounded text-[#0E4A3E] focus:ring-[#0E4A3E] border-slate-300 cursor-pointer"
                  />
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-extrabold text-[#0E4A3E]">
                        Tandai sebagai Kriteria Kemampuan Bahasa Asing (TOEFL / IELTS)
                      </span>
                      {formIsToefl && (
                        <span className="text-[10px] font-bold bg-[#C0E6D8] text-[#0E4A3E] px-2 py-0.5 rounded-full border border-emerald-300">
                          ✓ Terhubung Rubrik
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">
                      Centang opsi ini jika kriteria ini menilai TOEFL / IELTS / kemampuan bahasa. Sistem akan otomatis mengatur kategori, metode penilaian, dan menghubungkannya ke rubrik standarisasi skor seleksi.
                    </p>
                  </div>
                </label>
              </div>

              {/* Nama Kriteria */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Nama Kriteria Seleksi <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Indeks Prestasi Kumulatif (IPK)"
                  value={formNamaKriteria}
                  onChange={(e) => setFormNamaKriteria(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0E4A3E]"
                />
              </div>

              {/* Jenis Kriteria */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Jenis / Kategori <span className="text-red-500">*</span>
                </label>
                <select
                  value={formJenis}
                  onChange={(e) => setFormJenis(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm font-semibold text-slate-800 bg-white focus:outline-none focus:ring-2 focus:ring-[#0E4A3E] cursor-pointer"
                >
                  {JENIS_KRITERIA_OPTIONS.map((j) => (
                    <option key={j} value={j}>
                      {j}
                    </option>
                  ))}
                </select>
                {formJenis === 'Lainnya' && (
                  <input
                    type="text"
                    required
                    placeholder="Masukkan jenis kriteria lainnya..."
                    value={formCustomJenis}
                    onChange={(e) => setFormCustomJenis(e.target.value)}
                    className="w-full mt-2 px-3.5 py-2 rounded-xl border border-slate-300 text-xs sm:text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0E4A3E]"
                  />
                )}
              </div>

              {/* Metode Penilaian */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Metode Penilaian <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  list="metode-presets"
                  required
                  placeholder="Pilih atau ketik metode penilaian..."
                  value={formMetodeNilai}
                  onChange={(e) => setFormMetodeNilai(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0E4A3E]"
                />
                <datalist id="metode-presets">
                  {METODE_NILAI_PRESETS.map((m) => (
                    <option key={m} value={m} />
                  ))}
                </datalist>
                <p className="text-[11px] text-slate-400 mt-1">
                  Contoh: Konversi Skala 100, Penilaian Manual (Skala 1-100), Checklist Verifikasi
                </p>
              </div>

              {/* Bobot & Nilai Maksimal (Grid) */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Bobot (%) <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      step="any"
                      min="1"
                      max="100"
                      required
                      placeholder="20"
                      value={formBobot}
                      onChange={(e) => setFormBobot(e.target.value)}
                      className="w-full px-3.5 py-2.5 pr-8 rounded-xl border border-slate-300 text-xs sm:text-sm font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0E4A3E]"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">
                      %
                    </span>
                  </div>
                  {(() => {
                    const otherActive = kriteriaList
                      .filter((k) => (editingItem ? k.id_kriteria !== editingItem.id_kriteria : true) && k.status)
                      .reduce((acc, k) => acc + Number(k.bobot), 0);
                    const sisa = Math.max(0, 100 - otherActive);
                    return (
                      <p className="text-[11px] font-medium text-slate-500 mt-1">
                        Sisa kuota bobot: <strong className={sisa === 0 ? 'text-red-600' : 'text-[#0E4A3E]'}>{sisa}%</strong>
                      </p>
                    );
                  })()}
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Nilai Maksimal <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    step="any"
                    min="1"
                    required
                    placeholder="100"
                    value={formNilaiMaksimal}
                    onChange={(e) => setFormNilaiMaksimal(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0E4A3E]"
                  />
                </div>
              </div>

              {/* Modal Action Buttons */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200 mt-6">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
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
                  <span>{editingItem ? 'Simpan Perubahan' : 'Tambah Kriteria'}</span>
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
        title="Hapus Kriteria Seleksi?"
        itemName={deleteTarget ? `${deleteTarget.nama_kriteria} (Bobot: ${deleteTarget.bobot}%)` : undefined}
        description="Apakah Anda yakin ingin menghapus kriteria seleksi ini? Bobot nilai akan terhapus dan mempengaruhi total pembobotan periode ini."
        isProcessing={isDeleting}
      />

      {/* ── MODAL TARIK / SALIN KRITERIA DARI GELOMBANG LAIN ── */}
      {isCopyModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl sm:rounded-3xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="bg-[#0E4A3E] text-white p-5 sm:p-6 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center">
                  <Copy className="w-5 h-5 text-emerald-300" />
                </div>
                <div>
                  <h3 className="font-black text-base sm:text-lg leading-tight">
                    Tarik Kriteria dari Gelombang Lain
                  </h3>
                  <p className="text-white/70 text-xs mt-0.5">
                    Salin paket kriteria seleksi & pembobotan dari periode sebelumnya
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsCopyModalOpen(false)}
                className="text-white/80 hover:text-white p-1.5 hover:bg-white/10 rounded-xl transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleExecuteCopy} className="p-6 space-y-4">
              {/* Gelombang Asal */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700">
                  Gelombang Asal (Sumber Kriteria) <span className="text-red-500">*</span>
                </label>
                <select
                  value={copySourcePeriode}
                  onChange={(e) => setCopySourcePeriode(e.target.value)}
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-xs sm:text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0E4A3E] cursor-pointer"
                >
                  <option value="" disabled>-- Pilih Gelombang Sumber --</option>
                  {periodes.map((p) => (
                    <option key={p.id_periode} value={String(p.id_periode)} disabled={String(p.id_periode) === copyTargetPeriode}>
                      {p.nama_periode} ({p.tahun}) {p.status === 'Aktif' ? '• [Aktif]' : `• [${p.status}]`}
                    </option>
                  ))}
                </select>
                <p className="text-[11px] text-slate-400">
                  Kriteria seleksi akan diambil dari gelombang ini sebagai acuan/template.
                </p>
              </div>

              {/* Gelombang Tujuan */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700">
                  Gelombang Tujuan (Target Penyalinan) <span className="text-red-500">*</span>
                </label>
                <select
                  value={copyTargetPeriode}
                  onChange={(e) => setCopyTargetPeriode(e.target.value)}
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-xs sm:text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0E4A3E] cursor-pointer"
                >
                  <option value="" disabled>-- Pilih Gelombang Tujuan --</option>
                  {periodes.map((p) => (
                    <option key={p.id_periode} value={String(p.id_periode)} disabled={String(p.id_periode) === copySourcePeriode}>
                      {p.nama_periode} ({p.tahun}) {p.status === 'Aktif' ? '• [Aktif]' : `• [${p.status}]`}
                    </option>
                  ))}
                </select>
                <p className="text-[11px] text-slate-400">
                  Kriteria akan dibuat mandiri di gelombang ini sehingga dapat diedit/disesuaikan tanpa mengganggu gelombang asal.
                </p>
              </div>

              {/* Metode Salin */}
              <div className="space-y-1.5 pt-1">
                <label className="block text-xs font-bold text-slate-700">Metode Penarikan:</label>
                <div className="space-y-2 text-xs">
                  <label className="flex items-start gap-2.5 p-3 rounded-xl border border-emerald-300 bg-emerald-50/40 hover:bg-emerald-50 cursor-pointer transition-colors">
                    <input
                      type="radio"
                      name="copyKriteriaMode"
                      value="replace"
                      checked={copyMode === 'replace'}
                      onChange={() => setCopyMode('replace')}
                      className="mt-0.5 text-[#0E4A3E] focus:ring-[#0E4A3E]"
                    />
                    <div>
                      <span className="font-bold text-[#0E4A3E]">
                        Ganti & Samakan Semua Kriteria (Direkomendasikan)
                      </span>
                      <p className="text-slate-500 text-[11px] mt-0.5">
                        Menghapus kriteria lama di gelombang tujuan dan menggantinya dengan paket kriteria lengkap dari gelombang asal sehingga total bobot tepat 100%.
                      </p>
                    </div>
                  </label>

                  <label className="flex items-start gap-2.5 p-3 rounded-xl border border-slate-200 hover:bg-slate-50 cursor-pointer transition-colors">
                    <input
                      type="radio"
                      name="copyKriteriaMode"
                      value="append"
                      checked={copyMode === 'append'}
                      onChange={() => setCopyMode('append')}
                      className="mt-0.5 text-[#0E4A3E] focus:ring-[#0E4A3E]"
                    />
                    <div>
                      <span className="font-bold text-slate-800">
                        Tambahkan yang Belum Ada
                      </span>
                      <p className="text-slate-500 text-[11px] mt-0.5">
                        Menambahkan kriteria baru yang belum ada di gelombang tujuan tanpa menghapus kriteria yang sudah dibuat sebelumnya.
                      </p>
                    </div>
                  </label>
                </div>
              </div>

              {/* Modal Buttons */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200 mt-2">
                <button
                  type="button"
                  onClick={() => setIsCopyModalOpen(false)}
                  disabled={isCopying}
                  className="px-5 py-2.5 rounded-xl border border-slate-300 text-slate-700 text-xs sm:text-sm font-bold hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isCopying || !copySourcePeriode || !copyTargetPeriode}
                  className="px-6 py-2.5 rounded-xl bg-[#0E4A3E] hover:bg-[#0a382f] text-white text-xs sm:text-sm font-bold shadow-md transition-all hover:scale-102 active:scale-98 disabled:opacity-50 flex items-center gap-2 cursor-pointer"
                >
                  {isCopying ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Copy className="w-4 h-4" />}
                  <span>{isCopying ? 'Menyalin Kriteria...' : 'Tarik & Salin Kriteria'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
