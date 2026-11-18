# Project Rules: Event Ticketing System

## 1. Core Workflow Governance (STRICTLY ENFORCED)

Setiap kali diminta untuk membuat **fitur baru**, melakukan **revisi**, atau **bug fixing**, agen **WAJIB** mematuhi tata kelola berikut:

### 1.1 Tahap Perencanaan Wajib (Pre-Execution Planning)
Sebelum menulis atau memodifikasi satu baris kode pun (zero code execution), agen harus membuat dua dokumen perencanaan:
1. **`implementation_plan.md`**:
   - Analisis kebutuhan dan konteks teknis.
   - Pemetaan Clean Architecture (Entities, Use Cases, Controller, UI Component).
   - Kontrak API & Request/Response payload.
   - Skema validasi (Zod) & perubahan database (Prisma) jika ada.
   - Penanganan error, security, dan edge cases.
2. **`task.md`**:
   - Ditulis dengan **sangat detail** dan terstruktur **per fase (Phase-based)**:
     - `Phase 1: Shared Models, Schemas & Types (packages/shared)`
     - `Phase 2: Database Schema & Migration (Prisma MySQL)`
     - `Phase 3: Backend Domain & Application Layer (Use Cases, Services, Repositories)`
     - `Phase 4: Backend Delivery Mechanism (Controllers, Routes, Middlewares)`
     - `Phase 5: Frontend Presentation & State (Pages, Components, Hooks)`
     - `Phase 6: Integration, Testing & Verification`
   - Setiap item tugas harus memiliki checkbox `[ ]` yang jelas dan dapat dilacak progresnya.

### 1.2 Aturan Gerbang Eksekusi (Execution Freeze)
> [!CRITICAL]
> **DILARANG KERAS** mengeksekusi coding, menginstal package baru, atau mengubah kode sebelum pengguna memberikan perintah eksplisit untuk eksekusi (misal: "eksekusi", "lanjutkan", "proceed", "mulai coding").
> 
> Setelah menyajikan `implementation_plan.md` dan `task.md`, agen **HARUS BERHENTI** dan meminta persetujuan serta perintah eksekusi dari pengguna.

---

## 2. Prinsip Clean Architecture & Best Practices

Sistem ini menganut prinsip **Clean Architecture (Robert C. Martin)** yang disesuaikan dengan arsitektur Monorepo TypeScript:

```
[ Domain / Entities ]  <-- Inti aturan bisnis independen (Enterprise Business Rules)
       ▲
[ Application / Use Cases ]  <-- Alur bisnis spesifik aplikasi (Application Business Rules)
       ▲
[ Interface Adapters ]  <-- Controllers, Presenters, Gateways, DTO Mappers
       ▲
[ Frameworks & Drivers ]  <-- Express.js, Prisma ORM, MySQL, React Vite, Multer, Nodemailer
```

### 2.1 Dependency Rule
- Dependensi kode hanya boleh mengarah **ke dalam** (menuju Domain/Entities).
- Domain tidak boleh mengimpor Express, Prisma, atau library eksternal framework apa pun.
- Database (Prisma) dan Web Framework (Express/React) berada di lapisan terluar (Frameworks & Drivers).

### 2.2 Struktur Kode Backend (`apps/backend`)
- **`domain/`**: Entitas murni, Value Objects, Domain Errors, dan Interface Repository.
- **`use-cases/`**: Logika bisnis per fitur (misal: `RegisterAttendeeUseCase`, `ApprovePaymentUseCase`, `VerifyGateCheckInUseCase`, `VerifyDynamicAttendanceUseCase`).
- **`controllers/`**: Menerima request HTTP, validasi payload via Zod, memanggil Use Case, dan mengembalikan response JSON.
- **`repositories/`**: Implementasi konkrit akses database menggunakan Prisma Client.
- **`infrastructure/`**: Konfigurasi Express, Prisma, Nodemailer, Multer, TOTP crypto engine.

### 2.3 Shared Package (`packages/shared`)
- Segala definisi tipe (DTO, Request/Response interfaces), enum status (`RegistrationStatus`, `CheckInStatus`, `AttendanceStatus`, `Role`), dan skema validasi Zod diletakkan di `packages/shared` agar tipe data antara Backend dan Frontend selalu 100% sinkron (Single Source of Truth).

### 2.4 Frontend Clean Architecture (`apps/frontend`)
- **Presentational vs Container Components**: Pisahkan logika state/fetching dari tampilan UI murni.
- **Custom Hooks**: Enkapsulasi use-case frontend (misal: `useGateScanner`, `useAttendanceScanner`, `useEventDetails`).
- **API Services**: Komunikasi HTTP diisolasi dalam modul service (`services/api/*.ts`), tidak dipanggil langsung di dalam JSX komponen.

