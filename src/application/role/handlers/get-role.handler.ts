import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Inject, NotFoundException } from '@nestjs/common';
import { GetRoleQuery } from '../queries/get-role.query';
import type { IRoleRepository } from '../../../domain/interfaces/repositories/role.repository.interface';
import { RoleDto } from './list-roles.handler';

@QueryHandler(GetRoleQuery)
export class GetRoleHandler implements IQueryHandler<GetRoleQuery, RoleDto> {
  constructor(
    @Inject('IRoleRepository')
    private readonly roleRepository: IRoleRepository,
  ) {}

  async execute(query: GetRoleQuery): Promise<RoleDto> {
    const role = await this.roleRepository.findById(query.id, query.tenantId);

    if (!role) {
      throw new NotFoundException(`Role with ID ${query.id} not found`);
    }

    return {
      id: role.getId(),
      name: role.getName(),
      description: role.getDescription(),
      isSystem: role.isSystemRole(),
      permissions: role.getPermissions(),
      createdAt: role.getCreatedAt(),
      updatedAt: role.getUpdatedAt(),
    };
  }
}
