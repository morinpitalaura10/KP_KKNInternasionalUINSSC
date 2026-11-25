/**
 * Standarisasi Penilaian Wawancara & Kemampuan Bahasa Asing
 * Berbasis Indikator Penilaian Berjenjang (Scoring Points 0 - 4)
 * 
 * Pengelompokan:
 * 1. Kelompok Bahasa Inggris (Standar Utama):
 *    - TOEFL (ITP / PBT / Prediction, skala 310 - 677)
 *    - IELTS (Academic / General, skala band 0 - 9.0)
 *    - TOEIC (Test of English for International Communication, skala 10 - 990)
 * 2. Kelompok Bahasa Arab (Opsional / Nilai Tambah):
 *    - TOAFL (Test of Arabic as a Foreign Language, skala 300 - 600)
 *    - Kemampuan Lisan / Muhadatsah (Mubtadi', Mutawassith, Mutaqaddim, Mumtaz)
 */

export interface RubrikJenjang {
  poin: number;
  skor: number;
  tingkat: string;
  predikat: string;
  toeflLabel: string;
  toeflMin: number;
  toeflMax: number;
  ieltsLabel: string;
  ieltsMin: number;
  ieltsMax: number;
  toeicLabel: string;
  toeicMin: number;
  toeicMax: number;
  toaflLabel: string;
  toaflMin: number;
  toaflMax: number;
  nilaiStandar: number;
  rentangNilai: string;
  indikator: string;
  badgeColor: string;
}

export interface RubrikArabJenjang {
  poin: number;
  tingkat: string;
  predikat: string;
  toaflLabel: string;
  toaflMin: number;
  toaflMax: number;
  lisanLabel: string;
  nilaiStandar: number;
  indikator: string;
}

// ── STANDARISASI TUNGGAL KEMAMPUAN BAHASA ASING (TOEFL, IELTS, TOEIC, TOAFL) ──
// Standarisasi Skor: 0, 20, 30, 40, 50 (Hanya 1 jenis tes yang dipilih & dihitung)
export const RUBRIK_BAHASA_JENJANG: RubrikJenjang[] = [
  {
    poin: 0,
    skor: 0,
    tingkat: 'Nol / Belum Ada Tes',
    predikat: 'Belum Terstandarisasi',
    toeflLabel: 'TOEFL 0 (Belum tes / < 311)',
    toeflMin: 0,
    toeflMax: 310,
    ieltsLabel: 'IELTS 0 (Belum tes / < 3.5)',
    ieltsMin: 0,
    ieltsMax: 3.0,
    toeicLabel: 'TOEIC 0 (Belum tes / < 105)',
    toeicMin: 0,
    toeicMax: 100,
    toaflLabel: 'TOAFL 0 (Belum tes / < 300)',
    toaflMin: 0,
    toaflMax: 299,
    nilaiStandar: 0,
    rentangNilai: '0',
    indikator: 'Belum memiliki sertifikat tes resmi terstandarisasi.',
    badgeColor: 'bg-slate-100 text-slate-700 border-slate-300',
  },
  {
    poin: 1,
    skor: 20,
    tingkat: 'Tingkat Dasar',
    predikat: 'Elementary / Mubtadi\'',
    toeflLabel: 'TOEFL 311 - 420',
    toeflMin: 311,
    toeflMax: 420,
    ieltsLabel: 'IELTS 3.5 - 4.5',
    ieltsMin: 3.5,
    ieltsMax: 4.5,
    toeicLabel: 'TOEIC 105 - 400',
    toeicMin: 105,
    toeicMax: 400,
    toaflLabel: 'TOAFL 300 - 375',
    toaflMin: 300,
    toaflMax: 375,
    nilaiStandar: 20,
    rentangNilai: '20',
    indikator: 'Mampu memahami percakapan umum sederhana.',
    badgeColor: 'bg-amber-50 text-amber-800 border-amber-300',
  },
  {
    poin: 2,
    skor: 30,
    tingkat: 'Tingkat Menengah',
    predikat: 'Intermediate / Mutawassith',
    toeflLabel: 'TOEFL 421 - 475',
    toeflMin: 421,
    toeflMax: 475,
    ieltsLabel: 'IELTS 5.0 - 5.5',
    ieltsMin: 5.0,
    ieltsMax: 5.5,
    toeicLabel: 'TOEIC 405 - 600',
    toeicMin: 405,
    toeicMax: 600,
    toaflLabel: 'TOAFL 376 - 450',
    toaflMin: 376,
    toaflMax: 450,
    nilaiStandar: 30,
    rentangNilai: '30',
    indikator: 'Mampu berkomunikasi sehari-hari secara wajar.',
    badgeColor: 'bg-blue-50 text-blue-800 border-blue-300',
  },
  {
    poin: 3,
    skor: 40,
    tingkat: 'Tingkat Mahir Terbatas',
    predikat: 'Upper-Intermediate / Mutaqaddim',
    toeflLabel: 'TOEFL 476 - 525',
    toeflMin: 476,
    toeflMax: 525,
    ieltsLabel: 'IELTS 6.0',
    ieltsMin: 5.6,
    ieltsMax: 6.0,
    toeicLabel: 'TOEIC 605 - 780',
    toeicMin: 605,
    toeicMax: 780,
    toaflLabel: 'TOAFL 451 - 500',
    toaflMin: 451,
    toaflMax: 500,
    nilaiStandar: 40,
    rentangNilai: '40',
    indikator: 'Artikulatif, lancar, dan siap mempresentasikan gagasan.',
    badgeColor: 'bg-emerald-50 text-emerald-800 border-emerald-300',
  },
  {
    poin: 4,
    skor: 50,
    tingkat: 'Tingkat Mahir / Fasih',
    predikat: 'Advanced / Mumtaz',
    toeflLabel: 'TOEFL ≥ 526 (hingga 677)',
    toeflMin: 526,
    toeflMax: 677,
    ieltsLabel: 'IELTS ≥ 6.5 (hingga 9.0)',
    ieltsMin: 6.5,
    ieltsMax: 9.0,
    toeicLabel: 'TOEIC ≥ 785 (hingga 990)',
    toeicMin: 785,
    toeicMax: 990,
    toaflLabel: 'TOAFL ≥ 501 (hingga 600)',
    toaflMin: 501,
    toaflMax: 600,
    nilaiStandar: 50,
    rentangNilai: '50',
    indikator: 'Sangat fasih dan memiliki kosakata internasional unggul.',
    badgeColor: 'bg-purple-50 text-purple-800 border-purple-300',
  },
];