### 2.5 Coding & Security Standards
- **Strict TypeScript**: Hindari penggunaan `any`. Selalu definisikan tipe/interface eksplisit.
- **Input Validation**: Setiap input publik wajib divalidasi dengan Zod schema sebelum diproses.
- **Error Handling**: Gunakan format response error yang terstandarisasi `{ success: false, message: string, errors?: any }`.
- **Security**: Tidak mengekspos rahasia (`attendanceSecret`, password hash, JWT secret) ke publik. Dynamic QR wajib divalidasi dengan window toleransi waktu ketat.

---

## 3. Standar Desain UI (STRICTLY ENFORCED)

### 3.1 Icon — Wajib Lucide React (DILARANG Emoji)

> **DILARANG KERAS** menggunakan emoji atau emoticon (🎫 ✅ ⚠️ 📅 📍 🔍 dll.) sebagai pengganti icon di dalam kode UI (JSX/TSX).

**Wajib menggunakan `lucide-react`** sebagai library icon resmi untuk seluruh proyek frontend.

```tsx
// ✅ BENAR — Gunakan Lucide React
import { Ticket, CalendarDays, MapPin, CheckCircle, AlertTriangle, Search, QrCode, Users, LogOut } from 'lucide-react';

<CheckCircle className="w-5 h-5 text-green-500" />
<CalendarDays className="w-4 h-4 text-slate-400" />

// ❌ SALAH — Dilarang keras
<span>🎫</span>
<span>✅</span>
<span>📅</span>
```

**Referensi icon wajib per konteks:**

| Konteks | Lucide Icon |
|:---|:---|
| Tiket | `Ticket`, `TicketCheck` |
| Event / Kalender | `CalendarDays`, `Calendar`, `Clock` |
| Lokasi / Venue | `MapPin`, `Building2` |
| Pengguna / Peserta | `User`, `Users`, `UserCheck` |
| Pembayaran | `CreditCard`, `Receipt`, `Banknote` |
| Check-in / Verifikasi | `ScanLine`, `QrCode`, `CheckCircle`, `ShieldCheck` |
| Status sukses | `CheckCircle`, `CircleCheck` |
| Status gagal / error | `XCircle`, `AlertCircle` |
| Status peringatan | `AlertTriangle`, `AlertCircle` |
| Upload file | `Upload`, `FileUp`, `Paperclip` |
| Email / Notifikasi | `Mail`, `Send`, `Bell` |
| Login / Logout | `LogIn`, `LogOut`, `Lock`, `Unlock` |
| Edit / Pengaturan | `Pencil`, `Settings`, `Sliders` |
| Hapus | `Trash2` |
| Tambah | `Plus`, `PlusCircle` |
| Cari | `Search` |
| Filter | `Filter`, `ListFilter` |
| Dashboard / Home | `LayoutDashboard`, `Home` |
| Scan Kamera | `Camera`, `ScanLine` |
| Panah navigasi | `ChevronRight`, `ChevronLeft`, `ArrowRight` |
| Countdown / Timer | `Timer`, `Clock` |

### 3.2 Design System — Konsistensi Warna & Komponen

Seluruh komponen UI **WAJIB** mengikuti design system yang telah ditetapkan:

- **Warna dominan**: Biru muda — palet `blue-50` s.d. `blue-700` dan `sky-400`/`sky-500` sebagai aksen.
- **Primary button**: Gradient `#2563EB → #0EA5E9`, border-radius `full` (pill shape).
- **Card**: Glass morphism (`bg-white/65 backdrop-blur-md`) dengan border `blue-200/40`.
- **Background page**: Gradient `#EFF6FF → #DBEAFE → #BAE6FD`.
- **Font**: Inter (sans-serif) untuk semua teks; JetBrains Mono untuk kode tiket & token.
- **Referensi CSS Variables & Tailwind config**: lihat `.agents/skills/clean-architecture-dev/references/design-system.css` dan `.agents/skills/clean-architecture-dev/references/tailwind.design-system.config.ts`.

### 3.3 Larangan Eksplisit dalam Kode UI

- **DILARANG** menggunakan emoji/emoticon di JSX, HTML, atau string yang dirender sebagai UI.
- **DILARANG** menggunakan hardcoded warna di luar design token yang telah ditetapkan (misal: `text-purple-500`, `bg-pink-200` tanpa alasan desain yang jelas).
- **DILARANG** menggunakan inline style secara berlebihan — utamakan Tailwind utility classes.
- **DILARANG** menggunakan icon library lain (FontAwesome, Material Icons, dll.) — hanya `lucide-react`.
