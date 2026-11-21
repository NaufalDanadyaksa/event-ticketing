export enum Role {
  ADMIN = 'ADMIN',
  STAFF = 'STAFF',
  USER = 'USER',
}

export enum RegistrationStatus {
  WAITING_PAYMENT = 'WAITING_PAYMENT',
  PAYMENT_SUBMITTED = 'PAYMENT_SUBMITTED',
  CONFIRMED = 'CONFIRMED',
  REJECTED = 'REJECTED',
  CANCELLED = 'CANCELLED',
}

export enum CheckInStatus {
  NOT_CHECKED_IN = 'NOT_CHECKED_IN',
  CHECKED_IN = 'CHECKED_IN',
}

export enum AttendanceStatus {
  ABSENT = 'ABSENT',
  ATTENDED = 'ATTENDED',
}
