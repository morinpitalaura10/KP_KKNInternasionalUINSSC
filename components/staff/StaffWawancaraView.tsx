'use client';

import React from 'react';
import {
  RefreshCw,
  AlertCircle,
  CheckCircle2,
  X,
  Award,
  FileText,
  Check,
  Users,
  Languages,
  Compass,
  Lock,
} from 'lucide-react';
import {
  HeroBanner,
  HeroAsideCard,
  SearchFilterBar,
  ResponsiveTableCard,
} from '@/components/ui';

export interface NilaiDetailItem {
  id_nilai_wawancara: number;
  id_kriteria_wawancara: number;
  nama_kriteria: string;
  bobot: number;
  nilai: number;
  catatan: string;
}

export interface WawancaraItem {
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

export interface KriteriaWawancaraItem {
  id_kriteria_wawancara: number;
  id_periode?: number;
  nama_kriteria: string;
  bobot: number;
  nilai_maksimal: number;
}

export interface StaffWawancaraViewProps {
  items: WawancaraItem[];
  periodeList: { id_periode: number; nama_periode: string; tahun: number }[];
  isLoading: boolean;
  search: string;
  onSearchChange: (val: string) => void;
  statusFilter: string;
  onStatusFilterChange: (val: string) => void;
  statusMessage: { type: 'success' | 'error'; text: string } | null;
  onCloseStatusMessage: () => void;
  timelineGuard: {
    isOpen: boolean;
    status: string;
    stageName?: string;
    message?: string;
  } | null;
  formatDate: (dateStr: string | null) => string;
  onOpenInput: (item: WawancaraItem) => void;
  activeItem: WawancaraItem | null;
  onCloseInput: () => void;
  onSaveScore: (e: React.FormEvent) => void;
  isSaving: boolean;
  kriteriaOrganisasi?: KriteriaWawancaraItem;
  kriteriaBahasa?: KriteriaWawancaraItem;
  kriteriaMotivasi?: KriteriaWawancaraItem;
  kriteriaLainnya: KriteriaWawancaraItem[];
  parsedActiveDeskripsi: {
    organisasi: string;
    bahasa: string;
    motivasi: string;
  };
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  detectedBahasa: any;
  systemScoreBahasa: number;
  scores: Record<number, number | ''>;
  onScoreChange: (idKriteria: number, value: number | '') => void;
  calculatedAverage: number | null;
  catatan: string;
  onCatatanChange: (val: string) => void;
  renderRichText: (text: string) => React.ReactNode;
}

const WAWANCARA_STATUS_OPTIONS = [
  { value: 'all', label: 'Semua Status' },
  { value: 'Dinilai', label: 'Sudah Dinilai' },
  { value: 'Belum Dinilai', label: 'Belum Dinilai' },
];

export default function StaffWawancaraView({
  items,
  periodeList,
  isLoading,
  search,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
  statusMessage,
  onCloseStatusMessage,
  timelineGuard,
  formatDate,
  onOpenInput,
  activeItem,
  onCloseInput,
  onSaveScore,
  isSaving,
  kriteriaOrganisasi,
  kriteriaBahasa,
  kriteriaMotivasi,
  kriteriaLainnya,
  parsedActiveDeskripsi,
  detectedBahasa,
  systemScoreBahasa,
  scores,
  onScoreChange,
  calculatedAverage,
  catatan,
  onCatatanChange,
  renderRichText,
}: StaffWawancaraViewProps) {
  return (
    <div className="kkn-page-container font-sans">
      <HeroBanner
        badgeIcon={<Award className="w-3.5 h-3.5 text-[#C0E6D8]" />}
        badgeText="Evaluasi & Penilaian Wawancara"
        title="NILAI WAWANCARA"
        description="Input dan kelola penilaian wawancara, rubrik bahasa, riwayat organisasi, serta esai mahasiswa."
        aside={
          periodeList.length > 0 ? (
            <HeroAsideCard
              label="Periode Pendaftaran Aktif"
              title={`${periodeList[0].nama_periode} (${periodeList[0].tahun})`}
              showPulse={false}
            />
          ) : undefined
        }
      />

      <SearchFilterBar
        searchValue={search}
        onSearchChange={onSearchChange}
        searchPlaceholder="Cari data pendaftar (Nama / NIM) disini..."
        selectValue={statusFilter}
        onSelectChange={onStatusFilterChange}
        selectOptions={WAWANCARA_STATUS_OPTIONS}
        selectMinWidth="min-w-[170px]"
      />

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
            onClick={onCloseStatusMessage}
            className="p-1 hover:bg-black/5 rounded-md text-slate-500 hover:text-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {timelineGuard && !timelineGuard.isOpen && (
        <div className="bg-gradient-to-r from-amber-50 via-orange-50 to-amber-50 border border-amber-300 rounded-2xl p-4 sm:p-5 flex items-start gap-3.5 shadow-xs animate-in fade-in slide-in-from-top-2">
          <div className="w-9 h-9 rounded-xl bg-amber-100 border border-amber-300 flex items-center justify-center shrink-0 text-amber-800 shadow-2xs mt-0.5">
            <Lock className="w-5 h-5 text-amber-800" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h4 className="text-xs font-black uppercase text-amber-950 tracking-wider">
                Tahapan Wawancara Belum Dibuka
              </h4>
              <span className="text-[10px] font-bold px-2 py-0.5 bg-amber-200/80 text-amber-900 rounded-full border border-amber-300/80">
                🔒 Mode Hanya Baca (Penilaian Terkunci)
              </span>
            </div>
            <p className="text-xs text-amber-900/90 mt-1 font-medium leading-relaxed">
              {timelineGuard.message}
            </p>
            <p className="text-[11px] text-amber-800/80 mt-1">
              Anda tetap dapat meninjau data profil dan esai peserta, namun formulir pengisian nilai wawancara dinonaktifkan hingga sesi wawancara resmi dimulai.
            </p>
          </div>
        </div>
      )}

