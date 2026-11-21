import { PrismaClient, User as PrismaUserModel } from '@prisma/client';
import { IUserRepository } from '../domain/repositories/IUserRepository';
import { User } from '../domain/entities/User';
import prisma from '../infrastructure/prisma';
import { Role } from 'shared';

export class PrismaUserRepository implements IUserRepository {
  constructor(private readonly client: PrismaClient = prisma) {}

  private toDomain(model: PrismaUserModel): User {
    return new User({
      id: model.id,
      email: model.email,
      passwordHash: model.passwordHash,
      name: model.name,
      phone: model.phone,
      role: model.role as Role,
      createdAt: model.createdAt,
      updatedAt: model.updatedAt,
    });
  }

  async findById(id: string): Promise<User | null> {
    const user = await this.client.user.findUnique({ where: { id } });
    return user ? this.toDomain(user) : null;
  }

  async findByEmail(email: string): Promise<User | null> {
    const user = await this.client.user.findUnique({
      where: { email: email.toLowerCase().trim() },
    });
    return user ? this.toDomain(user) : null;
  }

  async create(user: User): Promise<User> {
    const created = await this.client.user.create({
      data: {
        id: user.id,
        email: user.email,
        passwordHash: user.passwordHash,
        name: user.name,
        phone: user.phone,
        role: user.role,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
    });
    return this.toDomain(created);
  }

  async update(user: User): Promise<User> {
    const updated = await this.client.user.update({
      where: { id: user.id },
      data: {
        name: user.name,
        phone: user.phone,
        role: user.role,
        passwordHash: user.passwordHash,
        updatedAt: user.updatedAt,
      },
    });
    return this.toDomain(updated);
  }
}
