import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { checkTimelineWindow } from '@/lib/timelineGuard';

// Helper to map wawancara data to clean JSON response
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapWawancaraItem(w: any) {
  const mhs = w.pendaftaran?.mahasiswa;
  const user = mhs?.users;
  const nilaiList = w.nilai_wawancara || [];

  // Calculate weighted score
  let totalBobot = 0;
  let totalWeightedScore = 0;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const scoresDetail = nilaiList.map((n: any) => {
    const bobot = n.kriteria_wawancara?.bobot ? parseFloat(n.kriteria_wawancara.bobot.toString()) : 0;
    const nilai = n.nilai ? parseFloat(n.nilai.toString()) : 0;
    totalBobot += bobot;
    totalWeightedScore += nilai * (bobot / 100);
    return {
      id_nilai_wawancara: n.id_nilai_wawancara,
      id_kriteria_wawancara: n.id_kriteria_wawancara,
      nama_kriteria: n.kriteria_wawancara?.nama_kriteria || '-',
      bobot,
      nilai,
      catatan: n.catatan || '',
    };
  });

  const isDinilai = w.status === 'Selesai' && nilaiList.length > 0;
  const finalScore = isDinilai ? parseFloat(totalWeightedScore.toFixed(2)) : null;

  return {
    id_wawancara: w.id_wawancara,
    id_pendaftaran: w.id_pendaftaran,
    id_staff: w.id_staff,
    pewawancara: w.staff?.users?.nama || 'Staff LP2M',
    nip_pewawancara: w.staff?.nip || '-',
    nim: user?.nim || '-',
    nama: user?.nama || '-',
    email: user?.email || '-',
    nama_fakultas: mhs?.fakultas?.nama_fakultas || '-',
    nama_prodi: mhs?.prodi?.nama_prodi || '-',
    ipk: mhs?.ipk ? parseFloat(mhs.ipk.toString()) : null,
    tanggal_wawancara: w.tanggal_wawancara ? w.tanggal_wawancara.toISOString() : null,
    catatan: w.catatan || '',
    status_db: w.status,
    is_dinilai: isDinilai,
    status_label: isDinilai ? 'Dinilai' : 'Belum Dinilai',
    nilai_akhir: finalScore,
    nilai_detail: scoresDetail,
    nama_periode: w.pendaftaran?.periode?.nama_periode || '-',
    id_periode: w.pendaftaran?.id_periode || null,
    deskripsi_diri: w.pendaftaran?.deskripsi_diri || null,
  };
}

