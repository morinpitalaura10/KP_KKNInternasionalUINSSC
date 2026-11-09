import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// POST /api/persyaratan/copy
// Menyalin dokumen persyaratan dari satu periode ke periode lainnya
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

    // Ambil dokumen persyaratan dari periode asal
    const sourceItems = await prisma.persyaratan.findMany({
      where: { id_periode: sourceId },
      orderBy: { id_persyaratan: 'asc' },
    });

    if (sourceItems.length === 0) {
      return NextResponse.json(
        {
          success: false,
          message: `Periode asal "${sourcePeriode.nama_periode}" belum memiliki dokumen persyaratan untuk disalin.`,
        },
        { status: 400 }
      );
    }

    // Ambil dokumen persyaratan yang sudah ada di periode tujuan
    const existingTarget = await prisma.persyaratan.findMany({
      where: { id_periode: targetId },
      include: {
        _count: {
          select: { dokumen_pendaftaran: true },
        },
      },
    });

    const isReplace = mode === 'replace';

    if (isReplace) {
      // Cek apakah ada dokumen pendaftaran mahasiswa yang terkait pada periode tujuan
      const hasUploadedDocs = existingTarget.some((item) => item._count.dokumen_pendaftaran > 0);
      if (hasUploadedDocs) {
        return NextResponse.json(
          {
            success: false,
            message:
              'Tidak dapat menimpa (replace) seluruh dokumen karena sudah ada berkas pendaftaran mahasiswa yang terunggah pada periode tujuan. Silakan gunakan mode "Tambahkan yang Belum Ada".',
          },
          { status: 400 }
        );
      }

      // Hapus dokumen lama di periode tujuan dalam transaksi
      await prisma.$transaction(async (tx) => {
        await tx.persyaratan.deleteMany({
          where: { id_periode: targetId },
        });

        await tx.persyaratan.createMany({
          data: sourceItems.map((item) => ({
            id_periode: targetId,
            nama_persyaratan: item.nama_persyaratan,
            deskripsi: item.deskripsi,
            format_file: item.format_file,
            ukuran_maksimal: item.ukuran_maksimal,
            wajib: item.wajib,
            status: item.status,
          })),
        });
      });

      return NextResponse.json({
        success: true,
        message: `Berhasil mengganti seluruh dokumen persyaratan di "${targetPeriode.nama_periode}" dengan ${sourceItems.length} dokumen dari "${sourcePeriode.nama_periode}".`,
        copiedCount: sourceItems.length,
      });
    }

    // Mode 'append' (default): salin yang belum ada saja
    const existingNames = new Set(
      existingTarget.map((t) => t.nama_persyaratan.trim().toLowerCase())
    );

    const toInsert = sourceItems.filter(
      (item) => !existingNames.has(item.nama_persyaratan.trim().toLowerCase())
    );

    if (toInsert.length === 0) {
      return NextResponse.json({
        success: true,
        message: `Semua dokumen persyaratan dari "${sourcePeriode.nama_periode}" sudah tersedia di "${targetPeriode.nama_periode}". Tidak ada dokumen baru yang ditambahkan.`,
        copiedCount: 0,
      });
    }

    await prisma.persyaratan.createMany({
      data: toInsert.map((item) => ({
        id_periode: targetId,
        nama_persyaratan: item.nama_persyaratan,
        deskripsi: item.deskripsi,
        format_file: item.format_file,
        ukuran_maksimal: item.ukuran_maksimal,
        wajib: item.wajib,
        status: item.status,
      })),
    });

    return NextResponse.json({
      success: true,
      message: `Berhasil menambahkan ${toInsert.length} dokumen persyaratan dari "${sourcePeriode.nama_periode}" ke "${targetPeriode.nama_periode}". Anda dapat mengubah, menambah, atau menghapus berkas sesuai kebutuhan.`,
      copiedCount: toInsert.length,
    });
  } catch (error) {
    console.error('Error copying persyaratan:', error);
    return NextResponse.json(
      { success: false, message: 'Gagal menyalin dokumen persyaratan ke database MySQL.' },
      { status: 500 }
    );
  }
}

