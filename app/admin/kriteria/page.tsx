'use client';

import React, { useEffect, useState, useCallback, useMemo } from 'react';
import {
  AdminKriteriaView,
  KriteriaItem,
  JENIS_KRITERIA_OPTIONS,
  isToeflKriteria,
} from '@/components/admin';
import type { PeriodeOption } from '@/components/admin/AdminKriteriaView';

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

  // Konfigurasi Rubrik Skor Bahasa Dinamis
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

  const handlePeriodeChange = (newPeriodeId: number) => {
    setSelectedPeriodeId(newPeriodeId);
    fetchKriteria(newPeriodeId);
  };

  const handleOpenCreate = () => {
    setEditingItem(null);
    setFormPeriodeId(selectedPeriodeId || (periodes[0]?.id_periode ?? 1));
    setFormNamaKriteria('');
    setFormJenis('Akademik');
    setFormCustomJenis('');
    setFormMetodeNilai('Konversi Skala 100');
    setFormNilaiMaksimal('100');
    const sisaBobot = Math.max(0, 100 - totalBobot);
    setFormBobot(sisaBobot > 0 ? String(sisaBobot) : '20');
    setFormStatus(true);
    setFormIsToefl(false);
    setIsModalOpen(true);
  };

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

  const handleOpenCopyModal = () => {
    const defaultTargetId = selectedPeriodeId
      ? String(selectedPeriodeId)
      : periodes[0]
      ? String(periodes[0].id_periode)
      : '';
    setCopyTargetPeriode(defaultTargetId);

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

  const currentPeriode = useMemo(() => {
    return periodes.find((p) => p.id_periode === selectedPeriodeId) || periodes[0] || null;
  }, [periodes, selectedPeriodeId]);

  return (
    <AdminKriteriaView
      kriteriaList={kriteriaList}
      periodes={periodes}
      selectedPeriodeId={selectedPeriodeId}
      totalBobot={totalBobot}
      isLoading={isLoading}
      statusMessage={statusMessage}
      setStatusMessage={setStatusMessage}
      currentPeriode={currentPeriode}
      handlePeriodeChange={handlePeriodeChange}
      isModalOpen={isModalOpen}
      setIsModalOpen={setIsModalOpen}
      isSubmitting={isSubmitting}
      editingItem={editingItem}
      formPeriodeId={formPeriodeId}
      setFormPeriodeId={setFormPeriodeId}
      formNamaKriteria={formNamaKriteria}
      setFormNamaKriteria={setFormNamaKriteria}
      formJenis={formJenis}
      setFormJenis={setFormJenis}
      formCustomJenis={formCustomJenis}
      setFormCustomJenis={setFormCustomJenis}
      formMetodeNilai={formMetodeNilai}
      setFormMetodeNilai={setFormMetodeNilai}
      formNilaiMaksimal={formNilaiMaksimal}
      setFormNilaiMaksimal={setFormNilaiMaksimal}
      formBobot={formBobot}
      setFormBobot={setFormBobot}
      formStatus={formStatus}
      setFormStatus={setFormStatus}
      formIsToefl={formIsToefl}
      setFormIsToefl={setFormIsToefl}
      handleOpenCreate={handleOpenCreate}
      handleOpenEdit={handleOpenEdit}
      handleSubmitForm={handleSubmitForm}
      deleteTarget={deleteTarget}
      setDeleteTarget={setDeleteTarget}
      isDeleting={isDeleting}
      handleDeleteConfirm={handleDeleteConfirm}
      isCopyModalOpen={isCopyModalOpen}
      setIsCopyModalOpen={setIsCopyModalOpen}
      copySourcePeriode={copySourcePeriode}
      setCopySourcePeriode={setCopySourcePeriode}
      copyTargetPeriode={copyTargetPeriode}
      setCopyTargetPeriode={setCopyTargetPeriode}
      copyMode={copyMode}
      setCopyMode={setCopyMode}
      isCopying={isCopying}
      handleOpenCopyModal={handleOpenCopyModal}
      handleExecuteCopy={handleExecuteCopy}
      rubrikInggris={rubrikInggris}
      setRubrikInggris={setRubrikInggris}
      bonusArab={bonusArab}
      setBonusArab={setBonusArab}
      isSavingRubrik={isSavingRubrik}
      rubrikStatusMessage={rubrikStatusMessage}
      setRubrikStatusMessage={setRubrikStatusMessage}
      handleSaveRubrik={handleSaveRubrik}
    />
  );
}
