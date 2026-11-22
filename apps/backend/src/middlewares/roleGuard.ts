import { RequestHandler } from 'express';
import { Role } from 'shared';
import { errorResponse } from '../utils/responseHelper';

export const roleGuard = (...allowedRoles: Role[]): RequestHandler => {
  return (req, res, next) => {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      return errorResponse(res, 'Forbidden: Insufficient permissions', 403);
    }
    return next();
  };
};
