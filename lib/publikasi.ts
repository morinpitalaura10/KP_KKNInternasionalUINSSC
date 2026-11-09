import type { NextRequest } from 'next/server';
import { Prisma } from '@prisma/client';
import { prisma } from '@/lib/prisma';

export type JenisPublikasi = 'timeline' | 'pengumuman' | 'hasil_seleksi';
export type AksiPublikasi = 'Publish' | 'Private';

export interface SessionUser {
  id: number;
  role: string;
  name?: string;
}

/**
 * Resolusi user_id eksekutor dari session cookie, body payload, atau fallback admin.
 */
export async function resolveActorUserId(req: NextRequest, bodyUserId?: unknown): Promise<number> {
  const sessionUser = getSessionUser(req);
  if (sessionUser?.id) return sessionUser.id;

  if (bodyUserId !== undefined && bodyUserId !== null) {
    const parsed = parseInt(String(bodyUserId), 10);
    if (!isNaN(parsed) && parsed > 0) return parsed;
  }

  const adminUser = await prisma.user.findFirst({
    where: { role: 'admin' },
    select: { id_user: true },
  });
  return adminUser?.id_user || 1;
}
export function getSessionUser(req: NextRequest): SessionUser | null {
  const raw = req.cookies.get('user_session')?.value;
  if (!raw) return null;
  try {
    let parsed: { id?: unknown; role?: unknown; name?: string };
    try {
      parsed = JSON.parse(raw);
    } catch {
      parsed = JSON.parse(decodeURIComponent(raw));
    }
    const id = parseInt(String(parsed?.id), 10);
    if (!id || isNaN(id)) return null;
    return { id, role: String(parsed?.role || ''), name: parsed?.name };
  } catch {
    return null;
  }
}

export interface PeriodePublikasiStatus {
  hasil_dipublikasi: boolean;
  tanggal_publikasi_hasil: Date | null;
  dipublikasi_oleh: number | null;
  nama_user_publikasi: string | null;
}

/**
 * Ambil status publikasi hasil seleksi dari tabel `periode` menggunakan raw query
 * agar tetap kompatibel meskipun proses dev server belum di-restart.
 */
export async function getPeriodePublikasiStatus(id_periode: number): Promise<PeriodePublikasiStatus> {
  try {
    const rows = await prisma.$queryRaw<
      Array<{
        hasil_dipublikasi: number | boolean | null;
        tanggal_publikasi_hasil: Date | string | null;
        dipublikasi_oleh: number | null;
        nama_user: string | null;
      }>
    >(Prisma.sql`
      SELECT p.hasil_dipublikasi, p.tanggal_publikasi_hasil, p.dipublikasi_oleh, u.nama AS nama_user
      FROM periode p
      LEFT JOIN users u ON p.dipublikasi_oleh = u.id_user
      WHERE p.id_periode = ${id_periode}
      LIMIT 1
    `);

    const row = rows[0];
    if (!row) {
      return {
        hasil_dipublikasi: false,
        tanggal_publikasi_hasil: null,
        dipublikasi_oleh: null,
        nama_user_publikasi: null,
      };
    }

    return {
      hasil_dipublikasi: Boolean(row.hasil_dipublikasi),
      tanggal_publikasi_hasil: row.tanggal_publikasi_hasil ? new Date(row.tanggal_publikasi_hasil) : null,
      dipublikasi_oleh: row.dipublikasi_oleh !== null ? Number(row.dipublikasi_oleh) : null,
      nama_user_publikasi: row.nama_user || null,
    };
  } catch (err) {
    console.error('Gagal membaca status publikasi periode:', err);
    return {
      hasil_dipublikasi: false,
      tanggal_publikasi_hasil: null,
      dipublikasi_oleh: null,
      nama_user_publikasi: null,
    };
  }
}

/**
 * Tandai hasil seleksi suatu periode sebagai resmi dipublikasikan (atau diubah statusnya).
 */
export async function updatePeriodePublikasiStatus(params: {
  id_periode: number;
  dipublikasi: boolean;
  id_user: number;
}): Promise<Date> {
  const now = new Date();
  if (params.dipublikasi) {
    await prisma.$executeRaw(Prisma.sql`
      UPDATE periode
      SET hasil_dipublikasi = 1,
          tanggal_publikasi_hasil = ${now},
          dipublikasi_oleh = ${params.id_user}
      WHERE id_periode = ${params.id_periode}
    `);
  } else {
    await prisma.$executeRaw(Prisma.sql`
      UPDATE periode
      SET hasil_dipublikasi = 0,
          tanggal_publikasi_hasil = NULL,
          dipublikasi_oleh = ${params.id_user}
      WHERE id_periode = ${params.id_periode}
    `);
  }
  return now;
}

/**
 * Catat riwayat publikasi ke tabel log_publikasi (audit trail).
 * Kegagalan logging tidak membatalkan aksi utama, hanya dicatat di console.
 */
export async function catatLogPublikasi(params: {
  id_user: number;
  jenis: JenisPublikasi;
  aksi: AksiPublikasi;
  id_periode?: number | null;
  id_referensi?: number | null;
  keterangan?: string | null;
}) {
  try {
    const now = new Date();
    const idPeriode = params.id_periode ?? null;
    const idReferensi = params.id_referensi ?? null;
    const keterangan = params.keterangan ?? null;

    await prisma.$executeRaw(Prisma.sql`
      INSERT INTO log_publikasi (id_user, id_periode, jenis, id_referensi, aksi, keterangan, created_at)
      VALUES (${params.id_user}, ${idPeriode}, ${params.jenis}, ${idReferensi}, ${params.aksi}, ${keterangan}, ${now})
    `);
  } catch (err) {
    console.error('Gagal mencatat log publikasi:', err);
  }
}

