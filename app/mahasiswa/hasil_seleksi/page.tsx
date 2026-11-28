'use client';

import React, { useEffect, useState } from 'react';
import {
  MahasiswaHasilSeleksiView,
  HasilSeleksiData,
} from '@/components/mahasiswa';

export default function HasilSeleksiPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [showSkPreview, setShowSkPreview] = useState(true);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [data, setData] = useState<HasilSeleksiData>({
    hasResult: false,
    status: null,
    nilaiSubstansi: null,
    nilaiWawancara: null,
    nilaiAkhir: null,
    ranking: null,
    catatan: null,
    negaraTujuan: null,
    namaPeriode: null,
  });

  useEffect(() => {
    let userId: string | null = null;
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('currentUser');
      if (stored) {
        try {
          const user = JSON.parse(stored);
          userId = user.id || user.id_user;
        } catch {
          // ignore
        }
      }
    }

    async function loadHasil() {
      if (!userId) {
        setIsLoading(false);
        return;
      }
      try {
        const res = await fetch(`/api/mahasiswa/hasil-seleksi?userId=${userId}`);
        const json = await res.json();
        if (json.success && json.data) {
          setData(json.data);
        }
      } catch (err) {
        console.error('Failed to load hasil seleksi:', err);
      } finally {
        setIsLoading(false);
      }
    }
    loadHasil();
  }, []);

  const fetchLogoBase64 = async (): Promise<string> => {
    try {
      const res = await fetch('/uinssc.png');
      if (!res.ok) return '';
      const blob = await res.blob();
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve((reader.result as string) || '');
        reader.onerror = () => resolve('');
        reader.readAsDataURL(blob);
      });
    } catch {
      return '';
    }
  };

  const handleDownloadSkPdf = async () => {
    const studentNim = data.nim || 'Peserta';
    const fileName = `SK_Kelulusan_KKN_Internasional_${studentNim}.pdf`;

    setIsGeneratingPdf(true);
    try {
      const { jsPDF } = await import('jspdf');
      const logoBase64 = await fetchLogoBase64();

      const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
      const skNum = `B-${String(data.idHasil || data.idPendaftaran || 1).padStart(3, '0')}/In.08/LP2M/KKN-INT/${data.tahunPeriode || 2026}`;
      const tgl = (data.tanggalPenetapan ? new Date(data.tanggalPenetapan) : new Date()).toLocaleDateString(
        'id-ID',
        { day: 'numeric', month: 'long', year: 'numeric' }
      );

      // 1. Logo Resmi UINSSC di Kiri Kop Surat (18mm dari kiri, 14mm dari atas, 23x23mm)
      if (logoBase64) {
        try {
          pdf.addImage(logoBase64, 'PNG', 18, 14, 23, 23);
        } catch (imgErr) {
          console.warn('Gagal render logo di PDF:', imgErr);
        }
      }

      // 2. Teks Kop Surat Resmi (Diposisikan di tengah area kop samping logo)
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(10.5);
      pdf.setTextColor(30, 41, 59);
      pdf.text('KEMENTERIAN AGAMA REPUBLIK INDONESIA', 116, 19, { align: 'center' });

      pdf.setFontSize(12.5);
      pdf.setTextColor(14, 74, 62);
      pdf.text('UNIVERSITAS ISLAM NEGERI SIBER SYEKH NURJATI CIREBON', 116, 25, { align: 'center' });

      pdf.setFontSize(9.5);
      pdf.setTextColor(30, 41, 59);
      pdf.text('LEMBAGA PENELITIAN DAN PENGABDIAN KEPADA MASYARAKAT (LP2M)', 116, 30.5, { align: 'center' });

      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(8);
      pdf.setTextColor(71, 85, 105);
      pdf.text('Jl. Perjuangan By Pass Sunyaragi, Cirebon, Jawa Barat 45132 | Laman: https://uinssc.ac.id', 116, 35.5, { align: 'center' });

      // Garis Ganda Pembatas Kop Surat
      pdf.setDrawColor(15, 23, 42);
      pdf.setLineWidth(0.7);
      pdf.line(18, 40, 192, 40);
      pdf.setLineWidth(0.2);
      pdf.line(18, 41.2, 192, 41.2);

      // 3. Judul Surat Keputusan
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(12);
      pdf.setTextColor(15, 23, 42);
      pdf.text('SURAT KEPUTUSAN PENETAPAN KELULUSAN PESERTA', 105, 51, { align: 'center' });

      pdf.setFontSize(10);
      pdf.text(`PROGRAM KULIAH KERJA NYATA (KKN) INTERNASIONAL TAHUN ${data.tahunPeriode || 2026}`, 105, 56.5, { align: 'center' });

      pdf.setFontSize(9.5);
      pdf.setTextColor(14, 74, 62);
      pdf.text(`NOMOR: ${skNum}`, 105, 62.5, { align: 'center' });

      // 4. Paragraf Pembuka
      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(10);
      pdf.setTextColor(30, 41, 59);
      const intro = `Berdasarkan hasil verifikasi berkas administrasi, evaluasi dokumen akademik, serta penilaian seleksi wawancara dan kompetensi bahasa asing pada penyelenggaraan ${data.namaPeriode || 'KKN Internasional'}, Ketua LP2M UIN Siber Syekh Nurjati Cirebon menetapkan bahwa mahasiswa di bawah ini:`;
      pdf.text(pdf.splitTextToSize(intro, 174), 18, 73);

      // 5. Tabel Identitas & Rincian Kelulusan Mahasiswa
      pdf.setFillColor(248, 250, 252);
      pdf.setDrawColor(203, 213, 225);
      pdf.roundedRect(18, 88, 174, 58, 3, 3, 'FD');

      const rows: [string, string][] = [
        ['Nama Lengkap', `: ${(data.nama || '-').toUpperCase()}`],
        ['NIM', `: ${data.nim || '-'}`],
        ['Fakultas / Program Studi', `: ${data.fakultas || '-'} / ${data.prodi || '-'}`],
        ['Periode Penyelenggaraan', `: ${data.namaPeriode || 'KKN Internasional'} (${data.tahunPeriode || 2026})`],
        [
          'Rincian Skor Evaluasi',
          `: Berkas ${data.nilaiSubstansi?.toFixed(1) ?? '-'} | Wawancara ${data.nilaiWawancara?.toFixed(1) ?? '-'} | Nilai Akhir ${data.nilaiAkhir?.toFixed(2) ?? '-'} (Peringkat #${data.ranking ?? '-'})`,
        ],
        ['Negara Penempatan', `: ${(data.negaraTujuan || 'Ditentukan Panitia LP2M').toUpperCase()}`],
      ];

      rows.forEach(([label, val], idx) => {
        const y = 96 + idx * 8.5;
        pdf.setFont('helvetica', 'bold');
        pdf.setTextColor(71, 85, 105);
        pdf.text(label, 24, y);
        pdf.setFont('helvetica', idx === 0 || idx === 5 ? 'bold' : 'normal');
        pdf.setTextColor(idx === 5 ? 14 : 15, idx === 5 ? 74 : 23, idx === 5 ? 62 : 42);
        pdf.text(val, 78, y);
      });

      // 6. Kotak Status Keputusan Kelulusan
      pdf.setFillColor(221, 242, 232);
      pdf.setDrawColor(14, 74, 62);
      pdf.setLineWidth(0.5);
      pdf.roundedRect(18, 153, 174, 20, 3, 3, 'FD');
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(9);
      pdf.setTextColor(14, 74, 62);
      pdf.text('STATUS KEPUTUSAN AKHIR SELEKSI', 105, 160.5, { align: 'center' });
      pdf.setFontSize(12);
      pdf.text('DINYATAKAN LOLOS SELEKSI UTAMA PESERTA KKN INTERNASIONAL', 105, 168, { align: 'center' });

      // 7. Paragraf Penutup & Legalitas
      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(10);
      pdf.setTextColor(30, 41, 59);
      const outro =
        'Surat Keputusan Penetapan Kelulusan ini berlaku secara sah sebagai bukti kelulusan resmi peserta untuk mengikuti seluruh rangkaian pembekalan (Pre-Departure Training), pengurusan dokumen perjalanan luar negeri, serta pelaksanaan pengabdian masyarakat internasional sesuai jadwal LP2M UIN Siber Syekh Nurjati Cirebon.';
      pdf.text(pdf.splitTextToSize(outro, 174), 18, 183);

      // 8. Bagian Tanda Tangan & Pengesahan Cirebon
      pdf.setFontSize(10);
      pdf.text(`Ditetapkan di: Cirebon`, 145, 214, { align: 'center' });
      pdf.text(`Pada tanggal: ${tgl}`, 145, 219.5, { align: 'center' });
      pdf.setFont('helvetica', 'bold');
      pdf.text('Ketua LP2M UIN Siber Syekh Nurjati Cirebon', 145, 225.5, { align: 'center' });
      pdf.text('Prof. Dr. H. Ahmad Dahlan, M.Ag.', 145, 251, { align: 'center' });
      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(9);
      pdf.text('NIP. 19750812 200212 1 002', 145, 256, { align: 'center' });

      pdf.save(fileName);
    } catch (err) {
      console.error('Error generating PDF:', err);
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  const handlePrintSk = async () => {
    if (!showSkPreview) {
      setShowSkPreview(true);
      await new Promise((r) => setTimeout(r, 200));
    }
    if (typeof window !== 'undefined') {
      window.print();
    }
  };

  return (
    <MahasiswaHasilSeleksiView
      isLoading={isLoading}
      data={data}
      isGeneratingPdf={isGeneratingPdf}
      onDownloadSkPdf={handleDownloadSkPdf}
      onPrintSk={handlePrintSk}
    />
  );
}
