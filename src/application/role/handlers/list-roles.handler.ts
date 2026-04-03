import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { ListRolesQuery } from '../queries/list-roles.query';
import type { IRoleRepository } from '../../../domain/interfaces/repositories/role.repository.interface';
import { Role } from '../../../domain/entities/role.entity';

export interface RoleDto {
  id: string;
  name: string;
  description: string | null;
  isSystem: boolean;
  permissions: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface ListRolesResult {
  roles: RoleDto[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

@QueryHandler(ListRolesQuery)
export class ListRolesHandler implements IQueryHandler<
  ListRolesQuery,
  ListRolesResult
> {
  constructor(
    @Inject('IRoleRepository')
    private readonly roleRepository: IRoleRepository,
  ) {}

  async execute(query: ListRolesQuery): Promise<ListRolesResult> {
    const skip = (query.page - 1) * query.limit;
    const [roles, total] = await Promise.all([
      this.roleRepository.findAll(query.tenantId, skip, query.limit),
      this.roleRepository.count(query.tenantId),
    ]);

    const totalPages = Math.ceil(total / query.limit);

    return {
      roles: roles.map(this.toDto),
      total,
      page: query.page,
      limit: query.limit,
      totalPages,
    };
  }

  private readonly toDto = (role: Role): RoleDto => ({
    id: role.getId(),
    name: role.getName(),
    description: role.getDescription(),
    isSystem: role.isSystemRole(),
    permissions: role.getPermissions(),
    createdAt: role.getCreatedAt(),
    updatedAt: role.getUpdatedAt(),
  });
}
