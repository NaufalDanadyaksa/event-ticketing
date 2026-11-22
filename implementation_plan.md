# Implementation Plan — Event Ticketing & Dynamic Attendance System

**Tanggal**: 2026-11-18  
**Versi**: 1.0.0  
**Status**: ⏳ Menunggu Persetujuan Eksekusi

---

## 1. Ringkasan Kebutuhan (Overview)

Membangun sistem Event Ticketing berbasis web dengan fitur:
- **Admin** dapat membuat, mengonfigurasi, dan mengelola event (berbayar/gratis, kuota, jadwal, dll.)
- **Peserta** dapat mendaftar sebagai User (akun) maupun Guest, membayar (jika event berbayar), dan menerima tiket interaktif via email.
- **Staff** dapat memverifikasi tiket di pintu masuk venue (gate check-in) menggunakan scanner kamera.
- **Absensi Dinamis** menggunakan QR code yang berputar setiap 10 detik (HMAC-SHA256) ditampilkan di layar proyektor, lalu dipindai oleh peserta menggunakan kamera HP masing-masing.

**Stack Teknologi:**
| Layer | Teknologi |
|:---|:---|
| Monorepo | Turborepo + npm workspaces |
| Backend | Express.js + TypeScript |
| ORM | Prisma ORM |
| Database | MySQL |
| Frontend | React + Vite + Tailwind CSS |
| Auth | JWT (Access Token) |
| Email | Nodemailer (HTML Template) |
| Upload | Multer (Local Storage) |
| QR Code | qrcode (npm) + html5-qrcode (scanner) |
| Validasi | Zod |
| Type Sharing | packages/shared |

---

## 2. Arsitektur & Pemetaan Clean Architecture

### 2.1 Dependency Rule

```
packages/shared          <-- Zero dependency (tipe murni & Zod schema)
       ↑
apps/backend/domain      <-- Entitas, Domain Errors, Interface Repository (tidak import Express/Prisma)
       ↑
apps/backend/use-cases   <-- Logika bisnis, hanya import domain + shared
       ↑
apps/backend/repositories  <-- Implementasi Prisma konkrit
apps/backend/controllers   <-- HTTP Handler, import use-cases + shared
apps/backend/infrastructure  <-- Express, Nodemailer, Multer, TOTP Engine
       ↑
apps/frontend            <-- React Views, hanya import shared & panggil API
```

### 2.2 Peta Layer Backend per Fitur

| Feature Domain | Domain Entity | Use Case | Repository | Controller |
|:---|:---|:---|:---|:---|
| Auth | `User` | `RegisterUserUseCase`, `LoginUserUseCase` | `UserRepository` | `AuthController` |
| Event | `Event` | `CreateEventUseCase`, `UpdateEventUseCase`, `ListEventsUseCase`, `GetEventDetailUseCase` | `EventRepository` | `EventController`, `AdminEventController` |
| Registration | `Registration` | `RegisterAttendeeUseCase`, `UploadPaymentProofUseCase`, `ReviewPaymentUseCase` | `RegistrationRepository` | `RegistrationController`, `AdminRegistrationController` |
| Gate Check-In | `Registration` | `VerifyGateCheckInUseCase` | `RegistrationRepository` | `StaffController` |
| Attendance | `Registration` | `VerifyDynamicAttendanceUseCase`, `GetLiveAttendanceTokenUseCase` | `RegistrationRepository`, `EventRepository` | `AttendanceController` |

---

## 3. Struktur Monorepo Lengkap

