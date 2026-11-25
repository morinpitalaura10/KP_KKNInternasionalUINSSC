import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getBridgeProfile } from '@/lib/bridgeApi';

// GET /api/mahasiswa/form-init?userId=xxx
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ success: false, message: 'userId wajib disertakan' }, { status: 400 });
    }

    const userIdInt = parseInt(userId, 10);

    // Get user and mahasiswa profile
    const user = await prisma.user.findUnique({
      where: { id_user: userIdInt },
      include: {
        mahasiswa: {
          include: {
            fakultas: true,
            prodi: true,
          },
        },
      },
    });

    if (!user || !user.mahasiswa) {
      return NextResponse.json({ success: false, message: 'Profil mahasiswa tidak ditemukan' }, { status: 404 });
    }

    const mhs = user.mahasiswa;

    // Get active period
    const activePeriode = await prisma.periode.findFirst({
      where: { status: 'Aktif' },
      include: {
        periode_negara: {
          where: { status: true },
          include: { negara: true },
        },
        persyaratan: {
          where: { status: true },
          orderBy: { id_persyaratan: 'asc' },
        },
        timeline: {
          where: { status: true },
          orderBy: { urutan: 'asc' },
        },
      },
    });

    // Find any existing pendaftaran in active periode
    let existingPendaftaran = null;
    if (activePeriode) {
      existingPendaftaran = await prisma.pendaftaran.findFirst({
        where: {
          id_mahasiswa: mhs.id_mahasiswa,
          id_periode: activePeriode.id_periode,
        },
        include: {
          orang_tua: true,
          dokumen_pendaftaran: {
            include: { persyaratan: true },
          },
        },
      });
    }

    // Riwayat pendaftaran terakhir (untuk pre-fill biodata dasar jika ganti periode)
    const lastPendaftaran =
      existingPendaftaran ||
      (await prisma.pendaftaran.findFirst({
        where: { id_mahasiswa: mhs.id_mahasiswa },
        orderBy: { created_at: 'desc' },
        include: {
          orang_tua: true,
        },
      }));

    // Evaluasi apakah periode pendaftaran sedang buka & apakah jadwal unggah dokumen masih buka
    const now = new Date();
    const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
    let isRegistrationOpen = false;
    let isUploadWindowOpen = false;
    let closedMessage: string | null = null;
    let uploadWindowMessage: string | null = null;
    let uploadTimelineInfo: {
      nama_tahapan: string;
      tanggal_mulai: string;
      tanggal_selesai: string;
    } | null = null;

    if (!activePeriode) {
      isRegistrationOpen = false;
      isUploadWindowOpen = false;
      closedMessage =
        'Saat ini tidak ada periode/gelombang pendaftaran KKN Internasional yang berstatus Aktif. Anda tidak dapat melakukan pendaftaran baru maupun mengubah data pendaftaran.';
    } else {
      isRegistrationOpen = true;

      // Cari jadwal tahapan "Pendaftaran & Unggah Berkas" dari tabel timeline (urutan 1 atau kata kunci pendaftaran/unggah/berkas)
      const uploadStage =
        activePeriode.timeline.find(
          (t) =>
            /pendaftaran|unggah|berkas|dokumen/i.test(t.nama_tahapan) || t.urutan === 1
        ) || activePeriode.timeline[0];

      const rawStart = uploadStage?.tanggal_mulai || activePeriode.tanggal_mulai;
      const rawEnd = uploadStage?.tanggal_selesai || activePeriode.tanggal_selesai;
      const stageName = uploadStage?.nama_tahapan || 'Pendaftaran & Unggah Berkas Persyaratan';

      const startStr = rawStart ? new Date(rawStart).toISOString().split('T')[0] : '';
      const endStr = rawEnd ? new Date(rawEnd).toISOString().split('T')[0] : '';

      if (startStr && endStr) {
        uploadTimelineInfo = {
          nama_tahapan: stageName,
          tanggal_mulai: startStr,
          tanggal_selesai: endStr,
        };
      }

      const fmtDate = (iso: string) => {
        if (!iso) return '-';
        return new Date(`${iso}T00:00:00`).toLocaleDateString('id-ID', {
          day: 'numeric',
          month: 'long',
          year: 'numeric',
        });
      };

      if (activePeriode.hasil_dipublikasi) {
        isUploadWindowOpen = false;
        uploadWindowMessage = `Hasil seleksi untuk periode "${activePeriode.nama_periode} (${activePeriode.tahun})" telah resmi dipublikasikan oleh Admin LP2M. Formulir pendaftaran dan pengunggahan berkas telah dikunci secara permanen dan tidak dapat diedit kembali.`;
      } else if (startStr && todayStr < startStr) {
        isUploadWindowOpen = false;
        uploadWindowMessage = `Jadwal "${stageName}" belum dibuka. Pengiriman dokumen dan pendaftaran baru dapat dilakukan pada ${fmtDate(startStr)} s.d. ${fmtDate(endStr)}.`;
      } else if (endStr && todayStr > endStr) {
        isUploadWindowOpen = false;
        uploadWindowMessage = `Batas waktu "${stageName}" telah berakhir (Jadwal resmi: ${fmtDate(startStr)} s.d. ${fmtDate(endStr)}). Pengiriman dokumen dan penyimpanan pendaftaran telah ditutup.`;
      } else {
        isUploadWindowOpen = true;
      }
    }

    // Jika mahasiswa login via Bridge (memiliki token api_id), ambil profil asli dari Bridge API
    let bridgeProfile = null;
    if (user.api_id && user.api_id.includes('|')) {
      const bridgeRes = await getBridgeProfile(user.api_id);
      if (bridgeRes.success && bridgeRes.profile) {
        bridgeProfile = bridgeRes.profile;
      }
    }

    const cleanVal = (val?: string | null) => (val && val !== '-' ? val : '');

    return NextResponse.json({
      success: true,
      data: {
        isRegistrationOpen,
        isUploadWindowOpen,
        isHasilPublished: Boolean(activePeriode?.hasil_dipublikasi),
        closedMessage,
        uploadWindowMessage,
        uploadTimelineInfo,
        student: {
          id_user: user.id_user,
          id_mahasiswa: mhs.id_mahasiswa,
          nim: user.nim || bridgeProfile?.nim || '',
          nama: user.nama || bridgeProfile?.nama || '',
          email: user.email || bridgeProfile?.email || '',
          no_hp: cleanVal(lastPendaftaran?.no_hp) || cleanVal(bridgeProfile?.no_hp),
          jenis_kelamin:
            lastPendaftaran?.jenis_kelamin ||
            bridgeProfile?.jenis_kelamin ||
            'P',
          tempat_lahir:
            cleanVal(lastPendaftaran?.tempat_lahir) ||
            cleanVal(bridgeProfile?.tempat_lahir),
          tanggal_lahir: lastPendaftaran?.tanggal_lahir
            ? new Date(lastPendaftaran.tanggal_lahir).toISOString().split('T')[0]
            : bridgeProfile?.tanggal_lahir || '',
          asal_sekolah: cleanVal(lastPendaftaran?.asal_sekolah),
          alamat:
            cleanVal(lastPendaftaran?.alamat) ||
            cleanVal(bridgeProfile?.alamat),
          nama_ayah:
            cleanVal(lastPendaftaran?.orang_tua?.nama_ayah) ||
            cleanVal(bridgeProfile?.nama_ayah),
          pekerjaan_ayah:
            cleanVal(lastPendaftaran?.orang_tua?.pekerjaan_ayah) ||
            cleanVal(bridgeProfile?.pekerjaan_ayah),
          nama_ibu:
            cleanVal(lastPendaftaran?.orang_tua?.nama_ibu) ||
            cleanVal(bridgeProfile?.nama_ibu),
          pekerjaan_ibu:
            cleanVal(lastPendaftaran?.orang_tua?.pekerjaan_ibu) ||
            cleanVal(bridgeProfile?.pekerjaan_ibu),
          alamat_orang_tua:
            cleanVal(lastPendaftaran?.orang_tua?.alamat_orang_tua) ||
            cleanVal(bridgeProfile?.alamat_orang_tua) ||
            cleanVal(lastPendaftaran?.alamat) ||
            cleanVal(bridgeProfile?.alamat),
          no_hp_orang_tua:
            cleanVal(lastPendaftaran?.orang_tua?.no_hp_orang_tua) ||
            cleanVal(bridgeProfile?.no_hp_orang_tua),
          id_fakultas: mhs.id_fakultas || mhs.fakultas?.id_fakultas || null,
          id_prodi: mhs.id_prodi || mhs.prodi?.id_prodi || null,
          fakultas: mhs.fakultas?.nama_fakultas || bridgeProfile?.fakultas || '',
          prodi: mhs.prodi?.nama_prodi || bridgeProfile?.prodi || '',
          semester: mhs.semester || bridgeProfile?.semester || 7,
          kelas: mhs.kelas || bridgeProfile?.kelas || 'B',
          ipk: mhs.ipk ? parseFloat(mhs.ipk.toString()) : Number(bridgeProfile?.ipk || 0),
          status_aktif: user.status !== false,
        },
        activePeriode: activePeriode
          ? {
              id_periode: activePeriode.id_periode,
              nama_periode: activePeriode.nama_periode,
              tahun: activePeriode.tahun,
              tanggal_mulai: activePeriode.tanggal_mulai,
              tanggal_selesai: activePeriode.tanggal_selesai,
              status: activePeriode.status,
              negaraList: activePeriode.periode_negara.map((pn) => ({
                id_periode_negara: pn.id_periode_negara,
                id_negara: pn.id_negara,
                nama_negara: pn.negara?.nama_negara || '',
              })),
              persyaratanList: activePeriode.persyaratan.map((p) => ({
                id_persyaratan: p.id_persyaratan,
                nama_persyaratan: p.nama_persyaratan,
                deskripsi: p.deskripsi,
                format_file: p.format_file,
                ukuran_maksimal: p.ukuran_maksimal,
                wajib: p.wajib,
              })),
            }
          : null,
        existingPendaftaran: existingPendaftaran
          ? {
              id_pendaftaran: existingPendaftaran.id_pendaftaran,
              jenis_kelamin: existingPendaftaran.jenis_kelamin,
              no_hp: existingPendaftaran.no_hp,
              alamat: existingPendaftaran.alamat,
              tempat_lahir: existingPendaftaran.tempat_lahir,
              tanggal_lahir: existingPendaftaran.tanggal_lahir.toISOString().split('T')[0],
              asal_sekolah: existingPendaftaran.asal_sekolah,
              total_sks: existingPendaftaran.total_sks,
              ipk: parseFloat(existingPendaftaran.ipk.toString()),
              deskripsi_diri: existingPendaftaran.deskripsi_diri,
              golongan_darah: existingPendaftaran.golongan_darah,
              riwayat_penyakit: existingPendaftaran.riwayat_penyakit || '',
              alergi: existingPendaftaran.alergi || '',
              ukuran_kaos: existingPendaftaran.ukuran_kaos,
              status_pendaftaran: existingPendaftaran.status_pendaftaran,
              id_periode_negara: existingPendaftaran.id_periode_negara,
              orang_tua: existingPendaftaran.orang_tua,
              dokumen: existingPendaftaran.dokumen_pendaftaran.map((d) => ({
                id_dokumen: d.id_dokumen,
                id_persyaratan: d.id_persyaratan,
                file_path: d.file_path,
                status: d.status,
              })),
            }
          : null,
      },
    });
  } catch (error) {
    console.error('Error in form-init API:', error);
    return NextResponse.json({ success: false, message: 'Gagal memuat inisialisasi formulir' }, { status: 500 });
  }
}
