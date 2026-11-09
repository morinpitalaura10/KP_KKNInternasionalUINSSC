import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// POST /api/prodi - Add new prodi under a faculty
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { id_fakultas, nama_prodi } = body;

    if (!id_fakultas || !nama_prodi || !String(nama_prodi).trim()) {
      return NextResponse.json(
        { success: false, message: 'Fakultas dan nama program studi wajib diisi!' },
        { status: 400 }
      );
    }

    const cleanProdi = String(nama_prodi).trim();
    const targetFakId = parseInt(String(id_fakultas), 10);

    const faculty = await prisma.fakultas.findUnique({
      where: { id_fakultas: targetFakId },
    });

    if (!faculty) {
      return NextResponse.json(
        { success: false, message: 'Fakultas tidak ditemukan!' },
        { status: 404 }
      );
    }

    const existing = await prisma.prodi.findFirst({
      where: {
        id_fakultas: targetFakId,
        nama_prodi: cleanProdi,
      },
    });

    if (existing) {
      return NextResponse.json(
        { success: false, message: `Program studi "${cleanProdi}" sudah terdaftar di ${faculty.nama_fakultas}!` },
        { status: 409 }
      );
    }

    const newProdi = await prisma.prodi.create({
      data: {
        id_fakultas: targetFakId,
        nama_prodi: cleanProdi,
        status: true,
      },
      include: {
        fakultas: true,
      },
    });

    return NextResponse.json({
      success: true,
      message: `Program studi "${cleanProdi}" berhasil ditambahkan ke Fakultas ${faculty.nama_fakultas}!`,
      data: newProdi,
    });
  } catch (error) {
    console.error('Error creating prodi:', error);
    return NextResponse.json(
      { success: false, message: 'Gagal menambahkan program studi ke database' },
      { status: 500 }
    );
  }
}

// DELETE /api/prodi
export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { success: false, message: 'ID prodi wajib disertakan!' },
        { status: 400 }
      );
    }

    const idProdi = parseInt(id, 10);

    const mhsCount = await prisma.mahasiswa.count({
      where: { id_prodi: idProdi },
    });

    if (mhsCount > 0) {
      return NextResponse.json(
        {
          success: false,
          message: `Program studi tidak dapat dihapus karena terdapat ${mhsCount} data mahasiswa yang terdaftar pada prodi ini.`,
        },
        { status: 400 }
      );
    }

    await prisma.prodi.delete({
      where: { id_prodi: idProdi },
    });

    return NextResponse.json({
      success: true,
      message: 'Program studi berhasil dihapus!',
    });
  } catch (error) {
    console.error('Error deleting prodi:', error);
    return NextResponse.json(
      { success: false, message: 'Gagal menghapus program studi' },
      { status: 500 }
    );
  }
}

// PUT /api/prodi - Edit prodi name or transfer to another faculty
export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const { id_prodi, nama_prodi, id_fakultas } = body;

    if (!id_prodi) {
      return NextResponse.json(
        { success: false, message: 'ID prodi wajib disertakan!' },
        { status: 400 }
      );
    }

    const targetProdiId = parseInt(String(id_prodi), 10);
    const existing = await prisma.prodi.findUnique({
      where: { id_prodi: targetProdiId },
      include: { fakultas: true },
    });

    if (!existing) {
      return NextResponse.json(
        { success: false, message: 'Program studi tidak ditemukan!' },
        { status: 404 }
      );
    }

    const updatedData: { nama_prodi?: string; id_fakultas?: number } = {};

    if (nama_prodi && String(nama_prodi).trim()) {
      updatedData.nama_prodi = String(nama_prodi).trim();
    }

    let newFacultyName = existing.fakultas?.nama_fakultas;

    if (id_fakultas !== undefined && id_fakultas !== null && Number(id_fakultas) !== existing.id_fakultas) {
      const newFakId = parseInt(String(id_fakultas), 10);
      const targetFaculty = await prisma.fakultas.findUnique({
        where: { id_fakultas: newFakId },
      });

      if (!targetFaculty) {
        return NextResponse.json(
          { success: false, message: 'Fakultas tujuan tidak ditemukan!' },
          { status: 404 }
        );
      }

      updatedData.id_fakultas = newFakId;
      newFacultyName = targetFaculty.nama_fakultas;

      // Update juga mahasiswa yang terdaftar di prodi ini agar id_fakultas mereka sinkron
      await prisma.mahasiswa.updateMany({
        where: { id_prodi: targetProdiId },
        data: { id_fakultas: newFakId },
      });
    }

    const updated = await prisma.prodi.update({
      where: { id_prodi: targetProdiId },
      data: updatedData,
      include: { fakultas: true },
    });

    return NextResponse.json({
      success: true,
      message: `Program studi berhasil diperbarui${updatedData.id_fakultas ? ` dan dipindahkan ke ${newFacultyName}` : ''}!`,
      data: updated,
    });
  } catch (error) {
    console.error('Error updating prodi:', error);
    return NextResponse.json(
      { success: false, message: 'Gagal memperbarui program studi' },
      { status: 500 }
    );
  }
}

