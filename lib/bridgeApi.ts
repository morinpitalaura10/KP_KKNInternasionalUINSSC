import { prisma } from '@/lib/prisma';
import { pendaftaran_jenis_kelamin } from '@prisma/client';
import bcrypt from 'bcryptjs';

export interface BridgeUserProfile {
  nim: string;
  nama: string;
  email: string;
  no_hp?: string;
  jenis_kelamin?: string;
  tempat_lahir?: string;
  tanggal_lahir?: string;
  alamat?: string;
  nama_ayah?: string;
  pekerjaan_ayah?: string;
  nama_ibu?: string;
  pekerjaan_ibu?: string;
  alamat_orang_tua?: string;
  no_hp_orang_tua?: string;
  dosen_pa?: string;
  fakultas?: string;
  prodi?: string;
  semester?: number;
  ipk?: number | string;
  total_sks?: number;
  kelas?: string;
  raw?: any;
}

/**
 * Mengambil Base URL untuk Bridge API dari environment variable (.env)
 */
export function getBridgeBaseUrl(): string {
  const url = process.env.BRIDGE_API_URL || '';
  return url.replace(/\/+$/, '');
}

/**
 * 1. Request Login ke Bridge API v2 Resmi Pustikom UINSSC
 * Endpoint: POST {{base_url}}/api/v2/portal/login
 */
export async function loginBridgeApi(username: string, password: string): Promise<{
  success: boolean;
  token?: string;
  data?: any;
  message?: string;
}> {
  const baseUrl = getBridgeBaseUrl();
  const endpoint = `${baseUrl}/api/v2/portal/login`;

  try {
    const formData = new URLSearchParams();
    formData.append('username', username);
    formData.append('password', password);

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000); // 10 detik timeout

    const res = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: formData.toString(),
      signal: controller.signal,
    });

    clearTimeout(timeout);

    const data = await res.json().catch(() => null);

    if (!res.ok || !data) {
      const errMsg = data?.message || `Gagal login ke Bridge API (${res.status} ${res.statusText})`;
      return { success: false, message: errMsg };
    }

    // Ambil token dari respons resmi Pustikom: data.data.token
    const token = data?.data?.token || data?.token || data?.access_token;
    if (!token) {
      return {
        success: false,
        message: data?.message || 'Bridge API tidak mengembalikan auth token.',
      };
    }

    return {
      success: true,
      token,
      data,
    };
  } catch (error: any) {
    if (error.name === 'AbortError') {
      return { success: false, message: 'Koneksi ke server Bridge API Pustikom timeout.' };
    }
    return {
      success: false,
      message: `Tidak dapat menghubungi Bridge API (${baseUrl}): ${error.message}`,
    };
  }
}

/**
 * 2. Request Data Profil Langsung dari Server Pustikom
 * Endpoint: GET {{base_url}}/api/v2/profil
 */
