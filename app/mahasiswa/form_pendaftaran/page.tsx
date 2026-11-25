'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { deteksiSkorBahasa } from '@/lib/rubrikBahasa';
import {
  MahasiswaFormPendaftaranView,
  type FormState,
  type PersyaratanOption,
} from '@/components/mahasiswa';

export function isAsalSekolahValid(val: string): boolean {
  const trimmed = (val || '').trim();
  const startsWithValidType = /^(SMA|SMK|MA|MAN|SMAS|SMKS)/i.test(trimmed);
  const words = trimmed.split(/\s+/).filter(Boolean);
  return startsWithValidType && words.length >= 3 && trimmed.length >= 10;
}

function parseDeskripsiDiri(raw?: string | null): {
  pengalaman_organisasi: string;
  bahasa_asing: string;
  motivasi: string;
} {
  if (!raw || raw === '-') {
    return { pengalaman_organisasi: '', bahasa_asing: '', motivasi: '' };
  }
  const hasStructuredTags =
    raw.includes('[Pengalaman Organisasi]:') ||
    raw.includes('[Kemampuan Bahasa Asing]:') ||
    raw.includes('[Motivasi]:');

  if (!hasStructuredTags) {
    return { pengalaman_organisasi: '', bahasa_asing: '', motivasi: raw };
  }

  const orgMatch = raw.match(/\[Pengalaman Organisasi\]:\s*([\s\S]*?)(?=\n\[Kemampuan Bahasa Asing\]:|\n\[Motivasi\]:|$)/);
  const bhsMatch = raw.match(/\[Kemampuan Bahasa Asing\]:\s*([\s\S]*?)(?=\n\[Motivasi\]:|$)/);
  const motMatch = raw.match(/\[Motivasi\]:\s*([\s\S]*?)$/);

  return {
    pengalaman_organisasi: (orgMatch?.[1] || '').trim(),
    bahasa_asing: (bhsMatch?.[1] || '').trim(),
    motivasi: (motMatch?.[1] || '').trim(),
  };
}

function serializeDeskripsiDiri(org: string, bhs: string, mot: string): string {
  const parts: string[] = [];
  if (org.trim()) parts.push(`[Pengalaman Organisasi]: ${org.trim()}`);
  if (bhs.trim()) parts.push(`[Kemampuan Bahasa Asing]: ${bhs.trim()}`);
  if (mot.trim()) parts.push(`[Motivasi]: ${mot.trim()}`);
  return parts.length > 0 ? parts.join('\n') : '-';
}

const FORM_STEPS = [
  'Data Diri',
  'Data Akademik',
  'Data Pendukung',
  'Data Tambahan',
  'Dokumen',
  'Pernyataan',
];

