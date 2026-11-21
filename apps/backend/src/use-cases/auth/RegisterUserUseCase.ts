import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import { Role, IAuthResponse } from 'shared';
import { User } from '../../domain/entities';
import { DuplicateEmailError } from '../../domain/errors';
import { IUserRepository } from '../../domain/repositories';

export interface RegisterUserDTO {
  name: string;
  email: string;
  password: string;
  phone?: string | null;
  role?: Role;
}

export class RegisterUserUseCase {
  constructor(private readonly userRepository: IUserRepository) {}

  public async execute(dto: RegisterUserDTO): Promise<IAuthResponse> {
    const email = dto.email.toLowerCase().trim();

    // 1. Check if user already exists
    const existingUser = await this.userRepository.findByEmail(email);
    if (existingUser) {
      throw new DuplicateEmailError('Email sudah terdaftar pada sistem');
    }

    // 2. Hash password with bcrypt
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(dto.password, saltRounds);

    // 3. Create domain entity
    const user = new User({
      id: uuidv4(),
      email,
      passwordHash,
      name: dto.name.trim(),
      phone: dto.phone ? dto.phone.trim() : null,
      role: dto.role ?? Role.USER,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    // 4. Save to repository
    const createdUser = await this.userRepository.create(user);

    // 5. Generate JWT token
    const jwtSecret = process.env.JWT_SECRET || 'default-jwt-secret-key-change-in-prod';
    const accessToken = jwt.sign(
      {
        id: createdUser.id,
        email: createdUser.email,
        role: createdUser.role,
        name: createdUser.name,
      },
      jwtSecret,
      { expiresIn: '7d' }
    );

    return {
      accessToken,
      user: createdUser.toJSON(),
    };
  }
}
