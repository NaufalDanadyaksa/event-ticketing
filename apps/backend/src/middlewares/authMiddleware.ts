import { RequestHandler } from 'express';
import jwt, { type JwtPayload } from 'jsonwebtoken';
import { Role } from 'shared';
import { errorResponse } from '../utils/responseHelper';

interface AuthJwtPayload extends JwtPayload {
  userId?: string;
  id?: string;
  email: string;
  role: Role;
  name?: string;
}

export const authMiddleware: RequestHandler = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return errorResponse(res, 'Unauthorized: No token provided', 401);
  }

  const token = authHeader.split(' ')[1];
  if (!token) {
    return errorResponse(res, 'Unauthorized: No token provided', 401);
  }

  try {
    const secret = process.env.JWT_SECRET || 'event_ticketing_jwt_secret_dev_key';
    const decoded = jwt.verify(token, secret) as AuthJwtPayload;

    const userId = decoded.userId || decoded.id;
    if (!userId) {
      return errorResponse(res, 'Unauthorized: Invalid token payload', 401);
    }

    req.user = {
      userId,
      email: decoded.email,
      role: decoded.role,
      name: decoded.name,
    };

    return next();
  } catch (error) {
    if (
      (error instanceof Error &&
        (error.name === 'TokenExpiredError' || error.name === 'JsonWebTokenError')) ||
      (jwt.TokenExpiredError && error instanceof jwt.TokenExpiredError) ||
      (jwt.JsonWebTokenError && error instanceof jwt.JsonWebTokenError)
    ) {
      return errorResponse(res, 'Unauthorized: Invalid or expired token', 401);
    }
    return errorResponse(res, 'Unauthorized: Authentication failed', 401);
  }
};

export const optionalAuthMiddleware: RequestHandler = (req, _res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next();
  }

  const token = authHeader.split(' ')[1];
  if (!token) {
    return next();
  }

  try {
    const secret = process.env.JWT_SECRET || 'event_ticketing_jwt_secret_dev_key';
    const decoded = jwt.verify(token, secret) as AuthJwtPayload;

    const userId = decoded.userId || decoded.id;
    if (userId) {
      req.user = {
        userId,
        email: decoded.email,
        role: decoded.role,
        name: decoded.name,
      };
    }
  } catch {
    // If token invalid in optionalAuthMiddleware, simply continue without req.user
  }

  return next();
};