// ── KELOMPOK 2: BAHASA ARAB (OPSIONAL / NILAI TAMBAH) ──
export const RUBRIK_ARAB_JENJANG: RubrikArabJenjang[] = [
  {
    poin: 0,
    tingkat: 'Nol / Tidak Ada',
    predikat: 'Ghoiru Mustawa (Nol)',
    toaflLabel: 'TOAFL < 300 / Belum Ada',
    toaflMin: 0,
    toaflMax: 299,
    lisanLabel: 'Belum mampu percakapan',
    nilaiStandar: 0,
    indikator: 'Belum memiliki kemampuan dasar bahasa Arab.',
  },
  {
    poin: 1,
    tingkat: 'Dasar (Mubtadi\')',
    predikat: 'Mubtadi\' (Dasar)',
    toaflLabel: 'TOAFL 300 - 375',
    toaflMin: 300,
    toaflMax: 375,
    lisanLabel: 'Ungkapan salam & ta\'aruf sederhana',
    nilaiStandar: 60,
    indikator: 'Memahami kosakata umum dan perkenalan singkat.',
  },
  {
    poin: 2,
    tingkat: 'Menengah (Mutawassith)',
    predikat: 'Mutawassith (Menengah)',
    toaflLabel: 'TOAFL 376 - 450',
    toaflMin: 376,
    toaflMax: 450,
    lisanLabel: 'Percakapan harian aktif',
    nilaiStandar: 75,
    indikator: 'Mampu berkomunikasi aktif dalam percakapan sehari-hari dan keagamaan.',
  },
  {
    poin: 3,
    tingkat: 'Mahir (Mutaqaddim)',
    predikat: 'Mutaqaddim (Mahir)',
    toaflLabel: 'TOAFL 451 - 500',
    toaflMin: 451,
    toaflMax: 500,
    lisanLabel: 'Diskusi & pidato lancar',
    nilaiStandar: 85,
    indikator: 'Lancar menyampaikan ide, khutbah/ceramah, dan dialog formal.',
  },
  {
    poin: 4,
    tingkat: 'Fasih Unggul (Mumtaz)',
    predikat: 'Mumtaz (Fasih Akademik)',
    toaflLabel: 'TOAFL > 500',
    toaflMin: 501,
    toaflMax: 650,
    lisanLabel: 'Fasih berwawasan internasional',
    nilaiStandar: 95,
    indikator: 'Sangat fasih, menguasai naskah akademik, sastra, dan interaksi diplomasi.',
  },
];

