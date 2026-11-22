import { FindEventsFilter, IEventRepository } from '../../domain/repositories';

export interface EventListItemOutput {
  id: string;
  title: string;
  slug: string;
  description: string;
  bannerUrl: string | null;
  isPaid: boolean;
  price: number;
  eventStartDate: Date;
  eventEndDate: Date;
  registrationDeadline: Date;
  location: string;
  maxParticipants: number;
  registeredCount: number;
  isPublished: boolean;
  attendanceEnabled: boolean;
  createdAt: Date;
}

export class ListEventsUseCase {
  constructor(private readonly eventRepository: IEventRepository) {}

  public async execute(filters?: FindEventsFilter): Promise<EventListItemOutput[]> {
    const results = await this.eventRepository.findAllWithCount(filters);

    return results.map(({ event, registeredCount }) => ({
      id: event.id,
      title: event.title,
      slug: event.slug,
      description: event.description,
      bannerUrl: event.bannerUrl,
      isPaid: event.isPaid,
      price: event.price,
      eventStartDate: event.eventStartDate,
      eventEndDate: event.eventEndDate,
      registrationDeadline: event.registrationDeadline,
      location: event.location,
      maxParticipants: event.maxParticipants,
      registeredCount,
      isPublished: event.isPublished,
      attendanceEnabled: event.attendanceEnabled,
      createdAt: event.createdAt,
    }));
  }
}
