import { apiClient, ApiResponse } from './apiClient';
import type { AttendanceVerifyInput, IAttendanceVerifyResult, IRegistration } from 'shared';

export interface AttendanceVerifyResponse extends IAttendanceVerifyResult {
  registration?: IRegistration;
}

export const attendanceApi = {
  verifyAttendance: async (
    payload: AttendanceVerifyInput
  ): Promise<ApiResponse<AttendanceVerifyResponse>> => {
    const response = await apiClient.post<ApiResponse<AttendanceVerifyResponse>>(
      '/attendance/verify',
      payload
    );
    return response.data;
  },
};

export default attendanceApi;
