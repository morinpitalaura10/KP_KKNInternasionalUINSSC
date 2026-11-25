'use client';

import React from 'react';
import {
  Calendar,
  Globe2,
  BookOpen,
  GraduationCap,
  FileCheck,
  Clock,
  ShieldCheck,
  Users,
  Info,
  Star,
  Layers,
  CheckCircle2,
  Check,
  Sparkles,
  FileText,
  HardDrive,
} from 'lucide-react';
import { HeroBanner, HeroAsideCard, TimelineStepper } from '@/components/ui';

export interface InformasiRow {
  id_informasi: number;
  id_periode: number | null;
  judul: string;
  isi: string;
  gambar: string | null;
  status: boolean;
  nama_periode: string | null;
}

export interface PeriodeRow {
  id_periode: number;
  nama_periode: string;
  tahun: number;
  tanggal_mulai: string;
  tanggal_selesai: string;
  kuota: number;
  status: string;
}

export interface NegaraRow {
  id_negara: number;
  nama_negara: string;
  status: boolean;
  foto: string;
  deskripsi: string;
  isActiveInCurrentPeriode: boolean;
}

export interface SyaratAkademikData {
  min_ipk: number;
  min_semester: number;
  max_semester: number;
  min_sks: number;
  all_prodi: boolean;
  allowed_prodi_ids: number[];
  catatan: string;
  status: boolean;
  prodiList: { id_prodi: number; nama_prodi: string; fakultas?: { nama_fakultas: string } }[];
}

