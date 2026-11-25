import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { pendaftaran_jenis_kelamin, pendaftaran_status_pendaftaran } from '@prisma/client';
import { getPersyaratanAkademik } from '@/lib/persyaratanAkademik';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      userId,
      isDraft,
      jenis_kelamin,
      no_hp,
      alamat,
      tempat_lahir,
      tanggal_lahir,
      asal_sekolah,
      total_sks,
      ipk,
      deskripsi_diri,
      golongan_darah,
      riwayat_penyakit,
      alergi,
      ukuran_kaos,
      id_periode_negara,
      // Orang tua
      nama_ayah,
      pekerjaan_ayah,
      nama_ibu,
      pekerjaan_ibu,
      alamat_orang_tua,
      no_hp_orang_tua,
    } = body;

    if (!userId) {
      return NextResponse.json({ success: false, message: 'userId wajib disertakan' }, { status: 400 });
    }

    const mhs = await prisma.mahasiswa.findFirst({
      where: { id_user: parseInt(userId, 10) },
      include: { users: true },
    });

    if (!mhs) {
      return NextResponse.json({ success: false, message: 'Data mahasiswa tidak ditemukan' }, { status: 404 });
    }

    // Backend validation: If submitting final (not draft)
    if (!isDraft) {
      // 1. Validasi Format Asal Sekolah
      const rawAsalSekolah = (asal_sekolah || '').trim();
      const startsWithValidType = /^(SMA|SMK|MA|MAN|SMAS|SMKS)/i.test(rawAsalSekolah);
      const wordCount = rawAsalSekolah.split(/\s+/).filter(Boolean).length;
      if (!startsWithValidType || wordCount < 3 || rawAsalSekolah.length < 10) {
        return NextResponse.json(
          {
            success: false,
            message:
              'Format penulisan Asal Sekolah tidak valid. Wajib menggunakan format resmi lengkap diawali jenis sekolah resmi beserta nomor/nama dan daerah (Contoh: SMK Negeri 1 Kota Cirebon atau SMA Negeri 1 Kota Cirebon).',
          },
          { status: 400 }
        );
      }

      // 2. Validasi Persyaratan Akademik Dinamis (IPK, Semester, Jurusan/Prodi)
      const reqAkademik = await getPersyaratanAkademik();
      if (reqAkademik.status) {
        const studentIpk = mhs.ipk ? parseFloat(mhs.ipk.toString()) : 0;
        const studentSemester = mhs.semester;
        const isAktif = mhs.users ? mhs.users.status !== false : true;

        if (!isAktif) {
          return NextResponse.json(
            { success: false, message: 'Pendaftaran ditolak: Anda wajib berstatus Mahasiswa Aktif.' },
            { status: 400 }
          );
        }

        if (studentIpk < reqAkademik.min_ipk) {
          return NextResponse.json(
            {
              success: false,
              message: `Pendaftaran tidak dapat dikirim: IPK Anda (${studentIpk.toFixed(2)}) belum memenuhi syarat minimal (${reqAkademik.min_ipk.toFixed(2)}). Anda hanya dapat menyimpan sebagai Draft.`,
            },
            { status: 400 }
          );
        }

        if (studentSemester < reqAkademik.min_semester || studentSemester > reqAkademik.max_semester) {
          return NextResponse.json(
            {
              success: false,
              message: `Pendaftaran tidak dapat dikirim: Semester Anda (Semester ${studentSemester}) tidak memenuhi batas yang ditentukan (Semester ${reqAkademik.min_semester} - ${reqAkademik.max_semester}). Anda hanya dapat menyimpan sebagai Draft.`,
            },
            { status: 400 }
          );
        }

        if (!reqAkademik.all_prodi && reqAkademik.allowed_prodi_ids.length > 0) {
          if (!reqAkademik.allowed_prodi_ids.includes(mhs.id_prodi)) {
            return NextResponse.json(
              {
                success: false,
                message: 'Pendaftaran tidak dapat dikirim: Program studi Anda belum dibuka untuk pendaftaran KKN Internasional pada periode ini.',
              },
              { status: 400 }
            );
          }
        }
      }
    }

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
            'Pendaftaran ditutup: Saat ini tidak ada periode/gelombang KKN Internasional yang berstatus Aktif.',
        },
        { status: 400 }
      );
    }

    if (activePeriode.hasil_dipublikasi) {
      return NextResponse.json(
        {
          success: false,
          message:
            'Formulir pendaftaran telah dikunci karena hasil seleksi periode ini sudah resmi dipublikasikan oleh Admin LP2M.',
        },
        { status: 403 }
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
          message: `Pendaftaran ditutup: Tanggal saat ini berada di luar jadwal "${uploadStage?.nama_tahapan || 'Pendaftaran & Unggah Berkas'}" (${startStr} s.d. ${endStr}).`,
        },
        { status: 400 }
      );
    }

    // Determine target periode_negara automatically (managed by Admin/LP2M, not chosen by student)
    let targetPeriodeNegaraId = id_periode_negara ? parseInt(id_periode_negara, 10) : null;
    if (!targetPeriodeNegaraId && activePeriode.periode_negara.length > 0) {
      targetPeriodeNegaraId = activePeriode.periode_negara[0].id_periode_negara;
    }

    if (!targetPeriodeNegaraId) {
      return NextResponse.json({ success: false, message: 'Negara tujuan belum tersedia untuk periode ini' }, { status: 400 });
    }

    const newStatus: pendaftaran_status_pendaftaran = isDraft ? 'Draft' : 'Menunggu_Verifikasi';
    const jkEnum: pendaftaran_jenis_kelamin = jenis_kelamin === 'L' || jenis_kelamin === 'Laki-Laki' ? 'L' : 'P';

    // Check if registration already exists
    const existing = await prisma.pendaftaran.findFirst({
      where: {
        id_mahasiswa: mhs.id_mahasiswa,
        id_periode: activePeriode.id_periode,
      },
    });

    // Server-side check for mandatory documents when submitting final registration
    if (!isDraft) {
      const mandatoryReqs = await prisma.persyaratan.findMany({
        where: {
          id_periode: activePeriode.id_periode,
          wajib: true,
          status: true,
        },
      });

      if (mandatoryReqs.length > 0) {
        let uploadedDocIds: number[] = [];
        if (existing) {
          const uploadedDocs = await prisma.dokumen_pendaftaran.findMany({
            where: { id_pendaftaran: existing.id_pendaftaran },
            select: { id_persyaratan: true, file_path: true },
          });
          uploadedDocIds = uploadedDocs
            .filter((d) => Boolean(d.file_path && d.file_path.trim()))
            .map((d) => d.id_persyaratan);
        }

        const unuploaded = mandatoryReqs.filter((m) => !uploadedDocIds.includes(m.id_persyaratan));
        if (unuploaded.length > 0) {
          return NextResponse.json(
            {
              success: false,
              message: `Pendaftaran tidak dapat dikirim! Anda belum mengunggah dokumen wajib: ${unuploaded
                .map((u) => u.nama_persyaratan)
                .join(', ')}. Harap lengkapi seluruh berkas bertanda (Wajib) terlebih dahulu.`,
            },
            { status: 400 }
          );
        }
      }

      // Validasi ketat Data Pendukung (Pengalaman, Bahasa Asing, dan Esai Motivasi)
      const rawDeskripsi = (deskripsi_diri || existing?.deskripsi_diri || '').trim();
      const orgMatch = rawDeskripsi.match(/\[Pengalaman Organisasi\]:\s*([\s\S]*?)(?=\n\[Kemampuan Bahasa Asing\]:|\n\[Motivasi\]:|$)/);
      const bhsMatch = rawDeskripsi.match(/\[Kemampuan Bahasa Asing\]:\s*([\s\S]*?)(?=\n\[Motivasi\]:|$)/);
      const motMatch = rawDeskripsi.match(/\[Motivasi\]:\s*([\s\S]*?)$/);

      const orgText = orgMatch ? orgMatch[1].trim() : '';
      const bhsText = bhsMatch ? bhsMatch[1].trim() : '';
      const motText = motMatch ? motMatch[1].trim() : (rawDeskripsi.startsWith('[') ? '' : rawDeskripsi.trim());

      if (orgText.length < 10) {
        return NextResponse.json(
          {
            success: false,
            message: 'Pengalaman Organisasi / Kepanitiaan wajib diisi minimal 10 karakter.',
          },
          { status: 400 }
        );
      }
      if (bhsText.length < 5) {
        return NextResponse.json(
          {
            success: false,
            message: 'Kemampuan Bahasa Asing wajib diisi minimal 5 karakter (contoh: Bahasa Inggris, Bahasa Arab, skor TOEFL).',
          },
          { status: 400 }
        );
      }
      if (motText.length < 50) {
        return NextResponse.json(
          {
            success: false,
            message: 'Esai motivasi wajib diisi minimal 50 karakter agar dapat dinilai secara komprehensif oleh tim penguji.',
          },
          { status: 400 }
        );
      }
    }

    let pendaftaranRecord;

    if (existing) {
      pendaftaranRecord = await prisma.pendaftaran.update({
        where: { id_pendaftaran: existing.id_pendaftaran },
        data: {
          id_periode_negara: targetPeriodeNegaraId,
          jenis_kelamin: jkEnum,
          no_hp: no_hp || existing.no_hp,
          alamat: alamat || existing.alamat,
          tempat_lahir: tempat_lahir || existing.tempat_lahir,
          tanggal_lahir: tanggal_lahir ? new Date(tanggal_lahir) : existing.tanggal_lahir,
          asal_sekolah: asal_sekolah || existing.asal_sekolah,
          total_sks: total_sks ? parseInt(total_sks, 10) : existing.total_sks,
          ipk: ipk ? parseFloat(ipk) : existing.ipk,
          deskripsi_diri: deskripsi_diri || existing.deskripsi_diri,
          golongan_darah: golongan_darah || existing.golongan_darah,
          riwayat_penyakit: riwayat_penyakit !== undefined ? riwayat_penyakit : existing.riwayat_penyakit,
          alergi: alergi !== undefined ? alergi : existing.alergi,
          ukuran_kaos: ukuran_kaos || existing.ukuran_kaos,
          status_pendaftaran: newStatus,
          updated_at: new Date(),
        },
      });

      // Update or create orang_tua
      if (nama_ayah || nama_ibu) {
        await prisma.orang_tua.upsert({
          where: { id_pendaftaran: existing.id_pendaftaran },
          update: {
            nama_ayah: nama_ayah || '-',
            pekerjaan_ayah: pekerjaan_ayah || '-',
            nama_ibu: nama_ibu || '-',
            pekerjaan_ibu: pekerjaan_ibu || '-',
            alamat_orang_tua: alamat_orang_tua || alamat || '-',
            no_hp_orang_tua: no_hp_orang_tua || '-',
          },
          create: {
            id_pendaftaran: existing.id_pendaftaran,
            nama_ayah: nama_ayah || '-',
            pekerjaan_ayah: pekerjaan_ayah || '-',
            nama_ibu: nama_ibu || '-',
            pekerjaan_ibu: pekerjaan_ibu || '-',
            alamat_orang_tua: alamat_orang_tua || alamat || '-',
            no_hp_orang_tua: no_hp_orang_tua || '-',
          },
        });
      }
    } else {
      pendaftaranRecord = await prisma.pendaftaran.create({
        data: {
          id_mahasiswa: mhs.id_mahasiswa,
          id_periode: activePeriode.id_periode,
          id_periode_negara: targetPeriodeNegaraId,
          jenis_kelamin: jkEnum,
          no_hp: no_hp || '08123456789',
          alamat: alamat || 'Cirebon',
          tempat_lahir: tempat_lahir || 'Cirebon',
          tanggal_lahir: tanggal_lahir ? new Date(tanggal_lahir) : new Date('2003-01-01'),
          asal_sekolah: asal_sekolah || '-',
          total_sks: total_sks ? parseInt(total_sks, 10) : 100,
          ipk: ipk ? parseFloat(ipk) : 3.5,
          deskripsi_diri: deskripsi_diri || '-',
          golongan_darah: golongan_darah || 'O',
          riwayat_penyakit: riwayat_penyakit || '',
          alergi: alergi || '',
          ukuran_kaos: ukuran_kaos || 'L',
          status_pendaftaran: newStatus,
          orang_tua: {
            create: {
              nama_ayah: nama_ayah || '-',
              pekerjaan_ayah: pekerjaan_ayah || '-',
              nama_ibu: nama_ibu || '-',
              pekerjaan_ibu: pekerjaan_ibu || '-',
              alamat_orang_tua: alamat_orang_tua || alamat || '-',
              no_hp_orang_tua: no_hp_orang_tua || '-',
            },
          },
        },
      });
    }

    return NextResponse.json({
      success: true,
      message: isDraft ? 'Draft pendaftaran berhasil disimpan!' : 'Pendaftaran berhasil dikirim!',
      data: {
        id_pendaftaran: pendaftaranRecord.id_pendaftaran,
        status: pendaftaranRecord.status_pendaftaran,
      },
    });
  } catch (error) {
    console.error('Error saving pendaftaran:', error);
    return NextResponse.json({ success: false, message: 'Gagal memproses pendaftaran' }, { status: 500 });
  }
}
