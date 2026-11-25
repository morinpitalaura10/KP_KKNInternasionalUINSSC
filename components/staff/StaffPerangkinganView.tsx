'use client';

import React from 'react';
import {
  SlidersHorizontal,
  X,
  Calculator,
  Award,
} from 'lucide-react';
import {
  HeroBanner,
  HeroAsideCard,
  SearchFilterBar,
  ResponsiveTableCard,
} from '@/components/ui';

export interface PerangkinganItem {
  id_hasil: number;
  id_pendaftaran: number;
  ranking_akhir: number;
  ranking_awal: number;
  nim: string;
  nama: string;
  nama_fakultas: string;
  nama_prodi: string;
  ipk: number | null;
  nilai_substansi: number;
  nilai_wawancara: number;
  bobot_substansi: number;
  bobot_wawancara: number;
  nilai_akhir: number;
  status: string;
  status_label: string;
  catatan: string;
  hasRekomendasiDekan?: boolean;
  nama_periode: string;
  id_periode: number | null;
}

export interface KriteriaInfo {
  id_kriteria: number;
  nama_kriteria: string;
  bobot: number;
  nilai_maksimal: number;
  jenis: string;
  metode_nilai: string;
  status: boolean;
}

export interface PeriodeItem {
  id_periode: number;
  nama_periode: string;
  tahun: number;
  status: string;
  kuota: number;
}

export interface SawRow {
  id_hasil: number;
  nim: string;
  nama: string;
  fakultas: string;
  xSubstansi: number;
  xWawancara: number;
  rSubstansi: number;
  rWawancara: number;
  vPreference: number;
  ranking_akhir: number;
}

export interface SawCalculation {
  maxSubstansi: number;
  maxWawancara: number;
  wSubstansi: number;
  wWawancara: number;
  rows: SawRow[];
}

export interface StaffPerangkinganViewProps {
  items: PerangkinganItem[];
  filteredItems: PerangkinganItem[];
  kriteriaList: KriteriaInfo[];
  periodes: PeriodeItem[];
  activePeriodeObj?: PeriodeItem;
  bobotSubstansi: number;
  bobotWawancara: number;
  isLoading: boolean;
  search: string;
  onSearchChange: (val: string) => void;
  fakultasFilter: string;
  onFakultasFilterChange: (val: string) => void;
  fakultasList: string[];
  selectedDetail: PerangkinganItem | null;
  onSelectDetail: (item: PerangkinganItem | null) => void;
  isKriteriaModalOpen: boolean;
  onSetKriteriaModalOpen: (open: boolean) => void;
  isSawModalOpen: boolean;
  onSetSawModalOpen: (open: boolean) => void;
  sawTab: 'keputusan' | 'normalisasi' | 'preferensi';
  onSetSawTab: (tab: 'keputusan' | 'normalisasi' | 'preferensi') => void;
  sawCalculation: SawCalculation | null;
}

