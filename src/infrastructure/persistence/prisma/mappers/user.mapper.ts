import type { Prisma } from 'generated/prisma/client';
import { User } from '../../../../domain/entities/user.entity';

type PrismaUserWithRoles = Prisma.UserGetPayload<{
  include: {
    userRoles: {
      include: {
        role: {
          select: {
            name: true;
          };
        };
      };
    };
  };
}>;

export class UserMapper {
  static toDomain(prismaUser: PrismaUserWithRoles): User {
    const roles = prismaUser.userRoles?.map((ur) => ur.role.name) || [];

    return User.reconstitute({
      id: prismaUser.id,
      email: prismaUser.email,
      password: prismaUser.password,
      tenantId: prismaUser.tenantId,
      firstName: prismaUser.firstName,
      lastName: prismaUser.lastName,
      isActive: prismaUser.isActive,
      roles: roles,
      lastLoginAt: prismaUser.lastLoginAt,
      createdAt: prismaUser.createdAt,
      updatedAt: prismaUser.updatedAt,
    });
  }

  static toPersistence(user: User): {
    id: string;
    email: string;
    password: string;
    tenantId: string;
    firstName: string | null;
    lastName: string | null;
    isActive: boolean;
    lastLoginAt: Date | null;
    createdAt: Date;
    updatedAt: Date;
  } {
    return {
      id: user.getId(),
      email: user.getEmail(),
      password: user.getPasswordHash(),
      tenantId: user.getTenantId(),
      firstName: user.getFirstName(),
      lastName: user.getLastName(),
      isActive: user.isUserActive(),
      lastLoginAt: user.getLastLoginAt(),
      createdAt: user.getCreatedAt(),
      updatedAt: user.getUpdatedAt(),
    };
  }
}
