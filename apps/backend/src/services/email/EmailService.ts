import nodemailer, { Transporter } from 'nodemailer';
import { generateTicketEmailHTML, ITicketEmailData } from './templates/ticket.template';
import { QRGenerator } from '../qr/QRGenerator';

export class EmailService {
  private transporter: Transporter | null = null;
  private isConfigured: boolean = false;

  constructor() {
    this.initTransporter();
  }

  private initTransporter(): void {
    const host = process.env.SMTP_HOST;
    const port = parseInt(process.env.SMTP_PORT || '587', 10);
    const user = process.env.SMTP_USER;
    const pass = process.env.SMTP_PASS;

    // Determine if valid production or real SMTP is provided
    if (host && host !== 'smtp.example.com' && user && pass) {
      this.transporter = nodemailer.createTransport({
        host,
        port,
        secure: port === 465,
        auth: {
          user,
          pass,
        },
        connectionTimeout: 5000,
        greetingTimeout: 5000,
        socketTimeout: 10000,
      });
      this.isConfigured = true;
    } else {
      // Development / simulated fallback transporter
      this.transporter = null;
      this.isConfigured = false;
    }
  }

  /**
   * Sends a ticket confirmation email to the attendee with visual card and embedded QR code.
   * @param to Attendee recipient email address
   * @param data Ticket and event information
   * @returns Promise<boolean> indicating whether the email was dispatched
   */
  public async sendTicketEmail(to: string, data: ITicketEmailData): Promise<boolean> {
    try {
      // 1. Ensure QR Code Data URL is populated
      let qrCodeDataUrl = data.qrCodeDataUrl;
      if (!qrCodeDataUrl) {
        qrCodeDataUrl = await QRGenerator.generateQRCodeDataURL(data.ticketCode);
      }

      // 2. Ensure Magic Link is populated
      const appUrl = data.appUrl || process.env.APP_URL || 'http://localhost:5173';
      const magicLinkUrl = data.magicLinkUrl || `${appUrl}/tickets/${data.magicToken}`;

      const enrichedData: ITicketEmailData = {
        ...data,
        qrCodeDataUrl,
        magicLinkUrl,
        appUrl,
      };

      // 3. Generate HTML body
      const html = generateTicketEmailHTML(enrichedData);
      const from = process.env.SMTP_FROM || 'Event Ticketing <noreply@example.com>';
      const subject = `E-Tiket Resmi: ${data.eventTitle} [${data.ticketCode}]`;

      // 4. Send via Nodemailer if configured, or simulate in development
      if (this.isConfigured && this.transporter) {
        await this.transporter.sendMail({
          from,
          to,
          subject,
          html,
        });
        console.log(`[EmailService] Ticket email successfully sent to ${to} (${data.ticketCode})`);
      } else {
        console.log(`[EmailService] (DEV / SIMULATION) Ticket email dispatched to: ${to}`);
        console.log(`[EmailService] Ticket Code: ${data.ticketCode} | Magic Link: ${magicLinkUrl}`);
      }

      return true;
    } catch (error) {
      console.error(`[EmailService] Error sending ticket email to ${to}:`, error);
      // In non-critical failures we avoid crashing the caller
      return false;
    }
  }
}

export const emailService = new EmailService();
