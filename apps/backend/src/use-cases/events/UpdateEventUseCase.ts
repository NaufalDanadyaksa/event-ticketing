import { Event } from '../../domain/entities';
import { EventNotFoundError } from '../../domain/errors';
import { IEventRepository } from '../../domain/repositories';
import { generateSlug } from '../../utils';

export interface UpdateEventDTO {
  id: string;
  title?: string;
  description?: string;
  bannerUrl?: string | null;
  isPaid?: boolean;
  price?: number;
  bankName?: string | null;
  bankAccountNumber?: string | null;
  bankAccountHolder?: string | null;
  maxParticipants?: number;
  registrationDeadline?: Date | string;
  eventStartDate?: Date | string;
  eventEndDate?: Date | string;
  location?: string;
  attendanceEnabled?: boolean;
  isPublished?: boolean;
}

export class UpdateEventUseCase {
  constructor(private readonly eventRepository: IEventRepository) {}

  public async execute(dto: UpdateEventDTO): Promise<Event> {
    const event = await this.eventRepository.findById(dto.id);
    if (!event) {
      throw new EventNotFoundError('Event tidak ditemukan');
    }

    if (dto.title !== undefined) {
      event.title = dto.title.trim();
    }
    if (dto.description !== undefined) {
      event.description = dto.description;
    }
    if (dto.bannerUrl !== undefined) {
      event.bannerUrl = dto.bannerUrl;
    }
    if (dto.isPaid !== undefined) {
      event.isPaid = dto.isPaid;
    }
    if (dto.price !== undefined) {
      event.price = Number(dto.price);
    }
    if (dto.bankName !== undefined) {
      event.bankName = dto.bankName;
    }
    if (dto.bankAccountNumber !== undefined) {
      event.bankAccountNumber = dto.bankAccountNumber;
    }
    if (dto.bankAccountHolder !== undefined) {
      event.bankAccountHolder = dto.bankAccountHolder;
    }
    if (dto.maxParticipants !== undefined) {
      event.maxParticipants = dto.maxParticipants;
    }
    if (dto.registrationDeadline !== undefined) {
      event.registrationDeadline = new Date(dto.registrationDeadline);
    }
    if (dto.eventStartDate !== undefined) {
      event.eventStartDate = new Date(dto.eventStartDate);
    }
    if (dto.eventEndDate !== undefined) {
      event.eventEndDate = new Date(dto.eventEndDate);
    }
    if (dto.location !== undefined) {
      event.location = dto.location.trim();
    }
    if (dto.attendanceEnabled !== undefined) {
      event.attendanceEnabled = dto.attendanceEnabled;
    }
    if (dto.isPublished !== undefined) {
      event.isPublished = dto.isPublished;
    }

    event.updatedAt = new Date();
    return await this.eventRepository.update(event);
  }
}
