import crypto from 'crypto';

/**
 * Generates high-entropy attendance secret for HMAC-SHA256 dynamic QR generation
 */
export const generateAttendanceSecret = (): string => {
  return crypto.randomBytes(32).toString('hex');
};
