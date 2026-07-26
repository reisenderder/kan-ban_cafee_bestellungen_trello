import { createHash } from 'crypto';

export interface DeliveryTokenData {
  tokenId: string;
  tokenHash: string;
  orderId: string;
  expiresAt: string;
}

/**
 * Generates a single-use delivery confirmation token.
 * Stores only SHA-256 hash in database for security.
 */
export function generateDeliveryToken(orderId: string): DeliveryTokenData {
  const rawToken = `${orderId}_${Date.now()}_${Math.random().toString(36).substring(2)}`;
  const tokenHash = createHash('sha256').update(rawToken).digest('hex');
  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(); // 24h TTL

  return {
    tokenId: rawToken,
    tokenHash,
    orderId,
    expiresAt,
  };
}

/**
 * Validates raw delivery token against SHA-256 hash.
 */
export function verifyDeliveryToken(rawToken: string, expectedHash: string): boolean {
  const hash = createHash('sha256').update(rawToken.trim()).digest('hex');
  return hash === expectedHash;
}
