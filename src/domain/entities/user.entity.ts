import { UserId } from '../value-objects/user-id.vo';
import { Email } from '../value-objects/email.vo';
import { Password } from '../value-objects/password.vo';
import { TenantId } from '../value-objects/tenant-id.vo';
import { DomainException } from '../exceptions/domain.exception';

export class User {
  private constructor(
    private readonly id: UserId,
    private email: Email,
    private password: Password,
    private tenantId: TenantId,
    private firstName: string | null,
    private lastName: string | null,
    private isActive: boolean,
    private roles: string[],
    private permissions: string[],
    private lastLoginAt: Date | null,
    private createdAt: Date,
    private updatedAt: Date,
  ) {}

  static create(
    email: string,
    password: string,
    tenantId: string,
    firstName?: string,
    lastName?: string,
  ): User {
    return new User(
      UserId.generate(),
      Email.create(email),
      Password.create(password),
      TenantId.create(tenantId),
      firstName || null,
      lastName || null,
      true,
      [],
      [],
      null,
      new Date(),
      new Date(),
    );
  }

  static reconstitute(data: {
    id: string;
    email: string;
    password: string;
    tenantId: string;
    firstName: string | null;
    lastName: string | null;
    isActive: boolean;
    roles: string[];
    permissions?: string[];
    lastLoginAt: Date | null;
    createdAt: Date;
    updatedAt: Date;
  }): User {
    return new User(
      UserId.fromString(data.id),
      Email.create(data.email),
      Password.fromHash(data.password),
      TenantId.create(data.tenantId),
      data.firstName,
      data.lastName,
      data.isActive,
      data.roles,
      data.permissions || [],
      data.lastLoginAt,
      data.createdAt,
      data.updatedAt,
    );
  }

  authenticate(password: string): boolean {
    return this.password.compare(password);
  }

  changePassword(oldPassword: string, newPassword: string): void {
    if (!this.authenticate(oldPassword)) {
      throw new DomainException('Invalid current password');
    }
    this.password = Password.create(newPassword);
    this.updatedAt = new Date();
  }

  assignRole(role: string): void {
    if (!this.roles.includes(role)) {
      this.roles.push(role);
      this.updatedAt = new Date();
    }
  }

  removeRole(role: string): void {
    const index = this.roles.indexOf(role);
    if (index > -1) {
      this.roles.splice(index, 1);
      this.updatedAt = new Date();
    }
  }

  setPermissions(permissions: string[]): void {
    this.permissions = permissions;
    this.updatedAt = new Date();
  }

  hasPermission(permission: string): boolean {
    // Admin role has all permissions
    if (this.roles.includes('admin')) {
      return true;
    }
    return this.permissions.includes(permission);
  }

  hasAnyPermission(permissions: string[]): boolean {
    if (this.roles.includes('admin')) {
      return true;
    }
    return permissions.some((permission) =>
      this.permissions.includes(permission),
    );
  }

  hasAllPermissions(permissions: string[]): boolean {
    if (this.roles.includes('admin')) {
      return true;
    }
    return permissions.every((permission) =>
      this.permissions.includes(permission),
    );
  }

  deactivate(): void {
    this.isActive = false;
    this.updatedAt = new Date();
  }

  activate(): void {
    this.isActive = true;
    this.updatedAt = new Date();
  }

  recordLogin(): void {
    this.lastLoginAt = new Date();
    this.updatedAt = new Date();
  }

  updateProfile(firstName?: string, lastName?: string): void {
    if (firstName !== undefined) this.firstName = firstName;
    if (lastName !== undefined) this.lastName = lastName;
    this.updatedAt = new Date();
  }

  // Getters
  getId(): string {
    return this.id.getValue();
  }

  getEmail(): string {
    return this.email.getValue();
  }

  getTenantId(): string {
    return this.tenantId.getValue();
  }

  getFirstName(): string | null {
    return this.firstName;
  }

  getLastName(): string | null {
    return this.lastName;
  }

  isUserActive(): boolean {
    return this.isActive;
  }

  getRoles(): string[] {
    return [...this.roles];
  }

  getPermissions(): string[] {
    return [...this.permissions];
  }

  getLastLoginAt(): Date | null {
    return this.lastLoginAt;
  }

  getCreatedAt(): Date {
    return this.createdAt;
  }

  getUpdatedAt(): Date {
    return this.updatedAt;
  }

  getPasswordHash(): string {
    return this.password.getHash();
  }
}
