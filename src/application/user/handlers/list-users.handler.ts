import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { ListUsersQuery } from '../queries/list-users.query';
import type { IUserRepository } from '../../../domain/interfaces/repositories/user.repository.interface';

export interface UserListItemDto {
  id: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  isActive: boolean;
  roles: string[];
  lastLoginAt: Date | null;
  createdAt: Date;
}

export interface ListUsersResult {
  users: UserListItemDto[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

@QueryHandler(ListUsersQuery)
export class ListUsersHandler implements IQueryHandler<
  ListUsersQuery,
  ListUsersResult
> {
  constructor(
    @Inject('IUserRepository')
    private readonly userRepository: IUserRepository,
  ) {}

  async execute(query: ListUsersQuery): Promise<ListUsersResult> {
    const skip = (query.page - 1) * query.limit;

    // Get users with pagination
    const users = await this.userRepository.findAll(
      query.tenantId,
      skip,
      query.limit,
    );

    const total = await this.userRepository.count(query.tenantId);
    const totalPages = Math.ceil(total / query.limit);

    return {
      users: users.map((user) => ({
        id: user.getId(),
        email: user.getEmail(),
        firstName: user.getFirstName(),
        lastName: user.getLastName(),
        isActive: user.isUserActive(),
        roles: user.getRoles(),
        lastLoginAt: user.getLastLoginAt(),
        createdAt: user.getCreatedAt(),
      })),
      total,
      page: query.page,
      limit: query.limit,
      totalPages,
    };
  }
}
