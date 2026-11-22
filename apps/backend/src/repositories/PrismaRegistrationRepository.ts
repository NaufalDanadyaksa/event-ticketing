import { PrismaClient, Registration as PrismaRegistrationModel, Prisma } from '@prisma/client';
import { IRegistrationRepository, FindRegistrationsFilter } from '../domain/repositories/IRegistrationRepository';
import { Registration } from '../domain/entities/Registration';
import prisma from '../infrastructure/prisma';
import { RegistrationStatus, CheckInStatus, AttendanceStatus } from 'shared';

export class PrismaRegistrationRepository implements IRegistrationRepository {
  constructor(private readonly client: PrismaClient = prisma) {}

  private toDomain(model: PrismaRegistrationModel): Registration {
    return new Registration({
      id: model.id,
      ticketCode: model.ticketCode,
      magicToken: model.magicToken,
      eventId: model.eventId,
      userId: model.userId,
      name: model.name,
      email: model.email,
      phone: model.phone,
      status: model.status as RegistrationStatus,
      paymentProofUrl: model.paymentProofUrl,
      rejectionReason: model.rejectionReason,
      approvedAt: model.approvedAt,
      approvedByAdminId: model.approvedByAdminId,
      checkInStatus: model.checkInStatus as CheckInStatus,
      checkedInAt: model.checkedInAt,
      checkedInByStaffId: model.checkedInByStaffId,
      attendanceStatus: model.attendanceStatus as AttendanceStatus,
      attendedAt: model.attendedAt,
      createdAt: model.createdAt,
      updatedAt: model.updatedAt,
    });
  }

  async findById(id: string): Promise<Registration | null> {
    const reg = await this.client.registration.findUnique({ where: { id } });
    return reg ? this.toDomain(reg) : null;
  }

  async findByTicketCode(ticketCode: string): Promise<Registration | null> {
    const reg = await this.client.registration.findUnique({ where: { ticketCode } });
    return reg ? this.toDomain(reg) : null;
  }

  async findByMagicToken(magicToken: string): Promise<Registration | null> {
    const reg = await this.client.registration.findUnique({ where: { magicToken } });
    return reg ? this.toDomain(reg) : null;
  }

  async findByEventAndEmail(eventId: string, email: string): Promise<Registration | null> {
    const reg = await this.client.registration.findFirst({
      where: {
        eventId,
        email: email.toLowerCase().trim(),
      },
    });
    return reg ? this.toDomain(reg) : null;
  }

  async findAll(filters: FindRegistrationsFilter): Promise<Registration[]> {
    const where: Prisma.RegistrationWhereInput = {};
    if (filters.eventId) {
      where.eventId = filters.eventId;
    }
    if (filters.status) {
      where.status = filters.status as any;
    }
    if (filters.checkInStatus) {
      where.checkInStatus = filters.checkInStatus as any;
    }
    if (filters.attendanceStatus) {
      where.attendanceStatus = filters.attendanceStatus as any;
    }
    if (filters.userId) {
      where.userId = filters.userId;
    }
    if (filters.search) {
      const search = filters.search.trim();
      where.OR = [
        { name: { contains: search } },
        { email: { contains: search } },
        { ticketCode: { contains: search } },
      ];
    }

    const list = await this.client.registration.findMany({
      where,
      skip: filters.skip,
      take: filters.take,
      orderBy: { createdAt: 'desc' },
    });

    return list.map(r => this.toDomain(r));
  }

  async findAllByEvent(
    eventId?: string,
    status?: RegistrationStatus,
    options?: { skip?: number; take?: number; search?: string }
  ): Promise<Registration[]> {
    const where: Prisma.RegistrationWhereInput = {};
    if (eventId) {
      where.eventId = eventId;
    }
    if (status) {
      where.status = status as any;
    }
    if (options?.search) {
      const search = options.search.trim();
      where.OR = [
        { name: { contains: search } },
        { email: { contains: search } },
        { ticketCode: { contains: search } },
      ];
    }

    const list = await this.client.registration.findMany({
      where,
      skip: options?.skip,
      take: options?.take,
      orderBy: { createdAt: 'desc' },
    });

    return list.map(r => this.toDomain(r));
  }

  async findByUserId(userId: string): Promise<Registration[]> {
    const list = await this.client.registration.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
    return list.map(r => this.toDomain(r));
  }

  async countByEventId(eventId: string, statuses?: RegistrationStatus[]): Promise<number> {
    const where: Prisma.RegistrationWhereInput = { eventId };
    if (statuses && statuses.length > 0) {
      where.status = { in: statuses as any };
    }
    return this.client.registration.count({ where });
  }

  async create(registration: Registration): Promise<Registration> {
    const created = await this.client.registration.create({
      data: {
        id: registration.id,
        ticketCode: registration.ticketCode,
        magicToken: registration.magicToken,
        eventId: registration.eventId,
        userId: registration.userId,
        name: registration.name,
        email: registration.email,
        phone: registration.phone,
        status: registration.status,
        paymentProofUrl: registration.paymentProofUrl,
        rejectionReason: registration.rejectionReason,
        approvedAt: registration.approvedAt,
        approvedByAdminId: registration.approvedByAdminId,
        checkInStatus: registration.checkInStatus,
        checkedInAt: registration.checkedInAt,
        checkedInByStaffId: registration.checkedInByStaffId,
        attendanceStatus: registration.attendanceStatus,
        attendedAt: registration.attendedAt,
        createdAt: registration.createdAt,
        updatedAt: registration.updatedAt,
      },
    });
    return this.toDomain(created);
  }

  async update(registration: Registration): Promise<Registration> {
    const updated = await this.client.registration.update({
      where: { id: registration.id },
      data: {
        status: registration.status,
        paymentProofUrl: registration.paymentProofUrl,
        rejectionReason: registration.rejectionReason,
        approvedAt: registration.approvedAt,
        approvedByAdminId: registration.approvedByAdminId,
        checkInStatus: registration.checkInStatus,
        checkedInAt: registration.checkedInAt,
        checkedInByStaffId: registration.checkedInByStaffId,
        attendanceStatus: registration.attendanceStatus,
        attendedAt: registration.attendedAt,
        updatedAt: registration.updatedAt,
      },
    });
    return this.toDomain(updated);
  }
}
