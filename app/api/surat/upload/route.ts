import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ success: false, message: 'File template wajib dipilih.' }, { status: 400 });
    }

    // Validasi ekstensi
    const rawExt = path.extname(file.name).toLowerCase() || '.pdf';
    const allowed = ['.pdf', '.doc', '.docx'];
    if (!allowed.includes(rawExt)) {
      return NextResponse.json(
        { success: false, message: 'Format file tidak didukung. Harap unggah berkas .pdf, .docx, atau .doc.' },
        { status: 400 }
      );
    }

    // Maks 10MB
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json(
        { success: false, message: 'Ukuran file melebihi batas maksimal 10MB.' },
        { status: 400 }
      );
    }

    const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'templates');
    await fs.mkdir(uploadDir, { recursive: true });

    const cleanBaseName = path.basename(file.name, rawExt).replace(/[^a-zA-Z0-9_-]/g, '_');
    const fileName = `template_${cleanBaseName}_${Date.now()}${rawExt}`;
    const targetPath = path.join(uploadDir, fileName);

    const buffer = Buffer.from(await file.arrayBuffer());
    await fs.writeFile(targetPath, buffer);

    const publicPath = `/uploads/templates/${fileName}`;

    return NextResponse.json({
      success: true,
      message: 'File template berhasil diunggah!',
      filePath: publicPath,
      fileName: file.name,
    });
  } catch (error: any) {
    console.error('Error uploading template surat:', error);
    return NextResponse.json(
      { success: false, message: error?.message || 'Gagal mengunggah berkas template.' },
      { status: 500 }
    );
  }
}
