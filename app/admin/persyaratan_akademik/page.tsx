'use client';

import React, { useEffect, useState, useCallback, useMemo } from 'react';
import {
  AdminPersyaratanAkademikView,
  ProdiItem,
  FakultasItem,
} from '@/components/admin';

export default function AdminKelolaSyaratAkademikPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Form Fields
  const [minIpk, setMinIpk] = useState<number>(3.5);
  const [minSemester, setMinSemester] = useState<number>(6);
  const [maxSemester, setMaxSemester] = useState<number>(8);
  const [minSks, setMinSks] = useState<number>(100);
  const [allProdi, setAllProdi] = useState<boolean>(true);
  const [allowedProdiIds, setAllowedProdiIds] = useState<number[]>([]);
  const [akademikStatus, setAkademikStatus] = useState<boolean>(true);
  const [catatanAkademik, setCatatanAkademik] = useState<string>('');
  const [prodiList, setProdiList] = useState<ProdiItem[]>([]);
  const [fakultasList, setFakultasList] = useState<FakultasItem[]>([]);
  const [prodiSearch, setProdiSearch] = useState<string>('');

  // Modal Tambah Fakultas & Prodi
  const [isFacultyModalOpen, setIsFacultyModalOpen] = useState(false);
  const [isProdiModalOpen, setIsProdiModalOpen] = useState(false);
  const [newFacultyName, setNewFacultyName] = useState('');
  const [newFacultyInitialProdi, setNewFacultyInitialProdi] = useState('');
  const [selectedFakultasId, setSelectedFakultasId] = useState<number | ''>('');
  const [newProdiName, setNewProdiName] = useState('');
  const [isSubmittingNew, setIsSubmittingNew] = useState(false);

  // Modal Edit & Hapus Prodi / Fakultas
  const [editingProdi, setEditingProdi] = useState<{ id_prodi: number; id_fakultas: number; nama_prodi: string } | null>(null);
  const [deletingProdi, setDeletingProdi] = useState<{ id_prodi: number; nama_prodi: string } | null>(null);
  const [editingFaculty, setEditingFaculty] = useState<{ id_fakultas: number; nama_fakultas: string } | null>(null);
  const [deletingFaculty, setDeletingFaculty] = useState<{ id_fakultas: number; nama_fakultas: string; prodiCount: number } | null>(null);
  const [isActionLoading, setIsActionLoading] = useState(false);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/persyaratan/akademik');
      const json = await res.json();
      if (json.success && json.data) {
        setMinIpk(json.data.min_ipk ?? 3.5);
        setMinSemester(json.data.min_semester ?? 6);
        setMaxSemester(json.data.max_semester ?? 8);
        setMinSks(json.data.min_sks ?? 100);
        setAllProdi(json.data.all_prodi ?? true);
        const validProdis = json.data.prodiList || [];
        const validProdiIdsSet = new Set(validProdis.map((p: any) => p.id_prodi));
        const rawIds: number[] = Array.isArray(json.data.allowed_prodi_ids)
          ? json.data.allowed_prodi_ids.map(Number)
          : [];
        setAllowedProdiIds(rawIds.filter((id) => validProdiIdsSet.has(id)));
        setAkademikStatus(json.data.status ?? true);
        setCatatanAkademik(json.data.catatan ?? '');
        setProdiList(validProdis);
        if (json.data.fakultasList) {
          setFakultasList(json.data.fakultasList);
        }
      } else {
        setStatusMessage({ type: 'error', text: json.message || 'Gagal memuat konfigurasi akademik.' });
      }
    } catch {
      setStatusMessage({ type: 'error', text: 'Gagal terhubung ke database MySQL.' });
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setStatusMessage(null);

    try {
      const res = await fetch('/api/persyaratan/akademik', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          min_ipk: minIpk,
          min_semester: minSemester,
          max_semester: maxSemester,
          min_sks: minSks,
          all_prodi: allProdi,
          allowed_prodi_ids: allowedProdiIds,
          status: akademikStatus,
          catatan: catatanAkademik,
        }),
      });

      const json = await res.json();
      if (json.success) {
        setStatusMessage({
          type: 'success',
          text: 'Konfigurasi Persyaratan Akademik berhasil disimpan ke sistem!',
        });
      } else {
        setStatusMessage({ type: 'error', text: json.message || 'Gagal menyimpan konfigurasi.' });
      }
    } catch {
      setStatusMessage({ type: 'error', text: 'Gagal menyimpan perubahan ke database.' });
    } finally {
      setIsSaving(false);
    }
  };

  const prodiByFakultas = useMemo(() => {
    const map: Record<string, { id_fakultas: number; prodis: ProdiItem[] }> = {};
    const q = prodiSearch.toLowerCase().trim();

    fakultasList.forEach((f) => {
      const fakName = f.nama_fakultas.trim();
      if (!map[fakName]) {
        map[fakName] = { id_fakultas: f.id_fakultas, prodis: [] };
      }
    });

    prodiList.forEach((p) => {
      const fakName = p.fakultas?.nama_fakultas?.trim() || 'LAINNYA';
      if (!map[fakName]) {
        map[fakName] = { id_fakultas: p.id_fakultas, prodis: [] };
      }
      if (q) {
        const matchName = p.nama_prodi.toLowerCase().includes(q);
        const matchFak = fakName.toLowerCase().includes(q);
        if (!matchName && !matchFak) return;
      }
      map[fakName].prodis.push(p);
    });

    if (q) {
      const filtered: Record<string, { id_fakultas: number; prodis: ProdiItem[] }> = {};
      Object.entries(map).forEach(([k, v]) => {
        const matchFak = k.toLowerCase().includes(q);
        if (v.prodis.length > 0 || matchFak) {
          filtered[k] = v;
        }
      });
      return filtered;
    }

    return map;
  }, [prodiList, fakultasList, prodiSearch]);

  const uniqueFaculties = useMemo(() => {
    if (fakultasList.length > 0) {
      return fakultasList.map((f) => ({ id: f.id_fakultas, name: f.nama_fakultas }));
    }
    const map: { id: number; name: string }[] = [];
    const seen = new Set<number>();
    prodiList.forEach((p) => {
      if (!seen.has(p.id_fakultas)) {
        seen.add(p.id_fakultas);
        map.push({ id: p.id_fakultas, name: p.fakultas?.nama_fakultas || `#${p.id_fakultas}` });
      }
    });
    return map;
  }, [fakultasList, prodiList]);

  const toggleProdi = (id_prodi: number) => {
    setAllowedProdiIds((prev) =>
      prev.includes(id_prodi) ? prev.filter((id) => id !== id_prodi) : [...prev, id_prodi]
    );
  };

  const selectAllProdi = () => {
    setAllowedProdiIds(prodiList.map((p) => p.id_prodi));
  };

  const deselectAllProdi = () => {
    setAllowedProdiIds([]);
  };

  const handleCreateFaculty = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFacultyName.trim()) {
      setStatusMessage({ type: 'error', text: 'Nama fakultas wajib diisi!' });
      return;
    }
    setIsSubmittingNew(true);
    setStatusMessage(null);

    try {
      const res = await fetch('/api/fakultas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nama_fakultas: newFacultyName.trim(),
          nama_prodi: newFacultyInitialProdi.trim() || undefined,
        }),
      });

      const json = await res.json();
      if (json.success) {
        setIsFacultyModalOpen(false);
        setNewFacultyName('');
        setNewFacultyInitialProdi('');
        setStatusMessage({
          type: 'success',
          text: json.message || `Fakultas "${newFacultyName}" berhasil ditambahkan ke database!`,
        });
        await fetchData();
      } else {
        setStatusMessage({ type: 'error', text: json.message || 'Gagal menambahkan fakultas.' });
      }
    } catch {
      setStatusMessage({ type: 'error', text: 'Gagal terhubung ke database untuk menambahkan fakultas.' });
    } finally {
      setIsSubmittingNew(false);
    }
  };

  const handleCreateProdi = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFakultasId || !newProdiName.trim()) {
      setStatusMessage({ type: 'error', text: 'Fakultas dan nama program studi wajib diisi!' });
      return;
    }
    setIsSubmittingNew(true);
    setStatusMessage(null);

    try {
      const res = await fetch('/api/prodi', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id_fakultas: selectedFakultasId,
          nama_prodi: newProdiName.trim(),
        }),
      });

      const json = await res.json();
      if (json.success) {
        setIsProdiModalOpen(false);
        setNewProdiName('');
        setStatusMessage({
          type: 'success',
          text: json.message || `Program studi "${newProdiName}" berhasil ditambahkan!`,
        });
        await fetchData();
      } else {
        setStatusMessage({ type: 'error', text: json.message || 'Gagal menambahkan program studi.' });
      }
    } catch {
      setStatusMessage({ type: 'error', text: 'Gagal terhubung ke database untuk menambahkan program studi.' });
    } finally {
      setIsSubmittingNew(false);
    }
  };

  const handleUpdateProdi = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProdi || !editingProdi.nama_prodi.trim()) {
      setStatusMessage({ type: 'error', text: 'Nama program studi wajib diisi!' });
      return;
    }
    setIsActionLoading(true);
    setStatusMessage(null);

    try {
      const res = await fetch('/api/prodi', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editingProdi),
      });

      const json = await res.json();
      if (json.success) {
        setEditingProdi(null);
        setStatusMessage({
          type: 'success',
          text: json.message || 'Program studi berhasil diperbarui!',
        });
        await fetchData();
      } else {
        setStatusMessage({ type: 'error', text: json.message || 'Gagal memperbarui program studi.' });
      }
    } catch {
      setStatusMessage({ type: 'error', text: 'Gagal terhubung ke database untuk memperbarui program studi.' });
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleDeleteProdi = async () => {
    if (!deletingProdi) return;
    setIsActionLoading(true);
    setStatusMessage(null);

    try {
      const res = await fetch(`/api/prodi?id=${deletingProdi.id_prodi}`, {
        method: 'DELETE',
      });

      const json = await res.json();
      if (json.success) {
        setDeletingProdi(null);
        setStatusMessage({
          type: 'success',
          text: json.message || 'Program studi berhasil dihapus!',
        });
        await fetchData();
      } else {
        setStatusMessage({ type: 'error', text: json.message || 'Gagal menghapus program studi.' });
      }
    } catch {
      setStatusMessage({ type: 'error', text: 'Gagal terhubung ke database untuk menghapus program studi.' });
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleUpdateFaculty = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingFaculty || !editingFaculty.nama_fakultas.trim()) {
      setStatusMessage({ type: 'error', text: 'Nama fakultas wajib diisi!' });
      return;
    }
    setIsActionLoading(true);
    setStatusMessage(null);

    try {
      const res = await fetch('/api/fakultas', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editingFaculty),
      });

      const json = await res.json();
      if (json.success) {
        setEditingFaculty(null);
        setStatusMessage({
          type: 'success',
          text: json.message || 'Nama fakultas berhasil diperbarui!',
        });
        await fetchData();
      } else {
        setStatusMessage({ type: 'error', text: json.message || 'Gagal memperbarui nama fakultas.' });
      }
    } catch {
      setStatusMessage({ type: 'error', text: 'Gagal terhubung ke database untuk memperbarui nama fakultas.' });
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleDeleteFaculty = async () => {
    if (!deletingFaculty) return;
    setIsActionLoading(true);
    setStatusMessage(null);

    try {
      const res = await fetch(`/api/fakultas?id=${deletingFaculty.id_fakultas}`, {
        method: 'DELETE',
      });

      const json = await res.json();
      if (json.success) {
        setDeletingFaculty(null);
        setStatusMessage({
          type: 'success',
          text: json.message || 'Fakultas berhasil dihapus!',
        });
        await fetchData();
      } else {
        setStatusMessage({ type: 'error', text: json.message || 'Gagal menghapus fakultas.' });
      }
    } catch {
      setStatusMessage({ type: 'error', text: 'Gagal terhubung ke database untuk menghapus fakultas.' });
    } finally {
      setIsActionLoading(false);
    }
  };

  return (
    <AdminPersyaratanAkademikView
      isLoading={isLoading}
      isSaving={isSaving}
      statusMessage={statusMessage}
      setStatusMessage={setStatusMessage}
      minIpk={minIpk}
      setMinIpk={setMinIpk}
      minSemester={minSemester}
      setMinSemester={setMinSemester}
      maxSemester={maxSemester}
      setMaxSemester={setMaxSemester}
      minSks={minSks}
      setMinSks={setMinSks}
      allProdi={allProdi}
      setAllProdi={setAllProdi}
      allowedProdiIds={allowedProdiIds}
      akademikStatus={akademikStatus}
      setAkademikStatus={setAkademikStatus}
      catatanAkademik={catatanAkademik}
      setCatatanAkademik={setCatatanAkademik}
      prodiList={prodiList}
      prodiSearch={prodiSearch}
      setProdiSearch={setProdiSearch}
      prodiByFakultas={prodiByFakultas}
      uniqueFaculties={uniqueFaculties}
      toggleProdi={toggleProdi}
      selectAllProdi={selectAllProdi}
      deselectAllProdi={deselectAllProdi}
      handleSave={handleSave}
      isFacultyModalOpen={isFacultyModalOpen}
      setIsFacultyModalOpen={setIsFacultyModalOpen}
      newFacultyName={newFacultyName}
      setNewFacultyName={setNewFacultyName}
      newFacultyInitialProdi={newFacultyInitialProdi}
      setNewFacultyInitialProdi={setNewFacultyInitialProdi}
      isSubmittingNew={isSubmittingNew}
      handleCreateFaculty={handleCreateFaculty}
      isProdiModalOpen={isProdiModalOpen}
      setIsProdiModalOpen={setIsProdiModalOpen}
      selectedFakultasId={selectedFakultasId}
      setSelectedFakultasId={setSelectedFakultasId}
      newProdiName={newProdiName}
      setNewProdiName={setNewProdiName}
      handleCreateProdi={handleCreateProdi}
      editingProdi={editingProdi}
      setEditingProdi={setEditingProdi}
      deletingProdi={deletingProdi}
      setDeletingProdi={setDeletingProdi}
      handleUpdateProdi={handleUpdateProdi}
      handleDeleteProdi={handleDeleteProdi}
      editingFaculty={editingFaculty}
      setEditingFaculty={setEditingFaculty}
      deletingFaculty={deletingFaculty}
      setDeletingFaculty={setDeletingFaculty}
      handleUpdateFaculty={handleUpdateFaculty}
      handleDeleteFaculty={handleDeleteFaculty}
      isActionLoading={isActionLoading}
    />
  );
}
