import { RegistrationStatus, CheckInStatus, AttendanceStatus } from '../enums';

export interface IRegistration {
  id: string;
  ticketCode?: string | null;
  magicToken: string;
  eventId: string;
  userId?: string | null;
  name: string;
  email: string;
  phone: string;
  status: RegistrationStatus;
  paymentProofUrl?: string | null;
  rejectionReason?: string | null;
  approvedAt?: Date | string | null;
  approvedByAdminId?: string | null;
  checkInStatus: CheckInStatus;
  checkedInAt?: Date | string | null;
  checkedInByStaffId?: string | null;
  attendanceStatus: AttendanceStatus;
  attendedAt?: Date | string | null;
  createdAt: Date | string;
  updatedAt: Date | string;
}

export interface ITicketDetail {
  id: string;
  ticketCode?: string | null;
  magicToken: string;
  status: RegistrationStatus;
  checkInStatus: CheckInStatus;
  checkedInAt?: Date | string | null;
  attendanceStatus: AttendanceStatus;
  attendedAt?: Date | string | null;
  attendeeName: string;
  attendeeEmail: string;
  attendeePhone: string;
  eventId: string;
  eventTitle: string;
  eventSlug: string;
  eventStartDate: Date | string;
  eventEndDate: Date | string;
  eventLocation: string;
  eventBannerUrl?: string | null;
  attendanceEnabled: boolean;
}

export interface IRegistrationListItem {
  id: string;
  ticketCode?: string | null;
  name: string;
  email: string;
  phone: string;
  status: RegistrationStatus;
  paymentProofUrl?: string | null;
  rejectionReason?: string | null;
  checkInStatus: CheckInStatus;
  checkedInAt?: Date | string | null;
  attendanceStatus: AttendanceStatus;
  attendedAt?: Date | string | null;
  createdAt: Date | string;
  eventId: string;
  eventTitle: string;
}
