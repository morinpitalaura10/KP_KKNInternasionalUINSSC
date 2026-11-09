'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { UserAccount } from '@/lib/dummyData';
import SliderPuzzleCaptcha from '@/components/SliderPuzzleCaptcha';
import { Eye, EyeOff, ArrowLeft, CheckCircle2, AlertTriangle, Lock, X } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();

  // Form states
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isCaptchaVerified, setIsCaptchaVerified] = useState(false);

  // Status & Feedback states
  const [errorMessage, setErrorMessage] = useState('');
  const [errorField, setErrorField] = useState<'username' | 'password' | 'captcha' | 'all' | 'inactive' | ''>('');
  const [isShaking, setIsShaking] = useState(false);
  const [successUser, setSuccessUser] = useState<UserAccount | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [lockoutSeconds, setLockoutSeconds] = useState(0);
  const [statusNotification, setStatusNotification] = useState<{
    type: 'warning' | 'error' | 'info';
    title: string;
    message: string;
  } | null>(null);

  // Periksa apakah dialihkan karena akun dihapus atau dinonaktifkan
  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const statusParam = params.get('status');
      if (statusParam === 'deleted' || statusParam === 'account_deleted') {
        setStatusNotification({
          type: 'warning',
          title: 'Akun Telah Dihapus',
          message: 'Akun Anda telah berhasil dihapus dari sistem. Anda telah otomatis dikeluarkan dari sesi administrator.',
        });
      } else if (statusParam === 'inactive') {
        setStatusNotification({
          type: 'error',
          title: 'Akun Dinonaktifkan',
          message: 'Akun Anda telah dinonaktifkan oleh administrator. Anda telah otomatis keluar dari sistem.',
        });
      }
    }
  }, []);

  const triggerShake = (msg: string, field: 'username' | 'password' | 'captcha' | 'all' | 'inactive') => {
    setErrorMessage(msg);
    setErrorField(field);
    setIsShaking(true);
    setTimeout(() => setIsShaking(false), 600);
  };


  // Cek apakah ada status terblokir yang tersimpan di localStorage saat reload
  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedUntil = localStorage.getItem('login_lockout_until');
      if (storedUntil) {
        const remaining = Math.ceil((parseInt(storedUntil, 10) - Date.now()) / 1000);
        if (remaining > 0) {
          setLockoutSeconds(remaining);
        } else {
          localStorage.removeItem('login_lockout_until');
        }
      }
    }
  }, []);

  // Interval hitung mundur blokir brute force (30 detik)
  React.useEffect(() => {
    if (lockoutSeconds <= 0) return;

    const timer = setInterval(() => {
      setLockoutSeconds((prev) => {
        if (prev <= 1) {
          if (typeof window !== 'undefined') {
            localStorage.removeItem('login_lockout_until');
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [lockoutSeconds]);

  // Selalu bersihkan sesi jika berada di halaman login & kunci history agar panah (->) abu-abu
  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      // 1. Bersihkan sesi lama agar tidak bisa ditembus lewat panah browser
      localStorage.removeItem('currentUser');
      document.cookie = 'user_role=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
      document.cookie = 'user_session=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
      document.cookie = 'bridge_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';

      // 2. Kunci riwayat browser agar panah maju (->) otomatis ABU-ABU / DISABLED
      window.history.pushState(null, '', window.location.href);

      const handlePopState = () => {
        window.history.pushState(null, '', window.location.href);
      };

      window.addEventListener('popstate', handlePopState);
      return () => {
        window.removeEventListener('popstate', handlePopState);
      };
    }
  }, []);

  // Submit Handler connected to MySQL via API Route
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setErrorField('');
    setSuccessUser(null);

    // Jika sedang dalam masa penalti lockout
    if (lockoutSeconds > 0) {
      triggerShake(`Akses login Anda diblokir sementara. Harap tunggu ${lockoutSeconds} detik lagi.`, 'all');
      return;
    }

    // Validation
    if (!username.trim()) {
      triggerShake('Username / NIM tidak boleh kosong!', 'username');
      return;
    }

    if (/\s/.test(username)) {
      triggerShake('Username / NIM tidak boleh mengandung spasi!', 'username');
      return;
    }

    if (/[A-Z]/.test(username)) {
      triggerShake('Username / NIM tidak boleh menggunakan huruf kapital!', 'username');
      return;
    }

    if (!password.trim()) {
      triggerShake('Password tidak boleh kosong!', 'password');
      return;
    }

    if (password !== password.trim()) {
      triggerShake('Password tidak boleh diawali atau diakhiri spasi!', 'password');
      return;
    }

    if (!isCaptchaVerified) {
      triggerShake('Harap geser puzzle captcha untuk menyelesaikan verifikasi!', 'captcha');
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username,
          password,
        }),
      });

      const data = await res.json();

      // Tangani respon jika terblokir oleh Brute Force Protection (HTTP 429 atau isLocked)
      if (res.status === 429 || data.isLocked) {
        setIsLoading(false);
        const sec = Number(data.remainingSeconds) || 30;
        setLockoutSeconds(sec);
        if (typeof window !== 'undefined') {
          localStorage.setItem('login_lockout_until', String(Date.now() + sec * 1000));
        }
        triggerShake(data.message || `Terlalu banyak percobaan gagal (5x). Diblokir selama ${sec} detik.`, 'all');
        return;
      }

      if (res.ok && data.success && data.user) {
        setSuccessUser(data.user);
        setIsLoading(false);

        // Hapus penalti blokir jika login berhasil
        if (typeof window !== 'undefined') {
          localStorage.removeItem('login_lockout_until');
        }

        // Store active session in localStorage & cookies
        if (typeof window !== 'undefined') {
          localStorage.setItem('currentUser', JSON.stringify(data.user));
          document.cookie = `user_role=${data.user.role}; path=/; max-age=86400; SameSite=Lax`;
          document.cookie = `user_session=${encodeURIComponent(JSON.stringify(data.user))}; path=/; max-age=86400; SameSite=Lax`;
        }

        // Redirect after short delay with replace to avoid history stacking
        setTimeout(() => {
          if (data.user?.role === 'mahasiswa') {
            window.location.replace('/mahasiswa');
          } else if (data.user?.role === 'staff') {
            window.location.replace('/staff');
          } else if (data.user?.role === 'admin') {
            window.location.replace('/admin');
          }
        }, 1200);
      } else {
        setIsLoading(false);
        const targetField = (data.field as any) || (res.status === 403 ? 'inactive' : 'all');
        triggerShake(data.message || 'Login gagal. Periksa username dan password.', targetField);
      }
    } catch {
      setIsLoading(false);
      triggerShake('Tidak dapat terhubung ke database. Pastikan MySQL XAMPP aktif.', 'all');
    }
  };

  return (
    <div className="h-screen w-full flex flex-col justify-between bg-gray-100 font-sans overflow-y-auto lg:overflow-hidden">
      
      {/* Main Split Layout Container */}
      <div className="flex-1 w-full max-w-6xl mx-auto px-4 py-1.5 sm:py-2 flex items-center justify-center">
        <div className="w-full min-h-[630px] lg:min-h-[650px] bg-white rounded-2xl sm:rounded-3xl shadow-xl overflow-hidden grid grid-cols-1 md:grid-cols-2 border border-gray-200 relative">
          
          {/* ================= LEFT SIDE: GREEN HERO CARD ================= */}
          <div className="bg-[#568E7D] text-white p-8 sm:p-10 lg:p-12 flex flex-col items-center justify-center text-center relative overflow-hidden">
            {/* Soft decorative background circles */}
            <div className="absolute -top-16 -left-16 w-64 h-64 bg-white/5 rounded-full blur-2xl pointer-events-none" />
            <div className="absolute -bottom-20 -right-20 w-80 h-80 bg-black/10 rounded-full blur-2xl pointer-events-none" />

            <div className="relative z-10 flex flex-col items-center max-w-sm">
              {/* UINSSC Logo */}
              <div className="relative w-32 h-32 sm:w-40 sm:h-40 mb-5 drop-shadow-md">
                <Image
                  src="/uinssc.png"
                  alt="Logo UINSSC"
                  width={160}
                  height={160}
                  className="object-contain w-full h-full"
                  priority
                />
              </div>

              {/* Title Header */}
              <h1 className="text-lg sm:text-xl md:text-2xl font-extrabold tracking-wide uppercase leading-snug text-white font-sans">
                KULIAH KERJA NYATA INTERNASIONAL
              </h1>

              {/* Blue Highlight Line Accent */}
              <div className="w-36 sm:w-48 h-1 bg-[#42A5F5] rounded-full my-4 shadow-sm" />

              {/* Subtitle */}
              <p className="text-xs sm:text-sm font-bold tracking-wider uppercase text-white/90 leading-relaxed max-w-xs">
                UNIVERSITAS ISLAM NEGERI SIBER SYEKH NURJATI CIREBON
              </p>
            </div>
          </div>

          {/* ================= RIGHT SIDE: FORM LOGIN ================= */}
          <div className="px-6 py-7 sm:px-10 sm:py-8 flex flex-col justify-center bg-white">
            

            {/* Login Heading */}
            <div className="text-center mb-4">
              <h2 className="text-2xl sm:text-3xl font-black text-[#0E4A3E] tracking-tight uppercase">
                LOGIN
              </h2>
            </div>

            {/* Status Notification (e.g. Account Deleted / Inactive) */}
            {statusNotification && (
              <div
                className={`mb-3.5 p-3 rounded-xl border flex items-start gap-2.5 shadow-xs animate-in fade-in slide-in-from-top-2 ${
                  statusNotification.type === 'warning'
                    ? 'bg-amber-50 border-amber-300 text-amber-950'
                    : 'bg-rose-50 border-rose-300 text-rose-950'
                }`}
              >
                <div
                  className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${
                    statusNotification.type === 'warning'
                      ? 'bg-amber-100 text-amber-700 border border-amber-200'
                      : 'bg-rose-100 text-rose-700 border border-rose-200'
                  }`}
                >
                  <AlertTriangle className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0 text-left">
                  <h4 className="text-[11px] font-black uppercase tracking-wider">
                    {statusNotification.title}
                  </h4>
                  <p className="text-[11px] font-medium leading-tight mt-0.5 opacity-90">
                    {statusNotification.message}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setStatusNotification(null)}
                  className="p-1 text-slate-400 hover:text-slate-600 rounded-md transition-colors cursor-pointer"
                  title="Tutup pesan"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            {/* Success Banner if logged in */}
            {successUser && (
              <div className="mb-3 p-3 bg-emerald-50 border border-emerald-300 text-emerald-800 rounded-xl flex items-center gap-2.5 animate-fade-in shadow-xs text-xs">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                <div>
                  <p className="font-bold">Login Berhasil! Selamat datang, {successUser.name}</p>
                  <p className="text-emerald-700">Mengarahkan ke Dashboard {successUser.role.toUpperCase()}...</p>
                </div>
              </div>
            )}

            {/* Lockout Countdown Alert Banner */}
            {lockoutSeconds > 0 && (
              <div className="mb-2.5 p-2.5 bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-300 text-amber-950 rounded-xl flex items-center gap-2.5 shadow-xs animate-in fade-in">
                <div className="w-7 h-7 rounded-lg bg-amber-100 border border-amber-300 flex items-center justify-center shrink-0 text-amber-700">
                  <Lock className="w-3.5 h-3.5 animate-pulse" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h4 className="text-[11px] font-black uppercase tracking-wider text-amber-900">
                      Akses Diblokir Sementara
                    </h4>
                    <span className="bg-amber-200/90 text-amber-950 text-[10px] px-2 py-0.5 rounded-full font-mono font-bold animate-pulse">
                      {lockoutSeconds}s
                    </span>
                  </div>
                  <p className="text-[10.5px] text-amber-800 leading-tight mt-0.5 font-medium">
                    Gagal 5 kali berturut-turut. Tunggu hingga hitungan mundur selesai untuk mencoba lagi.
                  </p>
                </div>
              </div>
            )}

            {/* Modern Alert Banner */}
            {errorMessage && (
              <div className="mb-3 p-3 bg-gradient-to-r from-red-50 via-rose-50 to-orange-50 border border-red-200 text-red-900 rounded-xl flex items-start gap-2.5 shadow-xs transition-all duration-300 animate-in fade-in slide-in-from-top-2">
                <div className="w-6 h-6 rounded-lg bg-red-100 border border-red-200 flex items-center justify-center shrink-0 mt-0.5 text-red-600">
                  <AlertTriangle className="w-3.5 h-3.5" />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-[11px] font-black uppercase tracking-wider text-red-800">
                    {errorField === 'password'
                      ? 'Kata Sandi Salah'
                      : errorField === 'username'
                      ? 'Akun Tidak Ditemukan'
                      : errorField === 'captcha'
                      ? 'Verifikasi Diperlukan'
                      : errorField === 'inactive'
                      ? 'Akses Akun Dinonaktifkan'
                      : 'Kredensial Tidak Valid'}
                  </h4>
                  <p className="text-[11px] text-red-700 leading-tight font-medium">
                    {errorMessage}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setErrorMessage('');
                    setErrorField('');
                  }}
                  className="text-red-400 hover:text-red-600 transition-colors p-0.5 rounded cursor-pointer"
                  title="Tutup pesan"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className={`space-y-3.5 max-w-sm mx-auto w-full transition-all ${isShaking ? 'animate-shake' : ''}`}>
              
              {/* Field 1: Username / NIM */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-extrabold text-[#0E4A3E] text-left">
                    Username / NIM Mahasiswa
                  </label>
                  <span className="text-[9px] font-semibold text-emerald-700 bg-emerald-100 px-1.5 py-0.2 rounded-full">
                    SIAKAD Bridge API
                  </span>
                </div>
                <input
                  type="text"
                  disabled={isLoading || lockoutSeconds > 0}
                  value={username}
                  onChange={(e) => {
                    setUsername(e.target.value);
                    if (errorField === 'username' || errorField === 'all') {
                      setErrorField('');
                      setErrorMessage('');
                    }
                  }}
                  placeholder={lockoutSeconds > 0 ? "Akses login diblokir sementara..." : "Masukkan NIM atau Username portal..."}
                  className={`w-full px-4 py-2.5 rounded-full border text-gray-800 placeholder-gray-400 text-xs outline-none transition-all shadow-2xs disabled:bg-gray-100 disabled:cursor-not-allowed ${
                    errorField === 'username' || errorField === 'all'
                      ? 'border-red-400 bg-red-50/20 ring-2 ring-red-200'
                      : 'border-gray-300 focus:border-[#568E7D] focus:ring-1 focus:ring-[#568E7D]/30'
                  }`}
                />
              </div>

              {/* Field 2: Password */}
              <div>
                <label className="block text-xs font-extrabold text-[#0E4A3E] mb-1 text-left">
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    disabled={isLoading || lockoutSeconds > 0}
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      if (errorField === 'password' || errorField === 'all') {
                        setErrorField('');
                        setErrorMessage('');
                      }
                    }}
                    placeholder={lockoutSeconds > 0 ? "Terkunci sementara..." : "Masukkan password dengan benar !"}
                    className={`w-full px-4 py-2.5 pr-10 rounded-full border text-gray-800 placeholder-gray-400 text-xs outline-none transition-all shadow-2xs disabled:bg-gray-100 disabled:cursor-not-allowed ${
                      errorField === 'password' || errorField === 'all'
                        ? 'border-red-400 bg-red-50/20 ring-2 ring-red-200'
                        : 'border-gray-300 focus:border-[#568E7D] focus:ring-1 focus:ring-[#568E7D]/30'
                    }`}
                  />
                  <button
                    type="button"
                    disabled={lockoutSeconds > 0}
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none transition-colors cursor-pointer disabled:opacity-40"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Interactive Slider Puzzle Captcha */}
              <div className={`py-1 ${lockoutSeconds > 0 ? 'pointer-events-none opacity-40 select-none grayscale' : ''}`}>
                <SliderPuzzleCaptcha
                  onSuccess={() => {
                    setIsCaptchaVerified(true);
                    setErrorMessage('');
                  }}
                  onReset={() => setIsCaptchaVerified(false)}
                />
              </div>

              {/* Submit Button */}
              <div className="pt-2 text-center">
                <button
                  type="submit"
                  disabled={isLoading || lockoutSeconds > 0}
                  className="w-auto px-10 py-2.5 bg-[#0E4A3E] hover:bg-[#0a382f] text-white font-extrabold text-xs sm:text-sm rounded-full shadow-md hover:shadow-lg transition-all transform hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer inline-flex items-center justify-center gap-1.5"
                >
                  {isLoading ? (
                    'Memproses...'
                  ) : lockoutSeconds > 0 ? (
                    <>
                      <Lock className="w-3.5 h-3.5 text-amber-300" />
                      <span>Terblokir ({lockoutSeconds}s)</span>
                    </>
                  ) : (
                    'Login'
                  )}
                </button>
              </div>

              {/* Back to Home Link directly below Login button */}
              <div className="pt-1 text-center">
                <Link
                  href="/"
                  className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-[#0E4A3E] font-bold transition-colors"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Kembali ke Beranda</span>
                </Link>
              </div>
            </form>

            {/* Bottom Info Box */}
            <div className="mt-4 border border-gray-200 rounded-xl py-2.5 px-3.5 text-center max-w-sm mx-auto bg-gray-50/60">
              <p className="text-[11px] text-gray-500 font-medium leading-relaxed">
                Masukkan username dan password sesuai dengan akun akademik yang kampus sediakan!
              </p>
            </div>

          </div>

        </div>
      </div>

      {/* Footer */}
      <div className="w-full py-1.5 text-center text-[10px] text-gray-500 border-t border-gray-200 bg-white">
        © 2026 UIN Siber Syekh Nurjati Cirebon. All rights reserved.
      </div>

    </div>
  );
}