export default function FormPendaftaranPage() {
  const router = useRouter();
  const [activeStep, setActiveStep] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [persyaratanList, setPersyaratanList] = useState<PersyaratanOption[]>([]);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [userId, setUserId] = useState<number | null>(null);
  const [isStudentAktif, setIsStudentAktif] = useState(true);
  const [uploadedDocs, setUploadedDocs] = useState<Record<number, { id_dokumen: number; file_path: string; status: string; file_name?: string }>>({});
  const [uploadingId, setUploadingId] = useState<number | null>(null);
  const [hasSavedPendaftaran, setHasSavedPendaftaran] = useState(false);

  // Pas Foto Resmi & Persyaratan Akademik State
  const [pasFotoSrc, setPasFotoSrc] = useState<string | null>(null);
  const pasFotoInputRef = React.useRef<HTMLInputElement | null>(null);
  const [akademikConfig, setAkademikConfig] = useState<any>(null);
  const [setujuPernyataan, setSetujuPernyataan] = useState(false);
  const [isRegistrationOpen, setIsRegistrationOpen] = useState(true);
  const [isUploadWindowOpen, setIsUploadWindowOpen] = useState(true);
  const [isHasilPublished, setIsHasilPublished] = useState(false);
  const [closedMessage, setClosedMessage] = useState<string | null>(null);
  const [uploadWindowMessage, setUploadWindowMessage] = useState<string | null>(null);

  // Standarisasi Rubrik Kemampuan Bahasa Asing
  const [bahasaInggrisJenis, setBahasaInggrisJenis] = useState<'TOEFL' | 'IELTS' | 'TOEIC' | 'TOAFL' | 'NONE'>('TOEFL');
  const [bahasaInggrisSkor, setBahasaInggrisSkor] = useState<string>('');
  const [selectedEnglishPoin, setSelectedEnglishPoin] = useState<number | null>(null);

  useEffect(() => {
    let result = '';

    if (bahasaInggrisJenis === 'NONE' || selectedEnglishPoin === 0) {
      result = 'Belum Memiliki Sertifikat Tes Resmi';
    } else if (bahasaInggrisSkor) {
      const kategoriLabel = bahasaInggrisJenis === 'TOAFL' ? 'Bahasa Arab' : 'Bahasa Inggris';
      result = `${kategoriLabel}: ${bahasaInggrisJenis} ${bahasaInggrisSkor}`;
    }

    setFormData((prev) => (prev.bahasa_asing === result ? prev : { ...prev, bahasa_asing: result }));
  }, [bahasaInggrisJenis, bahasaInggrisSkor, selectedEnglishPoin]);

  // Rich Text Formatting & Preview for Motivasi / Esai
  const [showEssayPreview, setShowEssayPreview] = useState(false);
  const motivasiRef = React.useRef<HTMLTextAreaElement | null>(null);

  const applyFormatting = (prefix: string, suffix: string = prefix, placeholder: string = 'teks') => {
    const textarea = motivasiRef.current;
    if (!textarea) return;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const currentVal = formData.motivasi;
    const selectedText = currentVal.substring(start, end);
    const replacement = selectedText ? `${prefix}${selectedText}${suffix}` : `${prefix}${placeholder}${suffix}`;
    const nextVal = currentVal.substring(0, start) + replacement + currentVal.substring(end);
    setFormData((prev) => ({ ...prev, motivasi: nextVal }));
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(
        start + prefix.length,
        start + prefix.length + (selectedText ? selectedText.length : placeholder.length)
      );
    }, 50);
  };

  const renderFormattedPreview = (text: string) => {
    if (!text.trim()) {
      return <p className="text-xs text-slate-400 italic">Belum ada teks esai yang ditulis...</p>;
    }
    const lines = text.split('\n');
    return (
      <div className="space-y-1.5 text-xs text-slate-700 leading-relaxed">
        {lines.map((line, idx) => {
          const trimmed = line.trim();
          if (!trimmed) return <div key={idx} className="h-1" />;
          const isBullet = trimmed.startsWith('•') || trimmed.startsWith('- ') || trimmed.startsWith('* ');
          const cleanLine = isBullet ? trimmed.replace(/^[•\-\*]\s*/, '') : line;
          const parts: (string | React.ReactNode)[] = [];
          const regex = /(\*\*([^*]+)\*\*|\*([^*]+)\*)/g;
          let match;
          let lastIndex = 0;
          let keySub = 0;
          while ((match = regex.exec(cleanLine)) !== null) {
            if (match.index > lastIndex) {
              parts.push(cleanLine.substring(lastIndex, match.index));
            }
            if (match[2]) {
              parts.push(<strong key={keySub++} className="font-bold text-slate-900">{match[2]}</strong>);
            } else if (match[3]) {
              parts.push(<em key={keySub++} className="italic text-slate-800">{match[3]}</em>);
            }
            lastIndex = regex.lastIndex;
          }
          if (lastIndex < cleanLine.length) {
            parts.push(cleanLine.substring(lastIndex));
          }
          if (isBullet) {
            return (
              <div key={idx} className="flex items-start gap-2 pl-2">
                <span className="text-[#0E4A3E] font-bold mt-0.5">•</span>
                <div>{parts}</div>
              </div>
            );
          }
          return <p key={idx}>{parts}</p>;
        })}
      </div>
    );
  };

  const [activePeriodeInfo, setActivePeriodeInfo] = useState<{
    id_periode: number;
    nama_periode: string;
    tahun: number;
    tanggal_mulai?: string;
    tanggal_selesai?: string;
  } | null>(null);

  const [formData, setFormData] = useState<FormState>({
    nim: '',
    nama: '',
    email: '',
    fakultas: '',
    prodi: '',
    id_prodi: null,
    semester: 7,
    kelas: 'B',
    ipk: 0,
    jenis_kelamin: 'P',
    no_hp: '',
    alamat: '',
    tempat_lahir: '',
    tanggal_lahir: '2003-01-01',
    asal_sekolah: '',
    total_sks: 100,
    dosen_pa: '',
    id_periode_negara: '',
    pengalaman_organisasi: '',
    bahasa_asing: '',
    motivasi: '',
    golongan_darah: 'O',
    riwayat_penyakit: '',
    alergi: '',
    ukuran_kaos: 'L',
    nama_ayah: '',
    pekerjaan_ayah: '',
    nama_ibu: '',
    pekerjaan_ibu: '',
    no_hp_orang_tua: '',
    alamat_orang_tua: '',
  });

  useEffect(() => {
    async function loadForm() {
      try {
        let currentUserId = 1;
        if (typeof window !== 'undefined') {
          const stored = localStorage.getItem('currentUser');
          if (stored) {
            try {
              const u = JSON.parse(stored);
              if (u.id_user) currentUserId = Number(u.id_user);
              else if (u.id) currentUserId = Number(u.id);
            } catch {
              // ignore
            }
          }
        }
        setUserId(currentUserId);

        const [res, akadRes] = await Promise.all([
          fetch(`/api/mahasiswa/form-init?userId=${currentUserId}`),
          fetch('/api/persyaratan/akademik'),
        ]);
        const json = await res.json();
        const akadJson = await akadRes.json();

        if (akadJson.success && akadJson.data) {
          setAkademikConfig(akadJson.data);
        }

        if (typeof window !== 'undefined') {
          const savedAvatar = localStorage.getItem(`avatar_${currentUserId || 'mhs'}`);
          if (savedAvatar) {
            setPasFotoSrc(savedAvatar);
          }
        }

        if (json.success && json.data) {
          const {
            student,
            activePeriode,
            existingPendaftaran,
            isRegistrationOpen: regOpen,
            isUploadWindowOpen: uploadOpen,
            isHasilPublished: hasilPub,
            closedMessage: closedMsg,
            uploadWindowMessage: uploadMsg,
          } = json.data;

          setIsRegistrationOpen(regOpen !== false);
          setIsUploadWindowOpen(uploadOpen !== false);
          setIsHasilPublished(Boolean(hasilPub));
          setClosedMessage(closedMsg || null);
          setUploadWindowMessage(uploadMsg || null);

          if (activePeriode) {
            setActivePeriodeInfo({
              id_periode: activePeriode.id_periode,
              nama_periode: activePeriode.nama_periode,
              tahun: activePeriode.tahun,
              tanggal_mulai: activePeriode.tanggal_mulai,
              tanggal_selesai: activePeriode.tanggal_selesai,
            });
            setPersyaratanList(activePeriode.persyaratanList || []);
          } else {
            setActivePeriodeInfo(null);
            setPersyaratanList([]);
          }

          if (student.status_aktif !== undefined) {
            setIsStudentAktif(Boolean(student.status_aktif));
          }

          const parsedPendukung = parseDeskripsiDiri(existingPendaftaran?.deskripsi_diri);

          setFormData((prev) => ({
            ...prev,
            nim: student.nim || '',
            nama: student.nama || '',
            email: student.email || '',
            fakultas: student.fakultas || '',
            prodi: student.prodi || '',
            id_prodi: student.id_prodi !== undefined ? student.id_prodi : null,
            semester: student.semester || 7,
            kelas: student.kelas || 'B',
            ipk: student.ipk || 0,
            jenis_kelamin: student.jenis_kelamin || existingPendaftaran?.jenis_kelamin || 'P',
            id_periode_negara:
              existingPendaftaran?.id_periode_negara ||
              (activePeriode?.negaraList?.[0]?.id_periode_negara ?? ''),
            no_hp: student.no_hp || existingPendaftaran?.no_hp || '',
            alamat: student.alamat || existingPendaftaran?.alamat || '',
            tempat_lahir: student.tempat_lahir || existingPendaftaran?.tempat_lahir || '',
            tanggal_lahir: student.tanggal_lahir || existingPendaftaran?.tanggal_lahir || '',
            asal_sekolah: student.asal_sekolah || existingPendaftaran?.asal_sekolah || '',
            total_sks: existingPendaftaran?.total_sks || 134,
            golongan_darah: existingPendaftaran?.golongan_darah || 'O',
            riwayat_penyakit: existingPendaftaran?.riwayat_penyakit || '',
            alergi: existingPendaftaran?.alergi || '',
            ukuran_kaos: existingPendaftaran?.ukuran_kaos || 'L',
            nama_ayah:
              student.nama_ayah ||
              (existingPendaftaran?.orang_tua?.nama_ayah && existingPendaftaran.orang_tua.nama_ayah !== '-'
                ? existingPendaftaran.orang_tua.nama_ayah
                : ''),
            pekerjaan_ayah:
              student.pekerjaan_ayah ||
              (existingPendaftaran?.orang_tua?.pekerjaan_ayah && existingPendaftaran.orang_tua.pekerjaan_ayah !== '-'
                ? existingPendaftaran.orang_tua.pekerjaan_ayah
                : ''),
            nama_ibu:
              student.nama_ibu ||
              (existingPendaftaran?.orang_tua?.nama_ibu && existingPendaftaran.orang_tua.nama_ibu !== '-'
                ? existingPendaftaran.orang_tua.nama_ibu
                : ''),
            pekerjaan_ibu:
              student.pekerjaan_ibu ||
              (existingPendaftaran?.orang_tua?.pekerjaan_ibu && existingPendaftaran.orang_tua.pekerjaan_ibu !== '-'
                ? existingPendaftaran.orang_tua.pekerjaan_ibu
                : ''),
            no_hp_orang_tua:
              student.no_hp_orang_tua ||
              (existingPendaftaran?.orang_tua?.no_hp_orang_tua && existingPendaftaran.orang_tua.no_hp_orang_tua !== '-'
                ? existingPendaftaran.orang_tua.no_hp_orang_tua
                : ''),
            alamat_orang_tua:
              student.alamat_orang_tua ||
              (existingPendaftaran?.orang_tua?.alamat_orang_tua && existingPendaftaran.orang_tua.alamat_orang_tua !== '-'
                ? existingPendaftaran.orang_tua.alamat_orang_tua
                : ''),
            pengalaman_organisasi: parsedPendukung.pengalaman_organisasi,
            bahasa_asing: parsedPendukung.bahasa_asing,
            motivasi: parsedPendukung.motivasi,
          }));

          if (parsedPendukung.bahasa_asing) {
            const raw = parsedPendukung.bahasa_asing;
            const det = deteksiSkorBahasa(raw);
            if (det.jenis === 'TOEFL' || det.jenis === 'IELTS' || det.jenis === 'TOEIC' || det.jenis === 'TOAFL') {
              if (raw.includes('Poin 0') || raw.includes('Skor Sistem: 0') || raw.toLowerCase().includes('belum')) {
                setBahasaInggrisJenis('NONE');
                setBahasaInggrisSkor('0');
                setSelectedEnglishPoin(0);
              } else {
                setBahasaInggrisJenis(det.jenis);
                if (det.skor !== null) setBahasaInggrisSkor(String(det.skor));
                if (det.jenjang) setSelectedEnglishPoin(det.jenjang.poin);
              }
            } else if (raw.includes('Poin 0') || raw.includes('Belum')) {
              setBahasaInggrisJenis('NONE');
              setBahasaInggrisSkor('0');
              setSelectedEnglishPoin(0);
            }
          }

          if (existingPendaftaran) {
            setHasSavedPendaftaran(true);
            if (existingPendaftaran.status_pendaftaran && existingPendaftaran.status_pendaftaran !== 'Draft') {
              setSetujuPernyataan(true);
            }
            if (existingPendaftaran.dokumen && Array.isArray(existingPendaftaran.dokumen)) {
              const docMap: Record<number, any> = {};
              existingPendaftaran.dokumen.forEach((d: any) => {
                docMap[d.id_persyaratan] = {
                  id_dokumen: d.id_dokumen,
                  file_path: d.file_path,
                  status: d.status,
                  file_name: d.file_path ? d.file_path.split('/').pop() : 'Berkas Terlampir',
                };
              });
              setUploadedDocs(docMap);
            }
          }
        }
      } catch (err) {
        console.error('Error loading form init data:', err);
      } finally {
        setIsLoading(false);
      }
    }
    loadForm();
  }, []);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, idPersyaratan: number) => {
    const file = e.target.files?.[0];
    if (!file || !userId) return;

    setUploadingId(idPersyaratan);
    setStatusMessage(null);

    try {
      const formPayload = new FormData();
      formPayload.append('file', file);
      formPayload.append('id_persyaratan', String(idPersyaratan));
      formPayload.append('userId', String(userId));

      const res = await fetch('/api/mahasiswa/dokumen/upload', {
        method: 'POST',
        body: formPayload,
      });

      const resJson = await res.json();
      if (res.ok && resJson.success) {
        setUploadedDocs((prev) => ({
          ...prev,
          [idPersyaratan]: {
            id_dokumen: resJson.data.id_dokumen,
            file_path: resJson.data.file_path,
            file_name: resJson.data.file_name || file.name,
            status: resJson.data.status,
          },
        }));
        setHasSavedPendaftaran(true);
        setStatusMessage({
          type: 'success',
          text: resJson.message || 'Berkas berhasil diunggah dari folder internal!',
        });
      } else {
        setStatusMessage({
          type: 'error',
          text: resJson.message || 'Gagal mengunggah berkas.',
        });
      }
    } catch (err: any) {
      console.error('Error uploading file:', err);
      setStatusMessage({
        type: 'error',
        text: 'Terjadi kesalahan koneksi saat mengunggah berkas.',
      });
    } finally {
      setUploadingId(null);
      e.target.value = '';
    }
  };

  const handlePasFotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 3 * 1024 * 1024) {
        setStatusMessage({ type: 'error', text: 'Ukuran foto maksimal 3MB!' });
        return;
      }
      const reader = new FileReader();
      reader.onload = (event) => {
        const base64 = event.target?.result as string;
        if (base64) {
          setPasFotoSrc(base64);
          if (typeof window !== 'undefined') {
            localStorage.setItem(`avatar_${userId || 'mhs'}`, base64);
            const stored = localStorage.getItem('currentUser');
            if (stored) {
              try {
                const parsed = JSON.parse(stored);
                parsed.avatarUrl = base64;
                localStorage.setItem('currentUser', JSON.stringify(parsed));
              } catch {}
            }
          }
          setStatusMessage({ type: 'success', text: 'Pas foto resmi berhasil disimpan!' });
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemovePasFoto = () => {
    setPasFotoSrc(null);
    if (typeof window !== 'undefined') {
      localStorage.removeItem(`avatar_${userId || 'mhs'}`);
      const stored = localStorage.getItem('currentUser');
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          delete parsed.avatarUrl;
          localStorage.setItem('currentUser', JSON.stringify(parsed));
        } catch {}
      }
    }
    setStatusMessage({ type: 'success', text: 'Pas foto berhasil dihapus.' });
  };

  const minIpkReq = akademikConfig?.min_ipk ?? 3.5;
  const minSemReq = akademikConfig?.min_semester ?? 6;
  const maxSemReq = akademikConfig?.max_semester ?? 8;
  const isMahasiswaAktif = isStudentAktif;
  const isSemesterValid = Number(formData.semester) >= minSemReq && Number(formData.semester) <= maxSemReq;
  const isIpkValid = Number(formData.ipk) >= minIpkReq;

  const allowedProdiNames = useMemo(() => {
    if (!akademikConfig) return 'Seluruh Program Studi S1';
    if (akademikConfig.all_prodi) return 'Seluruh Program Studi S1';
    const allowedIds: number[] = Array.isArray(akademikConfig.allowed_prodi_ids)
      ? akademikConfig.allowed_prodi_ids.map(Number)
      : [];
    if (allowedIds.length === 0) return 'Belum ada jurusan yang dibuka';
    if (Array.isArray(akademikConfig.prodiList)) {
      const names = akademikConfig.prodiList
        .filter((p: any) => allowedIds.includes(Number(p.id_prodi)))
        .map((p: any) => p.nama_prodi);
      if (names.length > 0) return names.join(', ');
    }
    return `${allowedIds.length} Program Studi Terpilih`;
  }, [akademikConfig]);

  const isProdiValid = useMemo(() => {
    if (!akademikConfig) return true;
    if (akademikConfig.status === false) return true;
    if (akademikConfig.all_prodi) return true;
    const allowedIds: number[] = Array.isArray(akademikConfig.allowed_prodi_ids)
      ? akademikConfig.allowed_prodi_ids.map(Number)
      : [];
    if (allowedIds.length === 0) return false;

    if (formData.id_prodi && allowedIds.includes(Number(formData.id_prodi))) {
      return true;
    }

    if (formData.prodi && Array.isArray(akademikConfig.prodiList)) {
      const currentNameClean = formData.prodi.trim().toLowerCase();
      const match = akademikConfig.prodiList.find(
        (p: any) => p.nama_prodi?.trim().toLowerCase() === currentNameClean
      );
      if (match && allowedIds.includes(Number(match.id_prodi))) {
        return true;
      }
    }

    return false;
  }, [akademikConfig, formData.prodi, formData.id_prodi]);

  const isEligibleToSubmit =
    akademikConfig?.status === false
      ? true
      : (isMahasiswaAktif && isSemesterValid && isIpkValid && isProdiValid);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleNextStep = () => {
    if (!isHasilPublished && isUploadWindowOpen) {
      if (activeStep === 0) {
        if (!formData.asal_sekolah.trim()) {
          setStatusMessage({
            type: 'error',
            text: 'Asal Sekolah wajib diisi sesuai format resmi!',
          });
          return;
        }
        if (!isAsalSekolahValid(formData.asal_sekolah)) {
          setStatusMessage({
            type: 'error',
            text: 'Format penulisan Asal Sekolah belum sesuai! Wajib diawali jenis sekolah resmi dan mencakup nama serta kota (Contoh yang diterima: SMK Negeri 1 Kota Cirebon atau SMA Negeri 1 Kota Cirebon).',
          });
          return;
        }
      }

      if (activeStep === 2) {
        if (!formData.pengalaman_organisasi.trim() || formData.pengalaman_organisasi.trim().length < 15) {
          setStatusMessage({
            type: 'error',
            text: 'Pengalaman Organisasi / Kepanitiaan wajib diisi minimal 15 karakter!',
          });
          return;
        }
        if (!formData.bahasa_asing.trim() || formData.bahasa_asing.trim().length < 5) {
          setStatusMessage({
            type: 'error',
            text: 'Kemampuan Bahasa Asing wajib diisi minimal 5 karakter (contoh: Bahasa Inggris, Bahasa Arab, skor TOEFL)!',
          });
          return;
        }
        if (!formData.motivasi.trim() || formData.motivasi.trim().length < 50) {
          setStatusMessage({
            type: 'error',
            text: `Esai Motivasi KKN Internasional minimal 50 karakter (saat ini: ${formData.motivasi.trim().length} karakter)!`,
          });
          return;
        }
      }
    }
    setActiveStep((prev) => Math.min(prev + 1, FORM_STEPS.length - 1));
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleSaveOrSubmit = async (isDraft: boolean) => {
    if (!userId) return;

    if (!isDraft) {
      if (!formData.asal_sekolah.trim() || !isAsalSekolahValid(formData.asal_sekolah)) {
        setActiveStep(0);
        setStatusMessage({
          type: 'error',
          text: 'Format penulisan Asal Sekolah belum valid! Wajib menggunakan format resmi lengkap (Contoh format yang diterima: SMK Negeri 1 Kota Cirebon atau SMA Negeri 1 Kota Cirebon).',
        });
        return;
      }

      if (!formData.no_hp.trim()) {
        setActiveStep(0);
        setStatusMessage({ type: 'error', text: 'Nomor WhatsApp / HP aktif wajib diisi!' });
        return;
      }
      if (!formData.alamat.trim()) {
        setActiveStep(0);
        setStatusMessage({ type: 'error', text: 'Alamat domisili lengkap wajib diisi!' });
        return;
      }
      if (!formData.tempat_lahir.trim()) {
        setActiveStep(0);
        setStatusMessage({ type: 'error', text: 'Tempat lahir wajib diisi!' });
        return;
      }

      if (!formData.pengalaman_organisasi.trim() || formData.pengalaman_organisasi.trim().length < 15) {
        setActiveStep(2);
        setStatusMessage({
          type: 'error',
          text: 'Pengalaman Organisasi / Kepanitiaan wajib diisi minimal 15 karakter!',
        });
        return;
      }
      if (!formData.bahasa_asing.trim() || formData.bahasa_asing.trim().length < 5) {
        setActiveStep(2);
        setStatusMessage({
          type: 'error',
          text: 'Kemampuan Bahasa Asing wajib diisi minimal 5 karakter!',
        });
        return;
      }
      if (!formData.motivasi.trim() || formData.motivasi.trim().length < 50) {
        setActiveStep(2);
        setStatusMessage({
          type: 'error',
          text: `Esai Motivasi KKN Internasional minimal 50 karakter (saat ini: ${formData.motivasi.trim().length} karakter)!`,
        });
        return;
      }

      if (persyaratanList.length > 0) {
        const missingMandatoryDocs = persyaratanList.filter(
          (doc) => doc.wajib && !uploadedDocs[doc.id_persyaratan]?.file_path
        );

        if (missingMandatoryDocs.length > 0) {
          setActiveStep(4);
          setStatusMessage({
            type: 'error',
            text: `Pendaftaran tidak dapat dikirim! Anda belum mengunggah berkas wajib berikut: ${missingMandatoryDocs
              .map((d) => d.nama_persyaratan)
              .join(', ')}. Harap lengkapi semua dokumen bertanda (Wajib) terlebih dahulu.`,
          });
          return;
        }
      }

      if (!setujuPernyataan) {
        setActiveStep(5);
        setStatusMessage({
          type: 'error',
          text: 'Anda wajib mencentang Pernyataan Persetujuan Pendaftar terlebih dahulu sebelum mengirimkan pendaftaran resmi!',
        });
        return;
      }

      if (!isEligibleToSubmit) {
        if (!isProdiValid) {
          setStatusMessage({
            type: 'error',
            text: `Pendaftaran resmi tidak dapat dikirim: Program studi Anda (${formData.prodi || 'Program Studi Anda'}) tidak dibuka untuk pendaftaran KKN Internasional periode ini (Hanya dibuka untuk: ${allowedProdiNames}). Silakan simpan sebagai Draft jika diperlukan.`,
          });
          return;
        }
        setStatusMessage({
          type: 'error',
          text: `Pendaftaran resmi tidak dapat dikirim karena persyaratan akademik belum terpenuhi (Wajib Mahasiswa Aktif, Semester ${minSemReq}-${maxSemReq}, dan IPK minimal ${minIpkReq.toFixed(2)}). Silakan simpan sebagai Draft.`,
        });
        return;
      }
    }

    setIsSubmitting(true);
    setStatusMessage(null);

    try {
      const res = await fetch('/api/mahasiswa/pendaftaran', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          isDraft,
          jenis_kelamin: formData.jenis_kelamin,
          no_hp: formData.no_hp,
          alamat: formData.alamat,
          tempat_lahir: formData.tempat_lahir,
          tanggal_lahir: formData.tanggal_lahir,
          asal_sekolah: formData.asal_sekolah,
          total_sks: formData.total_sks,
          ipk: formData.ipk,
          deskripsi_diri: serializeDeskripsiDiri(
            formData.pengalaman_organisasi,
            formData.bahasa_asing,
            formData.motivasi
          ),
          golongan_darah: formData.golongan_darah,
          riwayat_penyakit: formData.riwayat_penyakit,
          alergi: formData.alergi,
          ukuran_kaos: formData.ukuran_kaos,
          id_periode_negara: formData.id_periode_negara,
          nama_ayah: formData.nama_ayah,
          pekerjaan_ayah: formData.pekerjaan_ayah,
          nama_ibu: formData.nama_ibu,
          pekerjaan_ibu: formData.pekerjaan_ibu,
          alamat_orang_tua: formData.alamat_orang_tua,
          no_hp_orang_tua: formData.no_hp_orang_tua,
        }),
      });

      const json = await res.json();
      if (json.success) {
        setStatusMessage({
          type: 'success',
          text: json.message || (isDraft ? 'Draft berhasil disimpan!' : 'Pendaftaran berhasil dikirim!'),
        });
        if (!isDraft) {
          setTimeout(() => {
            router.push('/mahasiswa/status_pendaftaran');
          }, 1500);
        }
      } else {
        setStatusMessage({ type: 'error', text: json.message || 'Gagal menyimpan data.' });
      }
    } catch {
      setStatusMessage({ type: 'error', text: 'Terjadi kesalahan jaringan.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <MahasiswaFormPendaftaranView
      isLoading={isLoading}
      isRegistrationOpen={isRegistrationOpen}
      closedMessage={closedMessage}
      activePeriodeInfo={activePeriodeInfo}
      isUploadWindowOpen={isUploadWindowOpen}
      uploadWindowMessage={uploadWindowMessage}
      isHasilPublished={isHasilPublished}
      statusMessage={statusMessage}
      setStatusMessage={setStatusMessage}
      isEligibleToSubmit={isEligibleToSubmit}
      isProdiValid={isProdiValid}
      isMahasiswaAktif={isMahasiswaAktif}
      isSemesterValid={isSemesterValid}
      isIpkValid={isIpkValid}
      minSemReq={minSemReq}
      maxSemReq={maxSemReq}
      minIpkReq={minIpkReq}
      allowedProdiNames={allowedProdiNames}
      formSteps={FORM_STEPS}
      activeStep={activeStep}
      setActiveStep={setActiveStep}
      formData={formData}
      handleChange={handleChange}
      isAsalSekolahValid={isAsalSekolahValid}
      pasFotoSrc={pasFotoSrc}
      pasFotoInputRef={pasFotoInputRef}
      handlePasFotoChange={handlePasFotoChange}
      handleRemovePasFoto={handleRemovePasFoto}
      bahasaInggrisJenis={bahasaInggrisJenis}
      setBahasaInggrisJenis={setBahasaInggrisJenis}
      bahasaInggrisSkor={bahasaInggrisSkor}
      setBahasaInggrisSkor={setBahasaInggrisSkor}
      setSelectedEnglishPoin={setSelectedEnglishPoin}
      showEssayPreview={showEssayPreview}
      setShowEssayPreview={setShowEssayPreview}
      motivasiRef={motivasiRef}
      applyFormatting={applyFormatting}
      renderFormattedPreview={renderFormattedPreview}
      hasSavedPendaftaran={hasSavedPendaftaran}
      persyaratanList={persyaratanList}
      uploadedDocs={uploadedDocs}
      uploadingId={uploadingId}
      handleFileUpload={handleFileUpload}
      setujuPernyataan={setujuPernyataan}
      setSetujuPernyataan={setSetujuPernyataan}
      isSubmitting={isSubmitting}
      handleNextStep={handleNextStep}
      handleSaveOrSubmit={handleSaveOrSubmit}
    />
  );
}
