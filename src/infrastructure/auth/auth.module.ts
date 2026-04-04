import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from './jwt/jwt.module';
import { JwtStrategy } from './strategies/jwt.strategy';
import { JwtAuthGuard } from '../../interface/http/guards/jwt-auth.guard';
import { APP_GUARD } from '@nestjs/core';
import { PermissionsGuard } from 'src/interface/http/guards/permissions.guard';

@Module({
  imports: [PassportModule, JwtModule],
  providers: [
    JwtStrategy,
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    {
      provide: 'PERMISSIONS_GUARD',
      useClass: PermissionsGuard,
    },
  ],
  exports: [JwtModule],
})
export class AuthInfrastructureModule {}
