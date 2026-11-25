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

  const handleDownloadSkPdf = async () => {
    if (!showSkPreview) {
      setShowSkPreview(true);
      await new Promise((r) => setTimeout(r, 250));
    }

    const skEl = document.getElementById('printable-sk-kelulusan');
    if (!skEl) return;

    const studentNim = data.nim || 'Peserta';
    const fileName = `SK_Kelulusan_KKN_Internasional_${studentNim}.pdf`;

    setIsGeneratingPdf(true);
    try {
      const html2canvas = (await import('html2canvas')).default;
      const { jsPDF } = await import('jspdf');

      const colorCanvas = document.createElement('canvas');
      colorCanvas.width = 1;
      colorCanvas.height = 1;
      const colorCtx = colorCanvas.getContext('2d', { willReadFrequently: true });

      const toSafeRgb = (val: string | null | undefined, fallback = 'rgb(15, 23, 42)'): string => {
        if (!val || val === 'transparent' || val === 'none' || val === 'rgba(0, 0, 0, 0)') {
          return 'transparent';
        }
        if (
          (val.startsWith('rgb(') || val.startsWith('rgba(') || val.startsWith('#')) &&
          !val.includes('lab') &&
          !val.includes('oklch') &&
          !val.includes('oklab') &&
          !val.includes('lch') &&
          !val.includes('color(')
        ) {
          return val;
        }
        if (!colorCtx) return fallback;
        try {
          colorCtx.clearRect(0, 0, 1, 1);
          colorCtx.fillStyle = '#000000';
          colorCtx.fillStyle = val;
          colorCtx.fillRect(0, 0, 1, 1);
          const [r, g, b, a] = colorCtx.getImageData(0, 0, 1, 1).data;
          if (a === 0) return 'transparent';
          if (a < 255) return `rgba(${r}, ${g}, ${b}, ${(a / 255).toFixed(3)})`;
          return `rgb(${r}, ${g}, ${b})`;
        } catch {
          return fallback;
        }
      };

      const canvas = await html2canvas(skEl, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#ffffff',
        logging: false,
        onclone: (clonedDoc) => {
          const allElements = clonedDoc.querySelectorAll('*');
          allElements.forEach((node) => {
            const el = node as HTMLElement;
            if (!el.style) return;
            const win = clonedDoc.defaultView || window;
            const comp = win.getComputedStyle(el);

            el.style.color = toSafeRgb(comp.color, 'rgb(15, 23, 42)');
            el.style.backgroundColor = toSafeRgb(comp.backgroundColor, 'transparent');
            el.style.borderTopColor = toSafeRgb(comp.borderTopColor, 'rgb(203, 213, 225)');
            el.style.borderRightColor = toSafeRgb(comp.borderRightColor, 'rgb(203, 213, 225)');
            el.style.borderBottomColor = toSafeRgb(comp.borderBottomColor, 'rgb(203, 213, 225)');
            el.style.borderLeftColor = toSafeRgb(comp.borderLeftColor, 'rgb(203, 213, 225)');
            el.style.outlineColor = toSafeRgb(comp.outlineColor, 'transparent');
            el.style.textDecorationColor = toSafeRgb(comp.textDecorationColor, 'rgb(15, 23, 42)');
            el.style.boxShadow = 'none';
            if (comp.backgroundImage && comp.backgroundImage !== 'none') {
              el.style.backgroundImage = 'none';
            }
          });
        },
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      });

      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      const margin = 8;
      const contentWidth = pdfWidth - margin * 2;
      const contentHeight = (canvas.height * contentWidth) / canvas.width;

      const finalHeight = Math.min(contentHeight, pdfHeight - margin * 2);
      pdf.addImage(imgData, 'PNG', margin, margin, contentWidth, finalHeight);
      pdf.save(fileName);
    } catch (err) {
      console.warn('Merender PDF vektor langsung via jsPDF:', err);
      try {
        const { jsPDF } = await import('jspdf');
        const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
        const skNum = `B-${String(data.idHasil || data.idPendaftaran || 1).padStart(3, '0')}/In.08/LP2M/KKN-INT/${data.tahunPeriode || 2026}`;
        const tgl = (data.tanggalPenetapan ? new Date(data.tanggalPenetapan) : new Date()).toLocaleDateString(
          'id-ID',
          { day: 'numeric', month: 'long', year: 'numeric' }
        );

        pdf.setFont('helvetica', 'bold');
        pdf.setFontSize(11);
        pdf.setTextColor(30, 41, 59);
        pdf.text('KEMENTERIAN AGAMA REPUBLIK INDONESIA', 105, 20, { align: 'center' });
        pdf.setFontSize(13);
        pdf.setTextColor(14, 74, 62);
        pdf.text('UNIVERSITAS ISLAM NEGERI SIBER SYEKH NURJATI CIREBON', 105, 26, { align: 'center' });
        pdf.setFontSize(10);
        pdf.setTextColor(30, 41, 59);
        pdf.text('LEMBAGA PENELITIAN DAN PENGABDIAN KEPADA MASYARAKAT (LP2M)', 105, 32, { align: 'center' });
        pdf.setFont('helvetica', 'normal');
        pdf.setFontSize(8.5);
        pdf.setTextColor(71, 85, 105);
        pdf.text('Jl. Perjuangan By Pass Sunyaragi, Cirebon, Jawa Barat 45132 | Laman: https://uinssc.ac.id', 105, 37, { align: 'center' });

        pdf.setDrawColor(15, 23, 42);
        pdf.setLineWidth(0.7);
        pdf.line(18, 41, 192, 41);
        pdf.setLineWidth(0.2);
        pdf.line(18, 42.2, 192, 42.2);

        pdf.setFont('helvetica', 'bold');
        pdf.setFontSize(12);
        pdf.setTextColor(15, 23, 42);
        pdf.text('SURAT KEPUTUSAN PENETAPAN KELULUSAN PESERTA', 105, 52, { align: 'center' });
        pdf.setFontSize(10);
        pdf.text(`PROGRAM KULIAH KERJA NYATA (KKN) INTERNASIONAL TAHUN ${data.tahunPeriode || 2026}`, 105, 57.5, { align: 'center' });
        pdf.setFontSize(9.5);
        pdf.setTextColor(14, 74, 62);
        pdf.text(`NOMOR: ${skNum}`, 105, 63.5, { align: 'center' });

        pdf.setFont('helvetica', 'normal');
        pdf.setFontSize(10);
        pdf.setTextColor(30, 41, 59);
        const intro = `Berdasarkan hasil verifikasi berkas administrasi, evaluasi dokumen akademik, serta penilaian seleksi wawancara dan kompetensi bahasa asing pada penyelenggaraan ${data.namaPeriode || 'KKN Internasional'}, Ketua LP2M UIN Siber Syekh Nurjati Cirebon menetapkan bahwa mahasiswa di bawah ini:`;
        pdf.text(pdf.splitTextToSize(intro, 174), 18, 74);

        pdf.setFillColor(248, 250, 252);
        pdf.setDrawColor(203, 213, 225);
        pdf.roundedRect(18, 90, 174, 58, 3, 3, 'FD');

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
          const y = 98 + idx * 8.5;
          pdf.setFont('helvetica', 'bold');
          pdf.setTextColor(71, 85, 105);
          pdf.text(label, 24, y);
          pdf.setFont('helvetica', idx === 0 || idx === 5 ? 'bold' : 'normal');
          pdf.setTextColor(idx === 5 ? 14 : 15, idx === 5 ? 74 : 23, idx === 5 ? 62 : 42);
          pdf.text(val, 78, y);
        });

        pdf.setFillColor(221, 242, 232);
        pdf.setDrawColor(14, 74, 62);
        pdf.setLineWidth(0.5);
        pdf.roundedRect(18, 155, 174, 20, 3, 3, 'FD');
        pdf.setFont('helvetica', 'bold');
        pdf.setFontSize(9);
        pdf.setTextColor(14, 74, 62);
        pdf.text('STATUS KEPUTUSAN AKHIR SELEKSI', 105, 162.5, { align: 'center' });
        pdf.setFontSize(12);
        pdf.text('DINYATAKAN LOLOS SELEKSI UTAMA PESERTA KKN INTERNASIONAL', 105, 170, { align: 'center' });

        pdf.setFont('helvetica', 'normal');
        pdf.setFontSize(10);
        pdf.setTextColor(30, 41, 59);
        const outro =
          'Surat Keputusan Penetapan Kelulusan ini berlaku secara sah sebagai bukti kelulusan resmi peserta untuk mengikuti seluruh rangkaian pembekalan (Pre-Departure Training), pengurusan dokumen perjalanan luar negeri, serta pelaksanaan pengabdian masyarakat internasional sesuai jadwal LP2M UIN Siber Syekh Nurjati Cirebon.';
        pdf.text(pdf.splitTextToSize(outro, 174), 18, 185);

        pdf.setFontSize(10);
        pdf.text(`Ditetapkan di: Cirebon`, 145, 215, { align: 'center' });
        pdf.text(`Pada tanggal: ${tgl}`, 145, 220.5, { align: 'center' });
        pdf.setFont('helvetica', 'bold');
        pdf.text('Ketua LP2M UIN Siber Syekh Nurjati Cirebon', 145, 226.5, { align: 'center' });
        pdf.text('Prof. Dr. H. Ahmad Dahlan, M.Ag.', 145, 252, { align: 'center' });
        pdf.setFont('helvetica', 'normal');
        pdf.setFontSize(9);
        pdf.text('NIP. 19750812 200212 1 002', 145, 257, { align: 'center' });

        pdf.save(fileName);
      } catch (fallbackErr) {
        console.error('Fallback jsPDF error:', fallbackErr);
      }
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
