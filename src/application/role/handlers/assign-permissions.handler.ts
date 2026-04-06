import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject, NotFoundException } from '@nestjs/common';
import { AssignPermissionsCommand } from '../commands/assign-permissions.command';
import type { IRoleRepository } from '../../../domain/interfaces/repositories/role.repository.interface';
import { DomainException } from '../../../domain/exceptions/domain.exception';

export interface AssignPermissionsResult {
  roleId: string;
  permissions: string[];
}

@CommandHandler(AssignPermissionsCommand)
export class AssignPermissionsHandler implements ICommandHandler<
  AssignPermissionsCommand,
  AssignPermissionsResult
> {
  constructor(
    @Inject('IRoleRepository')
    private readonly roleRepository: IRoleRepository,
  ) {}

  async execute(
    command: AssignPermissionsCommand,
  ): Promise<AssignPermissionsResult> {
    // Find existing role
    const role = await this.roleRepository.findById(
      command.roleId,
      command.tenantId,
    );

    if (!role) {
      throw new NotFoundException(`Role with ID ${command.roleId} not found`);
    }

    // Cannot modify system roles
    if (role.isSystemRole()) {
      throw new DomainException('Cannot modify permissions of system roles');
    }

    // Add each permission
    for (const permissionId of command.permissionIds) {
      await this.roleRepository.addPermission(command.roleId, permissionId);
      role.addPermission(permissionId); // Update domain entity
    }

    return {
      roleId: command.roleId,
      permissions: role.getPermissions(),
    };
  }
}