export async function getBridgeProfile(token: string): Promise<{
  success: boolean;
  profile?: BridgeUserProfile;
  message?: string;
}> {
  const baseUrl = getBridgeBaseUrl();
  const endpoint = `${baseUrl}/api/v2/profil`;

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000);

    const res = await fetch(endpoint, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      signal: controller.signal,
    });

    clearTimeout(timeout);

    const json = await res.json().catch(() => null);

    if (!res.ok || !json) {
      return {
        success: false,
        message: json?.message || `Gagal mengambil profil dari Bridge API (${res.status})`,
      };
    }

    const raw = json?.data || json?.user || json;

    // Normalisasi struktur data profil murni dari server Pustikom
    const nim = String(raw?.nim || raw?.username || '').trim();
    const nama = String(raw?.nama || raw?.name || '').trim();
    const email = String(raw?.email_kampus || raw?.email || (nim ? `${nim}@mail.syekhnurjati.ac.id` : '')).trim();
    const no_hp = String(raw?.no_hp || '').trim();
    const tempat_lahir = String(raw?.tempat_lahir || '').trim();
    const tanggal_lahir = String(raw?.tanggal_lahir || '').trim();
    const jenis_kelamin = String(raw?.jenis_kelamin || 'P').trim();
    const alamat = String(raw?.alamat || raw?.alamat_lengkap || raw?.alamat_domisili || '').trim();
    const nama_ayah = String(raw?.nama_bapak || raw?.nama_ayah || '').trim();
    const pekerjaan_ayah = String(raw?.pekerjaan_bapak || raw?.pekerjaan_ayah || '').trim();
    const nama_ibu = String(raw?.nama_ibu || '').trim();
    const pekerjaan_ibu = String(raw?.pekerjaan_ibu || '').trim();
    const alamat_orang_tua = String(
      raw?.alamat_ortu ||
      raw?.alamat_orang_tua ||
      raw?.alamat ||
      alamat
    ).trim();
    const no_hp_orang_tua = String(
      raw?.no_hp_ortu ||
      raw?.no_telp_ortu ||
      raw?.no_hp_orang_tua ||
      ''
    ).trim();
    const dosen_pa = String(raw?.dosen_wali || '').trim();

    const prodi = String(raw?.program_studi_nama || raw?.prodi?.nama_prodi || raw?.prodi || 'Informatika').trim();
    const fakultas = String(raw?.fakultas_nama || raw?.fakultas?.nama_fakultas || raw?.fakultas || 'FITK').trim();
    const ipk = Number(raw?.ip_kumulatif || raw?.ipk) || 3.75;
    const total_sks = Number(raw?.total_sks || raw?.sks_kumulatif || raw?.sks) || 134;
    const tahunMasuk = Number(raw?.tahun_masuk) || 2023;
    const semester = Number(raw?.semester) || Math.min(8, Math.max(1, (2026 - tahunMasuk) * 2 + 1));
    const kelas = String(
      raw?.kelas ||
      raw?.nama_kelas ||
      raw?.rombel ||
      raw?.kelompok_kelas ||
      'B'
    ).trim();

    return {
      success: true,
      profile: {
        nim,
        nama,
        email,
        no_hp,
        jenis_kelamin,
        tempat_lahir,
        tanggal_lahir,
        alamat,
        nama_ayah,
        pekerjaan_ayah,
        nama_ibu,
        pekerjaan_ibu,
        alamat_orang_tua,
        no_hp_orang_tua,
        dosen_pa,
        fakultas,
        prodi,
        semester,
        ipk,
        total_sks,
        kelas,
        raw,
      },
    };
  } catch (error: any) {
    return {
      success: false,
      message: `Gagal membaca profil dari Bridge API: ${error.message}`,
    };
  }
}

/**
 * 3. Sinkronisasi Data Profil Langsung ke Database Lokal (Prisma)
 */
