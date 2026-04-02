import {
  Injectable,
  NestMiddleware,
  BadRequestException,
} from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class TenantMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    // Extract tenant ID from header
    const tenantId = req.headers['x-tenant-id'] as string;

    if (!tenantId) {
      // In a multitenant app, every request should have a tenant
      throw new BadRequestException(
        'Tenant ID is required. Please provide x-tenant-id header',
      );
    }

    // Attach tenant ID to request for use in controllers, guards, etc.
    req.tenantId = tenantId;

    next();
  }
}
