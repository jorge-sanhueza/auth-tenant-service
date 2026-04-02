import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { GetCurrentUserQuery } from '../queries/get-current-user.query';
import type { IUserRepository } from '../../../domain/interfaces/repositories/user.repository.interface';
import { UserNotFoundException } from '../../../domain/exceptions/domain.exception';

export interface UserProfileResult {
  id: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  roles: string[];
  isActive: boolean;
  lastLoginAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

@QueryHandler(GetCurrentUserQuery)
export class GetCurrentUserHandler implements IQueryHandler<
  GetCurrentUserQuery,
  UserProfileResult
> {
  constructor(
    @Inject('IUserRepository')
    private readonly userRepository: IUserRepository,
  ) {}

  async execute(query: GetCurrentUserQuery): Promise<UserProfileResult> {
    const user = await this.userRepository.findById(
      query.userId,
      query.tenantId,
    );

    if (!user) {
      throw new UserNotFoundException();
    }

    return {
      id: user.getId(),
      email: user.getEmail(),
      firstName: user.getFirstName(),
      lastName: user.getLastName(),
      roles: user.getRoles(),
      isActive: user.isUserActive(),
      lastLoginAt: user.getLastLoginAt(),
      createdAt: user.getCreatedAt(),
      updatedAt: user.getUpdatedAt(),
    };
  }
}
