import crypto from 'crypto';

export function calculateSha256(content: Buffer | string): string {
  const hash = crypto.createHash('sha256');
  hash.update(content);
  return hash.digest('hex');
}

export interface VerificationResult {
  isVerified: boolean;
  status: 'VERIFIED' | 'INTEGRITY_WARNING';
  originalHash: string;
  currentHash: string;
  timestamp: string;
  message: string;
}

export function verifyDocumentIntegrity(originalHash: string, currentContent: Buffer | string): VerificationResult {
  const currentHash = calculateSha256(currentContent);
  const isMatch = originalHash.toLowerCase() === currentHash.toLowerCase();

  return {
    isVerified: isMatch,
    status: isMatch ? 'VERIFIED' : 'INTEGRITY_WARNING',
    originalHash,
    currentHash,
    timestamp: new Date().toISOString(),
    message: isMatch
      ? 'Integrity Verified: Cryptographic SHA-256 hash matches the baseline record created at upload.'
      : 'INTEGRITY WARNING: Current document hash differs from original registered seal! Document content may have been altered or corrupted.'
  };
}

export function generateCustodyVerificationToken(evidenceId: string, from: string, to: string, timestamp: string): string {
  const payload = `${evidenceId}:${from}:${to}:${timestamp}:${process.env.APP_URL || 'nyayavault'}`;
  return calculateSha256(payload).slice(0, 32);
}
