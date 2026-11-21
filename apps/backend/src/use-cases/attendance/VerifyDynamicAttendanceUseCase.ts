import { CheckInStatus, AttendanceStatus, IAttendanceVerifyResult } from 'shared';
import { Registration } from '../../domain/entities';
import {
  EventNotFoundError,
  RegistrationNotFoundError,
  InvalidAttendanceTokenError,
  NotCheckedInError,
  AttendanceAlreadyRecordedError,
} from '../../domain/errors';
import { IEventRepository, IRegistrationRepository } from '../../domain/repositories';
import { AttendanceTokenEngine } from '../../services';

export interface VerifyDynamicAttendanceDTO {
  qrPayload: string;
  magicToken?: string;
  ticketCode?: string;
}

export interface DynamicAttendanceResult extends IAttendanceVerifyResult {
  registration: Registration;
}

export class VerifyDynamicAttendanceUseCase {
  constructor(
    private readonly registrationRepository: IRegistrationRepository,
    private readonly eventRepository: IEventRepository
  ) {}

  public async execute(dto: VerifyDynamicAttendanceDTO): Promise<DynamicAttendanceResult> {
    // 1. Parse and extract event ID from QR payload
    const parsedPayload = AttendanceTokenEngine.parsePayload(dto.qrPayload);
    if (!parsedPayload || !parsedPayload.eventId) {
      throw new InvalidAttendanceTokenError('Format QR code absensi tidak valid');
    }

    // 2. Fetch event to obtain secret
    const event = await this.eventRepository.findById(parsedPayload.eventId);
    if (!event) {
      throw new EventNotFoundError('Event untuk QR absensi ini tidak ditemukan');
    }

    if (!event.attendanceEnabled) {
      throw new InvalidAttendanceTokenError('Sesi absensi untuk event ini sedang tidak dibuka');
    }

    // 3. Verify dynamic rotating token cryptographic HMAC & 10s window (+/- 1 window tolerance)
    const verification = AttendanceTokenEngine.verifyToken(dto.qrPayload, event.attendanceSecret);
    if (!verification.valid) {
      throw new InvalidAttendanceTokenError(
        verification.message || 'QR Code absensi tidak valid atau telah kadaluarsa'
      );
    }

    // 4. Look up attendee registration by magicToken or ticketCode
    let registration: Registration | null = null;
    if (dto.magicToken) {
      registration = await this.registrationRepository.findByMagicToken(dto.magicToken.trim());
    } else if (dto.ticketCode) {
      registration = await this.registrationRepository.findByTicketCode(
        dto.ticketCode.trim().toUpperCase()
      );
    }

    if (!registration) {
      throw new RegistrationNotFoundError('Data pendaftaran tiket tidak ditemukan');
    }

    // 5. Ensure registration belongs to this event
    if (registration.eventId !== event.id) {
      throw new InvalidAttendanceTokenError('Tiket Anda bukan untuk event yang sedang berlangsung ini');
    }

    // 6. Enforce prerequisite: Attendee MUST have checked in at gate first
    if (registration.checkInStatus !== CheckInStatus.CHECKED_IN) {
      throw new NotCheckedInError(
        'Peserta belum melakukan check-in di gerbang masuk venue. Silakan lapor ke petugas pintu masuk.'
      );
    }

    // 7. Ensure attendance has not already been recorded
    if (registration.attendanceStatus === AttendanceStatus.ATTENDED) {
      const recordedTime = registration.attendedAt
        ? registration.attendedAt.toLocaleTimeString('id-ID')
        : '';
      throw new AttendanceAlreadyRecordedError(
        `Kehadiran sudah tercatat sebelumnya pada ${recordedTime}`
      );
    }

    // 8. Record attendance
    registration.markAttendance();
    const updated = await this.registrationRepository.update(registration);

    return {
      success: true,
      message: `Kehadiran peserta ${updated.name} berhasil diverifikasi`,
      attendeeName: updated.name,
      attendedAt: updated.attendedAt || new Date(),
      registration: updated,
    };
  }
}