/**
 * Konversi nilai skor TOEFL ke Jenjang Rubrik
 */
export function hitungSkorToefl(skor: number): RubrikJenjang {
  if (skor <= 0) return RUBRIK_BAHASA_JENJANG[0];
  if (skor >= 526) return RUBRIK_BAHASA_JENJANG[4];
  if (skor >= 476) return RUBRIK_BAHASA_JENJANG[3];
  if (skor >= 421) return RUBRIK_BAHASA_JENJANG[2];
  if (skor >= 311) return RUBRIK_BAHASA_JENJANG[1];
  return RUBRIK_BAHASA_JENJANG[0];
}

/**
 * Konversi band score IELTS ke Jenjang Rubrik
 */
export function hitungSkorIelts(skor: number): RubrikJenjang {
  if (skor <= 0) return RUBRIK_BAHASA_JENJANG[0];
  if (skor >= 6.5) return RUBRIK_BAHASA_JENJANG[4];
  if (skor >= 5.6) return RUBRIK_BAHASA_JENJANG[3];
  if (skor >= 5.0) return RUBRIK_BAHASA_JENJANG[2];
  if (skor >= 3.5) return RUBRIK_BAHASA_JENJANG[1];
  return RUBRIK_BAHASA_JENJANG[0];
}

/**
 * Konversi skor TOEIC ke Jenjang Rubrik
 */
export function hitungSkorToeic(skor: number): RubrikJenjang {
  if (skor <= 0) return RUBRIK_BAHASA_JENJANG[0];
  if (skor >= 785) return RUBRIK_BAHASA_JENJANG[4];
  if (skor >= 605) return RUBRIK_BAHASA_JENJANG[3];
  if (skor >= 405) return RUBRIK_BAHASA_JENJANG[2];
  if (skor >= 105) return RUBRIK_BAHASA_JENJANG[1];
  return RUBRIK_BAHASA_JENJANG[0];
}

/**
 * Konversi skor TOAFL (Bahasa Arab) ke Jenjang Rubrik
 */
export function hitungSkorToafl(skor: number): RubrikArabJenjang {
  if (skor <= 0) return RUBRIK_ARAB_JENJANG[0];
  if (skor > 500) return RUBRIK_ARAB_JENJANG[4];
  if (skor >= 451) return RUBRIK_ARAB_JENJANG[3];
  if (skor >= 376) return RUBRIK_ARAB_JENJANG[2];
  if (skor >= 300) return RUBRIK_ARAB_JENJANG[1];
  return RUBRIK_ARAB_JENJANG[0];
}

/**
 * Konversi skor TOAFL (Bahasa Arab) ke Jenjang Rubrik Standar (0, 20, 30, 40, 50)
 */
export function hitungSkorToaflJenjang(skor: number): RubrikJenjang {
  if (skor <= 0) return RUBRIK_BAHASA_JENJANG[0];
  if (skor >= 501) return RUBRIK_BAHASA_JENJANG[4];
  if (skor >= 451) return RUBRIK_BAHASA_JENJANG[3];
  if (skor >= 376) return RUBRIK_BAHASA_JENJANG[2];
  if (skor >= 300) return RUBRIK_BAHASA_JENJANG[1];
  return RUBRIK_BAHASA_JENJANG[0];
}

/**
 * Cek apakah nama kriteria merupakan kriteria Kemampuan Bahasa Asing
 */
export function isKriteriaBahasa(namaKriteria: string): boolean {
  return /bahasa|language|inggris|english|arab|arabic/i.test(namaKriteria || '');
}

/**
 * Deteksi otomatis nilai skor bahasa dari isian profil mahasiswa
 */
