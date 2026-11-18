# Task Template (Phase-Based)

Gunakan format ini saat menyusun `task.md`. Setiap tugas harus dirinci secara spesifik dan memiliki checkbox status.

```markdown
# Tasks Breakdown - [Nama Fitur / Perbaikan]

Status: ⏳ Menunggu Konfirmasi Eksekusi dari Pengguna

---

### Phase 1: Shared Models, Types & Validation (`packages/shared`)
- [ ] 1.1 Buat / perbarui enum dan interface di `packages/shared/src/types.ts`
- [ ] 1.2 Buat skema validasi Zod di `packages/shared/src/validations.ts`
- [ ] 1.3 Export seluruh type dan schema melalui `packages/shared/src/index.ts`
- [ ] 1.4 Jalankan type-check pada shared package

### Phase 2: Database Schema & Migration (Prisma MySQL)
- [ ] 2.1 Perbarui `schema.prisma` di `apps/backend/prisma/schema.prisma`
- [ ] 2.2 Jalankan migrasi Prisma (`npx prisma migrate dev --name <migration_name>`)
- [ ] 2.3 Generate Prisma Client terbaru (`npx prisma generate`)

### Phase 3: Domain & Application Use Cases (`apps/backend/src`)
- [ ] 3.1 Definisikan Entity dan Value Object di `domain/entities/`
- [ ] 3.2 Definisikan Interface Repository di `domain/repositories/`
- [ ] 3.3 Buat DTO Input/Output untuk Use Case
- [ ] 3.4 Implementasikan Use Case di `use-cases/` lengkap dengan business rules validation
- [ ] 3.5 Implementasikan concrete Prisma Repository di `repositories/`

### Phase 4: Delivery Layer & Infrastructure (`apps/backend/src`)
- [ ] 4.1 Buat Controller di `controllers/` dengan validasi request payload
- [ ] 4.2 Tambahkan middleware autentikasi dan role guard jika diperlukan
- [ ] 4.3 Daftarkan route di Express router (`routes/`)
- [ ] 4.4 Integrasikan service pendukung (Nodemailer / Multer / TOTP) jika relevan

### Phase 5: Frontend Presentation & Integration (`apps/frontend/src`)
- [ ] 5.1 Buat API service client di `services/api/`
- [ ] 5.2 Buat Custom Hook untuk data fetching / state machine
- [ ] 5.3 Buat Presentational UI Components di `components/`
- [ ] 5.4 Buat / perbarui Halaman di `pages/`
- [ ] 5.5 Tambahkan validasi form sisi klien dan feedback UX (loading, error, success)

### Phase 6: Testing, Edge Cases & Verification
- [ ] 6.1 Uji skenario sukses (Happy Path)
- [ ] 6.2 Uji skenario gagal & validasi (Unhappy Path)
- [ ] 6.3 Verifikasi pencegahan duplikasi (misal: double check-in, expired QR)
- [ ] 6.4 Jalankan full build lint & type-check (`npm run build`)
```
