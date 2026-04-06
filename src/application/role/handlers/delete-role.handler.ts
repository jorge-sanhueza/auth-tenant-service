import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject, NotFoundException } from '@nestjs/common';
import { DeleteRoleCommand } from '../commands/delete-role.command';
import type { IRoleRepository } from '../../../domain/interfaces/repositories/role.repository.interface';
import { DomainException } from '../../../domain/exceptions/domain.exception';

export interface DeleteRoleResult {
  success: boolean;
  message: string;
}

@CommandHandler(DeleteRoleCommand)
export class DeleteRoleHandler implements ICommandHandler<
  DeleteRoleCommand,
  DeleteRoleResult
> {
  constructor(
    @Inject('IRoleRepository')
    private readonly roleRepository: IRoleRepository,
  ) {}

  async execute(command: DeleteRoleCommand): Promise<DeleteRoleResult> {
    // Find existing role
    const role = await this.roleRepository.findById(
      command.id,
      command.tenantId,
    );

    if (!role) {
      throw new NotFoundException(`Role with ID ${command.id} not found`);
    }

    // Cannot delete system roles
    if (role.isSystemRole()) {
      throw new DomainException('Cannot delete system roles');
    }

    await this.roleRepository.delete(command.id, command.tenantId);

    return {
      success: true,
      message: `Role "${role.getName()}" deleted successfully`,
    };
  }
}
