import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { RegisterCommand } from '../commands/register.command';
import type { IUserRepository } from '../../../domain/interfaces/repositories/user.repository.interface';
import { User } from '../../../domain/entities/user.entity';
import { UserAlreadyExistsException } from '../../../domain/exceptions/domain.exception';
import { Inject } from '@nestjs/common';

export interface RegisterCommandResult {
  userId: string;
  email: string;
  tenantId: string;
}

@CommandHandler(RegisterCommand)
export class RegisterHandler implements ICommandHandler<
  RegisterCommand,
  RegisterCommandResult
> {
  constructor(
    @Inject('IUserRepository')
    private readonly userRepository: IUserRepository,
  ) {}

  async execute(command: RegisterCommand): Promise<RegisterCommandResult> {
    // Check if user already exists
    const existingUser = await this.userRepository.findByEmail(
      command.email,
      command.tenantId,
    );

    if (existingUser) {
      throw new UserAlreadyExistsException(command.email);
    }

    // Create domain user entity
    const user = User.create(
      command.email,
      command.password,
      command.tenantId,
      command.firstName,
      command.lastName,
    );

    // Persist user
    await this.userRepository.save(user);

    return {
      userId: user.getId(),
      email: user.getEmail(),
      tenantId: user.getTenantId(),
    };
  }
}
