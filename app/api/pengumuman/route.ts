import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { resolveActorUserId, catatLogPublikasi } from '@/lib/publikasi';

// GET /api/pengumuman
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    const periodeId = searchParams.get('id_periode');
    const isAdmin = searchParams.get('admin') === 'true';

    if (id) {
      const item = await prisma.pengumuman.findUnique({
        where: { id_pengumuman: parseInt(id, 10) },
        include: {
          users: { select: { nama: true, email: true } },
          periode: { select: { nama_periode: true, tahun: true } },
        },
      });
      if (!item) {
        return NextResponse.json({ success: false, message: 'Pengumuman tidak ditemukan' }, { status: 404 });
      }
      return NextResponse.json({ success: true, data: mapItem(item) });
    }

    let targetPeriodeId: number | null = null;
    if (periodeId) {
      targetPeriodeId = parseInt(periodeId, 10);
    } else if (!isAdmin) {
      // Mahasiswa / publik default hanya melihat pengumuman periode yang berstatus Aktif
      const activePeriode = await prisma.periode.findFirst({
        where: { status: 'Aktif' },
      });
      if (activePeriode) {
        targetPeriodeId = activePeriode.id_periode;
      }
    }

    const whereClause: any = {};
    if (!isAdmin) {
      whereClause.status = true;
    }
    if (targetPeriodeId) {
      whereClause.id_periode = targetPeriodeId;
    }

    const items = await prisma.pengumuman.findMany({
      where: whereClause,
      include: {
        users: { select: { nama: true, email: true } },
        periode: { select: { nama_periode: true, tahun: true } },
      },
      orderBy: { tanggal_publish: 'desc' },
    });

    return NextResponse.json({ success: true, data: items.map(mapItem) });
  } catch (error) {
    console.error('Error fetching pengumuman:', error);
    return NextResponse.json({ success: false, message: 'Gagal mengambil data pengumuman' }, { status: 500 });
  }
}

// POST /api/pengumuman - Tambah pengumuman baru
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { id_periode, id_user, judul, isi, tanggal_publish, status } = body;

    if (!id_periode || !id_user || !judul || !isi) {
      return NextResponse.json(
        { success: false, message: 'id_periode, id_user, judul, dan isi wajib diisi!' },
        { status: 400 }
      );
    }

    const newItem = await prisma.pengumuman.create({
      data: {
        id_periode: parseInt(String(id_periode), 10),
        id_user: parseInt(String(id_user), 10),
        judul,
        isi,
        tanggal_publish: tanggal_publish ? new Date(tanggal_publish) : new Date(),
        status: status !== undefined ? Boolean(status) : true,
      },
      include: {
        users: { select: { nama: true, email: true } },
        periode: { select: { nama_periode: true, tahun: true } },
      },
    });

    const actorId = await resolveActorUserId(req, id_user);
    await catatLogPublikasi({
      id_user: actorId,
      jenis: 'pengumuman',
      aksi: newItem.status ? 'Publish' : 'Private',
      id_periode: newItem.id_periode,
      id_referensi: newItem.id_pengumuman,
      keterangan: `Pengumuman baru "${newItem.judul}" dibuat dengan status ${newItem.status ? 'Publish' : 'Private'}.`,
    });

    return NextResponse.json({ success: true, data: mapItem(newItem), message: 'Pengumuman berhasil ditambahkan!' });
  } catch (error) {
    console.error('Error creating pengumuman:', error);
    return NextResponse.json({ success: false, message: 'Gagal menambahkan pengumuman' }, { status: 500 });
  }
}

// PUT /api/pengumuman - Update pengumuman
export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, id_pengumuman, id_periode, judul, isi, tanggal_publish, status } = body;

    const targetId = parseInt(String(id || id_pengumuman), 10);
    if (!targetId || isNaN(targetId)) {
      return NextResponse.json({ success: false, message: 'ID Pengumuman wajib disertakan!' }, { status: 400 });
    }

    const existing = await prisma.pengumuman.findUnique({ where: { id_pengumuman: targetId } });
    if (!existing) {
      return NextResponse.json({ success: false, message: 'Pengumuman tidak ditemukan!' }, { status: 404 });
    }

    const updated = await prisma.pengumuman.update({
      where: { id_pengumuman: targetId },
      data: {
        ...(id_periode ? { id_periode: parseInt(String(id_periode), 10) } : {}),
        ...(judul ? { judul } : {}),
        ...(isi ? { isi } : {}),
        ...(tanggal_publish ? { tanggal_publish: new Date(tanggal_publish) } : {}),
        ...(status !== undefined ? { status: Boolean(status) } : {}),
      },
      include: {
        users: { select: { nama: true, email: true } },
        periode: { select: { nama_periode: true, tahun: true } },
      },
    });

    // Log audit: catat perubahan status publikasi (Publish / Private)
    if (status !== undefined && Boolean(status) !== existing.status) {
      const actorId = await resolveActorUserId(req, body?.id_user);
      await catatLogPublikasi({
        id_user: actorId,
        jenis: 'pengumuman',
        aksi: updated.status ? 'Publish' : 'Private',
        id_periode: updated.id_periode,
        id_referensi: updated.id_pengumuman,
        keterangan: `Pengumuman "${updated.judul}" diubah menjadi ${updated.status ? 'Publish' : 'Private'}.`,
      });
    }

    return NextResponse.json({ success: true, data: mapItem(updated), message: 'Pengumuman berhasil diperbarui!' });
  } catch (error) {
    console.error('Error updating pengumuman:', error);
    return NextResponse.json({ success: false, message: 'Gagal memperbarui pengumuman' }, { status: 500 });
  }
}

// DELETE /api/pengumuman?id=xxx
export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const idParam = searchParams.get('id');
    const targetId = parseInt(String(idParam), 10);

    if (!targetId || isNaN(targetId)) {
      return NextResponse.json({ success: false, message: 'ID Pengumuman wajib disertakan!' }, { status: 400 });
    }

    await prisma.pengumuman.delete({ where: { id_pengumuman: targetId } });

    return NextResponse.json({ success: true, message: 'Pengumuman berhasil dihapus!' });
  } catch (error) {
    console.error('Error deleting pengumuman:', error);
    return NextResponse.json({ success: false, message: 'Gagal menghapus pengumuman' }, { status: 500 });
  }
}

function mapItem(item: any) {
  return {
    id: item.id_pengumuman,
    id_pengumuman: item.id_pengumuman,
    id_periode: item.id_periode,
    id_user: item.id_user,
    judul: item.judul,
    isi: item.isi,
    tanggal_publish: item.tanggal_publish,
    status: item.status,
    created_at: item.created_at,
    nama_user: item.users?.nama || null,
    nama_periode: item.periode?.nama_periode || null,
  };
}