```text
event-ticketing/
├── package.json
├── turbo.json
├── tsconfig.base.json
├── .env.example
├── .gitignore
│
├── packages/
│   └── shared/
│       ├── package.json
│       ├── tsconfig.json
│       └── src/
│           ├── index.ts          # Re-export semua
│           ├── types/
│           │   ├── user.types.ts
│           │   ├── event.types.ts
│           │   ├── registration.types.ts
│           │   └── attendance.types.ts
│           ├── enums/
│           │   └── index.ts      # Role, RegistrationStatus, CheckInStatus, AttendanceStatus
│           └── validations/
│               ├── auth.schema.ts
│               ├── event.schema.ts
│               └── registration.schema.ts
│
└── apps/
    ├── backend/
    │   ├── package.json
    │   ├── tsconfig.json
    │   ├── .env
    │   ├── prisma/
    │   │   ├── schema.prisma
    │   │   └── migrations/
    │   ├── uploads/
    │   │   ├── receipts/         # Bukti transfer pembayaran
    │   │   └── banners/          # Banner/poster event
    │   └── src/
    │       ├── index.ts          # Express App entry point
    │       ├── domain/
    │       │   ├── entities/
    │       │   │   ├── User.ts
    │       │   │   ├── Event.ts
    │       │   │   └── Registration.ts
    │       │   ├── errors/
    │       │   │   └── DomainErrors.ts
    │       │   └── repositories/
    │       │       ├── IUserRepository.ts
    │       │       ├── IEventRepository.ts
    │       │       └── IRegistrationRepository.ts
    │       ├── use-cases/
    │       │   ├── auth/
    │       │   │   ├── RegisterUserUseCase.ts
    │       │   │   └── LoginUserUseCase.ts
    │       │   ├── events/
    │       │   │   ├── CreateEventUseCase.ts
    │       │   │   ├── UpdateEventUseCase.ts
    │       │   │   ├── ListEventsUseCase.ts
    │       │   │   └── GetEventDetailUseCase.ts
    │       │   ├── registrations/
    │       │   │   ├── RegisterAttendeeUseCase.ts
    │       │   │   ├── UploadPaymentProofUseCase.ts
    │       │   │   └── ReviewPaymentUseCase.ts
    │       │   ├── staff/
    │       │   │   └── VerifyGateCheckInUseCase.ts
    │       │   └── attendance/
    │       │       ├── GetLiveAttendanceTokenUseCase.ts
    │       │       └── VerifyDynamicAttendanceUseCase.ts
    │       ├── repositories/
    │       │   ├── PrismaUserRepository.ts
    │       │   ├── PrismaEventRepository.ts
    │       │   └── PrismaRegistrationRepository.ts
    │       ├── controllers/
    │       │   ├── AuthController.ts
    │       │   ├── EventController.ts
    │       │   ├── RegistrationController.ts
    │       │   ├── AdminEventController.ts
    │       │   ├── AdminRegistrationController.ts
    │       │   ├── StaffController.ts
    │       │   └── AttendanceController.ts
    │       ├── middlewares/
    │       │   ├── authMiddleware.ts       # Verifikasi JWT
    │       │   ├── roleGuard.ts            # Role-based access control
    │       │   ├── uploadMiddleware.ts     # Multer konfigurasi
    │       │   └── errorHandler.ts        # Global error handler Express
    │       ├── routes/
    │       │   ├── index.ts               # Agregasi semua router
    │       │   ├── auth.routes.ts
    │       │   ├── event.routes.ts
    │       │   ├── registration.routes.ts
    │       │   ├── admin.routes.ts
    │       │   ├── staff.routes.ts
    │       │   └── attendance.routes.ts
    │       ├── services/
    │       │   ├── email/
    │       │   │   ├── EmailService.ts    # Nodemailer client & sender
    │       │   │   └── templates/
    │       │   │       └── ticket.template.ts  # HTML email ticket template
    │       │   └── qr/
    │       │       ├── QRGenerator.ts         # qrcode npm - generate static QR tiket
    │       │       └── AttendanceTokenEngine.ts # HMAC-SHA256 rotasi 10 detik
    │       ├── infrastructure/
    │       │   └── prisma.ts              # Prisma Client singleton
    │       └── utils/
    │           ├── ticketCodeGenerator.ts  # EVT-{YYYYMM}-{ALPHANUM}
    │           ├── slugGenerator.ts
    │           ├── responseHelper.ts       # Standarisasi format response JSON
    │           └── attendanceSecretGenerator.ts # crypto.randomBytes
    │
    └── frontend/
        ├── package.json
        ├── tsconfig.json
        ├── vite.config.ts
        ├── tailwind.config.ts
        └── src/
            ├── main.tsx
            ├── App.tsx             # React Router setup
            ├── layouts/
            │   ├── PublicLayout.tsx
            │   ├── AdminLayout.tsx
            │   └── StaffLayout.tsx
            ├── components/
            │   ├── ui/             # Badge, Button, Card, Input, Modal, Spinner
            │   ├── QRScanner.tsx   # html5-qrcode wrapper component
            │   ├── QRCodeDisplay.tsx
            │   ├── TicketCard.tsx
            │   ├── EventCard.tsx
            │   └── AttendanceTimer.tsx  # Progress bar countdown 10 detik
            ├── pages/
            │   ├── public/
            │   │   ├── HomePage.tsx       # Daftar event publik
            │   │   ├── EventDetailPage.tsx
            │   │   └── RegisterPage.tsx   # Form pendaftaran (User & Guest)
            │   ├── auth/
            │   │   ├── LoginPage.tsx
            │   │   └── RegisterAccountPage.tsx
            │   ├── attendee/
            │   │   ├── MyTicketsPage.tsx       # Tiket peserta (hanya user login)
            │   │   └── DigitalTicketPage.tsx   # Magic Link ticket + scanner absensi
            │   ├── admin/
            │   │   ├── DashboardPage.tsx
            │   │   ├── EventListPage.tsx
            │   │   ├── EventFormPage.tsx        # Create & Edit event
            │   │   ├── PaymentReviewPage.tsx   # Daftar & review bukti bayar
            │   │   └── VenuePresenterPage.tsx  # Layar proyektor QR dinamis 10 detik
            │   └── staff/
            │       └── GateScannerPage.tsx     # Scanner tiket pintu masuk
            ├── hooks/
            │   ├── useAuth.ts
            │   ├── useEvents.ts
            │   ├── useRegistration.ts
            │   ├── useGateScanner.ts
            │   └── useAttendanceScanner.ts
            ├── services/
            │   ├── api/
            │   │   ├── apiClient.ts        # Axios instance dengan interceptor JWT
            │   │   ├── auth.api.ts
            │   │   ├── events.api.ts
            │   │   ├── registrations.api.ts
            │   │   ├── admin.api.ts
            │   │   ├── staff.api.ts
            │   │   └── attendance.api.ts
            └── store/
                └── authStore.ts            # Zustand auth state (token, user)
```

