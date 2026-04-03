import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { CreateRoleCommand } from '../commands/create-role.command';
import type { IRoleRepository } from '../../../domain/interfaces/repositories/role.repository.interface';
import { Role } from '../../../domain/entities/role.entity';
import { DomainException } from '../../../domain/exceptions/domain.exception';

export interface CreateRoleResult {
  id: string;
  name: string;
  description: string | null;
  createdAt: Date;
}

@CommandHandler(CreateRoleCommand)
export class CreateRoleHandler implements ICommandHandler<
  CreateRoleCommand,
  CreateRoleResult
> {
  constructor(
    @Inject('IRoleRepository')
    private readonly roleRepository: IRoleRepository,
  ) {}

  async execute(command: CreateRoleCommand): Promise<CreateRoleResult> {
    // Check if role with same name exists in tenant
    const existingRole = await this.roleRepository.findByName(
      command.name,
      command.tenantId,
    );

    if (existingRole) {
      throw new DomainException(
        `Role "${command.name}" already exists in this tenant`,
      );
    }

    // Create role entity
    const role = Role.create(
      command.name,
      command.tenantId,
      command.description,
      false, // Non-system role
    );

    // Save to database
    await this.roleRepository.save(role);

    return {
      id: role.getId(),
      name: role.getName(),
      description: role.getDescription(),
      createdAt: role.getCreatedAt(),
    };
  }
}
