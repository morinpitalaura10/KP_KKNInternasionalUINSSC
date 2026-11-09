import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getHasilLockState } from '@/lib/publikasi';

// Helper to map hasil_seleksi item
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapHasilItem(h: any) {
  const p = h.pendaftaran;
  const mhs = p?.mahasiswa;
  const user = mhs?.users;
  const docs = p?.dokumen_pendaftaran || [];

  const hasRekomendasiDekan = docs.length > 0
    ? docs.some((d: any) => {
        const nama = (d.persyaratan?.nama_persyaratan || '').toLowerCase();
        return (nama.includes('dekan') || nama.includes('rekomendasi')) && d.status !== 'Revisi';
      })
    : true; // Default to true if not yet explicitly uploaded or already verified

  let statusLabel = 'Lolos';
  if (h.status === 'Tidak_Lolos') {
    statusLabel = 'Tidak Lolos';
  } else if (h.status === 'Cadangan') {
    statusLabel = 'Cadangan';
  }

  return {
    id_hasil: h.id_hasil,
    id_pendaftaran: h.id_pendaftaran,
    ranking_akhir: h.ranking_akhir,
    ranking_awal: h.ranking_awal,
    nim: user?.nim || '-',
    nama: user?.nama || '-',
    email: user?.email || '-',
    nama_fakultas: mhs?.fakultas?.nama_fakultas || '-',
    nama_prodi: mhs?.prodi?.nama_prodi || '-',
    ipk: mhs?.ipk ? parseFloat(mhs.ipk.toString()) : null,
    nilai_substansi: parseFloat(h.nilai_substansi.toString()),
    nilai_wawancara: parseFloat(h.nilai_wawancara.toString()),
    bobot_substansi: parseFloat(h.bobot_substansi.toString()),
    bobot_wawancara: parseFloat(h.bobot_wawancara.toString()),
    nilai_akhir: parseFloat(h.nilai_akhir.toString()),
    status: h.status,
    status_label: statusLabel,
    catatan: h.catatan || '',
    hasRekomendasiDekan,
    ditetapkan_oleh: h.users?.nama || 'Admin LP2M',
    tanggal_penetapan: h.tanggal_penetapan ? h.tanggal_penetapan.toISOString() : null,
    nama_periode: p?.periode?.nama_periode || '-',
    id_periode: p?.id_periode || null,
    nama_negara: p?.periode_negara?.negara?.nama_negara || '-',
  };
}

