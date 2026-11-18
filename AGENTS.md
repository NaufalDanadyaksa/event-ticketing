# Project Rules: Event Ticketing System (AGENTS.md)

Lihat detail lengkap pedoman kerja pada [GEMINI.md](file:///Users/md101/dev/js/event-ticketing/GEMINI.md).

## Ringkasan Aturan Wajib:
1. **Perencanaan Sebelum Koding**: Wajib membuat `implementation_plan.md` dan `task.md` (sangat detail, terstruktur per fase) sebelum menulis atau mengedit kode untuk fitur, revisi, maupun bug fixing.
2. **Gerbang Eksekusi (Freeze)**: Dilarang keras melakukan eksekusi kode sebelum ada perintah eksplisit dari pengguna.
3. **Clean Architecture**: Pisahkan Domain, Use Cases, Interface Adapters, dan Frameworks/Drivers.
4. **TypeScript & Shared Types**: Tipe data, DTO, dan skema validasi wajib dikelola di `packages/shared`.
5. **Icon Profesional (lucide-react)**: Dilarang keras menggunakan emoji/emoticon di kode UI. Wajib menggunakan `lucide-react` sebagai satu-satunya library icon.
6. **Design System Konsisten**: Seluruh UI wajib mengikuti palet biru muda, komponen glass-morphism, dan Tailwind config yang telah ditetapkan.
