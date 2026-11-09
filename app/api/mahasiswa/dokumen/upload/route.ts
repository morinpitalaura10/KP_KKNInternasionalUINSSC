import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import fs from 'fs/promises';
import path from 'path';

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File | null;
    const idPersyaratanStr = formData.get('id_persyaratan') as string | null;
    const userIdStr = formData.get('userId') as string | null;

    if (!file || !idPersyaratanStr || !userIdStr) {
      return NextResponse.json(
        { success: false, message: 'File, id_persyaratan, dan userId wajib disertakan.' },
        { status: 400 }
      );
    }

    const idPersyaratan = parseInt(idPersyaratanStr, 10);
    const userId = parseInt(userIdStr, 10);

    // Dapatkan data mahasiswa
    const mhs = await prisma.mahasiswa.findUnique({
      where: { id_user: userId },
      include: { users: true },
    });

    if (!mhs) {
      return NextResponse.json(
        { success: false, message: 'Data mahasiswa tidak ditemukan.' },
        { status: 404 }
      );
    }

    // Dapatkan periode aktif beserta timeline
    const activePeriode = await prisma.periode.findFirst({
      where: { status: 'Aktif' },
      include: {
        periode_negara: {
          where: { status: true, negara: { status: true } },
        },
        timeline: {
          where: { status: true },
          orderBy: { urutan: 'asc' },
        },
      },
    });

    if (!activePeriode) {
      return NextResponse.json(
        {
          success: false,
          message:
            'Unggah dokumen ditolak: Saat ini tidak ada periode/gelombang KKN Internasional yang berstatus Aktif.',
        },
        { status: 400 }
      );
    }

    const uploadStage =
      activePeriode.timeline.find(
        (t) => /pendaftaran|unggah|berkas|dokumen/i.test(t.nama_tahapan) || t.urutan === 1
      ) || activePeriode.timeline[0];

    const rawStart = uploadStage?.tanggal_mulai || activePeriode.tanggal_mulai;
    const rawEnd = uploadStage?.tanggal_selesai || activePeriode.tanggal_selesai;

    const now = new Date();
    const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
    const startStr = rawStart ? new Date(rawStart).toISOString().split('T')[0] : '';
    const endStr = rawEnd ? new Date(rawEnd).toISOString().split('T')[0] : '';

    if ((startStr && todayStr < startStr) || (endStr && todayStr > endStr)) {
      return NextResponse.json(
        {
          success: false,
          message: `Unggah dokumen ditolak: Saat ini berada di luar jadwal "${uploadStage?.nama_tahapan || 'Pendaftaran & Unggah Berkas'}" (${startStr} s.d. ${endStr}).`,
        },
        { status: 400 }
      );
    }

    // Dapatkan atau buat pendaftaran draft
    let pendaftaran = await prisma.pendaftaran.findFirst({
      where: {
        id_mahasiswa: mhs.id_mahasiswa,
        id_periode: activePeriode.id_periode,
      },
    });

    if (!pendaftaran) {
      const defaultPeriodeNegara = activePeriode.periode_negara[0]?.id_periode_negara;
      if (!defaultPeriodeNegara) {
        return NextResponse.json(
          { success: false, message: 'Negara tujuan belum disetel pada periode aktif.' },
          { status: 400 }
        );
      }

      pendaftaran = await prisma.pendaftaran.create({
        data: {
          id_mahasiswa: mhs.id_mahasiswa,
          id_periode: activePeriode.id_periode,
          id_periode_negara: defaultPeriodeNegara,
          jenis_kelamin: 'L',
          no_hp: '',
          alamat: '',
          tempat_lahir: '',
          tanggal_lahir: new Date('2003-01-01'),
          asal_sekolah: '',
          total_sks: 100,
          ipk: mhs.ipk ? parseFloat(mhs.ipk.toString()) : 3.5,
          deskripsi_diri: '-',
          golongan_darah: 'O',
          ukuran_kaos: 'L',
          status_pendaftaran: 'Draft',
        },
      });
    }

    // Validasi persyaratan
    const syarat = await prisma.persyaratan.findUnique({
      where: { id_persyaratan: idPersyaratan },
    });

    if (!syarat) {
      return NextResponse.json(
        { success: false, message: 'Persyaratan dokumen tidak ditemukan.' },
        { status: 404 }
      );
    }

    // Validasi ukuran file (kb)
    const maxBytes = (syarat.ukuran_maksimal || 2048) * 1024;
    if (file.size > maxBytes) {
      return NextResponse.json(
        {
          success: false,
          message: `Ukuran file melebihi batas maksimal (${Math.round(syarat.ukuran_maksimal / 1024)}MB).`,
        },
        { status: 400 }
      );
    }

    // Simpan file ke public/uploads/dokumen
    const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'dokumen');
    await fs.mkdir(uploadDir, { recursive: true });

    const rawExt = path.extname(file.name).toLowerCase() || '.pdf';
    const cleanExt = rawExt.replace(/[^a-z0-9.]/gi, '');
    const nimOrUser = mhs.users.nim || mhs.id_mahasiswa;
    const fileName = `${nimOrUser}_req${idPersyaratan}_${Date.now()}${cleanExt}`;
    const filePathOnDisk = path.join(uploadDir, fileName);

    const buffer = Buffer.from(await file.arrayBuffer());
    await fs.writeFile(filePathOnDisk, buffer);

    const webPath = `/uploads/dokumen/${fileName}`;

    // Cek apakah dokumen untuk persyaratan ini sudah ada
    const existingDoc = await prisma.dokumen_pendaftaran.findFirst({
      where: {
        id_pendaftaran: pendaftaran.id_pendaftaran,
        id_persyaratan: idPersyaratan,
      },
    });

    let savedDoc;
    if (existingDoc) {
      savedDoc = await prisma.dokumen_pendaftaran.update({
        where: { id_dokumen: existingDoc.id_dokumen },
        data: {
          file_path: webPath,
          status: 'Menunggu',
          uploaded_at: new Date(),
        },
      });
    } else {
      savedDoc = await prisma.dokumen_pendaftaran.create({
        data: {
          id_pendaftaran: pendaftaran.id_pendaftaran,
          id_persyaratan: idPersyaratan,
          file_path: webPath,
          status: 'Menunggu',
        },
      });
    }

    return NextResponse.json({
      success: true,
      message: `Berkas "${syarat.nama_persyaratan}" berhasil diunggah!`,
      data: {
        id_dokumen: savedDoc.id_dokumen,
        id_persyaratan: savedDoc.id_persyaratan,
        nama_persyaratan: syarat.nama_persyaratan,
        file_path: savedDoc.file_path,
        file_name: file.name,
        status: savedDoc.status,
      },
    });
  } catch (error: any) {
    console.error('Error in dokumen upload API:', error);
    return NextResponse.json(
      { success: false, message: error?.message || 'Gagal mengunggah berkas.' },
      { status: 500 }
    );
  }
}
