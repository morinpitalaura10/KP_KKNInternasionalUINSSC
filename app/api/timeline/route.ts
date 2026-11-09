import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { resolveActorUserId, catatLogPublikasi } from '@/lib/publikasi';

export type TimelineComputedStatus = 'Belum Dimulai' | 'Berlangsung' | 'Selesai';

function toDateOnlyString(d: Date | string): string {
  if (typeof d === 'string' && d.includes('-') && d.length === 10) {
    return d;
  }
  const date = new Date(d);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function computeTimelineStatus(
  mulai: Date | string,
  selesai: Date | string,
  now: Date = new Date()
): TimelineComputedStatus {
  const startStr = toDateOnlyString(mulai);
  const endStr = toDateOnlyString(selesai);
  const nowStr = toDateOnlyString(now);

  if (nowStr < startStr) {
    return 'Belum Dimulai';
  } else if (nowStr > endStr) {
    return 'Selesai';
  } else {
    return 'Berlangsung';
  }
}

export function formatIndonesianDateRange(mulai: Date | string, selesai: Date | string): string {
  const dStart = new Date(mulai);
  const dEnd = new Date(selesai);

  const months = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember',
  ];

  const dayStart = dStart.getDate();
  const monthStart = dStart.getMonth();
  const yearStart = dStart.getFullYear();

  const dayEnd = dEnd.getDate();
  const monthEnd = dEnd.getMonth();
  const yearEnd = dEnd.getFullYear();

  if (dayStart === dayEnd && monthStart === monthEnd && yearStart === yearEnd) {
    return `${dayStart} ${months[monthStart]} ${yearStart}`;
  }

  if (monthStart === monthEnd && yearStart === yearEnd) {
    return `${dayStart} - ${dayEnd} ${months[monthStart]} ${yearStart}`;
  }

  if (yearStart === yearEnd) {
    return `${dayStart} ${months[monthStart]} - ${dayEnd} ${months[monthEnd]} ${yearStart}`;
  }

  return `${dayStart} ${months[monthStart]} ${yearStart} - ${dayEnd} ${months[monthEnd]} ${yearEnd}`;
}

function mapTimelineItem(item: any) {
  const computedStatus = computeTimelineStatus(item.tanggal_mulai, item.tanggal_selesai);
  const formattedRange = formatIndonesianDateRange(item.tanggal_mulai, item.tanggal_selesai);

  return {
    id: item.id_timeline,
    id_timeline: item.id_timeline,
    id_periode: item.id_periode,
    nama_periode: item.periode?.nama_periode || null,
    tahun_periode: item.periode?.tahun || null,
    nama_tahapan: item.nama_tahapan,
    tanggal_mulai: toDateOnlyString(item.tanggal_mulai),
    tanggal_selesai: toDateOnlyString(item.tanggal_selesai),
    tanggal_mulai_raw: item.tanggal_mulai,
    tanggal_selesai_raw: item.tanggal_selesai,
    tanggal_format: formattedRange,
    urutan: item.urutan,
    deskripsi: item.deskripsi || '',
    status: item.status,
    is_pelaksanaan: Boolean(item.is_pelaksanaan),
    is_pengumuman: Boolean(item.is_pengumuman),
    status_tahapan: computedStatus,
  };
}

