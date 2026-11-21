import crypto from 'crypto';

/**
 * Generates unique ticket code in format: EVT-YYYYMM-XXXXXX
 * Example: EVT-202611-7K9A2F
 */
export const generateTicketCode = (date: Date = new Date()): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // alphanumeric avoiding ambiguous characters like 0, O, 1, I
  let randomPart = '';
  const bytes = crypto.randomBytes(6);
  for (let i = 0; i < 6; i++) {
    randomPart += chars[bytes[i] % chars.length];
  }
  return `EVT-${year}${month}-${randomPart}`;
};
