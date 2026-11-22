import { apiClient, ApiResponse } from './apiClient';
import type { IEventListItem, IEvent, IEventAvailability } from 'shared';

export interface EventDetailResponse {
  event: IEvent;
  registeredCount: number;
  availability: IEventAvailability;
}

export interface ListEventsParams {
  search?: string;
  page?: number;
  limit?: number;
}

export const eventsApi = {
  listEvents: async (params?: ListEventsParams): Promise<ApiResponse<IEventListItem[]>> => {
    const response = await apiClient.get<ApiResponse<IEventListItem[]>>('/events', { params });
    return response.data;
  },

  getEventBySlug: async (slug: string): Promise<ApiResponse<EventDetailResponse>> => {
    const response = await apiClient.get<ApiResponse<EventDetailResponse>>(`/events/${slug}`);
    return response.data;
  },
};

export default eventsApi;
