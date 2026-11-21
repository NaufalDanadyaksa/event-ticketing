import { CheckInStatus } from 'shared';
import { Registration, Event } from '../../domain/entities';
import {
  RegistrationNotFoundError,
  TicketNotConfirmedError,
  TicketAlreadyCheckedInError,
} from '../../domain/errors';
import { IRegistrationRepository, IEventRepository } from '../../domain/repositories';

export interface VerifyGateCheckInDTO {
  ticketCode: string;
  staffId: string;
}

export interface GateCheckInResult {
  registration: Registration;
  event?: Event | null;
  message: string;
}

export class VerifyGateCheckInUseCase {
  constructor(
    private readonly registrationRepository: IRegistrationRepository,
    private readonly eventRepository?: IEventRepository
  ) {}

  public async execute(dto: VerifyGateCheckInDTO): Promise<GateCheckInResult> {
    const code = dto.ticketCode.trim().toUpperCase();

    // 1. Find registration by ticket code
    const registration = await this.registrationRepository.findByTicketCode(code);
    if (!registration) {
      throw new RegistrationNotFoundError('Tiket dengan kode tersebut tidak ditemukan');
    }

    // 2. Validate ticket is confirmed
    if (!registration.isConfirmed()) {
      throw new TicketNotConfirmedError(
        `Tiket belum dikonfirmasi (status saat ini: ${registration.status})`
      );
    }

    // 3. Ensure attendee has not already checked in
    if (registration.checkInStatus === CheckInStatus.CHECKED_IN) {
      const checkedInTime = registration.checkedInAt
        ? registration.checkedInAt.toLocaleTimeString('id-ID')
        : '';
      throw new TicketAlreadyCheckedInError(
        `Tiket sudah pernah di-check in sebelumnya pada ${checkedInTime}`
      );
    }

    // 4. Update check-in status
    registration.checkIn(dto.staffId);
    const updatedRegistration = await this.registrationRepository.update(registration);

    // 5. Optionally retrieve event info for presenter/scanner display
    let event: Event | null = null;
    if (this.eventRepository) {
      event = await this.eventRepository.findById(updatedRegistration.eventId);
    }

    return {
      registration: updatedRegistration,
      event,
      message: 'Check-in gerbang masuk berhasil diverifikasi',
    };
  }
}