const DEFAULT_STAGES = [
  {
    nama_tahapan: 'Pendaftaran & Unggah Berkas Persyaratan',
    urutan: 1,
    tanggal_mulai: new Date('2026-10-01'),
    tanggal_selesai: new Date('2026-10-05'),
    deskripsi: 'Pendaftaran online melalui portal mahasiswa dan mengunggah seluruh berkas administrasi yang dipersyaratkan.',
    status: true,
    is_pelaksanaan: false,
    is_pengumuman: false,
  },
  {
    nama_tahapan: 'Seleksi Administrasi & Verifikasi Dokumen',
    urutan: 2,
    tanggal_mulai: new Date('2026-10-06'),
    tanggal_selesai: new Date('2026-10-08'),
    deskripsi: 'Pemeriksaan keabsahan berkas pendaftaran dan validasi dokumen oleh panitia seleksi KKN Internasional.',
    status: true,
    is_pelaksanaan: false,
    is_pengumuman: false,
  },
  {
    nama_tahapan: 'Tes Kemampuan Bahasa Asing (TOEFL/IELTS/TOAFL)',
    urutan: 3,
    tanggal_mulai: new Date('2026-10-09'),
    tanggal_selesai: new Date('2026-10-10'),
    deskripsi: 'Uji kompetensi kecakapan bahasa asing (Inggris/Arab) sebagai persiapan komunikasi di negara tujuan.',
    status: true,
    is_pelaksanaan: false,
    is_pengumuman: false,
  },
  {
    nama_tahapan: 'Seleksi Wawancara & Pendalaman Program Kerja',
    urutan: 4,
    tanggal_mulai: new Date('2026-10-11'),
    tanggal_selesai: new Date('2026-10-13'),
    deskripsi: 'Wawancara langsung oleh tim penguji mengenai motivasi, kesiapan mental, wawasan global, dan proposal program kerja.',
    status: true,
    is_pelaksanaan: false,
    is_pengumuman: false,
  },
  {
    nama_tahapan: 'Pengumuman Hasil Akhir Kelulusan Peserta',
    urutan: 5,
    tanggal_mulai: new Date('2026-10-15'),
    tanggal_selesai: new Date('2026-10-15'),
    deskripsi: 'Pengumuman resmi daftar nama mahasiswa yang lolos sebagai delegasi KKN Internasional UINSSC.',
    status: true,
    is_pelaksanaan: false,
    is_pengumuman: true,
  },
  {
    nama_tahapan: 'Pembekalan, Orientasi & Pengurusan Paspor/Visa',
    urutan: 6,
    tanggal_mulai: new Date('2026-10-18'),
    tanggal_selesai: new Date('2026-10-25'),
    deskripsi: 'Pemberian materi kultural, persiapan teknis, administrasi imigrasi, dan etika pengabdian di luar negeri.',
    status: true,
    is_pelaksanaan: false,
    is_pengumuman: false,
  },
  {
    nama_tahapan: 'Pemberangkatan & Pelaksanaan KKN Internasional',
    urutan: 7,
    tanggal_mulai: new Date('2026-11-01'),
    tanggal_selesai: new Date('2026-11-15'),
    deskripsi: 'Pelepasan resmi dan pelaksanaan program pengabdian kepada masyarakat di negara penempatan.',
    status: true,
    is_pelaksanaan: true,
    is_pengumuman: false,
  },
  {
    nama_tahapan: 'Pelaporan Akhir, Seminar Hasil & Evaluasi',
    urutan: 8,
    tanggal_mulai: new Date('2026-11-20'),
    tanggal_selesai: new Date('2026-11-25'),
    deskripsi: 'Penyusunan laporan akhir kegiatan, desiminasi hasil pengabdian, serta penilaian akhir.',
    status: true,
    is_pelaksanaan: false,
    is_pengumuman: false,
  },
];

// Helper: Menata ulang urutan kronologis (1, 2, 3...) per periode berdasarkan tanggal_mulai
export async function reorderTimelineForPeriode(id_periode: number) {
  try {
    const stages = await prisma.timeline.findMany({
      where: { id_periode },
      orderBy: [
        { tanggal_mulai: 'asc' },
        { tanggal_selesai: 'asc' },
        { id_timeline: 'asc' },
      ],
    });

    for (let i = 0; i < stages.length; i++) {
      const expectedUrutan = i + 1;
      if (stages[i].urutan !== expectedUrutan) {
        await prisma.timeline.update({
          where: { id_timeline: stages[i].id_timeline },
          data: { urutan: expectedUrutan },
        });
      }
    }
  } catch (err) {
    console.error('Error reordering timeline stages:', err);
  }
}

