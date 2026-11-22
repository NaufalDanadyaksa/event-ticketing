import { apiClient, ApiResponse } from './apiClient';
import type {
  IEvent,
  IRegistrationListItem,
  ILiveAttendanceToken,
  ReviewPaymentInput,
  IRegistration,
} from 'shared';

export interface ListAdminEventsParams {
  search?: string;
  page?: number;
  limit?: number;
}

export interface ListRegistrationsParams {
  eventId?: string;
  status?: string;
  search?: string;
  page?: number;
  limit?: number;
}

export interface AdminRegistrationDetailResponse {
  registration: IRegistration;
  event: IEvent | null;
}

export const adminApi = {
  createEvent: async (formData: FormData): Promise<ApiResponse<IEvent>> => {
    const response = await apiClient.post<ApiResponse<IEvent>>('/admin/events', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  updateEvent: async (id: string, formData: FormData): Promise<ApiResponse<IEvent>> => {
    const response = await apiClient.put<ApiResponse<IEvent>>(`/admin/events/${id}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  listAdminEvents: async (params?: ListAdminEventsParams): Promise<ApiResponse<IEvent[]>> => {
    const response = await apiClient.get<ApiResponse<IEvent[]>>('/admin/events', { params });
    return response.data;
  },

  togglePublish: async (id: string): Promise<ApiResponse<IEvent>> => {
    const response = await apiClient.patch<ApiResponse<IEvent>>(`/admin/events/${id}/publish`);
    return response.data;
  },

  listRegistrations: async (
    params?: ListRegistrationsParams
  ): Promise<ApiResponse<IRegistrationListItem[]>> => {
    const response = await apiClient.get<ApiResponse<IRegistrationListItem[]>>(
      '/admin/registrations',
      { params }
    );
    return response.data;
  },

  getRegistrationDetail: async (
    id: string
  ): Promise<ApiResponse<AdminRegistrationDetailResponse>> => {
    const response = await apiClient.get<ApiResponse<AdminRegistrationDetailResponse>>(
      `/admin/registrations/${id}`
    );
    return response.data;
  },

  reviewPayment: async (
    id: string,
    data: ReviewPaymentInput
  ): Promise<ApiResponse<IRegistration>> => {
    const response = await apiClient.patch<ApiResponse<IRegistration>>(
      `/admin/registrations/${id}/review`,
      data
    );
    return response.data;
  },

  getLiveAttendanceToken: async (id: string): Promise<ApiResponse<ILiveAttendanceToken>> => {
    const response = await apiClient.get<ApiResponse<ILiveAttendanceToken>>(
      `/attendance/events/${id}/live-attendance-token`
    );
    return response.data;
  },
};

export default adminApi;