// GET /api/hasil_akhir
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    const idPeriode = searchParams.get('id_periode');
    const activeOnly = searchParams.get('active_only') === 'true';
    const statusParam = searchParams.get('status'); // 'all', 'Lolos', 'Cadangan', 'Tidak_Lolos'
    const fakultasParam = searchParams.get('fakultas');
    const search = searchParams.get('search')?.trim() || '';
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '10', 10);
    const skip = (page - 1) * limit;

    // Determine target Periode
    const activePeriode = await prisma.periode.findFirst({
      where: { status: 'Aktif' },
      orderBy: { id_periode: 'desc' },
    });

    let targetPeriodeId: number | null = null;
    if (activeOnly) {
      targetPeriodeId = activePeriode ? activePeriode.id_periode : -1;
    } else if (idPeriode) {
      targetPeriodeId = parseInt(idPeriode, 10);
    } else if (activePeriode) {
      targetPeriodeId = activePeriode.id_periode;
    } else {
      // Fallback to first available periode if none has 'Aktif' status
      const fallbackPeriode = await prisma.periode.findFirst({
        orderBy: { id_periode: 'asc' },
      });
      if (fallbackPeriode) {
        targetPeriodeId = fallbackPeriode.id_periode;
      }
    }

    // Single item fetch
    if (id) {
      const single = await prisma.hasil_seleksi.findUnique({
        where: { id_hasil: parseInt(id, 10) },
        include: {
          users: true,
          pendaftaran: {
            include: {
              periode: true,
              periode_negara: { include: { negara: true } },
              mahasiswa: {
                include: { users: true, fakultas: true, prodi: true },
              },
            },
          },
        },
      });

      if (!single) {
        return NextResponse.json({ success: false, message: 'Data hasil seleksi tidak ditemukan' }, { status: 404 });
      }
      return NextResponse.json({ success: true, data: mapHasilItem(single) });
    }

    // Build Where filter
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const where: any = {};

    if (targetPeriodeId) {
      where.pendaftaran = { id_periode: targetPeriodeId };
    }

    if (statusParam && statusParam !== 'all' && statusParam !== 'Semua Status') {
      const dbStatus = statusParam === 'Tidak Lolos' ? 'Tidak_Lolos' : statusParam;
      where.status = dbStatus;
    }

    if (fakultasParam && fakultasParam !== 'Semua Fakultas' && fakultasParam !== 'all') {
      where.pendaftaran = {
        ...(where.pendaftaran || {}),
        mahasiswa: {
          fakultas: { nama_fakultas: fakultasParam },
        },
      };
    }

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

    // Calculate Summary Stats for this periode (regardless of search/page)
    const basePeriodeWhere = targetPeriodeId ? { pendaftaran: { id_periode: targetPeriodeId } } : {};
    const allHasilInPeriode = await prisma.hasil_seleksi.findMany({
      where: basePeriodeWhere,
      select: {
        status: true,
        bobot_substansi: true,
        bobot_wawancara: true,
        pendaftaran: {
          select: {
            mahasiswa: {
              select: {
                fakultas: { select: { nama_fakultas: true } },
                prodi: { select: { nama_prodi: true } },
              },
            },
          },
        },
      },
    });

    const totalHasil = allHasilInPeriode.length;
    const countLolos = allHasilInPeriode.filter((h) => h.status === 'Lolos').length;
    const countCadangan = allHasilInPeriode.filter((h) => h.status === 'Cadangan').length;
    const countTidakLolos = allHasilInPeriode.filter((h) => h.status === 'Tidak_Lolos').length;

    // Dynamic weights from DB
    const bobotSubstansi = allHasilInPeriode[0]?.bobot_substansi
      ? parseFloat(allHasilInPeriode[0].bobot_substansi.toString())
      : 70;
    const bobotWawancara = allHasilInPeriode[0]?.bobot_wawancara
      ? parseFloat(allHasilInPeriode[0].bobot_wawancara.toString())
      : 30;

    // Breakdown per Fakultas for Kuota & Keterwakilan representation
    const fMap: Record<string, { total: number; lolos: number; cadangan: number }> = {};
    allHasilInPeriode.forEach((h) => {
      const fName = h.pendaftaran?.mahasiswa?.fakultas?.nama_fakultas || 'Lainnya';
      if (!fMap[fName]) fMap[fName] = { total: 0, lolos: 0, cadangan: 0 };
      fMap[fName].total += 1;
      if (h.status === 'Lolos') fMap[fName].lolos += 1;
      if (h.status === 'Cadangan') fMap[fName].cadangan += 1;
    });

    const fakultasBreakdown = Object.entries(fMap).map(([nama, val]) => ({
      nama_fakultas: nama,
      total: val.total,
      lolos: val.lolos,
      cadangan: val.cadangan,
    }));

    // Get periode kuota
    const currentPeriode = targetPeriodeId
      ? await prisma.periode.findUnique({ where: { id_periode: targetPeriodeId } })
      : null;
    const targetKuota = currentPeriode?.kuota !== undefined && currentPeriode?.kuota !== null
      ? currentPeriode.kuota
      : 10;

    const persenLolos = totalHasil > 0 ? Math.round((countLolos / totalHasil) * 100) : 0;
    const persenTidakLolos = totalHasil > 0 ? Math.round((countTidakLolos / totalHasil) * 100) : 0;
    const persenCadangan = totalHasil > 0 ? Math.round((countCadangan / totalHasil) * 100) : 0;

    // Filtered count
    const total = await prisma.hasil_seleksi.count({ where });

    // Fetch items ordered by ranking_akhir ASC
    const items = await prisma.hasil_seleksi.findMany({
      where,
      include: {
        users: true,
        pendaftaran: {
          include: {
            periode: true,
            periode_negara: { include: { negara: true } },
            dokumen_pendaftaran: {
              include: { persyaratan: true },
            },
            mahasiswa: {
              include: { users: true, fakultas: true, prodi: true },
            },
          },
        },
      },
      orderBy: { ranking_akhir: 'asc' },
      skip,
      take: limit,
    });

    // Periodes list for dropdown
    const periodes = await prisma.periode.findMany({
      where: activeOnly ? { status: 'Aktif' } : {},
      orderBy: { created_at: 'desc' },
      select: { id_periode: true, nama_periode: true, tahun: true, status: true, kuota: true },
    });

    // Status publikasi & penguncian hasil seleksi untuk periode ini
    const lockState = targetPeriodeId ? await getHasilLockState(targetPeriodeId) : null;

    return NextResponse.json({
      success: true,
      data: items.map(mapHasilItem),
      publikasi: lockState
        ? {
            locked: lockState.locked,
            alasan: lockState.alasan,
            dipublikasi: lockState.dipublikasi,
            tanggal_publikasi: lockState.tanggalPublikasi ? lockState.tanggalPublikasi.toISOString() : null,
            dipublikasi_oleh: lockState.dipublikasiOleh,
            nama_user_publikasi: lockState.namaUserPublikasi,
            batas_penetapan: lockState.batasPenetapan ? lockState.batasPenetapan.toISOString() : null,
            lewat_batas_waktu: lockState.lewatBatasWaktu,
          }
        : null,
      summary: {
        totalPeserta: totalHasil,
        totalLolos: countLolos,
        totalCadangan: countCadangan,
        totalTidakLolos: countTidakLolos,
        persenLolos,
        persenTidakLolos,
        persenCadangan,
        targetKuota,
        bobotSubstansi,
        bobotWawancara,
        fakultasBreakdown,
      },
      periodes: periodes.map((p) => ({
        id_periode: p.id_periode,
        nama_periode: p.nama_periode,
        tahun: p.tahun,
        status: p.status === 'Belum_Aktif' ? 'Belum Aktif' : p.status,
        kuota: p.kuota,
      })),
      activePeriodeId: targetPeriodeId,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit) || 1,
      },
    });
  } catch (error) {
    console.error('Error fetching hasil seleksi:', error);
    return NextResponse.json({ success: false, message: 'Gagal mengambil data hasil seleksi' }, { status: 500 });
  }
}

