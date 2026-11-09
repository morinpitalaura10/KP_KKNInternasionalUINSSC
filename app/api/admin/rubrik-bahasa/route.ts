import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const CONFIG_PATH = path.join(process.cwd(), 'data', 'rubrik_bahasa.json');

const DEFAULT_RUBRIK = {
  updated_at: new Date().toISOString(),
  jenjang_inggris: [
    {
      tingkat: 0,
      skor: 0,
      predikat: 'Belum Terstandarisasi',
      toeflLabel: 'TOEFL < 311 / Belum Ada',
      toeflMin: 0,
      toeflMax: 310,
      ieltsLabel: 'IELTS < 3.5 / Belum Ada',
      ieltsMin: 0,
      ieltsMax: 3.0,
      toeicLabel: 'TOEIC < 105 / Belum Ada',
      toeicMin: 0,
      toeicMax: 100,
      indikator: 'Belum memiliki sertifikat tes resmi terstandarisasi.',
    },
    {
      tingkat: 1,
      skor: 20,
      predikat: 'Elementary / Novice',
      toeflLabel: 'TOEFL 311 - 420',
      toeflMin: 311,
      toeflMax: 420,
      ieltsLabel: 'IELTS 3.5 - 4.5',
      ieltsMin: 3.5,
      ieltsMax: 4.5,
      toeicLabel: 'TOEIC 105 - 400',
      toeicMin: 105,
      toeicMax: 400,
      indikator: 'Mampu memahami percakapan umum sederhana.',
    },
    {
      tingkat: 2,
      skor: 30,
      predikat: 'Intermediate',
      toeflLabel: 'TOEFL 421 - 475',
      toeflMin: 421,
      toeflMax: 475,
      ieltsLabel: 'IELTS 5.0 - 5.5',
      ieltsMin: 5.0,
      ieltsMax: 5.5,
      toeicLabel: 'TOEIC 405 - 600',
      toeicMin: 405,
      toeicMax: 600,
      indikator: 'Mampu berkomunikasi sehari-hari secara wajar.',
    },
    {
      tingkat: 3,
      skor: 40,
      predikat: 'Upper-Intermediate',
      toeflLabel: 'TOEFL 476 - 525',
      toeflMin: 476,
      toeflMax: 525,
      ieltsLabel: 'IELTS 6.0',
      ieltsMin: 5.6,
      ieltsMax: 6.0,
      toeicLabel: 'TOEIC 605 - 780',
      toeicMin: 605,
      toeicMax: 780,
      indikator: 'Artikulatif, lancar, dan siap mempresentasikan gagasan.',
    },
    {
      tingkat: 4,
      skor: 50,
      predikat: 'Advanced / Fluent',
      toeflLabel: 'TOEFL ≥ 526',
      toeflMin: 526,
      toeflMax: 677,
      ieltsLabel: 'IELTS ≥ 6.5',
      ieltsMin: 6.5,
      ieltsMax: 9.0,
      toeicLabel: 'TOEIC ≥ 785',
      toeicMin: 785,
      toeicMax: 990,
      indikator: 'Sangat fasih dan memiliki kosakata akademik/profesional internasional unggul.',
    },
  ],
  bonus_arab: {
    toafl_min: 400,
    skor_tambahan_toafl: 10,
    skor_tambahan_lisan: 5,
  },
};

export async function GET() {
  try {
    if (fs.existsSync(CONFIG_PATH)) {
      const content = fs.readFileSync(CONFIG_PATH, 'utf8');
      const data = JSON.parse(content);
      return NextResponse.json({ success: true, data });
    }
    return NextResponse.json({ success: true, data: DEFAULT_RUBRIK });
  } catch (error) {
    console.error('Error reading rubrik bahasa config:', error);
    return NextResponse.json({ success: true, data: DEFAULT_RUBRIK });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const updated = {
      updated_at: new Date().toISOString(),
      jenjang_inggris: body.jenjang_inggris || DEFAULT_RUBRIK.jenjang_inggris,
      bonus_arab: body.bonus_arab || DEFAULT_RUBRIK.bonus_arab,
    };

    const dir = path.dirname(CONFIG_PATH);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    fs.writeFileSync(CONFIG_PATH, JSON.stringify(updated, null, 2), 'utf8');
    return NextResponse.json({
      success: true,
      message: 'Konfigurasi rubrik skor bahasa berhasil disimpan secara dinamis!',
      data: updated,
    });
  } catch (error) {
    console.error('Error saving rubrik bahasa config:', error);
    return NextResponse.json(
      { success: false, message: 'Gagal menyimpan konfigurasi rubrik bahasa' },
      { status: 500 }
    );
  }
}

