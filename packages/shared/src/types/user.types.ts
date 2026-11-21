import { Role } from '../enums';

export interface IUser {
  id: string;
  email: string;
  name: string;
  phone?: string | null;
  role: Role;
  createdAt: Date | string;
  updatedAt: Date | string;
}

export interface IAuthResponse {
  accessToken: string;
  user: IUser;
}

export interface IUserProfile {
  id: string;
  email: string;
  name: string;
  phone?: string | null;
  role: Role;
}
