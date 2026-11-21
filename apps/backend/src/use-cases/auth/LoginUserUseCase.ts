import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { IAuthResponse } from 'shared';
import { InvalidCredentialsError } from '../../domain/errors';
import { IUserRepository } from '../../domain/repositories';

export interface LoginUserDTO {
  email: string;
  password: string;
}

export class LoginUserUseCase {
  constructor(private readonly userRepository: IUserRepository) {}

  public async execute(dto: LoginUserDTO): Promise<IAuthResponse> {
    const email = dto.email.toLowerCase().trim();

    // 1. Find user by email
    const user = await this.userRepository.findByEmail(email);
    if (!user) {
      throw new InvalidCredentialsError('Email atau password tidak sesuai');
    }

    // 2. Compare password
    const isPasswordValid = await bcrypt.compare(dto.password, user.passwordHash);
    if (!isPasswordValid) {
      throw new InvalidCredentialsError('Email atau password tidak sesuai');
    }

    // 3. Generate JWT token
    const jwtSecret = process.env.JWT_SECRET || 'default-jwt-secret-key-change-in-prod';
    const accessToken = jwt.sign(
      {
        id: user.id,
        email: user.email,
        role: user.role,
        name: user.name,
      },
      jwtSecret,
      { expiresIn: '7d' }
    );

    return {
      accessToken,
      user: user.toJSON(),
    };
  }
}
