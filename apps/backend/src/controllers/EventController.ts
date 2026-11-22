import { Request, Response, NextFunction } from 'express';
import { ListEventsUseCase, GetEventDetailUseCase } from '../use-cases';
import { PrismaEventRepository } from '../repositories';
import { successResponse } from '../utils/responseHelper';

export class EventController {
  private static eventRepository = new PrismaEventRepository();
  private static listEventsUseCase = new ListEventsUseCase(EventController.eventRepository);
  private static getEventDetailUseCase = new GetEventDetailUseCase(EventController.eventRepository);

  public static listEvents = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const page = req.query.page ? Math.max(1, parseInt(req.query.page as string, 10)) : 1;
      const limit = req.query.limit ? Math.max(1, parseInt(req.query.limit as string, 10)) : 10;
      const search = typeof req.query.search === 'string' ? req.query.search : undefined;

      const skip = (page - 1) * limit;
      const take = limit;

      const result = await EventController.listEventsUseCase.execute({
        isPublished: true,
        search,
        skip,
        take,
      });

      successResponse(res, result, 'Daftar event berhasil diambil', 200);
    } catch (err) {
      next(err);
    }
  };

  public static getEventDetail = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const slugOrId = req.params.slug || req.params.id;
      const result = await EventController.getEventDetailUseCase.execute(slugOrId);
      // attendanceSecret is strictly excluded by GetEventDetailUseCase and toPublicJSON
      successResponse(res, result, 'Detail event berhasil diambil', 200);
    } catch (err) {
      next(err);
    }
  };

  public listEvents = EventController.listEvents;
  public getEventDetail = EventController.getEventDetail;
}

export const eventController = new EventController();
