import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { ChangePasswordCommand } from '../commands/change-password.command';
import type { IUserRepository } from '../../../domain/interfaces/repositories/user.repository.interface';
import type { ISessionRepository } from '../../../domain/interfaces/repositories/session.repository.interface';
import { ChangePasswordResult } from '../types/change-password-result.type';
import {
  InvalidCredentialsException,
  UserNotFoundException,
} from '../../../domain/exceptions/domain.exception';

@CommandHandler(ChangePasswordCommand)
export class ChangePasswordHandler implements ICommandHandler<
  ChangePasswordCommand,
  ChangePasswordResult
> {
  constructor(
    @Inject('IUserRepository')
    private readonly userRepository: IUserRepository,
    @Inject('ISessionRepository')
    private readonly sessionRepository: ISessionRepository,
  ) {}

  async execute(command: ChangePasswordCommand): Promise<ChangePasswordResult> {
    // 1. Find the user
    const user = await this.userRepository.findById(
      command.userId,
      command.tenantId,
    );

    if (!user) {
      throw new UserNotFoundException();
    }

    // 2. Verify old password
    if (!user.authenticate(command.oldPassword)) {
      throw new InvalidCredentialsException();
    }

    // 3. Change password (this creates a new hash internally)
    user.changePassword(command.oldPassword, command.newPassword);

    // 4. Update user in database
    await this.userRepository.update(user);

    // 5. Delete ALL sessions for this user (force logout from all devices)
    await this.sessionRepository.deleteByUserId(command.userId);

    return {
      success: true,
      message:
        'Password changed successfully. Please login again with your new password.',
    };
  }
}
