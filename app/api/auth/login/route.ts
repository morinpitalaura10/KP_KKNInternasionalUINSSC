import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { loginBridgeApi, getBridgeProfile, syncBridgeUserToDatabase } from '@/lib/bridgeApi';
import { getClientIp, checkBruteForce, recordFailedAttempt, resetBruteForce } from '@/lib/rateLimiter';
import bcrypt from 'bcryptjs';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { username, password } = body;

    if (!username || !password || !String(username).trim() || !String(password).trim()) {
      return NextResponse.json(
        { success: false, message: 'Username dan password wajib diisi!' },
        { status: 400 }
      );
    }

    // Tolak input berspasi (tidak di-trim diam-diam agar kredensial harus persis sama)
    if (/\s/.test(String(username))) {
      return NextResponse.json(
        { success: false, field: 'username', message: 'Username / NIM tidak boleh mengandung spasi!' },
        { status: 400 }
      );
    }

    if (String(password) !== String(password).trim()) {
      return NextResponse.json(
        { success: false, field: 'password', message: 'Password tidak boleh diawali atau diakhiri spasi!' },
        { status: 400 }
      );
    }

    // Username bersifat case-sensitive: huruf kapital tidak diterima
    if (/[A-Z]/.test(String(username))) {
      return NextResponse.json(
        { success: false, field: 'username', message: 'Username / NIM tidak boleh menggunakan huruf kapital!' },
        { status: 400 }
      );
    }

    const cleanInput = String(username);
    const cleanPassword = String(password);
    const clientIp = getClientIp(req);
    const ipIdentifier = `ip_${clientIp}`;
    const userIdentifier = `user_${cleanInput}`;

    // 0. Pengecekan Brute Force Protection (Blokir 30 detik jika salah 5x)
    const ipLock = checkBruteForce(ipIdentifier);
    const userLock = checkBruteForce(userIdentifier);
    const activeLock = ipLock.isLocked ? ipLock : userLock.isLocked ? userLock : null;

    if (activeLock) {
      return NextResponse.json(
        {
          success: false,
          isLocked: true,
          remainingSeconds: activeLock.remainingSeconds,
          attempts: activeLock.attempts,
          field: 'all',
          message: `Terlalu banyak percobaan login gagal (5 kali). Akses Anda diblokir sementara selama ${activeLock.remainingSeconds} detik demi keamanan.`,
        },
        { status: 429 }
      );
    }

    // Helper untuk mencatat percobaan gagal dan mengembalikan response lockout
    const handleLoginFailure = (field: 'username' | 'password' | 'all', errorDetail: string) => {
      const ipResult = recordFailedAttempt(ipIdentifier);
      const userResult = recordFailedAttempt(userIdentifier);
      const failureResult = ipResult.isLocked ? ipResult : userResult;

      if (failureResult.isLocked) {
        return NextResponse.json(
          {
            success: false,
            isLocked: true,
            remainingSeconds: failureResult.remainingSeconds,
            attempts: failureResult.attempts,
            field: 'all',
            message: `Terlalu banyak percobaan login gagal (5 kali berturut-turut). Akun Anda diblokir sementara selama ${failureResult.remainingSeconds} detik demi keamanan.`,
          },
          { status: 429 }
        );
      }

      return NextResponse.json(
        {
          success: false,
          field,
          attempts: failureResult.attempts,
          attemptsLeft: failureResult.attemptsLeft,
          message: `${errorDetail} (Percobaan gagal ke-${failureResult.attempts} dari 5)`,
        },
        { status: 401 }
      );
    };

    // 1. Coba verifikasi user di database lokal terlebih dahulu (untuk admin, staff, atau mahasiswa lokal)
    let localUser = null;
    let candidatesFound = 0;
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const orConditions: any[] = [
        { email: cleanInput },
        { email: cleanInput.replace('@', '@mail.') },
        { email: cleanInput.replace('@mail.', '@') },
        { nim: cleanInput },
        { staff: { nip: cleanInput } },
      ];

      // Jika input bukan format email (tidak mengandung '@'), cocokkan ke pola username dan domain resmi kampus
      if (!cleanInput.includes('@')) {
        orConditions.push(
          { email: `${cleanInput}@syekhnurjati.ac.id` },
          { email: `${cleanInput}@mail.syekhnurjati.ac.id` },
          { email: `staff.${cleanInput}@syekhnurjati.ac.id` },
          { email: `staff.${cleanInput}@mail.syekhnurjati.ac.id` },
          { email: `admin.${cleanInput}@syekhnurjati.ac.id` },
          { email: { startsWith: `${cleanInput}@` } },
          { email: { startsWith: `staff.${cleanInput}@` } },
          { email: { startsWith: `admin.${cleanInput}@` } }
        );
      }

      const candidates = await prisma.user.findMany({
        where: {
          OR: orConditions,
        },
        include: {
          staff: true,
          mahasiswa: {
            include: {
              fakultas: true,
              prodi: true,
            },
          },
        },
      });

      candidatesFound = candidates.length;

      // Cocokkan password dengan salah satu kandidat user yang ditemukan
      for (const candidate of candidates) {
        if (!candidate.password) continue;
        let matched = false;
        if (candidate.password === cleanPassword) {
          matched = true;
        } else {
          try {
            matched = await bcrypt.compare(cleanPassword, candidate.password);
          } catch {
            matched = false;
          }
        }
        if (matched) {
          localUser = candidate;
          break;
        }
      }
    } catch (dbErr) {
      console.warn('Catatan: Koneksi database lokal sedang offline atau lambat:', dbErr);
    }

    // Jika akun ditemukan di database lokal dan password cocok
    if (localUser) {
      // PERIKSA STATUS AKTIF AKUN: Cegah login jika user atau staff berstatus nonaktif
      const isUserActive = localUser.status === true;
      const isStaffActive = localUser.staff ? localUser.staff.status === true : true;

      if (!isUserActive || !isStaffActive) {
        return NextResponse.json(
          {
            success: false,
            field: 'inactive',
            isInactive: true,
            message: `Akun "${localUser.nama}" berstatus Nonaktif. Akses login telah ditangguhkan oleh administrator LP2M. Silakan hubungi pihak admin.`,
          },
          { status: 403 }
        );
      }

      // Login sukses: reset catatan brute force
      resetBruteForce(ipIdentifier);
      resetBruteForce(userIdentifier);

      const safeUser = {
        id: String(localUser.id_user),
        id_user: localUser.id_user,
        username: localUser.nim || localUser.email.split('@')[0],
        name: localUser.nama,
        role: localUser.role,
        identifier: localUser.nim || localUser.staff?.nip || String(localUser.id_user),
        email: localUser.email,
        department:
          localUser.mahasiswa?.prodi?.nama_prodi ||
          (localUser.role === 'staff'
            ? 'Panitia / Reviewer KKN Internasional'
            : 'Pusat Teknologi & Layanan LP2M'),
        faculty: localUser.mahasiswa?.fakultas
          ? `Fakultas ${localUser.mahasiswa.fakultas.nama_fakultas}`
          : localUser.role === 'staff'
          ? 'LP2M UINSSC'
          : 'UIN Siber Syekh Nurjati Cirebon',
        status:
          localUser.role === 'mahasiswa'
            ? `Mahasiswa Aktif (Semester ${localUser.mahasiswa?.semester || 7})`
            : localUser.role === 'staff'
            ? 'Staff Dosen / Penilai Berkas'
            : 'Administrator Utama System',
      };

      const response = NextResponse.json({
        success: true,
        user: safeUser,
        message: 'Login berhasil (Akun Lokal/Sistem)!',
      });

      // Set cookie sesi
      response.cookies.set('user_role', safeUser.role, {
        path: '/',
        httpOnly: false,
        sameSite: 'lax',
        maxAge: 60 * 60 * 24, // 24 jam
      });

      response.cookies.set('user_session', JSON.stringify({ id: safeUser.id, role: safeUser.role, name: safeUser.name }), {
        path: '/',
        httpOnly: false,
        sameSite: 'lax',
        maxAge: 60 * 60 * 24,
      });

      return response;
    }

    // 2. Jika akun belum terdaftar di lokal ATAU bukan akun khusus admin/staff,
    // Hubungi Bridge API v2 (eCampuz / SIAKAD Portal Kampus)
    console.log(`[Bridge Auth] Mencoba verifikasi ke Bridge API untuk kredensial: ${cleanInput}`);
    const bridgeAuth = await loginBridgeApi(String(username), cleanPassword);

    if (bridgeAuth.success && bridgeAuth.token) {
      // Login sukses: reset catatan brute force
      resetBruteForce(ipIdentifier);
      resetBruteForce(userIdentifier);

      console.log(`[Bridge Auth] Login sukses di Bridge API! Mengambil profil...`);
      // Ambil data profil mahasiswa dari endpoint GET /api/v2/profil
      const profileRes = await getBridgeProfile(bridgeAuth.token);

      const profileData = profileRes.success && profileRes.profile
        ? profileRes.profile
        : {
            nim: String(username).trim(),
            nama: `Mahasiswa (${username})`,
            email: `${username}@syekhnurjati.ac.id`,
            fakultas: 'FITK',
            prodi: 'Tadris Bahasa Inggris',
            semester: 7,
            ipk: 3.75,
            kelas: 'Reguler',
          };

      // Sinkronkan data ke tabel users & mahasiswa di database lokal
      const safeUser = await syncBridgeUserToDatabase(profileData, bridgeAuth.token, cleanPassword);

      const response = NextResponse.json({
        success: true,
        user: safeUser,
        token: bridgeAuth.token,
        message: 'Login berhasil via Bridge API (Data mahasiswa otomatis tersinkron)!',
      });

      response.cookies.set('user_role', safeUser.role, {
        path: '/',
        httpOnly: false,
        sameSite: 'lax',
        maxAge: 60 * 60 * 24,
      });

      response.cookies.set('user_session', JSON.stringify({ id: safeUser.id, role: safeUser.role, name: safeUser.name }), {
        path: '/',
        httpOnly: false,
        sameSite: 'lax',
        maxAge: 60 * 60 * 24,
      });

      response.cookies.set('bridge_token', bridgeAuth.token, {
        path: '/',
        httpOnly: true,
        sameSite: 'lax',
        maxAge: 60 * 60 * 24,
      });

      return response;
    }

    // 3. Jika user ada di database lokal tapi password salah
    if (candidatesFound > 0) {
      return handleLoginFailure('password', 'Password yang Anda masukkan salah. Silakan periksa kembali!');
    }

    // 4. Jika gagal di kedua tempat
    let errorDetail = 'Username atau NIM tidak ditemukan dalam sistem maupun portal kampus!';
    let errorField: 'username' | 'password' | 'all' = 'username';

    if (bridgeAuth.message) {
      const lowerBridge = bridgeAuth.message.toLowerCase();
      if (lowerBridge.includes('password') || lowerBridge.includes('kata sandi')) {
        errorDetail = 'Password yang Anda masukkan tidak sesuai dengan akun portal kampus!';
        errorField = 'password';
      } else if (lowerBridge.includes('tidak terdaftar') || lowerBridge.includes('not found') || lowerBridge.includes('tidak ditemukan')) {
        errorDetail = 'Username atau NIM tidak terdaftar di sistem portal kampus!';
        errorField = 'username';
      } else {
        errorDetail = `Kredensial tidak valid (${bridgeAuth.message})`;
        errorField = 'all';
      }
    }

    return handleLoginFailure(errorField, errorDetail);
  } catch (error: unknown) {
    console.error('API Login Error:', error);
    return NextResponse.json(
      {
        success: false,
        message: (error as Error)?.message || 'Terjadi kesalahan pada server saat mencoba login.',
      },
      { status: 500 }
    );
  }
}

