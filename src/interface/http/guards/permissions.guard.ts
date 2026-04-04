import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PERMISSIONS_KEY } from '../decorators/permissions.decorator';
import { Request } from 'express';

export interface RequestWithUser extends Request {
  user?: {
    userId: string;
    email: string;
    tenantId: string;
    roles: string[];
    permissions: string[];
  };
}

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredPermissions = this.reflector.getAllAndOverride<string[]>(
      PERMISSIONS_KEY,
      [context.getHandler(), context.getClass()],
    );

    // If no permissions required, allow access
    if (!requiredPermissions || requiredPermissions.length === 0) {
      return true;
    }

    const request = context.switchToHttp().getRequest<RequestWithUser>();
    const user = request.user;

    if (!user) {
      throw new ForbiddenException('User not authenticated');
    }

    // Admin role has full access to everything
    if (user.roles.includes('admin')) {
      return true;
    }

    // Check if user has any of the required permissions
    const userPermissions = user.permissions || [];

    // User needs ALL required permissions
    const hasAllPermissions = requiredPermissions.every((permission) =>
      userPermissions.includes(permission),
    );

    if (hasAllPermissions) {
      return true;
    }

    // User needs ANY of the required permissions
    // const hasAnyPermission = requiredPermissions.some(permission =>
    //   userPermissions.includes(permission),
    // );
    // if (hasAnyPermission) return true;

    // Log which permissions are missing for debugging
    const missingPermissions = requiredPermissions.filter(
      (permission) => !userPermissions.includes(permission),
    );

    throw new ForbiddenException(
      `Insufficient permissions. Missing: ${missingPermissions.join(', ')}`,
    );
  }
}