      <ResponsiveTableCard
        isLoading={isLoading}
        loadingText="Memuat data wawancara..."
        isEmpty={items.length === 0}
        emptyContent="Tidak ada peserta wawancara yang sesuai dengan filter yang dipilih."
        minWidthClass="min-w-[760px]"
        thead={
          <tr>
            <th className="kkn-table-th px-3 text-center w-12">No</th>
            <th className="kkn-table-th min-w-[200px]">NIM / Nama Mahasiswa</th>
            <th className="kkn-table-th min-w-[180px]">Fakultas / Program Studi</th>
            <th className="kkn-table-th min-w-[180px]">Jadwal &amp; Nilai Rata-rata</th>
            <th className="kkn-table-th text-center min-w-[130px]">Status</th>
            <th className="kkn-table-th text-center min-w-[100px]">Aksi</th>
          </tr>
        }
        tbody={items.map((item, idx) => (
          <tr key={item.id_wawancara} className="hover:bg-slate-50 transition-colors">
            <td className="kkn-table-td px-3 text-center font-bold text-slate-500 whitespace-nowrap">
              {idx + 1}
            </td>
            <td className="kkn-table-td">
              <p className="font-bold text-slate-800 leading-snug">{item.nama}</p>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-[11px] text-slate-500 font-mono">NIM: {item.nim}</span>
                {item.nama_periode && (
                  <span className="text-[10px] font-semibold bg-emerald-50 text-[#0E4A3E] px-2 py-0.2 rounded border border-emerald-200 whitespace-nowrap">
                    {item.nama_periode}
                  </span>
                )}
              </div>
            </td>
            <td className="kkn-table-td">
              <p className="font-semibold text-slate-800">{item.nama_prodi}</p>
              <span className="kkn-badge-fakultas">{item.nama_fakultas}</span>
            </td>
            <td className="kkn-table-td">
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
                  <p className="text-[11px] text-slate-400 whitespace-nowrap">
                    Jadwal: {formatDate(item.tanggal_wawancara)}
                  </p>
                </div>
              )}
            </td>
            <td className="kkn-table-td text-center whitespace-nowrap">
              {item.is_dinilai ? (
                <span className="inline-block bg-[#C0E6D8] text-[#0E4A3E] border border-emerald-300 font-bold text-[11px] px-3 py-1 rounded-full shadow-2xs whitespace-nowrap">
                  Sudah Dinilai
                </span>
              ) : (
                <span className="inline-block bg-amber-100 text-amber-800 border border-amber-300 font-bold text-[11px] px-3 py-1 rounded-full shadow-2xs whitespace-nowrap">
                  Belum Dinilai
                </span>
              )}
            </td>
            <td className="kkn-table-td text-center whitespace-nowrap">
              <button
                onClick={() => onOpenInput(item)}
                className="kkn-btn-table-action shadow-xs"
              >
                {item.is_dinilai ? 'Edit Nilai' : 'Beri Nilai'}
              </button>
            </td>
          </tr>
        ))}
        footer={
          <>
            <div>Menampilkan {items.length} peserta wawancara</div>
            <div className="flex items-center gap-1.5">
              <span className="w-8 h-8 rounded-lg bg-[#0E4A3E] text-white flex items-center justify-center font-bold text-xs shadow-xs">
                1
              </span>
            </div>
          </>
        }
      />

      {activeItem && (
        <div
          id="input-nilai-panel"
          className="bg-white rounded-3xl border-2 border-[#0E4A3E]/30 shadow-xl p-5 sm:p-7 space-y-6 animate-in fade-in duration-200 scroll-mt-6"
        >
          <div className="flex items-center justify-between pb-4 border-b border-slate-200">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-[#0E4A3E] bg-[#C0E6D8] px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                  Panel Evaluasi &amp; Penilaian Wawancara
                </span>
                {activeItem.nama_periode && (
                  <span className="text-xs font-semibold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md">
                    {activeItem.nama_periode}
                  </span>
                )}
              </div>
              <h3 className="text-lg font-black text-[#0E4A3E] mt-1">{activeItem.nama}</h3>
              <p className="text-xs text-slate-500 mt-0.5">
                NIM: {activeItem.nim} • {activeItem.nama_prodi} ({activeItem.nama_fakultas})
              </p>
            </div>
            <button
              onClick={onCloseInput}
              className="p-2 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-slate-700 cursor-pointer transition-colors"
              title="Tutup panel"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <p className="text-xs text-slate-600">
            Tinjau isian formulir pendaftaran mahasiswa (Step 3: Data Pendukung &amp; Esai), kemudian berikan penilaian pada masing-masing indikator kriteria di bawah ini:
          </p>

          {timelineGuard && !timelineGuard.isOpen && (
            <div className="p-3.5 bg-amber-100 border border-amber-300 rounded-xl text-amber-950 flex items-center gap-2.5 text-xs font-semibold">
              <Lock className="w-4 h-4 text-amber-800 shrink-0" />
              <span>
                <strong>Mode Hanya Baca:</strong> {timelineGuard.message} Formulir pengisian dan penyimpanan nilai dinonaktifkan.
              </span>
            </div>
          )}

          <form onSubmit={onSaveScore} className="space-y-6">
            <div className="bg-slate-50/70 border border-slate-200 rounded-2xl p-4 sm:p-5 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-200">
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-[#0E4A3E]" />
                  <div>
                    <h4 className="text-xs font-extrabold text-[#0E4A3E] uppercase tracking-wide">
                      1. Pengalaman Organisasi / Kepanitiaan &amp; Kepemimpinan
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
                <div className="lg:col-span-8 bg-white p-4 rounded-xl border border-slate-200 shadow-2xs space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                      Isian Mahasiswa (Formulir Pendaftaran):
                    </span>
                    <span className="text-[10px] text-slate-400">Step 3 • Data Pendukung</span>
                  </div>
                  <div className="bg-slate-50/80 p-3 rounded-lg border border-slate-100">
                    {renderRichText(parsedActiveDeskripsi.organisasi)}
                  </div>
                </div>

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
                          onScoreChange(
                            kriteriaOrganisasi.id_kriteria_wawancara,
                            valStr === '' ? '' : Math.min(100, Math.max(0, parseFloat(valStr) || 0))
                          );
                        }}
                        className="w-full px-3 py-2 rounded-xl border border-slate-300 font-black text-center text-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0E4A3E]"
                      />
                      <div className="grid grid-cols-4 gap-1.5 mt-2">
                        {[70, 80, 88, 95].map((val) => (
                          <button
                            key={val}
                            type="button"
                            onClick={() => onScoreChange(kriteriaOrganisasi.id_kriteria_wawancara, val)}
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
                        Kontribusi ke nilai akhir:{' '}
                        {typeof scores[kriteriaOrganisasi.id_kriteria_wawancara] === 'number'
                          ? ((scores[kriteriaOrganisasi.id_kriteria_wawancara] as number) * (kriteriaOrganisasi.bobot / 100)).toFixed(2)
                          : '0.00'}{' '}
                        poin
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
                    <p className="text-xs font-bold text-slate-800">{parsedActiveDeskripsi.bahasa}</p>
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

                <div className="lg:col-span-4 bg-white p-4 rounded-xl border border-emerald-300 shadow-2xs text-center space-y-1">
                  <span className="text-[11px] font-extrabold text-[#0E4A3E] uppercase tracking-wider block">
                    Nilai Bahasa Otomatis
                  </span>
                  <div className="flex items-baseline justify-center gap-1">
                    <span className="text-3xl font-black text-[#0E4A3E]">{systemScoreBahasa}</span>
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

            <div className="bg-slate-50/70 border border-slate-200 rounded-2xl p-4 sm:p-5 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-200">
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-[#0E4A3E]" />
                  <div>
                    <h4 className="text-xs font-extrabold text-[#0E4A3E] uppercase tracking-wide">
                      3. Motivasi Mengikuti KKN Internasional &amp; Esai Diri
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
                <div className="lg:col-span-8 bg-white p-4 rounded-xl border border-slate-200 shadow-2xs space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                      Isian Esai Mahasiswa (Format Markdown):
                    </span>
                    <span className="text-[10px] text-slate-400">Step 3 • Esai Motivasi</span>
                  </div>
                  <div className="bg-emerald-50/20 p-3.5 rounded-lg border border-emerald-100/60">
                    {renderRichText(parsedActiveDeskripsi.motivasi)}
                  </div>
                </div>

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
                          onScoreChange(
                            kriteriaMotivasi.id_kriteria_wawancara,
                            valStr === '' ? '' : Math.min(100, Math.max(0, parseFloat(valStr) || 0))
                          );
                        }}
                        className="w-full px-3 py-2 rounded-xl border border-slate-300 font-black text-center text-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0E4A3E]"
                      />
                      <div className="grid grid-cols-4 gap-1.5 mt-2">
                        {[75, 82, 88, 96].map((val) => (
                          <button
                            key={val}
                            type="button"
                            onClick={() => onScoreChange(kriteriaMotivasi.id_kriteria_wawancara, val)}
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
                        Kontribusi ke nilai akhir:{' '}
                        {typeof scores[kriteriaMotivasi.id_kriteria_wawancara] === 'number'
                          ? ((scores[kriteriaMotivasi.id_kriteria_wawancara] as number) * (kriteriaMotivasi.bobot / 100)).toFixed(2)
                          : '0.00'}{' '}
                        poin
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
                  {kriteriaLainnya.map((k) => (
                    <div
                      key={k.id_kriteria_wawancara}
                      className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs space-y-2.5"
                    >
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-bold text-slate-800">{k.nama_kriteria}</label>
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
                            onScoreChange(
                              k.id_kriteria_wawancara,
                              valStr === '' ? '' : Math.min(100, Math.max(0, parseFloat(valStr) || 0))
                            );
                          }}
                          className="w-full px-3 py-2 rounded-xl border border-slate-300 font-black text-center text-base text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0E4A3E]"
                        />
                      </div>
                      <div className="grid grid-cols-4 gap-1.5">
                        {[70, 80, 85, 95].map((val) => (
                          <button
                            key={val}
                            type="button"
                            onClick={() => onScoreChange(k.id_kriteria_wawancara, val)}
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

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center pt-2">
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

              <div className="md:col-span-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                  Catatan Evaluasi Wawancara &amp; Keterangan Tambahan:
                </label>
                <textarea
                  rows={3}
                  value={catatan}
                  onChange={(e) => onCatatanChange(e.target.value)}
                  placeholder="Tuliskan catatan hasil wawancara, kelebihan, atau rekomendasi untuk peserta ini..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0E4A3E]"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200">
              <button
                type="button"
                onClick={onCloseInput}
                className="px-5 py-2 rounded-xl border border-slate-300 text-slate-700 font-bold text-xs hover:bg-slate-100 cursor-pointer"
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={isSaving || (timelineGuard !== null && !timelineGuard.isOpen)}
                className="px-6 py-2.5 rounded-xl bg-[#0E4A3E] hover:bg-[#09352c] text-white font-bold text-xs shadow-md cursor-pointer transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {timelineGuard && !timelineGuard.isOpen ? (
                  <>
                    <Lock className="w-4 h-4 text-amber-300" />
                    <span>Penilaian Terkunci (Belum Jadwalnya)</span>
                  </>
                ) : isSaving ? (
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