---

## 4. Skema Database Prisma (MySQL)

```prisma
datasource db {
  provider = "mysql"
  url      = env("DATABASE_URL")
}

generator client {
  provider = "prisma-client-js"
}

enum Role {
  ADMIN
  STAFF
  USER
}

enum RegistrationStatus {
  WAITING_PAYMENT
  PAYMENT_SUBMITTED
  CONFIRMED
  REJECTED
  CANCELLED
}

enum CheckInStatus {
  NOT_CHECKED_IN
  CHECKED_IN
}

enum AttendanceStatus {
  ABSENT
  ATTENDED
}

model User {
  id            String         @id @default(uuid())
  email         String         @unique
  passwordHash  String
  name          String
  phone         String?
  role          Role           @default(USER)
  createdAt     DateTime       @default(now())
  updatedAt     DateTime       @updatedAt

  registrations Registration[]
  eventsCreated Event[]        @relation("AdminEvents")
  checkInsPerformed Registration[] @relation("StaffCheckIns")
}

model Event {
  id                   String        @id @default(uuid())
  title                String
  slug                 String        @unique
  description          String        @db.Text
  bannerUrl            String?

  isPaid               Boolean       @default(false)
  price                Decimal       @default(0.00) @db.Decimal(10, 2)
  bankName             String?
  bankAccountNumber    String?
  bankAccountHolder    String?

  maxParticipants      Int           // 0 = unlimited
  registrationDeadline DateTime
  eventStartDate       DateTime
  eventEndDate         DateTime
  location             String

  attendanceEnabled    Boolean       @default(true)
  attendanceSecret     String        // crypto.randomBytes(32).toString('hex')

  isPublished          Boolean       @default(false)

  createdById          String
  createdBy            User          @relation("AdminEvents", fields: [createdById], references: [id])
  createdAt            DateTime      @default(now())
  updatedAt            DateTime      @updatedAt

  registrations        Registration[]

  @@index([slug])
  @@index([createdById])
}

model Registration {
  id                   String              @id @default(uuid())
  ticketCode           String              @unique // EVT-202611-K9X2P4
  magicToken           String              @unique @default(uuid())

  eventId              String
  event                Event               @relation(fields: [eventId], references: [id], onDelete: Cascade)

  userId               String?
  user                 User?               @relation(fields: [userId], references: [id], onDelete: SetNull)

  name                 String
  email                String
  phone                String

  status               RegistrationStatus  @default(CONFIRMED)
  paymentProofUrl      String?
  rejectionReason      String?
  approvedAt           DateTime?
  approvedByAdminId    String?

  checkInStatus        CheckInStatus       @default(NOT_CHECKED_IN)
  checkedInAt          DateTime?
  checkedInByStaffId   String?
  checkedInByStaff     User?               @relation("StaffCheckIns", fields: [checkedInByStaffId], references: [id])

  attendanceStatus     AttendanceStatus    @default(ABSENT)
  attendedAt           DateTime?

  createdAt            DateTime            @default(now())
  updatedAt            DateTime            @updatedAt

  @@index([eventId])
  @@index([email])
  @@index([ticketCode])
  @@index([magicToken])
}
```

