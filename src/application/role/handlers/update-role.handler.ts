import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject, NotFoundException, ConflictException } from '@nestjs/common';
import { UpdateRoleCommand } from '../commands/update-role.command';
import type { IRoleRepository } from '../../../domain/interfaces/repositories/role.repository.interface';
import { DomainException } from '../../../domain/exceptions/domain.exception';

export interface UpdateRoleResult {
  id: string;
  name: string;
  description: string | null;
  updatedAt: Date;
}

@CommandHandler(UpdateRoleCommand)
export class UpdateRoleHandler implements ICommandHandler<
  UpdateRoleCommand,
  UpdateRoleResult
> {
  constructor(
    @Inject('IRoleRepository')
    private readonly roleRepository: IRoleRepository,
  ) {}

  async execute(command: UpdateRoleCommand): Promise<UpdateRoleResult> {
    // Find existing role
    const role = await this.roleRepository.findById(
      command.id,
      command.tenantId,
    );

    if (!role) {
      throw new NotFoundException(`Role with ID ${command.id} not found`);
    }

    // Cannot modify system roles
    if (role.isSystemRole()) {
      throw new DomainException('Cannot modify system roles');
    }

    // Check if new name already exists (if name is being changed)
    if (command.name && command.name !== role.getName()) {
      const existingRole = await this.roleRepository.findByName(
        command.name,
        command.tenantId,
      );
      if (existingRole) {
        throw new ConflictException(
          `Role with name "${command.name}" already exists`,
        );
      }
    }

    // Update the role
    role.update(command.name, command.description);
    await this.roleRepository.update(role);

    return {
      id: role.getId(),
      name: role.getName(),
      description: role.getDescription(),
      updatedAt: role.getUpdatedAt(),
    };
  }
}
