export interface IEvent {
  id: string;
  title: string;
  slug: string;
  description: string;
  bannerUrl?: string | null;
  isPaid: boolean;
  price: number | string;
  bankName?: string | null;
  bankAccountNumber?: string | null;
  bankAccountHolder?: string | null;
  maxParticipants: number;
  registrationDeadline: Date | string;
  eventStartDate: Date | string;
  eventEndDate: Date | string;
  location: string;
  attendanceEnabled: boolean;
  isPublished: boolean;
  createdById: string;
  createdAt: Date | string;
  updatedAt: Date | string;
}

export interface IEventListItem {
  id: string;
  title: string;
  slug: string;
  description: string;
  bannerUrl?: string | null;
  isPaid: boolean;
  price: number | string;
  eventStartDate: Date | string;
  eventEndDate: Date | string;
  registrationDeadline: Date | string;
  location: string;
  maxParticipants: number;
  registeredCount: number;
  isPublished: boolean;
}

export interface IEventAvailability {
  available: boolean;
  quota: number;
  registered: number;
  remaining: number;
  deadlinePassed: boolean;
}