---

## 5. Spesifikasi API Kontrak Lengkap

### 5.1 Auth Endpoints

**POST `/api/auth/register`** — Daftar Akun User  
Request Body:
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "Password123!",
  "phone": "08123456789"
}
```
Response `201`:
```json
{ "success": true, "message": "Akun berhasil dibuat", "data": { "id": "...", "name": "John Doe", "email": "...", "role": "USER" } }
```

**POST `/api/auth/login`** — Login  
Request Body:
```json
{ "email": "john@example.com", "password": "Password123!" }
```
Response `200`:
```json
{ "success": true, "data": { "accessToken": "jwt...", "user": { "id": "...", "name": "...", "role": "USER" } } }
```

---

### 5.2 Event Endpoints (Public)

**GET `/api/events`** — Daftar event yang sudah dipublish  
Query: `?page=1&limit=10&search=...`  
Response `200`:
```json
{
  "success": true,
  "data": { "events": [...], "total": 20, "page": 1, "limit": 10 }
}
```

**GET `/api/events/:slug`** — Detail event  
Response `200`:
```json
{
  "success": true,
  "data": {
    "id": "...", "title": "...", "slug": "...", "description": "...",
    "isPaid": true, "price": "50000.00", "bankName": "BCA",
    "bankAccountNumber": "1234567890", "bankAccountHolder": "Panitia Event",
    "maxParticipants": 100, "registeredCount": 45,
    "registrationDeadline": "...", "eventStartDate": "...", "eventEndDate": "...",
    "location": "...", "attendanceEnabled": true, "bannerUrl": "..."
  }
}
```

---

### 5.3 Registration Endpoints

**POST `/api/events/:id/register`** — Daftar Event  
Content-Type: `multipart/form-data` (jika paid, sertakan `paymentProof`)  
Fields:
```
name: string (optional jika User login — diambil dari profil)
email: string (optional jika User login)
phone: string (optional jika User login)
paymentProof: File (jpg/png/pdf, max 5MB, wajib jika event isPaid=true)
```
Response `201` (Gratis):
```json
{
  "success": true,
  "message": "Pendaftaran berhasil! Tiket telah dikirim ke email Anda.",
  "data": { "ticketCode": "EVT-202611-K9X2P4", "magicToken": "uuid..." }
}
```
Response `201` (Berbayar):
```json
{
  "success": true,
  "message": "Bukti pembayaran berhasil diunggah. Menunggu konfirmasi admin.",
  "data": { "registrationId": "...", "status": "PAYMENT_SUBMITTED" }
}
```

**GET `/api/tickets/view/:magicToken`** — Lihat Tiket Digital (Publik via Magic Link)  
Response `200`:
```json
{
  "success": true,
  "data": {
    "ticketCode": "EVT-202611-K9X2P4",
    "eventTitle": "...", "eventDate": "...", "eventLocation": "...",
    "attendeeName": "John Doe", "attendeeEmail": "...", "attendeePhone": "...",
    "status": "CONFIRMED",
    "checkInStatus": "NOT_CHECKED_IN",
    "attendanceStatus": "ABSENT",
    "attendanceEnabled": true
  }
}
```

**GET `/api/users/me/tickets`** — Tiket milik User login  
Header: `Authorization: Bearer <token>`  
Response `200`: Array tiket dengan detail event.

---

### 5.4 Admin Endpoints

**POST `/api/admin/events`** — Buat Event Baru  
Header: `Authorization: Bearer <admin-token>`  
Request Body (JSON):
```json
{
  "title": "Event Seminar Tech 2026",
  "description": "Deskripsi panjang...",
  "isPaid": true,
  "price": 50000,
  "bankName": "BCA",
  "bankAccountNumber": "1234567890",
  "bankAccountHolder": "Panitia Event",
  "maxParticipants": 100,
  "registrationDeadline": "2026-12-01T23:59:00+07:00",
  "eventStartDate": "2026-12-15T08:00:00+07:00",
  "eventEndDate": "2026-12-15T17:00:00+07:00",
  "location": "Gedung Konvensi Jakarta",
  "attendanceEnabled": true,
  "isPublished": false
}
```
Response `201`:
```json
{ "success": true, "data": { "id": "...", "slug": "event-seminar-tech-2026", ... } }
```

**PUT `/api/admin/events/:id`** — Edit Event  
Sama seperti POST, partial update diizinkan.

**GET `/api/admin/events`** — Daftar Semua Event (Admin)  
Termasuk draft (belum dipublish).

**PATCH `/api/admin/events/:id/publish`** — Toggle publish event.

**GET `/api/admin/registrations`** — Daftar Semua Pendaftar  
Query: `?eventId=...&status=PAYMENT_SUBMITTED&page=1&limit=20`

**PATCH `/api/admin/registrations/:id/review`** — Approve/Reject Pembayaran  
Request Body:
```json
{ "action": "APPROVE" }
// atau
{ "action": "REJECT", "rejectionReason": "Bukti transfer tidak jelas, harap upload ulang." }
```
Response `200`:
```json
{ "success": true, "message": "Pembayaran disetujui. Tiket telah dikirimkan ke peserta." }
```

---

### 5.5 Staff Endpoints

**POST `/api/staff/check-in`** — Scan Tiket Gate Check-in  
Header: `Authorization: Bearer <staff-token>`  
Request Body:
```json
{ "ticketCode": "EVT-202611-K9X2P4" }
```
Responses:

| Kondisi | Status | Response |
|:---|:---|:---|
| Tiket ditemukan, valid, belum check-in | `200` | `{ success: true, data: { name, event, checkedInAt } }` |
| Sudah pernah check-in | `409` | `{ success: false, message: "Tiket sudah check-in pada HH:MM", data: { checkedInAt } }` |
| Tiket tidak ditemukan | `404` | `{ success: false, message: "Tiket tidak ditemukan" }` |
| Status belum CONFIRMED | `400` | `{ success: false, message: "Tiket belum dikonfirmasi / belum lunas" }` |

---

### 5.6 Attendance Endpoints

**GET `/api/events/:id/live-attendance-token`** — Token QR Dinamis untuk Proyektor  
Header: `Authorization: Bearer <admin-token>`  
Response `200`:
```json
{
  "success": true,
  "data": {
    "qrPayload": "eyJldmVudElkIjoiLi4uIiwic3RlcCI6MTczMTk0MDAwLCJzaWciOiJhMWIyYzNkNCJ9",
    "expiresInMs": 7420,
    "timeStep": 173194000
  }
}
```

**POST `/api/attendance/verify`** — Verifikasi Absensi Peserta (Scan QR Proyektor)  
Request Body:
```json
{ "qrPayload": "eyJ...", "magicToken": "uuid-magic-token" }
// atau jika user login:
{ "qrPayload": "eyJ...", "ticketCode": "EVT-202611-K9X2P4" }
```
Responses:

| Kondisi | Status | Response |
|:---|:---|:---|
| Sukses pertama kali | `200` | `{ success: true, message: "Absensi berhasil dicatat!" }` |
| Token kedaluwarsa | `400` | `{ success: false, message: "QR Code sudah berganti, scan ulang layar." }` |
| Belum gate check-in | `403` | `{ success: false, message: "Anda belum check-in di pintu masuk." }` |
| Sudah pernah absen | `409` | `{ success: false, message: "Kehadiran sudah tercatat pada HH:MM." }` |

---

## 6. Algoritma HMAC Attendance Token (Detail Teknis)

```typescript
// AttendanceTokenEngine.ts
import { createHmac } from 'crypto';

