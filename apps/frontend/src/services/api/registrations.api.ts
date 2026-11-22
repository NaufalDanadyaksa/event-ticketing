import { apiClient, ApiResponse } from './apiClient';
import type { IRegistration, IEvent } from 'shared';

export interface TicketViewResponse {
  registration: IRegistration;
  event: IEvent;
}

export interface MyTicketItem extends IRegistration {
  event: IEvent | null;
}

export const registrationsApi = {
  registerForEvent: async (
    eventIdOrFormData: string | FormData,
    maybeFormData?: FormData
  ): Promise<ApiResponse<IRegistration>> => {
    let eventId: string;
    let formData: FormData;

    if (typeof eventIdOrFormData === 'string' && maybeFormData instanceof FormData) {
      eventId = eventIdOrFormData;
      formData = maybeFormData;
    } else if (eventIdOrFormData instanceof FormData) {
      formData = eventIdOrFormData;
      eventId = (formData.get('eventId') as string) || '';
    } else {
      throw new Error('Invalid arguments passed to registerForEvent');
    }

    const response = await apiClient.post<ApiResponse<IRegistration>>(
      `/events/${eventId}/register`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    return response.data;
  },

  getTicketByMagicToken: async (magicToken: string): Promise<ApiResponse<TicketViewResponse>> => {
    const response = await apiClient.get<ApiResponse<TicketViewResponse>>(
      `/tickets/view/${magicToken}`
    );
    return response.data;
  },

  getMyTickets: async (): Promise<ApiResponse<MyTicketItem[]>> => {
    const response = await apiClient.get<ApiResponse<MyTicketItem[]>>('/users/me/tickets');
    return response.data;
  },
};

export default registrationsApi;
