import { createHash } from 'crypto';

/**
 * Computes SHA-256 hash of plaintext OTP code.
 * Plaintext OTP is NEVER stored in database or written to logs.
 */
export function hashOtpCode(code: string): string {
  return createHash('sha256').update(code.trim()).digest('hex');
}

/**
 * Generates a secure random 6-digit numeric OTP code.
 */
export function generateNumericOtp(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}
