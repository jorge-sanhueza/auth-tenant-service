import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import type { TokenPayload } from '../../../domain/interfaces/services/token.service.interface';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.getOrThrow<string>('JWT_ACCESS_SECRET'),
    });
  }

  validate(payload: unknown): TokenPayload {
    if (!payload || typeof payload !== 'object') {
      throw new UnauthorizedException('Invalid token payload');
    }

    const typedPayload = payload as Record<string, unknown>;

    if (
      typeof typedPayload.sub !== 'string' ||
      typeof typedPayload.email !== 'string' ||
      typeof typedPayload.tenantId !== 'string'
    ) {
      throw new UnauthorizedException(
        'Invalid token payload: missing required fields',
      );
    }

    return {
      userId: typedPayload.sub,
      email: typedPayload.email,
      tenantId: typedPayload.tenantId,
      roles: Array.isArray(typedPayload.roles)
        ? typedPayload.roles.filter((r): r is string => typeof r === 'string')
        : [],
    };
  }
}
