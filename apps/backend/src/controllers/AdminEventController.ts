import { Request, Response, NextFunction } from 'express';
import { CreateEventSchema, UpdateEventSchema } from 'shared';
import { CreateEventUseCase, UpdateEventUseCase } from '../use-cases';
import { PrismaEventRepository } from '../repositories';
import { successResponse } from '../utils/responseHelper';
import { EventNotFoundError, UnauthorizedError } from '../domain/errors';

export class AdminEventController {
  private static eventRepository = new PrismaEventRepository();
  private static createEventUseCase = new CreateEventUseCase(AdminEventController.eventRepository);
  private static updateEventUseCase = new UpdateEventUseCase(AdminEventController.eventRepository);

  public static createEvent = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        throw new UnauthorizedError('User belum terautentikasi');
      }

      if (req.file) {
        req.body.bannerUrl = `/uploads/banners/${req.file.filename}`;
      }

      const validatedData = CreateEventSchema.parse(req.body);

      const bannerUrl = req.file
        ? `/uploads/banners/${req.file.filename}`
        : validatedData.bannerUrl;

      const result = await AdminEventController.createEventUseCase.execute({
        ...validatedData,
        bannerUrl,
        createdById: userId,
      });

      successResponse(res, result, 'Event berhasil dibuat', 201);
    } catch (err) {
      next(err);
    }
  };

  public static updateEvent = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;

      if (req.file) {
        req.body.bannerUrl = `/uploads/banners/${req.file.filename}`;
      }

      const validatedData = UpdateEventSchema.parse(req.body);

      const bannerUrl = req.file
        ? `/uploads/banners/${req.file.filename}`
        : validatedData.bannerUrl;

      const result = await AdminEventController.updateEventUseCase.execute({
        id,
        ...validatedData,
        ...(bannerUrl !== undefined ? { bannerUrl } : {}),
      });

      successResponse(res, result, 'Event berhasil diperbarui', 200);
    } catch (err) {
      next(err);
    }
  };

  public static listAllEvents = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const page = req.query.page ? Math.max(1, parseInt(req.query.page as string, 10)) : 1;
      const limit = req.query.limit ? Math.max(1, parseInt(req.query.limit as string, 10)) : 20;
      const search = typeof req.query.search === 'string' ? req.query.search : undefined;

      const skip = (page - 1) * limit;
      const take = limit;

      const events = await AdminEventController.eventRepository.findAll({
        skip,
        take,
        search,
      });

      successResponse(res, events, 'Daftar semua event berhasil diambil', 200);
    } catch (err) {
      next(err);
    }
  };

  public static togglePublish = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const event = await AdminEventController.eventRepository.findById(id);
      if (!event) {
        throw new EventNotFoundError('Event tidak ditemukan');
      }

      event.isPublished = !event.isPublished;
      event.updatedAt = new Date();

      const updated = await AdminEventController.eventRepository.update(event);

      const message = `Status publikasi event berhasil diubah menjadi ${
        updated.isPublished ? 'Dipublikasikan' : 'Draft'
      }`;
      successResponse(res, updated, message, 200);
    } catch (err) {
      next(err);
    }
  };

  public createEvent = AdminEventController.createEvent;
  public updateEvent = AdminEventController.updateEvent;
  public listAllEvents = AdminEventController.listAllEvents;
  public togglePublish = AdminEventController.togglePublish;
}

export const adminEventController = new AdminEventController();
