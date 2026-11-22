import { Request, Response, NextFunction } from 'express';
import { AttendanceVerifySchema } from 'shared';
import { GetLiveAttendanceTokenUseCase, VerifyDynamicAttendanceUseCase } from '../use-cases';
import { PrismaEventRepository, PrismaRegistrationRepository } from '../repositories';
import { successResponse } from '../utils/responseHelper';

export class AttendanceController {
  private static eventRepository = new PrismaEventRepository();
  private static registrationRepository = new PrismaRegistrationRepository();

  private static getLiveAttendanceTokenUseCase = new GetLiveAttendanceTokenUseCase(
    AttendanceController.eventRepository
  );

  private static verifyDynamicAttendanceUseCase = new VerifyDynamicAttendanceUseCase(
    AttendanceController.registrationRepository,
    AttendanceController.eventRepository
  );

  public static getLiveToken = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const eventId = req.params.eventId || req.params.id;
      const result = await AttendanceController.getLiveAttendanceTokenUseCase.execute({ eventId });
      successResponse(res, result, 'Token absensi aktif berhasil didapatkan', 200);
    } catch (err) {
      next(err);
    }
  };

  public static verifyAttendance = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const validatedData = AttendanceVerifySchema.parse(req.body);
      const result = await AttendanceController.verifyDynamicAttendanceUseCase.execute(validatedData);
      successResponse(res, result, result.message, 200);
    } catch (err) {
      next(err);
    }
  };

  public getLiveToken = AttendanceController.getLiveToken;
  public verifyAttendance = AttendanceController.verifyAttendance;
}

export const attendanceController = new AttendanceController();
