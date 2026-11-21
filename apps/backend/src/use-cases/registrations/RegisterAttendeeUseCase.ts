import { v4 as uuidv4 } from 'uuid';
import { RegistrationStatus, CheckInStatus, AttendanceStatus } from 'shared';
import { Registration } from '../../domain/entities';
import {
  EventNotFoundError,
  RegistrationDeadlinePassedError,
  EventQuotaFullError,
  UserAlreadyRegisteredError,
} from '../../domain/errors';
import { IEventRepository, IRegistrationRepository } from '../../domain/repositories';
import { EmailService } from '../../services';
import { generateTicketCode } from '../../utils';

export interface RegisterAttendeeDTO {
  eventId: string;
  name: string;
  email: string;
  phone: string;
  userId?: string | null;
  appUrl?: string;
}

export class RegisterAttendeeUseCase {
  constructor(
    private readonly registrationRepository: IRegistrationRepository,
    private readonly eventRepository: IEventRepository,
    private readonly emailService?: EmailService
  ) {}

  public async execute(dto: RegisterAttendeeDTO): Promise<Registration> {
    const email = dto.email.toLowerCase().trim();

    // 1. Validate event existence
    const event = await this.eventRepository.findById(dto.eventId);
    if (!event) {
      throw new EventNotFoundError('Event tidak ditemukan');
    }

    // 2. Validate registration deadline
    if (event.isDeadlinePassed()) {
      throw new RegistrationDeadlinePassedError('Batas waktu pendaftaran event telah berakhir');
    }

    // 3. Check event quota
    const registeredCount = await this.eventRepository.countRegistrations(dto.eventId, [
      RegistrationStatus.CONFIRMED,
      RegistrationStatus.PAYMENT_SUBMITTED,
    ]);
    if (event.isQuotaFull(registeredCount)) {
      throw new EventQuotaFullError('Kuota pendaftaran event telah penuh');
    }

    // 4. Validate duplicate email in active registrations for this event
    const existingRegistration = await this.registrationRepository.findByEventAndEmail(
      dto.eventId,
      email
    );
    if (
      existingRegistration &&
      existingRegistration.status !== RegistrationStatus.CANCELLED &&
      existingRegistration.status !== RegistrationStatus.REJECTED
    ) {
      throw new UserAlreadyRegisteredError('Email ini sudah terdaftar pada event ini');
    }

    // 5. Determine status based on event payment mode
    const status = event.isPaid
      ? RegistrationStatus.WAITING_PAYMENT
      : RegistrationStatus.CONFIRMED;
    const approvedAt = status === RegistrationStatus.CONFIRMED ? new Date() : null;

    // 6. Generate ticket code and unique magic token
    const ticketCode = generateTicketCode();
    const magicToken = uuidv4();

    // 7. Instantiate Registration Domain entity
    const registration = new Registration({
      id: uuidv4(),
      ticketCode,
      magicToken,
      eventId: event.id,
      userId: dto.userId ?? null,
      name: dto.name.trim(),
      email,
      phone: dto.phone.trim(),
      status,
      paymentProofUrl: null,
      rejectionReason: null,
      approvedAt,
      approvedByAdminId: null,
      checkInStatus: CheckInStatus.NOT_CHECKED_IN,
      checkedInAt: null,
      checkedInByStaffId: null,
      attendanceStatus: AttendanceStatus.ABSENT,
      attendedAt: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    // 8. Persist registration
    const saved = await this.registrationRepository.create(registration);

    // 9. If free event (automatically CONFIRMED), dispatch email with ticket details and QR
    if (saved.isConfirmed() && this.emailService) {
      try {
        await this.emailService.sendTicketEmail(saved.email, {
          recipientName: saved.name,
          recipientEmail: saved.email,
          recipientPhone: saved.phone,
          ticketCode: saved.ticketCode,
          magicToken: saved.magicToken,
          eventTitle: event.title,
          eventSlug: event.slug,
          eventStartDate: event.eventStartDate,
          eventEndDate: event.eventEndDate,
          eventLocation: event.location,
          qrCodeDataUrl: '',
          appUrl: dto.appUrl,
        });
      } catch (error) {
        console.error('[RegisterAttendeeUseCase] Error sending ticket email:', error);
      }
    }

    return saved;
  }
}
