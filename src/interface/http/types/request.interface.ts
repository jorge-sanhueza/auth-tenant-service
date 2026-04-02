import { Request } from 'express';

export interface CurrentUser {
  userId: string;
  email: string;
  tenantId: string;
  roles: string[];
}

export interface AuthenticatedRequest extends Request {
  user: CurrentUser;
}

export interface TenantRequest extends Request {
  tenantId: string;
}

// Intersection type
export type AuthenticatedTenantRequest = AuthenticatedRequest & TenantRequest;

// Alternatively
export interface FullAuthenticatedRequest extends Request {
  user: CurrentUser;
  tenantId: string;
}
