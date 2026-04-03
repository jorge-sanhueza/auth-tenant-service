import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { LogoutAllCommand } from '../commands/logout-all.command';
import type { ISessionRepository } from '../../../domain/interfaces/repositories/session.repository.interface';
import { LogoutResult } from './logout.handler';

@CommandHandler(LogoutAllCommand)
export class LogoutAllHandler implements ICommandHandler<
  LogoutAllCommand,
  LogoutResult
> {
  constructor(
    @Inject('ISessionRepository')
    private readonly sessionRepository: ISessionRepository,
  ) {}

  async execute(command: LogoutAllCommand): Promise<LogoutResult> {
    // Delete all sessions for this user
    await this.sessionRepository.deleteByUserId(command.userId);

    return {
      success: true,
      message: 'Logged out from all devices successfully',
    };
  }
}