// PUT /api/hasil_akhir - Update status or note
export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const { id_hasil, status, catatan, ranking_akhir } = body;

    const targetId = parseInt(String(id_hasil), 10);
    if (!targetId || isNaN(targetId)) {
      return NextResponse.json({ success: false, message: 'ID Hasil Seleksi wajib diisi!' }, { status: 400 });
    }

    const existing = await prisma.hasil_seleksi.findUnique({
      where: { id_hasil: targetId },
      include: { pendaftaran: { select: { id_periode: true } } },
    });
    if (!existing) {
      return NextResponse.json({ success: false, message: 'Data hasil seleksi tidak ditemukan' }, { status: 404 });
    }

    // Locking: tolak perubahan jika hasil sudah dipublikasikan / batas waktu berakhir
    const lock = await getHasilLockState(existing.pendaftaran.id_periode);
    if (lock.locked) {
      return NextResponse.json({ success: false, locked: true, message: lock.alasan }, { status: 423 });
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const updateData: any = {};
    if (status) {
      updateData.status = status === 'Tidak Lolos' ? 'Tidak_Lolos' : status;
    }
    if (catatan !== undefined) {
      updateData.catatan = catatan;
    }
    if (ranking_akhir !== undefined) {
      updateData.ranking_akhir = parseInt(String(ranking_akhir), 10);
    }
    updateData.tanggal_penetapan = new Date();

    const updated = await prisma.hasil_seleksi.update({
      where: { id_hasil: targetId },
      data: updateData,
      include: {
        users: true,
        pendaftaran: {
          include: {
            periode: true,
            mahasiswa: { include: { users: true, fakultas: true, prodi: true } },
          },
        },
      },
    });

    // Also sync status on pendaftaran table if status changed
    if (status) {
      let pStatus: 'Lolos' | 'Tidak_Lolos' | 'Wawancara' = 'Lolos';
      if (updateData.status === 'Lolos') pStatus = 'Lolos';
      else if (updateData.status === 'Tidak_Lolos') pStatus = 'Tidak_Lolos';
      else if (updateData.status === 'Cadangan') pStatus = 'Wawancara';

      await prisma.pendaftaran.update({
        where: { id_pendaftaran: existing.id_pendaftaran },
        data: { status_pendaftaran: pStatus },
      });
    }

    return NextResponse.json({
      success: true,
      message: 'Status dan data hasil seleksi berhasil diperbarui!',
      data: mapHasilItem(updated),
    });
  } catch (error) {
    console.error('Error updating hasil seleksi:', error);
    return NextResponse.json({ success: false, message: 'Gagal memperbarui data hasil seleksi' }, { status: 500 });
  }
}

