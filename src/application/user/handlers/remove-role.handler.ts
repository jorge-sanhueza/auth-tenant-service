import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject, NotFoundException } from '@nestjs/common';
import { RemoveRoleCommand } from '../commands/remove-role.command';
import type { IUserRepository } from '../../../domain/interfaces/repositories/user.repository.interface';
import type { IRoleRepository } from '../../../domain/interfaces/repositories/role.repository.interface';
import { DomainException } from '../../../domain/exceptions/domain.exception';

export interface RemoveRoleResult {
  userId: string;
  roleId: string;
  roleName: string;
  success: boolean;
}

@CommandHandler(RemoveRoleCommand)
export class RemoveRoleHandler implements ICommandHandler<
  RemoveRoleCommand,
  RemoveRoleResult
> {
  constructor(
    @Inject('IUserRepository')
    private readonly userRepository: IUserRepository,
    @Inject('IRoleRepository')
    private readonly roleRepository: IRoleRepository,
  ) {}

  async execute(command: RemoveRoleCommand): Promise<RemoveRoleResult> {
    // 1. Check if user exists
    const user = await this.userRepository.findById(
      command.userId,
      command.tenantId,
    );
    if (!user) {
      throw new NotFoundException(`User with ID ${command.userId} not found`);
    }

    // 2. Check if role exists
    const role = await this.roleRepository.findById(
      command.roleId,
      command.tenantId,
    );
    if (!role) {
      throw new NotFoundException(`Role with ID ${command.roleId} not found`);
    }

    // 3. Check if user has this role
    const userRoles = user.getRoles();
    if (!userRoles.includes(role.getName())) {
      throw new NotFoundException(
        `User does not have role "${role.getName()}"`,
      );
    }

    // 4. Cannot remove the last admin role from a user? (optional business rule)
    // This is a safety check - prevent removing admin role if it's the only admin
    if (role.getName() === 'admin' && userRoles.length === 1) {
      throw new DomainException(
        'Cannot remove the only admin role from a user',
      );
    }

    // 5. Remove role from user
    await this.userRepository.removeRole(command.userId, command.roleId);

    // 6. Update domain entity
    user.removeRole(role.getName());

    return {
      userId: command.userId,
      roleId: command.roleId,
      roleName: role.getName(),
      success: true,
    };
  }
}
