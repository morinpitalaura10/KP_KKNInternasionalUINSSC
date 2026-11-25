'use client';

import React from 'react';
import Link from 'next/link';
import {
  CheckCircle2,
  RefreshCw,
  Printer,
  FileText,
  Clock,
  AlertTriangle,
  ExternalLink,
  Edit3,
  ShieldCheck,
  FileCheck,
} from 'lucide-react';
import { HeroBanner, HeroAsideCard, StageStepper } from '@/components/ui';

export interface DokumenStatusItem {
  id_dokumen: number;
  id_persyaratan: number;
  nama_persyaratan: string;
  format_file?: string;
  file_path: string;
  status: 'Valid' | 'Menunggu' | 'Revisi' | string;
  catatan: string | null;
  tanggal_verifikasi: string | null;
}

export interface StatusData {
  currentStage: number;
  statusPendaftaran: string | null;
  statusDokumen: string | null;
  catatanRevisi: string | null;
  hasPendaftaran: boolean;
  negaraTujuan?: string | null;
  dokumen: DokumenStatusItem[];
}

export interface MahasiswaStatusViewProps {
  isLoading: boolean;
  data: StatusData;
  stages: { label: string }[];
  hasRevisiDocs: boolean;
}

function getDocBadge(status: string) {
  switch (status) {
    case 'Valid':
      return (
        <span className="inline-flex items-center gap-1 px-3 py-1 bg-emerald-100 text-emerald-800 border border-emerald-300 rounded-full text-xs font-bold shadow-2xs">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
          Valid / Disetujui
        </span>
      );
    case 'Revisi':
      return (
        <span className="inline-flex items-center gap-1 px-3 py-1 bg-rose-100 text-rose-800 border border-rose-300 rounded-full text-xs font-bold shadow-2xs animate-pulse">
          <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
          Perlu Revisi
        </span>
      );
    case 'Menunggu':
    default:
      return (
        <span className="inline-flex items-center gap-1 px-3 py-1 bg-amber-100 text-amber-800 border border-amber-300 rounded-full text-xs font-bold shadow-2xs">
          <Clock className="w-3.5 h-3.5 text-amber-600" />
          Menunggu Verifikasi
        </span>
      );
  }
}

