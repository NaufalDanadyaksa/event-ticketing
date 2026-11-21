import { v4 as uuidv4 } from 'uuid';
import { Event } from '../../domain/entities';
import { IEventRepository } from '../../domain/repositories';
import { generateSlug, generateAttendanceSecret } from '../../utils';

export interface CreateEventDTO {
  title: string;
  description: string;
  bannerUrl?: string | null;
  isPaid: boolean;
  price?: number;
  bankName?: string | null;
  bankAccountNumber?: string | null;
  bankAccountHolder?: string | null;
  maxParticipants?: number;
  registrationDeadline: Date | string;
  eventStartDate: Date | string;
  eventEndDate: Date | string;
  location: string;
  attendanceEnabled?: boolean;
  isPublished?: boolean;
  createdById: string;
}

export class CreateEventUseCase {
  constructor(private readonly eventRepository: IEventRepository) {}

  public async execute(dto: CreateEventDTO): Promise<Event> {
    // 1. Generate unique slug
    let slug = generateSlug(dto.title);
    const existingWithSlug = await this.eventRepository.findBySlug(slug);
    if (existingWithSlug) {
      slug = `${slug}-${Date.now().toString(36)}`;
    }

    // 2. Generate cryptographically strong attendance secret
    const attendanceSecret = generateAttendanceSecret();

    // 3. Create Domain entity
    const event = new Event({
      id: uuidv4(),
      title: dto.title.trim(),
      slug,
      description: dto.description,
      bannerUrl: dto.bannerUrl ?? null,
      isPaid: dto.isPaid,
      price: dto.isPaid ? Number(dto.price || 0) : 0,
      bankName: dto.isPaid ? dto.bankName ?? null : null,
      bankAccountNumber: dto.isPaid ? dto.bankAccountNumber ?? null : null,
      bankAccountHolder: dto.isPaid ? dto.bankAccountHolder ?? null : null,
      maxParticipants: dto.maxParticipants ?? 0,
      registrationDeadline: new Date(dto.registrationDeadline),
      eventStartDate: new Date(dto.eventStartDate),
      eventEndDate: new Date(dto.eventEndDate),
      location: dto.location.trim(),
      attendanceEnabled: dto.attendanceEnabled ?? true,
      attendanceSecret,
      isPublished: dto.isPublished ?? false,
      createdById: dto.createdById,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    // 4. Persist and return
    return await this.eventRepository.create(event);
  }
}
