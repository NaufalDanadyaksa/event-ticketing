import { Request, Response, NextFunction } from 'express';
import { StaffCheckInSchema } from 'shared';
import { VerifyGateCheckInUseCase } from '../use-cases';
import { PrismaRegistrationRepository, PrismaEventRepository } from '../repositories';
import { successResponse } from '../utils/responseHelper';
import { UnauthorizedError } from '../domain/errors';

export class StaffController {
  private static registrationRepository = new PrismaRegistrationRepository();
  private static eventRepository = new PrismaEventRepository();

  private static verifyGateCheckInUseCase = new VerifyGateCheckInUseCase(
    StaffController.registrationRepository,
    StaffController.eventRepository
  );

  public static checkIn = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const staffId = req.user?.userId;
      if (!staffId) {
        throw new UnauthorizedError('User belum terautentikasi');
      }

      const validatedData = StaffCheckInSchema.parse(req.body);

      const result = await StaffController.verifyGateCheckInUseCase.execute({
        ticketCode: validatedData.ticketCode,
        staffId,
      });

      successResponse(res, result, result.message, 200);
    } catch (err) {
      next(err);
    }
  };

  public checkIn = StaffController.checkIn;
}

export const staffController = new StaffController();