export interface AttendanceTokenPayload {
  eventId: string;
  step: number;
  sig: string;
}

export class AttendanceTokenEngine {
  private static WINDOW_SECONDS = 10;

  static getCurrentTimeStep(): number {
    return Math.floor(Date.now() / 1000 / this.WINDOW_SECONDS);
  }

  static generateToken(eventId: string, secret: string): {
    qrPayload: string;
    expiresInMs: number;
    timeStep: number;
  } {
    const step = this.getCurrentTimeStep();
    const sig = this.computeHmac(eventId, step, secret);
    const payload: AttendanceTokenPayload = { eventId, step, sig };
    const qrPayload = Buffer.from(JSON.stringify(payload)).toString('base64url');
    const secondsIntoWindow = (Date.now() / 1000) % this.WINDOW_SECONDS;
    const expiresInMs = Math.round((this.WINDOW_SECONDS - secondsIntoWindow) * 1000);
    return { qrPayload, expiresInMs, timeStep: step };
  }

  static verifyToken(qrPayload: string, secret: string): boolean {
    try {
      const decoded = JSON.parse(Buffer.from(qrPayload, 'base64url').toString());
      const { eventId, step, sig } = decoded as AttendanceTokenPayload;
      const currentStep = this.getCurrentTimeStep();
      // Toleransi: window saat ini dan 1 window sebelumnya (maks 10-15 detik keterlambatan)
      const validSteps = [currentStep, currentStep - 1];
      return validSteps.some(s => s === step && this.computeHmac(eventId, s, secret) === sig);
    } catch {
      return false;
    }
  }

