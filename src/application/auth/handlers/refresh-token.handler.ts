import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject, UnauthorizedException } from '@nestjs/common';
import { RefreshTokenCommand } from '../commands/refresh-token.command';
import type { ISessionRepository } from '../../../domain/interfaces/repositories/session.repository.interface';
import {
  type ITokenService,
  TokenPayload,
} from '../../../domain/interfaces/services/token.service.interface';
import type { IUserRepository } from '../../../domain/interfaces/repositories/user.repository.interface';
import { RefreshTokenResult } from '../types/refresh-token-result.type';
import { UserNotFoundException } from '../../../domain/exceptions/domain.exception';
import { Session } from 'src/domain/entities/session.entity';

@CommandHandler(RefreshTokenCommand)
export class RefreshTokenHandler implements ICommandHandler<
  RefreshTokenCommand,
  RefreshTokenResult
> {
  constructor(
    @Inject('ISessionRepository')
    private readonly sessionRepository: ISessionRepository,
    @Inject('ITokenService')
    private readonly tokenService: ITokenService,
    @Inject('IUserRepository')
    private readonly userRepository: IUserRepository,
  ) {}

  async execute(command: RefreshTokenCommand): Promise<RefreshTokenResult> {
    // 1. Verify the refresh token
    let payload: TokenPayload;
    try {
      payload = this.tokenService.verifyToken(command.refreshToken);
    } catch (error) {
      console.error('Token verification failed:', error);
      throw new UnauthorizedException('Invalid or expired refresh token');
    }

    // 2. Verify tenant matches
    if (payload.tenantId !== command.tenantId) {
      throw new UnauthorizedException('Tenant mismatch');
    }

    // 3. Find the session in database
    const session = await this.sessionRepository.findByToken(
      command.refreshToken,
    );

    if (!session) {
      throw new UnauthorizedException('Session not found');
    }

    // 4. Check if session is expired
    if (session.isExpired()) {
      await this.sessionRepository.delete(session.getId());
      throw new UnauthorizedException('Refresh token expired');
    }

    // 5. Get the user
    const user = await this.userRepository.findById(
      payload.userId,
      payload.tenantId,
    );

    if (!user) {
      throw new UserNotFoundException();
    }

    if (!user.isUserActive()) {
      throw new UnauthorizedException('User account is deactivated');
    }

    // 6. Generate new tokens
    const tokenPayload: TokenPayload = {
      userId: user.getId(),
      email: user.getEmail(),
      tenantId: user.getTenantId(),
      roles: user.getRoles(),
    };

    const newAccessToken = this.tokenService.generateAccessToken(tokenPayload);
    const newRefreshToken =
      this.tokenService.generateRefreshToken(tokenPayload);

    // 7. Delete old session and create new one
    await this.sessionRepository.delete(session.getId());

    // Create new session for the new refresh token
    const newSession = Session.create(user.getId(), newRefreshToken, 7);
    await this.sessionRepository.create(newSession);

    return {
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
      expiresIn: 3600, // 1 hour in seconds
    };
  }
}
