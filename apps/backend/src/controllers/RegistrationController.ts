import { Request, Response, NextFunction } from 'express';
import { GuestRegisterSchema } from 'shared';
import { RegisterAttendeeUseCase, UploadPaymentProofUseCase } from '../use-cases';
import { PrismaRegistrationRepository, PrismaEventRepository, PrismaUserRepository } from '../repositories';
import { EmailService } from '../services';
import { successResponse } from '../utils/responseHelper';
import { RegistrationNotFoundError, UnauthorizedError } from '../domain/errors';

export class RegistrationController {
  private static registrationRepository = new PrismaRegistrationRepository();
  private static eventRepository = new PrismaEventRepository();
  private static userRepository = new PrismaUserRepository();
  private static emailService = new EmailService();

  private static registerAttendeeUseCase = new RegisterAttendeeUseCase(
    RegistrationController.registrationRepository,
    RegistrationController.eventRepository,
    RegistrationController.emailService
  );

  private static uploadPaymentProofUseCase = new UploadPaymentProofUseCase(
    RegistrationController.registrationRepository
  );

  public static registerForEvent = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const eventId = req.params.id || req.params.eventId;
      const loggedInUser = req.user;
      let name = req.body.name;
      let email = req.body.email;
      let phone = req.body.phone;
      let userId: string | null = null;

      if (loggedInUser) {
        userId = loggedInUser.userId;
        if (!name || !email) {
          const user = await RegistrationController.userRepository.findById(userId);
          if (user) {
            name = name || user.name;
            email = email || user.email;
            phone = phone || user.phone || '';
          }
        }
      } else {
        const guestData = GuestRegisterSchema.parse(req.body);
        name = guestData.name;
        email = guestData.email;
        phone = guestData.phone;
      }

      let registration = await RegistrationController.registerAttendeeUseCase.execute({
        eventId,
        name,
        email,
        phone,
        userId,
        appUrl: process.env.APP_URL || `${req.protocol}://${req.get('host')}`,
      });

      if (req.file) {
        const paymentProofPath = `/uploads/receipts/${req.file.filename}`;
        registration = await RegistrationController.uploadPaymentProofUseCase.execute({
          registrationIdOrMagicToken: registration.id,
          paymentProofUrl: paymentProofPath,
        });
      }

      successResponse(res, registration, 'Pendaftaran berhasil', 201);
    } catch (err) {
      next(err);
    }
  };

  public static getTicketByMagicToken = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { magicToken } = req.params;
      const registration = await RegistrationController.registrationRepository.findByMagicToken(magicToken);
      if (!registration) {
        throw new RegistrationNotFoundError('Tiket tidak ditemukan');
      }

      const event = await RegistrationController.eventRepository.findById(registration.eventId);
      const safeEvent = event && event.toPublicJSON ? event.toPublicJSON() : event;

      successResponse(res, { registration, event: safeEvent }, 'Detail tiket berhasil diambil', 200);
    } catch (err) {
      next(err);
    }
  };

  public static getMyTickets = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        throw new UnauthorizedError('User belum terautentikasi');
      }

      const registrations = await RegistrationController.registrationRepository.findByUserId(userId);

      const eventIds = [...new Set(registrations.map((r) => r.eventId))];
      const events = await RegistrationController.eventRepository.findByIds(eventIds);
      const eventMap = new Map(events.map((e) => [e.id, e.toPublicJSON ? e.toPublicJSON() : e]));

      const tickets = registrations.map((reg) => ({
        ...reg,
        event: eventMap.get(reg.eventId) || null,
      }));

      successResponse(res, tickets, 'Daftar tiket saya berhasil diambil', 200);
    } catch (err) {
      next(err);
    }
  };

  public registerForEvent = RegistrationController.registerForEvent;
  public getTicketByMagicToken = RegistrationController.getTicketByMagicToken;
  public getMyTickets = RegistrationController.getMyTickets;
}

export const registrationController = new RegistrationController();
