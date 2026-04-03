import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { LogoutCommand } from '../commands/logout.command';
import type { ISessionRepository } from '../../../domain/interfaces/repositories/session.repository.interface';
import type { ITokenService } from '../../../domain/interfaces/services/token.service.interface';

export interface LogoutResult {
  success: boolean;
  message: string;
}

@CommandHandler(LogoutCommand)
export class LogoutHandler implements ICommandHandler<
  LogoutCommand,
  LogoutResult
> {
  constructor(
    @Inject('ISessionRepository')
    private readonly sessionRepository: ISessionRepository,
    @Inject('ITokenService')
    private readonly tokenService: ITokenService,
  ) {}

  async execute(command: LogoutCommand): Promise<LogoutResult> {
    // 1. Verify the refresh token is valid
    try {
      this.tokenService.verifyToken(command.refreshToken);
    } catch (error) {
      console.warn('Invalid refresh token during logout:', error);
      // if the token is invalid, we can still consider the logout successful, but maybe we shouldn't... (perfect candidate for a graceful degradation strategy)
      return {
        success: true,
        message: 'Logout successful',
      };
    }

    // 2. Find and delete the session
    const session = await this.sessionRepository.findByToken(
      command.refreshToken,
    );

    if (!session) {
      // Session already deleted or doesn't exist
      return {
        success: true,
        message: 'Logout successful',
      };
    }

    // 3. Delete the session
    await this.sessionRepository.delete(session.getId());

    return {
      success: true,
      message: 'Logout successful',
    };
  }
}
