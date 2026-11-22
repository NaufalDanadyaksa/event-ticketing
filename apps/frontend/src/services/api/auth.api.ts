import { apiClient, ApiResponse } from './apiClient';
import type { LoginInput, RegisterUserInput, IAuthResponse, IUser } from 'shared';

export const authApi = {
  register: async (data: RegisterUserInput): Promise<ApiResponse<IAuthResponse>> => {
    const response = await apiClient.post<ApiResponse<IAuthResponse>>('/auth/register', data);
    return response.data;
  },

  login: async (data: LoginInput): Promise<ApiResponse<IAuthResponse>> => {
    const response = await apiClient.post<ApiResponse<IAuthResponse>>('/auth/login', data);
    return response.data;
  },

  getProfile: async (): Promise<ApiResponse<IUser>> => {
    const response = await apiClient.get<ApiResponse<IUser>>('/auth/me');
    return response.data;
  },
};

export default authApi;
