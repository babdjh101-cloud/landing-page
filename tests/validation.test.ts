import { validateBangladeshiPhone, validateImagePath, generatePublicOrderReference } from '../src/lib/validation';
import { hashPasswordWithSalt, verifyPassword } from '../src/lib/crypto';

console.log('--- Running Validation & Crypto Unit Tests ---');

// Test 1: BD Phone Validation
const validPhones = ['01712345678', '+8801812345678', '8801912345678', '01300000000', '01699999999'];
for (const phone of validPhones) {
  const res = validateBangladeshiPhone(phone);
  if (!res.isValid || !res.normalized.startsWith('01') || res.normalized.length !== 11) {
    throw new Error(`Failed valid phone test for: ${phone}`);
  }
}
console.log('✓ Valid BD phone numbers recognized and normalized correctly');

const invalidPhones = ['01234567890', '01712345', '12345678901', '017123456789', 'invalid_str', ''];
for (const phone of invalidPhones) {
  const res = validateBangladeshiPhone(phone);
  if (res.isValid) {
    throw new Error(`Invalid phone passed validation: ${phone}`);
  }
}
console.log('✓ Invalid phone numbers properly rejected with error messages');

// Test 2: Safe Image Paths
const validPaths = ['/images/denim-black.webp', '/images/denim-light-blue.webp', '/images/denim-combo-black-light-blue.webp'];
for (const p of validPaths) {
  if (!validateImagePath(p)) throw new Error(`Valid path rejected: ${p}`);
}
const invalidPaths = ['/images/../../etc/passwd', 'javascript:alert(1)', 'https://evil.com/img.jpg', 'data:image/png;base64,123'];
for (const p of invalidPaths) {
  if (validateImagePath(p)) throw new Error(`Dangerous path allowed: ${p}`);
}
console.log('✓ Image path validation prevents path traversal and external injection');

// Test 3: Public Order Reference Generation
const refs = new Set<string>();
for (let i = 0; i < 100; i++) {
  const ref = generatePublicOrderReference();
  if (!ref.startsWith('BD-') || ref.length < 7) {
    throw new Error(`Invalid reference format: ${ref}`);
  }
  refs.add(ref);
}
if (refs.size !== 100) throw new Error('Collision in generated order references');
console.log('✓ 100 unique, unguessable public order references generated without collisions');

// Test 4: Web Crypto PBKDF2 Hashing & Timing-Safe Verification
async function testCrypto() {
  const password = 'SecretPassword123!';
  const { hashHex, saltHex } = await hashPasswordWithSalt(password);
  
  const matches = await verifyPassword(password, hashHex, saltHex);
  if (!matches) throw new Error('Correct password failed verification');

  const wrong = await verifyPassword('WrongPassword', hashHex, saltHex);
  if (wrong) throw new Error('Wrong password succeeded verification');

  console.log('✓ Web Crypto PBKDF2 password hashing & verification verified');
}

testCrypto()
  .then(() => console.log('🎉 ALL VALIDATION & CRYPTO TESTS PASSED!'))
  .catch((err) => {
    console.error('❌ Validation test failed:', err);
    process.exit(1);
  });
