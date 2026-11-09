import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

interface RawSuratRow {
  id_surat: number | bigint;
  id_periode: number | bigint | null;
  id_pendaftaran: number | bigint | null;
  id_user: number | bigint;
  nama_surat: string;
  file_path: string;
  tanggal_upload: Date | string | null;
  status: number | boolean;
  nama_periode?: string | null;
  nama_pembuat?: string | null;
}

// Helper to map surat row
function mapSuratItem(s: RawSuratRow) {
  const idPeriode =
    s.id_periode !== null && s.id_periode !== undefined ? Number(s.id_periode) : null;
  const isPublished = Boolean(s.status);
  const tanggalIso = s.tanggal_upload
    ? new Date(s.tanggal_upload).toISOString()
    : null;

  return {
    id_surat: Number(s.id_surat),
    id_periode: idPeriode,
    id_pendaftaran:
      s.id_pendaftaran !== null && s.id_pendaftaran !== undefined
        ? Number(s.id_pendaftaran)
        : null,
    id_user: Number(s.id_user),
    nama_surat: s.nama_surat,
    file_path: s.file_path,
    tanggal_upload: tanggalIso,
    status: isPublished,
    status_label: isPublished ? 'Publish' : 'Draft',
    nama_periode:
      idPeriode === null ? 'Semua Periode' : s.nama_periode || 'Semua Periode',
    nama_pembuat: s.nama_pembuat || 'Admin LP2M',
  };
}

const BASE_SELECT_SQL = `
  SELECT
    s.id_surat,
    s.id_periode,
    s.id_pendaftaran,
    s.id_user,
    s.nama_surat,
    s.file_path,
    s.tanggal_upload,
    s.status,
    p.nama_periode,
    u.nama AS nama_pembuat
  FROM surat s
  LEFT JOIN periode p ON s.id_periode = p.id_periode
  LEFT JOIN users u ON s.id_user = u.id_user
`;

// GET /api/surat
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    const search = searchParams.get('search')?.trim() || '';
    const idPeriode = searchParams.get('id_periode');
    const statusParam = searchParams.get('status'); // 'all', 'Publish', 'Draft'

    if (id) {
      const rows = await prisma.$queryRawUnsafe<RawSuratRow[]>(
        `${BASE_SELECT_SQL} WHERE s.id_surat = ? LIMIT 1`,
        parseInt(id, 10)
      );
      if (!rows || rows.length === 0) {
        return NextResponse.json(
          { success: false, message: 'Surat tidak ditemukan' },
          { status: 404 }
        );
      }
      return NextResponse.json({ success: true, data: mapSuratItem(rows[0]) });
    }

    const conditions: string[] = [];
    const params: (string | number)[] = [];

    if (idPeriode && idPeriode !== 'all') {
      const pid = parseInt(idPeriode, 10);
      if (!isNaN(pid)) {
        conditions.push('(s.id_periode = ? OR s.id_periode IS NULL)');
        params.push(pid);
      }
    }

    if (statusParam && statusParam !== 'all') {
      conditions.push('s.status = ?');
      params.push(statusParam === 'Publish' ? 1 : 0);
    }

    if (search) {
      conditions.push('s.nama_surat LIKE ?');
      params.push(`%${search}%`);
    }

    const whereClause =
      conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    const items = await prisma.$queryRawUnsafe<RawSuratRow[]>(
      `${BASE_SELECT_SQL} ${whereClause} ORDER BY s.id_surat ASC`,
      ...params
    );

    const periodes = await prisma.periode.findMany({
      orderBy: { created_at: 'desc' },
      select: { id_periode: true, nama_periode: true, tahun: true, status: true },
    });

    return NextResponse.json({
      success: true,
      data: items.map(mapSuratItem),
      periodes: periodes.map((p) => ({
        id_periode: p.id_periode,
        nama_periode: p.nama_periode,
        tahun: p.tahun,
        status: p.status === 'Belum_Aktif' ? 'Belum Aktif' : p.status,
      })),
    });
  } catch (error) {
    console.error('Error fetching surat:', error);
    return NextResponse.json(
      { success: false, message: 'Gagal mengambil data surat' },
      { status: 500 }
    );
  }
}

