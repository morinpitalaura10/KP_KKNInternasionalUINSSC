import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ success: false, message: 'File gambar wajib dipilih.' }, { status: 400 });
    }

    const rawExt = path.extname(file.name).toLowerCase() || '.jpg';
    const allowed = ['.jpg', '.jpeg', '.png', '.webp', '.gif'];
    if (!allowed.includes(rawExt)) {
      return NextResponse.json(
        { success: false, message: 'Format file tidak didukung. Harap unggah berkas gambar (.jpg, .jpeg, .png, .webp).' },
        { status: 400 }
      );
    }

    // Maks 5MB
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json(
        { success: false, message: 'Ukuran file foto melebihi batas maksimal 5MB.' },
        { status: 400 }
      );
    }

    const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'informasi');
    await fs.mkdir(uploadDir, { recursive: true });

    const cleanBaseName = path.basename(file.name, rawExt).replace(/[^a-zA-Z0-9_-]/g, '_');
    const fileName = `info_${cleanBaseName}_${Date.now()}${rawExt}`;
    const targetPath = path.join(uploadDir, fileName);

    const buffer = Buffer.from(await file.arrayBuffer());
    await fs.writeFile(targetPath, buffer);

    const publicPath = `/uploads/informasi/${fileName}`;

    return NextResponse.json({
      success: true,
      message: 'Foto informasi berhasil diunggah!',
      filePath: publicPath,
      fileName: file.name,
    });
  } catch (error: any) {
    console.error('Error uploading foto informasi:', error);
    return NextResponse.json(
      { success: false, message: error?.message || 'Gagal mengunggah berkas foto informasi.' },
      { status: 500 }
    );
  }
}

