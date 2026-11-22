import { RegistrationStatus, CheckInStatus, AttendanceStatus } from 'shared';

export interface RegistrationProps {
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
  approvedAt?: Date | null;
  approvedByAdminId?: string | null;
  checkInStatus: CheckInStatus;
  checkedInAt?: Date | null;
  checkedInByStaffId?: string | null;
  attendanceStatus: AttendanceStatus;
  attendedAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export class Registration {
  public readonly id: string;
  public ticketCode: string | null;
  public readonly magicToken: string;
  public readonly eventId: string;
  public userId: string | null;
  public name: string;
  public email: string;
  public phone: string;
  public status: RegistrationStatus;
  public paymentProofUrl: string | null;
  public rejectionReason: string | null;
  public approvedAt: Date | null;
  public approvedByAdminId: string | null;
  public checkInStatus: CheckInStatus;
  public checkedInAt: Date | null;
  public checkedInByStaffId: string | null;
  public attendanceStatus: AttendanceStatus;
  public attendedAt: Date | null;
  public readonly createdAt: Date;
  public updatedAt: Date;

  constructor(props: RegistrationProps) {
    this.id = props.id;
    this.ticketCode = props.ticketCode ?? null;
    this.magicToken = props.magicToken;
    this.eventId = props.eventId;
    this.userId = props.userId ?? null;
    this.name = props.name.trim();
    this.email = props.email.toLowerCase().trim();
    this.phone = props.phone.trim();
    this.status = props.status;
    this.paymentProofUrl = props.paymentProofUrl ?? null;
    this.rejectionReason = props.rejectionReason ?? null;
    this.approvedAt = props.approvedAt ? new Date(props.approvedAt) : null;
    this.approvedByAdminId = props.approvedByAdminId ?? null;
    this.checkInStatus = props.checkInStatus;
    this.checkedInAt = props.checkedInAt ? new Date(props.checkedInAt) : null;
    this.checkedInByStaffId = props.checkedInByStaffId ?? null;
    this.attendanceStatus = props.attendanceStatus;
    this.attendedAt = props.attendedAt ? new Date(props.attendedAt) : null;
    this.createdAt = new Date(props.createdAt);
    this.updatedAt = new Date(props.updatedAt);
  }

  public isConfirmed(): boolean {
    return this.status === RegistrationStatus.CONFIRMED;
  }

  public isWaitingPayment(): boolean {
    return this.status === RegistrationStatus.WAITING_PAYMENT;
  }

  public isPaymentSubmitted(): boolean {
    return this.status === RegistrationStatus.PAYMENT_SUBMITTED;
  }

  public submitPaymentProof(proofUrl: string): void {
    this.paymentProofUrl = proofUrl;
    this.status = RegistrationStatus.PAYMENT_SUBMITTED;
    this.rejectionReason = null;
    this.updatedAt = new Date();
  }

  public approvePayment(adminId: string, generatedTicketCode?: string): void {
    this.status = RegistrationStatus.CONFIRMED;
    if (generatedTicketCode) {
      this.ticketCode = generatedTicketCode;
    }
    this.approvedAt = new Date();
    this.approvedByAdminId = adminId;
    this.rejectionReason = null;
    this.updatedAt = new Date();
  }

  public rejectPayment(reason: string, adminId: string): void {
    this.status = RegistrationStatus.REJECTED;
    this.rejectionReason = reason;
    this.approvedByAdminId = adminId;
    this.updatedAt = new Date();
  }

  public canCheckIn(): boolean {
    return (
      this.status === RegistrationStatus.CONFIRMED &&
      this.checkInStatus === CheckInStatus.NOT_CHECKED_IN
    );
  }

  public checkIn(staffId: string): void {
    this.checkInStatus = CheckInStatus.CHECKED_IN;
    this.checkedInAt = new Date();
    this.checkedInByStaffId = staffId;
    this.updatedAt = new Date();
  }

  public canMarkAttendance(): boolean {
    return (
      this.checkInStatus === CheckInStatus.CHECKED_IN &&
      this.attendanceStatus === AttendanceStatus.ABSENT
    );
  }

  public markAttendance(): void {
    this.attendanceStatus = AttendanceStatus.ATTENDED;
    this.attendedAt = new Date();
    this.updatedAt = new Date();
  }
}
