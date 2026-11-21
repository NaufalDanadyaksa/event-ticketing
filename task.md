# Task Breakdown — Event Ticketing & Dynamic Attendance System

**Status Keseluruhan**: ⏳ Menunggu Perintah Eksekusi dari Pengguna  
**Tanggal Dibuat**: 2026-11-18  
**Total Fase**: 6 Fase  

> [!IMPORTANT]
> **Execution Freeze**: Semua item di bawah ini hanya boleh dikerjakan setelah pengguna memberikan perintah eksplisit untuk memulai eksekusi (misal: "eksekusi", "mulai coding", "proceed").

---

## Phase 0: Monorepo Bootstrap & Environment Setup

> Tujuan: Menyiapkan struktur monorepo Turborepo + npm workspaces, konfigurasi TypeScript base, dan environment file.

- [x] **0.1** Inisialisasi `package.json` root dengan konfigurasi `workspaces: ["apps/*", "packages/*"]`
- [x] **0.2** Buat `turbo.json` dengan pipeline:
  - `build` → dependsOn: `^build`
  - `dev` → persistent: true
  - `lint` → dependsOn: `^lint`
  - `type-check` → dependsOn: `^build`
- [x] **0.3** Buat `tsconfig.base.json` sebagai base konfigurasi TypeScript yang diextend semua packages:
  ```json
  {
    "compilerOptions": {
      "strict": true,
      "esModuleInterop": true,
      "skipLibCheck": true,
      "moduleResolution": "bundler",
      "target": "ES2022"
    }
  }
  ```
- [x] **0.4** Buat `.gitignore` root (node_modules, dist, .env, uploads/)
- [x] **0.5** Buat `.env.example` di root dan `apps/backend/`
  ```env
  DATABASE_URL="mysql://root:password@localhost:3306/event_ticketing"
  JWT_SECRET="your-super-secret-jwt-key-min-32-chars"
  JWT_EXPIRES_IN="1h"
  SMTP_HOST="smtp.example.com"
  SMTP_PORT=587
  SMTP_USER="email@example.com"
  SMTP_PASS="email-password"
  SMTP_FROM="Ticket System <noreply@example.com>"
  APP_URL="http://localhost:5173"
  BACKEND_URL="http://localhost:3000"
  PORT=3000
  ```
- [x] **0.6** Pastikan direktori dasar monorepo terbentuk: `apps/backend/`, `apps/frontend/`, `packages/shared/`
- [x] **0.7** Jalankan `npm install` di root untuk inisialisasi workspace

**Verifikasi**: `ls apps/ packages/` menampilkan struktur yang benar. [SELESAI]

---

## Phase 1: Shared Package (`packages/shared`)

> Tujuan: Menjadi **Single Source of Truth** untuk semua tipe TypeScript, enum status, dan skema validasi Zod yang digunakan bersama antara backend dan frontend.

### 1.A Setup Package

- [x] **1.1** Buat `packages/shared/package.json`:
  ```json
  {
    "name": "shared",
    "version": "1.0.0",
    "main": "./dist/index.js",
    "types": "./dist/index.d.ts",
    "scripts": {
      "build": "tsc",
      "type-check": "tsc --noEmit"
    }
  }
  ```
- [x] **1.2** Buat `packages/shared/tsconfig.json` yang extend `../../tsconfig.base.json`
- [x] **1.3** Install dependency shared: `zod@^3.x`

### 1.B Enum & Konstanta

- [x] **1.4** Buat `packages/shared/src/enums/index.ts` yang mendefinisikan:
  - `Role`: `ADMIN | STAFF | USER`
  - `RegistrationStatus`: `WAITING_PAYMENT | PAYMENT_SUBMITTED | CONFIRMED | REJECTED | CANCELLED`
  - `CheckInStatus`: `NOT_CHECKED_IN | CHECKED_IN`
  - `AttendanceStatus`: `ABSENT | ATTENDED`

### 1.C TypeScript Interfaces & DTOs

- [x] **1.5** Buat `packages/shared/src/types/user.types.ts`:
  - `IUser`: `{ id, email, name, phone?, role, createdAt, updatedAt }`
  - `IAuthResponse`: `{ accessToken: string; user: IUser }`
  - `IUserProfile`: Public-safe user object
- [x] **1.6** Buat `packages/shared/src/types/event.types.ts`:
  - `IEvent`: Semua kolom event termasuk `isPaid`, `price`, `bankName`, dll.
  - `IEventListItem`: Versi ringkas untuk daftar (title, slug, date, price, registeredCount)
  - `IEventAvailability`: `{ available: boolean; quota: number; registered: number; deadlinePassed: boolean }`
- [x] **1.7** Buat `packages/shared/src/types/registration.types.ts`:
  - `IRegistration`: Full object pendaftaran
  - `ITicketDetail`: Objek untuk halaman tiket digital (merge event + registration data)
  - `IRegistrationListItem`: Untuk dashboard admin (payment review)
- [x] **1.8** Buat `packages/shared/src/types/attendance.types.ts`:
  - `IAttendanceTokenPayload`: `{ eventId: string; step: number; sig: string }`
  - `ILiveAttendanceToken`: Response dari API proyektor
  - `IAttendanceVerifyResult`: Result dari proses verify absensi

### 1.D Zod Validation Schemas

- [x] **1.9** Buat `packages/shared/src/validations/auth.schema.ts`:
  - `RegisterUserSchema`: name, email (email format), password (min 8, 1 huruf besar, 1 angka), phone (optional)
  - `LoginSchema`: email, password
- [x] **1.10** Buat `packages/shared/src/validations/event.schema.ts`:
  - `CreateEventSchema`: Validasi semua field event termasuk:
    - `price` min 0 jika isPaid=true
    - `bankName/bankAccountNumber/bankAccountHolder` required jika isPaid=true
    - `eventEndDate` harus setelah `eventStartDate`
    - `registrationDeadline` harus sebelum `eventStartDate`
    - `maxParticipants` min 0 (0 = unlimited)
  - `UpdateEventSchema`: Partial dari CreateEventSchema
