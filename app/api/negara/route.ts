import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/negara - List all countries with their status, active period linkage, and applicant counts
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const search = searchParams.get('search')?.trim() || '';
    const statusParam = searchParams.get('status');

    // Find active period
    const activePeriode = await prisma.periode.findFirst({
      where: { status: 'Aktif' },
    });

    // Where condition
    const where: {
      nama_negara?: { contains: string };
      status?: boolean;
    } = {};

    if (search) {
      where.nama_negara = { contains: search };
    }

    if (statusParam === 'aktif') {
      where.status = true;
    } else if (statusParam === 'nonaktif') {
      where.status = false;
    }

    const [negaraList, rawExtras] = await Promise.all([
      prisma.negara.findMany({
        where,
        include: {
          periode_negara: {
            include: {
              periode: true,
              _count: {
                select: { pendaftaran: true },
              },
            },
          },
        },
        orderBy: { id_negara: 'asc' },
      }),
      prisma.$queryRawUnsafe<any[]>('SELECT id_negara, foto, deskripsi FROM negara').catch(() => []),
    ]);

    const extraMap = new Map((rawExtras || []).map((e) => [e.id_negara, e]));

    const data = negaraList.map((n) => {
      const activePeriodLink = activePeriode
        ? n.periode_negara.find((pn) => pn.id_periode === activePeriode.id_periode)
        : null;

      const totalPendaftar = n.periode_negara.reduce(
        (acc, pn) => acc + (pn._count?.pendaftaran || 0),
        0
      );

      const extra = extraMap.get(n.id_negara);

      return {
        id_negara: n.id_negara,
        nama_negara: n.nama_negara,
        status: n.status,
        foto: extra?.foto || (n as any).foto || (n.nama_negara.toLowerCase().includes('thailand') ? '/thailand_kkn.jpg' : '/hero_bg.jpg'),
        deskripsi: extra?.deskripsi || (n as any).deskripsi || '',
        isActiveInCurrentPeriode: activePeriodLink ? Boolean(activePeriodLink.status) : false,
        id_periode_negara: activePeriodLink ? activePeriodLink.id_periode_negara : null,
        totalPeriode: n.periode_negara.length,
        totalPendaftar,
      };
    });

    return NextResponse.json({
      success: true,
      data,
      activePeriode: activePeriode
        ? {
            id_periode: activePeriode.id_periode,
            nama_periode: activePeriode.nama_periode,
            tahun: activePeriode.tahun,
          }
        : null,
    });
  } catch (error) {
    console.error('Error fetching negara list:', error);
    return NextResponse.json(
      { success: false, message: 'Gagal memuat data negara' },
      { status: 500 }
    );
  }
}

// POST /api/negara - Add new country
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { nama_negara, status = true, addToActivePeriode = false, foto, deskripsi } = body;

    if (!nama_negara || !nama_negara.trim()) {
      return NextResponse.json(
        { success: false, message: 'Nama negara wajib diisi!' },
        { status: 400 }
      );
    }

    const trimmedNama = nama_negara.trim();

    // Check duplicate
    const existing = await prisma.negara.findFirst({
      where: { nama_negara: trimmedNama },
    });

    if (existing) {
      return NextResponse.json(
        { success: false, message: `Negara "${trimmedNama}" sudah terdaftar!` },
        { status: 400 }
      );
    }

    const created = await prisma.negara.create({
      data: {
        nama_negara: trimmedNama,
        status: status !== false,
      },
    });

    const photoUrl = foto ? String(foto).trim() : '/hero_bg.jpg';
    const descText = deskripsi
      ? String(deskripsi).trim()
      : `Program KKN Internasional di ${trimmedNama} berfokus pada kolaborasi budaya dan pengabdian masyarakat.`;

    await prisma.$executeRawUnsafe(
      'UPDATE negara SET foto = ?, deskripsi = ? WHERE id_negara = ?',
      photoUrl,
      descText,
      created.id_negara
    ).catch((err) => {
      console.warn('Raw update foto/deskripsi on create warning:', err);
    });

    // If requested or default, add to active period
    if (addToActivePeriode) {
      const activePeriode = await prisma.periode.findFirst({
        where: { status: 'Aktif' },
      });
      if (activePeriode) {
        await prisma.periode_negara.create({
          data: {
            id_periode: activePeriode.id_periode,
            id_negara: created.id_negara,
            status: true,
          },
        });
      }
    }

    return NextResponse.json({
      success: true,
      message: `Negara ${created.nama_negara} berhasil ditambahkan!`,
      data: {
        ...created,
        foto: photoUrl,
        deskripsi: descText,
      },
    });
  } catch (error) {
    console.error('Error creating negara:', error);
    return NextResponse.json(
      { success: false, message: error instanceof Error ? error.message : 'Gagal menambahkan negara' },
      { status: 500 }
    );
  }
}

