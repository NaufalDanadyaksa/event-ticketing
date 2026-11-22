import { PrismaClient, Event as PrismaEventModel, Prisma } from '@prisma/client';
import { IEventRepository, FindEventsFilter } from '../domain/repositories/IEventRepository';
import { Event } from '../domain/entities/Event';
import prisma from '../infrastructure/prisma';
import { RegistrationStatus } from 'shared';

export class PrismaEventRepository implements IEventRepository {
  constructor(private readonly client: PrismaClient = prisma) {}

  private toDomain(model: PrismaEventModel): Event {
    return new Event({
      id: model.id,
      title: model.title,
      slug: model.slug,
      description: model.description,
      bannerUrl: model.bannerUrl,
      isPaid: model.isPaid,
      price: Number(model.price),
      bankName: model.bankName,
      bankAccountNumber: model.bankAccountNumber,
      bankAccountHolder: model.bankAccountHolder,
      maxParticipants: model.maxParticipants,
      registrationDeadline: model.registrationDeadline,
      eventStartDate: model.eventStartDate,
      eventEndDate: model.eventEndDate,
      location: model.location,
      attendanceEnabled: model.attendanceEnabled,
      attendanceSecret: model.attendanceSecret,
      isPublished: model.isPublished,
      createdById: model.createdById,
      createdAt: model.createdAt,
      updatedAt: model.updatedAt,
    });
  }

  async findById(id: string): Promise<Event | null> {
    const event = await this.client.event.findUnique({ where: { id } });
    return event ? this.toDomain(event) : null;
  }

  async findBySlug(slug: string): Promise<Event | null> {
    const event = await this.client.event.findUnique({ where: { slug } });
    return event ? this.toDomain(event) : null;
  }

  async findByIds(ids: string[]): Promise<Event[]> {
    if (!ids || ids.length === 0) {
      return [];
    }
    const events = await this.client.event.findMany({
      where: {
        id: { in: ids },
      },
    });
    return events.map((e) => this.toDomain(e));
  }

  async create(event: Event): Promise<Event> {
    const created = await this.client.event.create({
      data: {
        id: event.id,
        title: event.title,
        slug: event.slug,
        description: event.description,
        bannerUrl: event.bannerUrl,
        isPaid: event.isPaid,
        price: new Prisma.Decimal(event.price),
        bankName: event.bankName,
        bankAccountNumber: event.bankAccountNumber,
        bankAccountHolder: event.bankAccountHolder,
        maxParticipants: event.maxParticipants,
        registrationDeadline: event.registrationDeadline,
        eventStartDate: event.eventStartDate,
        eventEndDate: event.eventEndDate,
        location: event.location,
        attendanceEnabled: event.attendanceEnabled,
        attendanceSecret: event.attendanceSecret,
        isPublished: event.isPublished,
        createdById: event.createdById,
        createdAt: event.createdAt,
        updatedAt: event.updatedAt,
      },
    });
    return this.toDomain(created);
  }

  async update(event: Event): Promise<Event> {
    const updated = await this.client.event.update({
      where: { id: event.id },
      data: {
        title: event.title,
        slug: event.slug,
        description: event.description,
        bannerUrl: event.bannerUrl,
        isPaid: event.isPaid,
        price: new Prisma.Decimal(event.price),
        bankName: event.bankName,
        bankAccountNumber: event.bankAccountNumber,
        bankAccountHolder: event.bankAccountHolder,
        maxParticipants: event.maxParticipants,
        registrationDeadline: event.registrationDeadline,
        eventStartDate: event.eventStartDate,
        eventEndDate: event.eventEndDate,
        location: event.location,
        attendanceEnabled: event.attendanceEnabled,
        attendanceSecret: event.attendanceSecret,
        isPublished: event.isPublished,
        updatedAt: event.updatedAt,
      },
    });
    return this.toDomain(updated);
  }

  async delete(id: string): Promise<void> {
    await this.client.event.delete({ where: { id } });
  }

  async findAll(filters?: FindEventsFilter): Promise<Event[]> {
    const where: Prisma.EventWhereInput = {};
    if (filters?.isPublished !== undefined) {
      where.isPublished = filters.isPublished;
    }
    if (filters?.createdById) {
      where.createdById = filters.createdById;
    }
    if (filters?.search) {
      const search = filters.search.trim();
      where.OR = [
        { title: { contains: search } },
        { description: { contains: search } },
        { location: { contains: search } },
      ];
    }

    const events = await this.client.event.findMany({
      where,
      skip: filters?.skip,
      take: filters?.take,
      orderBy: { eventStartDate: 'asc' },
    });

    return events.map(e => this.toDomain(e));
  }

  async findAllWithCount(filters?: FindEventsFilter): Promise<{ event: Event; registeredCount: number }[]> {
    const where: Prisma.EventWhereInput = {};
    if (filters?.isPublished !== undefined) {
      where.isPublished = filters.isPublished;
    }
    if (filters?.createdById) {
      where.createdById = filters.createdById;
    }
    if (filters?.search) {
      const search = filters.search.trim();
      where.OR = [
        { title: { contains: search } },
        { description: { contains: search } },
        { location: { contains: search } },
      ];
    }

    const events = await this.client.event.findMany({
      where,
      include: {
        _count: {
          select: {
            registrations: {
              where: {
                status: {
                  in: [RegistrationStatus.CONFIRMED, RegistrationStatus.PAYMENT_SUBMITTED],
                },
              },
            },
          },
        },
      },
      skip: filters?.skip,
      take: filters?.take,
      orderBy: { eventStartDate: 'asc' },
    });

    return events.map((e) => ({
      event: this.toDomain(e),
      registeredCount: e._count.registrations,
    }));
  }

  async countRegistrations(eventId: string, statuses?: RegistrationStatus[]): Promise<number> {
    const where: Prisma.RegistrationWhereInput = { eventId };
    if (statuses && statuses.length > 0) {
      where.status = { in: statuses as any };
    }
    return this.client.registration.count({ where });
  }

  async getEventWithRegisteredCount(idOrSlug: string): Promise<{ event: Event; registeredCount: number } | null> {
    const event = await this.client.event.findFirst({
      where: {
        OR: [{ id: idOrSlug }, { slug: idOrSlug }],
      },
      include: {
        _count: {
          select: {
            registrations: {
              where: {
                status: {
                  in: [RegistrationStatus.CONFIRMED, RegistrationStatus.PAYMENT_SUBMITTED],
                },
              },
            },
          },
        },
      },
    });

    if (!event) return null;

    const registeredCount = event._count.registrations;
    return {
      event: this.toDomain(event),
      registeredCount,
    };
  }
}
