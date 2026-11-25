'use client';

import React, { useEffect, useState, useCallback, useMemo } from 'react';
import {
  isKriteriaBahasa,
  deteksiSkorBahasa,
} from '@/lib/rubrikBahasa';
import {
  StaffWawancaraView,
  WawancaraItem,
  KriteriaWawancaraItem,
} from '@/components/staff';

interface PeriodeItem {
  id_periode: number;
  nama_periode: string;
  tahun: number;
  status: string;
}

function parseDeskripsiDiri(raw?: string | null) {
  if (!raw || raw === '-' || !raw.trim()) {
    return { organisasi: '-', bahasa: '-', motivasi: '-' };
  }
  const orgMatch = raw.match(
    /\[Pengalaman Organisasi\]:\s*([\s\S]*?)(?=\n\[Kemampuan Bahasa Asing\]:|\n\[Motivasi\]:|$)/
  );
  const bhsMatch = raw.match(
    /\[Kemampuan Bahasa Asing\]:\s*([\s\S]*?)(?=\n\[Motivasi\]:|$)/
  );
  const motMatch = raw.match(/\[Motivasi\]:\s*([\s\S]*?)$/);

  return {
    organisasi: orgMatch ? orgMatch[1].trim() : '-',
    bahasa: bhsMatch ? bhsMatch[1].trim() : '-',
    motivasi: motMatch ? motMatch[1].trim() : (raw.startsWith('[') ? '-' : raw.trim()),
  };
}

function isKriteriaOrganisasi(name: string): boolean {
  const lower = name.toLowerCase();
  return lower.includes('organisasi') || lower.includes('kepanitiaan') || lower.includes('kepemimpinan');
}

function isKriteriaMotivasi(name: string): boolean {
  const lower = name.toLowerCase();
  return lower.includes('motivasi') || lower.includes('esai') || lower.includes('visi') || lower.includes('essay');
}

function renderRichText(text?: string) {
  if (!text || text === '-') {
    return <p className="text-slate-400 italic text-xs">Belum ada data yang diisikan.</p>;
  }

  const lines = text.split('\n');
  return (
    <div className="space-y-1.5 text-xs text-slate-700 leading-relaxed">
      {lines.map((line, idx) => {
        const trimmed = line.trim();
        if (!trimmed) return <div key={idx} className="h-1" />;

        const isBullet = trimmed.startsWith('•') || trimmed.startsWith('-');
        const lineContent = isBullet ? trimmed.replace(/^[•-]\s*/, '') : trimmed;

        const parts: React.ReactNode[] = [];
        const tokenRegex = /(\*\*[^*]+\*\*|\*[^*]+\*)/g;
        let lastIndex = 0;
        let match: RegExpExecArray | null;

        while ((match = tokenRegex.exec(lineContent)) !== null) {
          if (match.index > lastIndex) {
            parts.push(lineContent.substring(lastIndex, match.index));
          }
          const token = match[0];
          if (token.startsWith('**') && token.endsWith('**')) {
            parts.push(
              <strong key={match.index} className="font-bold text-slate-900">
                {token.slice(2, -2)}
              </strong>
            );
          } else if (token.startsWith('*') && token.endsWith('*')) {
            parts.push(
              <em key={match.index} className="italic text-slate-800">
                {token.slice(1, -1)}
              </em>
            );
          }
          lastIndex = tokenRegex.lastIndex;
        }
        if (lastIndex < lineContent.length) {
          parts.push(lineContent.substring(lastIndex));
        }

        if (isBullet) {
          return (
            <div key={idx} className="flex items-start gap-2 pl-2">
              <span className="text-[#0E4A3E] font-black leading-none">•</span>
              <span className="flex-1">{parts}</span>
            </div>
          );
        }
        return <p key={idx}>{parts}</p>;
      })}
    </div>
  );
}

