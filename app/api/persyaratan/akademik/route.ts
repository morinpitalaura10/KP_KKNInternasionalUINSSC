import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getPersyaratanAkademik, savePersyaratanAkademik } from '@/lib/persyaratanAkademik';

// GET /api/persyaratan/akademik
export async function GET() {
  try {
    const config = await getPersyaratanAkademik();

    // Ambil semua fakultas dari database
    const rawFakultas = await prisma.fakultas.findMany({
      where: { status: true },
      orderBy: { id_fakultas: 'asc' },
    });

    // Deduplicate fakultas by nama_fakultas jika ada baris duplikat di MySQL
    const seenNames = new Set<string>();
    const fakultasList = rawFakultas.filter((f) => {
      const normalized = f.nama_fakultas.trim().toUpperCase();
      if (seenNames.has(normalized)) return false;
      seenNames.add(normalized);
      return true;
    });

    // Ambil daftar prodi dari database untuk opsi checklist jurusan
    const prodiList = await prisma.prodi.findMany({
      where: { status: true },
      include: {
        fakultas: {
          select: {
            id_fakultas: true,
            nama_fakultas: true,
          },
        },
      },
      orderBy: [
        { id_fakultas: 'asc' },
        { nama_prodi: 'asc' },
      ],
    });

    // Pastikan allowed_prodi_ids hanya berisi id_prodi yang benar-benar ada di database
    const validProdiIdsSet = new Set(prodiList.map((p) => p.id_prodi));
    const cleanedAllowedProdiIds = (config.allowed_prodi_ids || []).filter((id) =>
      validProdiIdsSet.has(Number(id))
    );

    return NextResponse.json({
      success: true,
      data: {
        ...config,
        allowed_prodi_ids: cleanedAllowedProdiIds,
        prodiList,
        fakultasList,
      },
    });
  } catch (error) {
    console.error('Error fetching persyaratan akademik:', error);
    return NextResponse.json(
      { success: false, message: 'Gagal mengambil data persyaratan akademik' },
      { status: 500 }
    );
  }
}

// POST or PUT /api/persyaratan/akademik
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      min_ipk,
      min_semester,
      max_semester,
      min_sks,
      all_prodi,
      allowed_prodi_ids,
      status,
      catatan,
    } = body;

    const parsedIpk = parseFloat(String(min_ipk));
    if (isNaN(parsedIpk) || parsedIpk < 0 || parsedIpk > 4.0) {
      return NextResponse.json(
        { success: false, message: 'Nilai minimal IPK tidak valid (rentang 0.00 - 4.00)' },
        { status: 400 }
      );
    }

    const parsedMinSem = parseInt(String(min_semester), 10);
    const parsedMaxSem = parseInt(String(max_semester), 10);
    if (isNaN(parsedMinSem) || isNaN(parsedMaxSem) || parsedMinSem > parsedMaxSem) {
      return NextResponse.json(
        { success: false, message: 'Semester minimal tidak boleh lebih besar dari semester maksimal' },
        { status: 400 }
      );
    }

    const existingProdis = await prisma.prodi.findMany({ select: { id_prodi: true } });
    const existingProdiIdsSet = new Set(existingProdis.map((p) => p.id_prodi));
    const sanitizedAllowedIds = (Array.isArray(allowed_prodi_ids) ? allowed_prodi_ids.map(Number) : []).filter((id) =>
      existingProdiIdsSet.has(id)
    );

    const updated = await savePersyaratanAkademik({
      min_ipk: parsedIpk,
      min_semester: parsedMinSem,
      max_semester: parsedMaxSem,
      min_sks: parseInt(String(min_sks || 100), 10),
      all_prodi: all_prodi !== undefined ? Boolean(all_prodi) : true,
      allowed_prodi_ids: sanitizedAllowedIds,
      status: status !== undefined ? Boolean(status) : true,
      catatan: String(catatan || ''),
    });

    return NextResponse.json({
      success: true,
      message: 'Persyaratan akademik berhasil diperbarui',
      data: updated,
    });
  } catch (error) {
    console.error('Error saving persyaratan akademik:', error);
    return NextResponse.json(
      { success: false, message: 'Gagal menyimpan perubahan persyaratan akademik' },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest) {
  return POST(req);
}
