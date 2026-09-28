/**
 * Client-Side Cryptographic Hashing Engine
 * Implements standard SHA-256 using the native Web Cryptography API
 */

export async function calculateBufferHash(buffer: ArrayBuffer): Promise<string> {
  const hashBuffer = await crypto.subtle.digest('SHA-256', buffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

export async function calculateFileHash(file: File): Promise<string> {
  const arrayBuffer = await file.arrayBuffer();
  return calculateBufferHash(arrayBuffer);
}

export async function calculateTextHash(text: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(text);
  return calculateBufferHash(data.buffer as ArrayBuffer);
}

export function formatHash(hash: string, previewLength: number = 16): string {
  if (!hash) return '';
  if (hash.length <= previewLength) return hash;
  return `${hash.slice(0, previewLength / 2)}...${hash.slice(-previewLength / 2)}`;
}