// GET /api/wawancara
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    const idPeriode = searchParams.get('id_periode');
    const activeOnly = searchParams.get('active_only') === 'true';
    const statusParam = searchParams.get('status'); // 'all', 'Dinilai', 'Belum Dinilai'
    const fakultasParam = searchParams.get('fakultas');
    const search = searchParams.get('search')?.trim() || '';
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '10', 10);
    const skip = (page - 1) * limit;

    // Single item fetch
    if (id) {
      const single = await prisma.wawancara.findUnique({
        where: { id_wawancara: parseInt(id, 10) },
        include: {
          staff: { include: { users: true } },
          pendaftaran: {
            include: {
              periode: true,
              mahasiswa: {
                include: { users: true, fakultas: true, prodi: true },
              },
            },
          },
          nilai_wawancara: {
            include: { kriteria_wawancara: true },
          },
        },
      });

      if (!single) {
        return NextResponse.json({ success: false, message: 'Data wawancara tidak ditemukan' }, { status: 404 });
      }
      return NextResponse.json({ success: true, data: mapWawancaraItem(single) });
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const where: any = {};

    const activePeriode = await prisma.periode.findFirst({ where: { status: 'Aktif' } });

    // Periode filter
    if (activeOnly) {
      where.pendaftaran = { id_periode: activePeriode ? activePeriode.id_periode : -1 };
    } else if (idPeriode && idPeriode !== 'all') {
      where.pendaftaran = { id_periode: parseInt(idPeriode, 10) };
    } else if (idPeriode === 'all') {
      // Do not filter by id_periode: show all
    } else if (activePeriode) {
      where.pendaftaran = { id_periode: activePeriode.id_periode };
    }

    // Status filter
    if (statusParam && statusParam !== 'all') {
      if (statusParam === 'Dinilai') {
        where.status = 'Selesai';
      } else if (statusParam === 'Belum Dinilai') {
        where.status = { not: 'Selesai' };
      }
    }

    // Fakultas filter
    if (fakultasParam && fakultasParam !== 'Semua Fakultas' && fakultasParam !== 'all') {
      where.pendaftaran = {
        ...(where.pendaftaran || {}),
        mahasiswa: {
          fakultas: { nama_fakultas: fakultasParam },
        },
      };
    }

    // Search filter (NIM or Nama)
    if (search) {
      where.pendaftaran = {
        ...(where.pendaftaran || {}),
        mahasiswa: {
          ...(where.pendaftaran?.mahasiswa || {}),
          users: {
            OR: [
              { nama: { contains: search } },
              { nim: { contains: search } },
            ],
          },
        },
      };
    }

    // Count total items
    const total = await prisma.wawancara.count({ where });

    // Fetch items with pagination
    const items = await prisma.wawancara.findMany({
      where,
      include: {
        staff: { include: { users: true } },
        pendaftaran: {
          include: {
            periode: true,
            mahasiswa: {
              include: { users: true, fakultas: true, prodi: true },
            },
          },
        },
        nilai_wawancara: {
          include: { kriteria_wawancara: true },
        },
      },
      orderBy: { id_wawancara: 'asc' },
      skip,
      take: limit,
    });

    // Determine target periode for kriteria
    let targetKriteriaPeriodeId: number | undefined;
    if (idPeriode && idPeriode !== 'all') {
      targetKriteriaPeriodeId = parseInt(idPeriode, 10);
    } else if (where.pendaftaran?.id_periode) {
      targetKriteriaPeriodeId = where.pendaftaran.id_periode;
    } else {
      const activeP = (await prisma.periode.findFirst({ where: { status: 'Aktif' } }))
        || (await prisma.periode.findFirst({ orderBy: { id_periode: 'asc' } }));
      if (activeP) targetKriteriaPeriodeId = activeP.id_periode;
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const kriteriaWhere: any = { status: true };
    if (targetKriteriaPeriodeId) {
      kriteriaWhere.id_periode = targetKriteriaPeriodeId;
    }

    // Also get active kriteria wawancara for the target periode
    const kriteriaWawancara = await prisma.kriteria_wawancara.findMany({
      where: kriteriaWhere,
      orderBy: [{ id_periode: 'asc' }, { id_kriteria_wawancara: 'asc' }],
    });

    // Also get staff list for interviewer assignment
    const staffList = await prisma.staff.findMany({
      include: { users: true },
    });

    // Also get periodes list
    const periodes = await prisma.periode.findMany({
      where: activeOnly ? { status: 'Aktif' } : {},
      orderBy: { created_at: 'desc' },
      select: { id_periode: true, nama_periode: true, tahun: true, status: true },
    });

    const targetPeriodeId =
      idPeriode && idPeriode !== 'all'
        ? parseInt(idPeriode, 10)
        : activePeriode?.id_periode || (periodes[0]?.id_periode ?? null);

    const timelineGuard = targetPeriodeId
      ? await checkTimelineWindow(targetPeriodeId, 'wawancara')
      : { isOpen: true, status: 'TIDAK_DITEMUKAN' };

    return NextResponse.json({
      success: true,
      data: items.map(mapWawancaraItem),
      activePeriode: activePeriode
        ? {
            id_periode: activePeriode.id_periode,
            nama_periode: activePeriode.nama_periode,
            tahun: activePeriode.tahun,
            status: 'Aktif',
          }
        : null,
      timelineGuard,
      kriteria_wawancara: kriteriaWawancara.map((k) => ({
        id_kriteria_wawancara: k.id_kriteria_wawancara,
        id_periode: k.id_periode,
        nama_kriteria: k.nama_kriteria,
        bobot: parseFloat(k.bobot.toString()),
        nilai_maksimal: parseFloat(k.nilai_maksimal.toString()),
      })),
      staff_list: staffList.map((s) => ({
        id_staff: s.id_staff,
        nama: s.users.nama,
        nip: s.nip,
      })),
      periodes: periodes.map((p) => ({
        id_periode: p.id_periode,
        nama_periode: p.nama_periode,
        tahun: p.tahun,
        status: p.status === 'Belum_Aktif' ? 'Belum Aktif' : p.status,
      })),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit) || 1,
      },
    });
  } catch (error) {
    console.error('Error fetching wawancara:', error);
    return NextResponse.json({ success: false, message: 'Gagal mengambil data wawancara' }, { status: 500 });
  }
}

