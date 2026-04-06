import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { IUserRepository } from '../../../../domain/interfaces/repositories/user.repository.interface';
import { User } from '../../../../domain/entities/user.entity';
import { UserMapper } from '../mappers/user.mapper';
import { UserNotFoundException } from '../../../../domain/exceptions/domain.exception';

@Injectable()
export class PrismaUserRepository implements IUserRepository {
  private readonly logger = new Logger(PrismaUserRepository.name);

  constructor(private readonly prisma: PrismaService) {}

  private handleError(operation: string, error: unknown): never {
    const message = error instanceof Error ? error.message : String(error);
    this.logger.error(`Error ${operation}: ${message}`);
    throw error;
  }

  async findById(id: string, tenantId: string): Promise<User | null> {
    try {
      const user = await this.prisma.user.findFirst({
        where: {
          id,
          tenantId,
        },
        include: {
          userRoles: {
            include: {
              role: {
                select: {
                  name: true,
                },
              },
            },
          },
        },
      });

      if (!user) return null;
      return UserMapper.toDomain(user);
    } catch (error) {
      this.handleError(`finding user by id ${id}`, error);
    }
  }

  async findByEmail(email: string, tenantId: string): Promise<User | null> {
    try {
      const user = await this.prisma.user.findFirst({
        where: {
          email,
          tenantId,
        },
        include: {
          userRoles: {
            include: {
              role: {
                select: {
                  name: true,
                },
              },
            },
          },
        },
      });

      if (!user) return null;
      return UserMapper.toDomain(user);
    } catch (error) {
      this.handleError(`finding user by email ${email}`, error);
    }
  }

  async findAll(tenantId: string, skip = 0, take = 10): Promise<User[]> {
    try {
      const users = await this.prisma.user.findMany({
        where: { tenantId },
        skip,
        take,
        include: {
          userRoles: {
            include: {
              role: {
                select: {
                  name: true,
                },
              },
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      });

      return users.map((user) => UserMapper.toDomain(user));
    } catch (error) {
      this.handleError('finding all users', error);
    }
  }

  async save(user: User): Promise<void> {
    try {
      const data = UserMapper.toPersistence(user);
      await this.prisma.user.create({
        data: {
          id: data.id,
          email: data.email,
          password: data.password,
          firstName: data.firstName,
          lastName: data.lastName,
          isActive: data.isActive,
          tenantId: data.tenantId,
          createdAt: data.createdAt,
          updatedAt: data.updatedAt,
          lastLoginAt: data.lastLoginAt,
        },
      });
      this.logger.log(`User created successfully: ${user.getId()}`);
    } catch (error) {
      this.handleError('saving user', error);
    }
  }

  async update(user: User): Promise<void> {
    try {
      const data = UserMapper.toPersistence(user);
      const result = await this.prisma.user.update({
        where: { id: data.id },
        data: {
          email: data.email,
          password: data.password,
          firstName: data.firstName,
          lastName: data.lastName,
          isActive: data.isActive,
          updatedAt: data.updatedAt,
          lastLoginAt: data.lastLoginAt,
        },
      });

      if (!result) {
        throw new UserNotFoundException();
      }
      this.logger.log(`User updated successfully: ${user.getId()}`);
    } catch (error) {
      this.handleError('updating user', error);
    }
  }

  async delete(id: string, tenantId: string): Promise<void> {
    try {
      const result = await this.prisma.user.deleteMany({
        where: {
          id,
          tenantId,
        },
      });

      if (result.count === 0) {
        throw new UserNotFoundException();
      }
      this.logger.log(`User deleted successfully: ${id}`);
    } catch (error) {
      this.handleError('deleting user', error);
    }
  }

  async count(tenantId: string): Promise<number> {
    try {
      return await this.prisma.user.count({
        where: { tenantId },
      });
    } catch (error) {
      this.handleError('counting users', error);
    }
  }

  async findByEmailWithRoles(
    email: string,
    tenantId: string,
  ): Promise<User | null> {
    try {
      const user = await this.prisma.user.findFirst({
        where: {
          email,
          tenantId,
        },
        include: {
          userRoles: {
            include: {
              role: {
                include: {
                  permissions: {
                    include: {
                      permission: true,
                    },
                  },
                },
              },
            },
          },
        },
      });

      if (!user) return null;
      return UserMapper.toDomain(user);
    } catch (error) {
      this.handleError('Error finding user by email with roles', error);
    }
  }

  async updateLastLogin(id: string, tenantId: string): Promise<void> {
    try {
      await this.prisma.user.updateMany({
        where: {
          id,
          tenantId,
        },
        data: {
          lastLoginAt: new Date(),
          updatedAt: new Date(),
        },
      });
      this.logger.log(`Last login updated for user: ${id}`);
    } catch (error) {
      this.handleError('updating last login', error);
    }
  }

  async findActiveUsers(
    tenantId: string,
    skip = 0,
    take = 10,
  ): Promise<User[]> {
    try {
      const users = await this.prisma.user.findMany({
        where: {
          tenantId,
          isActive: true,
        },
        skip,
        take,
        include: {
          userRoles: {
            include: {
              role: {
                select: {
                  name: true,
                },
              },
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      });

      return users.map((user) => UserMapper.toDomain(user));
    } catch (error) {
      this.handleError('Error finding active users', error);
    }
  }

  async findUsersByRole(tenantId: string, roleName: string): Promise<User[]> {
    try {
      const users = await this.prisma.user.findMany({
        where: {
          tenantId,
          userRoles: {
            some: {
              role: {
                name: roleName,
              },
            },
          },
        },
        include: {
          userRoles: {
            include: {
              role: {
                select: {
                  name: true,
                },
              },
            },
          },
        },
      });

      return users.map((user) => UserMapper.toDomain(user));
    } catch (error) {
      this.handleError('Error finding users by role', error);
    }
  }

  async assignRole(userId: string, roleId: string): Promise<void> {
    try {
      await this.prisma.userRole.create({
        data: {
          userId,
          roleId,
          assignedAt: new Date(),
        },
      });
      this.logger.log(`Role ${roleId} assigned to user ${userId}`);
    } catch (error) {
      this.handleError(`assigning role to user ${userId}`, error);
    }
  }

  async removeRole(userId: string, roleId: string): Promise<void> {
    try {
      await this.prisma.userRole.delete({
        where: {
          userId_roleId: {
            userId,
            roleId,
          },
        },
      });
      this.logger.log(`Role ${roleId} removed from user ${userId}`);
    } catch (error) {
      this.handleError(`removing role from user ${userId}`, error);
    }
  }

  async getUserRoles(userId: string): Promise<string[]> {
    try {
      const userRoles = await this.prisma.userRole.findMany({
        where: { userId },
        include: {
          role: true,
        },
      });

      return userRoles.map((ur) => ur.role.name);
    } catch (error) {
      this.handleError(`getting user roles for ${userId}`, error);
    }
  }
}