  private static computeHmac(eventId: string, step: number, secret: string): string {
    return createHmac('sha256', secret)
      .update(`${eventId}:${step}`)
      .digest('hex')
      .substring(0, 16);
  }
}
```

---

## 7. Template Email HTML Tiket

Format email yang dikirim via Nodemailer:
- **Inline QR Code** sebagai Base64 data URL (kompatibel semua email client).
- **Kartu tiket visual** dengan layout responsif.
- **CTA button** magic link ke `https://domain.com/tickets/:magicToken`.
- Informasi lengkap: nama event, tanggal, lokasi, nama peserta, kode tiket.

---

## 8. Spesifikasi Frontend (Halaman & Komponen Kunci)

### 8.1 `VenuePresenterPage.tsx`
- Route: `/admin/events/:id/live-attendance`
- Full-screen mode toggle.
- Polling tiap 5 detik ke API `/api/events/:id/live-attendance-token`.
- Render QR code baru menggunakan library `qrcode.react`.
- Progress bar countdown animasi (10s → 0s), berulang terus.

### 8.2 `DigitalTicketPage.tsx`
- Route: `/tickets/:magicToken` (public)
- Fetch detail tiket dari `/api/tickets/view/:magicToken`.
- Tampilkan kartu tiket (status, check-in, attendance).
- Tombol "Scan Absensi" jika `attendanceEnabled && checkInStatus === CHECKED_IN && attendanceStatus === ABSENT`.
- Buka modal kamera (`QRScanner` component, kamera belakang/environment).
- Kirim hasil scan ke `/api/attendance/verify`.
- Tampilkan feedback visual: hijau ✅ atau merah ❌.

### 8.3 `GateScannerPage.tsx`
- Route: `/staff/gate-scanner` (hanya STAFF & ADMIN)
- Continuous kamera scanning menggunakan `html5-qrcode`.
- Setiap QR berhasil dibaca → auto-POST ke `/api/staff/check-in`.
- Feedback visual dan audio:
  - ✅ Hijau + beep sukses: tampil nama peserta & event.
  - ⚠️ Oranye: sudah check-in sebelumnya.
  - ❌ Merah: tiket invalid.
- Input manual nomor tiket (fallback).

---

## 9. Keamanan & Edge Cases

| Risiko | Mitigasi |
|:---|:---|
| Token JWT bocor | Short expiry (1 jam) + Refresh Token jika perlu |
| Tiket dibagikan (double check-in) | `checkInStatus` di-lock setelah CHECKED_IN + peringatan timestamp |
| QR dinamis difoto & dikirim ke orang luar | Window validasi ketat 10-15 detik |
| Upload file berbahaya | Validasi MIME type + ekstensi + ukuran (max 5MB) di Multer |
| SQL Injection | Prisma parameterized queries (aman by default) |
| Brute force login | Rate limiting dengan `express-rate-limit` |
| `attendanceSecret` exposed | Tidak pernah dikirim ke frontend, hanya diproses di server |
| Race condition double registration | Unique constraint `ticketCode` + DB transaction |