export interface PersyaratanItem {
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

export interface TimelineStageItem {
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
  is_pelaksanaan?: boolean;
}

export const INFORMASI_TABS = [
  { id: 'tentang', label: 'Tentang Program', icon: Globe2 },
  { id: 'pelaksanaan', label: 'Pelaksanaan', icon: Calendar },
  { id: 'akademik', label: 'Syarat Akademik', icon: GraduationCap },
  { id: 'dokumen', label: 'Berkas Dokumen', icon: FileCheck },
  { id: 'tahapan', label: 'Alur Seleksi', icon: Clock },
];

export interface MahasiswaInformasiViewProps {
  activeTab: string;
  onScrollToSection: (id: string) => void;
  activePeriode: PeriodeRow | null;
  filteredInfo: InformasiRow | null;
  durasiHari: number | null;
  targetStartDate?: string;
  targetEndDate?: string;
  negaraList: NegaraRow[];
  syaratAkademik: SyaratAkademikData | null;
  persyaratanList: PersyaratanItem[];
  checkedIds: number[];
  onToggleCheck: (id: number) => void;
  totalDocs: number;
  checkedCount: number;
  progressPercent: number;
  wajibCount: number;
  timelineStages: TimelineStageItem[];
  selectedStage?: TimelineStageItem;
  onSelectStage: (id: number) => void;
  formatDateID: (dateStr?: string) => string;
  formatFileSize: (kb: number) => string;
}

export default function MahasiswaInformasiView({
  activeTab,
  onScrollToSection,
  activePeriode,
  filteredInfo,
  durasiHari,
  targetStartDate,
  targetEndDate,
  negaraList,
  syaratAkademik,
  persyaratanList,
  checkedIds,
  onToggleCheck,
  totalDocs,
  checkedCount,
  progressPercent,
  wajibCount,
  timelineStages,
  selectedStage,
  onSelectStage,
  formatDateID,
  formatFileSize,
}: MahasiswaInformasiViewProps) {
  return (
    <div className="kkn-page-container font-sans text-slate-800">
      <HeroBanner
        badgeIcon={<Globe2 className="w-3.5 h-3.5 text-[#C0E6D8]" />}
        badgeText="Panduan & Standar Program KKN Internasional"
        title="Informasi & Persyaratan Seleksi"
        description="Pelajari ketentuan umum, standar kelayakan akademik SIAKAD, rincian negara penempatan, serta siapkan seluruh berkas administrasi sebelum melakukan pendaftaran."
        aside={
          activePeriode ? (
            <HeroAsideCard
              label="Periode Pendaftaran Aktif"
              title={activePeriode.nama_periode}
              subtitle={`Tahun Akademik ${activePeriode.tahun}`}
              className="min-w-[240px]"
            />
          ) : undefined
        }
      />

      <div className="sticky -top-4 sm:-top-6 lg:-top-8 z-20 -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8 py-2.5 sm:py-3 bg-slate-50/95 backdrop-blur-md border-b border-slate-200/90 shadow-2xs">
        <div className="max-w-7xl mx-auto w-full overflow-x-auto scrollbar-none py-0.5">
          <nav className="inline-flex items-center gap-1.5 p-1 sm:p-1.5 bg-white rounded-xl sm:rounded-full border border-slate-200/90 shadow-xs min-w-full sm:min-w-0 sm:flex sm:justify-between">
            {INFORMASI_TABS.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;

              return (
                <button
                  key={tab.id}
                  onClick={() => onScrollToSection(tab.id)}
                  className={`inline-flex items-center justify-center gap-2 whitespace-nowrap px-4 py-2 sm:py-2.5 rounded-lg sm:rounded-full text-xs font-bold transition-all shrink-0 sm:flex-1 cursor-pointer ${
                    isActive
                      ? 'bg-[#0E4A3E] text-white shadow-xs'
                      : 'text-slate-600 hover:text-[#0E4A3E] hover:bg-emerald-50/50'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-[#C0E6D8]' : 'text-slate-400'}`} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      <div className="space-y-8">
        <section id="tentang" className="scroll-mt-28">
          <div className="bg-gradient-to-br from-[#EAF5F0] via-white to-[#F2F8F5] rounded-2xl sm:rounded-3xl border border-[#C0E6D8] shadow-xs p-6 sm:p-8 md:p-10 space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#C0E6D8]/60 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#0E4A3E] text-white flex items-center justify-center shrink-0 shadow-xs">
                  <Globe2 className="w-5 h-5 text-[#C0E6D8]" />
                </div>
                <div>
                  <h2 className="text-base sm:text-xl font-bold font-archivo text-[#0E4A3E]">
                    {filteredInfo?.judul || 'Tentang KKN Internasional'}
                  </h2>
                  <p className="text-xs text-slate-600">
                    Visi misi dan tujuan penyelenggaraan pengabdian lintas negara UINSSC
                  </p>
                </div>
              </div>

              {activePeriode && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#0E4A3E] text-[#C0E6D8] border border-[#0E4A3E] text-xs font-bold shadow-2xs">
                  <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                  {activePeriode.nama_periode}
                </span>
              )}
            </div>

            <div className="space-y-6">
              <div className="text-xs sm:text-sm md:text-base text-slate-700 leading-relaxed font-normal whitespace-pre-line bg-white/70 p-4 sm:p-5 rounded-2xl border border-[#C0E6D8]/60 shadow-2xs">
                {filteredInfo?.isi ? (
                  <p>{filteredInfo.isi}</p>
                ) : (
                  <p>
                    Program Kuliah Kerja Nyata (KKN) Internasional Universitas Islam Negeri Siber Syekh Nurjati Cirebon merupakan wadah pengabdian mahasiswa berprestasi di tingkat regional Asia Tenggara. Program ini memadukan pemberdayaan masyarakat berbasis riset, diplomasi Islam moderat, dan penguatan kemitraan internasional antar perguruan tinggi.
                  </p>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-1">
                <div className="bg-white border border-[#C0E6D8] rounded-xl p-4 space-y-1.5 shadow-2xs hover:shadow-xs hover:border-[#568E7D] transition-all">
                  <div className="flex items-center gap-2 text-[#0E4A3E] font-bold text-xs sm:text-sm">
                    <div className="w-6 h-6 rounded-md bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0">
                      <Globe2 className="w-3.5 h-3.5" />
                    </div>
                    <span>Kolaborasi Global</span>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Pengabdian masyarakat lintas negara di kawasan Asia Tenggara bersama perguruan tinggi mitra.
                  </p>
                </div>

                <div className="bg-white border border-[#C0E6D8] rounded-xl p-4 space-y-1.5 shadow-2xs hover:shadow-xs hover:border-[#568E7D] transition-all">
                  <div className="flex items-center gap-2 text-[#0E4A3E] font-bold text-xs sm:text-sm">
                    <div className="w-6 h-6 rounded-md bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0">
                      <BookOpen className="w-3.5 h-3.5" />
                    </div>
                    <span>Riset &amp; Inovasi</span>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Implementasi sains dan riset terapan untuk memecahkan problematika sosial secara langsung.
                  </p>
                </div>

                <div className="bg-white border border-[#C0E6D8] rounded-xl p-4 space-y-1.5 shadow-2xs hover:shadow-xs hover:border-[#568E7D] transition-all">
                  <div className="flex items-center gap-2 text-[#0E4A3E] font-bold text-xs sm:text-sm">
                    <div className="w-6 h-6 rounded-md bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0">
                      <ShieldCheck className="w-3.5 h-3.5" />
                    </div>
                    <span>Diplomasi Budaya</span>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Mempromosikan nilai-nilai Islam moderat, toleransi, dan peradaban Nusantara di kancah global.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="pelaksanaan" className="scroll-mt-28 space-y-4">
          <div className="border-b border-[#C0E6D8] pb-2 flex flex-col sm:flex-row sm:items-center justify-between gap-1">
            <div>
              <h2 className="text-base sm:text-lg font-bold font-archivo text-[#0E4A3E] uppercase tracking-wide">
                Pelaksanaan &amp; Kapasitas Program
              </h2>
              <p className="text-xs text-slate-500">
                Informasi jadwal operasional, negara mitra penempatan, dan kuota delegasi
              </p>
            </div>
            {activePeriode && (
              <span className="text-xs font-semibold text-[#0E4A3E] bg-[#EAF5F0] border border-[#C0E6D8] px-3 py-1 rounded-full self-start sm:self-auto">
                Periode: {activePeriode.nama_periode} ({activePeriode.tahun})
              </span>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-gradient-to-br from-[#EAF5F0] to-white rounded-2xl p-5 sm:p-6 border border-[#C0E6D8] shadow-xs hover:shadow-md transition-all flex flex-col justify-between gap-4 group">
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-xl bg-[#0E4A3E] text-[#C0E6D8] flex items-center justify-center group-hover:scale-105 transition-transform shadow-xs">
                  <Calendar className="w-5 h-5" />
                </div>
                <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-white text-[#0E4A3E] border border-[#C0E6D8]">
                  {durasiHari ? `${durasiHari} Hari Kalender` : 'Resmi LP2M'}
                </span>
              </div>

              <div className="space-y-1">
                <span className="text-xs font-semibold text-slate-600 block">
                  Jadwal Operasional
                </span>
                <p className="text-base sm:text-lg font-archivo font-extrabold text-[#0E4A3E] leading-snug">
                  {targetStartDate && targetEndDate
                    ? `${formatDateID(targetStartDate)} – ${formatDateID(targetEndDate)}`
                    : 'Menunggu Penetapan Periode'}
                </p>
                <p className="text-xs text-slate-600 pt-1 leading-relaxed">
                  {activePeriode
                    ? `${activePeriode.nama_periode} (Tahun Akademik ${activePeriode.tahun})`
                    : 'Jadwal resmi mengikuti pengumuman LP2M.'}
                </p>
              </div>
            </div>

            <div className="bg-gradient-to-br from-[#E6F4F1] to-white rounded-2xl p-5 sm:p-6 border border-[#BDE3DB] shadow-xs hover:shadow-md transition-all flex flex-col justify-between gap-4 group">
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-xl bg-[#0E4A3E] text-cyan-200 flex items-center justify-center group-hover:scale-105 transition-transform shadow-xs">
                  <Globe2 className="w-5 h-5" />
                </div>
                <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-white text-teal-800 border border-[#BDE3DB]">
                  Asia Tenggara
                </span>
              </div>

              <div className="space-y-1">
                <span className="text-xs font-semibold text-slate-600 block">
                  Negara Mitra Penempatan
                </span>
                <p className="text-base sm:text-lg font-archivo font-extrabold text-[#0E4A3E] leading-snug">
                  {negaraList.length > 0
                    ? negaraList.map((n) => n.nama_negara).join(', ')
                    : 'Malaysia, Thailand'}
                </p>
                <p className="text-xs text-slate-600 pt-1 leading-relaxed line-clamp-2">
                  {negaraList.length > 0 && negaraList[0].deskripsi
                    ? negaraList.map((n) => `${n.nama_negara}: ${n.deskripsi}`).join(' | ')
                    : 'Negara mitra penempatan KKN Internasional pada periode aktif saat ini.'}
                </p>
              </div>
            </div>

            <div className="bg-gradient-to-br from-[#EAF7EE] to-white rounded-2xl p-5 sm:p-6 border border-[#C3E8CC] shadow-xs hover:shadow-md transition-all flex flex-col justify-between gap-4 group">
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-xl bg-[#0E4A3E] text-emerald-200 flex items-center justify-center group-hover:scale-105 transition-transform shadow-xs">
                  <Users className="w-5 h-5" />
                </div>
                <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-white text-emerald-800 border border-[#C3E8CC]">
                  Kuota Terpilih
                </span>
              </div>

              <div className="space-y-1">
                <span className="text-xs font-semibold text-slate-600 block">
                  Kapasitas Alokasi Kuota
                </span>
                <p className="text-base sm:text-lg font-archivo font-extrabold text-[#0E4A3E] leading-snug">
                  {activePeriode ? `${activePeriode.kuota} Mahasiswa Delegasi` : '10 Mahasiswa Delegasi'}
                </p>
                <p className="text-xs text-slate-600 pt-1 leading-relaxed">
                  Delegasi resmi yang dinyatakan Lolos Seleksi Berkas dan Wawancara oleh panitia LP2M.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section id="akademik" className="scroll-mt-28 space-y-4">
          <div className="border-b border-[#C0E6D8] pb-2 flex flex-col sm:flex-row sm:items-center justify-between gap-1">
            <div>
              <h2 className="text-base sm:text-lg font-bold font-archivo text-[#0E4A3E] uppercase tracking-wide">
                Kriteria Persyaratan Akademik
              </h2>
              <p className="text-xs text-slate-500">
                Standar kelayakan akademik yang divalidasi langsung secara otomatis dari SIAKAD
              </p>
            </div>
            <span className="inline-flex items-center gap-1.5 text-xs text-[#0E4A3E] font-bold bg-[#EAF5F0] px-3 py-1 rounded-full border border-[#C0E6D8] self-start sm:self-auto">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              Validasi SIAKAD Otomatis
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-gradient-to-br from-white to-[#F2F8F5] rounded-2xl p-5 sm:p-6 border-2 border-[#568E7D]/35 hover:border-[#0E4A3E] shadow-xs hover:shadow-md transition-all flex flex-col justify-between gap-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#0E4A3E] flex items-center gap-1.5 uppercase tracking-wider">
                  <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                  Minimal IPK
                </span>
                <span className="text-[10px] font-bold uppercase px-2.5 py-0.5 rounded-full bg-[#EAF5F0] text-[#0E4A3E] border border-[#C0E6D8]">
                  Skala 4.00
                </span>
              </div>

              <div>
                <span className="text-3xl sm:text-4xl font-archivo font-extrabold text-[#0E4A3E] tracking-tight">
                  ≥ {syaratAkademik ? syaratAkademik.min_ipk.toFixed(2) : '3.50'}
                </span>
                <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                  Wajib memiliki Indeks Prestasi Kumulatif minimal {syaratAkademik ? syaratAkademik.min_ipk.toFixed(2) : '3.50'} dari data resmi SIAKAD UINSSC.
                </p>
              </div>
            </div>

            <div className="bg-gradient-to-br from-white to-[#F2F8F5] rounded-2xl p-5 sm:p-6 border-2 border-[#568E7D]/35 hover:border-[#0E4A3E] shadow-xs hover:shadow-md transition-all flex flex-col justify-between gap-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#0E4A3E] flex items-center gap-1.5 uppercase tracking-wider">
                  <Layers className="w-4 h-4 text-cyan-600" />
                  Jenjang Semester
                </span>
                <span className="text-[10px] font-bold uppercase px-2.5 py-0.5 rounded-full bg-[#EAF5F0] text-[#0E4A3E] border border-[#C0E6D8]">
                  Mahasiswa Aktif
                </span>
              </div>

              <div>
                <span className="text-2xl sm:text-3xl font-archivo font-extrabold text-[#0E4A3E] tracking-tight">
                  Semester {syaratAkademik?.min_semester ?? 6} – {syaratAkademik?.max_semester ?? 7}
                </span>
                <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                  Terbuka khusus mahasiswa program S1 semester {syaratAkademik?.min_semester ?? 6} s/d {syaratAkademik?.max_semester ?? 7} yang telah menempuh minimal {syaratAkademik?.min_sks ?? 120} SKS.
                </p>
              </div>
            </div>

            <div className="bg-gradient-to-br from-white to-[#F2F8F5] rounded-2xl p-5 sm:p-6 border-2 border-[#568E7D]/35 hover:border-[#0E4A3E] shadow-xs hover:shadow-md transition-all flex flex-col justify-between gap-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#0E4A3E] flex items-center gap-1.5 uppercase tracking-wider">
                  <BookOpen className="w-4 h-4 text-emerald-600" />
                  Cakupan Prodi
                </span>
                <span className="text-[10px] font-bold uppercase px-2.5 py-0.5 rounded-full bg-[#EAF5F0] text-[#0E4A3E] border border-[#C0E6D8]">
                  Jenjang S1
                </span>
              </div>

              <div>
                <span className="text-xl sm:text-2xl font-archivo font-extrabold text-[#0E4A3E] tracking-tight">
                  {syaratAkademik?.all_prodi ? 'Semua Jurusan S1' : 'Program Studi Terpilih'}
                </span>
                <p className="text-xs text-slate-600 mt-2 leading-relaxed line-clamp-3">
                  {syaratAkademik?.all_prodi
                    ? 'Seluruh program studi jenjang Sarjana (S1) di lingkungan UINSSC berhak mendaftar.'
                    : syaratAkademik?.prodiList && syaratAkademik.prodiList.length > 0
                    ? syaratAkademik.prodiList
                        .filter((p) => syaratAkademik.allowed_prodi_ids.includes(p.id_prodi))
                        .map((p) => p.nama_prodi)
                        .join(', ')
                    : 'Khusus program studi tertentu yang telah dialokasikan kuota KKN Internasional.'}
                </p>
              </div>
            </div>
          </div>

          {syaratAkademik?.catatan && (
            <div className="p-4 rounded-xl bg-[#EAF5F0] border border-[#C0E6D8] text-xs text-slate-700 leading-relaxed flex items-start gap-2.5">
              <Info className="w-4 h-4 text-[#0E4A3E] shrink-0 mt-0.5" />
              <div>
                <strong className="text-[#0E4A3E]">Catatan Panitia Seleksi: </strong>
                <span>{syaratAkademik.catatan}</span>
              </div>
            </div>
          )}
        </section>

        <section id="dokumen" className="scroll-mt-28 space-y-4">
          <div className="border-b border-[#C0E6D8] pb-2 flex flex-col sm:flex-row sm:items-center justify-between gap-1">
            <div>
              <h2 className="text-base sm:text-lg font-bold font-archivo text-[#0E4A3E] uppercase tracking-wide">
                Dokumen Persyaratan Digital
              </h2>
              <p className="text-xs text-slate-500">
                Tandai dokumen yang telah Anda siapkan untuk memeriksa kesiapan pendaftaran
              </p>
            </div>
            <span className="text-xs font-bold text-[#0E4A3E] bg-[#EAF5F0] px-3 py-1 rounded-full border border-[#C0E6D8] self-start sm:self-auto">
              {wajibCount} Dokumen Wajib
            </span>
          </div>

          {totalDocs > 0 && (
            <div className="bg-gradient-to-r from-[#0E4A3E] to-[#156050] text-white rounded-2xl p-5 shadow-sm space-y-3">
              <div className="flex items-center justify-between text-xs sm:text-sm font-bold">
                <span className="flex items-center gap-2 text-emerald-100">
                  <Sparkles className="w-4 h-4 text-amber-300" />
                  Kesiapan Berkas Anda: <span className="text-[#C0E6D8] font-black">{checkedCount}</span> dari {totalDocs} Dokumen
                </span>
                <span className="text-sm font-black text-[#C0E6D8]">{progressPercent}%</span>
              </div>

              <div className="w-full h-3 bg-black/25 rounded-full overflow-hidden p-0.5 border border-white/20">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    progressPercent === 100
                      ? 'bg-gradient-to-r from-emerald-400 to-teal-300 shadow-sm'
                      : 'bg-[#C0E6D8]'
                  }`}
                  style={{ width: `${progressPercent}%` }}
                />
              </div>

              {progressPercent === 100 ? (
                <p className="text-xs font-bold text-emerald-200 flex items-center gap-1.5 pt-0.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-300" />
                  Hebat! Seluruh berkas Anda sudah lengkap dan siap diunggah pada formulir pendaftaran.
                </p>
              ) : (
                <p className="text-[11px] text-white/80 font-normal">
                  Klik pada kotak dokumen di bawah ini setelah Anda menyiapkan fisiknya.
                </p>
              )}
            </div>
          )}

          <div className="space-y-3">
            {persyaratanList.map((item, idx) => {
              const isChecked = checkedIds.includes(item.id_persyaratan);

              return (
                <div
                  key={item.id_persyaratan}
                  onClick={() => onToggleCheck(item.id_persyaratan)}
                  className={`rounded-2xl p-4 sm:p-5 border transition-all duration-200 cursor-pointer flex flex-col md:flex-row md:items-center justify-between gap-3 group select-none ${
                    isChecked
                      ? 'bg-[#EAF5F0] border-[#C0E6D8] border-l-4 border-l-[#0E4A3E] shadow-xs'
                      : 'bg-white hover:bg-[#F4FAF7] border-slate-200/90 hover:border-[#568E7D] border-l-4 border-l-[#568E7D]/40 shadow-xs'
                  }`}
                >
                  <div className="flex items-start gap-3.5 min-w-0 flex-1">
                    <div className="pt-0.5 shrink-0">
                      {isChecked ? (
                        <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-[#0E4A3E] text-white flex items-center justify-center shadow-xs transition-transform transform scale-105">
                          <Check className="w-4 h-4 stroke-[3]" />
                        </div>
                      ) : (
                        <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl border-2 border-slate-300 group-hover:border-[#0E4A3E] flex items-center justify-center text-slate-400 group-hover:text-[#0E4A3E] transition-colors bg-slate-50">
                          <span className="text-xs font-bold">{String(idx + 1).padStart(2, '0')}</span>
                        </div>
                      )}
                    </div>

                    <div className="min-w-0 flex-1 space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3
                          className={`text-sm sm:text-base font-bold transition-colors leading-snug ${
                            isChecked
                              ? 'text-slate-500 line-through'
                              : 'text-slate-800 group-hover:text-[#0E4A3E]'
                          }`}
                        >
                          {item.nama_persyaratan}
                        </h3>

                        {item.wajib ? (
                          <span className="inline-flex items-center gap-1 bg-red-50 text-red-700 border border-red-200 text-[10px] font-bold px-2.5 py-0.5 rounded-full shrink-0">
                            Wajib
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 bg-slate-100 text-slate-600 text-[10px] font-medium px-2.5 py-0.5 rounded-full shrink-0">
                            Opsional
                          </span>
                        )}

                        {isChecked && (
                          <span className="inline-flex items-center gap-1 bg-[#C0E6D8] text-[#0E4A3E] text-[10px] font-extrabold px-2.5 py-0.5 rounded-full">
                            Sudah Disiapkan
                          </span>
                        )}
                      </div>

                      <p className="text-xs text-slate-600 leading-relaxed font-normal">
                        {item.deskripsi}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 pl-10 md:pl-0 shrink-0">
                    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-xl bg-slate-100 text-slate-700 text-xs font-semibold">
                      <FileText className="w-3.5 h-3.5 text-[#0E4A3E]" />
                      <span>{item.format_file.toUpperCase()}</span>
                    </span>

                    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-xl bg-slate-100 text-slate-700 text-xs font-semibold">
                      <HardDrive className="w-3.5 h-3.5 text-[#0E4A3E]" />
                      <span>Maks. {formatFileSize(item.ukuran_maksimal)}</span>
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        <section id="tahapan" className="scroll-mt-28 space-y-4">
          <div className="border-b border-[#C0E6D8] pb-2 flex flex-col sm:flex-row sm:items-center justify-between gap-1">
            <div>
              <h2 className="text-base sm:text-lg font-bold font-archivo text-[#0E4A3E] uppercase tracking-wide">
                Alur Tahapan Seleksi
              </h2>
              <p className="text-xs text-slate-500">
                Jadwal dan tahapan pendaftaran dari seleksi berkas hingga pengumuman
              </p>
            </div>
            {activePeriode && (
              <span className="text-xs font-semibold text-[#0E4A3E] bg-[#EAF5F0] border border-[#C0E6D8] px-3 py-1 rounded-full">
                Periode: {activePeriode.nama_periode} ({activePeriode.tahun})
              </span>
            )}
          </div>

          <div className="bg-gradient-to-br from-white to-[#F2F8F5] rounded-2xl sm:rounded-3xl p-4 sm:p-7 border border-[#C0E6D8] shadow-xs space-y-6">
            <div className="w-full overflow-hidden">
              <TimelineStepper
                stages={timelineStages}
                selectedStageId={selectedStage?.id_timeline}
                onSelectStage={onSelectStage}
              />
            </div>

            {selectedStage && (
              <div className="bg-gradient-to-br from-[#EAF5F0] via-white to-[#F2F8F5] border border-[#C0E6D8] rounded-2xl p-5 shadow-xs transition-all">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-2">
                  <div className="flex items-center gap-3">
                    <span className="w-7 h-7 rounded-full bg-[#0E4A3E] text-white text-xs font-extrabold flex items-center justify-center shrink-0 shadow-2xs">
                      {selectedStage.urutan}
                    </span>
                    <h4 className="font-extrabold text-sm sm:text-base text-[#0E4A3E]">
                      {selectedStage.nama_tahapan}
                    </h4>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-slate-700 bg-white px-3 py-1 rounded-lg border border-[#C0E6D8] flex items-center gap-1.5 shadow-2xs">
                      <Calendar className="w-3.5 h-3.5 text-[#0E4A3E]" />
                      {selectedStage.tanggal_format}
                    </span>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-extrabold border shadow-2xs ${
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
                  <p className="text-xs sm:text-sm text-slate-700 leading-relaxed mt-2 pl-0 sm:pl-10">
                    {selectedStage.deskripsi}
                  </p>
                )}
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
