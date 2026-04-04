import { Injectable } from '@nestjs/common';

export interface UserWithRoles {
  getId(): string;
  getRoles(): string[];
}

export interface RoleWithPermissions {
  getName(): string;
  getPermissions(): string[];
}

@Injectable()
export class UserPermissionService {
  /**
   * Get all permissions for a user based on their roles
   */
  static getUserPermissions(
    user: UserWithRoles,
    roles: RoleWithPermissions[],
  ): string[] {
    const userRoles = user.getRoles();
    const permissions = new Set<string>();

    for (const role of roles) {
      if (userRoles.includes(role.getName())) {
        role
          .getPermissions()
          .forEach((permission) => permissions.add(permission));
      }
    }

    return Array.from(permissions);
  }
}
