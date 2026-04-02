import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { StringValue } from 'ms';
import { ConfigService } from '@nestjs/config';
import {
  ITokenService,
  TokenPayload,
  TokenResult,
} from '../../../domain/interfaces/services/token.service.interface';

@Injectable()
export class JwtTokenService implements ITokenService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  generateTokens(payload: TokenPayload): TokenResult {
    const accessToken = this.generateAccessToken(payload);
    const refreshToken = this.generateRefreshToken(payload);

    return {
      accessToken,
      refreshToken,
      expiresIn: this.configService.getOrThrow<number>(
        'JWT_EXPIRATION_SECONDS',
      ),
    };
  }

  generateAccessToken(payload: TokenPayload): string {
    const tokenPayload = {
      sub: payload.userId,
      email: payload.email,
      tenantId: payload.tenantId,
      roles: payload.roles,
      type: 'access' as const,
    };

    return this.jwtService.sign(tokenPayload, {
      expiresIn: this.configService.getOrThrow<string>(
        'JWT_ACCESS_EXPIRATION',
      ) as StringValue,
      secret: this.configService.getOrThrow<string>('JWT_ACCESS_SECRET'),
    });
  }

  generateRefreshToken(payload: TokenPayload): string {
    const tokenPayload = {
      sub: payload.userId,
      email: payload.email,
      tenantId: payload.tenantId,
      type: 'refresh' as const,
    };

    return this.jwtService.sign(tokenPayload, {
      expiresIn: this.configService.getOrThrow<string>(
        'JWT_REFRESH_EXPIRATION',
      ) as StringValue,
      secret: this.configService.getOrThrow<string>('JWT_REFRESH_SECRET'),
    });
  }

  verifyToken(token: string): TokenPayload {
    try {
      const payload: Record<string, unknown> = this.jwtService.verify(token, {
        secret: this.configService.getOrThrow<string>('JWT_ACCESS_SECRET'),
      });

      return {
        userId: String(payload.sub),
        email: String(payload.email),
        tenantId: String(payload.tenantId),
        roles: Array.isArray(payload.roles) ? payload.roles.map(String) : [],
      };
    } catch {
      // Fallback: try as refresh token
      try {
        const payload: Record<string, unknown> = this.jwtService.verify(token, {
          secret: this.configService.getOrThrow<string>('JWT_REFRESH_SECRET'),
        });

        return {
          userId: String(payload.sub),
          email: String(payload.email),
          tenantId: String(payload.tenantId),
          roles: [],
        };
      } catch {
        throw new UnauthorizedException('Invalid or expired token');
      }
    }
  }

  decodeToken(token: string): TokenPayload | null {
    const decoded: Record<string, unknown> = this.jwtService.decode(token);

    if (!decoded || typeof decoded !== 'object') {
      return null;
    }

    return {
      userId: typeof decoded.sub === 'string' ? decoded.sub : '',
      email: typeof decoded.email === 'string' ? decoded.email : '',
      tenantId: typeof decoded.tenantId === 'string' ? decoded.tenantId : '',
      roles: Array.isArray(decoded.roles)
        ? decoded.roles.filter((r): r is string => typeof r === 'string')
        : [],
    };
  }
}