// POST /api/surat
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { id_periode, nama_surat, file_path, status } = body;

    if (!nama_surat) {
      return NextResponse.json(
        { success: false, message: 'Nama surat wajib diisi!' },
        { status: 400 }
      );
    }

    const adminUser = await prisma.user.findFirst({ where: { role: 'admin' } });
    const id_user = adminUser ? adminUser.id_user : 3;

    // Handle "Semua Periode" (id_periode bernilai null, 'all', 0, atau kosong)
    let targetPeriodeId: number | null = null;
    if (
      id_periode !== null &&
      id_periode !== undefined &&
      id_periode !== 'all' &&
      id_periode !== 0 &&
      id_periode !== '0' &&
      id_periode !== ''
    ) {
      const parsed = parseInt(String(id_periode), 10);
      if (!isNaN(parsed)) {
        targetPeriodeId = parsed;
      }
    }

    const finalNamaSurat = nama_surat.trim();
    const finalFilePath =
      file_path ||
      `/documents/${finalNamaSurat.toLowerCase().replace(/[^a-z0-9]/g, '_')}.pdf`;
    const isPublished = status !== undefined ? Boolean(status) : true;

    await prisma.$executeRawUnsafe(
      `INSERT INTO surat (id_periode, id_user, nama_surat, file_path, tanggal_upload, status)
       VALUES (?, ?, ?, ?, NOW(), ?)`,
      targetPeriodeId,
      id_user,
      finalNamaSurat,
      finalFilePath,
      isPublished ? 1 : 0
    );

    const rows = await prisma.$queryRawUnsafe<RawSuratRow[]>(
      `${BASE_SELECT_SQL} ORDER BY s.id_surat DESC LIMIT 1`
    );

    return NextResponse.json({
      success: true,
      message: 'Template surat berhasil ditambahkan!',
      data: rows[0] ? mapSuratItem(rows[0]) : null,
    });
  } catch (error) {
    console.error('Error creating surat:', error);
    return NextResponse.json(
      { success: false, message: 'Gagal menambahkan template surat' },
      { status: 500 }
    );
  }
}

// PUT /api/surat
export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const { id_surat, id_periode, nama_surat, file_path, status } = body;

    const targetId = parseInt(String(id_surat), 10);
    if (!targetId || isNaN(targetId)) {
      return NextResponse.json(
        { success: false, message: 'ID Surat wajib diisi!' },
        { status: 400 }
      );
    }

    const existingRows = await prisma.$queryRawUnsafe<RawSuratRow[]>(
      `${BASE_SELECT_SQL} WHERE s.id_surat = ? LIMIT 1`,
      targetId
    );
    if (!existingRows || existingRows.length === 0) {
      return NextResponse.json(
        { success: false, message: 'Surat tidak ditemukan' },
        { status: 404 }
      );
    }

    const existing = existingRows[0];

    let targetPeriodeId: number | null =
      existing.id_periode !== null && existing.id_periode !== undefined
        ? Number(existing.id_periode)
        : null;

    if (id_periode !== undefined) {
      if (
        id_periode === null ||
        id_periode === 'all' ||
        id_periode === 0 ||
        id_periode === '0' ||
        id_periode === ''
      ) {
        targetPeriodeId = null;
      } else {
        const parsed = parseInt(String(id_periode), 10);
        targetPeriodeId = !isNaN(parsed) ? parsed : null;
      }
    }

    const finalNamaSurat =
      nama_surat !== undefined ? nama_surat.trim() : existing.nama_surat;
    const finalFilePath =
      file_path !== undefined ? file_path.trim() : existing.file_path;
    const finalStatus =
      status !== undefined ? (Boolean(status) ? 1 : 0) : existing.status ? 1 : 0;

    await prisma.$executeRawUnsafe(
      `UPDATE surat
       SET id_periode = ?, nama_surat = ?, file_path = ?, status = ?
       WHERE id_surat = ?`,
      targetPeriodeId,
      finalNamaSurat,
      finalFilePath,
      finalStatus,
      targetId
    );

    const updatedRows = await prisma.$queryRawUnsafe<RawSuratRow[]>(
      `${BASE_SELECT_SQL} WHERE s.id_surat = ? LIMIT 1`,
      targetId
    );

    return NextResponse.json({
      success: true,
      message: 'Template surat berhasil diperbarui!',
      data: updatedRows[0] ? mapSuratItem(updatedRows[0]) : null,
    });
  } catch (error) {
    console.error('Error updating surat:', error);
    return NextResponse.json(
      { success: false, message: 'Gagal memperbarui template surat' },
      { status: 500 }
    );
  }
}

// DELETE /api/surat?id=xxx
export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const idParam = searchParams.get('id');
    const targetId = parseInt(String(idParam), 10);

    if (!targetId || isNaN(targetId)) {
      return NextResponse.json(
        { success: false, message: 'ID Surat wajib diisi!' },
        { status: 400 }
      );
    }

    await prisma.$executeRawUnsafe(
      `DELETE FROM surat WHERE id_surat = ?`,
      targetId
    );

    return NextResponse.json({
      success: true,
      message: 'Template surat berhasil dihapus!',
    });
  } catch (error) {
    console.error('Error deleting surat:', error);
    return NextResponse.json(
      { success: false, message: 'Gagal menghapus template surat' },
      { status: 500 }
    );
  }
}
