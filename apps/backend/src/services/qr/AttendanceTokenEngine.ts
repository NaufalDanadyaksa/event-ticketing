import crypto from 'crypto';
import { IAttendanceTokenPayload, ILiveAttendanceToken } from 'shared';

export interface ITokenVerificationResult {
  valid: boolean;
  isValid: boolean;
  payload?: IAttendanceTokenPayload;
  eventId?: string;
  step?: number;
  message?: string;
  error?: string;
}

export class AttendanceTokenEngine {
  public static readonly WINDOW_INTERVAL_SECONDS = 10;

  /**
   * Computes the HMAC-SHA256 signature for a given event, timeStep, and secret.
   * Returns a 16-character hexadecimal substring.
   */
  public static computeHmac(eventId: string, timeStep: number, secret: string): string {
    const data = `${eventId}:${timeStep}`;
    return crypto
      .createHmac('sha256', secret)
      .update(data)
      .digest('hex')
      .substring(0, 16);
  }

  /**
   * Generates a 10-second rotating attendance token.
   * @param eventId The unique identifier of the event.
   * @param secret The secret key associated with the event.
   * @returns ILiveAttendanceToken containing qrPayload (base64url), expiresInMs, and timeStep.
   */
  public static generateToken(eventId: string, secret: string): ILiveAttendanceToken {
    const now = Date.now();
    const epochSeconds = Math.floor(now / 1000);
    const timeStep = Math.floor(epochSeconds / AttendanceTokenEngine.WINDOW_INTERVAL_SECONDS);

    const currentWindowEndMs = (timeStep + 1) * AttendanceTokenEngine.WINDOW_INTERVAL_SECONDS * 1000;
    const expiresInMs = Math.max(0, currentWindowEndMs - now);

    const sig = AttendanceTokenEngine.computeHmac(eventId, timeStep, secret);

    const payload: IAttendanceTokenPayload = {
      eventId,
      step: timeStep,
      sig,
    };

    const qrPayload = Buffer.from(JSON.stringify(payload)).toString('base64url');

    return {
      qrPayload,
      expiresInMs,
      timeStep,
    };
  }

  /**
   * Parses the QR payload string from either base64url, base64, or plain JSON.
   */
  public static parsePayload(qrPayload: string): IAttendanceTokenPayload | null {
    if (!qrPayload || typeof qrPayload !== 'string') {
      return null;
    }

    const trimmed = qrPayload.trim();

    // 1. Try direct JSON parsing
    if (trimmed.startsWith('{') && trimmed.endsWith('}')) {
      try {
        const parsed = JSON.parse(trimmed);
        if (parsed.eventId && typeof parsed.step === 'number' && parsed.sig) {
          return parsed as IAttendanceTokenPayload;
        }
      } catch {
        // Continue to base64 decoding
      }
    }

    // 2. Try Base64Url / Base64 decoding
    try {
      const decoded = Buffer.from(trimmed, 'base64url').toString('utf-8');
      const parsed = JSON.parse(decoded);
      if (parsed.eventId && typeof parsed.step === 'number' && parsed.sig) {
        return parsed as IAttendanceTokenPayload;
      }
    } catch {
      // Decode failed
    }

    return null;
  }

  /**
   * Verifies the QR payload against current and previous time window (tolerance window).
   * @param qrPayload The base64url encoded or JSON payload string.
   * @param secret The event attendance secret.
   * @returns ITokenVerificationResult with valid boolean and details.
   */
  public static verifyToken(qrPayload: string, secret: string): ITokenVerificationResult {
    const payload = AttendanceTokenEngine.parsePayload(qrPayload);

    if (!payload) {
      return {
        valid: false,
        isValid: false,
        error: 'Format QR payload tidak valid',
        message: 'Format QR payload tidak valid',
      };
    }

    const now = Date.now();
    const epochSeconds = Math.floor(now / 1000);
    const currentStep = Math.floor(epochSeconds / AttendanceTokenEngine.WINDOW_INTERVAL_SECONDS);

    // Tolerance window: current window or previous window (max 10 seconds lag)
    const isCurrentWindow = payload.step === currentStep;
    const isPreviousWindow = payload.step === currentStep - 1;

    if (!isCurrentWindow && !isPreviousWindow) {
      return {
        valid: false,
        isValid: false,
        payload,
        eventId: payload.eventId,
        step: payload.step,
        error: 'QR Code sudah kedaluwarsa, silakan scan ulang layar',
        message: 'QR Code sudah kedaluwarsa, silakan scan ulang layar',
      };
    }

    const expectedSig = AttendanceTokenEngine.computeHmac(payload.eventId, payload.step, secret);

    const sigBuffer = Buffer.from(payload.sig);
    const expectedBuffer = Buffer.from(expectedSig);

    const isSignatureValid =
      sigBuffer.length === expectedBuffer.length &&
      crypto.timingSafeEqual(sigBuffer, expectedBuffer);

    if (!isSignatureValid) {
      return {
        valid: false,
        isValid: false,
        payload,
        eventId: payload.eventId,
        step: payload.step,
        error: 'Tanda tangan QR Code tidak valid',
        message: 'Tanda tangan QR Code tidak valid',
      };
    }

    return {
      valid: true,
      isValid: true,
      payload,
      eventId: payload.eventId,
      step: payload.step,
      message: 'QR Code valid',
    };
  }

  // Instance methods delegating to static implementations for flexible DI usage
  public computeHmac(eventId: string, timeStep: number, secret: string): string {
    return AttendanceTokenEngine.computeHmac(eventId, timeStep, secret);
  }

  public generateToken(eventId: string, secret: string): ILiveAttendanceToken {
    return AttendanceTokenEngine.generateToken(eventId, secret);
  }

  public verifyToken(qrPayload: string, secret: string): ITokenVerificationResult {
    return AttendanceTokenEngine.verifyToken(qrPayload, secret);
  }

  public parsePayload(qrPayload: string): IAttendanceTokenPayload | null {
    return AttendanceTokenEngine.parsePayload(qrPayload);
  }
}

export const attendanceTokenEngine = new AttendanceTokenEngine();
