# Implementation Plan — Conditional Ticket Generation (Pending Payment Approval)

**Tanggal**: 2026-11-22  
**Status**: ⏳ Menunggu Persetujuan Eksekusi Pengguna (Execution Freeze)  
**Referensi Aturan**: [GEMINI.md](file:///Users/md101/dev/js/event-ticketing/GEMINI.md)

---

## 1. Analisis Kebutuhan & Konteks Teknis

### 1.1 Masalah (Bug Description)
Saat ini pada event berbayar, sistem langsung men-generate `ticketCode` (misal: `EVT-202611-ABC123`) di `RegisterAttendeeUseCase` saat pendaftaran pertama kali dibuat, meskipun status registrasi masih `WAITING_PAYMENT` (belum bayar) atau `PAYMENT_SUBMITTED` (menunggu review admin). 
Dampaknya:
- Peserta langsung mendapatkan kode tiket dan QR Code gate check-in di layar sukses pendaftaran (`RegisterPage.tsx`) dan halaman tiket digital (`DigitalTicketPage.tsx`).
- Peserta dapat mencetak tiket digital padahal pembayarannya belum diverifikasi atau bahkan belum dibayar.
- Secara aturan bisnis tiket resmi, **tiket e-ticket belum sah terbit sebelum pembayaran dikonfirmasi oleh Admin**.

### 1.2 Kebutuhan Bisnis Baru
1. **Event Gratis (`isPaid = false`)**:
   - Status otomatis `CONFIRMED`.
   - `ticketCode` langsung digenerate saat registrasi (`generateTicketCode()`).
   - E-tiket resmi terbit dan email dikirim.
2. **Event Berbayar (`isPaid = true`)**:
   - Saat pendaftaran (`WAITING_PAYMENT`): `ticketCode` bernilai `null` (belum ada tiket).
   - Saat unggah bukti transfer (`PAYMENT_SUBMITTED`): `ticketCode` tetap `null`.
   - **Saat Admin menyetujui pembayaran (`APPROVE`) di `ReviewPaymentUseCase`**:
     - Sistem baru men-generate `ticketCode` resmi (`generateTicketCode()`).
     - Status registrasi berubah menjadi `CONFIRMED`.
     - Timestamp `approvedAt` dan `approvedByAdminId` dicatat.
     - Email tiket resmi berisi kode tiket dan QR code baru dikirimkan ke peserta.
   - **Saat Admin menolak pembayaran (`REJECT`)**:
     - Status menjadi `REJECTED`, `ticketCode` tetap `null`.
3. **UI/UX Peserta**:
   - Halaman registrasi sukses (`RegisterPage.tsx`) tidak menampilkan kode tiket untuk event berbayar, melainkan menampilkan instruksi pembayaran dan status "Menunggu Verifikasi Admin".
   - Halaman tiket digital (`DigitalTicketPage.tsx`) menyembunyikan QR Code gerbang dan tombol "Cetak Tiket" jika tiket belum `CONFIRMED` / `ticketCode` masih `null`. Ditampilkan banner informatif: "Tiket dan QR Code akan aktif otomatis setelah pembayaran Anda disetujui oleh admin".
   - Halaman tiket saya (`MyTicketsPage.tsx`) menampilkan badge status pembayaran tanpa menampilkan kode tiket sebelum konfirmasi.

---

## 2. Pemetaan Clean Architecture

```
[ Domain / Entities ]
  └── apps/backend/src/domain/entities/Registration.ts
      - Ubah properti `ticketCode?: string | null`
      - Method `approvePayment(adminId: string, generatedTicketCode: string): void`

[ Application / Use Cases ]
  ├── apps/backend/src/use-cases/registrations/RegisterAttendeeUseCase.ts
  │   - Hanya generate `ticketCode` jika `status === CONFIRMED` (event gratis).
  │   - Untuk event berbayar, `ticketCode` diset `null`.
  └── apps/backend/src/use-cases/registrations/ReviewPaymentUseCase.ts
      - Saat action `APPROVE`: panggil `generateTicketCode()` dan set ke registrasi.

[ Interface Adapters / Repositories & Controllers ]
  ├── apps/backend/src/repositories/PrismaRegistrationRepository.ts
  │   - Mapping `ticketCode` nullable antara Prisma Model dan Domain Entity.
  └── apps/backend/src/controllers/RegistrationController.ts & AdminRegistrationController.ts
      - Pastikan response DTO mendukung `ticketCode: string | null`.

[ Frameworks & Drivers (Prisma Database) ]
  └── apps/backend/prisma/schema.prisma
      - Ubah `ticketCode String? @unique` (nullable).
      - Migrasi Prisma: `npx prisma migrate dev --name make_ticket_code_nullable`.

[ Shared Layer (Single Source of Truth) ]
  └── packages/shared/src/types/registration.types.ts
      - Perbarui interface `IRegistration`, `ITicketDetail`, `IRegistrationListItem`: `ticketCode?: string | null`.

[ Frontend Presentation Layer ]
  ├── apps/frontend/src/components/TicketCard.tsx
  │   - Props `ticketCode?: string | null`. Jika null, tampilkan placeholder "Menunggu Konfirmasi".
  ├── apps/frontend/src/pages/public/RegisterPage.tsx
  │   - Sembunyikan kode tiket jika status bukan CONFIRMED.
  ├── apps/frontend/src/pages/attendee/DigitalTicketPage.tsx
  │   - Sembunyikan QR Code check-in gerbang dan nonaktifkan tombol cetak jika status belum CONFIRMED.
  └── apps/frontend/src/pages/attendee/MyTicketsPage.tsx
      - Tampilkan nomor tiket hanya jika sudah terbit; jika belum, tampilkan badge status pembayaran.
```

---

## 3. Kontrak API & Request/Response

### 3.1 `POST /api/events/:id/register` (Pendaftaran Event)
- **Event Gratis**:
  ```json
  {
    "success": true,
    "message": "Pendaftaran berhasil",
    "data": {
      "id": "uuid",
      "ticketCode": "EVT-202611-X8K9L2",
      "magicToken": "uuid",
      "status": "CONFIRMED"
    }
  }
  ```
- **Event Berbayar**:
  ```json
  {
    "success": true,
    "message": "Pendaftaran berhasil, silakan lakukan pembayaran",
    "data": {
      "id": "uuid",
      "ticketCode": null,
      "magicToken": "uuid",
      "status": "PAYMENT_SUBMITTED"
    }
  }
  ```

### 3.2 `PATCH /api/admin/registrations/:id/review` (Approval Pembayaran)
- **Request**:
  ```json
  {
    "action": "APPROVE"
  }
  ```
- **Response**:
  ```json
  {
    "success": true,
    "message": "Pembayaran berhasil disetujui",
    "data": {
      "id": "uuid",
      "ticketCode": "EVT-202611-P7Q3W1",
      "status": "CONFIRMED",
      "approvedAt": "2026-11-22T11:45:00.000Z"
    }
  }
  ```

---

## 4. Penanganan Security & Edge Cases
1. **Gate Check-In Keamanan**:
   Staff di pintu masuk tidak akan pernah bisa memvalidasi tiket yang belum dibayar karena `ticketCode` dan QR Code memang belum pernah diterbitkan di database maupun di HP peserta.
2. **Magic Link Aman**:
   Peserta tetap dapat mengakses `/tickets/:magicToken` untuk memantau status persetujuan pembayaran mereka, namun sistem menampilkan panel status verifikasi pembayaran tanpa QR Code.
3. **Email Tiket**:
   Email tiket e-ticket dengan QR code hanya akan dikirim saat `ticketCode` resmi ter-generate dan status `CONFIRMED`.
4. **Idempotensi**:
   Jika admin tidak sengaja melakukan review ulang, `ticketCode` yang sudah ada tidak akan di-generate ulang.

---

## 5. Rencana Pengujian
1. Test daftar event gratis: pastikan `ticketCode` terisi dan email terkirim.
2. Test daftar event berbayar: pastikan `ticketCode === null` di response dan di database.
3. Test buka tiket digital sebelum di-approve: pastikan QR code tidak muncul dan ada pesan "Menunggu Persetujuan Admin".
4. Test approve pembayaran oleh Admin: pastikan `ticketCode` ter-generate, status `CONFIRMED`, dan email tiket terkirim.
5. Jalankan `npm run type-check` dan `npm run build` di backend dan frontend.
