import { z } from 'zod';

const booleanPreprocessor = (val: unknown) => {
  if (typeof val === 'string') {
    if (val.toLowerCase() === 'true') return true;
    if (val.toLowerCase() === 'false') return false;
  }
  return val;
};

export const CreateEventSchema = z.object({
  title: z.string().min(3, 'Judul event minimal 3 karakter').max(200, 'Judul event maksimal 200 karakter'),
  description: z.string().min(10, 'Deskripsi minimal 10 karakter'),
  bannerUrl: z.string().optional().nullable(),
  isPaid: z.preprocess(booleanPreprocessor, z.boolean().default(false)),
  price: z.coerce.number().min(0, 'Harga tidak boleh negatif').default(0),
  bankName: z.string().optional().nullable(),
  bankAccountNumber: z.string().optional().nullable(),
  bankAccountHolder: z.string().optional().nullable(),
  maxParticipants: z.coerce.number().int().min(0, 'Kapasitas minimal 0 (0 = unlimited)').default(0),
  registrationDeadline: z.coerce.date(),
  eventStartDate: z.coerce.date(),
  eventEndDate: z.coerce.date(),
  location: z.string().min(3, 'Lokasi minimal 3 karakter'),
  attendanceEnabled: z.preprocess(booleanPreprocessor, z.boolean().default(true)),
  isPublished: z.preprocess(booleanPreprocessor, z.boolean().default(false)),
}).refine(data => {
  if (data.isPaid) {
    return Boolean(data.price > 0 && data.bankName && data.bankAccountNumber && data.bankAccountHolder);
  }
  return true;
}, {
  message: 'Event berbayar wajib menyertakan harga > 0 dan informasi rekening lengkap (Bank, No. Rekening, Atas Nama)',
  path: ['bankName'],
}).refine(data => {
  return data.eventEndDate > data.eventStartDate;
}, {
  message: 'Waktu selesai event harus setelah waktu mulai event',
  path: ['eventEndDate'],
}).refine(data => {
  return data.registrationDeadline <= data.eventStartDate;
}, {
  message: 'Batas akhir pendaftaran tidak boleh melewati tanggal mulai event',
  path: ['registrationDeadline'],
});

export const UpdateEventSchema = z.object({
  title: z.string().min(3, 'Judul event minimal 3 karakter').max(200, 'Judul event maksimal 200 karakter').optional(),
  description: z.string().min(10, 'Deskripsi minimal 10 karakter').optional(),
  bannerUrl: z.string().optional().nullable(),
  isPaid: z.preprocess(booleanPreprocessor, z.boolean().optional()),
  price: z.coerce.number().min(0, 'Harga tidak boleh negatif').optional(),
  bankName: z.string().optional().nullable(),
  bankAccountNumber: z.string().optional().nullable(),
  bankAccountHolder: z.string().optional().nullable(),
  maxParticipants: z.coerce.number().int().min(0, 'Kapasitas minimal 0 (0 = unlimited)').optional(),
  registrationDeadline: z.coerce.date().optional(),
  eventStartDate: z.coerce.date().optional(),
  eventEndDate: z.coerce.date().optional(),
  location: z.string().min(3, 'Lokasi minimal 3 karakter').optional(),
  attendanceEnabled: z.preprocess(booleanPreprocessor, z.boolean().optional()),
  isPublished: z.preprocess(booleanPreprocessor, z.boolean().optional()),
});

export type CreateEventInput = z.infer<typeof CreateEventSchema>;
export type UpdateEventInput = z.infer<typeof UpdateEventSchema>;