- [x] **1.11** Buat `packages/shared/src/validations/registration.schema.ts`:
  - `GuestRegisterSchema`: name (required), email (email format), phone (required)
  - `ReviewPaymentSchema`: `action: "APPROVE" | "REJECT"`, `rejectionReason` (required jika REJECT, min 10 char)
  - `StaffCheckInSchema`: `ticketCode` (string, non-empty)
  - `AttendanceVerifySchema`: `qrPayload` (string), `magicToken` (optional uuid), `ticketCode` (optional)

### 1.E Re-export Index

- [x] **1.12** Buat `packages/shared/src/index.ts` yang re-export semua dari enums, types, validations
- [x] **1.13** Build shared package: `npm run build -w packages/shared`
- [x] **1.14** Verifikasi: `dist/` terbentuk dengan `index.js` dan `index.d.ts`

**Verifikasi Phase 1**: `cd packages/shared && npm run type-check` tanpa error. [SELESAI]

---

## Phase 2: Database Schema & Prisma Migration

> Tujuan: Mendefinisikan skema database MySQL dengan Prisma, menjalankan migrasi, dan memverifikasi skema.

### 2.A Setup Backend & Prisma

- [x] **2.1** Buat `apps/backend/package.json` dengan semua dependencies backend
- [x] **2.2** Buat `apps/backend/tsconfig.json` yang extend base config
- [x] **2.3** Install semua backend dependencies (express, @prisma/client, jsonwebtoken, bcrypt, nodemailer, multer, qrcode, uuid, cors, express-rate-limit, dotenv)
- [x] **2.4** Install backend devDependencies (prisma, tsx, semua @types/*)
- [x] **2.5** Buat `apps/backend/.env` dari template `.env.example`
- [x] **2.6** Inisialisasi Prisma: `npx prisma init --datasource-provider mysql`

### 2.B Skema Prisma

- [x] **2.7** Tulis `apps/backend/prisma/schema.prisma` lengkap mencakup:
  - **Enums**: `Role`, `RegistrationStatus`, `CheckInStatus`, `AttendanceStatus`
  - **Model User**: id (uuid), email (unique), passwordHash, name, phone?, role, createdAt, updatedAt
    - Relasi: `registrations`, `eventsCreated` (AdminEvents), `checkInsPerformed` (StaffCheckIns)
  - **Model Event**: Semua field termasuk `attendanceSecret`, `isPublished`, `maxParticipants`
    - Index pada `slug`, `createdById`
  - **Model Registration**: Semua field termasuk `ticketCode` (unique), `magicToken` (unique, default uuid)
    - Index pada `eventId`, `email`, `ticketCode`, `magicToken`
    - Relasi `checkedInByStaff` → User via `StaffCheckIns`
- [x] **2.8** Jalankan migrasi pertama:
  ```bash
  cd apps/backend && npx prisma migrate dev --name init_event_ticketing_schema
  ```
- [x] **2.9** Generate Prisma Client: `npx prisma generate`
- [x] **2.10** Verifikasi koneksi database dengan Prisma Studio: `npx prisma studio`
- [x] **2.11** Buat seed script `apps/backend/prisma/seed.ts`:
  - Buat 1 akun Admin default: `admin@event.com` / password: `Admin123!`
  - Buat 1 akun Staff: `staff@event.com` / password: `Staff123!`
  - Buat 1 event contoh (gratis) + 1 event contoh (berbayar)
- [x] **2.12** Jalankan seed: `npx prisma db seed`

**Verifikasi Phase 2**: Buka Prisma Studio, pastikan tabel `User`, `Event`, `Registration` terbentuk dengan benar dan data seed tersedia. [SELESAI]

---

## Phase 3: Backend Domain & Application Layer

> Tujuan: Membangun inti bisnis aplikasi (entitas domain, interface repository, use cases) yang bebas dari ketergantungan framework eksternal.

### 3.A Infrastructure Setup

- [x] **3.1** Buat `apps/backend/src/infrastructure/prisma.ts` — Prisma Client singleton dengan lazy instantiation
- [x] **3.2** Buat `apps/backend/src/utils/responseHelper.ts`:
  ```typescript
  export const successResponse = (data?: any, message?: string) => ({ success: true, message, data });
  export const errorResponse = (message: string, errors?: any) => ({ success: false, message, errors });
  ```
- [x] **3.3** Buat `apps/backend/src/utils/ticketCodeGenerator.ts`:
  ```typescript
  // Format: EVT-YYYYMM-XXXXXX (6 karakter alphanumeric uppercase)
  export const generateTicketCode = (): string => { ... }
  ```
- [x] **3.4** Buat `apps/backend/src/utils/slugGenerator.ts`: Konversi judul event ke slug URL-friendly
- [x] **3.5** Buat `apps/backend/src/utils/attendanceSecretGenerator.ts`:
  ```typescript
  import { randomBytes } from 'crypto';
  export const generateAttendanceSecret = () => randomBytes(32).toString('hex');
  ```

### 3.B Domain Entities (Murni TypeScript, No Framework)

- [x] **3.6** Buat `apps/backend/src/domain/entities/User.ts` — Interface atau class entitas User
- [x] **3.7** Buat `apps/backend/src/domain/entities/Event.ts` — Interface atau class entitas Event
  - Method bisnis: `isRegistrationOpen()`, `hasAvailableSlots(currentCount: number)`, `isActive()`
- [x] **3.8** Buat `apps/backend/src/domain/entities/Registration.ts` — Interface atau class entitas Registration
  - Method bisnis: `isConfirmed()`, `hasCheckedIn()`, `hasAttended()`

### 3.C Domain Errors

- [x] **3.9** Buat `apps/backend/src/domain/errors/DomainErrors.ts`:
  - `EventNotFoundError`
  - `RegistrationDeadlinePassedError`
  - `EventQuotaFullError`
  - `RegistrationNotFoundError`
  - `TicketAlreadyCheckedInError`
  - `TicketNotConfirmedError`
  - `AttendanceAlreadyRecordedError`
  - `NotCheckedInError`
  - `InvalidAttendanceTokenError`
  - `UserAlreadyRegisteredError`
  - `DuplicateEmailError`

### 3.D Interface Repositories (Abstraksi Domain)

- [x] **3.10** Buat `apps/backend/src/domain/repositories/IUserRepository.ts`:
  ```typescript
  interface IUserRepository {
    findById(id: string): Promise<User | null>;
    findByEmail(email: string): Promise<User | null>;
    create(data: CreateUserDTO): Promise<User>;
  }
  ```
- [x] **3.11** Buat `apps/backend/src/domain/repositories/IEventRepository.ts`:
  ```typescript
  interface IEventRepository {
    findAll(params: EventListParams): Promise<{ events: Event[]; total: number }>;
    findById(id: string): Promise<Event | null>;
    findBySlug(slug: string): Promise<Event | null>;
    create(data: CreateEventDTO): Promise<Event>;
    update(id: string, data: Partial<CreateEventDTO>): Promise<Event>;
    countRegistrations(eventId: string): Promise<number>;
  }
  ```
- [x] **3.12** Buat `apps/backend/src/domain/repositories/IRegistrationRepository.ts`:
  ```typescript
  interface IRegistrationRepository {
    findById(id: string): Promise<Registration | null>;
    findByTicketCode(code: string): Promise<Registration | null>;
    findByMagicToken(token: string): Promise<Registration | null>;
    findByUserId(userId: string): Promise<Registration[]>;
    findAllByEvent(eventId: string, filters?: RegistrationFilters): Promise<{ items: Registration[]; total: number }>;
    create(data: CreateRegistrationDTO): Promise<Registration>;
    update(id: string, data: Partial<Registration>): Promise<Registration>;
    existsByEmailAndEvent(email: string, eventId: string): Promise<boolean>;
  }
  ```

### 3.E Concrete Prisma Repositories (Interface Adapters)

- [x] **3.13** Buat `apps/backend/src/repositories/PrismaUserRepository.ts` — Implementasi `IUserRepository` menggunakan Prisma
- [x] **3.14** Buat `apps/backend/src/repositories/PrismaEventRepository.ts` — Implementasi `IEventRepository` menggunakan Prisma
  - `findAll()` harus support pagination (`skip`, `take`) dan filter (`search`, `isPublished`)
- [x] **3.15** Buat `apps/backend/src/repositories/PrismaRegistrationRepository.ts` — Implementasi `IRegistrationRepository`
  - `findAllByEvent()` harus support filter `status` dan pagination

### 3.F Services (Infrastructure)

- [x] **3.16** Buat `apps/backend/src/services/qr/AttendanceTokenEngine.ts` (sesuai spesifikasi algoritma Section 6 implementation_plan):
  - `generateToken(eventId, secret)` → `{ qrPayload, expiresInMs, timeStep }`
  - `verifyToken(qrPayload, secret)` → `boolean`
  - `getCurrentTimeStep()` → `number`
- [x] **3.17** Buat `apps/backend/src/services/qr/QRGenerator.ts`:
  - `generateQRCodeDataURL(text: string)` → `Promise<string>` (Base64 PNG data URL)
  - Digunakan untuk generate QR code tiket di dalam email HTML
- [x] **3.18** Buat `apps/backend/src/services/email/templates/ticket.template.ts`:
  - Fungsi `generateTicketEmailHTML(data: TicketEmailData)` → HTML string yang responsif
  - Menerima: eventTitle, eventDate, eventLocation, attendeeName, ticketCode, qrCodeDataURL, magicToken, status
  - Merender kartu tiket visual dengan embedded QR code, detail event, dan tombol CTA magic link
- [x] **3.19** Buat `apps/backend/src/services/email/EmailService.ts`:
  - Konfigurasi Nodemailer transporter (SMTP dari env)
  - `sendTicketEmail(to: string, data: TicketEmailData)` → `Promise<void>`
  - Panggil `generateTicketEmailHTML()` + kirim via Nodemailer

### 3.G Use Cases — Auth

- [x] **3.20** Buat `apps/backend/src/use-cases/auth/RegisterUserUseCase.ts`:
  - Input: `{ name, email, password, phone? }`
  - Business rules: cek duplikat email via `IUserRepository.findByEmail()`
  - Hash password dengan bcrypt (salt rounds: 12)
  - Create user via `IUserRepository.create()`
  - Output: User object (tanpa passwordHash)
- [x] **3.21** Buat `apps/backend/src/use-cases/auth/LoginUserUseCase.ts`:
  - Input: `{ email, password }`
  - Business rules: cek user exist, compare password bcrypt, generate JWT
  - JWT payload: `{ userId, email, role, iat, exp }`
  - Output: `{ accessToken, user }`

### 3.H Use Cases — Events

- [x] **3.22** Buat `apps/backend/src/use-cases/events/CreateEventUseCase.ts`:
  - Input: `CreateEventDTO` + `createdById: string`
  - Business rules: generate unique slug, generate `attendanceSecret` (crypto.randomBytes)
  - Validasi: jika `isPaid=true`, field bank wajib ada
  - Output: Event object
- [x] **3.23** Buat `apps/backend/src/use-cases/events/UpdateEventUseCase.ts`:
  - Input: `eventId: string`, `updateData: Partial<CreateEventDTO>`
  - Business rules: cek event exist, update slug jika title berubah
  - Output: Event object
- [x] **3.24** Buat `apps/backend/src/use-cases/events/ListEventsUseCase.ts`:
  - Input: pagination + search params
  - Hanya return event dengan `isPublished=true`
  - Sertakan `registeredCount` per event
  - Output: paginated list
- [x] **3.25** Buat `apps/backend/src/use-cases/events/GetEventDetailUseCase.ts`:
  - Input: `slug: string`
  - Return event detail + `registeredCount` + availability info
  - Hitung kuota tersisa: `maxParticipants - registeredCount`
  - Output: `IEventDetail`

### 3.I Use Cases — Registrations

- [x] **3.26** Buat `apps/backend/src/use-cases/registrations/RegisterAttendeeUseCase.ts`:
  - Input: `eventId`, `name`, `email`, `phone`, `userId?` (null jika guest), `paymentProofPath?`
  - Business rules (dalam urutan):
    1. Cek event exist
    2. Cek registration deadline belum lewat
    3. Cek kuota masih tersedia (jika `maxParticipants > 0`)
    4. Cek tidak ada pendaftaran duplikat dengan email yang sama di event ini
    5. Generate `ticketCode` unik (format `EVT-YYYYMM-ALPHANUM`)
    6. Tentukan `status`:
       - `CONFIRMED` jika event gratis (`isPaid=false`)
       - `PAYMENT_SUBMITTED` jika event berbayar dan ada bukti bayar
       - `WAITING_PAYMENT` jika event berbayar dan belum ada bukti bayar
    7. Simpan Registration ke database
    8. Jika `status === CONFIRMED`: panggil `EmailService.sendTicketEmail()`
  - Output: `{ registration, emailSent: boolean }`

- [x] **3.27** Buat `apps/backend/src/use-cases/registrations/UploadPaymentProofUseCase.ts`:
  - Input: `registrationId`, `filePath: string`
  - Business rules: cek registration exist, status harus `WAITING_PAYMENT` atau `REJECTED`
  - Update: `status = PAYMENT_SUBMITTED`, `paymentProofUrl = filePath`, clear `rejectionReason`
  - Output: Updated Registration

- [x] **3.28** Buat `apps/backend/src/use-cases/registrations/ReviewPaymentUseCase.ts`:
  - Input: `registrationId`, `action: "APPROVE" | "REJECT"`, `rejectionReason?: string`, `adminId: string`
  - Business rules: cek registration exist, status harus `PAYMENT_SUBMITTED`
  - Jika `APPROVE`:
    - Update: `status = CONFIRMED`, `approvedAt = now()`, `approvedByAdminId`
    - Kirim email tiket via `EmailService.sendTicketEmail()`
  - Jika `REJECT`:
    - Update: `status = REJECTED`, `rejectionReason`
  - Output: Updated Registration

### 3.J Use Cases — Staff Gate Check-In

- [x] **3.29** Buat `apps/backend/src/use-cases/staff/VerifyGateCheckInUseCase.ts`:
  - Input: `ticketCode: string`, `staffId: string`
  - Business rules:
    1. Cari registrasi by `ticketCode` — throw `RegistrationNotFoundError` jika tidak ada
    2. Cek status `CONFIRMED` — throw `TicketNotConfirmedError` jika belum konfirmasi
    3. Cek `checkInStatus !== CHECKED_IN` — throw `TicketAlreadyCheckedInError` jika sudah
    4. Update: `checkInStatus = CHECKED_IN`, `checkedInAt = now()`, `checkedInByStaffId = staffId`
  - Output: `{ registration, attendeeName, eventTitle }`

### 3.K Use Cases — Dynamic Attendance

- [x] **3.30** Buat `apps/backend/src/use-cases/attendance/GetLiveAttendanceTokenUseCase.ts`:
  - Input: `eventId: string`
  - Business rules: cek event exist dan `attendanceEnabled=true`
  - Panggil `AttendanceTokenEngine.generateToken(eventId, event.attendanceSecret)`
  - Output: `{ qrPayload, expiresInMs, timeStep }`

- [x] **3.31** Buat `apps/backend/src/use-cases/attendance/VerifyDynamicAttendanceUseCase.ts`:
  - Input: `qrPayload: string`, identifier: `{ magicToken?: string; ticketCode?: string; userId?: string }`
  - Business rules:
    1. Decode `qrPayload` untuk mendapatkan `eventId`
    2. Ambil event dari database untuk mendapatkan `attendanceSecret`
    3. Verifikasi token dengan `AttendanceTokenEngine.verifyToken()` — throw `InvalidAttendanceTokenError` jika gagal
    4. Temukan registrasi (via magicToken atau ticketCode atau userId+eventId)
    5. Cek status `CONFIRMED` — throw `TicketNotConfirmedError`
    6. Cek `checkInStatus === CHECKED_IN` — throw `NotCheckedInError`
    7. Cek `attendanceStatus !== ATTENDED` — throw `AttendanceAlreadyRecordedError`
    8. Update: `attendanceStatus = ATTENDED`, `attendedAt = now()`
  - Output: `{ attendeeName, attendedAt }`

**Verifikasi Phase 3**: `npm run type-check -w apps/backend` tanpa error. Semua use case terimplementasi dan memiliki penanganan error yang sesuai. [SELESAI]

---

## Phase 4: Backend Delivery Layer (Controllers, Routes, Middleware)

> Tujuan: Menyambungkan HTTP layer (Express) ke use cases. Controller bertanggung jawab validasi request, pemanggilan use case, dan formatting response.

### 4.A Middlewares

- [ ] **4.1** Buat `apps/backend/src/middlewares/errorHandler.ts` — Global Express error handler:
  - Tangkap semua Domain Errors dan petakan ke HTTP status code yang sesuai
  - Tangkap Zod `ZodError` dan format ke response `400` dengan daftar field errors
  - Fallback ke `500 Internal Server Error` untuk error tidak terduga
  - Pastikan tidak ada stack trace yang di-expose di production
- [ ] **4.2** Buat `apps/backend/src/middlewares/authMiddleware.ts`:
  - Baca `Authorization: Bearer <token>` header
  - Verifikasi JWT dengan `jwt.verify()`
  - Attach decoded payload ke `req.user`
  - Return `401` jika token tidak ada atau invalid
- [ ] **4.3** Buat `apps/backend/src/middlewares/roleGuard.ts`:
  - Factory function: `roleGuard(...allowedRoles: Role[])` → Express middleware
  - Cek `req.user.role` apakah termasuk dalam `allowedRoles`
  - Return `403` jika tidak memiliki hak akses
- [ ] **4.4** Buat `apps/backend/src/middlewares/uploadMiddleware.ts` (Multer):
  - Konfigurasi storage: `diskStorage` ke folder `uploads/receipts/` dan `uploads/banners/`
  - Filter file: hanya izinkan `image/jpeg`, `image/png`, `application/pdf`
  - Batas ukuran file: 5MB
  - Ekspor: `uploadReceipt` (single field `paymentProof`), `uploadBanner` (single field `banner`)

### 4.B Controllers

- [ ] **4.5** Buat `apps/backend/src/controllers/AuthController.ts`:
  - `register(req, res)`: Validasi body dengan `RegisterUserSchema`, panggil `RegisterUserUseCase`, return `201`
  - `login(req, res)`: Validasi body dengan `LoginSchema`, panggil `LoginUserUseCase`, return `200`
  - `getProfile(req, res)`: Protected, return `req.user` data dari DB (via `IUserRepository.findById`)

- [ ] **4.6** Buat `apps/backend/src/controllers/EventController.ts` (Public):
  - `listEvents(req, res)`: Query params: `page`, `limit`, `search`. Panggil `ListEventsUseCase`
  - `getEventDetail(req, res)`: Params: `slug`. Panggil `GetEventDetailUseCase`

- [ ] **4.7** Buat `apps/backend/src/controllers/AdminEventController.ts` (Admin only):
  - `createEvent(req, res)`: Validasi `CreateEventSchema`, handle banner upload (Multer), panggil `CreateEventUseCase`
  - `updateEvent(req, res)`: Validasi `UpdateEventSchema`, panggil `UpdateEventUseCase`
  - `listAllEvents(req, res)`: Daftar semua event termasuk draft (isPublished=false)
  - `togglePublish(req, res)`: Toggle `isPublished` event

- [ ] **4.8** Buat `apps/backend/src/controllers/RegistrationController.ts` (Public + User):
  - `registerForEvent(req, res)`:
    - Handle multipart form data dengan `uploadReceipt` middleware
    - Jika user login: ambil name/email/phone dari `req.user` (tapi boleh override)
    - Jika guest: wajib ada name, email, phone dari body (validasi `GuestRegisterSchema`)
    - Panggil `RegisterAttendeeUseCase`
  - `getTicketByMagicToken(req, res)`: Public, params: `magicToken`. Return `ITicketDetail`
  - `getMyTickets(req, res)`: Protected (USER), return semua tiket milik `req.user.id`

- [ ] **4.9** Buat `apps/backend/src/controllers/AdminRegistrationController.ts` (Admin only):
  - `listRegistrations(req, res)`: Query: `eventId`, `status`, `page`, `limit`
  - `reviewPayment(req, res)`: Body: `{ action, rejectionReason? }`, validasi `ReviewPaymentSchema`, panggil `ReviewPaymentUseCase`
  - `getRegistrationDetail(req, res)`: Params: `id`. Detail lengkap satu pendaftar

- [ ] **4.10** Buat `apps/backend/src/controllers/StaffController.ts` (Staff + Admin):
  - `checkIn(req, res)`: Validasi `StaffCheckInSchema`, panggil `VerifyGateCheckInUseCase`

- [ ] **4.11** Buat `apps/backend/src/controllers/AttendanceController.ts`:
  - `getLiveToken(req, res)`: Protected (Admin), params: `eventId`. Panggil `GetLiveAttendanceTokenUseCase`
  - `verifyAttendance(req, res)`: Public (via magic token), validasi `AttendanceVerifySchema`, panggil `VerifyDynamicAttendanceUseCase`

### 4.C Routes

- [ ] **4.12** Buat `apps/backend/src/routes/auth.routes.ts`:
  ```
  POST   /api/auth/register
  POST   /api/auth/login
  GET    /api/auth/me        [authMiddleware]
  ```

- [ ] **4.13** Buat `apps/backend/src/routes/event.routes.ts`:
  ```
  GET    /api/events            (public list, isPublished=true only)
  GET    /api/events/:slug      (public detail)
  ```

- [ ] **4.14** Buat `apps/backend/src/routes/registration.routes.ts`:
  ```
  POST   /api/events/:id/register        [uploadReceipt middleware]
  GET    /api/tickets/view/:magicToken   (public)
  GET    /api/users/me/tickets           [authMiddleware]
  ```

- [ ] **4.15** Buat `apps/backend/src/routes/admin.routes.ts`:
  ```
  GET    /api/admin/events               [authMiddleware, roleGuard(ADMIN)]
  POST   /api/admin/events               [authMiddleware, roleGuard(ADMIN), uploadBanner]
  PUT    /api/admin/events/:id           [authMiddleware, roleGuard(ADMIN), uploadBanner]
  PATCH  /api/admin/events/:id/publish   [authMiddleware, roleGuard(ADMIN)]
  GET    /api/admin/registrations        [authMiddleware, roleGuard(ADMIN)]
  GET    /api/admin/registrations/:id    [authMiddleware, roleGuard(ADMIN)]
  PATCH  /api/admin/registrations/:id/review [authMiddleware, roleGuard(ADMIN)]
  ```

- [ ] **4.16** Buat `apps/backend/src/routes/staff.routes.ts`:
  ```
  POST   /api/staff/check-in   [authMiddleware, roleGuard(STAFF, ADMIN)]
  ```

- [ ] **4.17** Buat `apps/backend/src/routes/attendance.routes.ts`:
  ```
  GET    /api/events/:id/live-attendance-token  [authMiddleware, roleGuard(ADMIN)]
  POST   /api/attendance/verify                 (public, identifikasi via magicToken/ticketCode)
  ```

### 4.D Express App Setup

- [ ] **4.18** Buat `apps/backend/src/routes/index.ts` — Agregasi semua router:
  ```typescript
  router.use('/auth', authRouter);
  router.use('/events', eventRouter);
  // dst...
  ```
- [ ] **4.19** Buat `apps/backend/src/index.ts` (Express entry point):
  - Setup CORS (origin dari `APP_URL` env)
  - `express.json()` + `express.urlencoded()`
  - Static file serving untuk `/uploads` folder
  - Rate limiting dengan `express-rate-limit` (100 req/15 menit per IP)
  - Mount semua routes di `/api`
  - Pasang global `errorHandler` middleware di akhir
  - `app.listen(PORT)`
- [ ] **4.20** Tambahkan scripts di `apps/backend/package.json`:
  - `"dev": "tsx watch src/index.ts"`
  - `"build": "tsc"`
  - `"start": "node dist/index.js"`

**Verifikasi Phase 4**:
- `npm run dev -w apps/backend` server berjalan tanpa error
- Test endpoint dengan Postman/curl:
  - `POST /api/auth/register` → 201
  - `POST /api/auth/login` → 200 + token
  - `GET /api/events` → 200 + array event
  - `POST /api/admin/events` (dengan token admin) → 201
  - Semua unauthorized request → 401/403

---

## Phase 5: Frontend — React + Vite + Tailwind

> Tujuan: Membangun antarmuka web responsif mencakup portal publik, dashboard admin, scanner gate staff, layar proyektor absensi, dan halaman tiket digital peserta.

### 5.A Setup Frontend Project

- [ ] **5.1** Inisialisasi Vite + React + TypeScript: `npm create vite@latest apps/frontend -- --template react-ts`
- [ ] **5.2** Install Tailwind CSS: `npm install -D tailwindcss postcss autoprefixer`
- [ ] **5.3** Setup Tailwind config (`tailwind.config.ts`) dengan content paths
- [ ] **5.4** Install dependencies frontend:
  ```
  react-router-dom, axios, zustand, qrcode.react, html5-qrcode, shared (workspace:*)
  ```
- [ ] **5.5** Buat `apps/frontend/src/services/api/apiClient.ts` — Axios instance:
  - Base URL dari env (`VITE_API_URL`)
  - Request interceptor: attach `Authorization: Bearer <token>` dari Zustand store
  - Response interceptor: tangkap `401` → clear auth state → redirect ke `/login`

### 5.B Auth State Management

- [ ] **5.6** Buat `apps/frontend/src/store/authStore.ts` (Zustand):
  - State: `{ user: IUser | null; accessToken: string | null; isAuthenticated: boolean }`
  - Actions: `login(token, user)`, `logout()`, `setUser(user)`
  - Persistence: `localStorage` via Zustand persist middleware
- [ ] **5.7** Buat `apps/frontend/src/hooks/useAuth.ts`:
  - Wrapper di atas authStore + API calls auth
  - Methods: `login(email, password)`, `register(data)`, `logout()`, `fetchProfile()`

### 5.C API Service Layer

- [ ] **5.8** Buat `apps/frontend/src/services/api/auth.api.ts`: `register()`, `login()`, `getProfile()`
- [ ] **5.9** Buat `apps/frontend/src/services/api/events.api.ts`: `listEvents()`, `getEventBySlug()`
- [ ] **5.10** Buat `apps/frontend/src/services/api/registrations.api.ts`: `registerForEvent(FormData)`, `getTicketByMagicToken()`, `getMyTickets()`
- [ ] **5.11** Buat `apps/frontend/src/services/api/admin.api.ts`: `createEvent()`, `updateEvent()`, `listAdminEvents()`, `togglePublish()`, `listRegistrations()`, `reviewPayment()`, `getLiveAttendanceToken()`
- [ ] **5.12** Buat `apps/frontend/src/services/api/staff.api.ts`: `checkIn(ticketCode)`
- [ ] **5.13** Buat `apps/frontend/src/services/api/attendance.api.ts`: `verifyAttendance(payload)`

### 5.D Reusable Components

- [ ] **5.14** Buat UI primitives di `src/components/ui/`:
  - `Button.tsx`: Variants (primary, secondary, danger, ghost), loading state
  - `Input.tsx`: Label, error message, controlled input
  - `Badge.tsx`: Status badge (CONFIRMED=hijau, PAYMENT_SUBMITTED=kuning, REJECTED=merah, dll.)
  - `Modal.tsx`: Generic modal dengan overlay dan close button
  - `Spinner.tsx`: Loading indicator
  - `Card.tsx`: Container card dengan shadow

- [ ] **5.15** Buat `src/components/QRScanner.tsx`:
  - Wrapper `html5-qrcode` untuk scanning kamera
  - Props: `onScan(result: string)`, `onError(err: string)`, `facingMode: "environment" | "user"`
  - Request permission kamera saat mount
  - Stop camera saat unmount (cleanup)

- [ ] **5.16** Buat `src/components/QRCodeDisplay.tsx`:
  - Gunakan `qrcode.react` untuk render QR sebagai SVG/Canvas
  - Props: `value: string`, `size: number`, `level: "L" | "M" | "Q" | "H"`

- [ ] **5.17** Buat `src/components/TicketCard.tsx`:
  - Tampilkan kartu tiket visual (kode tiket, nama, event, tanggal, status badge)
  - Props: `ticket: ITicketDetail`

- [ ] **5.18** Buat `src/components/EventCard.tsx`:
  - Card event untuk halaman daftar (banner, judul, tanggal, harga, kuota)
  - Props: `event: IEventListItem`

- [ ] **5.19** Buat `src/components/AttendanceTimer.tsx`:
  - Progress bar countdown animasi (10 detik → 0 detik → reset)
  - Props: `expiresInMs: number`, `onExpire: () => void` (trigger fetch token baru)
  - Menggunakan CSS transition / requestAnimationFrame

### 5.E Layouts & Routing

- [ ] **5.20** Buat `src/layouts/PublicLayout.tsx`: Navbar dengan login/register button, footer
- [ ] **5.21** Buat `src/layouts/AdminLayout.tsx`: Sidebar navigasi Admin (Events, Registrations), logout button
- [ ] **5.22** Buat `src/layouts/StaffLayout.tsx`: Navbar minimal untuk halaman staff scanner
- [ ] **5.23** Buat `src/App.tsx` — React Router DOM setup:
  ```
  / → PublicLayout > HomePage
  /events/:slug → PublicLayout > EventDetailPage
  /events/:id/register → PublicLayout > RegisterPage
  /login → LoginPage
  /register → RegisterAccountPage
  /tickets/:magicToken → DigitalTicketPage (public)
  /my-tickets → PrivateRoute(USER) > MyTicketsPage
  /admin → PrivateRoute(ADMIN) > AdminLayout
    /admin/events → EventListPage
    /admin/events/new → EventFormPage
    /admin/events/:id/edit → EventFormPage
    /admin/payments → PaymentReviewPage
    /admin/events/:id/live-attendance → VenuePresenterPage
  /staff/gate-scanner → PrivateRoute(STAFF,ADMIN) > StaffLayout > GateScannerPage
  ```
- [ ] **5.24** Buat komponen `PrivateRoute.tsx` — Redirect ke `/login` jika belum auth atau role tidak sesuai

### 5.F Halaman Publik

- [ ] **5.25** Buat `src/pages/public/HomePage.tsx`:
  - Panggil `listEvents()`, tampilkan grid `EventCard`
  - Pagination sederhana
  - Search bar filter event
  - Skeleton loading state

- [ ] **5.26** Buat `src/pages/public/EventDetailPage.tsx`:
  - Fetch detail event by slug
  - Tampilkan: banner, deskripsi, jadwal, lokasi, harga, info pembayaran (jika paid), sisa kuota
  - Tombol "Daftar Sekarang" → navigate ke `/events/:id/register`
  - Handle: deadline lewat, kuota penuh (disable tombol + pesan)

- [ ] **5.27** Buat `src/pages/public/RegisterPage.tsx`:
  - Jika user login: form auto-fill dari profil (nama, email, phone), boleh edit
  - Jika guest: form wajib isi nama, email, phone
  - Jika event berbayar: tampilkan info rekening + field upload bukti transfer (input file)
  - Preview bukti transfer sebelum submit
  - Submit via `registerForEvent()` dengan FormData
  - Success: tampilkan pesan + link ke halaman tiket digital (magicToken)
  - Error handling: kuota penuh, deadline lewat, email sudah terdaftar

### 5.G Halaman Auth

- [ ] **5.28** Buat `src/pages/auth/LoginPage.tsx`:
  - Form email + password dengan validasi Zod
  - Panggil `useAuth().login()`
  - Redirect ke halaman asal atau `/my-tickets` setelah login
  - Link ke halaman daftar akun

- [ ] **5.29** Buat `src/pages/auth/RegisterAccountPage.tsx`:
  - Form: nama, email, password, konfirmasi password, phone (optional)
  - Validasi Zod di sisi client
  - Auto-login setelah daftar sukses

### 5.H Halaman Peserta

- [ ] **5.30** Buat `src/pages/attendee/MyTicketsPage.tsx` (Hanya User login):
  - Daftar tiket user dengan status masing-masing
  - Tiap tiket ada tombol "Lihat Tiket Digital" → ke `/tickets/:magicToken`

- [ ] **5.31** Buat `src/pages/attendee/DigitalTicketPage.tsx` (Publik via Magic Link):
  - Fetch detail tiket by `magicToken`
  - Tampilkan `TicketCard` dengan semua detail
  - Render QR Code tiket (nilai: `ticketCode`) menggunakan `QRCodeDisplay`
  - **Conditional Buttons**:
    - Jika `status !== CONFIRMED`: tampilkan banner "Tiket belum dikonfirmasi"
    - Jika `checkInStatus === NOT_CHECKED_IN`: tampilkan badge "Belum Check-in"
    - Jika `attendanceEnabled && checkInStatus === CHECKED_IN && attendanceStatus === ABSENT`:
      → Tampilkan tombol aktif **"Scan Absensi Acara"** (buka modal scanner)
    - Jika `attendanceStatus === ATTENDED`: tampilkan badge "✅ Sudah Absen [jam]"
  - Modal Scanner Absensi:
    - Aktifkan `QRScanner` component (kamera belakang)
    - Saat QR terbaca: POST ke `/api/attendance/verify`
    - Feedback:
      - Sukses: tampilkan overlay hijau "🎉 Absensi Berhasil!" + tutup modal
      - Gagal (expired): tampilkan "QR kedaluwarsa, scan ulang layar"
      - Gagal (belum gate check-in): tampilkan "Hubungi staff di pintu masuk"

### 5.I Halaman Admin

- [ ] **5.32** Buat `src/pages/admin/EventListPage.tsx`:
  - Tabel daftar semua event (termasuk draft)
  - Kolom: judul, tanggal, harga, kuota, status publish, jumlah pendaftar
  - Tombol: Edit, Toggle Publish, Lihat Proyektor Absensi

- [ ] **5.33** Buat `src/pages/admin/EventFormPage.tsx` (Create & Edit):
  - Form lengkap untuk membuat/mengedit event:
    - Judul, Deskripsi (textarea), Upload banner (preview)
    - Toggle isPaid → kondisional tampilkan field harga dan rekening bank
    - Kapasitas (0 = unlimited)
    - Date pickers: Deadline Registrasi, Tanggal Mulai, Tanggal Selesai
    - Lokasi
    - Toggle Absensi Aktif, Toggle Publish
  - Validasi penuh di sisi client sebelum submit
  - Mode: Create (POST) atau Edit (PUT) berdasarkan ada/tidaknya param `:id`

- [ ] **5.34** Buat `src/pages/admin/PaymentReviewPage.tsx`:
  - Filter by event + filter by status (PAYMENT_SUBMITTED, CONFIRMED, REJECTED)
  - Tabel pendaftar dengan: nama, email, event, tanggal daftar, status, link bukti bayar
  - Tombol Approve (hijau) / Reject (merah) per baris
  - Modal reject: input alasan penolakan (required, min 10 karakter)
  - Konfirmasi sebelum approve (agar tidak salah klik)
  - Auto-refresh setelah action sukses

- [ ] **5.35** Buat `src/pages/admin/VenuePresenterPage.tsx`:
  - Route: `/admin/events/:id/live-attendance`
  - Layout full-screen (tombol fullscreen toggle)
  - Polling tiap 5 detik ke `getLiveAttendanceToken(eventId)`
  - Render `QRCodeDisplay` dengan nilai `qrPayload` terbaru
  - Tampilkan `AttendanceTimer` countdown (expiresInMs dari API)
  - Tampilkan counter "X Peserta Telah Hadir" (data dari `listRegistrations` filter ATTENDED)
  - Background gelap untuk kontras QR code di proyektor

### 5.J Halaman Staff

- [ ] **5.36** Buat `src/pages/staff/GateScannerPage.tsx`:
  - `QRScanner` component aktif (kamera belakang)
  - Setiap QR scan berhasil:
    - POST ke `/api/staff/check-in`
    - Tampilkan result card dengan nama peserta + event
    - Feedback visual:
      - ✅ Hijau animasi: "Selamat Datang [Nama]!"
      - ⚠️ Oranye: "Tiket sudah digunakan pada [jam]"
      - ❌ Merah: "Tiket tidak valid atau belum dikonfirmasi"
    - Auto-reset kamera scan setelah 3 detik untuk siap scan berikutnya
  - Input manual field (fallback untuk QR tidak terbaca):
    - Input teks ticketCode + tombol submit
  - Counter: "X dari Y peserta telah check-in"

**Verifikasi Phase 5**:
- `npm run dev -w apps/frontend` berjalan di `localhost:5173`
- Test semua halaman publik dapat diakses tanpa auth
- Test login → redirect ke halaman yang sesuai berdasarkan role
- Test alur registrasi (guest dan user login)
- Test scan QR di halaman staff (simulasi ticketCode valid)
- Test halaman proyektor: QR berubah setiap 10 detik

---

## Phase 6: Integration, Testing & Verification

> Tujuan: Verifikasi end-to-end semua alur kerja kritis, penanganan edge cases, dan kesiapan deployment.

### 6.A End-to-End Workflow Testing

- [ ] **6.1** **Alur Event Gratis (Guest)**:
  1. Guest buka `/events/:slug`
  2. Klik "Daftar Sekarang"
  3. Isi nama, email, phone
  4. Submit → dapat response sukses
  5. Cek email: tiket HTML dengan QR code masuk
  6. Buka magic link → halaman tiket terbuka tanpa login
  7. Verifikasi semua data benar di halaman tiket

- [ ] **6.2** **Alur Event Berbayar (User login)**:
  1. User login → profil auto-fill
  2. Upload bukti transfer → status `PAYMENT_SUBMITTED`
  3. Admin login → lihat di Payment Review
  4. Admin approve → email tiket terkirim ke user
  5. User buka `/my-tickets` → tiket status `CONFIRMED`

- [ ] **6.3** **Alur Reject Pembayaran**:
  1. Admin reject dengan alasan
  2. User dapat notifikasi (cek di dashboard jika ada halaman status)
  3. User upload ulang bukti → status kembali `PAYMENT_SUBMITTED`

- [ ] **6.4** **Alur Gate Check-In**:
  1. Staff login → buka `/staff/gate-scanner`
  2. Scan QR code tiket peserta (status CONFIRMED)
  3. Verifikasi: response ✅ sukses, nama peserta tampil
  4. Scan ulang tiket yang sama → response ⚠️ sudah check-in

- [ ] **6.5** **Alur Absensi Dinamis**:
  1. Admin buka `/admin/events/:id/live-attendance` di layar proyektor
  2. QR code tampil dan berganti setiap 10 detik
  3. Peserta (sudah check-in) buka magic link di HP
  4. Klik "Scan Absensi" → kamera aktif
  5. Arahkan ke layar proyektor → scan berhasil
  6. Tampil feedback ✅ Absensi Berhasil
  7. Coba scan lagi → dapat pesan "sudah tercatat"

### 6.B Edge Case Testing

- [ ] **6.6** Daftar event dengan email yang sudah terdaftar → error 409 "Email sudah terdaftar"
- [ ] **6.7** Daftar event setelah deadline → error 400 "Batas pendaftaran sudah lewat"
- [ ] **6.8** Daftar event saat kuota penuh → error 400 "Kuota peserta sudah penuh"
- [ ] **6.9** Scan QR attendance yang sudah expired (> 15 detik) → error "QR kedaluwarsa"
- [ ] **6.10** Scan QR attendance oleh peserta yang belum gate check-in → error 403
- [ ] **6.11** Upload file bukti bayar > 5MB → error 400 "Ukuran file terlalu besar"
- [ ] **6.12** Upload file bukan gambar/PDF (misal `.exe`) → error 400 "Format file tidak valid"
- [ ] **6.13** Akses `/admin/*` tanpa token → redirect ke login (401)
- [ ] **6.14** Akses `/admin/*` dengan token STAFF → 403 Forbidden
- [ ] **6.15** Magic link dengan token tidak valid → 404 halaman tidak ditemukan

### 6.C Build & Type-Check Verification

- [ ] **6.16** `npm run type-check` di root → 0 TypeScript errors
- [ ] **6.17** `npm run build` di root → semua packages build sukses
- [ ] **6.18** `npm run lint` di root → 0 linting errors/warnings
- [ ] **6.19** Pastikan `dist/` directory terbentuk dengan benar di `apps/backend` dan `apps/frontend`

### 6.D Security Checklist

- [ ] **6.20** Verifikasi `attendanceSecret` tidak pernah muncul dalam response API
- [ ] **6.21** Verifikasi `passwordHash` tidak pernah muncul dalam response API
- [ ] **6.22** Verifikasi semua endpoint admin dan staff memerlukan token + role yang benar
- [ ] **6.23** Verifikasi upload path di luar direktori webroot (tidak bisa diakses langsung via browser tanpa route `/uploads`)
- [ ] **6.24** Verifikasi rate limiting aktif (coba > 100 request dalam 15 menit)

---

## Ringkasan File yang Akan Dibuat/Dimodifikasi

| Phase | File Baru | Estimasi |
|:---|:---|:---|
| Phase 0 | 5 file (config root) | ~30 menit |
| Phase 1 | ~12 file (shared package) | ~1 jam |
| Phase 2 | 2 file (schema.prisma, seed) | ~45 menit |
| Phase 3 | ~35 file (domain + use cases + services) | ~4 jam |
| Phase 4 | ~18 file (controllers + routes + middlewares) | ~3 jam |
| Phase 5 | ~40 file (pages + components + hooks) | ~6 jam |
| Phase 6 | Testing & verifikasi | ~2 jam |
| **Total** | **~112 file** | **~17 jam** |