export interface LogPublikasiItem {
  id_log: number;
  id_user: number;
  nama_user: string;
  email_user: string;
  role_user: string;
  id_periode: number | null;
  nama_periode: string | null;
  jenis: string;
  id_referensi: number | null;
  aksi: string;
  keterangan: string | null;
  created_at: string;
}

/**
 * Ambil daftar riwayat publikasi (audit log) dari tabel log_publikasi.
 */
export async function getLogPublikasiList(params: {
  id_periode?: number | null;
  jenis?: string | null;
  limit?: number;
}): Promise<LogPublikasiItem[]> {
  const limit = Math.min(Math.max(params.limit || 50, 1), 200);
  const conditions: Prisma.Sql[] = [Prisma.sql`1 = 1`];

  if (params.id_periode) {
    conditions.push(Prisma.sql`l.id_periode = ${params.id_periode}`);
  }
  if (params.jenis) {
    conditions.push(Prisma.sql`l.jenis = ${params.jenis}`);
  }

  const whereClause = Prisma.join(conditions, ' AND ');

  const rows = await prisma.$queryRaw<
    Array<{
      id_log: number;
      id_user: number;
      nama_user: string | null;
      email_user: string | null;
      role_user: string | null;
      id_periode: number | null;
      nama_periode: string | null;
      jenis: string;
      id_referensi: number | null;
      aksi: string;
      keterangan: string | null;
      created_at: Date | string;
    }>
  >(Prisma.sql`
    SELECT
      l.id_log,
      l.id_user,
      u.nama AS nama_user,
      u.email AS email_user,
      u.role AS role_user,
      l.id_periode,
      p.nama_periode,
      l.jenis,
      l.id_referensi,
      l.aksi,
      l.keterangan,
      l.created_at
    FROM log_publikasi l
    LEFT JOIN users u ON l.id_user = u.id_user
    LEFT JOIN periode p ON l.id_periode = p.id_periode
    WHERE ${whereClause}
    ORDER BY l.created_at DESC, l.id_log DESC
    LIMIT ${limit}
  `);

  return rows.map((r) => ({
    id_log: Number(r.id_log),
    id_user: Number(r.id_user),
    nama_user: r.nama_user || `User #${r.id_user}`,
    email_user: r.email_user || '-',
    role_user: r.role_user || 'admin',
    id_periode: r.id_periode !== null ? Number(r.id_periode) : null,
    nama_periode: r.nama_periode || null,
    jenis: r.jenis,
    id_referensi: r.id_referensi !== null ? Number(r.id_referensi) : null,
    aksi: r.aksi,
    keterangan: r.keterangan || null,
    created_at: new Date(r.created_at).toISOString(),
  }));
}

export interface HasilLockState {
  locked: boolean;
  alasan: string | null;
  dipublikasi: boolean;
  tanggalPublikasi: Date | null;
  dipublikasiOleh: number | null;
  namaUserPublikasi: string | null;
  batasPenetapan: Date | null;
  lewatBatasWaktu: boolean;
}

/**
 * Tentukan status penguncian data hasil seleksi suatu periode.
 * Penguncian dilakukan secara MANUAL saat Admin menekan tombol "Publish Hasil Seleksi & Kunci Data".
 * Jadwal timeline berfungsi sebagai target/referensi waktu — tidak mengunci data otomatis meskipun
 * batas tanggal telah terlewati, agar panitia tetap fleksibel menyesuaikan data jika belum siap.
 */
export async function getHasilLockState(id_periode: number): Promise<HasilLockState> {
  const pubStatus = await getPeriodePublikasiStatus(id_periode);

  // Prioritaskan tahapan yang secara spesifik ditandai is_pengumuman = true, fallback ke kata kunci nama_tahapan 'pengumuman'
  const tahapPengumuman =
    (await prisma.timeline.findFirst({
      where: {
        id_periode,
        status: true,
        is_pengumuman: true,
      },
      orderBy: { urutan: 'asc' },
      select: { tanggal_selesai: true },
    })) ||
    (await prisma.timeline.findFirst({
      where: {
        id_periode,
        status: true,
        nama_tahapan: { contains: 'pengumuman' },
      },
      orderBy: { urutan: 'asc' },
      select: { tanggal_selesai: true },
    }));

  let batasPenetapan: Date | null = null;
  if (tahapPengumuman) {
    batasPenetapan = new Date(tahapPengumuman.tanggal_selesai);
    batasPenetapan.setHours(23, 59, 59, 999);
  }

  const dipublikasi = pubStatus.hasil_dipublikasi;
  const tanggalPublikasi = pubStatus.tanggal_publikasi_hasil;
  const lewatBatasWaktu = Boolean(batasPenetapan && new Date() > batasPenetapan);

  // Tidak ada penguncian permanen kaku; data tetap fleksibel dan admin dapat mempublikasikan,
  // menarik kembali ke draft, maupun menyesuaikan nilai kapan saja.
  return {
    locked: false,
    alasan: null,
    dipublikasi,
    tanggalPublikasi,
    dipublikasiOleh: pubStatus.dipublikasi_oleh,
    namaUserPublikasi: pubStatus.nama_user_publikasi,
    batasPenetapan,
    lewatBatasWaktu,
  };
}
