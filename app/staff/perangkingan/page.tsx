'use client';

import React, { useEffect, useState, useCallback, useMemo } from 'react';
import {
  StaffPerangkinganView,
  PerangkinganItem,
  KriteriaInfo,
  PeriodeItem,
} from '@/components/staff';

const FAKULTAS_LIST = ['Semua Fakultas', 'FITK', 'FEBI', 'FASYA', 'FUA', 'FDKI', 'FASTIH'];

export default function StaffPerangkinganPage() {
  const [items, setItems] = useState<PerangkinganItem[]>([]);
  const [kriteriaList, setKriteriaList] = useState<KriteriaInfo[]>([]);
  const [periodes, setPeriodes] = useState<PeriodeItem[]>([]);
  const [selectedPeriodeId, setSelectedPeriodeId] = useState<number | null>(null);
  const [bobotSubstansi, setBobotSubstansi] = useState<number>(70);
  const [bobotWawancara, setBobotWawancara] = useState<number>(30);

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [search, setSearch] = useState<string>('');
  const [fakultasFilter, setFakultasFilter] = useState<string>('Semua Fakultas');
  const [selectedDetail, setSelectedDetail] = useState<PerangkinganItem | null>(null);

  const [isKriteriaModalOpen, setIsKriteriaModalOpen] = useState<boolean>(false);
  const [isSawModalOpen, setIsSawModalOpen] = useState<boolean>(false);
  const [sawTab, setSawTab] = useState<'keputusan' | 'normalisasi' | 'preferensi'>('preferensi');

  const fetchPerangkingan = useCallback(async (signal?: AbortSignal) => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams({ limit: '100', active_only: 'true' });

      const hasilRes = await fetch(`/api/hasil_akhir?${params.toString()}`, { signal });
      if (!hasilRes.ok || signal?.aborted) return;
      const hasilJson = await hasilRes.json();
      if (signal?.aborted) return;

      const activeId = hasilJson.activePeriodeId || hasilJson.periodes?.[0]?.id_periode;
      const kritRes = await fetch(
        `/api/kriteria${activeId && activeId > 0 ? `?id_periode=${activeId}` : ''}`,
        { signal }
      );
      if (!kritRes.ok || signal?.aborted) return;
      const kritJson = await kritRes.json();
      if (signal?.aborted) return;

      if (hasilJson.success) {
        const fetchedItems: PerangkinganItem[] = hasilJson.data || [];
        setItems(fetchedItems);

        if (hasilJson.summary) {
          setBobotSubstansi(
            hasilJson.summary.bobotSubstansi ?? fetchedItems[0]?.bobot_substansi ?? 70
          );
          setBobotWawancara(
            hasilJson.summary.bobotWawancara ?? fetchedItems[0]?.bobot_wawancara ?? 30
          );
        }

        if (hasilJson.periodes) {
          setPeriodes(hasilJson.periodes);
          const currentId = hasilJson.activePeriodeId || hasilJson.periodes[0]?.id_periode;
          if (currentId) {
            setSelectedPeriodeId(currentId);
          }
        }
      }

      if (kritJson.success && kritJson.data) {
        setKriteriaList(
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          kritJson.data
            .filter((k: any) => k.status !== false)
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            .map((k: any) => ({
              id_kriteria: k.id_kriteria,
              nama_kriteria: k.nama_kriteria,
              bobot: k.bobot,
              nilai_maksimal: k.nilai_maksimal,
              jenis: k.jenis,
              metode_nilai: k.metode_nilai,
              status: k.status,
            }))
        );
      }
    } catch (err: any) {
      if (err?.name === 'AbortError') return;
      console.error(err);
    } finally {
      if (!signal?.aborted) {
        setIsLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    fetchPerangkingan(controller.signal);
    return () => {
      controller.abort();
    };
  }, [fetchPerangkingan]);

  const sawCalculation = useMemo(() => {
    if (items.length === 0) return null;

    const maxSubstansi = Math.max(...items.map((i) => i.nilai_substansi || 1));
    const maxWawancara = Math.max(...items.map((i) => i.nilai_wawancara || 1));

    const wSubstansi = bobotSubstansi / 100;
    const wWawancara = bobotWawancara / 100;

    const rows = items.map((item) => {
      const rSubstansi = maxSubstansi > 0 ? item.nilai_substansi / maxSubstansi : 0;
      const rWawancara = maxWawancara > 0 ? item.nilai_wawancara / maxWawancara : 0;
      const vPreference = wSubstansi * rSubstansi + wWawancara * rWawancara;

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
      };
    });

    return {
      maxSubstansi,
      maxWawancara,
      wSubstansi,
      wWawancara,
      rows,
    };
  }, [items, bobotSubstansi, bobotWawancara]);

  const filteredItems = items.filter((item) => {
    const matchesSearch =
      item.nama.toLowerCase().includes(search.toLowerCase()) ||
      item.nim.toLowerCase().includes(search.toLowerCase());
    const matchesFakultas =
      fakultasFilter === 'Semua Fakultas' || item.nama_fakultas === fakultasFilter;
    return matchesSearch && matchesFakultas;
  });

  const activePeriodeObj = periodes.find((p) => p.id_periode === selectedPeriodeId) || periodes[0];

  return (
    <StaffPerangkinganView
      items={items}
      filteredItems={filteredItems}
      kriteriaList={kriteriaList}
      periodes={periodes}
      activePeriodeObj={activePeriodeObj}
      bobotSubstansi={bobotSubstansi}
      bobotWawancara={bobotWawancara}
      isLoading={isLoading}
      search={search}
      onSearchChange={setSearch}
      fakultasFilter={fakultasFilter}
      onFakultasFilterChange={setFakultasFilter}
      fakultasList={FAKULTAS_LIST}
      selectedDetail={selectedDetail}
      onSelectDetail={setSelectedDetail}
      isKriteriaModalOpen={isKriteriaModalOpen}
      onSetKriteriaModalOpen={setIsKriteriaModalOpen}
      isSawModalOpen={isSawModalOpen}
      onSetSawModalOpen={setIsSawModalOpen}
      sawTab={sawTab}
      onSetSawTab={setSawTab}
      sawCalculation={sawCalculation}
    />
  );
}