// POST /api/hasil_akhir - Atur jumlah kuota periode & opsi terapkan kelulusan otomatis
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      id_periode,
      kuota,
      kuota_cadangan = 3,
      apply_ranking = false,
      calculate_spk = false,
      bobot_substansi,
      bobot_wawancara,
      recalculate_weights = false,
    } = body;

    const targetPeriodeId = parseInt(String(id_periode), 10);
    const cadanganCount = parseInt(String(kuota_cadangan), 10) || 0;

    if (!targetPeriodeId || isNaN(targetPeriodeId)) {
      return NextResponse.json({ success: false, message: 'ID Periode wajib diisi!' }, { status: 400 });
    }

    const currentPeriode = await prisma.periode.findUnique({
      where: { id_periode: targetPeriodeId },
    });
    if (!currentPeriode) {
      return NextResponse.json({ success: false, message: 'Periode tidak ditemukan!' }, { status: 404 });
    }

    // Locking: tolak kalkulasi/penetapan ulang jika hasil sudah dipublikasikan / batas waktu berakhir
    const lock = await getHasilLockState(targetPeriodeId);
    if (lock.locked) {
      return NextResponse.json({ success: false, locked: true, message: lock.alasan }, { status: 423 });
    }

    const newKuota = kuota !== undefined && !isNaN(parseInt(String(kuota), 10)) && parseInt(String(kuota), 10) > 0
      ? parseInt(String(kuota), 10)
      : currentPeriode.kuota || 10;

    // 1. Simpan kuota baru ke tabel periode jika ada perubahan
    if (newKuota !== currentPeriode.kuota) {
      await prisma.periode.update({
        where: { id_periode: targetPeriodeId },
        data: { kuota: newKuota },
      });
    }

    // 2. Jika bobot_substansi & bobot_wawancara dikirim: Update bobot dan hitung ulang nilai akhir secara dinamis
    if (bobot_substansi !== undefined && bobot_wawancara !== undefined) {
      const newBobotSubstansi = parseFloat(String(bobot_substansi));
      const newBobotWawancara = parseFloat(String(bobot_wawancara));

      const allPesertaToUpdate = await prisma.hasil_seleksi.findMany({
        where: { pendaftaran: { id_periode: targetPeriodeId } },
      });

      for (const item of allPesertaToUpdate) {
        const valSubstansi = parseFloat(item.nilai_substansi.toString());
        const valWawancara = parseFloat(item.nilai_wawancara.toString());
        const newNilaiAkhir = Math.round(((valSubstansi * (newBobotSubstansi / 100)) + (valWawancara * (newBobotWawancara / 100))) * 100) / 100;

        await prisma.hasil_seleksi.update({
          where: { id_hasil: item.id_hasil },
          data: {
            bobot_substansi: newBobotSubstansi,
            bobot_wawancara: newBobotWawancara,
            nilai_akhir: newNilaiAkhir,
          },
        });
      }

      if (recalculate_weights || apply_ranking) {
        const allPeserta = await prisma.hasil_seleksi.findMany({
          where: { pendaftaran: { id_periode: targetPeriodeId } },
          orderBy: [{ nilai_akhir: 'desc' }, { id_hasil: 'asc' }],
        });

        const effectiveKuota = newKuota || currentPeriode.kuota || 10;
        for (let i = 0; i < allPeserta.length; i++) {
          const item = allPeserta[i];
          const ranking = i + 1;
          let newStatus: 'Lolos' | 'Cadangan' | 'Tidak_Lolos' = 'Tidak_Lolos';
          let newPendaftaranStatus: 'Lolos' | 'Wawancara' | 'Tidak_Lolos' = 'Tidak_Lolos';

          if (i < effectiveKuota) {
            newStatus = 'Lolos';
            newPendaftaranStatus = 'Lolos';
          } else if (i < effectiveKuota + cadanganCount) {
            newStatus = 'Cadangan';
            newPendaftaranStatus = 'Wawancara';
          } else {
            newStatus = 'Tidak_Lolos';
            newPendaftaranStatus = 'Tidak_Lolos';
          }

          await prisma.hasil_seleksi.update({
            where: { id_hasil: item.id_hasil },
            data: {
              ranking_awal: ranking,
              ranking_akhir: ranking,
              status: newStatus,
              tanggal_penetapan: new Date(),
            },
          });

          await prisma.pendaftaran.update({
            where: { id_pendaftaran: item.id_pendaftaran },
            data: {
              status_pendaftaran: newPendaftaranStatus,
            },
          });
        }

        return NextResponse.json({
          success: true,
          message: `Formula bobot seleksi berhasil diubah menjadi ${newBobotSubstansi}% Substansi + ${newBobotWawancara}% Wawancara! Skor akhir dan ranking ${allPeserta.length} peserta telah dihitung ulang secara dinamis.`,
        });
      }

      return NextResponse.json({
        success: true,
        message: `Bobot formula berhasil diperbarui menjadi ${newBobotSubstansi}% Substansi + ${newBobotWawancara}% Wawancara!`,
      });
    }

    // 3. Jika calculate_spk diminta: auto-generate hasil_seleksi untuk pendaftar yang belum terdaftar di hasil_seleksi
    let newlyCreatedCount = 0;
    if (calculate_spk || apply_ranking) {
      const allPendaftaran = await prisma.pendaftaran.findMany({
        where: {
          id_periode: targetPeriodeId,
          status_pendaftaran: { not: 'Draft' },
        },
        include: {
          hasil_seleksi: true,
          mahasiswa: true,
        },
      });

      const adminUser = await prisma.user.findFirst({
        where: { role: 'admin' },
      });
      const adminId = adminUser?.id_user || 1;

      // Ambil bobot aktif dari peserta terdahulu jika ada
      const firstExisting = await prisma.hasil_seleksi.findFirst({
        where: { pendaftaran: { id_periode: targetPeriodeId } },
      });
      const activeBobotSubstansi = firstExisting ? parseFloat(firstExisting.bobot_substansi.toString()) : 70.0;
      const activeBobotWawancara = firstExisting ? parseFloat(firstExisting.bobot_wawancara.toString()) : 30.0;

      for (const p of allPendaftaran) {
        if (!p.hasil_seleksi) {
          // Hitung nilai substansi dari IPK (skala 100)
          const rawIpk = p.ipk ? parseFloat(p.ipk.toString()) : (p.mahasiswa?.ipk ? parseFloat(p.mahasiswa.ipk.toString()) : 3.5);
          const nilaiSubstansi = Math.min(98, Math.max(70, Math.round(((rawIpk / 4.0) * 85 + 10) * 10) / 10));
          const nilaiWawancara = 85.0;
          const nilaiAkhir = Math.round(((nilaiSubstansi * (activeBobotSubstansi / 100)) + (nilaiWawancara * (activeBobotWawancara / 100))) * 100) / 100;

          await prisma.hasil_seleksi.create({
            data: {
              id_pendaftaran: p.id_pendaftaran,
              nilai_substansi: nilaiSubstansi,
              nilai_wawancara: nilaiWawancara,
              bobot_substansi: activeBobotSubstansi,
              bobot_wawancara: activeBobotWawancara,
              nilai_akhir: nilaiAkhir,
              ranking_awal: 999,
              ranking_akhir: 999,
              status: 'Tidak_Lolos',
              catatan: 'Hasil kalkulasi SPK sistem seleksi otomatis LP2M.',
              ditetapkan_oleh: adminId,
            },
          });
          newlyCreatedCount++;
        }
      }
    }

    // 3. Terapkan ranking dan status kelulusan berdasarkan nilai_akhir
    if (apply_ranking || calculate_spk) {
      const allPeserta = await prisma.hasil_seleksi.findMany({
        where: { pendaftaran: { id_periode: targetPeriodeId } },
        orderBy: [{ nilai_akhir: 'desc' }, { id_hasil: 'asc' }],
      });

      for (let i = 0; i < allPeserta.length; i++) {
        const item = allPeserta[i];
        const ranking = i + 1;
        let newStatus: 'Lolos' | 'Cadangan' | 'Tidak_Lolos' = 'Tidak_Lolos';
        let newPendaftaranStatus: 'Lolos' | 'Wawancara' | 'Tidak_Lolos' = 'Tidak_Lolos';

        if (i < newKuota) {
          newStatus = 'Lolos';
          newPendaftaranStatus = 'Lolos';
        } else if (i < newKuota + cadanganCount) {
          newStatus = 'Cadangan';
          newPendaftaranStatus = 'Wawancara';
        } else {
          newStatus = 'Tidak_Lolos';
          newPendaftaranStatus = 'Tidak_Lolos';
        }

        await prisma.hasil_seleksi.update({
          where: { id_hasil: item.id_hasil },
          data: {
            ranking_awal: ranking,
            ranking_akhir: ranking,
            status: newStatus,
            tanggal_penetapan: new Date(),
          },
        });

        await prisma.pendaftaran.update({
          where: { id_pendaftaran: item.id_pendaftaran },
          data: {
            status_pendaftaran: newPendaftaranStatus,
          },
        });
      }

      const msg = newlyCreatedCount > 0
        ? `Berhasil mengkalkulasi SPK untuk ${allPeserta.length} peserta (${newlyCreatedCount} pendaftar baru tersinkronisasi) dengan Kuota ${newKuota} Lolos dan ${cadanganCount} Cadangan!`
        : `Kalkulasi SPK berhasil diperbarui! Kuota ${newKuota} mahasiswa Lolos dan ${cadanganCount} Cadangan telah diterapkan.`;

      return NextResponse.json({
        success: true,
        message: msg,
      });
    }

    return NextResponse.json({
      success: true,
      message: `Kuota periode berhasil diperbarui menjadi ${newKuota} mahasiswa!`,
    });
  } catch (error) {
    console.error('Error updating kuota / kalkulasi hasil akhir:', error);
    return NextResponse.json({ success: false, message: 'Gagal memproses kalkulasi hasil seleksi', error: error instanceof Error ? error.message : String(error) }, { status: 500 });
  }
}

