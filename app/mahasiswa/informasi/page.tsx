'use client';

import React, { useState, useEffect } from 'react';
import {
  Calendar,
  Globe2,
  BookOpen,
  Award,
  GraduationCap,
  FileCheck,
  Clock,
  Coins,
  ShieldCheck,
  Users,
  Info,
} from 'lucide-react';
import { PageHeader, TimelineStepper } from '@/components/ui';

interface InformasiRow {
  id: number;
  id_informasi: number;
  id_periode: number | null;
  judul: string;
  isi: string;
  gambar: string | null;
  status: boolean;
  nama_periode: string | null;
}

interface PeriodeRow {
  id_periode: number;
  nama_periode: string;
  tahun: number;
  tanggal_mulai: string;
  tanggal_selesai: string;
  kuota: number;
  status: string;
}

interface NegaraRow {
  id_negara: number;
  nama_negara: string;
  status: boolean;
  foto: string;
  deskripsi: string;
  isActiveInCurrentPeriode: boolean;
}

interface SyaratAkademikData {
  min_ipk: number;
  min_semester: number;
  max_semester: number;
  min_sks: number;
  all_prodi: boolean;
  allowed_prodi_ids: number[];
  catatan: string;
  prodiList: { id_prodi: number; nama_prodi: string; fakultas?: { nama_fakultas: string } }[];
}

const TABS = [
  { id: 'tentang',     label: 'Tentang Program'   },
  { id: 'pelaksanaan', label: 'Pelaksanaan'       },
  { id: 'ketentuan',   label: 'Ketentuan Peserta' },
  { id: 'tahapan',     label: 'Tahapan Seleksi'   },
  { id: 'persyaratan', label: 'Persyaratan'       },
];

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

