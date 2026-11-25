'use client';

import React, { useEffect, useState, useCallback, useMemo } from 'react';
import {
  AdminWawancaraView,
  WawancaraItem,
  KriteriaWawancaraItem,
  StaffItem,
  Pagination,
} from '@/components/admin';
import type { PeriodeItem } from '@/components/admin/AdminWawancaraView';

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

  // Filters
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

  const currentPeriodeKriteria = useMemo(() => {
    if (!selectedPeriodeId) return kriteriaList;
    const match = kriteriaList.filter((k) => k.id_periode === selectedPeriodeId);
    return match.length > 0 ? match : kriteriaList;
  }, [kriteriaList, selectedPeriodeId]);

  const activeCandidateKriteria = useMemo(() => {
    if (!editingTarget) return currentPeriodeKriteria;
    const match = kriteriaList.filter((k) => k.id_periode === editingTarget.id_periode);
    return match.length > 0 ? match : currentPeriodeKriteria;
  }, [editingTarget, kriteriaList, currentPeriodeKriteria]);

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

  const handleOpenScoreModal = (item: WawancaraItem) => {
    setEditingTarget(item);
    setModalStaffId(item.id_staff || staffList[0]?.id_staff || 1);
    setModalCatatan(item.catatan || '');

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

    const scoreMap: { [key: number]: number | '' } = {};
    if (item.nilai_detail && item.nilai_detail.length > 0) {
      item.nilai_detail.forEach((nd: any) => {
        scoreMap[nd.id_kriteria_wawancara] = nd.nilai;
      });
    } else {
      candidateKriteria.forEach((k) => {
        scoreMap[k.id_kriteria_wawancara] = '';
      });
    }
    setModalScores(scoreMap);
  };

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

  const handleSubmitScore = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTarget) return;

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
      const activePeriode = selectedPeriodeId || (periodes[0] as any)?.id_periode || (periodes[0] as any)?.id || 1;
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
    <AdminWawancaraView
      items={items}
      kriteriaList={kriteriaList}
      staffList={staffList}
      periodes={periodes}
      selectedPeriodeId={selectedPeriodeId}
      setSelectedPeriodeId={setSelectedPeriodeId}
      pagination={pagination}
      isLoading={isLoading}
      search={search}
      setSearch={setSearch}
      selectedStatus={selectedStatus}
      setSelectedStatus={setSelectedStatus}
      selectedFakultas={selectedFakultas}
      setSelectedFakultas={setSelectedFakultas}
      currentPage={currentPage}
      setCurrentPage={setCurrentPage}
      statusMessage={statusMessage}
      setStatusMessage={setStatusMessage}
      formatDate={formatDate}
      editingTarget={editingTarget}
      setEditingTarget={setEditingTarget}
      modalScores={modalScores}
      setModalScores={setModalScores}
      modalCatatan={modalCatatan}
      setModalCatatan={setModalCatatan}
      modalStaffId={modalStaffId}
      setModalStaffId={setModalStaffId}
      modalTanggal={modalTanggal}
      setModalTanggal={setModalTanggal}
      isSubmitting={isSubmitting}
      handleOpenScoreModal={handleOpenScoreModal}
      handleSubmitScore={handleSubmitScore}
      calculatedModalFinalScore={calculatedModalFinalScore}
      activeCandidateKriteria={activeCandidateKriteria}
      isKriteriaModalOpen={isKriteriaModalOpen}
      setIsKriteriaModalOpen={setIsKriteriaModalOpen}
      editingKriteriaId={editingKriteriaId}
      kriteriaNama={kriteriaNama}
      setKriteriaNama={setKriteriaNama}
      kriteriaBobot={kriteriaBobot}
      setKriteriaBobot={setKriteriaBobot}
      kriteriaMaksimal={kriteriaMaksimal}
      setKriteriaMaksimal={setKriteriaMaksimal}
      isSavingKriteria={isSavingKriteria}
      deleteKriteriaTarget={deleteKriteriaTarget}
      setDeleteKriteriaTarget={setDeleteKriteriaTarget}
      isDeletingKriteria={isDeletingKriteria}
      handleOpenAddKriteria={handleOpenAddKriteria}
      handleOpenEditKriteria={handleOpenEditKriteria}
      handleSaveKriteria={handleSaveKriteria}
      handleConfirmDeleteKriteria={handleConfirmDeleteKriteria}
      totalKriteriaBobot={totalKriteriaBobot}
      currentPeriodeKriteria={currentPeriodeKriteria}
    />
  );
}
