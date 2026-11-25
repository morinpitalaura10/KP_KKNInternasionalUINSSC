'use client';

import React from 'react';
import Link from 'next/link';
import {
  ChevronRight,
  ChevronLeft,
  ChevronDown,
  Save,
  Send,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Loader2,
  Lock,
  Globe,
  Upload,
  Eye,
  Printer,
  Camera,
  UploadCloud,
  User,
  ShieldCheck,
  Bold,
  Italic,
  List,
  Sparkles,
} from 'lucide-react';
import {
  hitungSkorToefl,
  hitungSkorIelts,
  hitungSkorToeic,
  hitungSkorToaflJenjang,
} from '@/lib/rubrikBahasa';
import FormPendaftaranTopSection, { FormPendaftaranClosedView } from './FormPendaftaranTopSection';

export interface FormState {
  nim: string;
  nama: string;
  email: string;
  fakultas: string;
  prodi: string;
  id_prodi?: number | null;
  semester: number;
  kelas: string;
  ipk: number;
  jenis_kelamin: string;
  no_hp: string;
  alamat: string;
  tempat_lahir: string;
  tanggal_lahir: string;
  asal_sekolah: string;
  total_sks: number;
  dosen_pa: string;
  id_periode_negara: number | '';
  pengalaman_organisasi: string;
  bahasa_asing: string;
  motivasi: string;
  golongan_darah: string;
  riwayat_penyakit: string;
  alergi: string;
  ukuran_kaos: string;
  nama_ayah: string;
  pekerjaan_ayah: string;
  nama_ibu: string;
  pekerjaan_ibu: string;
  no_hp_orang_tua: string;
  alamat_orang_tua: string;
}

export interface PersyaratanOption {
  id_persyaratan: number;
  nama_persyaratan: string;
  deskripsi: string;
  format_file: string;
  ukuran_maksimal: number;
  wajib: boolean;
}

export interface MahasiswaFormPendaftaranViewProps {
  isLoading: boolean;
  isRegistrationOpen: boolean;
  closedMessage: string | null;
  activePeriodeInfo: {
    id_periode: number;
    nama_periode: string;
    tahun: number;
    tanggal_mulai?: string;
    tanggal_selesai?: string;
  } | null;
  isUploadWindowOpen: boolean;
  uploadWindowMessage: string | null;
  isHasilPublished: boolean;
  statusMessage: { type: 'success' | 'error'; text: string } | null;
  setStatusMessage: React.Dispatch<React.SetStateAction<{ type: 'success' | 'error'; text: string } | null>>;
  isEligibleToSubmit: boolean;
  isProdiValid: boolean;
  isMahasiswaAktif: boolean;
  isSemesterValid: boolean;
  isIpkValid: boolean;
  minSemReq: number;
  maxSemReq: number;
  minIpkReq: number;
  allowedProdiNames: string;
  formSteps: string[];
  activeStep: number;
  setActiveStep: React.Dispatch<React.SetStateAction<number>>;
  formData: FormState;
  handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => void;
  isAsalSekolahValid: (val: string) => boolean;
  pasFotoSrc: string | null;
  pasFotoInputRef: React.RefObject<HTMLInputElement | null>;
  handlePasFotoChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleRemovePasFoto: () => void;
  bahasaInggrisJenis: 'TOEFL' | 'IELTS' | 'TOEIC' | 'TOAFL' | 'NONE';
  setBahasaInggrisJenis: React.Dispatch<React.SetStateAction<'TOEFL' | 'IELTS' | 'TOEIC' | 'TOAFL' | 'NONE'>>;
  bahasaInggrisSkor: string;
  setBahasaInggrisSkor: React.Dispatch<React.SetStateAction<string>>;
  setSelectedEnglishPoin: React.Dispatch<React.SetStateAction<number | null>>;
  showEssayPreview: boolean;
  setShowEssayPreview: React.Dispatch<React.SetStateAction<boolean>>;
  motivasiRef: React.RefObject<HTMLTextAreaElement | null>;
  applyFormatting: (prefix: string, suffix?: string, placeholder?: string) => void;
  renderFormattedPreview: (text: string) => React.ReactNode;
  hasSavedPendaftaran: boolean;
  persyaratanList: PersyaratanOption[];
  uploadedDocs: Record<number, { id_dokumen: number; file_path: string; status: string; file_name?: string }>;
  uploadingId: number | null;
  handleFileUpload: (e: React.ChangeEvent<HTMLInputElement>, idPersyaratan: number) => void;
  setujuPernyataan: boolean;
  setSetujuPernyataan: React.Dispatch<React.SetStateAction<boolean>>;
  isSubmitting: boolean;
  handleNextStep: () => void;
  handleSaveOrSubmit: (isDraft: boolean) => void;
}

