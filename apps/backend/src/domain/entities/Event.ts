export interface EventProps {
  id: string;
  title: string;
  slug: string;
  description: string;
  bannerUrl?: string | null;
  isPaid: boolean;
  price: number;
  bankName?: string | null;
  bankAccountNumber?: string | null;
  bankAccountHolder?: string | null;
  maxParticipants: number;
  registrationDeadline: Date;
  eventStartDate: Date;
  eventEndDate: Date;
  location: string;
  attendanceEnabled: boolean;
  attendanceSecret: string;
  isPublished: boolean;
  createdById: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface PublicEventJSON {
  id: string;
  title: string;
  slug: string;
  description: string;
  bannerUrl: string | null;
  isPaid: boolean;
  price: number;
  bankName: string | null;
  bankAccountNumber: string | null;
  bankAccountHolder: string | null;
  maxParticipants: number;
  registrationDeadline: Date;
  eventStartDate: Date;
  eventEndDate: Date;
  location: string;
  attendanceEnabled: boolean;
  isPublished: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export class Event {
  public readonly id: string;
  public title: string;
  public slug: string;
  public description: string;
  public bannerUrl: string | null;
  public isPaid: boolean;
  public price: number;
  public bankName: string | null;
  public bankAccountNumber: string | null;
  public bankAccountHolder: string | null;
  public maxParticipants: number;
  public registrationDeadline: Date;
  public eventStartDate: Date;
  public eventEndDate: Date;
  public location: string;
  public attendanceEnabled: boolean;
  public attendanceSecret: string;
  public isPublished: boolean;
  public readonly createdById: string;
  public readonly createdAt: Date;
  public updatedAt: Date;

  constructor(props: EventProps) {
    this.id = props.id;
    this.title = props.title.trim();
    this.slug = props.slug;
    this.description = props.description;
    this.bannerUrl = props.bannerUrl ?? null;
    this.isPaid = props.isPaid;
    this.price = Number(props.price);
    this.bankName = props.bankName ?? null;
    this.bankAccountNumber = props.bankAccountNumber ?? null;
    this.bankAccountHolder = props.bankAccountHolder ?? null;
    this.maxParticipants = props.maxParticipants;
    this.registrationDeadline = new Date(props.registrationDeadline);
    this.eventStartDate = new Date(props.eventStartDate);
    this.eventEndDate = new Date(props.eventEndDate);
    this.location = props.location.trim();
    this.attendanceEnabled = props.attendanceEnabled;
    this.attendanceSecret = props.attendanceSecret;
    this.isPublished = props.isPublished;
    this.createdById = props.createdById;
    this.createdAt = new Date(props.createdAt);
    this.updatedAt = new Date(props.updatedAt);
  }

  public isDeadlinePassed(at: Date = new Date()): boolean {
    return at.getTime() > this.registrationDeadline.getTime();
  }

  public isQuotaFull(currentRegisteredCount: number): boolean {
    if (this.maxParticipants <= 0) {
      return false; // 0 means unlimited
    }
    return currentRegisteredCount >= this.maxParticipants;
  }

  public canAcceptRegistration(currentRegisteredCount: number, at: Date = new Date()): {
    allowed: boolean;
    reason?: 'DEADLINE_PASSED' | 'QUOTA_FULL' | 'NOT_PUBLISHED';
  } {
    if (!this.isPublished) {
      return { allowed: false, reason: 'NOT_PUBLISHED' };
    }
    if (this.isDeadlinePassed(at)) {
      return { allowed: false, reason: 'DEADLINE_PASSED' };
    }
    if (this.isQuotaFull(currentRegisteredCount)) {
      return { allowed: false, reason: 'QUOTA_FULL' };
    }
    return { allowed: true };
  }

  public isEventOngoing(at: Date = new Date()): boolean {
    const time = at.getTime();
    return time >= this.eventStartDate.getTime() && time <= this.eventEndDate.getTime();
  }

  public isEventEnded(at: Date = new Date()): boolean {
    return at.getTime() > this.eventEndDate.getTime();
  }

  public toPublicJSON(): PublicEventJSON {
    return {
      id: this.id,
      title: this.title,
      slug: this.slug,
      description: this.description,
      bannerUrl: this.bannerUrl,
      isPaid: this.isPaid,
      price: this.price,
      bankName: this.isPaid ? this.bankName : null,
      bankAccountNumber: this.isPaid ? this.bankAccountNumber : null,
      bankAccountHolder: this.isPaid ? this.bankAccountHolder : null,
      maxParticipants: this.maxParticipants,
      registrationDeadline: this.registrationDeadline,
      eventStartDate: this.eventStartDate,
      eventEndDate: this.eventEndDate,
      location: this.location,
      attendanceEnabled: this.attendanceEnabled,
      isPublished: this.isPublished,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }
}
