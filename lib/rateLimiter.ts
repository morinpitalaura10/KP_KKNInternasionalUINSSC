import { NextRequest } from 'next/server';

interface BruteForceRecord {
  attempts: number;
  lockoutUntil: number; // timestamp in milliseconds
}

const MAX_ATTEMPTS = 5;
const LOCKOUT_DURATION_MS = 30 * 1000; // 30 detik

// In-memory tracker untuk brute force
const attemptStore = new Map<string, BruteForceRecord>();

export function getClientIp(req: NextRequest): string {
  const forwarded = req.headers.get('x-forwarded-for');
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }
  const realIp = req.headers.get('x-real-ip');
  if (realIp) {
    return realIp.trim();
  }
  return '127.0.0.1';
}

/**
 * Cek apakah IP atau identifier saat ini sedang dalam status terblokir (lockout).
 */
export function checkBruteForce(identifier: string): {
  isLocked: boolean;
  remainingSeconds: number;
  attempts: number;
} {
  const now = Date.now();
  const record = attemptStore.get(identifier);

  if (!record) {
    return { isLocked: false, remainingSeconds: 0, attempts: 0 };
  }

  // Jika waktu blokir masih berlaku
  if (record.lockoutUntil > now) {
    const remainingSeconds = Math.ceil((record.lockoutUntil - now) / 1000);
    return { isLocked: true, remainingSeconds, attempts: record.attempts };
  }

  // Jika masa blokir sudah habis, hapus record
  if (record.lockoutUntil !== 0 && record.lockoutUntil <= now) {
    attemptStore.delete(identifier);
    return { isLocked: false, remainingSeconds: 0, attempts: 0 };
  }

  return { isLocked: false, remainingSeconds: 0, attempts: record.attempts };
}

/**
 * Catat percobaan gagal. Jika sudah mencapai 5 kali, kunci selama 30 detik.
 */
export function recordFailedAttempt(identifier: string): {
  isLocked: boolean;
  remainingSeconds: number;
  attempts: number;
  attemptsLeft: number;
} {
  const now = Date.now();
  const record = attemptStore.get(identifier) || { attempts: 0, lockoutUntil: 0 };

  // Jika sedang terkunci
  if (record.lockoutUntil > now) {
    const remainingSeconds = Math.ceil((record.lockoutUntil - now) / 1000);
    return {
      isLocked: true,
      remainingSeconds,
      attempts: record.attempts,
      attemptsLeft: 0,
    };
  }

  // Jika periode kunci sebelumnya telah usai, mulai hitungan baru dari 1
  if (record.lockoutUntil !== 0 && record.lockoutUntil <= now) {
    record.attempts = 1;
    record.lockoutUntil = 0;
  } else {
    record.attempts += 1;
  }

  if (record.attempts >= MAX_ATTEMPTS) {
    record.lockoutUntil = now + LOCKOUT_DURATION_MS;
    attemptStore.set(identifier, record);
    return {
      isLocked: true,
      remainingSeconds: 30,
      attempts: record.attempts,
      attemptsLeft: 0,
    };
  }

  attemptStore.set(identifier, record);
  return {
    isLocked: false,
    remainingSeconds: 0,
    attempts: record.attempts,
    attemptsLeft: MAX_ATTEMPTS - record.attempts,
  };
}

/**
 * Reset catatan percobaan gagal jika login berhasil.
 */
export function resetBruteForce(identifier: string) {
  attemptStore.delete(identifier);
}
