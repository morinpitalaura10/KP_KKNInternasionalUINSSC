'use client';

import React, { useEffect, useState, useCallback, useMemo } from 'react';
import {
  Search,
  Filter,
  RefreshCw,
  AlertCircle,
  CheckCircle2,
  X,
  Award,
  BookOpen,
  FileText,
  Calculator,
  Sparkles,
  HelpCircle,
  Check,
  Users,
  Languages,
  Compass,
  Lock,
} from 'lucide-react';
import { PageHeader } from '@/components/ui';
import {
  RUBRIK_BAHASA_JENJANG,
  RUBRIK_ARAB_JENJANG,
  hitungSkorToefl,
  hitungSkorIelts,
  hitungSkorToeic,
  isKriteriaBahasa,
  deteksiSkorBahasa,
  RubrikJenjang,
  RubrikArabJenjang,
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
  nim: string;
  nama: string;
  nama_fakultas: string;
  nama_prodi: string;
  tanggal_wawancara: string | null;
  catatan: string;
  status_db: string;
  is_dinilai: boolean;
  status_label: 'Dinilai' | 'Belum Dinilai';
  nilai_akhir: number | null;
  nilai_detail: NilaiDetailItem[];
  deskripsi_diri?: string | null;
  id_periode?: number | null;
  nama_periode?: string | null;
}

