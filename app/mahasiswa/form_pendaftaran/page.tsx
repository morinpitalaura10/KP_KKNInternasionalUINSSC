'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ChevronRight,
  ChevronLeft,
  ChevronDown,
  Save,
  Send,
  CheckCircle2,
  XCircle,
  AlertCircle,
  AlertTriangle,
  Loader2,
  Lock,
  Globe,
  Award,
  GraduationCap,
  Upload,
  Eye,
  FileText,
  Printer,
  Camera,
  UploadCloud,
  User,
  ShieldCheck,
  Bold,
  Italic,
  List,
  Sparkles,
  Calculator,
  HelpCircle,
  Check,
} from 'lucide-react';
import { PageHeader, AlertBanner } from '@/components/ui';
import {
  RUBRIK_BAHASA_JENJANG,
  RUBRIK_ARAB_JENJANG,
  hitungSkorToefl,
  hitungSkorIelts,
  hitungSkorToeic,
  hitungSkorToafl,
  deteksiSkorBahasa,
} from '@/lib/rubrikBahasa';

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

interface FormState {
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

interface PersyaratanOption {
  id_persyaratan: number;
  nama_persyaratan: string;
  deskripsi: string;
  format_file: string;
  ukuran_maksimal: number;
  wajib: boolean;
}

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
  const [closedMessage, setClosedMessage] = useState<string | null>(null);
  const [uploadWindowMessage, setUploadWindowMessage] = useState<string | null>(null);

  // Standarisasi Rubrik Kemampuan Bahasa Asing (Mahasiswa Input)
  const [bahasaInggrisJenis, setBahasaInggrisJenis] = useState<'TOEFL' | 'IELTS' | 'TOEIC' | 'NONE'>('TOEFL');
  const [bahasaInggrisSkor, setBahasaInggrisSkor] = useState<string>('');
  const [selectedEnglishPoin, setSelectedEnglishPoin] = useState<number | null>(null);
  const [bahasaArabJenis, setBahasaArabJenis] = useState<'NONE' | 'TOAFL' | 'LISAN'>('NONE');
  const [bahasaArabSkor, setBahasaArabSkor] = useState<string>('');
  const [bahasaLainnya, setBahasaLainnya] = useState<string>('');
  const [showPanduanRubrikMhs, setShowPanduanRubrikMhs] = useState<boolean>(false);

