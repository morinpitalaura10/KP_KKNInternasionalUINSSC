/**
 * Kebijakan Password Kuat (Strong Password Policy)
 * Persyaratan:
 * 1. Panjang antara 8 hingga 16 karakter.
 * 2. Mengandung kombinasi huruf kapital (A-Z), huruf kecil (a-z), dan angka (0-9).
 */
export function validateStrongPassword(password: string): { valid: boolean; message: string } {
  if (!password || typeof password !== 'string') {
    return { valid: false, message: 'Password wajib diisi!' };
  }

  const trimmed = password.trim();

  if (trimmed.length < 8 || trimmed.length > 16) {
    return {
      valid: false,
      message: 'Password harus memiliki panjang antara 8 hingga 16 karakter (saat ini: ' + trimmed.length + ' karakter)!',
    };
  }

  if (!/[A-Z]/.test(trimmed)) {
    return {
      valid: false,
      message: 'Password harus mengandung minimal satu huruf kapital (A-Z)!',
    };
  }

  if (!/[a-z]/.test(trimmed)) {
    return {
      valid: false,
      message: 'Password harus mengandung minimal satu huruf kecil (a-z)!',
    };
  }

  if (!/[0-9]/.test(trimmed)) {
    return {
      valid: false,
      message: 'Password harus mengandung minimal satu angka (0-9)!',
    };
  }

  return { valid: true, message: 'Password memenuhi standar keamanan.' };
}
