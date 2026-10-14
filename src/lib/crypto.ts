/**
 * Web Crypto standard password hashing and token generation
 * Compatible with Node.js 18+ and Cloudflare Workers runtime
 */

export async function hashPasswordWithSalt(password: string, saltHex?: string): Promise<{ hashHex: string; saltHex: string }> {
  const enc = new TextEncoder();
  const salt = saltHex
    ? hexToBytes(saltHex)
    : globalThis.crypto.getRandomValues(new Uint8Array(16));

  const keyMaterial = await globalThis.crypto.subtle.importKey(
    'raw',
    enc.encode(password),
    { name: 'PBKDF2' },
    false,
    ['deriveBits', 'deriveKey']
  );

  const derivedBits = await globalThis.crypto.subtle.deriveBits(
    {
      name: 'PBKDF2',
      salt: salt as any,
      iterations: 100000,
      hash: 'SHA-256',
    },
    keyMaterial,
    256
  );

  return {
    hashHex: bytesToHex(new Uint8Array(derivedBits)),
    saltHex: bytesToHex(salt),
  };
}

export async function verifyPassword(password: string, storedHashHex: string, storedSaltHex: string): Promise<boolean> {
  const { hashHex } = await hashPasswordWithSalt(password, storedSaltHex);
  return timingSafeEqual(hashHex, storedHashHex);
}

export function generateSessionToken(): string {
  const bytes = new Uint8Array(32);
  globalThis.crypto.getRandomValues(bytes);
  return bytesToHex(bytes);
}

export async function hashToken(token: string): Promise<string> {
  const enc = new TextEncoder();
  const digest = await globalThis.crypto.subtle.digest('SHA-256', enc.encode(token));
  return bytesToHex(new Uint8Array(digest));
}

function bytesToHex(bytes: Uint8Array): string {
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

function hexToBytes(hex: string): Uint8Array {
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < bytes.length; i++) {
    bytes[i] = parseInt(hex.substr(i * 2, 2), 16);
  }
  return bytes;
}

function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let result = 0;
  for (let i = 0; i < a.length; i++) {
    result |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return result === 0;
}
