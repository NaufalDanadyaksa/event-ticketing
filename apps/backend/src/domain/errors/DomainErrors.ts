export abstract class DomainError extends Error {
  public abstract readonly statusCode: number;

  constructor(message: string) {
    super(message);
    this.name = this.constructor.name;
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

export class EventNotFoundError extends DomainError {
  public readonly statusCode = 404;
  constructor(message = 'Event tidak ditemukan') {
    super(message);
  }
}

export class RegistrationDeadlinePassedError extends DomainError {
  public readonly statusCode = 400;
  constructor(message = 'Batas waktu pendaftaran event telah berakhir') {
    super(message);
  }
}

export class EventQuotaFullError extends DomainError {
  public readonly statusCode = 400;
  constructor(message = 'Kuota pendaftaran event telah penuh') {
    super(message);
  }
}

export class RegistrationNotFoundError extends DomainError {
  public readonly statusCode = 404;
  constructor(message = 'Data registrasi tidak ditemukan') {
    super(message);
  }
}

export class TicketAlreadyCheckedInError extends DomainError {
  public readonly statusCode = 400;
  constructor(message = 'Tiket sudah pernah di-check in sebelumnya di gerbang masuk') {
    super(message);
  }
}

export class TicketNotConfirmedError extends DomainError {
  public readonly statusCode = 400;
  constructor(message = 'Tiket belum dikonfirmasi (menunggu pembayaran atau ditolak)') {
    super(message);
  }
}

export class AttendanceAlreadyRecordedError extends DomainError {
  public readonly statusCode = 400;
  constructor(message = 'Kehadiran sesi sudah tercatat sebelumnya') {
    super(message);
  }
}

export class NotCheckedInError extends DomainError {
  public readonly statusCode = 400;
  constructor(message = 'Peserta belum melakukan check-in di gerbang masuk venue') {
    super(message);
  }
}

export class InvalidAttendanceTokenError extends DomainError {
  public readonly statusCode = 400;
  constructor(message = 'Token QR kehadiran tidak valid atau telah kadaluarsa') {
    super(message);
  }
}

export class UserAlreadyRegisteredError extends DomainError {
  public readonly statusCode = 400;
  constructor(message = 'Email ini sudah terdaftar pada event yang sama') {
    super(message);
  }
}

export class DuplicateEmailError extends DomainError {
  public readonly statusCode = 409;
  constructor(message = 'Email sudah digunakan oleh akun lain') {
    super(message);
  }
}

export class UnauthorizedError extends DomainError {
  public readonly statusCode = 401;
  constructor(message = 'Autentikasi gagal atau sesi telah berakhir') {
    super(message);
  }
}

export class ForbiddenError extends DomainError {
  public readonly statusCode = 403;
  constructor(message = 'Anda tidak memiliki hak akses untuk tindakan ini') {
    super(message);
  }
}

export class InvalidCredentialsError extends DomainError {
  public readonly statusCode = 401;
  constructor(message = 'Email atau password tidak sesuai') {
    super(message);
  }
}
