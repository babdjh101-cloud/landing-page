/**
 * Validation utilities for Bangladeshi Denim E-Commerce
 */

/**
 * Validates Bangladeshi mobile phone numbers.
 * Valid prefixes: 013, 014, 015, 016, 017, 018, 019
 * Supports: 01XXXXXXXXX, +8801XXXXXXXXX, 8801XXXXXXXXX
 */
export function validateBangladeshiPhone(phone: string): { isValid: boolean; normalized: string; error?: string } {
  if (!phone || typeof phone !== 'string') {
    return { isValid: false, normalized: '', error: 'ফোন নম্বর প্রদান করা আবশ্যক' };
  }

  // Strip spaces, dashes, parentheses
  const cleaned = phone.replace(/[\s\-()]/g, '');

  // Regex pattern for BD numbers: optional +88 or 88, followed by 01, operator digit 3-9, and 8 digits
  const bdPhoneRegex = /^(?:\+?88)?(01[3-9]\d{8})$/;
  const match = cleaned.match(bdPhoneRegex);

  if (!match) {
    return {
      isValid: false,
      normalized: '',
      error: 'সঠিক ১১ ডিজিটের বাংলাদেশী মোবাইল নম্বর দিন (যেমন: 017XXXXXXXX)'
    };
  }

  return {
    isValid: true,
    normalized: match[1] // Canonical 11-digit format starting with 01
  };
}

/**
 * Validates image path to prevent directory traversal or unsafe external loads.
 */
export function validateImagePath(imagePath: string): boolean {
  if (!imagePath || typeof imagePath !== 'string') return false;
  // Disallow path traversal '..' or protocols like javascript:
  if (imagePath.includes('..') || imagePath.includes('javascript:') || imagePath.includes('data:')) {
    return false;
  }
  // Must be a relative root path or public image
  return imagePath.startsWith('/images/') || imagePath.startsWith('/src/assets/images/');
}

/**
 * Generates an unpredictable, human-readable public order reference.
 * Example: BD-9X4K2
 */
export function generatePublicOrderReference(): string {
  const chars = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ'; // base32 without ambiguous chars (0/O, 1/I)
  let ref = '';
  // Use crypto for unguessable randomness
  if (typeof globalThis !== 'undefined' && globalThis.crypto?.getRandomValues) {
    const bytes = new Uint8Array(5);
    globalThis.crypto.getRandomValues(bytes);
    for (let i = 0; i < 5; i++) {
      ref += chars[bytes[i] % chars.length];
    }
  } else {
    for (let i = 0; i < 5; i++) {
      ref += chars.charAt(Math.floor(Math.random() * chars.length));
    }
  }
  return `BD-${ref}`;
}
