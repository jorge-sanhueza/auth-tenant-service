import { randomUUID } from 'crypto';
import { RoleName } from '../value-objects/role-name.vo';

export class Role {
  private constructor(
    private readonly id: string,
    private name: RoleName,
    private description: string | null,
    private readonly tenantId: string,
    private isSystem: boolean,
    private permissions: string[],
    private readonly createdAt: Date,
    private updatedAt: Date,
  ) {}

  static create(
    name: string,
    tenantId: string,
    description?: string,
    isSystem: boolean = false,
  ): Role {
    const roleName = RoleName.create(name);

    return new Role(
      randomUUID(),
      roleName,
      description || null,
      tenantId,
      isSystem,
      [],
      new Date(),
      new Date(),
    );
  }

  static reconstitute(data: {
    id: string;
    name: string;
    description: string | null;
    tenantId: string;
    isSystem: boolean;
    permissions?: string[];
    createdAt: Date;
    updatedAt: Date;
  }): Role {
    const roleName = RoleName.create(data.name);

    return new Role(
      data.id,
      roleName,
      data.description,
      data.tenantId,
      data.isSystem,
      data.permissions || [],
      data.createdAt,
      data.updatedAt,
    );
  }

  update(name?: string, description?: string): void {
    if (name) this.name = RoleName.create(name);
    if (description !== undefined) this.description = description;
    this.updatedAt = new Date();
  }

  addPermission(permission: string): void {
    if (!this.permissions.includes(permission)) {
      this.permissions.push(permission);
      this.updatedAt = new Date();
    }
  }

  removePermission(permission: string): void {
    const index = this.permissions.indexOf(permission);
    if (index > -1) {
      this.permissions.splice(index, 1);
      this.updatedAt = new Date();
    }
  }

  // Getters
  getId(): string {
    return this.id;
  }

  getName(): string {
    return this.name.getValue();
  }

  getDescription(): string | null {
    return this.description;
  }

  getTenantId(): string {
    return this.tenantId;
  }

  isSystemRole(): boolean {
    return this.isSystem;
  }

  getPermissions(): string[] {
    return [...this.permissions];
  }

  getCreatedAt(): Date {
    return this.createdAt;
  }

  getUpdatedAt(): Date {
    return this.updatedAt;
  }
}