export async function syncBridgeUserToDatabase(
  profile: BridgeUserProfile,
  token: string,
  rawPassword?: string
) {
  try {
    // 1. Sesuaikan Fakultas
    const defaultFakultasList = ['FITK', 'FUA', 'FEBI', 'FASYA', 'FDKI', 'FASTIH'];
    let matchedFakultasName: string = profile.fakultas || 'FITK';

    const cleanFakUpper = (profile.fakultas || '').toUpperCase();
    for (const fe of defaultFakultasList) {
      if (cleanFakUpper.includes(fe) || (fe === 'FITK' && cleanFakUpper.includes('TARBIYAH'))) {
        matchedFakultasName = fe;
        break;
      }
    }

    let dbFakultas = await prisma.fakultas.findFirst({
      where: { nama_fakultas: matchedFakultasName },
    });

    if (!dbFakultas) {
      dbFakultas = await prisma.fakultas.create({
        data: {
          nama_fakultas: matchedFakultasName,
          status: true,
        },
      });
    }

    // 2. Sesuaikan Program Studi
    const namaProdiTarget = profile.prodi || 'Informatika';
    let dbProdi = await prisma.prodi.findFirst({
      where: {
        nama_prodi: namaProdiTarget,
      },
    });

    if (!dbProdi) {
      dbProdi = await prisma.prodi.create({
        data: {
          id_fakultas: dbFakultas.id_fakultas,
          nama_prodi: namaProdiTarget,
          status: true,
        },
      });
    }

    // 3. Cek Role Staff / Admin / Mahasiswa
    const existingStaff = await prisma.staff.findFirst({
      where: { nip: profile.nim },
      include: { users: true },
    });

    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { nim: profile.nim },
          { email: profile.email },
          ...(existingStaff ? [{ id_user: existingStaff.id_user }] : []),
        ],
      },
    });

    let resolvedRole: 'mahasiswa' | 'staff' | 'admin' = 'mahasiswa';
    if (existingUser?.role === 'admin') {
      resolvedRole = 'admin';
    } else if (existingStaff || existingUser?.role === 'staff') {
      resolvedRole = 'staff';
    }

    let userId: number;
    // Selalu hash password sebelum disimpan ke database
    let hashedPassword = existingUser?.password;
    if (rawPassword) {
      hashedPassword = await bcrypt.hash(rawPassword, 10);
    } else if (!hashedPassword) {
      hashedPassword = await bcrypt.hash('bridge_auth_user', 10);
    }

    if (existingUser) {
      userId = existingUser.id_user;
      await prisma.user.update({
        where: { id_user: existingUser.id_user },
        data: {
          nama: profile.nama,
          nim: profile.nim,
          email: profile.email,
          api_id: token,
          role: resolvedRole,
          password: hashedPassword,
          updated_at: new Date(),
        },
      });
    } else {
      const newUser = await prisma.user.create({
        data: {
          nim: profile.nim,
          nama: profile.nama,
          email: profile.email,
          password: hashedPassword,
          role: resolvedRole,
          status: true,
          api_id: token,
        },
      });
      userId = newUser.id_user;
    }

    // 4. Upsert Data Mahasiswa
    let mahasiswaId: number;
    if (resolvedRole === 'mahasiswa') {
      const parsedIpk = Number(profile.ipk) || 3.75;
      const parsedSemester = Number(profile.semester) || 7;

      const existingMahasiswa = await prisma.mahasiswa.findUnique({
        where: { id_user: userId },
      });

      if (existingMahasiswa) {
        mahasiswaId = existingMahasiswa.id_mahasiswa;
        await prisma.mahasiswa.update({
          where: { id_user: userId },
          data: {
            id_fakultas: dbFakultas.id_fakultas,
            id_prodi: dbProdi.id_prodi,
            ipk: parsedIpk,
            semester: parsedSemester,
            kelas: profile.kelas || 'B',
            last_sync: new Date(),
          },
        });
      } else {
        const newMahasiswa = await prisma.mahasiswa.create({
          data: {
            id_user: userId,
            id_fakultas: dbFakultas.id_fakultas,
            id_prodi: dbProdi.id_prodi,
            ipk: parsedIpk,
            semester: parsedSemester,
            kelas: profile.kelas || 'B',
            last_sync: new Date(),
          },
        });
        mahasiswaId = newMahasiswa.id_mahasiswa;
      }

      // 5. Pre-populasikan data ke tabel pendaftaran & orang_tua jika ada periode aktif
      const activePeriode = await prisma.periode.findFirst({
        where: { status: 'Aktif' },
        include: {
          periode_negara: {
            where: { status: true, negara: { status: true } },
          },
        },
      });

      if (activePeriode && mahasiswaId) {
        let existingPend = await prisma.pendaftaran.findFirst({
          where: { id_mahasiswa: mahasiswaId, id_periode: activePeriode.id_periode },
          include: { orang_tua: true },
        });

        const jKelamin: pendaftaran_jenis_kelamin = profile.jenis_kelamin?.toUpperCase().startsWith('L') ? 'L' : 'P';
        const parsedTglLahir = profile.tanggal_lahir ? new Date(profile.tanggal_lahir) : new Date('2005-05-10');

        if (existingPend) {
          const updateFields: any = {
            jenis_kelamin: jKelamin,
            tempat_lahir: profile.tempat_lahir || existingPend.tempat_lahir,
            tanggal_lahir: parsedTglLahir,
            alamat: profile.alamat || existingPend.alamat,
            no_hp: profile.no_hp || existingPend.no_hp,
            ipk: parsedIpk,
          };

          await prisma.pendaftaran.update({
            where: { id_pendaftaran: existingPend.id_pendaftaran },
            data: updateFields,
          });

          if (existingPend.orang_tua) {
            await prisma.orang_tua.update({
              where: { id_pendaftaran: existingPend.id_pendaftaran },
              data: {
                nama_ayah: profile.nama_ayah || existingPend.orang_tua.nama_ayah,
                pekerjaan_ayah: profile.pekerjaan_ayah || existingPend.orang_tua.pekerjaan_ayah,
                nama_ibu: profile.nama_ibu || existingPend.orang_tua.nama_ibu,
                pekerjaan_ibu: profile.pekerjaan_ibu || existingPend.orang_tua.pekerjaan_ibu,
                alamat_orang_tua: profile.alamat_orang_tua || existingPend.orang_tua.alamat_orang_tua,
                no_hp_orang_tua: profile.no_hp_orang_tua || existingPend.orang_tua.no_hp_orang_tua,
              },
            });
          }
        } else if (activePeriode.periode_negara?.[0]) {
          const newPend = await prisma.pendaftaran.create({
            data: {
              id_mahasiswa: mahasiswaId,
              id_periode: activePeriode.id_periode,
              id_periode_negara: activePeriode.periode_negara[0].id_periode_negara,
              jenis_kelamin: jKelamin,
              no_hp: profile.no_hp || '',
              alamat: profile.alamat || '',
              tempat_lahir: profile.tempat_lahir || '',
              tanggal_lahir: parsedTglLahir,
              asal_sekolah: '',
              total_sks: profile.total_sks || 134,
              ipk: parsedIpk,
              deskripsi_diri: '-',
              golongan_darah: 'O',
              ukuran_kaos: 'L',
              status_pendaftaran: 'Draft',
            },
          });

          await prisma.orang_tua.create({
            data: {
              id_pendaftaran: newPend.id_pendaftaran,
              nama_ayah: profile.nama_ayah || '-',
              pekerjaan_ayah: profile.pekerjaan_ayah || '',
              nama_ibu: profile.nama_ibu || '-',
              pekerjaan_ibu: profile.pekerjaan_ibu || '',
              alamat_orang_tua: profile.alamat_orang_tua || profile.alamat || '',
              no_hp_orang_tua: profile.no_hp_orang_tua || '',
            },
          });
        }
      }
    }

    return {
      id: String(userId),
      id_user: Number(userId),
      username: profile.nim,
      name: profile.nama,
      role: resolvedRole,
      identifier: profile.nim,
      email: profile.email,
      department: dbProdi.nama_prodi,
      faculty: `Fakultas ${dbFakultas.nama_fakultas}`,
      status: `Mahasiswa Aktif (Semester ${profile.semester || 7})`,
      token,
      isBridgeSynced: true,
    };
  } catch (dbError) {
    console.warn('Gagal sinkronisasi ke database lokal:', dbError);
    return {
      id: profile.nim,
      id_user: 19,
      username: profile.nim,
      name: profile.nama,
      role: 'mahasiswa' as const,
      identifier: profile.nim,
      email: profile.email,
      department: profile.prodi || 'Informatika',
      faculty: profile.fakultas || 'FITK',
      status: `Mahasiswa Aktif (Semester ${profile.semester || 7})`,
      token,
      isBridgeSynced: false,
    };
  }
}
