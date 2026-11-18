# Implementation Plan Template

Gunakan format ini saat menyusun `implementation_plan.md` sebelum memulai pekerjaan:

```markdown
# Implementation Plan - [Nama Fitur / Perbaikan]

## 1. Ringkasan Kebutuhan (Overview)
- **Deskripsi**: Penjelasan singkat apa yang ingin dicapai atau masalah apa yang ingin diperbaiki.
- **Tujuan**: Hasil akhir terukur yang diharapkan.

## 2. Pemetaan Clean Architecture
- **Domain Layer (`apps/backend/src/domain`)**:
  - Entitas baru / perubahan entitas.
  - Aturan bisnis murni (Business Rules).
  - Domain Events & Domain Errors.
- **Application Layer (`apps/backend/src/use-cases`)**:
  - Daftar Use Case yang dibuat/diubah (misal: `RegisterAttendeeUseCase`).
  - Input DTO & Output DTO.
  - Abstraksi Interface Repository yang dibutuhkan.
- **Interface Adapters (`apps/backend/src/controllers`, `repositories`)**:
  - Controller HTTP & Route mapping.
  - Implementasi Prisma Repository.
- **Frameworks & Drivers (`apps/backend/src/infrastructure`)**:
  - Middleware, Mailer, Storage, atau external crypto helpers.
- **Shared Package (`packages/shared`)**:
  - Skema Zod untuk validasi payload.
  - Shared TypeScript interfaces.

## 3. Spesifikasi Database & Migrasi (Prisma)
- Perubahan model atau kolom pada `schema.prisma`.
- Perintah migrasi yang akan dijalankan.

## 4. Kontrak API (API Specifications)
- **Method & URL**: `POST /api/...`
- **Headers**: Authorization, Content-Type
- **Request Body Payload**: Contoh JSON
- **Success Response (200/201)**: Contoh JSON
- **Error Responses (400, 401, 403, 404, 409, 500)**: Format response terstandarisasi

## 5. Frontend Architecture & Flow (`apps/frontend`)
- Komponen & Halaman yang terdampak.
- State management & Custom Hook.
- Penanganan UI Feedback (Loading, Success toast, Error banner).

## 6. Edge Cases & Pertimbangan Keamanan
- Pencegahan double-submission / race condition.
- Verifikasi otorisasi & role guard.
- Validasi window time (pada QR dinamis).
```
