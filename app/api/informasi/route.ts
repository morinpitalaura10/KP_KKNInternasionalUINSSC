import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/informasi - Ambil semua informasi (atau filter by id_periode)
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    const periodeId = searchParams.get('id_periode');
    const isAdmin = searchParams.get('admin') === 'true';

    if (id) {
      const item = await prisma.informasi.findUnique({
        where: { id_informasi: parseInt(id, 10) },
        include: {
          users: { select: { nama: true, email: true } },
          periode: { select: { nama_periode: true, tahun: true } },
        },
      });
      if (!item) {
        return NextResponse.json({ success: false, message: 'Informasi tidak ditemukan' }, { status: 404 });
      }
      return NextResponse.json({ success: true, data: mapItem(item) });
    }

    // Filter periode untuk admin maupun publik/mahasiswa
    let whereClause: any = {};

    if (isAdmin) {
      if (periodeId && periodeId !== 'all') {
        if (periodeId === 'null' || periodeId === 'umum') {
          whereClause.id_periode = null;
        } else {
          whereClause.id_periode = parseInt(periodeId, 10);
        }
      }
    } else {
      // Publik / Mahasiswa: hanya yang aktif
      whereClause.status = true;

      let targetPeriodeId = periodeId ? parseInt(periodeId, 10) : undefined;
      if (!periodeId) {
        const activePeriode = await prisma.periode.findFirst({ where: { status: 'Aktif' } });
        if (activePeriode) {
          targetPeriodeId = activePeriode.id_periode;
        }
      }

      if (targetPeriodeId !== undefined) {
        // Tampilkan informasi spesifik periode aktif ATAU informasi umum (id_periode === null / selalu aktif)
        whereClause.OR = [
          { id_periode: targetPeriodeId },
          { id_periode: null },
        ];
      }
    }

    const items = await prisma.informasi.findMany({
      where: whereClause,
      include: {
        users: { select: { nama: true, email: true } },
        periode: { select: { nama_periode: true, tahun: true } },
      },
      orderBy: [
        { id_periode: 'desc' },
        { created_at: 'desc' },
      ],
    });

    return NextResponse.json({ success: true, data: items.map(mapItem) });
  } catch (error) {
    console.error('Error fetching informasi:', error);
    return NextResponse.json({ success: false, message: 'Gagal mengambil data informasi' }, { status: 500 });
  }
}

// POST /api/informasi - Tambah informasi baru
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { id_periode, id_user, judul, isi, gambar, status } = body;

    if (!id_user || !judul || !isi) {
      return NextResponse.json(
        { success: false, message: 'id_user, judul, dan isi wajib diisi!' },
        { status: 400 }
      );
    }

    // Default status informasi baru adalah Nonaktif (false)
    const isNewActive = status === true || status === 'true';

    // Jika sengaja diaktifkan saat pembuatan, nonaktifkan artikel lainnya
    if (isNewActive) {
      await prisma.informasi.updateMany({
        data: { status: false },
      });
    }

    const newItem = await prisma.informasi.create({
      data: {
        id_periode: id_periode ? parseInt(String(id_periode), 10) : null,
        id_user: parseInt(String(id_user), 10),
        judul,
        isi,
        gambar: gambar || null,
        status: isNewActive,
      },
      include: {
        users: { select: { nama: true, email: true } },
        periode: { select: { nama_periode: true, tahun: true } },
      },
    });

    return NextResponse.json({ success: true, data: mapItem(newItem), message: 'Informasi berhasil ditambahkan!' });
  } catch (error) {
    console.error('Error creating informasi:', error);
    return NextResponse.json({ success: false, message: 'Gagal menambahkan informasi' }, { status: 500 });
  }
}

// PUT /api/informasi - Update informasi
export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, id_informasi, id_periode, judul, isi, gambar, status } = body;

    const targetId = parseInt(String(id || id_informasi), 10);
    if (!targetId || isNaN(targetId)) {
      return NextResponse.json({ success: false, message: 'ID Informasi wajib disertakan!' }, { status: 400 });
    }

    const existing = await prisma.informasi.findUnique({ where: { id_informasi: targetId } });
    if (!existing) {
      return NextResponse.json({ success: false, message: 'Informasi tidak ditemukan!' }, { status: 404 });
    }

    const willBeActive = status === true || status === 'true';

    // Jika informasi ini diaktifkan, otomatis nonaktifkan semua informasi lainnya (hanya 1 yang aktif)
    if (willBeActive) {
      await prisma.informasi.updateMany({
        where: { id_informasi: { not: targetId } },
        data: { status: false },
      });
    }

    const updated = await prisma.informasi.update({
      where: { id_informasi: targetId },
      data: {
        ...(id_periode !== undefined ? { id_periode: id_periode ? parseInt(String(id_periode), 10) : null } : {}),
        ...(judul ? { judul } : {}),
        ...(isi ? { isi } : {}),
        ...(gambar !== undefined ? { gambar: gambar || null } : {}),
        ...(status !== undefined ? { status: willBeActive } : {}),
        updated_at: new Date(),
      },
      include: {
        users: { select: { nama: true, email: true } },
        periode: { select: { nama_periode: true, tahun: true } },
      },
    });

    return NextResponse.json({ success: true, data: mapItem(updated), message: 'Informasi berhasil diperbarui!' });
  } catch (error) {
    console.error('Error updating informasi:', error);
    return NextResponse.json({ success: false, message: 'Gagal memperbarui informasi' }, { status: 500 });
  }
}

// DELETE /api/informasi?id=xxx - Hapus informasi
export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const idParam = searchParams.get('id');
    const targetId = parseInt(String(idParam), 10);

    if (!targetId || isNaN(targetId)) {
      return NextResponse.json({ success: false, message: 'ID Informasi wajib disertakan!' }, { status: 400 });
    }

    await prisma.informasi.delete({ where: { id_informasi: targetId } });

    return NextResponse.json({ success: true, message: 'Informasi berhasil dihapus!' });
  } catch (error) {
    console.error('Error deleting informasi:', error);
    return NextResponse.json({ success: false, message: 'Gagal menghapus informasi' }, { status: 500 });
  }
}

function mapItem(item: any) {
  return {
    id: item.id_informasi,
    id_informasi: item.id_informasi,
    id_periode: item.id_periode,
    id_user: item.id_user,
    judul: item.judul,
    isi: item.isi,
    gambar: item.gambar,
    status: item.status,
    created_at: item.created_at,
    updated_at: item.updated_at,
    nama_user: item.users?.nama || null,
    nama_periode: item.periode?.nama_periode || null,
  };
}