---

## 10. Dependencies yang Akan Diinstal

### Root (devDependencies)
```json
{ "turbo": "latest", "typescript": "^5.x" }
```

### packages/shared
```json
{
  "dependencies": { "zod": "^3.x" },
  "devDependencies": { "typescript": "^5.x" }
}
```

### apps/backend
```json
{
  "dependencies": {
    "express": "^4.x",
    "@prisma/client": "^5.x",
    "jsonwebtoken": "^9.x",
    "bcrypt": "^5.x",
    "nodemailer": "^6.x",
    "multer": "^1.x",
    "qrcode": "^1.x",
    "uuid": "^9.x",
    "cors": "^2.x",
    "express-rate-limit": "^7.x",
    "dotenv": "^16.x",
    "shared": "*"
  },
  "devDependencies": {
    "prisma": "^5.x",
    "@types/express": "^4.x",
    "@types/jsonwebtoken": "^9.x",
    "@types/bcrypt": "^5.x",
    "@types/nodemailer": "^6.x",
    "@types/multer": "^1.x",
    "@types/qrcode": "^1.x",
    "@types/uuid": "^9.x",
    "@types/cors": "^2.x",
    "tsx": "^4.x",
    "typescript": "^5.x"
  }
}
```

### apps/frontend
```json
{
  "dependencies": {
    "react": "^18.x",
    "react-dom": "^18.x",
    "react-router-dom": "^6.x",
    "axios": "^1.x",
    "zustand": "^4.x",
    "qrcode.react": "^3.x",
    "html5-qrcode": "^2.x",
    "shared": "*"
  },
  "devDependencies": {
    "@vitejs/plugin-react": "^4.x",
    "vite": "^5.x",
    "tailwindcss": "^3.x",
    "autoprefixer": "^10.x",
    "postcss": "^8.x",
    "typescript": "^5.x",
    "@types/react": "^18.x",
    "@types/react-dom": "^18.x"
  }
}
```


---

## 13. Backend Optimization & Security Hardening (Post-Phase 4 Refinement)

### 13.1 Eliminasi Masalah N+1 Query
1. **Event Listing (`ListEventsUseCase`)**:
   - *Masalah*: Query event list dilanjutkan dengan loop `countRegistrations(eventId)` per item (`Promise.all`), memicu N+1 query.
   - *Solusi*: Memperluas `IEventRepository.findAllWithCount` dan mengimplementasikannya di `PrismaEventRepository` menggunakan:
     ```typescript
     include: {
       _count: {
         select: {
           registrations: {
             where: { status: { in: [RegistrationStatus.CONFIRMED, RegistrationStatus.PAYMENT_SUBMITTED] } }
           }
         }
       }
     }
     ```
   - Hasil: 1 query SQL untuk mengambil seluruh event beserta jumlah pendaftarnya.
2. **User Tickets Listing (`RegistrationController.getMyTickets`)**:
   - *Masalah*: Query tiket peserta mengambil event per registrasi via `eventRepository.findById(reg.eventId)`.
   - *Solusi*: Menggunakan batch query `eventRepository.findByIds(uniqueEventIds)` dengan SQL `WHERE id IN (...)` dan mapping O(1) di memori.
   - Hasil: 2 query konstan terlepas dari jumlah tiket yang dimiliki.

### 13.2 Pencegahan Kebocoran Rahasia Kriptografi (`attendanceSecret`)
- `Event` Entity dilengkapi dengan method `toPublicJSON()` yang mengecualikan `attendanceSecret`.
- Seluruh endpoint publik (`GET /api/events`, `GET /api/events/:slug`) dilarang mengirimkan `attendanceSecret`. Kunci rahasia HMAC ini hanya boleh diakses oleh use case internal verifikasi absensi atau endpoint terproteksi admin venue proyektor.

### 13.3 Proteksi Concurrency & Race Condition Kuota
- `RegisterAttendeeUseCase` membungkus pengecekan ketersediaan kuota dan persistensi registrasi dalam interactive transaction Prisma agar kebal terhadap pendaftaran bersamaan (concurrent overbooking).

### 13.4 Normalisasi Path Direktori Uploads
- `uploadMiddleware.ts` dan `index.ts` menormalisasi path direktori uploads secara konsisten terhadap root monorepo atau variabel lingkungan `UPLOADS_DIR`.
