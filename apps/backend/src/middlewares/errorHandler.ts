import { ErrorRequestHandler } from 'express';
import { ZodError } from 'zod';
import multer from 'multer';
import { DomainError } from '../domain/errors';
import { errorResponse } from '../utils/responseHelper';

export const errorHandler: ErrorRequestHandler = (err, _req, res, _next) => {
  if (err instanceof DomainError) {
    return errorResponse(res, err.message, err.statusCode);
  }

  if (err instanceof ZodError) {
    const formattedErrors = err.errors.map((e) => ({
      field: e.path.join('.'),
      message: e.message,
    }));
    return errorResponse(res, 'Validation error', 400, formattedErrors);
  }

  if (err instanceof multer.MulterError) {
    let message = err.message;
    if (err.code === 'LIMIT_FILE_SIZE') {
      message = 'Ukuran file melebihi batas maksimal 5MB';
    }
    return errorResponse(res, message, 400);
  }

  if (err instanceof Error && err.message.includes('Tipe file tidak didukung')) {
    return errorResponse(res, err.message, 400);
  }

  // Fallback for unhandled internal server errors
  console.error('[InternalServerError]', err);
  return errorResponse(res, 'Internal server error', 500);
};
