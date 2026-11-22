import { Role } from 'shared';

export interface AuthenticatedUser {
  userId: string;
  email: string;
  role: Role;
  name?: string;
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthenticatedUser;
    }
  }
}
