import { Registration } from '../entities/Registration';
import { RegistrationStatus, CheckInStatus, AttendanceStatus } from 'shared';

export interface FindRegistrationsFilter {
  eventId?: string;
  status?: RegistrationStatus;
  checkInStatus?: CheckInStatus;
  attendanceStatus?: AttendanceStatus;
  search?: string;
  userId?: string;
  skip?: number;
  take?: number;
}

export interface IRegistrationRepository {
  findById(id: string): Promise<Registration | null>;
  findByTicketCode(ticketCode: string): Promise<Registration | null>;
  findByMagicToken(magicToken: string): Promise<Registration | null>;
  findByEventAndEmail(eventId: string, email: string): Promise<Registration | null>;
  findAll(filters: FindRegistrationsFilter): Promise<Registration[]>;
  findAllByEvent(
    eventId?: string,
    status?: RegistrationStatus,
    options?: { skip?: number; take?: number; search?: string }
  ): Promise<Registration[]>;
  findByUserId(userId: string): Promise<Registration[]>;
  countByEventId(eventId: string, statuses?: RegistrationStatus[]): Promise<number>;
  create(registration: Registration): Promise<Registration>;
  update(registration: Registration): Promise<Registration>;
}