export default function InformasiMahasiswaPage() {
  const [activeTab, setActiveTab] = useState('tentang');
  const [infoList, setInfoList] = useState<InformasiRow[]>([]);
  const [activePeriode, setActivePeriode] = useState<PeriodeRow | null>(null);
  const [negaraList, setNegaraList] = useState<NegaraRow[]>([]);
  const [syaratAkademik, setSyaratAkademik] = useState<SyaratAkademikData | null>(null);
  const [timelineStages, setTimelineStages] = useState<any[]>([]);
  const [isLoadingMain, setIsLoadingMain] = useState(true);

  useEffect(() => {
    async function loadAllFromDB() {
      setIsLoadingMain(true);
      try {
        const [infoRes, perRes, negRes, akadRes, timeRes] = await Promise.all([
          fetch('/api/informasi'),
          fetch('/api/periode'),
          fetch('/api/negara?status=aktif'),
          fetch('/api/persyaratan/akademik'),
          fetch('/api/timeline'),
        ]);

        const [infoJson, perJson, negJson, akadJson, timeJson] = await Promise.all([
          infoRes.json(),
          perRes.json(),
          negRes.json(),
          akadRes.json(),
          timeRes.json(),
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

  // Cari tahapan pelaksanaan KKN dari timeline (prioritas: is_pelaksanaan = true, fallback keyword)
  const pelaksanaanStage =
    timelineStages.find((s) => s.is_pelaksanaan) ||
    timelineStages.find((s) => s.nama_tahapan?.toLowerCase().includes('pelaksanaan')) ||
    null;

  const targetStartDate = pelaksanaanStage?.tanggal_mulai || activePeriode?.tanggal_mulai;
  const targetEndDate = pelaksanaanStage?.tanggal_selesai || activePeriode?.tanggal_selesai;

  // Hitung durasi hari pelaksanaan KKN
  const durasiHari = (() => {
    if (!targetStartDate || !targetEndDate) return null;
    const start = new Date(targetStartDate).getTime();
    const end = new Date(targetEndDate).getTime();
    const diff = Math.round((end - start) / (1000 * 60 * 60 * 24)) + 1;
    return diff > 0 ? diff : null;
  })();

  const allowedProdiNames = (() => {
    if (!syaratAkademik) return 'Semua Program Studi S1';
    if (syaratAkademik.all_prodi) return 'Terbuka untuk seluruh Program Studi S1 aktif';
    const names = syaratAkademik.prodiList
      .filter((p) => syaratAkademik.allowed_prodi_ids.includes(p.id_prodi))
      .map((p) => p.nama_prodi);
    return names.length > 0 ? names.join(', ') : 'Sesuai ketetapan LP2M';
  })();

  // Filter informasi khusus untuk periode yang sedang aktif ATAU informasi umum (Semua Periode / Selalu Aktif)
  const filteredInfoList = activePeriode
    ? infoList.filter((item) => item.status && (!item.id_periode || item.id_periode === activePeriode.id_periode))
    : infoList.filter((item) => item.status);

  return (
    <div className="w-full max-w-7xl space-y-6 pb-12 font-sans">
      {/* ── HEADER TITLE ── */}
      <PageHeader
        title="INFORMASI TENTANG"
        subtitle="KULIAH KERJA NYATA INTERNASIONAL"
        description="Semangat terus untuk pendaftaran KKN Internasionalnya!"
      />

      {/* ── TOP NAV TABS ── */}
      <div className="bg-white rounded-full border border-slate-300 p-1.5 mb-8 shadow-xs flex flex-wrap items-center justify-between gap-1">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => scrollToSection(tab.id)}
            className={`flex-1 min-w-[120px] py-2 px-3 rounded-full text-xs font-bold transition-all text-center cursor-pointer ${
              activeTab === tab.id
                ? 'bg-[#0E4A3E] text-white shadow-sm'
                : 'text-slate-700 hover:bg-slate-100'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* ── SECTION 1: TENTANG PROGRAM (DARI TABEL `informasi` DATABASE) ── */}
      <section id="tentang" className="mb-10 scroll-mt-6">
        <div className="bg-[#C0E6D8] rounded-3xl p-5 sm:p-7 border border-[#9ed4c0] shadow-xs space-y-4">
          {isLoadingMain ? (
            <div className="bg-white rounded-2xl p-6 text-center">
              <div className="w-6 h-6 border-2 border-[#0E4A3E] border-t-transparent rounded-full animate-spin mx-auto mb-2" />
              <p className="text-xs text-slate-500 font-semibold">
                Memuat informasi program dari database...
              </p>
            </div>
          ) : filteredInfoList.length === 0 ? (
            <div className="bg-white rounded-2xl p-6 text-center">
              <Info className="w-8 h-8 text-slate-300 mx-auto mb-2" />
              <p className="text-xs text-slate-500 font-semibold">
                Belum ada artikel informasi aktif yang dipublikasikan untuk {activePeriode?.nama_periode || 'periode aktif saat ini'}.
              </p>
            </div>
          ) : (
            filteredInfoList.map((item, idx) => {
              const IconComp = idx % 3 === 0 ? Globe2 : idx % 3 === 1 ? BookOpen : Award;
              return (
                <div
                  key={item.id_informasi}
                  className="bg-white rounded-2xl p-4 sm:p-5 shadow-xs border border-white/60"
                >
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2 text-[#0E4A3E]">
                      <IconComp className="w-5 h-5 text-[#0E4A3E] shrink-0" />
                      <h3 className="font-bold text-sm sm:text-base text-[#0E4A3E]">
                        {item.judul}
                      </h3>
                    </div>
                    {item.nama_periode ? (
                      <span className="text-[10px] font-bold bg-[#C0E6D8] text-[#0E4A3E] px-2.5 py-0.5 rounded-full shrink-0">
                        {item.nama_periode}
                      </span>
                    ) : (
                      <span className="text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-300 px-2.5 py-0.5 rounded-full shrink-0 flex items-center gap-1">
                        <Globe2 className="w-2.5 h-2.5 text-emerald-600" />
                        Semua Periode (Selalu Aktif)
                      </span>
                    )}
                  </div>
                  <p className="text-xs sm:text-sm text-slate-700 leading-relaxed whitespace-pre-line">
                    {item.isi}
                  </p>
                </div>
              );
            })
          )}
        </div>
      </section>

      {/* ── SECTION 2: PELAKSANAAN KKN INTERNASIONAL (DARI TABEL `periode` & `negara` DATABASE) ── */}
      <section id="pelaksanaan" className="mb-10 scroll-mt-6">
        <div className="text-center mb-5">
          <h2 className="font-extrabold text-[#0E4A3E] text-base sm:text-lg uppercase tracking-wider">
            PELAKSANAAN KKN INTERNASIONAL
          </h2>
          {activePeriode && (
            <p className="text-xs font-semibold text-[#0E4A3E]/75 mt-1">
              Periode Aktif: {activePeriode.nama_periode} ({activePeriode.tahun})
            </p>
          )}
        </div>

        {/* 3 Mint Cards Row from DB */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          {/* Card 1: Jadwal Periode dari Tabel Periode */}
          <div className="bg-[#C0E6D8] rounded-2xl p-5 border border-[#9ed4c0] shadow-xs text-center flex flex-col justify-between">
            <div>
              <div className="w-10 h-10 rounded-full bg-[#0E4A3E] text-white flex items-center justify-center mx-auto mb-3 shadow">
                <Calendar className="w-5 h-5 text-emerald-200" />
              </div>
              <h3 className="font-bold text-sm text-[#0E4A3E] uppercase mb-1">
                Waktu & Periode
              </h3>
              <p className="text-xs font-bold text-slate-800">
                {targetStartDate && targetEndDate
                  ? `${formatDateID(targetStartDate)} – ${formatDateID(targetEndDate)}`
                  : 'Menunggu Penetapan Periode'}
              </p>
              <p className="text-[11px] text-slate-600 mt-1 leading-snug">
                {activePeriode
                  ? `${activePeriode.nama_periode} (${durasiHari ? `${durasiHari} hari kalender` : `Tahun ${activePeriode.tahun}`})`
                  : 'Jadwal mengikuti periode aktif yang ditetapkan Admin LP2M.'}
              </p>
            </div>
          </div>

          {/* Card 2: Negara Tujuan dari Tabel Negara & Periode_Negara */}
          <div className="bg-[#C0E6D8] rounded-2xl p-5 border border-[#9ed4c0] shadow-xs text-center flex flex-col justify-between">
            <div>
              <div className="w-10 h-10 rounded-full bg-[#0E4A3E] text-white flex items-center justify-center mx-auto mb-3 shadow">
                <Globe2 className="w-5 h-5 text-emerald-200" />
              </div>
              <h3 className="font-bold text-sm text-[#0E4A3E] uppercase mb-1">
                Negara & Lokasi Tujuan
              </h3>
              <p className="text-xs font-bold text-slate-800">
                {negaraList.length > 0
                  ? negaraList.map((n) => n.nama_negara).join(', ')
                  : 'Belum ada negara dibuka'}
              </p>
              <p className="text-[11px] text-slate-600 mt-1 leading-snug">
                {negaraList.length > 0 && negaraList[0].deskripsi
                  ? negaraList.map((n) => `${n.nama_negara}: ${n.deskripsi}`).join(' | ')
                  : 'Negara mitra penempatan KKN Internasional pada periode aktif.'}
              </p>
            </div>
          </div>

          {/* Card 3: Kuota Peserta dari Tabel Periode */}
          <div className="bg-[#C0E6D8] rounded-2xl p-5 border border-[#9ed4c0] shadow-xs text-center flex flex-col justify-between">
            <div>
              <div className="w-10 h-10 rounded-full bg-[#0E4A3E] text-white flex items-center justify-center mx-auto mb-3 shadow">
                <Users className="w-5 h-5 text-emerald-200" />
              </div>
              <h3 className="font-bold text-sm text-[#0E4A3E] uppercase mb-1">
                Kuota Delegasi Peserta
              </h3>
              <p className="text-xs font-bold text-slate-800">
                {activePeriode ? `${activePeriode.kuota} Mahasiswa Terpilih` : '-'}
              </p>
              <p className="text-[11px] text-slate-600 mt-1 leading-snug">
                Kuota resmi delegasi mahasiswa yang ditetapkan LP2M pada periode aktif ini.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── SECTION 3: KETENTUAN PESERTA (DARI `/api/persyaratan/akademik` DATABASE) ── */}
      <section id="ketentuan" className="mb-10 scroll-mt-6">
        <div className="text-center mb-5">
          <h2 className="font-extrabold text-[#0E4A3E] text-base sm:text-lg uppercase tracking-wider">
            KETENTUAN PESERTA KKN INTERNASIONAL
          </h2>
          <p className="text-xs font-semibold text-[#0E4A3E]/75 mt-1">
            Berdasarkan Pengaturan Persyaratan Akademik LP2M
          </p>
        </div>

        {/* 4 White Cards in a row from Syarat Akademik DB */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white rounded-2xl p-4 border border-slate-300 shadow-xs flex flex-col justify-between">
            <div>
              <div className="w-8 h-8 rounded-full bg-[#C0E6D8] text-[#0E4A3E] font-black text-xs flex items-center justify-center mb-3">
                01
              </div>
              <h4 className="font-bold text-xs text-[#0E4A3E] uppercase mb-1">
                Semester & Beban SKS
              </h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Mahasiswa aktif S1 terdaftar pada{' '}
                <strong className="text-[#0E4A3E]">
                  Semester {syaratAkademik?.min_semester ?? 6} – {syaratAkademik?.max_semester ?? 8}
                </strong>{' '}
                dan telah menempuh minimal{' '}
                <strong className="text-[#0E4A3E]">{syaratAkademik?.min_sks ?? 100} SKS</strong>.
              </p>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-4 border border-slate-300 shadow-xs flex flex-col justify-between">
            <div>
              <div className="w-8 h-8 rounded-full bg-[#C0E6D8] text-[#0E4A3E] font-black text-xs flex items-center justify-center mb-3">
                02
              </div>
              <h4 className="font-bold text-xs text-[#0E4A3E] uppercase mb-1">
                Indeks Prestasi Kumulatif (IPK)
              </h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Memiliki Indeks Prestasi Kumulatif (IPK) minimal{' '}
                <strong className="text-[#0E4A3E]">
                  {syaratAkademik ? syaratAkademik.min_ipk.toFixed(2) : '3.25'}
                </strong>{' '}
                (skala 4.00) sesuai data SIAKAD.
              </p>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-4 border border-slate-300 shadow-xs flex flex-col justify-between">
            <div>
              <div className="w-8 h-8 rounded-full bg-[#C0E6D8] text-[#0E4A3E] font-black text-xs flex items-center justify-center mb-3">
                03
              </div>
              <h4 className="font-bold text-xs text-[#0E4A3E] uppercase mb-1">
                Program Studi yang Dibuka
              </h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                {allowedProdiNames}.
              </p>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-4 border border-slate-300 shadow-xs flex flex-col justify-between">
            <div>
              <div className="w-8 h-8 rounded-full bg-[#C0E6D8] text-[#0E4A3E] font-black text-xs flex items-center justify-center mb-3">
                04
              </div>
              <h4 className="font-bold text-xs text-[#0E4A3E] uppercase mb-1">
                Catatan & Ketentuan Tambahan
              </h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                {syaratAkademik?.catatan && syaratAkademik.catatan.trim() !== ''
                  ? syaratAkademik.catatan
                  : 'Wajib berstatus Mahasiswa Aktif dan melengkapi seluruh berkas persyaratan wajib.'}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── SECTION 4: TAHAPAN SELEKSI KKN INTERNASIONAL (FROM DATABASE) ── */}
      <TahapanTimelineSection />

      {/* ── SECTION 5: PERSYARATAN KKN INTERNASIONAL (FROM DATABASE) ── */}
      <PersyaratanSection />
    </div>
  );
}

/* ── Tahapan Seleksi Timeline Section Component (fetches from API) ── */
interface TimelineStageItem {
  id: number;
  id_timeline: number;
  id_periode: number;
  nama_periode?: string | null;
  tahun_periode?: number | null;
  nama_tahapan: string;
  tanggal_mulai: string;
  tanggal_selesai: string;
  tanggal_format: string;
  urutan: number;
  deskripsi: string;
  status: boolean;
  status_tahapan: 'Belum Dimulai' | 'Berlangsung' | 'Selesai';
}

function TahapanTimelineSection() {
  const [stages, setStages] = useState<TimelineStageItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeStageId, setActiveStageId] = useState<number | null>(null);

  useEffect(() => {
    fetch('/api/timeline')
      .then((res) => res.json())
      .then((json) => {
        if (json.success && Array.isArray(json.data)) {
          setStages(json.data);
          // Auto select currently active/ongoing stage or first stage
          const ongoing = json.data.find((s: TimelineStageItem) => s.status_tahapan === 'Berlangsung');
          if (ongoing) {
            setActiveStageId(ongoing.id_timeline);
          } else if (json.data.length > 0) {
            setActiveStageId(json.data[0].id_timeline);
          }
        }
      })
      .catch((err) => console.error('Error fetching timeline:', err))
      .finally(() => setIsLoading(false));
  }, []);

  const selectedStage = stages.find((s) => s.id_timeline === activeStageId) || stages[0];

  const periodeLabel = stages.length > 0 && stages[0].nama_periode
    ? `${stages[0].nama_periode}${stages[0].tahun_periode ? ` (${stages[0].tahun_periode})` : ''}`
    : null;

  return (
    <section id="tahapan" className="mb-10 scroll-mt-6">
      <div className="text-center mb-5">
        <h2 className="font-extrabold text-[#0E4A3E] text-base sm:text-lg uppercase tracking-wider">
          TAHAPAN SELEKSI KKN INTERNASIONAL
        </h2>
        {periodeLabel && (
          <p className="text-xs font-semibold text-[#0E4A3E]/75 mt-1">
            Periode Pendaftaran: {periodeLabel}
          </p>
        )}
      </div>

      <div className="bg-white rounded-3xl p-5 sm:p-7 border border-slate-200 shadow-xs space-y-6">
        {isLoading ? (
          <div className="p-8 text-center space-y-2">
            <div className="w-6 h-6 border-2 border-[#0E4A3E] border-t-transparent rounded-full animate-spin mx-auto mb-2" />
            <p className="text-xs text-slate-500 font-semibold">Memuat jadwal tahapan seleksi...</p>
          </div>
        ) : stages.length === 0 ? (
          <div className="p-8 text-center space-y-2">
            <Clock className="w-8 h-8 text-slate-300 mx-auto" />
            <p className="text-xs text-slate-500 font-semibold">Belum ada jadwal tahapan untuk periode aktif saat ini.</p>
          </div>
        ) : (
          <>
            {/* Stepper Timeline Horizontal Bar */}
            <TimelineStepper
              stages={stages}
              selectedStageId={selectedStage?.id_timeline}
              onSelectStage={setActiveStageId}
            />

            {/* Selected / Current Stage Details Box */}
            {selectedStage && (
              <div className="bg-[#E8F5F1] border border-[#a8d5c2] rounded-2xl p-4 sm:p-5 shadow-xs transition-all">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-2">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-[#0E4A3E] text-white text-[11px] font-bold flex items-center justify-center shrink-0">
                      {selectedStage.urutan}
                    </span>
                    <h4 className="font-extrabold text-sm sm:text-base text-[#0E4A3E]">
                      {selectedStage.nama_tahapan}
                    </h4>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-slate-600 bg-white/80 px-2.5 py-1 rounded-lg border border-slate-200 flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-[#0E4A3E]" />
                      {selectedStage.tanggal_format}
                    </span>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-extrabold border shadow-xs ${
                        selectedStage.status_tahapan === 'Berlangsung'
                          ? 'bg-emerald-500 text-white border-emerald-600 animate-pulse'
                          : selectedStage.status_tahapan === 'Selesai'
                          ? 'bg-[#0E4A3E] text-white border-[#0E4A3E]'
                          : 'bg-white text-slate-600 border-slate-300'
                      }`}
                    >
                      {selectedStage.status_tahapan}
                    </span>
                  </div>
                </div>
                {selectedStage.deskripsi && (
                  <p className="text-xs sm:text-sm text-slate-700 leading-relaxed mt-2 pl-8">
                    {selectedStage.deskripsi}
                  </p>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </section>
  );
}

/* ── Persyaratan Section Component (fetches from API) ── */
interface PersyaratanItem {
  id: number;
  id_persyaratan: number;
  nama_persyaratan: string;
  deskripsi: string;
  format_file: string;
  ukuran_maksimal: number;
  wajib: boolean;
  status: boolean;
  nama_periode?: string | null;
  tahun_periode?: number | null;
}

function formatFileSize(kb: number): string {
  if (kb >= 1024) {
    return `${(kb / 1024).toFixed(0)} MB`;
  }
  return `${kb} KB`;
}

function PersyaratanSection() {
  const [items, setItems] = useState<PersyaratanItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetch('/api/persyaratan')
      .then((res) => res.json())
      .then((json) => {
        if (json.success && Array.isArray(json.data)) {
          setItems(json.data);
        }
      })
      .catch((err) => console.error('Error fetching persyaratan:', err))
      .finally(() => setIsLoading(false));
  }, []);

  const periodeLabel = items.length > 0 && items[0].nama_periode
    ? `${items[0].nama_periode}${items[0].tahun_periode ? ` (${items[0].tahun_periode})` : ''}`
    : null;

  return (
    <section id="persyaratan" className="mb-10 scroll-mt-6">
      <div className="text-center mb-5">
        <h2 className="font-extrabold text-[#0E4A3E] text-base sm:text-lg uppercase tracking-wider">
          PERSYARATAN KKN INTERNASIONAL
        </h2>
        {periodeLabel && (
          <p className="text-xs font-semibold text-[#0E4A3E]/75 mt-1">
            Periode Pendaftaran: {periodeLabel}
          </p>
        )}
      </div>

      <div className="bg-[#C0E6D8] rounded-3xl p-5 sm:p-7 border border-[#9ed4c0] shadow-xs space-y-3">
        {isLoading ? (
          <div className="bg-white rounded-2xl p-6 shadow-xs border border-white/60 text-center">
            <div className="w-6 h-6 border-2 border-[#0E4A3E] border-t-transparent rounded-full animate-spin mx-auto mb-2" />
            <p className="text-xs text-slate-500 font-semibold">Memuat data persyaratan...</p>
          </div>
        ) : items.length === 0 ? (
          <div className="bg-white rounded-2xl p-6 shadow-xs border border-white/60 text-center">
            <FileCheck className="w-8 h-8 text-slate-300 mx-auto mb-2" />
            <p className="text-xs text-slate-500 font-semibold">Belum ada data persyaratan untuk periode aktif saat ini.</p>
          </div>
        ) : (
          items.map((item, idx) => (
            <div key={item.id} className="bg-white rounded-2xl p-4 shadow-xs border border-white/60">
              <div className="flex items-start gap-3">
                <div className="w-7 h-7 shrink-0 rounded-full bg-[#0E4A3E] text-white flex items-center justify-center font-bold text-[11px] mt-0.5">
                  {idx + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <h4 className="font-bold text-xs sm:text-sm text-[#0E4A3E]">
                      {item.nama_persyaratan}
                    </h4>
                    {item.wajib ? (
                      <span className="bg-red-50 text-red-700 border border-red-200 text-[9px] font-bold px-1.5 py-0.5 rounded-full">
                        Wajib
                      </span>
                    ) : (
                      <span className="bg-slate-50 text-slate-500 border border-slate-200 text-[9px] font-bold px-1.5 py-0.5 rounded-full">
                        Opsional
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-700 leading-relaxed whitespace-pre-line">
                    {item.deskripsi}
                  </p>
                  <div className="flex flex-wrap gap-2 mt-2">
                    <span className="inline-flex items-center gap-1 bg-emerald-50 border border-emerald-200 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-md">
                      <FileCheck className="w-3 h-3" />
                      {item.format_file}
                    </span>
                    <span className="inline-flex items-center gap-1 bg-blue-50 border border-blue-200 text-blue-800 text-[10px] font-bold px-2 py-0.5 rounded-md">
                      Maks {formatFileSize(item.ukuran_maksimal)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </section>
  );
}
