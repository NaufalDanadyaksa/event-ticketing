import { Event } from '../entities/Event';
import { RegistrationStatus } from 'shared';

export interface FindEventsFilter {
  isPublished?: boolean;
  search?: string;
  createdById?: string;
}

export interface IEventRepository {
  findById(id: string): Promise<Event | null>;
  findBySlug(slug: string): Promise<Event | null>;
  create(event: Event): Promise<Event>;
  update(event: Event): Promise<Event>;
  delete(id: string): Promise<void>;
  findAll(filters?: FindEventsFilter): Promise<Event[]>;
  countRegistrations(eventId: string, statuses?: RegistrationStatus[]): Promise<number>;
  getEventWithRegisteredCount(idOrSlug: string): Promise<{ event: Event; registeredCount: number } | null>;
}
