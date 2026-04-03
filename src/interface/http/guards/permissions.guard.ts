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

    if (!requiredPermissions) {
      return true;
    }

    const request = context.switchToHttp().getRequest<RequestWithUser>();
    const user = request.user;

    if (!user) {
      throw new ForbiddenException('User not authenticated');
    }

    // check if user has admin role (full access)
    const hasAdminRole = user.roles.includes('admin');

    if (hasAdminRole) {
      return true;
    }

    // TODO: Implement proper permission checking when there are user permissions

    throw new ForbiddenException('Insufficient permissions');
  }
}
