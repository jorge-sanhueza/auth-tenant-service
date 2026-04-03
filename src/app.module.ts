import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { CqrsModule } from '@nestjs/cqrs';
import { EventEmitterModule } from '@nestjs/event-emitter';

// Infrastructure
import { PrismaService } from './infrastructure/persistence/prisma/prisma.service';
import { PrismaUserRepository } from './infrastructure/persistence/prisma/repositories/prisma-user.repository';

// Application Handlers
import { RegisterHandler } from './application/auth/handlers/register.handler';

// Interface
import { AuthController } from './interface/http/controllers/auth.controller';
import { AppController } from './interface/http/controllers/app.controller';
import { LoginHandler } from './application/auth/handlers/login.handler';
import { GetCurrentUserHandler } from './application/user/handlers/get-current-user.handler';
import { TenantMiddleware } from './infrastructure/http/middleware/tenant.middleware';
import { JwtModule } from './infrastructure/auth/jwt/jwt.module';
import { AuthInfrastructureModule } from './infrastructure/auth/auth.module';
import { UserController } from './interface/http/controllers/user.controller';
import { PrismaSessionRepository } from './infrastructure/persistence/prisma/repositories/prisma-session.repository';
import { RefreshTokenHandler } from './application/auth/handlers/refresh-token.handler';
import { LogoutHandler } from './application/auth/handlers/logout.handler';
import { LogoutAllHandler } from './application/auth/handlers/logout-all.handler';

const commandHandlers = [
  RegisterHandler,
  LoginHandler,
  RefreshTokenHandler,
  LogoutHandler,
  LogoutAllHandler,
];
const queryHandlers = [GetCurrentUserHandler];
const repositories = [
  {
    provide: 'IUserRepository',
    useClass: PrismaUserRepository,
  },
  {
    provide: 'ISessionRepository',
    useClass: PrismaSessionRepository,
  },
];

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    CqrsModule,
    EventEmitterModule.forRoot({
      wildcard: false,
      delimiter: '.',
      newListener: false,
      removeListener: false,
      maxListeners: 10,
      verboseMemoryLeak: false,
      ignoreErrors: false,
    }),
    JwtModule,
    AuthInfrastructureModule,
  ],
  controllers: [AuthController, AppController, UserController],
  providers: [
    // Infrastructure
    PrismaService,
    ...repositories,
    // Command Handlers
    ...commandHandlers,
    // Query Handlers
    ...queryHandlers,
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    // Apply tenant middleware to all routes
    consumer.apply(TenantMiddleware).forRoutes('*');
  }
}
