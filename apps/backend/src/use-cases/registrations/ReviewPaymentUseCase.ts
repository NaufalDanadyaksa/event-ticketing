import { Registration } from '../../domain/entities';
import { RegistrationNotFoundError } from '../../domain/errors';
import { IEventRepository, IRegistrationRepository } from '../../domain/repositories';
import { EmailService } from '../../services';
import { generateTicketCode } from '../../utils';

export interface ReviewPaymentDTO {
  registrationId: string;
  adminId: string;
  action: 'APPROVE' | 'REJECT';
  rejectionReason?: string;
  appUrl?: string;
}

export class ReviewPaymentUseCase {
  constructor(
    private readonly registrationRepository: IRegistrationRepository,
    private readonly eventRepository: IEventRepository,
    private readonly emailService?: EmailService
  ) {}

  public async execute(dto: ReviewPaymentDTO): Promise<Registration> {
    const registration = await this.registrationRepository.findById(dto.registrationId);
    if (!registration) {
      throw new RegistrationNotFoundError('Data pendaftaran tidak ditemukan');
    }

    if (dto.action === 'APPROVE') {
      const ticketCode = registration.ticketCode || generateTicketCode();
      registration.approvePayment(dto.adminId, ticketCode);
      const updated = await this.registrationRepository.update(registration);

      // Dispatch ticket email on payment approval in background
      if (this.emailService) {
        this.eventRepository
          .findById(registration.eventId)
          .then((event) => {
            if (event && this.emailService) {
              return this.emailService.sendTicketEmail(updated.email, {
                recipientName: updated.name,
                recipientEmail: updated.email,
                recipientPhone: updated.phone,
                ticketCode: updated.ticketCode || '',
                magicToken: updated.magicToken,
                eventTitle: event.title,
                eventSlug: event.slug,
                eventStartDate: event.eventStartDate,
                eventEndDate: event.eventEndDate,
                eventLocation: event.location,
                qrCodeDataUrl: '',
                appUrl: dto.appUrl,
              });
            }
          })
          .catch((error) => {
            console.error('[ReviewPaymentUseCase] Failed to send ticket confirmation email:', error);
          });
      }

      return updated;
    } else {
      const reason = dto.rejectionReason?.trim() || 'Bukti transfer tidak valid atau tidak terbaca';
      registration.rejectPayment(reason, dto.adminId);
      return await this.registrationRepository.update(registration);
    }
  }
}
