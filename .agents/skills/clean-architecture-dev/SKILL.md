---
name: clean-architecture-dev
description: >-
  Enforces Clean Architecture lifecycle, strict pre-execution planning (implementation_plan.md and task.md),
  and phase-based execution for features, revisions, and bug fixes in this monorepo.
---

# Clean Architecture Development & Feature Lifecycle Skill

Skill ini mengatur siklus hidup pengembangan fitur, revisi, dan perbaikan bug dengan pendekatan **Clean Architecture** dan **tata kelola ketat sebelum koding**.

## Alur Prosedur Kerja

```
[Permintaan Pengguna]
         │
         ▼
[1. Analisis & Rancang]
         │
         ▼
[2. Tulis implementation_plan.md]
         │
         ▼
[3. Tulis task.md (Sangat Detail, Per Fase)]
         │
         ▼
[4. BERHENTI & TAMPILKAN KE PENGGUNA] ──(Tunggu persetujuan)──┐
                                                              │
                                                     [User: "Eksekusi"]
                                                              │
                                                              ▼
                                              [5. Eksekusi Fase demi Fase]
                                                              │
                                                              ▼
                                              [6. Verifikasi & Pengujian]
```

---

## 1. Tahap Penyusunan Dokumen Perencanaan

Setiap kali menerima tugas fitur, revisi, atau bug fixing:

1. Buat berkas **`implementation_plan.md`**:
   - Gunakan panduan pada [implementation-plan-template.md](./references/implementation-plan-template.md).
   - Pastikan lapisan arsitektur (Domain, Use Case, Controller, Shared Types, Frontend) dipetakan dengan jelas.
2. Buat berkas **`task.md`**:
   - Gunakan template pada [task-template.md](./references/task-template.md).
   - Pastikan dipecah menjadi 6 fase terstruktur dengan checkbox `[ ]` yang detail.

---

## 2. Aturan Kritis: Execution Freeze

> [!CAUTION]
> Jangan pernah menulis kode implementasi (scaffold, create file code, edit file, install npm package) sebelum pengguna memberikan konfirmasi eksplisit!
> 
> Tampilkan ringkasan rencana dan tautan ke `implementation_plan.md` serta `task.md`, lalu katakan:
> *"Rencana implementasi dan daftar tugas telah disusun. Menunggu persetujuan/perintah dari Anda untuk memulai eksekusi."*

---

## 3. Eksekusi Berdasarkan Fase (Setelah Persetujuan Diterima)

Ketika pengguna memberikan perintah "eksekusi" atau sejenisnya:
1. Kerjakan tugas secara berurutan mulai dari **Phase 1** hingga **Phase 6**.
2. Centang checkbox pada `task.md` (`[x]`) setiap kali sebuah subtask selesai dikerjakan.
3. Patuhi aturan batas dependensi Clean Architecture:
   - **Domain murni**: Tidak ada import framework di folder `domain/`.
   - **Use cases**: Mengatur alur bisnis, memanggil interface repository.
   - **Shared package**: Menjadi single source of truth untuk tipe data dan skema validasi.
4. Lakukan verifikasi menyeluruh sebelum mengumumkan tugas selesai.

---

## 4. Standar UI — Icon & Design System

### 4.1 Larangan Emoji di Kode UI
> [!CAUTION]
> **DILARANG KERAS** menggunakan emoji atau emoticon sebagai icon di JSX/TSX. Ini termasuk semua karakter seperti 🎫 ✅ ⚠️ 📅 📍 🔍 — TIDAK BOLEH ada di dalam kode komponen.

### 4.2 Wajib Gunakan `lucide-react`

Seluruh icon di frontend **wajib** diimpor dari `lucide-react`:

```tsx
// ✅ WAJIB — import dari lucide-react
import {
  Ticket, TicketCheck, CalendarDays, MapPin, Users, User, UserCheck,
  QrCode, ScanLine, CheckCircle, XCircle, AlertTriangle, AlertCircle,
  CreditCard, Upload, Mail, LogIn, LogOut, Search, Filter,
  Pencil, Trash2, Plus, Settings, LayoutDashboard, Camera,
  ChevronRight, ArrowRight, Clock, Timer, ShieldCheck, Building2
} from 'lucide-react';

// ✅ Penggunaan yang benar
<CheckCircle className="w-5 h-5 text-green-500" />
<Ticket className="w-4 h-4 text-blue-600" />

// ❌ SALAH — DILARANG
<span>✅</span>
<div>🎫</div>
```

### 4.3 Design System — Konsistensi Warna
Selalu ikuti palet dan komponen dari:
- CSS Variables: `.agents/skills/clean-architecture-dev/references/design-system.css`
- Tailwind Config: `.agents/skills/clean-architecture-dev/references/tailwind.design-system.config.ts`