  // Sinkronisasi otomatis dari Rubrik Bahasa ke formData.bahasa_asing
  useEffect(() => {
    const parts: string[] = [];

    if (bahasaInggrisJenis === 'NONE' || selectedEnglishPoin === 0) {
      parts.push('Bahasa Inggris: Belum Memiliki Sertifikat Tes Resmi (Skor Sistem: 0)');
    } else if (bahasaInggrisSkor) {
      const num = Number(bahasaInggrisSkor);
      const j =
        bahasaInggrisJenis === 'TOEFL'
          ? hitungSkorToefl(num)
          : bahasaInggrisJenis === 'IELTS'
          ? hitungSkorIelts(num)
          : hitungSkorToeic(num);
      parts.push(`Bahasa Inggris: ${bahasaInggrisJenis} ${bahasaInggrisSkor} (Skor Standar: ${j.nilaiStandar} - ${j.predikat})`);
    } else if (selectedEnglishPoin !== null) {
      const j = RUBRIK_BAHASA_JENJANG.find((r) => r.poin === selectedEnglishPoin);
      if (j) {
        parts.push(`Bahasa Inggris: Skor Standar ${j.nilaiStandar} (${j.predikat})`);
      }
    }

    if (bahasaArabJenis === 'TOAFL') {
      if (bahasaArabSkor) {
        const num = Number(bahasaArabSkor);
        const j = hitungSkorToafl(num);
        parts.push(`Bahasa Arab: TOAFL ${bahasaArabSkor} (Poin ${j.poin} - ${j.predikat})`);
      } else {
        parts.push('Bahasa Arab: TOAFL');
      }
    } else if (bahasaArabJenis === 'LISAN') {
      parts.push('Bahasa Arab: Muhadatsah / Kemampuan Lisan Aktif');
    }

    if (bahasaLainnya.trim()) {
      parts.push(bahasaLainnya.trim());
    }

    const result = parts.join(', ');
    if (result) {
      setFormData((prev) => (prev.bahasa_asing === result ? prev : { ...prev, bahasa_asing: result }));
    }
  }, [
    bahasaInggrisJenis,
    bahasaInggrisSkor,
    selectedEnglishPoin,
    bahasaArabJenis,
    bahasaArabSkor,
    bahasaLainnya,
  ]);

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
            closedMessage: closedMsg,
            uploadWindowMessage: uploadMsg,
          } = json.data;

          setIsRegistrationOpen(regOpen !== false);
          setIsUploadWindowOpen(uploadOpen !== false);
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
            if (det.jenis === 'TOEFL' || det.jenis === 'IELTS' || det.jenis === 'TOEIC') {
              setBahasaInggrisJenis(det.jenis);
              if (det.skor) setBahasaInggrisSkor(String(det.skor));
              if (det.jenjang) setSelectedEnglishPoin(det.jenjang.poin);
            } else if (raw.includes('Poin 0') || raw.includes('Belum')) {
              setBahasaInggrisJenis('NONE');
              setSelectedEnglishPoin(0);
            }
            if (raw.toLowerCase().includes('toafl')) {
              setBahasaArabJenis('TOAFL');
              if (det.arabSkor) setBahasaArabSkor(String(det.arabSkor));
            } else if (
              raw.toLowerCase().includes('muhadatsah') ||
              raw.toLowerCase().includes('lisan')
            ) {
              setBahasaArabJenis('LISAN');
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

  // Upload handler for internal files
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

  // Dynamic eligibility evaluation based on admin configuration
  const minIpkReq = akademikConfig?.min_ipk ?? 3.5;
  const minSemReq = akademikConfig?.min_semester ?? 6;
  const maxSemReq = akademikConfig?.max_semester ?? 8;
  const isMahasiswaAktif = isStudentAktif;
  const isSemesterValid = Number(formData.semester) >= minSemReq && Number(formData.semester) <= maxSemReq;
  const isIpkValid = Number(formData.ipk) >= minIpkReq;

  // Nama-nama program studi yang dibuka pada periode aktif
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

  // Evaluasi apakah program studi mahasiswa termasuk yang dibuka
  const isProdiValid = useMemo(() => {
    if (!akademikConfig) return true;
    if (akademikConfig.status === false) return true;
    if (akademikConfig.all_prodi) return true;
    const allowedIds: number[] = Array.isArray(akademikConfig.allowed_prodi_ids)
      ? akademikConfig.allowed_prodi_ids.map(Number)
      : [];
    if (allowedIds.length === 0) return false;

    // 1. Cek berdasarkan ID Prodi jika ada
    if (formData.id_prodi && allowedIds.includes(Number(formData.id_prodi))) {
      return true;
    }

    // 2. Cek berdasarkan nama Prodi di prodiList
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
    setActiveStep((prev) => Math.min(prev + 1, FORM_STEPS.length - 1));
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleSaveOrSubmit = async (isDraft: boolean) => {
    if (!userId) return;

    if (!isDraft) {
      // 1. Validasi Asal Sekolah
      if (!formData.asal_sekolah.trim() || !isAsalSekolahValid(formData.asal_sekolah)) {
        setActiveStep(0);
        setStatusMessage({
          type: 'error',
          text: 'Format penulisan Asal Sekolah belum valid! Wajib menggunakan format resmi lengkap (Contoh format yang diterima: SMK Negeri 1 Kota Cirebon atau SMA Negeri 1 Kota Cirebon).',
        });
        return;
      }

      // 2. Validasi Kelengkapan Biodata Dasar
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

      // Validasi Data Pendukung & Esai Motivasi
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

      // 3. Validasi Dokumen Persyaratan Wajib
      if (persyaratanList.length > 0) {
        const missingMandatoryDocs = persyaratanList.filter(
          (doc) => doc.wajib && !uploadedDocs[doc.id_persyaratan]?.file_path
        );

        if (missingMandatoryDocs.length > 0) {
          setActiveStep(4); // Arahkan pengguna ke tab Dokumen Persyaratan
          setStatusMessage({
            type: 'error',
            text: `Pendaftaran tidak dapat dikirim! Anda belum mengunggah berkas wajib berikut: ${missingMandatoryDocs
              .map((d) => d.nama_persyaratan)
              .join(', ')}. Harap lengkapi semua dokumen bertanda (Wajib) terlebih dahulu.`,
          });
          return;
        }
      }

      // 4. Validasi Pernyataan Persetujuan
      if (!setujuPernyataan) {
        setActiveStep(5);
        setStatusMessage({
          type: 'error',
          text: 'Anda wajib mencentang Pernyataan Persetujuan Pendaftar terlebih dahulu sebelum mengirimkan pendaftaran resmi!',
        });
        return;
      }

      // 5. Guard: only draft is allowed if requirements are not met
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

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[350px]">
        <Loader2 className="w-10 h-10 text-[#0E4A3E] animate-spin mb-3" />
        <p className="text-sm font-semibold text-slate-600">Memuat formulir pendaftaran...</p>
      </div>
    );
  }

  if (!isRegistrationOpen) {
    return (
      <div className="w-full max-w-7xl space-y-6 pb-12 font-sans">
        <PageHeader
          title="FORM PENDAFTARAN"
          subtitle="KULIAH KERJA NYATA INTERNASIONAL"
          description="Lengkapi data pendaftaran Anda dengan cermat sesuai dokumen resmi."
        />

        <div className="bg-white rounded-2xl border-2 border-red-200 shadow-xs p-8 sm:p-10 text-center max-w-2xl mx-auto my-8 space-y-5">
          <div className="w-16 h-16 rounded-2xl bg-red-50 border border-red-200 text-red-600 flex items-center justify-center mx-auto shadow-2xs">
            <Lock className="w-8 h-8" />
          </div>
          <div className="space-y-2">
            <span className="inline-flex items-center gap-1.5 text-[11px] font-extrabold uppercase tracking-wider text-red-700 bg-red-50 border border-red-200 px-3 py-1 rounded-full">
              Pendaftaran Ditutup
            </span>
            <h3 className="text-xl font-extrabold text-slate-900">
              Tidak Ada Periode Pendaftaran yang Aktif
            </h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              {closedMessage ||
                'Saat ini tidak ada gelombang pendaftaran KKN Internasional yang berstatus Aktif atau jadwal pendaftaran telah berakhir. Formulir pendaftaran baru dapat diakses kembali apabila Admin LP2M telah membuka periode/gelombang pendaftaran berikutnya.'}
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <Link
              href="/mahasiswa/informasi"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#0E4A3E] hover:bg-[#08362d] text-white rounded-full text-xs font-bold transition-all shadow-xs"
            >
              <FileText className="w-4 h-4" />
              Lihat Informasi & Jadwal Periode
            </Link>
            <Link
              href="/mahasiswa/status_pendaftaran"
              className="inline-flex items-center gap-2 px-5 py-2.5 border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-full text-xs font-bold transition-colors"
            >
              Lihat Status Pendaftaran
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-7xl space-y-6 pb-12 font-sans">
      {/* Title */}
      <PageHeader
        title="FORM PENDAFTARAN"
        subtitle={
          activePeriodeInfo
            ? `${activePeriodeInfo.nama_periode.toUpperCase()} (${activePeriodeInfo.tahun})`
            : 'KULIAH KERJA NYATA INTERNASIONAL'
        }
        description="Lengkapi data pendaftaran Anda dengan cermat sesuai dokumen resmi."
      />

      {/* ── Status Message Toast ── */}
      <AlertBanner message={statusMessage} onClose={() => setStatusMessage(null)} />

      {/* ── Banner Jadwal Pengiriman Dokumen & Pendaftaran Ditutup ── */}
      {!isUploadWindowOpen && uploadWindowMessage && (
        <div className="bg-red-50/90 border-2 border-red-300 rounded-2xl p-4 sm:p-5 flex items-start gap-3.5 text-red-950 shadow-2xs">
          <Lock className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
          <div className="space-y-1 flex-1">
            <h4 className="font-extrabold text-sm text-red-900">
              Jadwal Pengiriman Dokumen & Pendaftaran Tidak Aktif
            </h4>
            <p className="text-xs text-red-800 leading-relaxed">{uploadWindowMessage}</p>
          </div>
        </div>
      )}

      {/* ── Syarat Kelayakan Akademik Banner (Semester, Mahasiswa Aktif, IPK, dan Program Studi Dibuka) ── */}
      {!isEligibleToSubmit ? (
        <div className="bg-amber-50/90 border-2 border-amber-300 rounded-2xl p-4 sm:p-5 flex items-start gap-3.5 mb-6 text-amber-950 shadow-2xs">
          <AlertTriangle className="w-6 h-6 text-amber-600 shrink-0 mt-0.5" />
          <div className="space-y-1.5 flex-1">
            <h4 className="font-extrabold text-sm sm:text-base text-amber-900 leading-tight">
              {!isProdiValid
                ? `Program Studi Tidak Dibuka untuk Periode Ini`
                : `Persyaratan Akademik Belum Terpenuhi`}
            </h4>
            <p className="text-xs text-amber-800">
              {!isProdiValid
                ? `Pendaftaran KKN Internasional periode aktif ini tidak dibuka untuk program studi ${formData.prodi || 'Anda'}. Hanya dibuka khusus untuk: ${allowedProdiNames}.`
                : `Sesuai ketentuan LP2M, pendaftaran resmi KKN Internasional hanya dapat diajukan oleh mahasiswa yang memenuhi kriteria berikut:`}
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 pt-1">
              {/* Mahasiswa Aktif */}
              <div
                className={`p-2.5 rounded-xl border text-xs font-bold flex items-center gap-2 ${
                  isMahasiswaAktif
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                    : 'bg-red-50 border-red-200 text-red-800'
                }`}
              >
                {isMahasiswaAktif ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                ) : (
                  <XCircle className="w-4 h-4 text-red-600 shrink-0" />
                )}
                <span>Mahasiswa Aktif</span>
              </div>

              {/* Semester */}
              <div
                className={`p-2.5 rounded-xl border text-xs font-bold flex items-center gap-2 ${
                  isSemesterValid
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                    : 'bg-red-50 border-red-200 text-red-800'
                }`}
              >
                {isSemesterValid ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                ) : (
                  <XCircle className="w-4 h-4 text-red-600 shrink-0" />
                )}
                <span>
                  Semester {minSemReq}–{maxSemReq} (Anda: Smt {formData.semester})
                </span>
              </div>

              {/* IPK */}
              <div
                className={`p-2.5 rounded-xl border text-xs font-bold flex items-center gap-2 ${
                  isIpkValid
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                    : 'bg-red-50 border-red-200 text-red-800'
                }`}
              >
                {isIpkValid ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                ) : (
                  <XCircle className="w-4 h-4 text-red-600 shrink-0" />
                )}
                <span>
                  IPK Min. {minIpkReq.toFixed(2)} (Anda: {formData.ipk ? formData.ipk.toFixed(2) : '0.00'})
                </span>
              </div>

              {/* Program Studi */}
              <div
                className={`p-2.5 rounded-xl border text-xs font-bold flex items-center gap-2 ${
                  isProdiValid
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                    : 'bg-red-50 border-red-200 text-red-800'
                }`}
              >
                {isProdiValid ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                ) : (
                  <XCircle className="w-4 h-4 text-red-600 shrink-0" />
                )}
                <span className="truncate" title={isProdiValid ? `Prodi Dibuka: ${formData.prodi}` : `Prodi ${formData.prodi} Tidak Dibuka (Hanya dibuka: ${allowedProdiNames})`}>
                  {isProdiValid
                    ? `Prodi Dibuka: ${formData.prodi}`
                    : `Prodi Tidak Dibuka: ${formData.prodi}`}
                </span>
              </div>
            </div>
            <p className="text-[11px] font-bold text-amber-900 bg-amber-100/70 px-3 py-1.5 rounded-lg border border-amber-200 mt-2">
              {!isProdiValid
                ? `⚠ Karena Program Studi ${formData.prodi} tidak termasuk dalam jurusan yang dibuka untuk periode ini, Anda hanya dapat menyimpan data sebagai Draft. Tombol "Kirim Pendaftaran" dinonaktifkan.`
                : `⚠ Karena kriteria akademik belum memenuhi, Anda hanya dapat menyimpan data sebagai Draft. Tombol "Kirim Pendaftaran" dinonaktifkan.`}
            </p>
          </div>
        </div>
      ) : (
        <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-3.5 mb-6 flex items-center gap-3 text-xs font-bold text-emerald-900 shadow-2xs">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>
            Persyaratan Akademik Terpenuhi: Mahasiswa Aktif • Semester {formData.semester} (Memenuhi syarat Semester {minSemReq}–{maxSemReq}) • IPK {formData.ipk.toFixed(2)} (Memenuhi standar min. {minIpkReq.toFixed(2)}) • Program Studi {formData.prodi} (Terbuka). Anda berhak mengirimkan pendaftaran resmi.
          </span>
        </div>
      )}

      {/* Step Indicator */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-4 mb-6 overflow-x-auto">
        <div className="flex items-center gap-0 min-w-max">
          {FORM_STEPS.map((step, i) => (
            <div
              key={i}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold transition-all whitespace-nowrap cursor-default select-none ${
                i === activeStep
                  ? 'text-[#0E4A3E] font-bold'
                  : i < activeStep
                  ? 'text-[#568E7D]'
                  : 'text-slate-400'
              }`}
            >
              <span
                className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black shrink-0 ${
                  i === activeStep
                    ? 'bg-[#0E4A3E] text-white shadow-xs'
                    : i < activeStep
                    ? 'bg-[#568E7D] text-white'
                    : 'bg-gray-200 text-gray-400'
                }`}
              >
                {i + 1}
              </span>
              {step}
            </div>
          ))}
        </div>
      </div>

      {/* Form Content */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 sm:p-8">
        {/* STEP 0: Data Diri */}
        {activeStep === 0 && (
          <div>
            <h3 className="text-lg font-bold text-[#0E4A3E] mb-6">1. Data Diri</h3>

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

                {/* Petunjuk & Validasi Format Penulisan */}
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
            <h3 className="text-lg font-bold text-[#0E4A3E] mb-6">2. Data Akademik</h3>
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

              {/* ── Info Penempatan Negara (Mahasiswa TIDAK memilih negara) ── */}
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
            <div className="mb-6">
              <h3 className="text-lg font-bold text-[#0E4A3E]">3. Data Pendukung & Esai Motivasi</h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Lengkapi riwayat keikutsertaan organisasi, kemampuan bahasa asing, serta esai motivasi diri dengan jelas dan terstruktur untuk dinilai oleh tim pewawancara.
              </p>
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

              {/* ── Kemampuan Bahasa Asing (Standarisasi Penilaian Wawancara Berjenjang) ── */}
              <div className="sm:col-span-2 bg-gradient-to-r from-emerald-50/70 to-teal-50/70 border border-emerald-200 rounded-2xl p-4 sm:p-5 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-emerald-200">
                  <div className="flex items-center gap-2">
                    <Calculator className="w-5 h-5 text-[#0E4A3E]" />
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
                        Standarisasi penilaian wawancara: Pilih jenis & skor tes resmi bahasa Anda (Poin 0 = 0 jika belum ada tes).
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowPanduanRubrikMhs(!showPanduanRubrikMhs)}
                    className="text-[11px] font-bold text-[#0E4A3E] hover:underline flex items-center gap-1 self-start sm:self-auto cursor-pointer bg-white px-2.5 py-1 rounded-lg border border-emerald-200 shadow-2xs"
                  >
                    <HelpCircle className="w-3.5 h-3.5" />
                    <span>{showPanduanRubrikMhs ? 'Tutup Panduan Rubrik' : 'Lihat Panduan Skor & Poin'}</span>
                  </button>
                </div>

                {/* ── KELOMPOK 1: BAHASA INGGRIS (STANDAR UTAMA SELEKSI) ── */}
                <div className="bg-white p-4 rounded-xl border border-emerald-100 shadow-2xs space-y-3.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-800 uppercase tracking-wide">
                      1. Bahasa Inggris (Standar Utama)
                    </span>
                    <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 px-2.5 py-0.5 rounded-full">
                      Wajib Dipilih
                    </span>
                  </div>

                  {/* Jenis Tes Selector Buttons */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {(
                      [
                        { id: 'TOEFL', label: 'TOEFL (PBT/ITP)' },
                        { id: 'IELTS', label: 'IELTS' },
                        { id: 'TOEIC', label: 'TOEIC' },
                        { id: 'NONE', label: 'Belum Pernah Tes (Poin 0)' },
                      ] as const
                    ).map((t) => (
                      <button
                        key={t.id}
                        type="button"
                        onClick={() => {
                          setBahasaInggrisJenis(t.id);
                          if (t.id === 'NONE') {
                            setBahasaInggrisSkor('0');
                            setSelectedEnglishPoin(0);
                          } else {
                            if (bahasaInggrisSkor === '0') setBahasaInggrisSkor('');
                            if (bahasaInggrisSkor) {
                              const num = Number(bahasaInggrisSkor);
                              const j =
                                t.id === 'TOEFL'
                                  ? hitungSkorToefl(num)
                                  : t.id === 'IELTS'
                                  ? hitungSkorIelts(num)
                                  : hitungSkorToeic(num);
                              setSelectedEnglishPoin(j.poin);
                            }
                          }
                        }}
                        className={`py-2 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer border text-center ${
                          bahasaInggrisJenis === t.id
                            ? 'bg-[#0E4A3E] text-white border-[#0E4A3E] shadow-xs'
                            : 'bg-slate-50 text-slate-700 hover:bg-slate-100 border-slate-200'
                        }`}
                      >
                        {t.label}
                      </button>
                    ))}
                  </div>

                  {/* Input Skor (Kalkulator Skor) */}
                  {bahasaInggrisJenis !== 'NONE' && (
                    <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-2">
                      <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-center">
                        <div className="sm:col-span-5">
                          <label className="text-xs font-bold text-slate-800 block">
                            Kalkulator Skor {bahasaInggrisJenis}:
                          </label>
                          <span className="text-[10px] text-slate-400">
                            {bahasaInggrisJenis === 'TOEFL'
                              ? 'Rentang Skor: 310 - 677'
                              : bahasaInggrisJenis === 'IELTS'
                              ? 'Rentang Band: 0 - 9.0'
                              : 'Rentang Skor: 10 - 990'}
                          </span>
                        </div>
                        <div className="sm:col-span-4">
                          <input
                            type="number"
                            step={bahasaInggrisJenis === 'IELTS' ? '0.5' : '1'}
                            min="0"
                            max={bahasaInggrisJenis === 'IELTS' ? '9' : bahasaInggrisJenis === 'TOEIC' ? '990' : '677'}
                            placeholder={
                              bahasaInggrisJenis === 'TOEFL'
                                ? 'Contoh: 480'
                                : bahasaInggrisJenis === 'IELTS'
                                ? 'Contoh: 6.0'
                                : 'Contoh: 650'
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
                                    : hitungSkorToeic(num);
                                setSelectedEnglishPoin(j.poin);
                              } else {
                                setSelectedEnglishPoin(null);
                              }
                            }}
                            className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-sm font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0E4A3E]"
                          />
                        </div>
                        <div className="sm:col-span-3 text-[11px] text-slate-500 font-medium">
                          {selectedEnglishPoin !== null ? (
                            <span className="font-bold text-[#0E4A3E] bg-[#C0E6D8] px-2.5 py-1 rounded-md inline-block">
                              ✓ Skor {RUBRIK_BAHASA_JENJANG.find((r) => r.poin === selectedEnglishPoin)?.nilaiStandar ?? 0} Terpilih
                            </span>
                          ) : (
                            <span className="italic text-slate-400">*Masukkan skor tes Anda</span>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* 5 Jenjang Scoring Points Quick Cards */}
                  <div className="space-y-1.5 pt-1">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="font-bold text-slate-700">
                        Standarisasi Skor Seleksi (Otomatis Masuk ke Sistem):
                      </span>
                      <span className="text-slate-400 text-[10px]">
                        *Skor 0 (Tanpa Skor) s.d. Skor 50
                      </span>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                      {RUBRIK_BAHASA_JENJANG.map((r) => {
                        const isCurrentActive = selectedEnglishPoin === r.poin;
                        const labelTes =
                          bahasaInggrisJenis === 'TOEFL'
                            ? r.toeflLabel
                            : bahasaInggrisJenis === 'IELTS'
                            ? r.ieltsLabel
                            : bahasaInggrisJenis === 'TOEIC'
                            ? r.toeicLabel
                            : `Skor ${r.nilaiStandar}`;
                        return (
                          <button
                            key={r.poin}
                            type="button"
                            onClick={() => {
                              setSelectedEnglishPoin(r.poin);
                              if (r.poin === 0) {
                                setBahasaInggrisSkor('0');
                                setBahasaInggrisJenis('NONE');
                              } else {
                                if (bahasaInggrisJenis === 'NONE') setBahasaInggrisJenis('TOEFL');
                                const defaultScore =
                                  (bahasaInggrisJenis === 'NONE' ? 'TOEFL' : bahasaInggrisJenis) === 'TOEFL'
                                    ? r.poin === 1 ? '380' : r.poin === 2 ? '450' : r.poin === 3 ? '480' : '530'
                                    : (bahasaInggrisJenis === 'IELTS')
                                    ? r.poin === 1 ? '4.0' : r.poin === 2 ? '5.0' : r.poin === 3 ? '6.0' : '7.0'
                                    : r.poin === 1 ? '300' : r.poin === 2 ? '500' : r.poin === 3 ? '650' : '800';
                                if (!bahasaInggrisSkor || bahasaInggrisSkor === '0') {
                                  setBahasaInggrisSkor(defaultScore);
                                }
                              }
                            }}
                            className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                              isCurrentActive
                                ? 'bg-[#0E4A3E] text-white border-[#0E4A3E] shadow-sm ring-2 ring-[#0E4A3E]/30'
                                : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-800'
                            }`}
                          >
                            <div>
                              <div className="flex items-center justify-between gap-1">
                                <span
                                  className={`text-[10px] font-black uppercase px-1.5 py-0.5 rounded ${
                                    isCurrentActive ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-700'
                                  }`}
                                >
                                  Skor {r.nilaiStandar}
                                </span>
                                <span className="text-xs font-black">
                                  {r.nilaiStandar}
                                </span>
                              </div>
                              <p
                                className={`text-[11px] font-bold mt-1 line-clamp-1 ${
                                  isCurrentActive ? 'text-emerald-100' : 'text-slate-700'
                                }`}
                              >
                                {r.predikat}
                              </p>
                            </div>
                            <p
                              className={`text-[10px] mt-1 font-mono ${
                                isCurrentActive ? 'text-emerald-200' : 'text-slate-500'
                              }`}
                            >
                              {labelTes}
                            </p>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* ── KELOMPOK 2: BAHASA ARAB (OPSIONAL / NILAI TAMBAH) ── */}
                <div className="bg-white p-4 rounded-xl border border-teal-100 shadow-2xs space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-xs font-bold text-slate-800 uppercase tracking-wide block">
                        2. Kemampuan Bahasa Arab (Nilai Tambah / Opsional)
                      </span>
                      <p className="text-[11px] text-slate-500">
                        Opsional bagi pendaftar yang memiliki kemampuan bahasa Arab (TOAFL atau Muhadatsah).
                      </p>
                    </div>
                    <span className="text-[10px] font-bold bg-teal-50 text-teal-700 border border-teal-200 px-2.5 py-0.5 rounded-full shrink-0">
                      Opsional
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    {[
                      { id: 'NONE', label: 'Tidak Ada / Dasar' },
                      { id: 'TOAFL', label: 'TOAFL (Memiliki Skor Tes)' },
                      { id: 'LISAN', label: 'Muhadatsah / Lisan Aktif' },
                    ].map((a) => (
                      <button
                        key={a.id}
                        type="button"
                        onClick={() => {
                          setBahasaArabJenis(a.id as any);
                          if (a.id === 'NONE') setBahasaArabSkor('');
                        }}
                        className={`py-2 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer border text-center ${
                          bahasaArabJenis === a.id
                            ? 'bg-[#0E4A3E] text-white border-[#0E4A3E] shadow-xs'
                            : 'bg-slate-50 text-slate-700 hover:bg-slate-100 border-slate-200'
                        }`}
                      >
                        {a.label}
                      </button>
                    ))}
                  </div>

                  {bahasaArabJenis === 'TOAFL' && (
                    <div className="bg-teal-50/50 p-3 rounded-xl border border-teal-200 flex flex-col sm:flex-row items-start sm:items-center gap-3">
                      <label className="text-xs font-bold text-teal-900 whitespace-nowrap">
                        Masukkan Skor TOAFL:
                      </label>
                      <input
                        type="number"
                        min="0"
                        max="600"
                        placeholder="Contoh: 420"
                        value={bahasaArabSkor}
                        onChange={(e) => setBahasaArabSkor(e.target.value)}
                        className="w-full sm:w-40 px-3 py-1.5 bg-white border border-teal-300 rounded-lg text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0E4A3E]"
                      />
                      <span className="text-[11px] text-teal-700">
                        {bahasaArabSkor ? `✓ TOAFL ${bahasaArabSkor} tersimpan` : '*Skala standar TOAFL: 300 - 600'}
                      </span>
                    </div>
                  )}
                </div>

                {/* ── KELOMPOK 3: BAHASA LAINNYA & RINGKASAN FORM ── */}
                <div className="bg-white p-3.5 rounded-xl border border-slate-200 space-y-2">
                  <label className="text-xs font-bold text-slate-700 block">
                    Bahasa Asing Lainnya (Opsional):
                  </label>
                  <input
                    type="text"
                    placeholder="Contoh: Bahasa Mandarin tingkat percakapan, Bahasa Jepang JLPT N4 (jika ada)..."
                    value={bahasaLainnya}
                    onChange={(e) => setBahasaLainnya(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0E4A3E]"
                  />

                  {/* Ringkasan Isian Kemampuan Bahasa yang Disimpan */}
                  <div className="mt-2 p-2.5 bg-emerald-50 rounded-lg border border-emerald-200 flex items-center justify-between gap-2 text-xs">
                    <div>
                      <span className="font-bold text-[#0E4A3E] block text-[11px]">
                        Ringkasan Data yang Disimpan ke Pewawancara:
                      </span>
                      <p className="text-slate-700 mt-0.5 text-xs font-semibold">
                        {formData.bahasa_asing || 'Pilih jenis tes bahasa Inggris Anda di atas.'}
                      </p>
                    </div>
                    <span className="text-[10px] font-bold bg-[#0E4A3E] text-white px-2 py-0.5 rounded shrink-0">
                      {formData.bahasa_asing.trim().length >= 5 ? '✓ Tervalidasi' : 'Belum Lengkap'}
                    </span>
                  </div>
                </div>

                {/* Panduan Rubrik Lengkap Modal/Collapsible */}
                {showPanduanRubrikMhs && (
                  <div className="bg-white rounded-xl border border-slate-200 p-4 space-y-3 text-xs shadow-xs">
                    <div className="bg-[#0E4A3E] text-white px-3.5 py-2 font-bold text-xs uppercase tracking-wider rounded-lg">
                      Panduan Standarisasi Rubrik Bahasa Inggris (KKN Internasional)
                    </div>
                    <div className="overflow-x-auto">
                      <table className="w-full text-left divide-y divide-slate-200 text-[11px]">
                        <thead className="bg-slate-50 font-bold text-slate-700">
                          <tr>
                            <th className="px-3 py-2 text-center">Poin</th>
                            <th className="px-3 py-2">Predikat</th>
                            <th className="px-3 py-2">Skor TOEFL</th>
                            <th className="px-3 py-2">Band IELTS</th>
                            <th className="px-3 py-2">Skor TOEIC</th>
                            <th className="px-3 py-2 text-center">Nilai Wawancara</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 text-slate-700">
                          {RUBRIK_BAHASA_JENJANG.map((r) => (
                            <tr key={r.poin} className="hover:bg-slate-50">
                              <td className="px-3 py-2 text-center font-bold text-[#0E4A3E]">
                                Poin {r.poin}
                              </td>
                              <td className="px-3 py-2 font-bold">{r.predikat}</td>
                              <td className="px-3 py-2 font-mono">{r.toeflLabel}</td>
                              <td className="px-3 py-2 font-mono">{r.ieltsLabel}</td>
                              <td className="px-3 py-2 font-mono">{r.toeicLabel}</td>
                              <td className="px-3 py-2 text-center font-black text-[#0E4A3E]">
                                {r.nilaiStandar}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
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

                  {/* Formatting Toolbar */}
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
            <div className="mb-6">
              <h3 className="text-lg font-bold text-[#0E4A3E]">4. Data Tambahan</h3>
              <p className="text-xs text-slate-500">
                Lengkapi informasi perlengkapan atribut, kondisi kesehatan, serta nomor kontak darurat yang dapat dihubungi.
              </p>
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
              <div>
                <h3 className="text-lg font-bold text-[#0E4A3E]">5. Dokumen Persyaratan</h3>
                <p className="text-xs text-slate-500">
                  Unggah berkas resmi langsung dari folder internal komputer/perangkat Anda sesuai format yang ditentukan.
                </p>
              </div>
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

                        {/* Action buttons: View & Upload from Internal Folder */}
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
            <div className="mb-6">
              <h3 className="text-lg font-bold text-[#0E4A3E]">6. Pernyataan Persetujuan Pendaftar</h3>
              <p className="text-xs text-slate-500">
                Baca dengan saksama dan setujui pernyataan komitmen peserta sebelum mengirimkan pendaftaran resmi KKN Internasional.
              </p>
            </div>

            <div className="bg-slate-50/90 border border-slate-200 rounded-2xl p-5 sm:p-6 space-y-4">
              <div className="flex items-start gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-[#0E4A3E] text-white flex items-center justify-center shrink-0 shadow-xs">
                  <ShieldCheck className="w-5 h-5 text-emerald-300" />
                </div>
                <div>
                  <h4 className="text-sm font-extrabold text-[#0E4A3E] uppercase tracking-wide">
                    Pakta Integritas & Pernyataan Komitmen Mahasiswa
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
            {activeStep < FORM_STEPS.length - 1 ? (
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
                title={uploadWindowMessage || 'Jadwal pendaftaran dan pengiriman dokumen telah ditutup.'}
              >
                <Lock className="w-4 h-4" />
                Jadwal Pendaftaran Ditutup
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
