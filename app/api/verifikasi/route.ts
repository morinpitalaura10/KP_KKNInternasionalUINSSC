import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { checkTimelineWindow } from '@/lib/timelineGuard';

// Helper to map single document item (flat mode)
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapDokumenItem(d: any) {
  const p = d.pendaftaran;
  const mhs = p?.mahasiswa;
  const u = mhs?.users;
  const lastVerifikasi = d.verifikasi_dokumen?.[0] || null;

  let uiStatus: 'Sesuai' | 'Menunggu' | 'Tidak Sesuai' = 'Menunggu';
  if (d.status === 'Valid') uiStatus = 'Sesuai';
  else if (d.status === 'Revisi' || d.status === 'Ditolak') uiStatus = 'Tidak Sesuai';

  return {
    id_dokumen: d.id_dokumen,
    id_pendaftaran: d.id_pendaftaran,
    id_persyaratan: d.id_persyaratan,
    nama_persyaratan: d.persyaratan?.nama_persyaratan || 'Dokumen Persyaratan',
    format_file: d.persyaratan?.format_file || 'PDF',
    file_path: d.file_path,
    status_db: d.status,
    status_label: uiStatus,
    uploaded_at: d.uploaded_at ? d.uploaded_at.toISOString() : null,
    nim: u?.nim || '-',
    nama: u?.nama || '-',
    nama_fakultas: mhs?.fakultas?.nama_fakultas || '-',
    nama_prodi: mhs?.prodi?.nama_prodi || '-',
    catatan_verifikasi: lastVerifikasi?.catatan || '',
    tanggal_verifikasi: lastVerifikasi?.tanggal_verifikasi ? lastVerifikasi.tanggal_verifikasi.toISOString() : null,
    verifikator: lastVerifikasi?.staff?.users?.nama || null,
  };
}

// Helper to map student application with all bundled documents (grouped mode)
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapMahasiswaVerifikasiItem(p: any) {
  const mhs = p.mahasiswa;
  const u = mhs?.users;

  const docs = (p.dokumen_pendaftaran || []).map((d: any) => {
    const lastVerifikasi = d.verifikasi_dokumen?.[0] || null;
    let uiStatus: 'Sesuai' | 'Menunggu' | 'Tidak Sesuai' = 'Menunggu';
    if (d.status === 'Valid') uiStatus = 'Sesuai';
    else if (d.status === 'Revisi' || d.status === 'Ditolak') uiStatus = 'Tidak Sesuai';

    return {
      id_dokumen: d.id_dokumen,
      id_persyaratan: d.id_persyaratan,
      nama_persyaratan: d.persyaratan?.nama_persyaratan || 'Dokumen Persyaratan',
      format_file: d.persyaratan?.format_file || 'PDF',
      ukuran_maksimal: d.persyaratan?.ukuran_maksimal || 2,
      wajib: d.persyaratan?.wajib !== false,
      file_path: d.file_path,
      status_db: d.status,
      status_label: uiStatus,
      uploaded_at: d.uploaded_at ? d.uploaded_at.toISOString() : null,
      catatan_verifikasi: lastVerifikasi?.catatan || '',
      tanggal_verifikasi: lastVerifikasi?.tanggal_verifikasi ? lastVerifikasi.tanggal_verifikasi.toISOString() : null,
      verifikator: lastVerifikasi?.staff?.users?.nama || null,
    };
  });

  const totalDocs = docs.length;
  const validDocs = docs.filter((d: any) => d.status_label === 'Sesuai').length;
  const revisiDocs = docs.filter((d: any) => d.status_label === 'Tidak Sesuai').length;
  const menungguDocs = docs.filter((d: any) => d.status_label === 'Menunggu').length;

  let statusVerifikasi: 'Lengkap & Valid' | 'Perlu Revisi' | 'Menunggu Verifikasi' | 'Belum Upload' = 'Menunggu Verifikasi';
  if (totalDocs === 0) {
    statusVerifikasi = 'Belum Upload';
  } else if (revisiDocs > 0) {
    statusVerifikasi = 'Perlu Revisi';
  } else if (validDocs === totalDocs) {
    statusVerifikasi = 'Lengkap & Valid';
  }

  return {
    id_pendaftaran: p.id_pendaftaran,
    id_mahasiswa: p.id_mahasiswa,
    nim: u?.nim || '-',
    nama: u?.nama || '-',
    email: u?.email || '-',
    no_hp: p.no_hp || '-',
    nama_fakultas: mhs?.fakultas?.nama_fakultas || '-',
    nama_prodi: mhs?.prodi?.nama_prodi || '-',
    ipk: p.ipk ? parseFloat(p.ipk.toString()) : (mhs?.ipk ? parseFloat(mhs.ipk.toString()) : null),
    total_sks: p.total_sks || 0,
    nama_periode: p.periode?.nama_periode || '-',
    negara_tujuan: p.periode_negara?.negara?.nama_negara || '-',
    status_pendaftaran: p.status_pendaftaran,
    tanggal_daftar: p.tanggal_daftar ? p.tanggal_daftar.toISOString() : null,
    status_verifikasi: statusVerifikasi,
    summary_docs: {
      total: totalDocs,
      valid: validDocs,
      revisi: revisiDocs,
      menunggu: menungguDocs,
    },
    dokumen: docs,
  };
}

