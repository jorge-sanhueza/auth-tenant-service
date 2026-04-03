export class RoleResponseDto {
  id: string;
  name: string;
  description: string | null;
  isSystem: boolean;
  permissions: string[];
  createdAt: Date;
  updatedAt: Date;

  constructor(partial: Partial<RoleResponseDto>) {
    this.id = partial.id || '';
    this.name = partial.name || '';
    this.description = partial.description || null;
    this.isSystem = partial.isSystem || false;
    this.permissions = partial.permissions || [];
    this.createdAt = partial.createdAt || new Date();
    this.updatedAt = partial.updatedAt || new Date();
  }
}
