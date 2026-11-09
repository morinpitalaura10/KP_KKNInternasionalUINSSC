import { prisma } from '@/lib/prisma';
import fs from 'fs';
import path from 'path';

export interface PersyaratanAkademikConfig {
  id_akademik?: number;
  min_ipk: number;
  min_semester: number;
  max_semester: number;
  min_sks: number;
  all_prodi: boolean;
  allowed_prodi_ids: number[];
  status: boolean;
  catatan: string;
  updated_at?: string;
}

const CONFIG_FILE = path.join(process.cwd(), 'data', 'persyaratan_akademik.json');

const DEFAULT_CONFIG: PersyaratanAkademikConfig = {
  min_ipk: 3.5,
  min_semester: 6,
  max_semester: 8,
  min_sks: 100,
  all_prodi: true,
  allowed_prodi_ids: [],
  status: true,
  catatan:
    'Wajib berstatus Mahasiswa Aktif, minimal semester 6, IPK minimal 3.50, dan terdaftar pada program studi yang dibuka untuk periode KKN Internasional saat ini.',
};

/**
 * Mengambil konfigurasi Persyaratan Akademik langsung dari tabel MySQL `persyaratan_akademik`.
 * Dilengkapi fallback ke file JSON jika koneksi database sedang tidak tersedia.
 */
export async function getPersyaratanAkademik(): Promise<PersyaratanAkademikConfig> {
  try {
    const rows = (await prisma.$queryRawUnsafe(
      'SELECT * FROM persyaratan_akademik ORDER BY id_akademik DESC LIMIT 1'
    )) as any[];

    if (rows && rows.length > 0) {
      const row = rows[0];
      let allowedIds: number[] = [];
      try {
        if (typeof row.allowed_prodi_ids === 'string') {
          allowedIds = JSON.parse(row.allowed_prodi_ids);
        } else if (Array.isArray(row.allowed_prodi_ids)) {
          allowedIds = row.allowed_prodi_ids;
        }
      } catch {
        allowedIds = [];
      }

      return {
        id_akademik: row.id_akademik,
        min_ipk: row.min_ipk !== undefined ? Number(row.min_ipk) : DEFAULT_CONFIG.min_ipk,
        min_semester: row.min_semester !== undefined ? Number(row.min_semester) : DEFAULT_CONFIG.min_semester,
        max_semester: row.max_semester !== undefined ? Number(row.max_semester) : DEFAULT_CONFIG.max_semester,
        min_sks: row.min_sks !== undefined ? Number(row.min_sks) : DEFAULT_CONFIG.min_sks,
        all_prodi: Boolean(row.all_prodi),
        allowed_prodi_ids: allowedIds,
        status: Boolean(row.status),
        catatan: String(row.catatan || DEFAULT_CONFIG.catatan),
        updated_at: row.updated_at ? new Date(row.updated_at).toISOString() : undefined,
      };
    }
  } catch (error) {
    console.warn('Peringatan: Gagal membaca tabel MySQL persyaratan_akademik, mencoba fallback ke JSON:', error);
  }

  // Fallback: Membaca dari JSON jika query DB gagal
  try {
    if (fs.existsSync(CONFIG_FILE)) {
      const content = fs.readFileSync(CONFIG_FILE, 'utf-8');
      const parsed = JSON.parse(content);
      return { ...DEFAULT_CONFIG, ...parsed };
    }
  } catch (e) {
    console.error('Error reading fallback json:', e);
  }

  return DEFAULT_CONFIG;
}

/**
 * Menyimpan konfigurasi Persyaratan Akademik langsung ke tabel MySQL `persyaratan_akademik`
 * serta mencadangkannya ke file JSON.
 */
export async function savePersyaratanAkademik(
  config: Partial<PersyaratanAkademikConfig>
): Promise<PersyaratanAkademikConfig> {
  const current = await getPersyaratanAkademik();
  const updated: PersyaratanAkademikConfig = {
    ...current,
    ...config,
    updated_at: new Date().toISOString(),
  };

  // 1. Simpan ke Database MySQL
  try {
    const existing = (await prisma.$queryRawUnsafe(
      'SELECT id_akademik FROM persyaratan_akademik ORDER BY id_akademik DESC LIMIT 1'
    )) as any[];

    const jsonProdiIds = JSON.stringify(updated.allowed_prodi_ids || []);

    if (existing && existing.length > 0) {
      const idAkademik = existing[0].id_akademik;
      await prisma.$executeRawUnsafe(
        `UPDATE persyaratan_akademik 
         SET min_ipk = ?, min_semester = ?, max_semester = ?, min_sks = ?, all_prodi = ?, allowed_prodi_ids = ?, status = ?, catatan = ?, updated_at = NOW()
         WHERE id_akademik = ?`,
        updated.min_ipk,
        updated.min_semester,
        updated.max_semester,
        updated.min_sks,
        updated.all_prodi ? 1 : 0,
        jsonProdiIds,
        updated.status ? 1 : 0,
        updated.catatan,
        idAkademik
      );
    } else {
      await prisma.$executeRawUnsafe(
        `INSERT INTO persyaratan_akademik 
         (min_ipk, min_semester, max_semester, min_sks, all_prodi, allowed_prodi_ids, status, catatan)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        updated.min_ipk,
        updated.min_semester,
        updated.max_semester,
        updated.min_sks,
        updated.all_prodi ? 1 : 0,
        jsonProdiIds,
        updated.status ? 1 : 0,
        updated.catatan
      );
    }
  } catch (dbError) {
    console.error('Error saving to MySQL persyaratan_akademik:', dbError);
    throw new Error('Gagal menyimpan konfigurasi ke database MySQL.');
  }

  // 2. Simpan juga cadangan ke JSON agar sinkron
  try {
    const dir = path.dirname(CONFIG_FILE);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(CONFIG_FILE, JSON.stringify(updated, null, 2), 'utf-8');
  } catch (fsError) {
    console.warn('Peringatan: Gagal menulis backup json (tidak fatal):', fsError);
  }

  return updated;
}