// PUT /api/wawancara - Update scores and status
export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const { id_wawancara, catatan, scores, id_staff, tanggal_wawancara } = body;

    const targetId = parseInt(String(id_wawancara), 10);
    if (!targetId || isNaN(targetId)) {
      return NextResponse.json({ success: false, message: 'ID Wawancara wajib diisi!' }, { status: 400 });
    }

    const existing = await prisma.wawancara.findUnique({
      where: { id_wawancara: targetId },
      include: { pendaftaran: true },
    });
    if (!existing) {
      return NextResponse.json({ success: false, message: 'Data wawancara tidak ditemukan' }, { status: 404 });
    }

    // Timeline Guard: Pastikan tahapan wawancara sudah dibuka
    if (existing.pendaftaran?.id_periode) {
      const guard = await checkTimelineWindow(existing.pendaftaran.id_periode, 'wawancara');
      if (!guard.isOpen) {
        return NextResponse.json(
          { success: false, message: guard.message || 'Tahapan penilaian wawancara belum dibuka!' },
          { status: 403 }
        );
      }
    }

    // Update wawancara fields
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const updateData: any = {};
    if (catatan !== undefined) updateData.catatan = catatan;
    if (id_staff) updateData.id_staff = parseInt(String(id_staff), 10);
    if (tanggal_wawancara) updateData.tanggal_wawancara = new Date(tanggal_wawancara);

    // Save individual scores in nilai_wawancara
    if (Array.isArray(scores) && scores.length > 0) {
      updateData.status = 'Selesai';

      for (const s of scores) {
        const id_kriteria = parseInt(String(s.id_kriteria_wawancara), 10);
        const scoreVal = parseFloat(String(s.nilai));

        const existingScore = await prisma.nilai_wawancara.findFirst({
          where: {
            id_wawancara: targetId,
            id_kriteria_wawancara: id_kriteria,
          },
        });

        if (existingScore) {
          await prisma.nilai_wawancara.update({
            where: { id_nilai_wawancara: existingScore.id_nilai_wawancara },
            data: {
              nilai: scoreVal,
              catatan: s.catatan || '',
            },
          });
        } else {
          await prisma.nilai_wawancara.create({
            data: {
              id_wawancara: targetId,
              id_kriteria_wawancara: id_kriteria,
              nilai: scoreVal,
              catatan: s.catatan || '',
            },
          });
        }
      }
    }

    const updated = await prisma.wawancara.update({
      where: { id_wawancara: targetId },
      data: updateData,
      include: {
        staff: { include: { users: true } },
        pendaftaran: {
          include: {
            periode: true,
            mahasiswa: { include: { users: true, fakultas: true, prodi: true } },
          },
        },
        nilai_wawancara: {
          include: { kriteria_wawancara: true },
        },
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Nilai dan status wawancara berhasil disimpan!',
      data: mapWawancaraItem(updated),
    });
  } catch (error) {
    console.error('Error updating wawancara:', error);
    return NextResponse.json({ success: false, message: 'Gagal memperbarui nilai wawancara' }, { status: 500 });
  }
}
