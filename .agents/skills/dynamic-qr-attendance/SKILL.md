---
name: dynamic-qr-attendance
description: >-
  Guide and technical runbook for implementing, testing, and debugging the 10-second rotating TOTP/HMAC
  dynamic attendance QR system, venue presenter screen, and attendee mobile camera verification.
---

# Dynamic QR Attendance System (10-Second Rotation)

Skill ini adalah panduan teknis khusus untuk modul **Absensi Dinamis (Dynamic QR Attendance)** yang berganti setiap 10 detik. Modul ini dirancang untuk mencegah kecurangan kehadiran (seperti memfoto QR dan membagikannya ke orang di luar venue).

---

## 1. Spesifikasi Teknis Algoritma

### 1.1 Time-Window Token Calculation
- **Window Interval**: $T = 10\text{ detik}$.
- **Perhitungan Counter**:
  $$\text{timeStep} = \lfloor \frac{\text{epochSeconds}}{10} \rfloor$$
- **HMAC Signature**:
  Menggunakan `crypto.createHmac('sha256', event.attendanceSecret)`:
  $$\text{data} = \text{eventId} + ":" + \text{timeStep}$$
  $$\text{signature} = \text{hmac.update(data).digest('hex').substring(0, 16)}$$
- **QR Payload Format (JSON Base64Url)**:
  ```json
  {
    "eventId": "uuid-event",
    "step": 173194000,
    "sig": "a1b2c3d4e5f67890"
  }
  ```

### 1.2 Verifikasi di Backend (Tolerance Window)
Untuk mengatasi latensi jaringan saat scan:
- Backend mengecek $\text{timeStep}_{\text{current}}$ dan $\text{timeStep}_{\text{current}-1}$ (toleransi 1 window sebelumnya / max 5-10 detik lag).
- Jika signature tidak cocok pada kedua window tersebut, request ditolak dengan pesan: `"QR Code sudah kedaluwarsa, silakan scan ulang layar"`.

---

## 2. Syarat & Aturan Bisnis (Business Invariants)

Sebelum absensi dicatat sebagai `ATTENDED`:
1. **Gate Check-In Prerequisite**:
   - Pendaftar **WAJIB** sudah berstatus `checkInStatus = 'CHECKED_IN'` (sudah di-scan oleh staf di pintu masuk venue).
   - Jika belum: kembalikan error `"Anda belum melakukan check-in di pintu masuk!"`.
2. **Duplicate Attendance Check**:
   - Jika `attendanceStatus === 'ATTENDED'`, kembalikan status `400` / info `"Kehadiran Anda sudah tercatat sebelumnya pada [jam]"`.
3. **Event Timing Check**:
   - Event harus dalam status aktif (`now >= eventStartDate - 1 jam` dan `now <= eventEndDate + 2 jam`).

---

## 3. Komponen Antarmuka (UI Components)

### 3.1 Layar Proyektor Venue (`/admin/events/:id/live-attendance`)
- Layar penuh (Fullscreen ready) dengan kontras tinggi.
- Mengambil token baru tiap 10 detik dari endpoint `GET /api/events/:id/live-attendance-token`.
- Menampilkan visual timer bar (countdown 10s ke 0s) yang menyusut mulus.
- Menampilkan QR code yang diperbarui secara reaktif tanpa me-refresh seluruh halaman.
- Menampilkan jumlah peserta yang sudah berhasil absen secara real-time.

### 3.2 Pemindai Peserta (`/tickets/:magicToken` -> Modal Scanner)
- Diintegrasikan dengan library pemindai kamera web (misal: `html5-qrcode`).
- Meminta izin kamera HP (kamera belakang/environment).
- Saat QR terbaca, otomatis POST ke `/api/attendance/verify`.
- Tampilkan feedback visual:
  - 🟢 Hijau: Absensi Berhasil dicatat!
  - 🔴 Merah: QR Kedaluwarsa atau Belum Check-in di Gate.
