/**
 * Client-side AES-256-GCM encryption for localStorage data.
 * Derives a per-user key from userId using PBKDF2.
 * Falls back to plaintext if Web Crypto is unavailable (e.g. SSR).
 */

const SALT = 'elite-action-v1' // static salt — key uniqueness comes from userId
const ITERATIONS = 100_000

async function deriveKey(userId: string): Promise<CryptoKey> {
  const enc = new TextEncoder()
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    enc.encode(userId),
    'PBKDF2',
    false,
    ['deriveKey'],
  )
  return crypto.subtle.deriveKey(
    { name: 'PBKDF2', salt: enc.encode(SALT), iterations: ITERATIONS, hash: 'SHA-256' },
    keyMaterial,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt'],
  )
}

export async function encrypt(data: string, userId: string): Promise<string> {
  try {
    const key = await deriveKey(userId)
    const iv = crypto.getRandomValues(new Uint8Array(12))
    const encoded = new TextEncoder().encode(data)
    const ciphertext = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, encoded)
    // Prefix with iv (12 bytes) for decryption
    const combined = new Uint8Array(iv.length + new Uint8Array(ciphertext).length)
    combined.set(iv)
    combined.set(new Uint8Array(ciphertext), iv.length)
    return btoa(String.fromCharCode(...combined))
  } catch {
    return data // fallback to plaintext
  }
}

export async function decrypt(encrypted: string, userId: string): Promise<string> {
  try {
    // Detect plaintext JSON (unencrypted legacy data)
    if (encrypted.startsWith('{') || encrypted.startsWith('[')) {
      return encrypted
    }
    const key = await deriveKey(userId)
    const combined = Uint8Array.from(atob(encrypted), c => c.charCodeAt(0))
    const iv = combined.slice(0, 12)
    const ciphertext = combined.slice(12)
    const decrypted = await crypto.subtle.decrypt({ name: 'AES-GCM', iv }, key, ciphertext)
    return new TextDecoder().decode(decrypted)
  } catch {
    // If decryption fails, it's likely legacy plaintext data
    return encrypted
  }
}
