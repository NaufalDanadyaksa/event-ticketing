export interface IAttendanceTokenPayload {
  eventId: string;
  step: number;
  sig: string;
}

export interface ILiveAttendanceToken {
  qrPayload: string;
  expiresInMs: number;
  timeStep: number;
}

export interface IAttendanceVerifyResult {
  success: boolean;
  message: string;
  attendeeName?: string;
  attendedAt?: Date | string;
}