// Helper: Validasi alur kronologis tahapan dalam suatu periode
// Memastikan alur waktu berjalan maju: tahapan selanjutnya tidak boleh selesai sebelum tahapan sebelumnya,
// dan tahapan selanjutnya tidak boleh 'Selesai' jika tahapan sebelumnya masih 'Berlangsung' atau 'Belum Dimulai'.
export async function validateTimelineChronology(
  id_periode: number,
  targetStage: {
    nama_tahapan: string;
    tanggal_mulai: Date;
    tanggal_selesai: Date;
  },
  editingTimelineId?: number
): Promise<{ valid: boolean; message?: string }> {
  if (targetStage.tanggal_selesai < targetStage.tanggal_mulai) {
    return {
      valid: false,
      message: 'Tanggal selesai tidak boleh lebih awal dari tanggal mulai!',
    };
  }

  const existingStages = await prisma.timeline.findMany({
    where: { id_periode },
    select: {
      id_timeline: true,
      nama_tahapan: true,
      tanggal_mulai: true,
      tanggal_selesai: true,
    },
  });

  const otherStages = existingStages.filter((s) => s.id_timeline !== editingTimelineId);

  // Gabungkan seluruh tahapan dan urutkan kronologis berdasarkan tanggal mulai
  const simulated = [
    ...otherStages.map((s) => ({
      nama_tahapan: s.nama_tahapan,
      start: new Date(s.tanggal_mulai),
      end: new Date(s.tanggal_selesai),
    })),
    {
      nama_tahapan: targetStage.nama_tahapan,
      start: new Date(targetStage.tanggal_mulai),
      end: new Date(targetStage.tanggal_selesai),
    },
  ].sort((a, b) => {
    if (a.start.getTime() !== b.start.getTime()) {
      return a.start.getTime() - b.start.getTime();
    }
    if (a.end.getTime() !== b.end.getTime()) {
      return a.end.getTime() - b.end.getTime();
    }
    return 0;
  });

  const now = new Date();
  const getStageStatus = (start: Date, end: Date) => {
    const endOfDay = new Date(end);
    endOfDay.setHours(23, 59, 59, 999);
    if (now > endOfDay) return { level: 1, label: 'Selesai' };
    if (now >= start && now <= endOfDay) return { level: 2, label: 'Berlangsung' };
    return { level: 3, label: 'Belum Dimulai' };
  };

  const formatDate = (d: Date) => {
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${day}-${month}-${year}`;
  };

  for (let i = 0; i < simulated.length - 1; i++) {
    const prev = simulated[i];
    const next = simulated[i + 1];

    const prevStat = getStageStatus(prev.start, prev.end);
    const nextStat = getStageStatus(next.start, next.end);

    // Rule 1: Tahapan berikutnya tidak boleh selesai lebih awal dari tahapan sebelumnya
    if (next.end < prev.end) {
      return {
        valid: false,
        message: `Tanggal tidak valid! Tahapan "${next.nama_tahapan}" berakhir (${formatDate(next.end)}) lebih awal daripada tahapan sebelumnya "${prev.nama_tahapan}" (${formatDate(prev.end)}).`,
      };
    }

    // Rule 2: Tahapan berikutnya TIDAK BISA berstatus "Selesai" jika tahapan sebelumnya masih "Berlangsung" atau "Belum Dimulai"
    if (nextStat.level < prevStat.level) {
      return {
        valid: false,
        message: `Alur jadwal tidak valid! Tahapan "${next.nama_tahapan}" berstatus '${nextStat.label}' (${formatDate(next.start)} s/d ${formatDate(next.end)}), tidak boleh berada setelah tahapan "${prev.nama_tahapan}" yang masih berstatus '${prevStat.label}' (${formatDate(prev.start)} s/d ${formatDate(prev.end)}).`,
      };
    }
  }

  return { valid: true };
}

// Helper: Seed default stages if empty for a period
async function ensureSeededForPeriode(id_periode: number) {
  try {
    const count = await prisma.timeline.count({ where: { id_periode } });
    if (count === 0) {
      for (const s of DEFAULT_STAGES) {
        await prisma.timeline.create({
          data: {
            ...s,
            id_periode,
          },
        });
      }
    }
  } catch (err) {
    console.warn('Gagal auto-seed timeline:', err);
  }
}

// GET /api/timeline
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const idPeriode = searchParams.get('id_periode');
    const isAdmin = searchParams.get('admin') === 'true';

    let targetPeriodeId: number | null = null;
    if (idPeriode) {
      targetPeriodeId = parseInt(idPeriode, 10);
    } else if (!isAdmin) {
      const activePeriode = await prisma.periode.findFirst({
        where: { status: 'Aktif' },
      });
      if (activePeriode) {
        targetPeriodeId = activePeriode.id_periode;
      } else {
        const latestPeriode = await prisma.periode.findFirst({
          orderBy: { id_periode: 'desc' },
        });
        if (latestPeriode) targetPeriodeId = latestPeriode.id_periode;
      }
    }

    // Auto-seed if targetPeriodeId is set and currently has 0 stages
    if (targetPeriodeId) {
      await ensureSeededForPeriode(targetPeriodeId);
    }

    const whereClause: any = {};
    if (!isAdmin) {
      whereClause.status = true;
    }
    if (targetPeriodeId) {
      whereClause.id_periode = targetPeriodeId;
    }

    const items = await prisma.timeline.findMany({
      where: whereClause,
      include: {
        periode: {
          select: {
            nama_periode: true,
            tahun: true,
            status: true,
          },
        },
      },
      orderBy: [
        { urutan: 'asc' },
        { tanggal_mulai: 'asc' },
      ],
    });

    return NextResponse.json({
      success: true,
      data: items.map(mapTimelineItem),
    });
  } catch (error) {
    console.error('Error fetching timeline:', error);
    return NextResponse.json(
      { success: false, message: 'Gagal mengambil data timeline dari database' },
      { status: 500 }
    );
  }
}

// POST /api/timeline - Buat tahapan baru
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      id_periode,
      nama_tahapan,
      tanggal_mulai,
      tanggal_selesai,
      urutan,
      deskripsi,
      status,
      is_pelaksanaan,
      is_pengumuman,
    } = body;

    if (!id_periode || !nama_tahapan || !tanggal_mulai || !tanggal_selesai) {
      return NextResponse.json(
        { success: false, message: 'Periode, Nama Tahapan, Tanggal Mulai, dan Tanggal Selesai wajib diisi!' },
        { status: 400 }
      );
    }

    const finalPeriodeId = parseInt(String(id_periode), 10);
    const finalIsPelaksanaan = Boolean(is_pelaksanaan);
    const finalIsPengumuman = Boolean(is_pengumuman);

    const validation = await validateTimelineChronology(
      finalPeriodeId,
      {
        nama_tahapan: String(nama_tahapan).trim(),
        tanggal_mulai: new Date(tanggal_mulai),
        tanggal_selesai: new Date(tanggal_selesai),
      }
    );

    if (!validation.valid) {
      return NextResponse.json(
        { success: false, message: validation.message },
        { status: 400 }
      );
    }

    if (finalIsPelaksanaan) {
      await prisma.timeline.updateMany({
        where: { id_periode: finalPeriodeId },
        data: { is_pelaksanaan: false },
      });
    }

    if (finalIsPengumuman) {
      await prisma.timeline.updateMany({
        where: { id_periode: finalPeriodeId },
        data: { is_pengumuman: false },
      });
    }

    const created = await prisma.timeline.create({
      data: {
        id_periode: finalPeriodeId,
        nama_tahapan: String(nama_tahapan).trim(),
        tanggal_mulai: new Date(tanggal_mulai),
        tanggal_selesai: new Date(tanggal_selesai),
        urutan: urutan ? parseInt(String(urutan), 10) : 1,
        deskripsi: deskripsi ? String(deskripsi).trim() : '',
        status: status !== undefined ? Boolean(status) : true,
        is_pelaksanaan: finalIsPelaksanaan,
        is_pengumuman: finalIsPengumuman,
      },
      include: {
        periode: {
          select: {
            nama_periode: true,
            tahun: true,
          },
        },
      },
    });

    const actorId = await resolveActorUserId(req, body?.id_user);
    await catatLogPublikasi({
      id_user: actorId,
      jenis: 'timeline',
      aksi: created.status ? 'Publish' : 'Private',
      id_periode: created.id_periode,
      id_referensi: created.id_timeline,
      keterangan: `Tahapan baru "${created.nama_tahapan}" dibuat dengan status ${created.status ? 'Publish' : 'Private'}.`,
    });

    // Otomatis tata ulang urutan kronologis berdasarkan tanggal mulai
    await reorderTimelineForPeriode(created.id_periode);

    const reorderedItem = await prisma.timeline.findUnique({
      where: { id_timeline: created.id_timeline },
      include: {
        periode: {
          select: {
            nama_periode: true,
            tahun: true,
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      data: mapTimelineItem(reorderedItem || created),
      message: 'Tahapan timeline berhasil ditambahkan!',
    });
  } catch (error) {
    console.error('Error creating timeline stage:', error);
    return NextResponse.json(
      { success: false, message: 'Gagal membuat tahapan timeline' },
      { status: 500 }
    );
  }
}

// PUT /api/timeline - Update tahapan
export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      id,
      id_timeline,
      id_periode,
      nama_tahapan,
      tanggal_mulai,
      tanggal_selesai,
      urutan,
      deskripsi,
      status,
      is_pelaksanaan,
      is_pengumuman,
    } = body;

    const targetId = parseInt(String(id_timeline || id), 10);
    if (!targetId || isNaN(targetId)) {
      return NextResponse.json(
        { success: false, message: 'ID Timeline wajib disertakan!' },
        { status: 400 }
      );
    }

    const updateData: any = {};
    if (id_periode !== undefined) updateData.id_periode = parseInt(String(id_periode), 10);
    if (nama_tahapan !== undefined) updateData.nama_tahapan = String(nama_tahapan).trim();
    if (tanggal_mulai !== undefined) updateData.tanggal_mulai = new Date(tanggal_mulai);
    if (tanggal_selesai !== undefined) updateData.tanggal_selesai = new Date(tanggal_selesai);
    if (urutan !== undefined) updateData.urutan = parseInt(String(urutan), 10);
    if (deskripsi !== undefined) updateData.deskripsi = String(deskripsi).trim();
    if (status !== undefined) updateData.status = Boolean(status);
    if (is_pelaksanaan !== undefined) updateData.is_pelaksanaan = Boolean(is_pelaksanaan);
    if (is_pengumuman !== undefined) updateData.is_pengumuman = Boolean(is_pengumuman);

    const existingTimeline = await prisma.timeline.findUnique({ where: { id_timeline: targetId } });
    if (!existingTimeline) {
      return NextResponse.json({ success: false, message: 'Tahapan timeline tidak ditemukan!' }, { status: 404 });
    }

    // Jika ditandai sebagai jadwal utama pelaksanaan, unmark tahapan lain pada periode tersebut
    if (updateData.is_pelaksanaan === true) {
      const targetPeriodeId = updateData.id_periode || existingTimeline.id_periode;
      await prisma.timeline.updateMany({
        where: {
          id_periode: targetPeriodeId,
          id_timeline: { not: targetId },
        },
        data: { is_pelaksanaan: false },
      });
    }

    // Jika ditandai sebagai jadwal pengumuman hasil seleksi, unmark tahapan lain pada periode tersebut
    if (updateData.is_pengumuman === true) {
      const targetPeriodeId = updateData.id_periode || existingTimeline.id_periode;
      await prisma.timeline.updateMany({
        where: {
          id_periode: targetPeriodeId,
          id_timeline: { not: targetId },
        },
        data: { is_pengumuman: false },
      });
    }

    // Validasi alur tanggal jika tanggal, periode, atau nama tahapan diubah
    if (tanggal_mulai !== undefined || tanggal_selesai !== undefined || id_periode !== undefined || nama_tahapan !== undefined) {
      const finalPeriodeId = id_periode !== undefined ? parseInt(String(id_periode), 10) : existingTimeline.id_periode;
      const finalNama = nama_tahapan !== undefined ? String(nama_tahapan).trim() : existingTimeline.nama_tahapan;
      const finalMulai = tanggal_mulai !== undefined ? new Date(tanggal_mulai) : existingTimeline.tanggal_mulai;
      const finalSelesai = tanggal_selesai !== undefined ? new Date(tanggal_selesai) : existingTimeline.tanggal_selesai;

      const validation = await validateTimelineChronology(
        finalPeriodeId,
        {
          nama_tahapan: finalNama,
          tanggal_mulai: finalMulai,
          tanggal_selesai: finalSelesai,
        },
        targetId
      );

      if (!validation.valid) {
        return NextResponse.json(
          { success: false, message: validation.message },
          { status: 400 }
        );
      }
    }

    const updated = await prisma.timeline.update({
      where: { id_timeline: targetId },
      data: updateData,
      include: {
        periode: {
          select: {
            nama_periode: true,
            tahun: true,
          },
        },
      },
    });

    // Log audit: catat jika status publikasi (Publish / Private) berubah
    if (status !== undefined && Boolean(status) !== existingTimeline.status) {
      const actorId = await resolveActorUserId(req, body?.id_user);
      await catatLogPublikasi({
        id_user: actorId,
        jenis: 'timeline',
        aksi: updated.status ? 'Publish' : 'Private',
        id_periode: updated.id_periode,
        id_referensi: updated.id_timeline,
        keterangan: `Tahapan jadwal timeline "${updated.nama_tahapan}" diubah menjadi ${updated.status ? 'Publish' : 'Private'}.`,
      });
    }

    // Otomatis tata ulang urutan kronologis berdasarkan tanggal mulai
    await reorderTimelineForPeriode(updated.id_periode);
    if (existingTimeline.id_periode !== updated.id_periode) {
      await reorderTimelineForPeriode(existingTimeline.id_periode);
    }

    const reorderedUpdated = await prisma.timeline.findUnique({
      where: { id_timeline: updated.id_timeline },
      include: {
        periode: {
          select: {
            nama_periode: true,
            tahun: true,
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      data: mapTimelineItem(reorderedUpdated || updated),
      message: 'Tahapan timeline berhasil diperbarui!',
    });
  } catch (error) {
    console.error('Error updating timeline stage:', error);
    return NextResponse.json(
      { success: false, message: 'Gagal memperbarui tahapan timeline' },
      { status: 500 }
    );
  }
}

// DELETE /api/timeline?id=... - Hapus tahapan
export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const idParam = searchParams.get('id') || searchParams.get('id_timeline');
    const targetId = parseInt(String(idParam), 10);

    if (!targetId || isNaN(targetId)) {
      return NextResponse.json(
        { success: false, message: 'ID Timeline wajib disertakan!' },
        { status: 400 }
      );
    }

    const existing = await prisma.timeline.findUnique({
      where: { id_timeline: targetId },
    });

    if (!existing) {
      return NextResponse.json(
        { success: false, message: 'Tahapan timeline tidak ditemukan!' },
        { status: 404 }
      );
    }

    await prisma.timeline.delete({
      where: { id_timeline: targetId },
    });

    // Otomatis tata ulang urutan kronologis setelah penghapusan
    await reorderTimelineForPeriode(existing.id_periode);

    return NextResponse.json({
      success: true,
      message: 'Tahapan timeline berhasil dihapus!',
    });
  } catch (error) {
    console.error('Error deleting timeline stage:', error);
    return NextResponse.json(
      { success: false, message: 'Gagal menghapus tahapan timeline' },
      { status: 500 }
    );
  }
}
