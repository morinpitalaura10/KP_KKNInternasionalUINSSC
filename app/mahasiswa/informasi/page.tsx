'use client';

import React, { useState, useEffect } from 'react';
import {
  MahasiswaInformasiView,
  InformasiRow,
  PeriodeRow,
  NegaraRow,
  SyaratAkademikData,
  PersyaratanItem,
  TimelineStageItem,
} from '@/components/mahasiswa';

function formatDateID(dateStr?: string) {
  if (!dateStr) return '-';
  try {
    return new Date(dateStr).toLocaleDateString('id-ID', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    });
  } catch {
    return dateStr;
  }
}

function formatFileSize(kb: number): string {
  if (kb >= 1024) {
    return `${(kb / 1024).toFixed(0)} MB`;
  }
  return `${kb} KB`;
}

export default function InformasiPage() {
  const [activeTab, setActiveTab] = useState<string>('tentang');

  const [infoList, setInfoList] = useState<InformasiRow[]>([]);
  const [activePeriode, setActivePeriode] = useState<PeriodeRow | null>(null);
  const [negaraList, setNegaraList] = useState<NegaraRow[]>([]);
  const [syaratAkademik, setSyaratAkademik] = useState<SyaratAkademikData | null>(null);
  const [timelineStages, setTimelineStages] = useState<TimelineStageItem[]>([]);
  const [persyaratanList, setPersyaratanList] = useState<PersyaratanItem[]>([]);
  const [activeStageId, setActiveStageId] = useState<number | null>(null);
  const [, setIsLoadingMain] = useState<boolean>(true);
  const [checkedIds, setCheckedIds] = useState<number[]>([]);

  const handleToggleCheck = (id: number) => {
    setCheckedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  useEffect(() => {
    async function loadAllFromDB() {
      setIsLoadingMain(true);
      try {
        const [infoRes, perRes, negRes, akadRes, timeRes, reqRes] = await Promise.all([
          fetch('/api/informasi'),
          fetch('/api/periode'),
          fetch('/api/negara'),
          fetch('/api/persyaratan/akademik'),
          fetch('/api/timeline'),
          fetch('/api/persyaratan'),
        ]);

        const safeJson = async (r: Response) => (r.ok ? r.json() : { success: false });

        const [infoJson, perJson, negJson, akadJson, timeJson, reqJson] = await Promise.all([
          safeJson(infoRes),
          safeJson(perRes),
          safeJson(negRes),
          safeJson(akadRes),
          safeJson(timeRes),
          safeJson(reqRes),
        ]);

        if (infoJson.success && Array.isArray(infoJson.data)) {
          setInfoList(infoJson.data);
        }

        if (perJson.success && Array.isArray(perJson.data)) {
          const aktif =
            perJson.data.find((p: PeriodeRow) => p.status === 'Aktif') || perJson.data[0] || null;
          setActivePeriode(aktif);
        }

        if (negJson.success && Array.isArray(negJson.data)) {
          const opened = negJson.data.filter((n: NegaraRow) => n.isActiveInCurrentPeriode);
          setNegaraList(opened.length > 0 ? opened : negJson.data);
        }

        if (akadJson.success && akadJson.data) {
          setSyaratAkademik(akadJson.data);
        }

        if (timeJson.success && Array.isArray(timeJson.data)) {
          setTimelineStages(timeJson.data);
          const ongoing = timeJson.data.find((s: TimelineStageItem) => s.status_tahapan === 'Berlangsung');
          if (ongoing) {
            setActiveStageId(ongoing.id_timeline);
          } else if (timeJson.data.length > 0) {
            setActiveStageId(timeJson.data[0].id_timeline);
          }
        }

        if (reqJson.success && Array.isArray(reqJson.data)) {
          setPersyaratanList(reqJson.data);
        }
      } catch (err) {
        console.error('Error loading informasi mahasiswa from database:', err);
      } finally {
        setIsLoadingMain(false);
      }
    }

    loadAllFromDB();
  }, []);

  const scrollToSection = (id: string) => {
    setActiveTab(id);
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const pelaksanaanStage =
    timelineStages.find((s) => s.is_pelaksanaan) ||
    timelineStages.find((s) => s.nama_tahapan?.toLowerCase().includes('pelaksanaan')) ||
    null;

  const targetStartDate = pelaksanaanStage?.tanggal_mulai || activePeriode?.tanggal_mulai;
  const targetEndDate = pelaksanaanStage?.tanggal_selesai || activePeriode?.tanggal_selesai;

  const durasiHari = (() => {
    if (!targetStartDate || !targetEndDate) return null;
    const start = new Date(targetStartDate).getTime();
    const end = new Date(targetEndDate).getTime();
    const diff = Math.round((end - start) / (1000 * 60 * 60 * 24)) + 1;
    return diff > 0 ? diff : null;
  })();

  const filteredInfo =
    infoList.find(
      (item) =>
        item.status &&
        (!item.id_periode || (activePeriode && item.id_periode === activePeriode.id_periode))
    ) ||
    infoList[0] ||
    null;

  const selectedStage =
    timelineStages.find((s) => s.id_timeline === activeStageId) || timelineStages[0];

  const totalDocs = persyaratanList.length;
  const checkedCount = checkedIds.length;
  const progressPercent = totalDocs > 0 ? Math.round((checkedCount / totalDocs) * 100) : 0;
  const wajibCount = persyaratanList.filter((p) => p.wajib).length;

  return (
    <MahasiswaInformasiView
      activeTab={activeTab}
      onScrollToSection={scrollToSection}
      activePeriode={activePeriode}
      filteredInfo={filteredInfo}
      durasiHari={durasiHari}
      targetStartDate={targetStartDate}
      targetEndDate={targetEndDate}
      negaraList={negaraList}
      syaratAkademik={syaratAkademik}
      persyaratanList={persyaratanList}
      checkedIds={checkedIds}
      onToggleCheck={handleToggleCheck}
      totalDocs={totalDocs}
      checkedCount={checkedCount}
      progressPercent={progressPercent}
      wajibCount={wajibCount}
      timelineStages={timelineStages}
      selectedStage={selectedStage}
      onSelectStage={setActiveStageId}
      formatDateID={formatDateID}
      formatFileSize={formatFileSize}
    />
  );
}
