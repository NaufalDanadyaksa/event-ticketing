import { Request, Response, NextFunction } from 'express';
import { RegisterUserSchema, LoginSchema } from 'shared';
import { RegisterUserUseCase, LoginUserUseCase } from '../use-cases';
import { PrismaUserRepository } from '../repositories';
import { successResponse } from '../utils/responseHelper';
import { UnauthorizedError, UserNotFoundError } from '../domain/errors';

export class AuthController {
  private static userRepository = new PrismaUserRepository();
  private static registerUserUseCase = new RegisterUserUseCase(AuthController.userRepository);
  private static loginUserUseCase = new LoginUserUseCase(AuthController.userRepository);

  public static register = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const validatedData = RegisterUserSchema.parse(req.body);
      const result = await AuthController.registerUserUseCase.execute(validatedData);
      successResponse(res, result, 'Registrasi berhasil', 201);
    } catch (err) {
      next(err);
    }
  };

  public static login = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const validatedData = LoginSchema.parse(req.body);
      const result = await AuthController.loginUserUseCase.execute(validatedData);
      successResponse(res, result, 'Login berhasil', 200);
    } catch (err) {
      next(err);
    }
  };

  public static getProfile = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        throw new UnauthorizedError('User belum terautentikasi');
      }

      const user = await AuthController.userRepository.findById(userId);
      if (!user) {
        throw new UserNotFoundError('User tidak ditemukan');
      }

      successResponse(res, user.toJSON(), 'Profil berhasil diambil', 200);
    } catch (err) {
      next(err);
    }
  };

  public register = AuthController.register;
  public login = AuthController.login;
  public getProfile = AuthController.getProfile;
}

export const authController = new AuthController();