export default function StaffWawancaraPage() {
  const [items, setItems] = useState<WawancaraItem[]>([]);
  const [kriteriaList, setKriteriaList] = useState<KriteriaWawancaraItem[]>([]);
  const [periodeList, setPeriodeList] = useState<PeriodeItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [search, setSearch] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [activeItem, setActiveItem] = useState<WawancaraItem | null>(null);
  const [scores, setScores] = useState<{ [key: number]: number | '' }>({});
  const [catatan, setCatatan] = useState<string>('');
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [timelineGuard, setTimelineGuard] = useState<{
    isOpen: boolean;
    status: string;
    stageName?: string;
    tanggalMulai?: string;
    tanggalSelesai?: string;
    message?: string;
  } | null>(null);

  const parsedActiveDeskripsi = useMemo(() => {
    return parseDeskripsiDiri(activeItem?.deskripsi_diri);
  }, [activeItem]);

  const detectedBahasa = useMemo(() => {
    if (!parsedActiveDeskripsi.bahasa || parsedActiveDeskripsi.bahasa === '-') return null;
    return deteksiSkorBahasa(parsedActiveDeskripsi.bahasa);
  }, [parsedActiveDeskripsi]);

  const systemScoreBahasa = useMemo(() => {
    if (!detectedBahasa?.jenjang) {
      if (
        parsedActiveDeskripsi.bahasa.includes('Poin 0') ||
        parsedActiveDeskripsi.bahasa.includes('Skor 0') ||
        parsedActiveDeskripsi.bahasa.toLowerCase().includes('belum')
      ) {
        return 0;
      }
      return 0;
    }
    return detectedBahasa.jenjang.nilaiStandar;
  }, [detectedBahasa, parsedActiveDeskripsi]);

  const currentKriteriaList = useMemo(() => {
    if (!activeItem) return [];
    if (activeItem.id_periode) {
      const match = kriteriaList.filter((k) => k.id_periode === activeItem.id_periode);
      if (match.length > 0) return match;
    }
    const grouped = kriteriaList.reduce((acc, k) => {
      const pId = k.id_periode || 1;
      acc[pId] = acc[pId] || [];
      acc[pId].push(k);
      return acc;
    }, {} as Record<number, KriteriaWawancaraItem[]>);
    const keys = Object.keys(grouped).map(Number).sort((a, b) => b - a);
    return keys.length > 0 ? grouped[keys[0]] : kriteriaList;
  }, [activeItem, kriteriaList]);

  const kriteriaBahasa = useMemo(() => {
    return currentKriteriaList.find((k) => isKriteriaBahasa(k.nama_kriteria));
  }, [currentKriteriaList]);

  const kriteriaOrganisasi = useMemo(() => {
    return currentKriteriaList.find((k) => isKriteriaOrganisasi(k.nama_kriteria));
  }, [currentKriteriaList]);

  const kriteriaMotivasi = useMemo(() => {
    return currentKriteriaList.find((k) => isKriteriaMotivasi(k.nama_kriteria));
  }, [currentKriteriaList]);

  const kriteriaLainnya = useMemo(() => {
    return currentKriteriaList.filter(
      (k) =>
        k.id_kriteria_wawancara !== kriteriaBahasa?.id_kriteria_wawancara &&
        k.id_kriteria_wawancara !== kriteriaOrganisasi?.id_kriteria_wawancara &&
        k.id_kriteria_wawancara !== kriteriaMotivasi?.id_kriteria_wawancara
    );
  }, [currentKriteriaList, kriteriaBahasa, kriteriaOrganisasi, kriteriaMotivasi]);

  const fetchWawancara = useCallback(async (signal?: AbortSignal) => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      params.set('active_only', 'true');
      if (search.trim()) params.set('search', search.trim());
      if (statusFilter !== 'all') params.set('status', statusFilter);

      const res = await fetch(`/api/wawancara?${params.toString()}`, { signal });
      if (!res.ok || signal?.aborted) return;
      const json = await res.json();
      if (signal?.aborted) return;

      if (json.success) {
        setItems(json.data || []);
        if (json.kriteria_wawancara) setKriteriaList(json.kriteria_wawancara);
        if (json.periodes) setPeriodeList(json.periodes);
        if (json.timelineGuard) setTimelineGuard(json.timelineGuard);
      }
    } catch (err: any) {
      if (err?.name === 'AbortError') return;
      console.error(err);
    } finally {
      if (!signal?.aborted) {
        setIsLoading(false);
      }
    }
  }, [search, statusFilter]);

  useEffect(() => {
    const controller = new AbortController();
    fetchWawancara(controller.signal);
    return () => {
      controller.abort();
    };
  }, [fetchWawancara]);

  const handleOpenInput = (item: WawancaraItem) => {
    setActiveItem(item);
    setCatatan(item.catatan || '');

    const relevantKriteria = item.id_periode
      ? kriteriaList.filter((k) => k.id_periode === item.id_periode)
      : kriteriaList;
    const activeList = relevantKriteria.length > 0 ? relevantKriteria : kriteriaList;

    const parsed = parseDeskripsiDiri(item.deskripsi_diri);
    const det = deteksiSkorBahasa(parsed.bahasa);
    const autoScore = det?.jenjang ? det.jenjang.nilaiStandar : 0;

    const map: { [key: number]: number | '' } = {};
    if (item.nilai_detail && item.nilai_detail.length > 0) {
      item.nilai_detail.forEach((nd) => {
        map[nd.id_kriteria_wawancara] = nd.nilai;
      });
    } else {
      activeList.forEach((k) => {
        map[k.id_kriteria_wawancara] = '';
      });
    }

    activeList.forEach((k) => {
      if (isKriteriaBahasa(k.nama_kriteria)) {
        map[k.id_kriteria_wawancara] = autoScore;
      }
    });

    setScores(map);

    setTimeout(() => {
      const panel = document.getElementById('input-nilai-panel');
      if (panel) {
        panel.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 100);
  };

  const calculatedAverage = useMemo(() => {
    if (!currentKriteriaList || currentKriteriaList.length === 0) return null;
    let sum = 0;
    let count = 0;
    currentKriteriaList.forEach((k) => {
      const isBhs = isKriteriaBahasa(k.nama_kriteria);
      const val = isBhs ? systemScoreBahasa : scores[k.id_kriteria_wawancara];
      if (val !== '' && val !== undefined && !isNaN(Number(val))) {
        sum += Number(val) * (k.bobot / 100);
        count++;
      }
    });
    if (count === 0) return null;
    return parseFloat(sum.toFixed(2));
  }, [currentKriteriaList, scores, systemScoreBahasa]);

  const handleSaveScore = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeItem) return;

    const currentScores = { ...scores };
    currentKriteriaList.forEach((k) => {
      if (isKriteriaBahasa(k.nama_kriteria)) {
        currentScores[k.id_kriteria_wawancara] = systemScoreBahasa;
      }
    });

    const hasUnfilled = currentKriteriaList.some(
      (k) =>
        !isKriteriaBahasa(k.nama_kriteria) &&
        (currentScores[k.id_kriteria_wawancara] === '' || currentScores[k.id_kriteria_wawancara] === undefined)
    );
    if (hasUnfilled) {
      setStatusMessage({ type: 'error', text: 'Semua nilai kriteria wawancara penguji wajib diisi!' });
      return;
    }

    setIsSaving(true);
    try {
      const formattedScores = currentKriteriaList.map((k) => {
        const isBhs = isKriteriaBahasa(k.nama_kriteria);
        return {
          id_kriteria_wawancara: k.id_kriteria_wawancara,
          nilai: isBhs ? systemScoreBahasa : Number(currentScores[k.id_kriteria_wawancara]),
          catatan: isBhs
            ? `[Otomatis Sistem] Penilaian Kemampuan Bahasa: ${parsedActiveDeskripsi.bahasa} (Skor: ${systemScoreBahasa})`
            : `Penilaian ${k.nama_kriteria}`,
        };
      });

      const res = await fetch('/api/wawancara', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id_wawancara: activeItem.id_wawancara,
          catatan: catatan.trim(),
          scores: formattedScores,
        }),
      });

      const json = await res.json();
      if (json.success) {
        setStatusMessage({
          type: 'success',
          text: `Nilai wawancara untuk ${activeItem.nama} berhasil disimpan! Rata-rata terbobot: ${calculatedAverage ?? '-'}`,
        });
        setActiveItem(null);
        await fetchWawancara();
      } else {
        setStatusMessage({ type: 'error', text: json.message || 'Gagal menyimpan nilai.' });
      }
    } catch (err) {
      console.error(err);
      setStatusMessage({ type: 'error', text: 'Terjadi kesalahan sistem.' });
    } finally {
      setIsSaving(false);
    }
  };

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return '-';
    try {
      return new Date(dateStr).toLocaleDateString('id-ID', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <StaffWawancaraView
      items={items}
      periodeList={periodeList}
      isLoading={isLoading}
      search={search}
      onSearchChange={setSearch}
      statusFilter={statusFilter}
      onStatusFilterChange={setStatusFilter}
      statusMessage={statusMessage}
      onCloseStatusMessage={() => setStatusMessage(null)}
      timelineGuard={timelineGuard}
      formatDate={formatDate}
      onOpenInput={handleOpenInput}
      activeItem={activeItem}
      onCloseInput={() => setActiveItem(null)}
      onSaveScore={handleSaveScore}
      isSaving={isSaving}
      kriteriaOrganisasi={kriteriaOrganisasi}
      kriteriaBahasa={kriteriaBahasa}
      kriteriaMotivasi={kriteriaMotivasi}
      kriteriaLainnya={kriteriaLainnya}
      parsedActiveDeskripsi={parsedActiveDeskripsi}
      detectedBahasa={detectedBahasa}
      systemScoreBahasa={systemScoreBahasa}
      scores={scores}
      onScoreChange={(idKriteria, val) =>
        setScores((prev) => ({
          ...prev,
          [idKriteria]: val,
        }))
      }
      calculatedAverage={calculatedAverage}
      catatan={catatan}
      onCatatanChange={setCatatan}
      renderRichText={renderRichText}
    />
  );
}
