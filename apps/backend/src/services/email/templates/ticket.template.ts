export interface ITicketEmailData {
  recipientName: string;
  recipientEmail: string;
  recipientPhone?: string;
  ticketCode: string;
  magicToken: string;
  eventTitle: string;
  eventSlug?: string;
  eventStartDate: Date | string;
  eventEndDate: Date | string;
  eventLocation: string;
  qrCodeDataUrl: string;
  appUrl?: string;
  magicLinkUrl?: string;
}

/**
 * Format date into clean Indonesian human readable format.
 */
function formatDate(dateInput: Date | string): string {
  try {
    const d = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;
    return d.toLocaleDateString('id-ID', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      timeZone: 'Asia/Jakarta',
    });
  } catch {
    return String(dateInput);
  }
}

/**
 * Generates a clean, professional, responsive HTML email template for event ticket delivery.
 * Adheres strictly to the blue theme and prohibits emojis.
 */
export function generateTicketEmailHTML(data: ITicketEmailData): string {
  const appBaseUrl = data.appUrl || process.env.APP_URL || 'http://localhost:5173';
  const magicLink = data.magicLinkUrl || `${appBaseUrl}/tickets/${data.magicToken}`;
  const startDateStr = formatDate(data.eventStartDate);
  const endDateStr = formatDate(data.eventEndDate);

  return `<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Tiket Elektronik Resmi - ${escapeHtml(data.eventTitle)}</title>
  <style>
    body {
      margin: 0;
      padding: 0;
      background-color: #F0F4F8;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      color: #1E293B;
      -webkit-font-smoothing: antialiased;
    }
    table {
      border-collapse: collapse;
    }
    .container {
      width: 100%;
      max-width: 600px;
      margin: 0 auto;
      background-color: #FFFFFF;
      border-radius: 16px;
      overflow: hidden;
      box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.05), 0 8px 10px -6px rgba(0, 0, 0, 0.05);
    }
    .header-bar {
      background: linear-gradient(135deg, #1E40AF 0%, #2563EB 50%, #0284C7 100%);
      padding: 36px 32px;
      text-align: center;
      color: #FFFFFF;
    }
    .header-tag {
      display: inline-block;
      background-color: rgba(255, 255, 255, 0.2);
      border: 1px solid rgba(255, 255, 255, 0.35);
      border-radius: 9999px;
      padding: 4px 14px;
      font-size: 11px;
      font-weight: 700;
      letter-spacing: 1px;
      text-transform: uppercase;
      margin-bottom: 12px;
    }
    .header-title {
      font-size: 24px;
      font-weight: 800;
      line-height: 1.3;
      margin: 0;
      color: #FFFFFF;
    }
    .content-body {
      padding: 32px 28px;
    }
    .ticket-card {
      background: #F8FAFC;
      border: 1px solid #E2E8F0;
      border-radius: 12px;
      padding: 24px;
      margin-bottom: 24px;
    }
    .code-badge {
      font-family: 'JetBrains Mono', 'SFMono-Regular', Consolas, monospace;
      font-size: 18px;
      font-weight: 700;
      color: #1E40AF;
      letter-spacing: 1.5px;
      background-color: #EFF6FF;
      border: 1px solid #BFDBFE;
      padding: 8px 16px;
      border-radius: 8px;
      display: inline-block;
    }
    .status-badge {
      display: inline-block;
      background-color: #DCFCE7;
      border: 1px solid #86EFAC;
      color: #15803D;
      font-size: 12px;
      font-weight: 700;
      padding: 4px 10px;
      border-radius: 9999px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .qr-container {
      text-align: center;
      padding: 24px 0 12px 0;
    }
    .qr-image {
      width: 220px;
      height: 220px;
      border-radius: 12px;
      border: 1px solid #CBD5E1;
      padding: 8px;
      background-color: #FFFFFF;
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
    }
    .detail-row {
      padding: 10px 0;
      border-bottom: 1px solid #F1F5F9;
    }
    .detail-label {
      font-size: 12px;
      text-transform: uppercase;
      font-weight: 600;
      color: #64748B;
      letter-spacing: 0.5px;
      width: 35%;
    }
    .detail-value {
      font-size: 14px;
      font-weight: 600;
      color: #0F172A;
      width: 65%;
      text-align: right;
    }
    .cta-container {
      text-align: center;
      padding: 24px 0 8px 0;
    }
    .cta-button {
      display: inline-block;
      background: linear-gradient(135deg, #2563EB 0%, #0EA5E9 100%);
      color: #FFFFFF !important;
      text-decoration: none;
      font-size: 15px;
      font-weight: 700;
      padding: 14px 32px;
      border-radius: 9999px;
      box-shadow: 0 4px 12px rgba(37, 99, 235, 0.3);
    }
    .instruction-box {
      background-color: #EFF6FF;
      border-left: 4px solid #2563EB;
      border-radius: 0 8px 8px 0;
      padding: 16px 20px;
      margin-top: 24px;
    }
    .instruction-title {
      font-size: 13px;
      font-weight: 700;
      color: #1E40AF;
      margin-bottom: 8px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .instruction-item {
      font-size: 13px;
      color: #334155;
      line-height: 1.5;
      margin-bottom: 6px;
    }
    .footer-bar {
      background-color: #F8FAFC;
      border-top: 1px solid #E2E8F0;
      padding: 24px;
      text-align: center;
      font-size: 12px;
      color: #64748B;
      line-height: 1.5;
    }
  </style>
</head>
<body>
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color: #F0F4F8; padding: 40px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" class="container" cellpadding="0" cellspacing="0">
          <!-- Header -->
          <tr>
            <td class="header-bar">
              <div class="header-tag">Konfirmasi Pendaftaran Resmi</div>
              <h1 class="header-title">${escapeHtml(data.eventTitle)}</h1>
            </td>
          </tr>

          <!-- Content -->
          <tr>
            <td class="content-body">
              <p style="font-size: 15px; line-height: 1.5; color: #334155; margin-top: 0; margin-bottom: 20px;">
                Halo <strong>${escapeHtml(data.recipientName)}</strong>, pendaftaran Anda telah berhasil dikonfirmasi. Berikut adalah rincian e-tiket resmi Anda:
              </p>

              <!-- Ticket Box -->
              <div class="ticket-card">
                <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 16px;">
                  <tr>
                    <td align="left">
                      <div class="code-badge">${escapeHtml(data.ticketCode)}</div>
                    </td>
                    <td align="right">
                      <span class="status-badge">Terkonfirmasi</span>
                    </td>
                  </tr>
                </table>

                <!-- QR Code -->
                <div class="qr-container">
                  <img src="${data.qrCodeDataUrl}" alt="QR Code Tiket Masuk" class="qr-image" />
                  <div style="font-size: 11px; color: #64748B; margin-top: 8px; font-weight: 500;">
                    Pindai di Gate Masuk Venue
                  </div>
                </div>

                <!-- Event & Attendee Details -->
                <table width="100%" cellpadding="0" cellspacing="0" style="margin-top: 16px;">
                  <tr class="detail-row">
                    <td class="detail-label">Nama Peserta</td>
                    <td class="detail-value">${escapeHtml(data.recipientName)}</td>
                  </tr>
                  <tr class="detail-row">
                    <td class="detail-label">Email</td>
                    <td class="detail-value">${escapeHtml(data.recipientEmail)}</td>
                  </tr>
                  ${data.recipientPhone ? `
                  <tr class="detail-row">
                    <td class="detail-label">No. Telepon</td>
                    <td class="detail-value">${escapeHtml(data.recipientPhone)}</td>
                  </tr>` : ''}
                  <tr class="detail-row">
                    <td class="detail-label">Waktu Mulai</td>
                    <td class="detail-value">${startDateStr}</td>
                  </tr>
                  <tr class="detail-row">
                    <td class="detail-label">Waktu Selesai</td>
                    <td class="detail-value">${endDateStr}</td>
                  </tr>
                  <tr class="detail-row" style="border-bottom: none;">
                    <td class="detail-label">Lokasi / Venue</td>
                    <td class="detail-value">${escapeHtml(data.eventLocation)}</td>
                  </tr>
                </table>
              </div>

              <!-- CTA Button -->
              <div class="cta-container">
                <a href="${magicLink}" class="cta-button" target="_blank" rel="noopener noreferrer">
                  Buka Tiket Digital & Scanner Absensi
                </a>
              </div>

              <!-- Instructions -->
              <div class="instruction-box">
                <div class="instruction-title">Panduan Kehadiran di Venue</div>
                <div class="instruction-item">
                  <strong>1. Pintu Masuk (Gate Check-In):</strong> Tunjukkan QR code pada email ini kepada petugas tiket saat tiba di lokasi.
                </div>
                <div class="instruction-item">
                  <strong>2. Absensi Ruangan (Dynamic QR):</strong> Klik tombol di atas untuk membuka pemindai kamera HP Anda, lalu arahkan ke layar proyektor venue saat sesi absensi dibuka.
                </div>
              </div>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td class="footer-bar">
              Email ini dibuat secara otomatis oleh Sistem Tiket & Absensi Digital.<br>
              Simpan email ini atau simpan tautan tiket Anda untuk memudahkan akses pada hari acara.
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

function escapeHtml(str: string): string {
  if (!str) return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