interface KriteriaWawancaraItem {
  id_kriteria_wawancara: number;
  id_periode?: number;
  nama_kriteria: string;
  bobot: number;
  nilai_maksimal: number;
}

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

  // Standarisasi Rubrik Penilaian Bahasa Asing (Kelompok Inggris & Arab)
  const [showRubrikBahasa, setShowRubrikBahasa] = useState<boolean>(false);
  const [selectedKategoriBahasa, setSelectedKategoriBahasa] = useState<'INGGRIS' | 'ARAB'>('INGGRIS');
  const [selectedTestType, setSelectedTestType] = useState<'TOEFL' | 'IELTS' | 'TOEIC'>('TOEFL');
  const [testScoreInput, setTestScoreInput] = useState<string>('');
  const [selectedArabPoin, setSelectedArabPoin] = useState<number | null>(null);

  // Deteksi otomatis skor bahasa dari isian Step 3 mahasiswa yang sedang dinilai
  const parsedActiveDeskripsi = useMemo(() => {
    return parseDeskripsiDiri(activeItem?.deskripsi_diri);
  }, [activeItem]);

  const detectedBahasa = useMemo(() => {
    if (!parsedActiveDeskripsi.bahasa || parsedActiveDeskripsi.bahasa === '-') return null;
    return deteksiSkorBahasa(parsedActiveDeskripsi.bahasa);
  }, [parsedActiveDeskripsi]);

  // Skor Bahasa otomatis dari sistem (Terkunci & Tidak Dapat Diubah oleh Staff)
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

  // Filter kriteria aktif yang sesuai dengan periode mahasiswa
  const currentKriteriaList = useMemo(() => {
    if (!activeItem) return [];
    if (activeItem.id_periode) {
      const match = kriteriaList.filter((k) => k.id_periode === activeItem.id_periode);
      if (match.length > 0) return match;
    }
    // Fallback: ambil kriteria dengan periode terbesar / aktif
    const grouped = kriteriaList.reduce((acc, k) => {
      const pId = k.id_periode || 1;
      acc[pId] = acc[pId] || [];
      acc[pId].push(k);
      return acc;
    }, {} as Record<number, KriteriaWawancaraItem[]>);
    const keys = Object.keys(grouped).map(Number).sort((a, b) => b - a);
    return keys.length > 0 ? grouped[keys[0]] : kriteriaList;
  }, [activeItem, kriteriaList]);

  // Identifikasi kriteria berdasarkan jenis isian
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

  // Handler untuk menerapkan poin rubrik ke nilai kriteria bahasa (Bahasa Inggris Utama)
  const handleApplyRubrikJenjang = (jenjang: RubrikJenjang, testLabel?: string) => {
    if (!kriteriaBahasa) return;
    setScores((prev) => ({
      ...prev,
      [kriteriaBahasa.id_kriteria_wawancara]: jenjang.nilaiStandar,
    }));

    const tag = testLabel
      ? `[Rubrik Standar: ${testLabel} | Poin ${jenjang.poin} (${jenjang.predikat}) - Nilai ${jenjang.nilaiStandar}]`
      : `[Rubrik Standar: Poin ${jenjang.poin} (${jenjang.predikat}) - Nilai ${jenjang.nilaiStandar}]`;

    setCatatan((prev) => {
      const trimmed = prev.trim();
      if (!trimmed) return tag;
      if (trimmed.includes('[Rubrik Standar:')) {
        return trimmed.replace(/\[Rubrik Standar:[^\]]+\]/, tag);
      }
      return `${trimmed}\n${tag}`;
    });
  };

  // Handler untuk menerapkan penilaian Bahasa Arab (Opsional / Nilai Tambah)
  const handleApplyRubrikArab = (jenjang: RubrikArabJenjang) => {
    setSelectedArabPoin(jenjang.poin);
    const tag = `[Nilai Tambah Bahasa Arab (Opsional): ${jenjang.predikat} (${jenjang.toaflLabel} / ${jenjang.lisanLabel}) | Poin ${jenjang.poin}]`;

    setCatatan((prev) => {
      const trimmed = prev.trim();
      if (!trimmed) return tag;
      if (trimmed.includes('[Nilai Tambah Bahasa Arab (Opsional):')) {
        return trimmed.replace(/\[Nilai Tambah Bahasa Arab \(Opsional\):[^\]]+\]/, tag);
      }
      return `${trimmed}\n${tag}`;
    });
  };

  const fetchWawancara = useCallback(async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      params.set('active_only', 'true');
      if (search.trim()) params.set('search', search.trim());
      if (statusFilter !== 'all') params.set('status', statusFilter);

      const res = await fetch(`/api/wawancara?${params.toString()}`);
      const json = await res.json();
      if (json.success) {
        setItems(json.data || []);
        if (json.kriteria_wawancara) setKriteriaList(json.kriteria_wawancara);
        if (json.periodes) setPeriodeList(json.periodes);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, [search, statusFilter]);

  useEffect(() => {
    fetchWawancara();
  }, [fetchWawancara]);

  const handleOpenInput = (item: WawancaraItem) => {
    setActiveItem(item);
    setCatatan(item.catatan || '');

    // Temukan kriteria yang relevan untuk pendaftaran peserta ini
    const relevantKriteria = item.id_periode
      ? kriteriaList.filter((k) => k.id_periode === item.id_periode)
      : kriteriaList;
    const activeList = relevantKriteria.length > 0 ? relevantKriteria : kriteriaList;

    // Hitung nilai bahasa otomatis dari sistem
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

    // Selalu pastikan nilai kriteria bahasa dikunci dengan nilai otomatis sistem
    activeList.forEach((k) => {
      if (isKriteriaBahasa(k.nama_kriteria)) {
        map[k.id_kriteria_wawancara] = autoScore;
      }
    });

    setScores(map);

    // Otomatis smooth-scroll ke bawah menuju panel input nilai wawancara
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

    // Pastikan nilai bahasa selalu menggunakan nilai otomatis sistem
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
    <div className="w-full max-w-7xl space-y-6 pb-12 font-sans">
      {/* ── Top Header Area ── */}
      <PageHeader
        title="NILAI WAWANCARA"
        subtitle="KULIAH KERJA NYATA INTERNASIONAL"
        description="Input dan kelola penilaian wawancara, rubrik bahasa, riwayat organisasi, serta esai mahasiswa."
      />

      {/* ── Search & Filter Bar ── */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Cari data pendaftar (Nama / NIM) disini..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-300 rounded-xl text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0E4A3E] shadow-2xs"
          />
        </div>

        {/* Indikator Periode Aktif */}
        {periodeList.length > 0 && (
          <div className="inline-flex items-center gap-2 px-3.5 py-2.5 bg-[#DDF2E8] border border-emerald-200 rounded-xl text-xs sm:text-sm font-extrabold text-[#0E4A3E] shadow-2xs shrink-0">
            <span>
              Periode Aktif: {periodeList[0].nama_periode} ({periodeList[0].tahun})
            </span>
          </div>
        )}

        {/* Filter Status Dinilai */}
        <div className="relative min-w-[170px]">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-xs sm:text-sm font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#0E4A3E] shadow-2xs appearance-none pr-8 cursor-pointer"
          >
            <option value="all">Semua Status</option>
            <option value="Dinilai">Sudah Dinilai</option>
            <option value="Belum Dinilai">Belum Dinilai</option>
          </select>
          <Filter className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
        </div>
      </div>

      {/* ── Status Message Toast ── */}
      {statusMessage && (
        <div
          className={`p-3.5 rounded-xl border flex items-center justify-between gap-3 text-xs sm:text-sm font-semibold transition-all ${
            statusMessage.type === 'success'
              ? 'bg-emerald-50 border-emerald-300 text-emerald-800'
              : 'bg-red-50 border-red-300 text-red-800'
          }`}
        >
          <div className="flex items-center gap-2.5">
            {statusMessage.type === 'success' ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            ) : (
              <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />
            )}
            <span>{statusMessage.text}</span>
          </div>
          <button
            onClick={() => setStatusMessage(null)}
            className="p-1 hover:bg-black/5 rounded-md text-slate-500 hover:text-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* ── Table Card ── */}
      <div className="bg-white rounded-2xl border border-slate-300 shadow-sm overflow-hidden">
        <div className="bg-[#0E4A3E] text-white px-6 py-4">
          <div className="grid grid-cols-12 text-xs font-extrabold tracking-wider uppercase items-center">
            <span className="col-span-1 text-center">No</span>
            <span className="col-span-3">NIM / Nama Mahasiswa</span>
            <span className="col-span-3">Fakultas / Program Studi</span>
            <span className="col-span-3">Jadwal & Nilai Rata-rata</span>
            <span className="col-span-1 text-center">Status</span>
            <span className="col-span-1 text-center">Aksi</span>
          </div>
        </div>

        {/* Content */}
        {isLoading ? (
          <div className="py-16 flex flex-col items-center justify-center text-slate-400 gap-2">
            <RefreshCw className="w-6 h-6 animate-spin text-[#0E4A3E]" />
            <span className="text-xs font-semibold">Memuat data wawancara...</span>
          </div>
        ) : items.length === 0 ? (
          <div className="py-16 text-center text-slate-500 text-sm">
            Tidak ada peserta wawancara yang sesuai dengan filter yang dipilih.
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {items.map((item, idx) => (
              <div
                key={item.id_wawancara}
                className="grid grid-cols-12 items-center px-6 py-4 hover:bg-slate-50 transition-colors text-xs sm:text-sm"
              >
                <span className="col-span-1 text-center font-bold text-slate-500">{idx + 1}</span>

                <div className="col-span-3 pr-3">
                  <p className="font-bold text-slate-800 leading-snug">{item.nama}</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-[11px] text-slate-500 font-mono">NIM: {item.nim}</span>
                    {item.nama_periode && (
                      <span className="text-[10px] font-semibold bg-emerald-50 text-[#0E4A3E] px-2 py-0.2 rounded border border-emerald-200">
                        {item.nama_periode}
                      </span>
                    )}
                  </div>
                </div>

                <div className="col-span-3 pr-3">
                  <p className="font-semibold text-slate-800">{item.nama_prodi}</p>
                  <span className="inline-block text-[11px] font-bold text-[#0E4A3E] bg-[#0E4A3E]/10 px-2 py-0.5 rounded-md mt-0.5">
                    {item.nama_fakultas}
                  </span>
                </div>

                <div className="col-span-3 pr-3">
                  {item.is_dinilai && item.nilai_akhir !== null ? (
                    <div>
                      <span className="text-base font-extrabold text-[#0E4A3E]">
                        {item.nilai_akhir.toFixed(2)}
                      </span>
                      <span className="text-[11px] text-slate-400">/ 100</span>
                      <p className="text-[10px] text-slate-400">Penguji: {item.pewawancara}</p>
                    </div>
                  ) : (
                    <div>
                      <span className="text-xs font-semibold text-slate-400 italic">Belum Dinilai</span>
                      <p className="text-[11px] text-slate-400">
                        Jadwal: {formatDate(item.tanggal_wawancara)}
                      </p>
                    </div>
                  )}
                </div>

                {/* Status Badges */}
                <div className="col-span-1 flex justify-center">
                  {item.is_dinilai ? (
                    <span className="inline-block bg-[#C0E6D8] text-[#0E4A3E] border border-emerald-300 font-bold text-[11px] px-3 py-1 rounded-full shadow-2xs whitespace-nowrap">
                      Sudah Dinilai
                    </span>
                  ) : (
                    <span className="inline-block bg-amber-100 text-amber-800 border border-amber-300 font-bold text-[11px] px-3 py-1 rounded-full shadow-2xs whitespace-nowrap">
                      Belum Dinilai
                    </span>
                  )}
                </div>

                {/* Aksi Button */}
                <div className="col-span-1 flex justify-center">
                  <button
                    onClick={() => handleOpenInput(item)}
                    className="px-3 py-1.5 bg-[#0E4A3E] hover:bg-[#09352c] text-white rounded-lg text-xs font-bold transition-all shadow-xs cursor-pointer whitespace-nowrap"
                  >
                    {item.is_dinilai ? 'Edit Nilai' : 'Beri Nilai'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Footer */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs text-slate-600">
          <div>Menampilkan {items.length} peserta wawancara</div>
          <div className="flex items-center gap-1.5">
            <span className="w-8 h-8 rounded-lg bg-[#0E4A3E] text-white flex items-center justify-center font-bold text-xs shadow-xs">
              1
            </span>
          </div>
        </div>
      </div>

      {/* ── PANEL EVALUASI & INPUT NILAI TERPADU MAHASISWA ── */}
      {activeItem && (
        <div
          id="input-nilai-panel"
          className="bg-white rounded-3xl border-2 border-[#0E4A3E]/30 shadow-xl p-5 sm:p-7 space-y-6 animate-in fade-in duration-200 scroll-mt-6"
        >
          {/* Header Panel */}
          <div className="flex items-center justify-between pb-4 border-b border-slate-200">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-[#0E4A3E] bg-[#C0E6D8] px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                  Panel Evaluasi & Penilaian Wawancara
                </span>
                {activeItem.nama_periode && (
                  <span className="text-xs font-semibold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md">
                    {activeItem.nama_periode}
                  </span>
                )}
              </div>
              <h3 className="text-lg font-black text-[#0E4A3E] mt-1">
                {activeItem.nama}
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                NIM: {activeItem.nim} • {activeItem.nama_prodi} ({activeItem.nama_fakultas})
              </p>
            </div>
            <button
              onClick={() => setActiveItem(null)}
              className="p-2 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-slate-700 cursor-pointer transition-colors"
              title="Tutup panel"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <p className="text-xs text-slate-600">
            Tinjau isian formulir pendaftaran mahasiswa (Step 3: Data Pendukung & Esai), kemudian berikan penilaian pada masing-masing indikator kriteria di bawah ini:
          </p>

          <form onSubmit={handleSaveScore} className="space-y-6">

            {/* ══════════════════════════════════════════════════════════════════
                MODUL 1: PENGALAMAN ORGANISASI / KEPANITIAAN & KEPEMIMPINAN
               ══════════════════════════════════════════════════════════════════ */}
            <div className="bg-slate-50/70 border border-slate-200 rounded-2xl p-4 sm:p-5 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-200">
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-[#0E4A3E]" />
                  <div>
                    <h4 className="text-xs font-extrabold text-[#0E4A3E] uppercase tracking-wide">
                      1. Pengalaman Organisasi / Kepanitiaan & Kepemimpinan
                    </h4>
                    <p className="text-[11px] text-slate-500">
                      Rekam jejak keikutsertaan organisasi kemahasiswaan, kepanitiaan, dan kepemimpinan.
                    </p>
                  </div>
                </div>
                {kriteriaOrganisasi && (
                  <span className="text-[10px] font-black bg-[#0E4A3E] text-white px-2.5 py-1 rounded-lg shrink-0">
                    Bobot: {kriteriaOrganisasi.bobot}%
                  </span>
                )}
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
                {/* Isian Mahasiswa dari Step 3 */}
                <div className="lg:col-span-8 bg-white p-4 rounded-xl border border-slate-200 shadow-2xs space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                      Isian Mahasiswa (Formulir Pendaftaran):
                    </span>
                    <span className="text-[10px] text-slate-400">
                      Step 3 • Data Pendukung
                    </span>
                  </div>
                  <div className="bg-slate-50/80 p-3 rounded-lg border border-slate-100">
                    {renderRichText(parsedActiveDeskripsi.organisasi)}
                  </div>
                </div>

                {/* Form Input Nilai Penguji */}
                <div className="lg:col-span-4 bg-white p-4 rounded-xl border border-emerald-200 shadow-2xs space-y-3">
                  <span className="text-[11px] font-bold text-[#0E4A3E] uppercase tracking-wider block">
                    Nilai Penguji (Skala 0 - 100):
                  </span>
                  {kriteriaOrganisasi ? (
                    <div>
                      <input
                        type="number"
                        min="0"
                        max="100"
                        step="1"
                        placeholder="Contoh: 85"
                        value={
                          scores[kriteriaOrganisasi.id_kriteria_wawancara] === ''
                            ? ''
                            : scores[kriteriaOrganisasi.id_kriteria_wawancara] ?? ''
                        }
                        onChange={(e) => {
                          const valStr = e.target.value;
                          setScores((prev) => ({
                            ...prev,
                            [kriteriaOrganisasi.id_kriteria_wawancara]:
                              valStr === '' ? '' : Math.min(100, Math.max(0, parseFloat(valStr) || 0)),
                          }));
                        }}
                        className="w-full px-3 py-2 rounded-xl border border-slate-300 font-black text-center text-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0E4A3E]"
                      />
                      {/* Quick Rating Buttons */}
                      <div className="grid grid-cols-4 gap-1.5 mt-2">
                        {[70, 80, 88, 95].map((val) => (
                          <button
                            key={val}
                            type="button"
                            onClick={() =>
                              setScores((prev) => ({
                                ...prev,
                                [kriteriaOrganisasi.id_kriteria_wawancara]: val,
                              }))
                            }
                            className={`py-1 text-[11px] font-bold rounded-lg border cursor-pointer transition-all ${
                              scores[kriteriaOrganisasi.id_kriteria_wawancara] === val
                                ? 'bg-[#0E4A3E] text-white border-[#0E4A3E]'
                                : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                            }`}
                          >
                            {val}
                          </button>
                        ))}
                      </div>
                      <p className="text-[10px] text-slate-400 mt-2 text-center">
                        Kontribusi ke nilai akhir: {typeof scores[kriteriaOrganisasi.id_kriteria_wawancara] === 'number' ? ((scores[kriteriaOrganisasi.id_kriteria_wawancara] as number) * (kriteriaOrganisasi.bobot / 100)).toFixed(2) : '0.00'} poin
                      </p>
                    </div>
                  ) : (
                    <p className="text-xs text-slate-400 italic">
                      Kriteria organisasi terintegrasi dalam evaluasi umum.
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* ══════════════════════════════════════════════════════════════════
                MODUL 2: KEMAMPUAN BAHASA ASING (OTOMATIS SISTEM - TERKUNCI)
               ══════════════════════════════════════════════════════════════════ */}
            <div className="bg-gradient-to-r from-emerald-50/70 to-teal-50/70 border border-emerald-200 rounded-2xl p-4 sm:p-5 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-emerald-200">
                <div className="flex items-center gap-2">
                  <Languages className="w-4 h-4 text-[#0E4A3E]" />
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-xs font-extrabold text-[#0E4A3E] uppercase tracking-wide">
                        2. Kemampuan Bahasa Asing (Otomatis Sistem)
                      </h4>
                      <span className="text-[10px] font-bold bg-[#0E4A3E] text-white px-2 py-0.5 rounded-full flex items-center gap-1">
                        <Lock className="w-3 h-3" />
                        Terkunci
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500">
                      Nilai ditentukan objektif oleh sistem dari sertifikat tes resmi (TOEFL/IELTS/TOEIC) mahasiswa.
                    </p>
                  </div>
                </div>
                {kriteriaBahasa && (
                  <span className="text-[10px] font-black bg-[#0E4A3E] text-white px-2.5 py-1 rounded-lg shrink-0">
                    Bobot: {kriteriaBahasa.bobot}%
                  </span>
                )}
              </div>

              {/* Isian Mahasiswa & Tampilan Skor Terkunci */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-center">
                <div className="lg:col-span-8 bg-white p-4 rounded-xl border border-slate-200 shadow-2xs space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                      Sertifikat / Isian Mahasiswa (Step 3):
                    </span>
                    <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                      Terverifikasi Sistem
                    </span>
                  </div>
                  <div className="bg-emerald-50/30 p-3 rounded-lg border border-emerald-100">
                    <p className="text-xs font-bold text-slate-800">
                      {parsedActiveDeskripsi.bahasa}
                    </p>
                    {detectedBahasa && detectedBahasa.jenis && (
                      <p className="text-[11px] text-[#0E4A3E] font-semibold mt-1">
                        Jenis Tes: {detectedBahasa.jenis} • Skor: {detectedBahasa.skor ?? '0'} ({detectedBahasa.jenjang?.predikat || 'Terstandarisasi'})
                      </p>
                    )}
                  </div>
                  <p className="text-[10px] text-slate-400 italic">
                    *Pewawancara tidak dapat mengubah nilai bahasa ini secara manual agar standarisasi nilai objektif.
                  </p>
                </div>

                {/* Nilai Terkunci Card */}
                <div className="lg:col-span-4 bg-white p-4 rounded-xl border border-emerald-300 shadow-2xs text-center space-y-1">
                  <span className="text-[11px] font-extrabold text-[#0E4A3E] uppercase tracking-wider block">
                    Nilai Bahasa Otomatis
                  </span>
                  <div className="flex items-baseline justify-center gap-1">
                    <span className="text-3xl font-black text-[#0E4A3E]">
                      {systemScoreBahasa}
                    </span>
                    <span className="text-xs text-slate-400 font-bold">/ 100</span>
                  </div>
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-800 bg-[#C0E6D8] px-2.5 py-0.5 rounded-full border border-emerald-300">
                    <Lock className="w-3 h-3" />
                    Terkunci dari Sistem
                  </span>
                  {kriteriaBahasa && (
                    <p className="text-[10px] text-slate-500 mt-1">
                      Kontribusi: {((systemScoreBahasa * kriteriaBahasa.bobot) / 100).toFixed(2)} poin
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* ══════════════════════════════════════════════════════════════════
                MODUL 3: ESAI MOTIVASI KKN INTERNASIONAL (FORMAT TERSTRUKTUR)
               ══════════════════════════════════════════════════════════════════ */}
            <div className="bg-slate-50/70 border border-slate-200 rounded-2xl p-4 sm:p-5 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-200">
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-[#0E4A3E]" />
                  <div>
                    <h4 className="text-xs font-extrabold text-[#0E4A3E] uppercase tracking-wide">
                      3. Motivasi Mengikuti KKN Internasional & Esai Diri
                    </h4>
                    <p className="text-[11px] text-slate-500">
                      Visi pengabdian, rencana kontribusi program, dan komitmen mahasiswa yang ditulis dalam esai.
                    </p>
                  </div>
                </div>
                {kriteriaMotivasi && (
                  <span className="text-[10px] font-black bg-[#0E4A3E] text-white px-2.5 py-1 rounded-lg shrink-0">
                    Bobot: {kriteriaMotivasi.bobot}%
                  </span>
                )}
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
                {/* Esai Mahasiswa (Rich Text Markdown Preview) */}
                <div className="lg:col-span-8 bg-white p-4 rounded-xl border border-slate-200 shadow-2xs space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                      Isian Esai Mahasiswa (Format Markdown):
                    </span>
                    <span className="text-[10px] text-slate-400">
                      Step 3 • Esai Motivasi
                    </span>
                  </div>
                  <div className="bg-emerald-50/20 p-3.5 rounded-lg border border-emerald-100/60">
                    {renderRichText(parsedActiveDeskripsi.motivasi)}
                  </div>
                </div>

                {/* Form Input Nilai Penguji */}
                <div className="lg:col-span-4 bg-white p-4 rounded-xl border border-emerald-200 shadow-2xs space-y-3">
                  <span className="text-[11px] font-bold text-[#0E4A3E] uppercase tracking-wider block">
                    Nilai Penguji (Skala 0 - 100):
                  </span>
                  {kriteriaMotivasi ? (
                    <div>
                      <input
                        type="number"
                        min="0"
                        max="100"
                        step="1"
                        placeholder="Contoh: 88"
                        value={
                          scores[kriteriaMotivasi.id_kriteria_wawancara] === ''
                            ? ''
                            : scores[kriteriaMotivasi.id_kriteria_wawancara] ?? ''
                        }
                        onChange={(e) => {
                          const valStr = e.target.value;
                          setScores((prev) => ({
                            ...prev,
                            [kriteriaMotivasi.id_kriteria_wawancara]:
                              valStr === '' ? '' : Math.min(100, Math.max(0, parseFloat(valStr) || 0)),
                          }));
                        }}
                        className="w-full px-3 py-2 rounded-xl border border-slate-300 font-black text-center text-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0E4A3E]"
                      />
                      {/* Quick Rating Buttons */}
                      <div className="grid grid-cols-4 gap-1.5 mt-2">
                        {[75, 82, 88, 96].map((val) => (
                          <button
                            key={val}
                            type="button"
                            onClick={() =>
                              setScores((prev) => ({
                                ...prev,
                                [kriteriaMotivasi.id_kriteria_wawancara]: val,
                              }))
                            }
                            className={`py-1 text-[11px] font-bold rounded-lg border cursor-pointer transition-all ${
                              scores[kriteriaMotivasi.id_kriteria_wawancara] === val
                                ? 'bg-[#0E4A3E] text-white border-[#0E4A3E]'
                                : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                            }`}
                          >
                            {val}
                          </button>
                        ))}
                      </div>
                      <p className="text-[10px] text-slate-400 mt-2 text-center">
                        Kontribusi ke nilai akhir: {typeof scores[kriteriaMotivasi.id_kriteria_wawancara] === 'number' ? ((scores[kriteriaMotivasi.id_kriteria_wawancara] as number) * (kriteriaMotivasi.bobot / 100)).toFixed(2) : '0.00'} poin
                      </p>
                    </div>
                  ) : (
                    <p className="text-xs text-slate-400 italic">
                      Kriteria esai terintegrasi dalam evaluasi umum.
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* ══════════════════════════════════════════════════════════════════
                MODUL 4: WAWASAN KEISLAMAN, MODERASI & KOMITMEN (WAWANCARA LANGSUNG)
               ══════════════════════════════════════════════════════════════════ */}
            {kriteriaLainnya.length > 0 && (
              <div className="bg-slate-50/70 border border-slate-200 rounded-2xl p-4 sm:p-5 space-y-4">
                <div className="flex items-center gap-2 pb-3 border-b border-slate-200">
                  <Compass className="w-4 h-4 text-[#0E4A3E]" />
                  <div>
                    <h4 className="text-xs font-extrabold text-[#0E4A3E] uppercase tracking-wide">
                      4. Aspek Penilaian Wawancara Tatap Muka / Langsung
                    </h4>
                    <p className="text-[11px] text-slate-500">
                      Evaluasi kesiapan mental, wawasan keislaman, moderasi beragama, kepribadian, serta komitmen program internasional.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {kriteriaLainnya.map((k, idx) => (
                    <div
                      key={k.id_kriteria_wawancara}
                      className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs space-y-2.5"
                    >
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-bold text-slate-800">
                          {k.nama_kriteria}
                        </label>
                        <span className="text-[10px] font-black bg-emerald-100 text-[#0E4A3E] px-2 py-0.5 rounded-md">
                          Bobot: {k.bobot}%
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          min="0"
                          max="100"
                          step="1"
                          placeholder="0 - 100"
                          value={scores[k.id_kriteria_wawancara] === '' ? '' : scores[k.id_kriteria_wawancara] ?? ''}
                          onChange={(e) => {
                            const valStr = e.target.value;
                            setScores((prev) => ({
                              ...prev,
                              [k.id_kriteria_wawancara]:
                                valStr === '' ? '' : Math.min(100, Math.max(0, parseFloat(valStr) || 0)),
                            }));
                          }}
                          className="w-full px-3 py-2 rounded-xl border border-slate-300 font-black text-center text-base text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0E4A3E]"
                        />
                      </div>
                      {/* Quick Rating Buttons */}
                      <div className="grid grid-cols-4 gap-1.5">
                        {[70, 80, 85, 95].map((val) => (
                          <button
                            key={val}
                            type="button"
                            onClick={() =>
                              setScores((prev) => ({
                                ...prev,
                                [k.id_kriteria_wawancara]: val,
                              }))
                            }
                            className={`py-1 text-[11px] font-bold rounded-lg border cursor-pointer transition-all ${
                              scores[k.id_kriteria_wawancara] === val
                                ? 'bg-[#0E4A3E] text-white border-[#0E4A3E]'
                                : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                            }`}
                          >
                            {val}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ══════════════════════════════════════════════════════════════════
                RINGKASAN TOTAL NILAI & CATATAN WAWANCARA
               ══════════════════════════════════════════════════════════════════ */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center pt-2">
              {/* Mint Green Average Score Card */}
              <div className="bg-[#C0E6D8] border border-[#99d1c1] rounded-2xl p-4 text-center shadow-xs">
                <span className="text-[11px] font-bold text-[#0E4A3E] uppercase tracking-wider block">
                  Total Nilai Wawancara Terbobot
                </span>
                <span className="text-3xl font-black text-[#0E4A3E] block mt-1">
                  {calculatedAverage !== null ? calculatedAverage.toFixed(2) : '-'}
                </span>
                <span className="text-[10px] text-[#0E4A3E]/75 font-semibold">
                  Maksimal Skor 100 Poin
                </span>
              </div>

              {/* Catatan Wawancara */}
              <div className="md:col-span-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                  Catatan Evaluasi Wawancara & Keterangan Tambahan:
                </label>
                <textarea
                  rows={3}
                  value={catatan}
                  onChange={(e) => setCatatan(e.target.value)}
                  placeholder="Tuliskan catatan hasil wawancara, kelebihan, atau rekomendasi untuk peserta ini..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0E4A3E]"
                />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200">
              <button
                type="button"
                onClick={() => setActiveItem(null)}
                className="px-5 py-2 rounded-xl border border-slate-300 text-slate-700 font-bold text-xs hover:bg-slate-100 cursor-pointer"
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={isSaving}
                className="px-6 py-2.5 rounded-xl bg-[#0E4A3E] hover:bg-[#09352c] text-white font-bold text-xs shadow-md cursor-pointer transition-all flex items-center gap-2 disabled:opacity-50"
              >
                {isSaving ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Menyimpan...</span>
                  </>
                ) : (
                  <>
                    <Check className="w-4 h-4" />
                    <span>Simpan Nilai Wawancara</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
