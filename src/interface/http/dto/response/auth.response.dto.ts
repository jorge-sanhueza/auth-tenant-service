import { ApiResponse } from './api-response.dto';

export interface RegisterResponseData {
  userId: string;
  email: string;
  tenantId: string;
}

export type RegisterResponseDto = ApiResponse<RegisterResponseData>;

export interface UserInfo {
  id: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  roles: string[];
}

export interface LoginResponseData {
  accessToken: string;
  refreshToken?: string;
  user: {
    id: string;
    email: string;
    firstName?: string | null;
    lastName?: string | null;
    roles: string[];
  };
}

export type LoginResponseDto = ApiResponse<LoginResponseData>;
