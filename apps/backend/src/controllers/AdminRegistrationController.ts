import { Request, Response, NextFunction } from 'express';
import { RegistrationStatus, ReviewPaymentSchema } from 'shared';
import { ReviewPaymentUseCase } from '../use-cases';
import { PrismaRegistrationRepository, PrismaEventRepository } from '../repositories';
import { EmailService } from '../services';
import { successResponse } from '../utils/responseHelper';
import { RegistrationNotFoundError, UnauthorizedError } from '../domain/errors';

export class AdminRegistrationController {
  private static registrationRepository = new PrismaRegistrationRepository();
  private static eventRepository = new PrismaEventRepository();
  private static emailService = new EmailService();

  private static reviewPaymentUseCase = new ReviewPaymentUseCase(
    AdminRegistrationController.registrationRepository,
    AdminRegistrationController.eventRepository,
    AdminRegistrationController.emailService
  );

  public static listRegistrations = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const eventId = typeof req.query.eventId === 'string' ? req.query.eventId : undefined;
      const status = typeof req.query.status === 'string' ? (req.query.status as RegistrationStatus) : undefined;
      const search = typeof req.query.search === 'string' ? req.query.search : undefined;

      const page = req.query.page ? Math.max(1, parseInt(req.query.page as string, 10)) : 1;
      const limit = req.query.limit ? Math.max(1, parseInt(req.query.limit as string, 10)) : 20;

      const skip = (page - 1) * limit;
      const take = limit;

      const registrations = await AdminRegistrationController.registrationRepository.findAllByEvent(
        eventId,
        status,
        { skip, take, search }
      );

      successResponse(res, registrations, 'Daftar pendaftaran berhasil diambil', 200);
    } catch (err) {
      next(err);
    }
  };

  public static reviewPayment = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const adminId = req.user?.userId;
      if (!adminId) {
        throw new UnauthorizedError('User belum terautentikasi');
      }

      const validatedData = ReviewPaymentSchema.parse(req.body);

      const result = await AdminRegistrationController.reviewPaymentUseCase.execute({
        registrationId: id,
        adminId,
        action: validatedData.action,
        rejectionReason: validatedData.rejectionReason,
        appUrl: process.env.APP_URL || `${req.protocol}://${req.get('host')}`,
      });

      const message = `Pembayaran berhasil ${validatedData.action === 'APPROVE' ? 'disetujui' : 'ditolak'}`;
      successResponse(res, result, message, 200);
    } catch (err) {
      next(err);
    }
  };

  public static getRegistrationDetail = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const registration = await AdminRegistrationController.registrationRepository.findById(id);
      if (!registration) {
        throw new RegistrationNotFoundError('Data pendaftaran tidak ditemukan');
      }

      const event = await AdminRegistrationController.eventRepository.findById(registration.eventId);

      successResponse(res, { registration, event }, 'Detail pendaftaran berhasil diambil', 200);
    } catch (err) {
      next(err);
    }
  };

  public listRegistrations = AdminRegistrationController.listRegistrations;
  public reviewPayment = AdminRegistrationController.reviewPayment;
  public getRegistrationDetail = AdminRegistrationController.getRegistrationDetail;
}

export const adminRegistrationController = new AdminRegistrationController();