// GET /api/verifikasi
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    const idPendaftaran = searchParams.get('id_pendaftaran');
    const mode = searchParams.get('mode') || 'grouped'; // 'grouped' (default) or 'flat'
    const statusParam = searchParams.get('status'); // 'all', 'Sesuai', 'Menunggu', 'Tidak Sesuai'
    const activeOnly = searchParams.get('active_only') === 'true';
    const idPeriode = searchParams.get('id_periode');
    const search = searchParams.get('search')?.trim() || '';
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '10', 10);
    const skip = (page - 1) * limit;

    // 1. Fetch single document by ID
    if (id) {
      const single = await prisma.dokumen_pendaftaran.findUnique({
        where: { id_dokumen: parseInt(id, 10) },
        include: {
          persyaratan: true,
          pendaftaran: {
            include: {
              mahasiswa: { include: { users: true, fakultas: true, prodi: true } },
            },
          },
          verifikasi_dokumen: {
            orderBy: { tanggal_verifikasi: 'desc' },
            take: 1,
            include: { staff: { include: { users: true } } },
          },
        },
      });

      if (!single) {
        return NextResponse.json({ success: false, message: 'Dokumen tidak ditemukan' }, { status: 404 });
      }
      return NextResponse.json({ success: true, data: mapDokumenItem(single) });
    }

    // 2. Fetch single student's complete application (with all documents) by id_pendaftaran
    if (idPendaftaran) {
      const pendaftaran = await prisma.pendaftaran.findUnique({
        where: { id_pendaftaran: parseInt(idPendaftaran, 10) },
        include: {
          mahasiswa: { include: { users: true, fakultas: true, prodi: true } },
          periode: { select: { nama_periode: true, status: true } },
          periode_negara: { include: { negara: true } },
          dokumen_pendaftaran: {
            include: {
              persyaratan: true,
              verifikasi_dokumen: {
                orderBy: { tanggal_verifikasi: 'desc' },
                take: 1,
                include: { staff: { include: { users: true } } },
              },
            },
            orderBy: { id_persyaratan: 'asc' },
          },
        },
      });

      if (!pendaftaran) {
        return NextResponse.json({ success: false, message: 'Data pendaftaran mahasiswa tidak ditemukan' }, { status: 404 });
      }

      return NextResponse.json({
        success: true,
        data: mapMahasiswaVerifikasiItem(pendaftaran),
      });
    }

    const activePeriode = await prisma.periode.findFirst({
      where: { status: 'Aktif' },
      select: { id_periode: true, nama_periode: true, tahun: true, status: true },
    });

    // 3. Grouped Mode (Default: grouping per mahasiswa)
    if (mode === 'grouped') {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const where: any = {
        status_pendaftaran: { not: 'Draft' },
      };

      if (activeOnly) {
        where.id_periode = activePeriode ? activePeriode.id_periode : -1;
      } else if (idPeriode && idPeriode !== 'all') {
        where.id_periode = parseInt(idPeriode, 10);
      }

      if (search) {
        where.mahasiswa = {
          users: {
            OR: [
              { nama: { contains: search } },
              { nim: { contains: search } },
            ],
          },
        };
      }

      // Filter by document verification status
      if (statusParam && statusParam !== 'all' && statusParam !== 'Semua Status') {
        if (statusParam === 'Sesuai' || statusParam === 'Lengkap & Valid') {
          where.status_pendaftaran = 'Verifikasi_Dokumen';
        } else if (statusParam === 'Tidak Sesuai' || statusParam === 'Perlu Revisi') {
          where.status_pendaftaran = 'Perbaikan_Dokumen';
        } else if (statusParam === 'Menunggu') {
          where.dokumen_pendaftaran = {
            some: { status: 'Menunggu' },
          };
        }
      }

      const total = await prisma.pendaftaran.count({ where });

      const pendaftaranList = await prisma.pendaftaran.findMany({
        where,
        include: {
          mahasiswa: { include: { users: true, fakultas: true, prodi: true } },
          periode: { select: { nama_periode: true, status: true } },
          periode_negara: { include: { negara: true } },
          dokumen_pendaftaran: {
            include: {
              persyaratan: true,
              verifikasi_dokumen: {
                orderBy: { tanggal_verifikasi: 'desc' },
                take: 1,
                include: { staff: { include: { users: true } } },
              },
            },
            orderBy: { id_persyaratan: 'asc' },
          },
        },
        orderBy: { id_pendaftaran: 'desc' },
        skip,
        take: limit,
      });

      const mappedList = pendaftaranList.map(mapMahasiswaVerifikasiItem);
      const targetPeriodeId = activePeriode?.id_periode || (idPeriode && idPeriode !== 'all' ? parseInt(idPeriode, 10) : null);
      const timelineGuard = targetPeriodeId
        ? await checkTimelineWindow(targetPeriodeId, 'verifikasi')
        : { isOpen: true, status: 'TIDAK_DITEMUKAN' };

      return NextResponse.json({
        success: true,
        mode: 'grouped',
        data: mappedList,
        activePeriode: activePeriode || null,
        timelineGuard,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit) || 1,
        },
      });
    }

    // 4. Flat Mode (Legacy: list of documents)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const whereFlat: any = {
      pendaftaran: {
        status_pendaftaran: { not: 'Draft' },
      },
    };

    if (statusParam && statusParam !== 'all' && statusParam !== 'Semua Status') {
      if (statusParam === 'Sesuai') whereFlat.status = 'Valid';
      else if (statusParam === 'Menunggu') whereFlat.status = 'Menunggu';
      else if (statusParam === 'Tidak Sesuai') whereFlat.status = { in: ['Revisi', 'Ditolak'] };
    }

    if (search) {
      whereFlat.pendaftaran = {
        ...whereFlat.pendaftaran,
        mahasiswa: {
          users: {
            OR: [
              { nama: { contains: search } },
              { nim: { contains: search } },
            ],
          },
        },
      };
    }

    const totalFlat = await prisma.dokumen_pendaftaran.count({ where: whereFlat });

    const items = await prisma.dokumen_pendaftaran.findMany({
      where: whereFlat,
      include: {
        persyaratan: true,
        pendaftaran: {
          include: {
            mahasiswa: { include: { users: true, fakultas: true, prodi: true } },
          },
        },
        verifikasi_dokumen: {
          orderBy: { tanggal_verifikasi: 'desc' },
          take: 1,
          include: { staff: { include: { users: true } } },
        },
      },
      orderBy: { id_dokumen: 'asc' },
      skip,
      take: limit,
    });

    return NextResponse.json({
      success: true,
      mode: 'flat',
      data: items.map(mapDokumenItem),
      pagination: {
        page,
        limit,
        total: totalFlat,
        totalPages: Math.ceil(totalFlat / limit) || 1,
      },
    });
  } catch (error) {
    console.error('Error fetching verifikasi dokumen:', error);
    return NextResponse.json({ success: false, message: 'Gagal mengambil data verifikasi dokumen' }, { status: 500 });
  }
}

