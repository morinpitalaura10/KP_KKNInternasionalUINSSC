'use client';

import React from 'react';
import { Globe, X, Upload, Loader2, AlertCircle } from 'lucide-react';

interface ActivePeriode {
  id_periode: number;
  nama_periode: string;
  tahun: number;
}

export interface NegaraModalProps {
  isOpen: boolean;
  modalMode: 'create' | 'edit';
  activePeriode: ActivePeriode | null;
  formNama: string;
  setFormNama: (val: string) => void;
  formFoto: string;
  setFormFoto: (val: string) => void;
  formDeskripsi: string;
  setFormDeskripsi: (val: string) => void;
  formStatus: boolean;
  setFormStatus: (val: boolean) => void;
  formAddToPeriode: boolean;
  setFormAddToPeriode: (val: boolean) => void;
  isSubmitting: boolean;
  isUploadingFoto: boolean;
  uploadError: string | null;
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => void;
  onUploadFoto: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export default function NegaraModal({
  isOpen,
  modalMode,
  activePeriode,
  formNama,
  setFormNama,
  formFoto,
  setFormFoto,
  formDeskripsi,
  setFormDeskripsi,
  formStatus,
  setFormStatus,
  formAddToPeriode,
  setFormAddToPeriode,
  isSubmitting,
  isUploadingFoto,
  uploadError,
  onClose,
  onSubmit,
  onUploadFoto,
}: NegaraModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xl max-w-md w-full overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="bg-[#DDF2E8] px-6 py-4 border-b border-[#c2e5d6] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Globe className="w-5 h-5 text-[#0E4A3E]" />
            <h3 className="font-extrabold text-[#0E4A3E] text-base uppercase">
              {modalMode === 'create' ? 'Tambah Negara Baru' : 'Edit Data Negara'}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={onSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-bold text-[#0E4A3E] mb-1.5">
              Nama Negara Tujuan <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="Contoh: Thailand, Malaysia, Filipina..."
              value={formNama}
              onChange={(e) => setFormNama(e.target.value)}
              className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:border-[#568E7D] focus:ring-2 focus:ring-[#568E7D]/20 font-medium"
            />
          </div>

          {/* Foto Kegiatan Negara */}
          <div>
            <label className="block text-xs font-bold text-[#0E4A3E] mb-1.5">
              Foto Kegiatan / Banner (Tampil di Beranda)
            </label>
            <div className="flex items-start gap-3 mb-2">
              <div className="w-24 h-16 rounded-xl overflow-hidden border-2 border-slate-200 bg-slate-100 shrink-0 shadow-xs relative flex items-center justify-center">
                {formFoto ? (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img
                    src={formFoto}
                    alt="Preview"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center p-1 text-center">
                    <Upload className="w-4 h-4 text-slate-400 mb-0.5" />
                    <span className="text-[9px] font-semibold text-slate-400">Belum ada foto</span>
                  </div>
                )}
                {isUploadingFoto && (
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                    <Loader2 className="w-5 h-5 text-white animate-spin" />
                  </div>
                )}
              </div>
              <div className="flex-1 space-y-2">
                <div className="flex flex-wrap items-center gap-2">
                  <label className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#0E4A3E] hover:bg-[#08362d] text-white text-xs font-bold rounded-lg cursor-pointer transition-colors shadow-2xs">
                    {isUploadingFoto ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Upload className="w-3.5 h-3.5" />
                    )}
                    <span>{isUploadingFoto ? 'Mengunggah...' : 'Unggah Foto Langsung'}</span>
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      onChange={onUploadFoto}
                      className="hidden"
                      disabled={isUploadingFoto}
                    />
                  </label>
                  {formFoto && (
                    <button
                      type="button"
                      onClick={() => setFormFoto('')}
                      className="text-xs font-semibold text-red-500 hover:text-red-700 cursor-pointer"
                    >
                      Hapus
                    </button>
                  )}
                  <span className="text-[11px] text-slate-400 block w-full">
                    Format JPG, PNG, WEBP (Maks. 5MB)
                  </span>
                </div>
                {formFoto && (
                  <p className="text-[11px] text-emerald-700 font-semibold flex items-center gap-1">
                    ✓ Foto terpasang ({formFoto.split('/').pop()})
                  </p>
                )}

                {uploadError && (
                  <p className="text-[11px] font-semibold text-rose-600 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    {uploadError}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Deskripsi Kegiatan */}
          <div>
            <label className="block text-xs font-bold text-[#0E4A3E] mb-1.5">
              Deskripsi Kegiatan KKN (Tampil di Beranda)
            </label>
            <textarea
              rows={3}
              placeholder="Tuliskan deskripsi singkat mengenai kegiatan dan kemitraan KKN di negara ini..."
              value={formDeskripsi}
              onChange={(e) => setFormDeskripsi(e.target.value)}
              className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 focus:outline-none focus:border-[#568E7D] focus:ring-2 focus:ring-[#568E7D]/20 font-medium resize-none"
            />
          </div>

          {/* Status Sistem */}
          <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200">
            <div>
              <p className="text-xs font-bold text-slate-800">Status Sistem Negara</p>
              <p className="text-[11px] text-slate-500">Aktifkan agar dapat dipilih pada periode KKN</p>
            </div>
            <button
              type="button"
              onClick={() => setFormStatus(!formStatus)}
              className="relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 focus:outline-none cursor-pointer"
              style={{ backgroundColor: formStatus ? '#0E4A3E' : '#cbd5e1' }}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition-transform duration-200 ${
                  formStatus ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          {/* Buka di Periode Aktif */}
          {activePeriode && (
            <div className="flex items-center justify-between p-3 rounded-xl bg-[#E8F5F1] border border-[#a8d5c2]">
              <div>
                <p className="text-xs font-bold text-[#0E4A3E]">
                  Buka di {activePeriode.nama_periode} ({activePeriode.tahun})
                </p>
                <p className="text-[11px] text-[#0E4A3E]/75">
                  Tampilkan sebagai pilihan tujuan di periode aktif saat ini
                </p>
              </div>
              <button
                type="button"
                onClick={() => setFormAddToPeriode(!formAddToPeriode)}
                className="relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 focus:outline-none cursor-pointer"
                style={{ backgroundColor: formAddToPeriode ? '#0E4A3E' : '#cbd5e1' }}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition-transform duration-200 ${
                    formAddToPeriode ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-2.5 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 text-xs font-bold hover:bg-slate-50 transition-colors cursor-pointer"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isSubmitting || isUploadingFoto}
              className="px-5 py-2 rounded-xl bg-[#0D6EFD] hover:bg-blue-700 text-white text-xs font-bold shadow-xs transition-all cursor-pointer disabled:opacity-50"
            >
              {isSubmitting ? 'Menyimpan...' : modalMode === 'create' ? 'Tambah Negara' : 'Simpan Perubahan'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

