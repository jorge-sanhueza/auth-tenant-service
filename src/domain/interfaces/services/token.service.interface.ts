export interface TokenPayload {
  userId: string;
  email: string;
  tenantId: string;
  roles: string[];
  permissions?: string[];
}

export interface TokenResult {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export interface ITokenService {
  generateTokens(payload: TokenPayload): TokenResult;
  generateAccessToken(payload: TokenPayload): string;
  generateRefreshToken(payload: TokenPayload): string;
  verifyToken(token: string): TokenPayload;
  decodeToken(token: string): TokenPayload | null;
}
