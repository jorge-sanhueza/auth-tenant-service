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
import { ChangePasswordHandler } from './application/auth/handlers/change-password.handler';
import { PrismaRoleRepository } from './infrastructure/persistence/prisma/repositories/prisma-role.repository';
import { CreateRoleHandler } from './application/role/handlers/create-role.handler';
import { ListRolesHandler } from './application/role/handlers/list-roles.handler';
import { RoleController } from './interface/http/controllers/role.controller';
import { GetRoleHandler } from './application/role/handlers/get-role.handler';
import { DeleteRoleHandler } from './application/role/handlers/delete-role.handler';
import { AssignPermissionsHandler } from './application/role/handlers/assign-permissions.handler';
import { UpdateRoleHandler } from './application/role/handlers/update-role.handler';
import { ListPermissionsHandler } from './application/permission/handlers/list-permissions.handler';
import { PermissionController } from './interface/http/controllers/permission.controller';
import { AssignRoleHandler } from './application/user/handlers/assign-role.handler';
import { RemoveRoleHandler } from './application/user/handlers/remove-role.handler';
import { ListUsersHandler } from './application/user/handlers/list-users.handler';

const commandHandlers = [
  RegisterHandler,
  LoginHandler,
  RefreshTokenHandler,
  LogoutHandler,
  LogoutAllHandler,
  ChangePasswordHandler,
  CreateRoleHandler,
  UpdateRoleHandler,
  DeleteRoleHandler,
  AssignPermissionsHandler,
  AssignRoleHandler,
  RemoveRoleHandler,
];
const queryHandlers = [
  GetCurrentUserHandler,
  ListRolesHandler,
  GetRoleHandler,
  ListPermissionsHandler,
  ListUsersHandler,
];
const repositories = [
  {
    provide: 'IUserRepository',
    useClass: PrismaUserRepository,
  },
  {
    provide: 'ISessionRepository',
    useClass: PrismaSessionRepository,
  },
  {
    provide: 'IRoleRepository',
    useClass: PrismaRoleRepository,
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
  controllers: [
    AuthController,
    AppController,
    UserController,
    RoleController,
    PermissionController,
  ],
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
