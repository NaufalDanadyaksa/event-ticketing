import { RegistrationStatus, IEventAvailability } from 'shared';
import { Event, PublicEventJSON } from '../../domain/entities';
import { EventNotFoundError } from '../../domain/errors';
import { IEventRepository } from '../../domain/repositories';

export interface EventDetailOutput {
  event: PublicEventJSON;
  registeredCount: number;
  availability: IEventAvailability;
}

export class GetEventDetailUseCase {
  constructor(private readonly eventRepository: IEventRepository) {}

  public async execute(idOrSlug: string): Promise<EventDetailOutput> {
    const data = await this.eventRepository.getEventWithRegisteredCount(idOrSlug);

    let event: Event;
    let registeredCount: number;

    if (data) {
      event = data.event;
      registeredCount = data.registeredCount;
    } else {
      let found = await this.eventRepository.findById(idOrSlug);
      if (!found) {
        found = await this.eventRepository.findBySlug(idOrSlug);
      }
      if (!found) {
        throw new EventNotFoundError('Event tidak ditemukan');
      }
      event = found;
      registeredCount = await this.eventRepository.countRegistrations(event.id, [
        RegistrationStatus.CONFIRMED,
        RegistrationStatus.PAYMENT_SUBMITTED,
      ]);
    }

    const deadlinePassed = event.isDeadlinePassed();
    const quotaFull = event.isQuotaFull(registeredCount);
    const remaining = event.maxParticipants > 0 ? Math.max(0, event.maxParticipants - registeredCount) : 999999;
    const available = event.isPublished && !deadlinePassed && !quotaFull;

    return {
      event: event.toPublicJSON(),
      registeredCount,
      availability: {
        available,
        quota: event.maxParticipants,
        registered: registeredCount,
        remaining,
        deadlinePassed,
      },
    };
  }
}
