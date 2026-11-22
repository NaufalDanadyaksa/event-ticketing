import { apiClient, ApiResponse } from './apiClient';
import type { IRegistration, IEvent } from 'shared';

export interface CheckInResponse {
  registration: IRegistration;
  event?: IEvent | null;
  message: string;
}

export const staffApi = {
  checkIn: async (ticketCode: string): Promise<ApiResponse<CheckInResponse>> => {
    const response = await apiClient.post<ApiResponse<CheckInResponse>>('/staff/check-in', {
      ticketCode,
    });
    return response.data;
  },
};

export default staffApi;