export function deteksiSkorBahasa(text?: string | null): {
  jenis: 'TOEFL' | 'IELTS' | 'TOEIC' | 'TOAFL' | null;
  skor: number | null;
  jenjang: RubrikJenjang | null;
  arabJenjang: RubrikArabJenjang | null;
  arabSkor: number | null;
} {
  if (!text) return { jenis: null, skor: null, jenjang: null, arabJenjang: null, arabSkor: null };

  // Deteksi Bahasa Arab / TOAFL
  let detectedArab: RubrikArabJenjang | null = null;
  let detectedArabSkor: number | null = null;
  const toaflMatch = text.match(/toafl[:\s-]*(\d{3})/i);
  if (toaflMatch && toaflMatch[1]) {
    const s = parseInt(toaflMatch[1], 10);
    detectedArab = hitungSkorToafl(s);
    detectedArabSkor = s;
  } else if (/bahasa\s+arab\s*(?:\(aktif\)|aktif|lancar)/i.test(text)) {
    detectedArab = RUBRIK_ARAB_JENJANG[2]; // Mutawassith (Menengah)
  }

  // Deteksi jika mahasiswa menyatakan belum ada tes (Skor 0)
  if (text.includes('Poin 0') || text.includes('Skor 0') || text.includes('Skor Sistem: 0') || text.toLowerCase().includes('belum memiliki sertifikat') || text.toLowerCase().includes('belum pernah tes')) {
    return {
      jenis: 'TOEFL',
      skor: 0,
      jenjang: RUBRIK_BAHASA_JENJANG[0],
      arabJenjang: detectedArab,
      arabSkor: detectedArabSkor,
    };
  }

  // Deteksi TOEIC: TOEIC 650, TOEIC: 700
  const toeicMatch = text.match(/toeic[:\s-]*(\d{2,3})/i);
  if (toeicMatch && toeicMatch[1]) {
    const skor = parseInt(toeicMatch[1], 10);
    if (skor >= 10 && skor <= 990) {
      return {
        jenis: 'TOEIC',
        skor,
        jenjang: hitungSkorToeic(skor),
        arabJenjang: detectedArab,
        arabSkor: detectedArabSkor,
      };
    }
  }

  // Deteksi TOEFL: TOEFL 500, TOEFL ITP: 480, TOEFL 450
  const toeflMatch = text.match(/toefl\s*(?:itp|pbt|prediction)?[:\s-]*(\d{3})/i);
  if (toeflMatch && toeflMatch[1]) {
    const skor = parseInt(toeflMatch[1], 10);
    if (skor >= 300 && skor <= 677) {
      return {
        jenis: 'TOEFL',
        skor,
        jenjang: hitungSkorToefl(skor),
        arabJenjang: detectedArab,
        arabSkor: detectedArabSkor,
      };
    }
  }

  // Deteksi IELTS: IELTS 6.5, IELTS: 6.0
  const ieltsMatch = text.match(/ielts[:\s-]*([0-9](?:\.[0-9])?)/i);
  if (ieltsMatch && ieltsMatch[1]) {
    const skor = parseFloat(ieltsMatch[1]);
    if (skor >= 0 && skor <= 9.0) {
      return {
        jenis: 'IELTS',
        skor,
        jenjang: hitungSkorIelts(skor),
        arabJenjang: detectedArab,
        arabSkor: detectedArabSkor,
      };
    }
  }

  // Deteksi TOAFL tunggal: TOAFL 450
  if (toaflMatch && toaflMatch[1]) {
    const skor = parseInt(toaflMatch[1], 10);
    if (skor >= 250 && skor <= 650) {
      return {
        jenis: 'TOAFL',
        skor,
        jenjang: hitungSkorToaflJenjang(skor),
        arabJenjang: detectedArab,
        arabSkor: detectedArabSkor,
      };
    }
  }

  // Fallback pencarian 3 digit angka rentang skor TOEFL
  const fallbackNum = text.match(/\b(3[1-9]\d|[4-6]\d\d)\b/);
  if (fallbackNum && fallbackNum[1]) {
    const skor = parseInt(fallbackNum[1], 10);
    if (skor >= 310 && skor <= 677) {
      return {
        jenis: 'TOEFL',
        skor,
        jenjang: hitungSkorToefl(skor),
        arabJenjang: detectedArab,
        arabSkor: detectedArabSkor,
      };
    }
  }

  return {
    jenis: null,
    skor: null,
    jenjang: null,
    arabJenjang: detectedArab,
    arabSkor: detectedArabSkor,
  };
}
