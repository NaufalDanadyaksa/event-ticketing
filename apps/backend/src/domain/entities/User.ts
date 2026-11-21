import { Role } from 'shared';

export interface UserProps {
  id: string;
  email: string;
  passwordHash: string;
  name: string;
  phone?: string | null;
  role: Role;
  createdAt: Date;
  updatedAt: Date;
}

export class User {
  public readonly id: string;
  public readonly email: string;
  public readonly passwordHash: string;
  public name: string;
  public phone: string | null;
  public role: Role;
  public readonly createdAt: Date;
  public updatedAt: Date;

  constructor(props: UserProps) {
    this.id = props.id;
    this.email = props.email.toLowerCase().trim();
    this.passwordHash = props.passwordHash;
    this.name = props.name.trim();
    this.phone = props.phone ? props.phone.trim() : null;
    this.role = props.role;
    this.createdAt = props.createdAt;
    this.updatedAt = props.updatedAt;
  }

  public isAdmin(): boolean {
    return this.role === Role.ADMIN;
  }

  public isStaff(): boolean {
    return this.role === Role.STAFF || this.role === Role.ADMIN;
  }

  public isUser(): boolean {
    return this.role === Role.USER;
  }

  public updateProfile(data: { name?: string; phone?: string | null }): void {
    if (data.name !== undefined) {
      this.name = data.name.trim();
    }
    if (data.phone !== undefined) {
      this.phone = data.phone ? data.phone.trim() : null;
    }
    this.updatedAt = new Date();
  }

  public toJSON() {
    return {
      id: this.id,
      email: this.email,
      name: this.name,
      phone: this.phone,
      role: this.role,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }
}
