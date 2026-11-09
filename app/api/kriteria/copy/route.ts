import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// POST /api/kriteria/copy
// Menyalin kriteria seleksi dari satu periode ke periode lainnya
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { source_id_periode, target_id_periode, mode } = body;

    const sourceId = parseInt(String(source_id_periode), 10);
    const targetId = parseInt(String(target_id_periode), 10);

    if (!sourceId || !targetId) {
      return NextResponse.json(
        { success: false, message: 'ID Periode Asal (source) dan Periode Tujuan (target) wajib disertakan!' },
        { status: 400 }
      );
    }

    if (sourceId === targetId) {
      return NextResponse.json(
        { success: false, message: 'Periode asal dan periode tujuan tidak boleh sama!' },
        { status: 400 }
      );
    }

    // Pastikan kedua periode ada di database
    const [sourcePeriode, targetPeriode] = await Promise.all([
      prisma.periode.findUnique({ where: { id_periode: sourceId } }),
      prisma.periode.findUnique({ where: { id_periode: targetId } }),
    ]);

    if (!sourcePeriode) {
      return NextResponse.json(
        { success: false, message: 'Periode asal tidak ditemukan di database!' },
        { status: 404 }
      );
    }

    if (!targetPeriode) {
      return NextResponse.json(
        { success: false, message: 'Periode tujuan tidak ditemukan di database!' },
        { status: 404 }
      );
    }

    // Ambil kriteria seleksi dari periode asal
    const sourceItems = await prisma.kriteria_seleksi.findMany({
      where: { id_periode: sourceId },
      orderBy: { id_kriteria: 'asc' },
    });

    if (sourceItems.length === 0) {
      return NextResponse.json(
        {
          success: false,
          message: `Periode asal "${sourcePeriode.nama_periode}" belum memiliki kriteria seleksi untuk disalin.`,
        },
        { status: 400 }
      );
    }

    // Ambil kriteria yang sudah ada di periode tujuan
    const existingTarget = await prisma.kriteria_seleksi.findMany({
      where: { id_periode: targetId },
      include: {
        _count: {
          select: { nilai_seleksi: true },
        },
      },
    });

    const isReplace = mode === 'replace';

    if (isReplace) {
      // Cek apakah ada nilai_seleksi mahasiswa yang terkait
      const hasScores = existingTarget.some((item) => item._count.nilai_seleksi > 0);
      if (hasScores) {
        return NextResponse.json(
          {
            success: false,
            message:
              'Tidak dapat menimpa (replace) seluruh kriteria karena sudah ada data penilaian mahasiswa pada periode tujuan. Silakan gunakan mode "Tambahkan yang Belum Ada".',
          },
          { status: 400 }
        );
      }

      await prisma.$transaction(async (tx) => {
        await tx.kriteria_seleksi.deleteMany({
          where: { id_periode: targetId },
        });

        await tx.kriteria_seleksi.createMany({
          data: sourceItems.map((item) => ({
            id_periode: targetId,
            nama_kriteria: item.nama_kriteria,
            bobot: item.bobot,
            nilai_maksimal: item.nilai_maksimal,
            jenis: item.jenis,
            metode_nilai: item.metode_nilai,
            status: item.status,
          })),
        });
      });

      return NextResponse.json({
        success: true,
        message: `Berhasil mengganti seluruh kriteria seleksi di "${targetPeriode.nama_periode}" dengan ${sourceItems.length} kriteria dari "${sourcePeriode.nama_periode}". Total bobot tetap 100% dan siap disesuaikan.`,
        copiedCount: sourceItems.length,
      });
    }

    // Mode 'append'
    const existingNames = new Set(
      existingTarget.map((t) => t.nama_kriteria.trim().toLowerCase())
    );

    const toInsert = sourceItems.filter(
      (item) => !existingNames.has(item.nama_kriteria.trim().toLowerCase())
    );

    if (toInsert.length === 0) {
      return NextResponse.json({
        success: true,
        message: `Semua kriteria seleksi dari "${sourcePeriode.nama_periode}" sudah ada di "${targetPeriode.nama_periode}". Tidak ada kriteria baru yang ditambahkan.`,
        copiedCount: 0,
      });
    }

    await prisma.kriteria_seleksi.createMany({
      data: toInsert.map((item) => ({
        id_periode: targetId,
        nama_kriteria: item.nama_kriteria,
        bobot: item.bobot,
        nilai_maksimal: item.nilai_maksimal,
        jenis: item.jenis,
        metode_nilai: item.metode_nilai,
        status: item.status,
      })),
    });

    return NextResponse.json({
      success: true,
      message: `Berhasil menambahkan ${toInsert.length} kriteria seleksi dari "${sourcePeriode.nama_periode}" ke "${targetPeriode.nama_periode}". Anda dapat mengatur bobot nilai sesuai kebutuhan.`,
      copiedCount: toInsert.length,
    });
  } catch (error) {
    console.error('Error copying kriteria:', error);
    return NextResponse.json(
      { success: false, message: 'Gagal menyalin kriteria seleksi ke database MySQL.' },
      { status: 500 }
    );
  }
}

