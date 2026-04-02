import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { LoginCommand } from '../commands/login.command';
import type { IUserRepository } from '../../../domain/interfaces/repositories/user.repository.interface';
import type { ITokenService } from '../../../domain/interfaces/services/token.service.interface';
import {
  InvalidCredentialsException,
  UserDeactivatedException,
} from '../../../domain/exceptions/domain.exception';
import { LoginResult } from '../types/login-result.type';

@CommandHandler(LoginCommand)
export class LoginHandler implements ICommandHandler<
  LoginCommand,
  LoginResult
> {
  constructor(
    @Inject('IUserRepository')
    private readonly userRepository: IUserRepository,
    @Inject('ITokenService')
    private readonly tokenService: ITokenService,
  ) {}

  async execute(command: LoginCommand): Promise<LoginResult> {
    // Find user by email
    const user = await this.userRepository.findByEmailWithRoles(
      command.email,
      command.tenantId,
    );

    if (!user) {
      throw new InvalidCredentialsException();
    }

    // Verify password
    if (!user.authenticate(command.password)) {
      throw new InvalidCredentialsException();
    }

    // Check if user is active
    if (!user.isUserActive()) {
      throw new UserDeactivatedException();
    }

    // Update last login
    await this.userRepository.updateLastLogin(user.getId(), user.getTenantId());

    // Generate tokens
    const tokens = this.tokenService.generateTokens({
      userId: user.getId(),
      email: user.getEmail(),
      tenantId: user.getTenantId(),
      roles: user.getRoles(),
    });

    return {
      ...tokens,
      user: {
        id: user.getId(),
        email: user.getEmail(),
        firstName: user.getFirstName(),
        lastName: user.getLastName(),
        roles: user.getRoles(),
      },
    };
  }
}