export default function StaffPerangkinganView({
  items,
  filteredItems,
  kriteriaList,
  periodes,
  activePeriodeObj,
  bobotSubstansi,
  bobotWawancara,
  isLoading,
  search,
  onSearchChange,
  fakultasFilter,
  onFakultasFilterChange,
  fakultasList,
  selectedDetail,
  onSelectDetail,
  isKriteriaModalOpen,
  onSetKriteriaModalOpen,
  isSawModalOpen,
  onSetSawModalOpen,
  sawTab,
  onSetSawTab,
  sawCalculation,
}: StaffPerangkinganViewProps) {
  return (
    <div className="kkn-page-container font-sans">
      <HeroBanner
        badgeIcon={<Calculator className="w-3.5 h-3.5 text-[#C0E6D8]" />}
        badgeText="Sistem Pendukung Keputusan (SPK - SAW)"
        title="HASIL PERANGKINGAN"
        description="Perhitungan skor komponen (Substansi & Wawancara), normalisasi matriks SAW, dan urutan peringkat peserta berdasarkan bobot dari Admin LP2M."
        aside={
          periodes.length > 0 ? (
            <HeroAsideCard
              label="Periode Seleksi Aktif"
              title={`${periodes[0].nama_periode} (${periodes[0].tahun})`}
              showPulse={false}
            />
          ) : undefined
        }
        action={
          <button
            type="button"
            onClick={() => onSetSawModalOpen(true)}
            className="kkn-hero-action-btn shadow-xs self-start sm:self-auto"
          >
            <Calculator className="w-4 h-4 text-[#C0E6D8]" />
            <span>Matriks Perhitungan SAW</span>
          </button>
        }
      />

      <div className="bg-[#C0E6D8] border border-[#99d1c1] rounded-2xl p-5 sm:p-6 shadow-2xs">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
          <div className="space-y-2">
            <div>
              <span className="text-[11px] font-bold text-[#0E4A3E]/80 uppercase tracking-wider block">
                Periode Seleksi Aktif
              </span>
              <h3 className="text-base sm:text-lg font-black text-[#0E4A3E]">
                {activePeriodeObj
                  ? `${activePeriodeObj.nama_periode} (${activePeriodeObj.tahun})`
                  : 'KKN Internasional'}
              </h3>
            </div>

            <div className="flex flex-wrap items-center gap-2 text-xs">
              <span className="font-bold text-[#0E4A3E] flex items-center gap-1">
                <Award className="w-3.5 h-3.5" />
                Formula SPK Admin:
              </span>
              <span className="bg-[#0E4A3E] text-white px-2.5 py-0.5 rounded-md font-extrabold text-[11px]">
                Substansi &amp; Akademik ({bobotSubstansi}%) + Wawancara ({bobotWawancara}%) = 100%
              </span>
            </div>

            {kriteriaList.length > 0 && (
              <div className="flex flex-wrap items-center gap-1.5 text-xs text-slate-700 pt-0.5">
                <span className="font-bold text-[#0E4A3E]">Kriteria Penilaian:</span>
                {kriteriaList.map((k) => (
                  <span
                    key={k.id_kriteria}
                    className="bg-white/80 border border-[#99d1c1] px-2 py-0.5 rounded-md font-semibold text-[11px] text-[#0E4A3E]"
                  >
                    {k.nama_kriteria} ({k.bobot}%)
                  </span>
                ))}
              </div>
            )}
          </div>

          <button
            type="button"
            onClick={() => onSetKriteriaModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-white text-[#0E4A3E] border border-[#99d1c1] rounded-xl text-xs font-bold hover:bg-emerald-50 transition-all shadow-2xs shrink-0 cursor-pointer"
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span>Lihat Detail Kriteria &amp; Bobot</span>
          </button>
        </div>
      </div>

      <SearchFilterBar
        searchValue={search}
        onSearchChange={onSearchChange}
        searchPlaceholder="Cari nama atau NIM peserta..."
        selectValue={fakultasFilter}
        onSelectChange={onFakultasFilterChange}
        selectOptions={fakultasList.map((f) => ({ value: f, label: f }))}
        selectMinWidth="min-w-[190px]"
      />

      <ResponsiveTableCard
        isLoading={isLoading}
        loadingText="Memuat perhitungan perangkingan..."
        isEmpty={filteredItems.length === 0}
        emptyContent="Tidak ada data perangkingan yang sesuai."
        minWidthClass="min-w-[780px]"
        thead={
          <tr>
            <th className="kkn-table-th px-3 text-center w-14">Rank</th>
            <th className="kkn-table-th min-w-[190px]">NIM / Nama Mahasiswa</th>
            <th className="kkn-table-th min-w-[160px]">Fakultas / Prodi</th>
            <th className="kkn-table-th px-3 text-center w-16">IPK</th>
            <th className="kkn-table-th px-3 text-center min-w-[110px]">Substansi ({bobotSubstansi}%)</th>
            <th className="kkn-table-th px-3 text-center min-w-[110px]">Wawancara ({bobotWawancara}%)</th>
            <th className="kkn-table-th text-center min-w-[130px]">Skor Akhir / V(i)</th>
            <th className="kkn-table-th px-3 text-center w-20">Aksi</th>
          </tr>
        }
        tbody={filteredItems.map((item) => {
          const sawRow = sawCalculation?.rows.find((r) => r.id_hasil === item.id_hasil);
          const kontribusiSubstansi = ((item.nilai_substansi * bobotSubstansi) / 100).toFixed(2);
          const kontribusiWawancara = ((item.nilai_wawancara * bobotWawancara) / 100).toFixed(2);

          return (
            <tr key={item.id_hasil} className="hover:bg-slate-50 transition-colors">
              <td className="kkn-table-td px-3 text-center whitespace-nowrap">
                <span
                  className={`w-8 h-8 mx-auto rounded-xl flex items-center justify-center font-black text-xs shadow-2xs ${
                    item.ranking_akhir === 1
                      ? 'bg-amber-400 text-amber-950'
                      : item.ranking_akhir === 2
                      ? 'bg-slate-300 text-slate-800'
                      : item.ranking_akhir === 3
                      ? 'bg-amber-600/30 text-amber-900 border border-amber-400'
                      : 'bg-slate-100 text-slate-700'
                  }`}
                >
                  #{item.ranking_akhir}
                </span>
              </td>
              <td className="kkn-table-td">
                <p className="font-bold text-slate-800 leading-snug">{item.nama}</p>
                <p className="text-[11px] text-slate-500 font-mono mt-0.5">NIM: {item.nim}</p>
              </td>
              <td className="kkn-table-td">
                <p className="font-semibold text-slate-800 text-xs">{item.nama_prodi}</p>
                <span className="kkn-badge-fakultas">{item.nama_fakultas}</span>
              </td>
              <td className="kkn-table-td px-3 text-center font-bold text-slate-700 whitespace-nowrap">
                {item.ipk !== null && item.ipk !== undefined ? item.ipk.toFixed(2) : '-'}
              </td>
              <td className="kkn-table-td px-3 text-center whitespace-nowrap">
                <span className="font-bold text-slate-800">{item.nilai_substansi}</span>
                <span className="text-[10px] text-slate-400 block">({kontribusiSubstansi})</span>
              </td>
              <td className="kkn-table-td px-3 text-center whitespace-nowrap">
                <span className="font-bold text-slate-800">{item.nilai_wawancara}</span>
                <span className="text-[10px] text-slate-400 block">({kontribusiWawancara})</span>
              </td>
              <td className="kkn-table-td text-center whitespace-nowrap">
                <span className="text-base font-extrabold text-[#0E4A3E]">
                  {item.nilai_akhir.toFixed(2)}
                </span>
                {sawRow && (
                  <span className="text-[10px] text-emerald-700 font-semibold block">
                    Preferensi SAW: {sawRow.vPreference.toFixed(4)}
                  </span>
                )}
              </td>
              <td className="kkn-table-td px-3 text-center whitespace-nowrap">
                <button
                  onClick={() => onSelectDetail(item)}
                  className="kkn-btn-table-action shadow-xs"
                >
                  Rincian
                </button>
              </td>
            </tr>
          );
        })}
        footer={
          <>
            <div>
              Menampilkan 1–{filteredItems.length} dari {items.length} peserta terperangking
            </div>
            <div className="text-[11px] font-semibold text-slate-500">
              Diurutkan berdasarkan Skor Akhir tertinggi (#1 – #{items.length})
            </div>
          </>
        }
      />

      {selectedDetail && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="font-extrabold text-base text-[#0E4A3E] uppercase">
                Rincian Perhitungan Skor Peserta
              </h3>
              <button
                onClick={() => onSelectDetail(null)}
                className="text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 bg-slate-50 rounded-xl">
                <p className="font-bold text-sm text-slate-800">{selectedDetail.nama}</p>
                <p className="text-slate-500">
                  NIM: {selectedDetail.nim} • {selectedDetail.nama_prodi} ({selectedDetail.nama_fakultas})
                </p>
                {selectedDetail.ipk !== null && (
                  <p className="text-slate-600 font-semibold mt-1">
                    IPK Akademik: {selectedDetail.ipk.toFixed(2)} / 4.00
                  </p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-2 text-center">
                <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200">
                  <span className="text-slate-400 font-bold block">Peringkat SPK</span>
                  <span className="text-lg font-black text-[#0E4A3E]">
                    #{selectedDetail.ranking_akhir}
                  </span>
                </div>
                <div className="p-2.5 bg-[#C0E6D8]/50 rounded-lg border border-[#99d1c1]">
                  <span className="text-[#0E4A3E]/70 font-bold block">Skor Terbobot</span>
                  <span className="text-lg font-black text-[#0E4A3E]">
                    {selectedDetail.nilai_akhir.toFixed(2)}
                  </span>
                </div>
              </div>

              <div className="space-y-1.5 pt-1">
                <p className="font-bold text-slate-700 uppercase text-[11px]">
                  Komponen Perhitungan (Sesuai Bobot Admin):
                </p>
                <div className="flex justify-between py-1.5 border-b border-slate-100">
                  <span className="text-slate-600">
                    1. Nilai Substansi &amp; Akademik ({bobotSubstansi}%)
                  </span>
                  <span className="font-bold text-slate-800">
                    {selectedDetail.nilai_substansi} × {bobotSubstansi}% ={' '}
                    {((selectedDetail.nilai_substansi * bobotSubstansi) / 100).toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-slate-100">
                  <span className="text-slate-600">
                    2. Nilai Wawancara ({bobotWawancara}%)
                  </span>
                  <span className="font-bold text-slate-800">
                    {selectedDetail.nilai_wawancara} × {bobotWawancara}% ={' '}
                    {((selectedDetail.nilai_wawancara * bobotWawancara) / 100).toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between py-1.5 font-extrabold text-sm text-[#0E4A3E]">
                  <span>Total Nilai Terbobot</span>
                  <span>{selectedDetail.nilai_akhir.toFixed(2)} / 100</span>
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-3">
              <button
                onClick={() => onSelectDetail(null)}
                className="px-5 py-2 rounded-xl bg-slate-200 text-slate-700 font-bold text-xs hover:bg-slate-300 cursor-pointer"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {isKriteriaModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full p-6 border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <div>
                <h3 className="font-extrabold text-base text-[#0E4A3E] uppercase">
                  Daftar Kriteria &amp; Bobot Penilaian (Admin LP2M)
                </h3>
                <p className="text-xs text-slate-500">
                  Konfigurasi kriteria aktif yang ditetapkan oleh Admin LP2M pada periode ini.
                </p>
              </div>
              <button
                onClick={() => onSetKriteriaModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-3.5 bg-[#DDF2E8] border border-[#99d1c1] rounded-xl flex items-center justify-between text-xs">
              <span className="font-bold text-[#0E4A3E]">Formula Kalkulasi Akhir (SPK):</span>
              <span className="font-black text-[#0E4A3E]">
                {bobotSubstansi}% Nilai Substansi + {bobotWawancara}% Nilai Wawancara = 100%
              </span>
            </div>

            {kriteriaList.length === 0 ? (
              <div className="py-8 text-center text-slate-500 text-xs">
                Belum ada rincian kriteria seleksi yang ditambahkan Admin untuk periode ini.
              </div>
            ) : (
              <div className="border border-slate-200 rounded-xl overflow-hidden">
                <table className="w-full text-xs text-left">
                  <thead className="bg-[#0E4A3E] text-white uppercase font-bold">
                    <tr>
                      <th className="px-4 py-2.5">No</th>
                      <th className="px-4 py-2.5">Nama Kriteria</th>
                      <th className="px-4 py-2.5 text-center">Jenis</th>
                      <th className="px-4 py-2.5 text-center">Metode</th>
                      <th className="px-4 py-2.5 text-center">Nilai Maks</th>
                      <th className="px-4 py-2.5 text-center">Bobot (%)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {kriteriaList.map((k, idx) => (
                      <tr key={k.id_kriteria} className="hover:bg-slate-50">
                        <td className="px-4 py-2.5 font-bold text-slate-500">{idx + 1}</td>
                        <td className="px-4 py-2.5 font-bold text-slate-800">{k.nama_kriteria}</td>
                        <td className="px-4 py-2.5 text-center">
                          <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 font-bold text-[10px] uppercase">
                            {k.jenis}
                          </span>
                        </td>
                        <td className="px-4 py-2.5 text-center text-slate-600">{k.metode_nilai}</td>
                        <td className="px-4 py-2.5 text-center font-semibold">{k.nilai_maksimal}</td>
                        <td className="px-4 py-2.5 text-center font-black text-[#0E4A3E]">
                          {k.bobot}%
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            <div className="flex justify-end pt-2">
              <button
                onClick={() => onSetKriteriaModalOpen(false)}
                className="px-5 py-2 rounded-xl bg-slate-200 text-slate-700 font-bold text-xs hover:bg-slate-300 cursor-pointer"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {isSawModalOpen && sawCalculation && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[88vh] flex flex-col border border-slate-200 overflow-hidden">
            <div className="px-6 py-4 bg-[#0E4A3E] text-white flex items-center justify-between">
              <div>
                <h3 className="font-extrabold text-sm sm:text-base uppercase">
                  Matriks Perhitungan SPK — Metode SAW (Simple Additive Weighting)
                </h3>
                <p className="text-[11px] text-white/80">
                  Bobot Kriteria Admin: C1 Substansi ({bobotSubstansi}%) &amp; C2 Wawancara ({bobotWawancara}%)
                </p>
              </div>
              <button
                onClick={() => onSetSawModalOpen(false)}
                className="text-white/70 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="px-6 pt-4 pb-2 border-b border-slate-200 flex flex-wrap gap-2 bg-slate-50">
              <button
                onClick={() => onSetSawTab('keputusan')}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-bold cursor-pointer transition-all ${
                  sawTab === 'keputusan'
                    ? 'bg-[#0E4A3E] text-white'
                    : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
                }`}
              >
                1. Matriks Keputusan (X)
              </button>
              <button
                onClick={() => onSetSawTab('normalisasi')}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-bold cursor-pointer transition-all ${
                  sawTab === 'normalisasi'
                    ? 'bg-[#0E4A3E] text-white'
                    : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
                }`}
              >
                2. Matriks Normalisasi (R)
              </button>
              <button
                onClick={() => onSetSawTab('preferensi')}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-bold cursor-pointer transition-all ${
                  sawTab === 'preferensi'
                    ? 'bg-[#0E4A3E] text-white'
                    : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
                }`}
              >
                3. Nilai Preferensi (V) &amp; Ranking
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-4 text-xs">
              {sawTab === 'keputusan' && (
                <>
                  <p className="text-slate-600">
                    Nilai mentah masing-masing alternatif peserta pada kriteria <strong>C1 (Substansi)</strong> dan <strong>C2 (Wawancara)</strong>. Nilai maksimum: Max(C1) = <strong>{sawCalculation.maxSubstansi}</strong>, Max(C2) = <strong>{sawCalculation.maxWawancara}</strong>.
                  </p>
                  <table className="w-full border border-slate-200 rounded-xl overflow-hidden">
                    <thead className="bg-slate-100 font-bold text-slate-700">
                      <tr>
                        <th className="px-3 py-2 text-left">Alternatif (Mahasiswa)</th>
                        <th className="px-3 py-2 text-center">Fakultas</th>
                        <th className="px-3 py-2 text-center">C1: Substansi</th>
                        <th className="px-3 py-2 text-center">C2: Wawancara</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {sawCalculation.rows.map((r) => (
                        <tr key={r.id_hasil}>
                          <td className="px-3 py-2 font-bold text-slate-800">
                            {r.nama} <span className="text-slate-400 font-mono">({r.nim})</span>
                          </td>
                          <td className="px-3 py-2 text-center">{r.fakultas}</td>
                          <td className="px-3 py-2 text-center font-semibold">{r.xSubstansi}</td>
                          <td className="px-3 py-2 text-center font-semibold">{r.xWawancara}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </>
              )}

              {sawTab === 'normalisasi' && (
                <>
                  <p className="text-slate-600">
                    Normalisasi Benefit: <code>R_ij = X_ij / Max(X_j)</code>. Membagi nilai peserta dengan nilai tertinggi pada masing-masing kriteria.
                  </p>
                  <table className="w-full border border-slate-200 rounded-xl overflow-hidden">
                    <thead className="bg-slate-100 font-bold text-slate-700">
                      <tr>
                        <th className="px-3 py-2 text-left">Alternatif (Mahasiswa)</th>
                        <th className="px-3 py-2 text-center">R1 ({`X1 / ${sawCalculation.maxSubstansi}`})</th>
                        <th className="px-3 py-2 text-center">R2 ({`X2 / ${sawCalculation.maxWawancara}`})</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {sawCalculation.rows.map((r) => (
                        <tr key={r.id_hasil}>
                          <td className="px-3 py-2 font-bold text-slate-800">
                            {r.nama} <span className="text-slate-400 font-mono">({r.nim})</span>
                          </td>
                          <td className="px-3 py-2 text-center font-mono">{r.rSubstansi.toFixed(4)}</td>
                          <td className="px-3 py-2 text-center font-mono">{r.rWawancara.toFixed(4)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </>
              )}

              {sawTab === 'preferensi' && (
                <>
                  <p className="text-slate-600">
                    Rumus Preferensi: <code>V_i = ({sawCalculation.wSubstansi} × R1) + ({sawCalculation.wWawancara} × R2)</code>.
                  </p>
                  <table className="w-full border border-slate-200 rounded-xl overflow-hidden">
                    <thead className="bg-slate-100 font-bold text-slate-700">
                      <tr>
                        <th className="px-3 py-2 text-center">Ranking</th>
                        <th className="px-3 py-2 text-left">Mahasiswa</th>
                        <th className="px-3 py-2 text-center">R1 × {bobotSubstansi}%</th>
                        <th className="px-3 py-2 text-center">R2 × {bobotWawancara}%</th>
                        <th className="px-3 py-2 text-center">Nilai Preferensi (V)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {sawCalculation.rows.map((r) => (
                        <tr key={r.id_hasil}>
                          <td className="px-3 py-2 text-center font-black text-[#0E4A3E]">
                            #{r.ranking_akhir}
                          </td>
                          <td className="px-3 py-2 font-bold text-slate-800">
                            {r.nama} <span className="text-slate-400 font-mono">({r.nim})</span>
                          </td>
                          <td className="px-3 py-2 text-center font-mono">
                            {(r.rSubstansi * sawCalculation.wSubstansi).toFixed(4)}
                          </td>
                          <td className="px-3 py-2 text-center font-mono">
                            {(r.rWawancara * sawCalculation.wWawancara).toFixed(4)}
                          </td>
                          <td className="px-3 py-2 text-center font-black text-[#0E4A3E]">
                            {r.vPreference.toFixed(4)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </>
              )}
            </div>

            <div className="px-6 py-3 bg-slate-50 border-t border-slate-200 flex justify-end">
              <button
                onClick={() => onSetSawModalOpen(false)}
                className="px-5 py-2 rounded-xl bg-slate-200 text-slate-700 font-bold text-xs hover:bg-slate-300 cursor-pointer"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