export default function MahasiswaFormPendaftaranView({
  isLoading,
  isRegistrationOpen,
  closedMessage,
  activePeriodeInfo,
  isUploadWindowOpen,
  uploadWindowMessage,
  isHasilPublished,
  statusMessage,
  setStatusMessage,
  isEligibleToSubmit,
  isProdiValid,
  isMahasiswaAktif,
  isSemesterValid,
  isIpkValid,
  minSemReq,
  maxSemReq,
  minIpkReq,
  allowedProdiNames,
  formSteps,
  activeStep,
  setActiveStep,
  formData,
  handleChange,
  isAsalSekolahValid,
  pasFotoSrc,
  pasFotoInputRef,
  handlePasFotoChange,
  handleRemovePasFoto,
  bahasaInggrisJenis,
  setBahasaInggrisJenis,
  bahasaInggrisSkor,
  setBahasaInggrisSkor,
  setSelectedEnglishPoin,
  showEssayPreview,
  setShowEssayPreview,
  motivasiRef,
  applyFormatting,
  renderFormattedPreview,
  hasSavedPendaftaran,
  persyaratanList,
  uploadedDocs,
  uploadingId,
  handleFileUpload,
  setujuPernyataan,
  setSetujuPernyataan,
  isSubmitting,
  handleNextStep,
  handleSaveOrSubmit,
}: MahasiswaFormPendaftaranViewProps) {
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[350px]">
        <Loader2 className="w-10 h-10 text-[#0E4A3E] animate-spin mb-3" />
        <p className="text-sm font-semibold text-slate-600">Memuat formulir pendaftaran...</p>
      </div>
    );
  }

  if (!isRegistrationOpen) {
    return <FormPendaftaranClosedView closedMessage={closedMessage || ''} />;
  }

  return (
    <div className="kkn-page-container font-sans">
      <FormPendaftaranTopSection
        activePeriodeInfo={activePeriodeInfo}
        isUploadWindowOpen={isUploadWindowOpen}
        uploadWindowMessage={uploadWindowMessage || ''}
        isHasilPublished={isHasilPublished}
        statusMessage={statusMessage}
        onCloseStatusMessage={() => setStatusMessage(null)}
        isEligibleToSubmit={isEligibleToSubmit}
        isProdiValid={isProdiValid}
        isMahasiswaAktif={isMahasiswaAktif}
        isSemesterValid={isSemesterValid}
        isIpkValid={isIpkValid}
        minSemReq={minSemReq}
        maxSemReq={maxSemReq}
        minIpkReq={minIpkReq}
        allowedProdiNames={allowedProdiNames}
        prodi={formData.prodi}
        semester={formData.semester}
        ipk={formData.ipk}
        formSteps={formSteps}
        activeStep={activeStep}
        onSelectStep={setActiveStep}
      />

      {/* Form Content */}
      <div className="bg-white rounded-2xl sm:rounded-3xl border border-[#C0E6D8] shadow-xs p-5 sm:p-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 mb-6 border-b border-[#C0E6D8] gap-2">
          <div>
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#568E7D] block">
              Formulir Pendaftaran • Langkah {activeStep + 1} dari {formSteps.length}
            </span>
            <h3 className="text-lg sm:text-xl font-bold font-archivo text-[#0E4A3E] mt-0.5">
              {activeStep + 1}. {formSteps[activeStep]}
            </h3>
          </div>
          {(isHasilPublished || !isUploadWindowOpen) && (
            <span className="inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1 rounded-full bg-slate-100 text-slate-600 border border-slate-200 self-start sm:self-auto">
              <Lock className="w-3.5 h-3.5 text-slate-500" />
              Mode Baca-Saja (Formulir Terkunci)
            </span>
          )}
        </div>

        <fieldset
          disabled={isHasilPublished || !isUploadWindowOpen}
          className={isHasilPublished || !isUploadWindowOpen ? 'opacity-90' : ''}
        >
          {/* STEP 0: Data Diri */}
          {activeStep === 0 && (
            <div>
              {/* ── Pas Foto Formal Mahasiswa (4x6) ── */}
              <div className="mb-6 p-5 rounded-2xl bg-slate-50/80 border border-slate-200">
                <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5">
                  <input
                    type="file"
                    ref={pasFotoInputRef}
                    onChange={handlePasFotoChange}
                    accept="image/png, image/jpeg, image/jpg, image/webp"
                    className="hidden"
                  />
                  <div className="w-28 h-36 border-2 border-dashed border-[#568E7D] rounded-xl overflow-hidden bg-white flex flex-col items-center justify-center relative shrink-0 shadow-xs group">
                    {pasFotoSrc ? (
                      <>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={pasFotoSrc}
                          alt="Pas Foto Mahasiswa"
                          className="w-full h-full object-cover"
                        />
                        <button
                          type="button"
                          onClick={() => pasFotoInputRef.current?.click()}
                          className="absolute inset-0 bg-black/50 text-white text-[11px] font-bold opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer"
                        >
                          Ganti Foto
                        </button>
                      </>
                    ) : (
                      <div
                        onClick={() => pasFotoInputRef.current?.click()}
                        className="w-full h-full flex flex-col items-center justify-center p-2 text-center cursor-pointer hover:bg-slate-50 transition-colors"
                      >
                        <Camera className="w-7 h-7 text-slate-400 mb-1" />
                        <span className="text-[10px] font-extrabold text-[#0E4A3E]">UNGGAH FOTO</span>
                        <span className="text-[9px] text-slate-400">Pas Foto 4x6</span>
                      </div>
                    )}
                  </div>

                  <div className="space-y-2 text-center sm:text-left flex-1">
                    <div className="flex items-center gap-2 justify-center sm:justify-start">
                      <h4 className="text-xs font-bold text-[#0E4A3E] uppercase tracking-wide">
                        Pas Foto Formal Mahasiswa (4x6)
                      </h4>
                      {pasFotoSrc ? (
                        <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full border border-emerald-300">
                          Foto Terunggah
                        </span>
                      ) : (
                        <span className="text-[10px] bg-amber-50 text-amber-700 font-bold px-2 py-0.5 rounded-full border border-amber-200">
                          Belum Diunggah
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed max-w-lg">
                      Unggah pas foto resmi Anda dengan latar belakang formal (Merah atau Biru). Foto ini akan digunakan untuk cetak Kartu Peserta KKN Internasional dan verifikasi berkas oleh staf penilai.
                    </p>
                    <p className="text-[11px] text-slate-400">
                      Format file: JPG / PNG / WEBP (Maksimal 3 MB).
                    </p>
                    <div className="flex items-center gap-2 justify-center sm:justify-start pt-1">
                      <button
                        type="button"
                        onClick={() => pasFotoInputRef.current?.click()}
                        className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#0E4A3E] hover:bg-[#08362d] text-white rounded-full text-xs font-bold transition-all shadow-2xs cursor-pointer"
                      >
                        <UploadCloud className="w-3.5 h-3.5" />
                        {pasFotoSrc ? 'Ganti Pas Foto' : 'Pilih Pas Foto dari Perangkat'}
                      </button>
                      {pasFotoSrc && (
                        <button
                          type="button"
                          onClick={handleRemovePasFoto}
                          className="px-3 py-2 text-xs text-red-600 hover:bg-red-50 rounded-full font-bold transition-colors cursor-pointer"
                        >
                          Hapus Foto
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-bold text-[#0E4A3E]">Nomor Induk Mahasiswa (NIM)</label>
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200 shadow-2xs">
                      <Lock className="w-2.5 h-2.5 text-emerald-600" />
                      SIAKAD (Terkunci)
                    </span>
                  </div>
                  <input
                    type="text"
                    name="nim"
                    value={formData.nim}
                    disabled
                    className="w-full px-4 py-2.5 border border-slate-200 bg-slate-50 rounded-full text-sm text-slate-700 cursor-not-allowed font-semibold font-mono"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-bold text-[#0E4A3E]">Nama Lengkap Mahasiswa</label>
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200 shadow-2xs">
                      <Lock className="w-2.5 h-2.5 text-emerald-600" />
                      SIAKAD (Terkunci)
                    </span>
                  </div>
                  <input
                    type="text"
                    name="nama"
                    value={formData.nama}
                    disabled
                    className="w-full px-4 py-2.5 border border-slate-200 bg-slate-50 rounded-full text-sm text-slate-700 cursor-not-allowed font-semibold"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-bold text-[#0E4A3E]">Jenis Kelamin</label>
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200 shadow-2xs">
                      <Lock className="w-2.5 h-2.5 text-emerald-600" />
                      SIAKAD (Terkunci)
                    </span>
                  </div>
                  <input
                    type="text"
                    name="jenis_kelamin"
                    value={formData.jenis_kelamin === 'P' ? 'Perempuan (P)' : formData.jenis_kelamin === 'L' ? 'Laki-Laki (L)' : '-'}
                    disabled
                    className="w-full px-4 py-2.5 border border-slate-200 bg-slate-50 rounded-full text-sm text-slate-700 cursor-not-allowed font-medium"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-bold text-[#0E4A3E]">Email Resmi Kampus</label>
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200 shadow-2xs">
                      <Lock className="w-2.5 h-2.5 text-emerald-600" />
                      SIAKAD (Terkunci)
                    </span>
                  </div>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    disabled
                    className="w-full px-4 py-2.5 border border-slate-200 bg-slate-50 rounded-full text-sm text-slate-700 cursor-not-allowed font-medium"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#0E4A3E] mb-1">No. Handphone (WhatsApp)</label>
                  <input
                    type="text"
                    name="no_hp"
                    value={formData.no_hp}
                    onChange={handleChange}
                    placeholder="08xxxxxxxxxx"
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-full text-sm text-slate-700 focus:outline-none focus:border-[#568E7D] focus:ring-2 focus:ring-[#568E7D]/20 bg-white"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-bold text-[#0E4A3E]">Tempat Lahir</label>
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200 shadow-2xs">
                      <Lock className="w-2.5 h-2.5 text-emerald-600" />
                      SIAKAD (Terkunci)
                    </span>
                  </div>
                  <input
                    type="text"
                    name="tempat_lahir"
                    value={formData.tempat_lahir}
                    disabled
                    placeholder="Kota / Kabupaten tempat lahir..."
                    className="w-full px-4 py-2.5 border border-slate-200 bg-slate-50 rounded-full text-sm text-slate-700 cursor-not-allowed font-medium"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-bold text-[#0E4A3E]">Tanggal Lahir</label>
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200 shadow-2xs">
                      <Lock className="w-2.5 h-2.5 text-emerald-600" />
                      SIAKAD (Terkunci)
                    </span>
                  </div>
                  <input
                    type="date"
                    name="tanggal_lahir"
                    value={formData.tanggal_lahir}
                    disabled
                    className="w-full px-4 py-2.5 border border-slate-200 bg-slate-50 rounded-full text-sm text-slate-700 cursor-not-allowed font-medium"
                  />
                </div>

                {/* Asal Sekolah - Input Mandiri dengan Format Standar Resmi */}
                <div className="sm:col-span-2">
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-bold text-[#0E4A3E]">
                      Asal Sekolah (SMA / SMK / MA / MAN) <span className="text-red-500">*</span>
                    </label>
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200 shadow-2xs">
                      Input Mandiri Mahasiswa
                    </span>
                  </div>
                  <input
                    type="text"
                    name="asal_sekolah"
                    value={formData.asal_sekolah}
                    onChange={handleChange}
                    placeholder="Contoh: SMK Negeri 1 Kota Cirebon atau SMA Negeri 1 Kota Cirebon"
                    className={`w-full px-4 py-2.5 border rounded-full text-sm text-slate-800 font-medium focus:outline-none transition-colors bg-white ${
                      formData.asal_sekolah && !isAsalSekolahValid(formData.asal_sekolah)
                        ? 'border-red-400 focus:ring-2 focus:ring-red-200'
                        : formData.asal_sekolah && isAsalSekolahValid(formData.asal_sekolah)
                        ? 'border-emerald-500 focus:ring-2 focus:ring-emerald-200'
                        : 'border-slate-300 focus:border-[#568E7D] focus:ring-2 focus:ring-[#568E7D]/20'
                    }`}
                  />

                  <div className="mt-1.5 px-1">
                    {formData.asal_sekolah ? (
                      isAsalSekolahValid(formData.asal_sekolah) ? (
                        <div className="flex items-center gap-1.5 text-[11px] font-bold text-emerald-700">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                          <span>Format penulisan sesuai standar resmi.</span>
                        </div>
                      ) : (
                        <div className="flex items-start gap-1.5 text-[11px] text-red-600 bg-red-50 p-2.5 rounded-xl border border-red-200">
                          <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                          <div>
                            <span className="font-bold">Format penulisan belum sesuai: </span>
                            <span>
                              Wajib diawali jenis sekolah resmi (SMA/SMK/MA/MAN) dan mencakup nama serta kota. Contoh format yang diterima: <b>SMK Negeri 1 Kota Cirebon</b> atau <b>SMA Negeri 1 Kota Cirebon</b>.
                            </span>
                          </div>
                        </div>
                      )
                    ) : (
                      <p className="text-[11px] text-slate-500">
                        Tuliskan nama lengkap sekolah asal beserta kota. <span className="font-semibold text-slate-700">Contoh format penulisan: SMK Negeri 1 Kota Cirebon</span>.
                      </p>
                    )}
                  </div>
                </div>

                <div className="sm:col-span-2">
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-bold text-[#0E4A3E]">Alamat Domisili Lengkap</label>
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200 shadow-2xs">
                      <Lock className="w-2.5 h-2.5 text-emerald-600" />
                      SIAKAD / Bridge
                    </span>
                  </div>
                  <textarea
                    name="alamat"
                    value={formData.alamat}
                    onChange={handleChange}
                    rows={2}
                    placeholder="Alamat jalan, kelurahan, kecamatan, kota..."
                    className="w-full px-4 py-2.5 border border-slate-200 bg-white rounded-xl text-sm text-slate-700 focus:outline-none focus:border-[#568E7D] focus:ring-2 focus:ring-[#568E7D]/20 font-medium resize-none"
                  />
                </div>

                {/* ── Sub-Bagian: Data Orang Tua / Wali (Dari Bridge / SIAKAD) ── */}
                <div className="sm:col-span-2 pt-4 mt-2 border-t border-slate-200">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h4 className="text-sm font-bold text-[#0E4A3E] flex items-center gap-2">
                        <User className="w-4 h-4 text-[#0E4A3E]" />
                        Data Orang Tua / Wali
                      </h4>
                      <p className="text-xs text-slate-500">
                        Data orang tua tersinkronisasi dari sistem Bridge SIAKAD dan dapat dilengkapi jika diperlukan.
                      </p>
                    </div>
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200 shadow-2xs">
                      <Lock className="w-2.5 h-2.5 text-emerald-600" />
                      Tersinkronisasi Bridge
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4">
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="block text-xs font-bold text-[#0E4A3E]">Nama Ayah</label>
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200 shadow-2xs">
                          <Lock className="w-2.5 h-2.5 text-emerald-600" />
                          SIAKAD (Terkunci)
                        </span>
                      </div>
                      <input
                        type="text"
                        name="nama_ayah"
                        value={formData.nama_ayah}
                        onChange={handleChange}
                        disabled={Boolean(formData.nama_ayah)}
                        placeholder="Masukkan nama lengkap ayah..."
                        className="w-full px-4 py-2.5 border border-slate-200 bg-slate-50 rounded-full text-sm text-slate-700 cursor-not-allowed font-semibold"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-[#0E4A3E] mb-1">Pekerjaan Ayah</label>
                      <input
                        type="text"
                        name="pekerjaan_ayah"
                        value={formData.pekerjaan_ayah}
                        onChange={handleChange}
                        placeholder="PNS / Karyawan Swasta / Wiraswasta / dll"
                        className="w-full px-4 py-2.5 border border-slate-200 bg-white rounded-full text-sm text-slate-700 focus:outline-none focus:border-[#568E7D] focus:ring-2 focus:ring-[#568E7D]/20 font-medium"
                      />
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="block text-xs font-bold text-[#0E4A3E]">Nama Ibu</label>
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200 shadow-2xs">
                          <Lock className="w-2.5 h-2.5 text-emerald-600" />
                          SIAKAD (Terkunci)
                        </span>
                      </div>
                      <input
                        type="text"
                        name="nama_ibu"
                        value={formData.nama_ibu}
                        onChange={handleChange}
                        disabled={Boolean(formData.nama_ibu)}
                        placeholder="Masukkan nama lengkap ibu..."
                        className="w-full px-4 py-2.5 border border-slate-200 bg-slate-50 rounded-full text-sm text-slate-700 cursor-not-allowed font-semibold"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-[#0E4A3E] mb-1">Pekerjaan Ibu</label>
                      <input
                        type="text"
                        name="pekerjaan_ibu"
                        value={formData.pekerjaan_ibu}
                        onChange={handleChange}
                        placeholder="Ibu Rumah Tangga / PNS / Wiraswasta / dll"
                        className="w-full px-4 py-2.5 border border-slate-200 bg-white rounded-full text-sm text-slate-700 focus:outline-none focus:border-[#568E7D] focus:ring-2 focus:ring-[#568E7D]/20 font-medium"
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block text-xs font-bold text-[#0E4A3E] mb-1">
                        No. Telepon / HP Orang Tua / Wali
                      </label>
                      <input
                        type="text"
                        name="no_hp_orang_tua"
                        value={formData.no_hp_orang_tua}
                        onChange={handleChange}
                        placeholder="08xxxxxxxxxx"
                        className="w-full px-4 py-2.5 border border-slate-200 bg-white rounded-full text-sm text-slate-700 focus:outline-none focus:border-[#568E7D] focus:ring-2 focus:ring-[#568E7D]/20 font-medium"
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <div className="flex items-center justify-between mb-1">
                        <label className="block text-xs font-bold text-[#0E4A3E]">Alamat Orang Tua / Wali</label>
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200 shadow-2xs">
                          <Lock className="w-2.5 h-2.5 text-emerald-600" />
                          SIAKAD / Bridge
                        </span>
                      </div>
                      <textarea
                        name="alamat_orang_tua"
                        value={formData.alamat_orang_tua}
                        onChange={handleChange}
                        rows={2}
                        placeholder="Alamat lengkap orang tua / wali..."
                        className="w-full px-4 py-2.5 border border-slate-200 bg-white rounded-xl text-sm text-slate-700 focus:outline-none focus:border-[#568E7D] focus:ring-2 focus:ring-[#568E7D]/20 font-medium resize-none"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 1: Data Akademik */}
          {activeStep === 1 && (
            <div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-bold text-[#0E4A3E]">Fakultas</label>
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200 shadow-2xs">
                      <Lock className="w-2.5 h-2.5 text-emerald-600" />
                      SIAKAD (Terkunci)
                    </span>
                  </div>
                  <input
                    type="text"
                    value={formData.fakultas}
                    disabled
                    className="w-full px-4 py-2.5 border border-slate-200 bg-slate-50 rounded-full text-sm text-slate-700 cursor-not-allowed font-medium"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-bold text-[#0E4A3E]">Program Studi</label>
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200 shadow-2xs">
                      <Lock className="w-2.5 h-2.5 text-emerald-600" />
                      SIAKAD (Terkunci)
                    </span>
                  </div>
                  <input
                    type="text"
                    value={formData.prodi}
                    disabled
                    className={`w-full px-4 py-2.5 border rounded-full text-sm font-medium cursor-not-allowed ${
                      isProdiValid
                        ? 'border-slate-200 bg-slate-50 text-slate-700'
                        : 'border-red-300 bg-red-50 text-red-800 font-bold'
                    }`}
                  />
                  {!isProdiValid ? (
                    <p className="text-[11px] font-bold text-red-600 mt-1.5 flex items-center gap-1.5">
                      <XCircle className="w-3.5 h-3.5 shrink-0 text-red-600" />
                      <span>Program Studi tidak dibuka pada periode ini (Hanya dibuka untuk: {allowedProdiNames}).</span>
                    </p>
                  ) : (
                    <p className="text-[11px] font-semibold text-emerald-700 mt-1.5 flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 shrink-0 text-emerald-600" />
                      <span>Program Studi memenuhi kriteria jurusan yang dibuka untuk KKN Internasional.</span>
                    </p>
                  )}
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-bold text-[#0E4A3E]">
                      Semester Saat Ini{' '}
                      <span className="text-xs text-emerald-700 font-semibold">
                        (Smt {minSemReq}–{maxSemReq})
                      </span>
                    </label>
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200 shadow-2xs">
                      <Lock className="w-2.5 h-2.5 text-emerald-600" />
                      SIAKAD (Terkunci)
                    </span>
                  </div>
                  <input
                    type="number"
                    name="semester"
                    value={formData.semester}
                    disabled
                    className="w-full px-4 py-2.5 border border-slate-200 bg-slate-50 rounded-full text-sm text-slate-700 cursor-not-allowed font-bold"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-bold text-[#0E4A3E]">
                      IPK Terakhir{' '}
                      <span className="text-xs text-emerald-700 font-semibold">
                        (Min. {minIpkReq.toFixed(2)})
                      </span>
                    </label>
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200 shadow-2xs">
                      <Lock className="w-2.5 h-2.5 text-emerald-600" />
                      SIAKAD (Terkunci)
                    </span>
                  </div>
                  <input
                    type="number"
                    step="0.01"
                    name="ipk"
                    value={formData.ipk}
                    disabled
                    className="w-full px-4 py-2.5 border border-slate-200 bg-slate-50 rounded-full text-sm text-slate-700 cursor-not-allowed font-bold"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-bold text-[#0E4A3E]">Kelas</label>
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200 shadow-2xs">
                      <Lock className="w-2.5 h-2.5 text-emerald-600" />
                      SIAKAD (Terkunci)
                    </span>
                  </div>
                  <input
                    type="text"
                    name="kelas"
                    value={formData.kelas}
                    disabled
                    className="w-full px-4 py-2.5 border border-slate-200 bg-slate-50 rounded-full text-sm text-slate-700 cursor-not-allowed font-bold"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-bold text-[#0E4A3E]">Total SKS Ditempuh</label>
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200 shadow-2xs">
                      <Lock className="w-2.5 h-2.5 text-emerald-600" />
                      SIAKAD (Terkunci)
                    </span>
                  </div>
                  <input
                    type="number"
                    name="total_sks"
                    value={formData.total_sks}
                    disabled
                    className="w-full px-4 py-2.5 border border-slate-200 bg-slate-50 rounded-full text-sm text-slate-700 cursor-not-allowed font-medium"
                  />
                </div>

                {/* ── Info Penempatan Negara ── */}
                <div className="sm:col-span-2 bg-[#DDF2E8]/60 border border-[#c2e5d6] rounded-2xl p-4 sm:p-5 mt-2 shadow-2xs">
                  <div className="flex items-start gap-3.5">
                    <div className="w-9 h-9 rounded-xl bg-[#0E4A3E] text-white flex items-center justify-center shrink-0 mt-0.5 shadow-xs">
                      <Globe className="w-5 h-5 text-emerald-300" />
                    </div>
                    <div className="space-y-1">
                      <span className="text-xs font-extrabold text-[#0E4A3E] uppercase tracking-wide block">
                        Negara Penempatan KKN Internasional
                      </span>
                      <p className="text-xs font-bold text-slate-800">
                        Penempatan negara tujuan sepenuhnya dikelola dan dialokasikan oleh LP2M.
                      </p>
                      <p className="text-[11px] text-slate-600 leading-relaxed">
                        Mahasiswa mendaftar untuk program KKN Internasional tanpa memilih negara secara mandiri. Penempatan negara mitra (seperti Malaysia, Thailand, Filipina, dll) akan ditentukan oleh panitia seleksi LP2M berdasarkan hasil ranking akhir, ketersediaan kuota, serta pertimbangan pemerataan fakultas dan program studi.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: Data Pendukung & Esai Motivasi */}
          {activeStep === 2 && (
            <div>
              <div className="mb-6 p-4 rounded-2xl bg-[#EAF5F0]/70 border border-[#C0E6D8] text-xs text-slate-700 leading-relaxed">
                Lengkapi riwayat keikutsertaan organisasi, kemampuan bahasa asing, serta esai motivasi diri dengan jelas dan terstruktur untuk dinilai oleh tim penyeleksi KKN Internasional.
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-5">
                {/* Pengalaman Organisasi */}
                <div className="sm:col-span-2">
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-xs font-bold text-[#0E4A3E]">
                      Pengalaman Organisasi / Kepanitiaan <span className="text-red-500">*</span>
                    </label>
                    <span
                      className={`text-[11px] font-semibold ${
                        formData.pengalaman_organisasi.trim().length >= 15
                          ? 'text-emerald-600'
                          : 'text-amber-600'
                      }`}
                    >
                      {formData.pengalaman_organisasi.trim().length} / 15 karakter min.
                    </span>
                  </div>
                  <textarea
                    name="pengalaman_organisasi"
                    value={formData.pengalaman_organisasi}
                    onChange={handleChange}
                    rows={3}
                    placeholder="Tuliskan pengalaman organisasi internal/eksternal kampus atau kepanitiaan yang pernah Anda ikuti..."
                    className={`w-full px-4 py-2.5 border rounded-xl text-sm text-slate-700 focus:outline-none focus:ring-2 resize-none transition-all ${
                      formData.pengalaman_organisasi.trim().length > 0 &&
                      formData.pengalaman_organisasi.trim().length < 15
                        ? 'border-amber-300 focus:border-amber-500 focus:ring-amber-500/20'
                        : 'border-slate-200 focus:border-[#568E7D] focus:ring-[#568E7D]/20'
                    }`}
                  />
                </div>

                {/* ── Kemampuan Bahasa Asing ── */}
                <div className="sm:col-span-2 bg-gradient-to-r from-emerald-50/70 to-teal-50/70 border border-emerald-200 rounded-2xl p-4 sm:p-5 space-y-4">
                  <div className="flex items-center justify-between gap-2 pb-3 border-b border-emerald-200">
                    <div className="flex items-center gap-2">
                      <Globe className="w-5 h-5 text-[#0E4A3E]" />
                      <div>
                        <div className="flex items-center gap-2">
                          <label className="block text-xs font-extrabold text-[#0E4A3E] uppercase tracking-wide">
                            Kemampuan Bahasa Asing <span className="text-red-500">*</span>
                          </label>
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                              formData.bahasa_asing.trim().length >= 5
                                ? 'bg-emerald-100 text-emerald-800'
                                : 'bg-amber-100 text-amber-800'
                            }`}
                          >
                            {formData.bahasa_asing.trim().length >= 5 ? '✓ Terisi' : 'Wajib Diisi'}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500">
                          Pilih jenis sertifikat tes bahasa asing yang Anda miliki lalu masukkan skor sesuai sertifikat resmi.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white p-4 rounded-xl border border-emerald-100 shadow-2xs">
                    <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-end">
                      <div className={bahasaInggrisJenis === 'NONE' ? 'sm:col-span-12' : 'sm:col-span-6'}>
                        <div className="flex items-center justify-between mb-1.5">
                          <label className="text-xs font-bold text-slate-800">
                            Pilih Jenis Sertifikat Bahasa Asing <span className="text-red-500">*</span>
                          </label>
                        </div>
                        <div className="relative">
                          <select
                            value={bahasaInggrisJenis}
                            onChange={(e) => {
                              const nextJenis = e.target.value as 'TOEFL' | 'IELTS' | 'TOEIC' | 'TOAFL' | 'NONE';
                              setBahasaInggrisJenis(nextJenis);
                              if (nextJenis === 'NONE') {
                                setBahasaInggrisSkor('0');
                                setSelectedEnglishPoin(0);
                              } else {
                                setBahasaInggrisSkor('');
                                setSelectedEnglishPoin(null);
                              }
                            }}
                            className="w-full px-3.5 py-2.5 pr-9 bg-slate-50 hover:bg-white border border-slate-300 rounded-xl text-xs sm:text-sm font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0E4A3E] focus:bg-white appearance-none cursor-pointer transition-colors"
                          >
                            <option value="TOEFL">TOEFL (PBT / ITP) — Bahasa Inggris (Skala 310 - 677)</option>
                            <option value="IELTS">IELTS (Academic / General) — Bahasa Inggris (Band 0.0 - 9.0)</option>
                            <option value="TOEIC">TOEIC — Bahasa Inggris (Skala 10 - 990)</option>
                            <option value="TOAFL">TOAFL — Bahasa Arab (Skala 300 - 600)</option>
                            <option value="NONE">Belum Memiliki Sertifikat Tes Resmi</option>
                          </select>
                          <ChevronDown className="w-4 h-4 text-slate-500 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                        </div>
                      </div>

                      {bahasaInggrisJenis !== 'NONE' && (
                        <div className="sm:col-span-6">
                          <div className="flex items-center justify-between mb-1.5">
                            <label className="text-xs font-bold text-slate-800">
                              Skor {bahasaInggrisJenis} Anda <span className="text-red-500">*</span>
                            </label>
                            <span className="text-[10px] font-semibold text-slate-500">
                              {bahasaInggrisJenis === 'TOEFL'
                                ? 'Rentang: 310 - 677'
                                : bahasaInggrisJenis === 'IELTS'
                                ? 'Rentang: 0.0 - 9.0'
                                : bahasaInggrisJenis === 'TOEIC'
                                ? 'Rentang: 10 - 990'
                                : 'Rentang: 300 - 600'}
                            </span>
                          </div>
                          <input
                            type="number"
                            step={bahasaInggrisJenis === 'IELTS' ? '0.5' : '1'}
                            min="0"
                            max={
                              bahasaInggrisJenis === 'IELTS'
                                ? '9'
                                : bahasaInggrisJenis === 'TOEIC'
                                ? '990'
                                : bahasaInggrisJenis === 'TOAFL'
                                ? '600'
                                : '677'
                            }
                            placeholder={
                              bahasaInggrisJenis === 'TOEFL'
                                ? 'Masukkan skor TOEFL (contoh: 480)'
                                : bahasaInggrisJenis === 'IELTS'
                                ? 'Masukkan band IELTS (contoh: 6.0)'
                                : bahasaInggrisJenis === 'TOEIC'
                                ? 'Masukkan skor TOEIC (contoh: 650)'
                                : 'Masukkan skor TOAFL (contoh: 460)'
                            }
                            value={bahasaInggrisSkor}
                            onChange={(e) => {
                              const val = e.target.value;
                              setBahasaInggrisSkor(val);
                              if (val !== '' && !isNaN(Number(val))) {
                                const num = Number(val);
                                const j =
                                  bahasaInggrisJenis === 'TOEFL'
                                    ? hitungSkorToefl(num)
                                    : bahasaInggrisJenis === 'IELTS'
                                    ? hitungSkorIelts(num)
                                    : bahasaInggrisJenis === 'TOEIC'
                                    ? hitungSkorToeic(num)
                                    : hitungSkorToaflJenjang(num);
                                setSelectedEnglishPoin(j.poin);
                              } else {
                                setSelectedEnglishPoin(null);
                              }
                            }}
                            className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-xs sm:text-sm font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0E4A3E]"
                          />
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Motivasi & Esai with Rich Text Toolbar */}
                <div className="sm:col-span-2">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-1.5">
                    <div className="flex items-center gap-2">
                      <label className="block text-xs font-bold text-[#0E4A3E]">
                        Motivasi Mengikuti KKN Internasional <span className="text-red-500">*</span>
                      </label>
                      <span
                        className={`text-[11px] font-semibold ${
                          formData.motivasi.trim().length >= 50
                            ? 'text-emerald-600'
                            : 'text-amber-600'
                        }`}
                      >
                        ({formData.motivasi.trim().length} / 50 karakter min.)
                      </span>
                    </div>

                    <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg border border-slate-200 text-xs self-start sm:self-auto">
                      <button
                        type="button"
                        onClick={() => applyFormatting('**', '**', 'teks tebal')}
                        title="Format Tebal (Bold)"
                        className="p-1 px-2 hover:bg-white rounded font-bold text-slate-700 flex items-center gap-1 transition-colors cursor-pointer"
                      >
                        <Bold className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline text-[11px]">Tebal</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => applyFormatting('*', '*', 'teks miring')}
                        title="Format Miring (Italic)"
                        className="p-1 px-2 hover:bg-white rounded italic text-slate-700 flex items-center gap-1 transition-colors cursor-pointer"
                      >
                        <Italic className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline text-[11px]">Miring</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => applyFormatting('\n• ', '', 'poin penting')}
                        title="Bullet List"
                        className="p-1 px-2 hover:bg-white rounded text-slate-700 flex items-center gap-1 transition-colors cursor-pointer"
                      >
                        <List className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline text-[11px]">Poin</span>
                      </button>
                      <div className="h-4 w-[1px] bg-slate-300 mx-0.5" />
                      <button
                        type="button"
                        onClick={() => setShowEssayPreview(!showEssayPreview)}
                        className={`p-1 px-2 rounded text-[11px] font-semibold flex items-center gap-1 transition-colors cursor-pointer ${
                          showEssayPreview
                            ? 'bg-[#0E4A3E] text-white shadow-xs'
                            : 'hover:bg-white text-slate-700'
                        }`}
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>{showEssayPreview ? 'Edit Teks' : 'Pratinjau'}</span>
                      </button>
                    </div>
                  </div>

                  {showEssayPreview ? (
                    <div className="w-full p-4 border border-[#568E7D] bg-emerald-50/30 rounded-xl min-h-[140px]">
                      <div className="flex items-center justify-between pb-2 mb-2 border-b border-emerald-200 text-[11px] text-[#0E4A3E] font-bold">
                        <span className="flex items-center gap-1">
                          <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                          Pratinjau Tampilan Esai Untuk Pewawancara
                        </span>
                        <span className="text-slate-500 font-normal">Format Markdown Aktif</span>
                      </div>
                      {renderFormattedPreview(formData.motivasi)}
                    </div>
                  ) : (
                    <textarea
                      ref={motivasiRef}
                      name="motivasi"
                      value={formData.motivasi}
                      onChange={handleChange}
                      rows={5}
                      placeholder="Ceritakan motivasi dan kontribusi yang ingin Anda berikan dalam program KKN Internasional ini... Gunakan toolbar di atas untuk menambahkan format tebal (**teks**), miring (*teks*), atau poin list (•) agar mudah dipahami penguji."
                      className={`w-full px-4 py-2.5 border rounded-xl text-sm text-slate-700 focus:outline-none focus:ring-2 resize-none transition-all ${
                        formData.motivasi.trim().length > 0 &&
                        formData.motivasi.trim().length < 50
                          ? 'border-amber-300 focus:border-amber-500 focus:ring-amber-500/20'
                          : 'border-slate-200 focus:border-[#568E7D] focus:ring-[#568E7D]/20'
                      }`}
                    />
                  )}
                  <p className="text-[11px] text-slate-400 mt-1.5">
                    Tips: Anda dapat menyeleksi kata lalu mengklik tombol <strong>Tebal</strong> atau <strong>Miring</strong> untuk mempermudah pewawancara meninjau poin keunggulan dan visi pengabdian Anda.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: Data Tambahan */}
          {activeStep === 3 && (
            <div>
              <div className="mb-6 p-4 rounded-2xl bg-[#EAF5F0]/70 border border-[#C0E6D8] text-xs text-slate-700 leading-relaxed">
                Lengkapi informasi perlengkapan atribut, kondisi kesehatan, serta nomor kontak darurat yang dapat dihubungi.
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4">
                <div>
                  <label className="block text-xs font-bold text-[#0E4A3E] mb-1">
                    Ukuran Kaos KKN <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <select
                      name="ukuran_kaos"
                      value={formData.ukuran_kaos || 'L'}
                      onChange={handleChange}
                      className="appearance-none w-full px-4 pr-10 py-2.5 border border-slate-200 rounded-full text-sm font-medium text-slate-700 focus:outline-none focus:border-[#568E7D] focus:ring-2 focus:ring-[#568E7D]/20 bg-white cursor-pointer transition-all"
                    >
                      <option value="" disabled>
                        -- Pilih Ukuran Kaos --
                      </option>
                      <option value="S">S (Small)</option>
                      <option value="M">M (Medium)</option>
                      <option value="L">L (Large)</option>
                      <option value="XL">XL (Extra Large)</option>
                      <option value="XXL">XXL (Double Extra Large)</option>
                    </select>
                    <ChevronDown className="w-4 h-4 text-slate-500 absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#0E4A3E] mb-1">
                    Golongan Darah <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <select
                      name="golongan_darah"
                      value={formData.golongan_darah || 'O'}
                      onChange={handleChange}
                      className="appearance-none w-full px-4 pr-10 py-2.5 border border-slate-200 rounded-full text-sm font-medium text-slate-700 focus:outline-none focus:border-[#568E7D] focus:ring-2 focus:ring-[#568E7D]/20 bg-white cursor-pointer transition-all"
                    >
                      <option value="" disabled>
                        -- Pilih Golongan Darah --
                      </option>
                      <option value="A">Golongan Darah A</option>
                      <option value="B">Golongan Darah B</option>
                      <option value="AB">Golongan Darah AB</option>
                      <option value="O">Golongan Darah O</option>
                      <option value="-">Belum Tahu (-)</option>
                    </select>
                    <ChevronDown className="w-4 h-4 text-slate-500 absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#0E4A3E] mb-1">Riwayat Penyakit Khusus</label>
                  <input
                    type="text"
                    name="riwayat_penyakit"
                    value={formData.riwayat_penyakit}
                    onChange={handleChange}
                    placeholder="Tidak ada / Tuliskan jika ada (Contoh: Asma, Maag)"
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-full text-sm text-slate-700 focus:outline-none focus:border-[#568E7D] focus:ring-2 focus:ring-[#568E7D]/20 bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#0E4A3E] mb-1">Alergi Makanan / Obat</label>
                  <input
                    type="text"
                    name="alergi"
                    value={formData.alergi}
                    onChange={handleChange}
                    placeholder="Tidak ada / Tuliskan jika ada (Contoh: Seafood, Antibiotik)"
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-full text-sm text-slate-700 focus:outline-none focus:border-[#568E7D] focus:ring-2 focus:ring-[#568E7D]/20 bg-white"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-[#0E4A3E] mb-1">
                    Kontak Darurat (No. HP / WhatsApp Orang Tua / Wali) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="no_hp_orang_tua"
                    value={formData.no_hp_orang_tua}
                    onChange={handleChange}
                    placeholder="08xxxxxxxxxx (Nomor aktif Orang Tua / Wali yang dapat dihubungi dalam keadaan darurat)"
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-full text-sm text-slate-700 focus:outline-none focus:border-[#568E7D] focus:ring-2 focus:ring-[#568E7D]/20 bg-white"
                  />
                  <p className="text-[11px] text-slate-500 mt-1 px-1">
                    Pastikan nomor kontak darurat aktif dan berbeda dengan nomor pribadi Anda.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* STEP 4: Dokumen */}
          {activeStep === 4 && (
            <div>
              <div className="flex flex-wrap items-center justify-between mb-4 gap-2">
                <p className="text-xs text-slate-600 leading-relaxed max-w-xl">
                  Unggah berkas resmi langsung dari folder internal komputer/perangkat Anda sesuai format yang ditentukan.
                </p>
                {hasSavedPendaftaran && (
                  <Link
                    href="/mahasiswa/cetak_bukti"
                    className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#0E4A3E] hover:bg-[#08362d] text-white rounded-full text-xs font-bold transition-all shadow-xs"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    Cetak Kartu Peserta (PDF)
                  </Link>
                )}
              </div>

              <div className="space-y-4">
                {persyaratanList.length > 0 ? (
                  persyaratanList.map((doc) => {
                    const uploaded = uploadedDocs[doc.id_persyaratan];
                    const isUploading = uploadingId === doc.id_persyaratan;

                    return (
                      <div
                        key={doc.id_persyaratan}
                        className={`p-4 sm:p-5 border rounded-2xl transition-all ${
                          uploaded
                            ? 'border-emerald-300 bg-emerald-50/25'
                            : 'border-slate-200 bg-white hover:border-[#568E7D]/40'
                        }`}
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-bold text-slate-800">{doc.nama_persyaratan}</span>
                              {doc.wajib && (
                                <span className="text-[10px] uppercase font-bold text-red-600 bg-red-50 border border-red-200 px-1.5 py-0.5 rounded">
                                  Wajib
                                </span>
                              )}
                              {uploaded && (
                                <span className="text-[10px] uppercase font-bold text-emerald-700 bg-emerald-100 border border-emerald-300 px-2 py-0.5 rounded-full inline-flex items-center gap-1">
                                  <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                                  Terunggah
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-slate-500">
                              Format: <span className="font-semibold text-slate-700">{doc.format_file.toUpperCase()}</span> (Maks. {Math.round(doc.ukuran_maksimal / 1024)}MB)
                            </p>
                            {uploaded?.file_name && (
                              <p className="text-[11px] text-emerald-800 font-mono truncate max-w-md">
                                📁 {uploaded.file_name}
                              </p>
                            )}
                          </div>

                          <div className="flex items-center gap-2 shrink-0">
                            {uploaded && (
                              <a
                                href={uploaded.file_path}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1.5 px-3 py-2 border border-slate-300 hover:border-slate-400 bg-white text-slate-700 text-xs font-bold rounded-xl shadow-2xs transition-colors cursor-pointer"
                                title="Buka dokumen di tab baru"
                              >
                                <Eye className="w-3.5 h-3.5 text-slate-600" />
                                Lihat Berkas
                              </a>
                            )}

                            {isUploadWindowOpen ? (
                              <label className="cursor-pointer bg-[#0E4A3E] hover:bg-[#08362d] text-white text-xs font-bold px-4 py-2 rounded-xl transition-all inline-flex items-center justify-center gap-1.5 shadow-2xs">
                                {isUploading ? (
                                  <>
                                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                    <span>Mengunggah...</span>
                                  </>
                                ) : uploaded ? (
                                  <>
                                    <Upload className="w-3.5 h-3.5" />
                                    <span>Ganti Berkas</span>
                                  </>
                                ) : (
                                  <>
                                    <Upload className="w-3.5 h-3.5" />
                                    <span>Pilih Berkas</span>
                                  </>
                                )}
                                <input
                                  type="file"
                                  disabled={isUploading}
                                  className="hidden"
                                  accept={doc.format_file.toLowerCase().includes('pdf') ? '.pdf' : 'image/*'}
                                  onChange={(e) => handleFileUpload(e, doc.id_persyaratan)}
                                />
                              </label>
                            ) : (
                              <button
                                type="button"
                                disabled
                                title={uploadWindowMessage || 'Jadwal pengiriman dokumen telah ditutup'}
                                className="bg-slate-200 text-slate-500 border border-slate-300 text-xs font-bold px-4 py-2 rounded-xl inline-flex items-center justify-center gap-1.5 cursor-not-allowed"
                              >
                                <Lock className="w-3.5 h-3.5" />
                                <span>Jadwal Unggah Ditutup</span>
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="p-6 text-center text-sm text-slate-500 border border-dashed border-slate-300 rounded-xl">
                    Belum ada persyaratan dokumen yang ditetapkan untuk periode ini.
                  </div>
                )}
              </div>
            </div>
          )}

          {/* STEP 5: Pernyataan Persetujuan */}
          {activeStep === 5 && (
            <div>
              <div className="mb-6 p-4 rounded-2xl bg-[#EAF5F0]/70 border border-[#C0E6D8] text-xs text-slate-700 leading-relaxed">
                Baca dengan saksama dan setujui pernyataan komitmen peserta sebelum mengirimkan pendaftaran resmi KKN Internasional.
              </div>

              <div className="bg-slate-50/90 border border-slate-200 rounded-2xl p-5 sm:p-6 space-y-4">
                <div className="flex items-start gap-3.5">
                  <div className="w-10 h-10 rounded-xl bg-[#0E4A3E] text-white flex items-center justify-center shrink-0 shadow-xs">
                    <ShieldCheck className="w-5 h-5 text-emerald-300" />
                  </div>
                  <div>
                    <h4 className="text-sm font-extrabold text-[#0E4A3E] uppercase tracking-wide">
                      Pakta Integritas &amp; Pernyataan Komitmen Mahasiswa
                    </h4>
                    <p className="text-xs text-slate-600 mt-0.5">
                      Lembaga Penelitian dan Pengabdian kepada Masyarakat (LP2M) UIN Siber Syekh Nurjati Cirebon
                    </p>
                  </div>
                </div>

                <div className="bg-white border border-slate-200 rounded-xl p-4 sm:p-5 text-xs text-slate-700 leading-relaxed space-y-2.5">
                  <p className="font-semibold text-slate-800">
                    Dengan ini saya yang bertanda tangan secara elektronik di bawah ini (<span className="text-[#0E4A3E] font-bold">{formData.nama || 'Mahasiswa Pendaftar'}</span> — NIM <span className="font-mono font-bold">{formData.nim || '-'}</span>) menyatakan dengan sesungguhnya bahwa:
                  </p>
                  <ol className="list-decimal list-inside space-y-2 pl-1">
                    <li>
                      Seluruh data diri, data akademik, data orang tua/wali, serta dokumen persyaratan yang saya isikan dan unggah dalam formulir ini adalah <b>benar, sah, dan sesuai dengan dokumen asli</b>.
                    </li>
                    <li>
                      Saya telah memperoleh <b>izin penuh dari Orang Tua / Wali</b> untuk mengikuti seluruh rangkaian kegiatan Kuliah Kerja Nyata (KKN) Internasional.
                    </li>
                    <li>
                      Saya bersedia ditempatkan di <b>negara tujuan mana pun</b> sesuai keputusan panitia seleksi LP2M berdasarkan hasil perangkingan akhir dan ketersediaan kuota.
                    </li>
                    <li>
                      Saya bersedia mengikuti seluruh tahapan seleksi, pembekalan intensif, serta mematuhi segala peraturan dan tata tertib yang ditetapkan oleh LP2M UIN Siber Syekh Nurjati Cirebon maupun instansi mitra di luar negeri.
                    </li>
                    <li>
                      Apabila di kemudian hari ditemukan ketidaksesuaian atau pemalsuan data/berkas, saya bersedia menerima sanksi administratif berupa <b>pembatalan kelulusan/kepesertaan</b> tanpa menuntut pihak panitia.
                    </li>
                  </ol>
                </div>

                <label
                  className={`flex items-start gap-3.5 p-4 rounded-xl border-2 transition-all cursor-pointer select-none ${
                    setujuPernyataan
                      ? 'bg-emerald-50/80 border-emerald-500 text-emerald-950 shadow-2xs'
                      : 'bg-white border-slate-300 hover:border-[#568E7D] text-slate-800'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={setujuPernyataan}
                    onChange={(e) => setSetujuPernyataan(e.target.checked)}
                    className="mt-0.5 w-4 h-4 accent-[#0E4A3E] rounded cursor-pointer shrink-0"
                  />
                  <div className="text-xs leading-relaxed">
                    <span className="font-extrabold block text-[#0E4A3E]">
                      Saya menyetujui seluruh pernyataan di atas secara sadar dan tanpa paksaan.
                    </span>
                    <span className="text-slate-600">
                      Centang kotak ini sebagai tanda persetujuan resmi agar Anda dapat menekan tombol <b>Kirim Pendaftaran</b>.
                    </span>
                  </div>
                </label>
              </div>
            </div>
          )}
        </fieldset>

        {/* Bottom Navigation */}
        <div className="flex flex-wrap items-center justify-between mt-8 pt-6 border-t border-slate-100 gap-3">
          <div className="flex flex-wrap items-center gap-2">
            {activeStep > 0 && (
              <button
                type="button"
                onClick={() => {
                  setActiveStep((prev) => prev - 1);
                  if (typeof window !== 'undefined') {
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }
                }}
                className="flex items-center gap-1.5 px-4 py-2 border border-slate-300 text-slate-700 rounded-full text-xs font-bold hover:bg-slate-50 transition-colors cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
                Sebelumnya
              </button>
            )}

            <button
              type="button"
              disabled={isSubmitting || !isUploadWindowOpen}
              onClick={() => handleSaveOrSubmit(true)}
              title={!isUploadWindowOpen ? uploadWindowMessage || 'Jadwal pendaftaran telah ditutup' : undefined}
              className="flex items-center gap-1.5 px-4 py-2 border border-[#0E4A3E] text-[#0E4A3E] rounded-full text-xs font-bold hover:bg-[#0E4A3E]/5 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Save className="w-3.5 h-3.5" />
              Simpan Draft
            </button>

            {hasSavedPendaftaran && (
              <Link
                href="/mahasiswa/cetak_bukti"
                className="inline-flex items-center gap-1.5 px-4 py-2 border border-emerald-600 text-emerald-700 hover:bg-emerald-50 rounded-full text-xs font-bold transition-colors cursor-pointer"
              >
                <Printer className="w-3.5 h-3.5" />
                Cetak Bukti Pendaftaran
              </Link>
            )}
          </div>

          <div>
            {activeStep < formSteps.length - 1 ? (
              <button
                type="button"
                onClick={handleNextStep}
                className="flex items-center gap-2 px-6 py-2.5 bg-[#0E4A3E] hover:bg-[#08362d] text-white rounded-full text-sm font-bold shadow-xs transition-all cursor-pointer"
              >
                Selanjutnya
                <ChevronRight className="w-4 h-4" />
              </button>
            ) : isEligibleToSubmit && isUploadWindowOpen ? (
              <button
                type="button"
                disabled={isSubmitting}
                onClick={() => handleSaveOrSubmit(false)}
                className="flex items-center gap-2 px-7 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-full text-sm font-bold shadow-md transition-all cursor-pointer disabled:opacity-50"
              >
                {isSubmitting ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
                Kirim Pendaftaran
              </button>
            ) : !isUploadWindowOpen ? (
              <button
                type="button"
                disabled={true}
                className="flex items-center gap-2 px-6 py-2.5 bg-slate-200 text-slate-500 rounded-full text-xs sm:text-sm font-bold shadow-none cursor-not-allowed border border-slate-300"
                title={uploadWindowMessage || 'Formulir pendaftaran telah dikunci.'}
              >
                <Lock className="w-4 h-4" />
                {isHasilPublished ? 'Terkunci (Hasil Telah Dipublikasi)' : 'Jadwal Pendaftaran Ditutup'}
              </button>
            ) : (
              <button
                type="button"
                disabled={true}
                className="flex items-center gap-2 px-6 py-2.5 bg-slate-200 text-slate-400 rounded-full text-xs sm:text-sm font-bold shadow-none cursor-not-allowed border border-slate-300"
                title={
                  !isProdiValid
                    ? `Kirim pendaftaran dinonaktifkan: Program Studi Anda (${formData.prodi}) tidak dibuka untuk periode ini. Hanya dibuka untuk: ${allowedProdiNames}. Anda hanya dapat menyimpan sebagai Draft.`
                    : 'Kirim pendaftaran dinonaktifkan karena persyaratan akademik belum terpenuhi. Anda hanya dapat menyimpan sebagai Draft.'
                }
              >
                <Lock className="w-4 h-4" />
                {!isProdiValid
                  ? 'Kirim Pendaftaran (Prodi Tidak Dibuka)'
                  : 'Kirim Pendaftaran (Hanya Draft Diperbolehkan)'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
