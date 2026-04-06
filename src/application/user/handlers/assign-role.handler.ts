import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject, NotFoundException, ConflictException } from '@nestjs/common';
import { AssignRoleCommand } from '../commands/assign-role.command';
import type { IUserRepository } from '../../../domain/interfaces/repositories/user.repository.interface';
import type { IRoleRepository } from '../../../domain/interfaces/repositories/role.repository.interface';

export interface AssignRoleResult {
  userId: string;
  roleId: string;
  roleName: string;
  assignedAt: Date;
}

@CommandHandler(AssignRoleCommand)
export class AssignRoleHandler implements ICommandHandler<
  AssignRoleCommand,
  AssignRoleResult
> {
  constructor(
    @Inject('IUserRepository')
    private readonly userRepository: IUserRepository,
    @Inject('IRoleRepository')
    private readonly roleRepository: IRoleRepository,
  ) {}

  async execute(command: AssignRoleCommand): Promise<AssignRoleResult> {
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

    // 3. Check if user already has this role
    const userRoles = user.getRoles();
    if (userRoles.includes(role.getName())) {
      throw new ConflictException(`User already has role "${role.getName()}"`);
    }

    // 4. Assign role to user
    await this.userRepository.assignRole(command.userId, command.roleId);

    // 5. Update domain entity
    user.assignRole(role.getName());

    return {
      userId: command.userId,
      roleId: command.roleId,
      roleName: role.getName(),
      assignedAt: new Date(),
    };
  }
}