// PUT /api/negara - Update country or toggle active period linkage
export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      id_negara,
      nama_negara,
      status,
      foto,
      deskripsi,
      toggleCurrentPeriode, // boolean to add/remove from active period
    } = body;

    const targetId = parseInt(String(id_negara), 10);
    if (!targetId || isNaN(targetId)) {
      return NextResponse.json(
        { success: false, message: 'ID Negara tidak valid!' },
        { status: 400 }
      );
    }

    const existing = await prisma.negara.findUnique({
      where: { id_negara: targetId },
    });

    if (!existing) {
      return NextResponse.json(
        { success: false, message: 'Data negara tidak ditemukan!' },
        { status: 404 }
      );
    }

    // 1. Update basic negara fields (nama_negara, status)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const updateData: any = {};
    if (nama_negara !== undefined && String(nama_negara).trim()) {
      updateData.nama_negara = String(nama_negara).trim();
    }
    if (status !== undefined) {
      updateData.status = Boolean(status);
    }

    let updated = existing;
    if (Object.keys(updateData).length > 0) {
      updated = await prisma.negara.update({
        where: { id_negara: targetId },
        data: updateData,
      });
    }

    // 2. Update raw columns (foto, deskripsi) to bypass client dll differences
    if (foto !== undefined || deskripsi !== undefined) {
      const currentFoto = foto !== undefined ? String(foto).trim() : existing.foto || '/hero_bg.jpg';
      const currentDeskripsi = deskripsi !== undefined ? String(deskripsi).trim() : existing.deskripsi || '';
      await prisma.$executeRawUnsafe(
        'UPDATE negara SET foto = ?, deskripsi = ? WHERE id_negara = ?',
        currentFoto,
        currentDeskripsi,
        targetId
      ).catch((err) => {
        console.warn('Raw update foto/deskripsi warning:', err);
      });
    }

    // 3. Handle active period linkage toggle if provided
    let periodMessage = '';
    if (toggleCurrentPeriode !== undefined) {
      const activePeriode = await prisma.periode.findFirst({
        where: { status: 'Aktif' },
      });

      if (activePeriode) {
        const existingLink = await prisma.periode_negara.findFirst({
          where: {
            id_periode: activePeriode.id_periode,
            id_negara: targetId,
          },
        });

        if (existingLink) {
          await prisma.periode_negara.update({
            where: { id_periode_negara: existingLink.id_periode_negara },
            data: { status: Boolean(toggleCurrentPeriode) },
          });
          periodMessage = toggleCurrentPeriode
            ? ` (Dibuka untuk ${activePeriode.nama_periode})`
            : ` (Dinonaktifkan dari ${activePeriode.nama_periode})`;
        } else if (toggleCurrentPeriode) {
          await prisma.periode_negara.create({
            data: {
              id_periode: activePeriode.id_periode,
              id_negara: targetId,
              status: true,
            },
          });
          periodMessage = ` (Dibuka untuk ${activePeriode.nama_periode})`;
        }
      }
    }

    const finalName = updateData.nama_negara || existing.nama_negara;
    return NextResponse.json({
      success: true,
      message: `Data negara ${finalName} berhasil diperbarui!${periodMessage}`,
      data: {
        ...updated,
        foto: foto !== undefined ? String(foto).trim() : existing.foto,
        deskripsi: deskripsi !== undefined ? String(deskripsi).trim() : existing.deskripsi,
      },
    });
  } catch (error) {
    console.error('Error updating negara:', error);
    return NextResponse.json(
      { success: false, message: error instanceof Error ? error.message : 'Gagal memperbarui data negara' },
      { status: 500 }
    );
  }
}

// DELETE /api/negara?id=xxx - Delete country
export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const idParam = searchParams.get('id');
    const targetId = parseInt(String(idParam), 10);

    if (!targetId || isNaN(targetId)) {
      return NextResponse.json(
        { success: false, message: 'ID Negara wajib disertakan!' },
        { status: 400 }
      );
    }

    // Check if any pendaftaran references this negara
    const pendaftaranCount = await prisma.pendaftaran.count({
      where: {
        periode_negara: {
          id_negara: targetId,
        },
      },
    });

    if (pendaftaranCount > 0) {
      // Don't hard delete if data exists, deactivate instead
      await prisma.negara.update({
        where: { id_negara: targetId },
        data: { status: false },
      });

      return NextResponse.json({
        success: true,
        message: `Negara memiliki ${pendaftaranCount} peserta pendaftar dan telah dinonaktifkan (tidak dihapus permanen agar data historis tetap aman).`,
      });
    }

    // Delete periode_negara links first
    await prisma.periode_negara.deleteMany({
      where: { id_negara: targetId },
    });

    // Delete negara
    await prisma.negara.delete({
      where: { id_negara: targetId },
    });

    return NextResponse.json({
      success: true,
      message: 'Negara berhasil dihapus permanen!',
    });
  } catch (error) {
    console.error('Error deleting negara:', error);
    return NextResponse.json(
      { success: false, message: 'Gagal menghapus negara' },
      { status: 500 }
    );
  }
}
