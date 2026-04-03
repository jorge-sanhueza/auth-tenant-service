import type { Prisma } from 'generated/prisma/client';
import { Role } from '../../../../domain/entities/role.entity';

type PrismaRoleWithPermissions = Prisma.RoleGetPayload<{
  include: {
    permissions: {
      include: {
        permission: true;
      };
    };
  };
}>;

export class RoleMapper {
  static toDomain = (prismaRole: PrismaRoleWithPermissions): Role => {
    const permissions =
      prismaRole.permissions?.map((rp) => rp.permission.name) || [];

    return Role.reconstitute({
      id: prismaRole.id,
      name: prismaRole.name,
      description: prismaRole.description,
      tenantId: prismaRole.tenantId!,
      isSystem: prismaRole.isSystem,
      permissions: permissions,
      createdAt: prismaRole.createdAt,
      updatedAt: prismaRole.updatedAt,
    });
  };

  static toPersistence = (
    role: Role,
  ): {
    id: string;
    name: string;
    description: string | null;
    tenantId: string;
    isSystem: boolean;
    createdAt: Date;
    updatedAt: Date;
  } => {
    return {
      id: role.getId(),
      name: role.getName(),
      description: role.getDescription(),
      tenantId: role.getTenantId(),
      isSystem: role.isSystemRole(),
      createdAt: role.getCreatedAt(),
      updatedAt: role.getUpdatedAt(),
    };
  };
}