export default function MahasiswaStatusView({
  isLoading,
  data,
  stages,
  hasRevisiDocs,
}: MahasiswaStatusViewProps) {
  return (
    <div className="kkn-page-container pb-16 font-sans">
      <HeroBanner
        badgeIcon={<ShieldCheck className="w-3.5 h-3.5 text-[#C0E6D8]" />}
        badgeText="Monitoring Real-Time Verifikasi Berkas"
        title="Status Pendaftaran"
        description="Pantau alur tahapan seleksi dan transparansi verifikasi setiap berkas dokumen persyaratan Anda secara berkala."
        aside={
          data.negaraTujuan ? (
            <HeroAsideCard
              label="Destinasi Penempatan"
              title={data.negaraTujuan}
              subtitle={`Tahap: ${stages[data.currentStage - 1]?.label || 'Proses'}`}
            />
          ) : undefined
        }
      />

      {isLoading ? (
        <div className="py-20 flex flex-col items-center justify-center text-slate-400 gap-2">
          <RefreshCw className="w-6 h-6 animate-spin text-[#0E4A3E]" />
          <span className="text-xs font-semibold">Memuat status verifikasi dari database...</span>
        </div>
      ) : (
        <>
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6">
            <div className="flex items-center justify-between mb-2 flex-wrap gap-2">
              <h2 className="text-sm font-black text-[#0E4A3E] uppercase tracking-wider">
                Alur Tahapan Seleksi
              </h2>
              {data.negaraTujuan ? (
                <span className="text-xs font-bold text-slate-600 bg-slate-100 px-3 py-1 rounded-full border border-slate-200">
                  Destinasi: <span className="text-[#0E4A3E] font-black">{data.negaraTujuan}</span>
                </span>
              ) : !data.hasPendaftaran ? (
                <span className="text-[11px] font-bold text-slate-500 bg-slate-100 px-3 py-1 rounded-full border border-slate-200">
                  Belum Dimulai • Silakan Isi Formulir Pendaftaran
                </span>
              ) : null}
            </div>
            <StageStepper stages={stages} currentStage={data.currentStage} />
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div
                className={`w-4 h-4 rounded-full shrink-0 shadow-xs ${
                  data.statusPendaftaran === 'Lolos' || data.statusPendaftaran === 'Terverifikasi'
                    ? 'bg-emerald-500 ring-4 ring-emerald-100'
                    : data.statusPendaftaran === 'Tidak Lolos'
                    ? 'bg-rose-500 ring-4 ring-rose-100'
                    : !data.hasPendaftaran ||
                      data.statusPendaftaran === 'Belum Mendaftar' ||
                      data.statusPendaftaran === 'Draft'
                    ? 'bg-slate-400 ring-4 ring-slate-100'
                    : 'bg-amber-500 ring-4 ring-amber-100'
                }`}
              />
              <div>
                <p className="text-sm font-bold text-slate-800">
                  Status Berkas Pendaftaran:{' '}
                  <span className="text-[#0E4A3E] font-extrabold">
                    {data.statusPendaftaran || 'Belum Mendaftar'}
                  </span>
                </p>
                {!data.hasPendaftaran ? (
                  <p className="text-xs text-slate-500 mt-0.5">
                    Anda belum mengirimkan berkas pendaftaran pada periode aktif ini. Silakan lengkapi pada menu formulir.
                  </p>
                ) : data.statusPendaftaran === 'Draft' ? (
                  <p className="text-xs text-slate-500 mt-0.5">
                    Formulir Anda masih tersimpan sebagai Draft dan belum dikirim ke panitia LP2M.
                  </p>
                ) : (
                  <p className="text-xs text-slate-500 mt-0.5">
                    Data pendaftaran resmi telah tercatat dan tersinkronisasi di sistem panitia LP2M.
                  </p>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2.5">
              {!data.hasPendaftaran || data.statusPendaftaran === 'Draft' ? (
                <Link
                  href="/mahasiswa/form_pendaftaran"
                  className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#0E4A3E] hover:bg-[#08362d] text-white text-xs font-bold rounded-xl shadow-xs transition-all transform hover:-translate-y-0.5 cursor-pointer"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  {data.statusPendaftaran === 'Draft'
                    ? 'Lanjutkan & Kirim Formulir'
                    : 'Isi Formulir Pendaftaran'}
                </Link>
              ) : data.statusPendaftaran === 'Lolos' ? (
                <Link
                  href="/mahasiswa/hasil_seleksi"
                  className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#0E4A3E] hover:bg-[#08362d] text-white text-xs font-bold rounded-xl shadow-xs transition-all transform hover:-translate-y-0.5 cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5" />
                  Cetak SK Kelulusan (PDF)
                </Link>
              ) : null}
            </div>
          </div>

          {(data.catatanRevisi || data.statusPendaftaran === 'Perbaikan Dokumen' || hasRevisiDocs) && (
            <div className="bg-amber-50/90 border-2 border-amber-300 rounded-2xl p-5 flex flex-col sm:flex-row items-start justify-between gap-4 text-amber-950 shadow-xs animate-in fade-in duration-200">
              <div className="flex items-start gap-3.5 min-w-0">
                <div className="p-2.5 bg-amber-500 text-white rounded-xl shrink-0 mt-0.5 shadow-xs">
                  <AlertTriangle className="w-5 h-5 stroke-[2.5]" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-extrabold text-sm text-amber-900 tracking-wide uppercase">
                      Catatan Perbaikan Berkas dari Verifikator LP2M
                    </h3>
                    <span className="text-[10px] font-bold bg-amber-200 text-amber-900 px-2.5 py-0.5 rounded-full border border-amber-300">
                      Perlu Tindakan
                    </span>
                  </div>
                  {data.catatanRevisi ? (
                    <div className="mt-2 text-xs sm:text-sm font-semibold text-amber-900 leading-relaxed bg-white/90 p-3 rounded-xl border border-amber-200 shadow-2xs">
                      &ldquo;{data.catatanRevisi}&rdquo;
                    </div>
                  ) : (
                    <p className="mt-1 text-xs text-amber-800">
                      Terdapat dokumen persyaratan yang belum memenuhi kriteria atau format yang ditentukan. Silakan tinjau rincian status dokumen di bawah dan perbaiki berkas yang bertanda merah.
                    </p>
                  )}
                </div>
              </div>

              <Link
                href="/mahasiswa/form_pendaftaran"
                className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-xl shadow-xs shrink-0 cursor-pointer transition-all self-end sm:self-center"
              >
                <Edit3 className="w-4 h-4" />
                Perbaiki Berkas di Formulir
              </Link>
            </div>
          )}

          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="p-5 border-b border-slate-100 flex flex-wrap items-center justify-between gap-3 bg-slate-50/50">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-[#0E4A3E]/10 rounded-xl text-[#0E4A3E]">
                  <FileCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-[#0E4A3E] uppercase tracking-wider">
                    Rincian Status Verifikasi Dokumen
                  </h3>
                  <p className="text-xs text-slate-500">
                    Daftar dokumen persyaratan yang telah diunggah dan hasil audit panitia verifikator
                  </p>
                </div>
              </div>

              {data.dokumen.length > 0 && (
                <div className="flex items-center gap-2 text-xs font-semibold">
                  <span className="px-2.5 py-1 bg-emerald-50 text-emerald-700 rounded-lg border border-emerald-200">
                    {data.dokumen.filter((d) => d.status === 'Valid').length} Valid
                  </span>
                  <span className="px-2.5 py-1 bg-amber-50 text-amber-700 rounded-lg border border-amber-200">
                    {data.dokumen.filter((d) => d.status === 'Menunggu').length} Menunggu
                  </span>
                  {hasRevisiDocs && (
                    <span className="px-2.5 py-1 bg-rose-50 text-rose-700 rounded-lg border border-rose-200">
                      {data.dokumen.filter((d) => d.status === 'Revisi').length} Perlu Revisi
                    </span>
                  )}
                </div>
              )}
            </div>

            {data.dokumen.length === 0 ? (
              <div className="p-12 text-center text-slate-400">
                <FileText className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                <p className="text-xs font-bold text-slate-600">Belum ada dokumen yang diunggah</p>
                <p className="text-[11px] text-slate-400 mt-1">
                  Dokumen akan muncul setelah Anda mengunggah berkas pada formulir pendaftaran.
                </p>
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {data.dokumen.map((doc, idx) => (
                  <div key={doc.id_dokumen || idx} className="p-4 sm:p-5 hover:bg-slate-50/70 transition-colors">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="flex items-start gap-3 min-w-0">
                        <div className="p-2 bg-slate-100 rounded-xl text-slate-600 shrink-0 mt-0.5">
                          <FileText className="w-4 h-4" />
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h4 className="text-xs sm:text-sm font-bold text-slate-800">
                              {doc.nama_persyaratan}
                            </h4>
                            {getDocBadge(doc.status)}
                          </div>
                          <p className="text-[11px] text-slate-400 font-mono mt-1 truncate">
                            Berkas: {doc.file_path ? doc.file_path.split('/').pop() : '-'}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                        {doc.file_path && (
                          <a
                            href={doc.file_path}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-slate-100 border border-slate-300 rounded-xl text-xs font-bold text-slate-700 shadow-2xs transition-colors cursor-pointer"
                          >
                            <ExternalLink className="w-3.5 h-3.5 text-slate-500" />
                            <span>Lihat Berkas</span>
                          </a>
                        )}
                      </div>
                    </div>

                    {doc.status === 'Revisi' && (
                      <div className="mt-3.5 ml-0 sm:ml-10 p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-start gap-2.5 text-xs text-rose-800">
                        <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                        <div className="flex-1">
                          <p className="font-bold text-rose-900">Catatan Panitia Verifikator:</p>
                          <p className="mt-0.5 text-rose-700 font-medium">
                            {doc.catatan || 'Format atau berkas tidak sesuai persyaratan. Silakan perbaiki dan unggah ulang.'}
                          </p>
                        </div>
                      </div>
                    )}

                    {doc.status !== 'Revisi' && doc.catatan && (
                      <div className="mt-3.5 ml-0 sm:ml-10 p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-600">
                        <span className="font-bold text-slate-700">Catatan Verifikator: </span>
                        <span>{doc.catatan}</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {data.catatanRevisi ? (
            <div className="bg-amber-50 border border-amber-300 rounded-2xl p-5 shadow-xs">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-bold text-sm text-amber-900">Catatan Keseluruhan dari Panitia</h3>
                  <p className="text-xs sm:text-sm text-amber-800 mt-1 leading-relaxed">
                    {data.catatanRevisi}
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-[#C0E6D8]/30 border border-emerald-300 rounded-2xl p-5">
              <div className="flex items-start gap-3">
                <ShieldCheck className="w-5 h-5 text-[#0E4A3E] shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-bold text-sm text-[#0E4A3E]">Informasi Verifikasi</h3>
                  <p className="text-xs text-slate-600 mt-0.5">
                    Tidak ada catatan revisi menyeluruh. Berkas Anda diproses secara transparan oleh tim verifikator LP2M UIN SSC.
                  </p>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
