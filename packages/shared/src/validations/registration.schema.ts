import { z } from 'zod';

export const GuestRegisterSchema = z.object({
  name: z.string().min(2, 'Nama minimal 2 karakter').max(100, 'Nama maksimal 100 karakter'),
  email: z.string().email('Format email tidak valid'),
  phone: z.string().min(8, 'Nomor telepon minimal 8 digit').max(20, 'Nomor telepon maksimal 20 digit'),
});

export const ReviewPaymentSchema = z.object({
  action: z.enum(['APPROVE', 'REJECT']),
  rejectionReason: z.string().optional(),
}).refine(data => {
  if (data.action === 'REJECT') {
    return Boolean(data.rejectionReason && data.rejectionReason.trim().length >= 10);
  }
  return true;
}, {
  message: 'Alasan penolakan wajib diisi minimal 10 karakter saat menolak pembayaran',
  path: ['rejectionReason'],
});

export const StaffCheckInSchema = z.object({
  ticketCode: z.string().min(1, 'Kode tiket wajib diisi'),
});

export const AttendanceVerifySchema = z.object({
  qrPayload: z.string().min(1, 'QR payload wajib ada'),
  magicToken: z.string().uuid('Format token tiket tidak valid').optional(),
  ticketCode: z.string().optional(),
}).refine(data => {
  return Boolean(data.magicToken || data.ticketCode);
}, {
  message: 'Wajib menyertakan magicToken atau ticketCode untuk identifikasi peserta',
  path: ['magicToken'],
});

export type GuestRegisterInput = z.infer<typeof GuestRegisterSchema>;
export type ReviewPaymentInput = z.infer<typeof ReviewPaymentSchema>;
export type StaffCheckInInput = z.infer<typeof StaffCheckInSchema>;
export type AttendanceVerifyInput = z.infer<typeof AttendanceVerifySchema>;
