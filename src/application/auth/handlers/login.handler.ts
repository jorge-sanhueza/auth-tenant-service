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
import { Session } from 'src/domain/entities/session.entity';
import type { ISessionRepository } from 'src/domain/interfaces/repositories/session.repository.interface';
import type { IRoleRepository } from 'src/domain/interfaces/repositories/role.repository.interface';
import { UserPermissionService } from 'src/domain/services/user-permission.service';

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
    @Inject('ISessionRepository')
    private readonly sessionRepository: ISessionRepository,
    @Inject('IRoleRepository')
    private readonly roleRepository: IRoleRepository,
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

    // Get all roles for this tenant to extract permissions
    const allRoles = await this.roleRepository.findAll(command.tenantId);

    // Extract permissions for the user's roles
    const userPermissions = UserPermissionService.getUserPermissions(
      user,
      allRoles,
    );

    // Set permissions on user object
    user.setPermissions(userPermissions);

    // Update last login
    await this.userRepository.updateLastLogin(user.getId(), user.getTenantId());

    // Generate tokens
    const tokens = this.tokenService.generateTokens({
      userId: user.getId(),
      email: user.getEmail(),
      tenantId: user.getTenantId(),
      roles: user.getRoles(),
    });

    // Create session for refresh token
    const session = Session.create(user.getId(), tokens.refreshToken, 7);
    await this.sessionRepository.create(session);

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
