import { ILiveAttendanceToken } from 'shared';
import { EventNotFoundError, InvalidAttendanceTokenError } from '../../domain/errors';
import { IEventRepository } from '../../domain/repositories';
import { AttendanceTokenEngine } from '../../services';

export interface GetLiveAttendanceTokenDTO {
  eventId: string;
}

export class GetLiveAttendanceTokenUseCase {
  constructor(private readonly eventRepository: IEventRepository) {}

  public async execute(dto: GetLiveAttendanceTokenDTO): Promise<ILiveAttendanceToken> {
    const event = await this.eventRepository.findById(dto.eventId);
    if (!event) {
      throw new EventNotFoundError('Event tidak ditemukan');
    }

    if (!event.attendanceEnabled) {
      throw new InvalidAttendanceTokenError('Fitur absensi dinamis tidak aktif untuk event ini');
    }

    return AttendanceTokenEngine.generateToken(event.id, event.attendanceSecret);
  }
}