// PUT /api/verifikasi
// Supports both:
// 1. Single document update: { id_dokumen, status, catatan, id_staff }
// 2. Batch / Grouped update for a student: { id_pendaftaran, id_staff, dokumen: [ { id_dokumen, status, catatan } ] }
export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const { id_pendaftaran, dokumen, id_dokumen, status, catatan, id_staff } = body;

    // Resolve staff ID
    const staffRec = await prisma.staff.findFirst({
      where: id_staff ? { id_staff: parseInt(String(id_staff), 10) } : {},
    });
    const effectiveStaffId = staffRec ? staffRec.id_staff : 1;
    const now = new Date();

    // ── CASE A: BATCH UPDATE PER MAHASISWA ──
    if (id_pendaftaran && Array.isArray(dokumen) && dokumen.length > 0) {
      const pendaftaranId = parseInt(String(id_pendaftaran), 10);
      if (!pendaftaranId || isNaN(pendaftaranId)) {
        return NextResponse.json({ success: false, message: 'ID Pendaftaran tidak valid!' }, { status: 400 });
      }

      // Timeline Guard: Pastikan tahapan verifikasi sudah dibuka
      const pendaftaranRec = await prisma.pendaftaran.findUnique({
        where: { id_pendaftaran: pendaftaranId },
        select: { id_periode: true },
      });
      if (pendaftaranRec?.id_periode) {
        const guard = await checkTimelineWindow(pendaftaranRec.id_periode, 'verifikasi');
        if (!guard.isOpen) {
          return NextResponse.json(
            { success: false, message: guard.message || 'Tahapan verifikasi berkas belum dibuka!' },
            { status: 403 }
          );
        }
      }

      for (const item of dokumen) {
        const docId = parseInt(String(item.id_dokumen), 10);
        if (!docId || isNaN(docId)) continue;

        let dbDocStatus: 'Valid' | 'Revisi' | 'Menunggu' = 'Menunggu';
        let dbVerifStatus: 'Valid' | 'Revisi' = 'Valid';

        if (item.status === 'Sesuai' || item.status === 'Valid') {
          dbDocStatus = 'Valid';
          dbVerifStatus = 'Valid';
        } else if (item.status === 'Tidak Sesuai' || item.status === 'Revisi' || item.status === 'Ditolak') {
          dbDocStatus = 'Revisi';
          dbVerifStatus = 'Revisi';
        }

        // Update document status
        await prisma.dokumen_pendaftaran.update({
          where: { id_dokumen: docId },
          data: { status: dbDocStatus },
        });

        // Record verification history
        await prisma.verifikasi_dokumen.create({
          data: {
            id_dokumen: docId,
            id_staff: effectiveStaffId,
            status: dbVerifStatus,
            catatan: item.catatan ? String(item.catatan).trim() : null,
            tanggal_verifikasi: now,
          },
        });
      }

      // Re-evaluate student's overall registration status
      const allDocs = await prisma.dokumen_pendaftaran.findMany({
        where: { id_pendaftaran: pendaftaranId },
      });

      const allValid = allDocs.length > 0 && allDocs.every((d) => d.status === 'Valid');
      const hasRevisi = allDocs.some((d) => d.status === 'Revisi' || d.status === 'Ditolak');

      let newPendaftaranStatus: 'Verifikasi_Dokumen' | 'Perbaikan_Dokumen' | 'Menunggu_Verifikasi' = 'Menunggu_Verifikasi';
      if (allValid) {
        newPendaftaranStatus = 'Verifikasi_Dokumen';
      } else if (hasRevisi) {
        newPendaftaranStatus = 'Perbaikan_Dokumen';
      }

      await prisma.pendaftaran.update({
        where: { id_pendaftaran: pendaftaranId },
        data: { status_pendaftaran: newPendaftaranStatus },
      });

      return NextResponse.json({
        success: true,
        message: allValid
          ? 'Seluruh berkas persyaratan mahasiswa telah diverifikasi dan dinyatakan SESUAI (Valid)!'
          : hasRevisi
          ? 'Hasil verifikasi berhasil disimpan. Terdapat berkas yang perlu diperbaiki (Revisi) oleh mahasiswa.'
          : 'Pembaruan verifikasi berkas mahasiswa berhasil disimpan!',
        data: {
          id_pendaftaran: pendaftaranId,
          status_pendaftaran: newPendaftaranStatus,
        },
      });
    }

    // ── CASE B: SINGLE DOCUMENT UPDATE (BACKWARD COMPATIBLE) ──
    const targetId = parseInt(String(id_dokumen), 10);
    if (!targetId || isNaN(targetId)) {
      return NextResponse.json({ success: false, message: 'ID Dokumen wajib diisi!' }, { status: 400 });
    }

    const existingDoc = await prisma.dokumen_pendaftaran.findUnique({
      where: { id_dokumen: targetId },
      include: { pendaftaran: true },
    });

    if (!existingDoc) {
      return NextResponse.json({ success: false, message: 'Dokumen tidak ditemukan' }, { status: 404 });
    }

    // Timeline Guard: Pastikan tahapan verifikasi sudah dibuka
    if (existingDoc.pendaftaran?.id_periode) {
      const guard = await checkTimelineWindow(existingDoc.pendaftaran.id_periode, 'verifikasi');
      if (!guard.isOpen) {
        return NextResponse.json(
          { success: false, message: guard.message || 'Tahapan verifikasi berkas belum dibuka!' },
          { status: 403 }
        );
      }
    }

    let dbDocStatus: 'Valid' | 'Revisi' | 'Menunggu' = 'Menunggu';
    let dbVerifStatus: 'Valid' | 'Revisi' = 'Valid';

    if (status === 'Sesuai' || status === 'Valid') {
      dbDocStatus = 'Valid';
      dbVerifStatus = 'Valid';
    } else if (status === 'Tidak Sesuai' || status === 'Revisi' || status === 'Ditolak') {
      dbDocStatus = 'Revisi';
      dbVerifStatus = 'Revisi';
    }

    // Update document status
    await prisma.dokumen_pendaftaran.update({
      where: { id_dokumen: targetId },
      data: { status: dbDocStatus },
    });

    // Create verification history record
    await prisma.verifikasi_dokumen.create({
      data: {
        id_dokumen: targetId,
        id_staff: effectiveStaffId,
        status: dbVerifStatus,
        catatan: catatan ? String(catatan).trim() : null,
        tanggal_verifikasi: now,
      },
    });

    // Check if all documents for this pendaftaran are valid now
    const allDocs = await prisma.dokumen_pendaftaran.findMany({
      where: { id_pendaftaran: existingDoc.id_pendaftaran },
    });
    const allValid = allDocs.length > 0 && allDocs.every((d) => d.status === 'Valid');
    const hasRevisi = allDocs.some((d) => d.status === 'Revisi' || d.status === 'Ditolak');

    if (allValid) {
      await prisma.pendaftaran.update({
        where: { id_pendaftaran: existingDoc.id_pendaftaran },
        data: { status_pendaftaran: 'Verifikasi_Dokumen' },
      });
    } else if (hasRevisi) {
      await prisma.pendaftaran.update({
        where: { id_pendaftaran: existingDoc.id_pendaftaran },
        data: { status_pendaftaran: 'Perbaikan_Dokumen' },
      });
    }

    return NextResponse.json({
      success: true,
      message: `Status dokumen berhasil diverifikasi sebagai "${dbDocStatus === 'Valid' ? 'Sesuai' : 'Tidak Sesuai'}"!`,
    });
  } catch (error) {
    console.error('Error verifying document:', error);
    return NextResponse.json({ success: false, message: 'Gagal memperbarui verifikasi dokumen' }, { status: 500 });
  }
}
