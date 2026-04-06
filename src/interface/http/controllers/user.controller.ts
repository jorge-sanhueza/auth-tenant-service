import {
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Query,
} from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import {
  CurrentUser,
  type CurrentUserType,
} from '../decorators/current-user.decorator';
import { GetCurrentUserQuery } from '../../../application/user/queries/get-current-user.query';
import { ApiResponse } from '../dto/response/api-response.dto';
import type { UserProfileDto } from '../dto/response/user-profile.dto';
import { Permissions } from '../decorators/permissions.decorator';
import { TenantId } from '../decorators/tenant-id.decorator';
import { AssignRoleCommand } from 'src/application/user/commands/assign-role.command';
import { AssignRoleResult } from 'src/application/user/handlers/assign-role.handler';
import { RemoveRoleCommand } from 'src/application/user/commands/remove-role.command';
import { RemoveRoleResult } from 'src/application/user/handlers/remove-role.handler';
import { ListUsersQuery } from 'src/application/user/queries/list-users.query';
import { ListUsersResult } from 'src/application/user/handlers/list-users.handler';

@Controller('users')
export class UserController {
  constructor(
    private readonly queryBus: QueryBus,
    private readonly commandBus: CommandBus,
  ) {}

  @Get('me')
  @HttpCode(HttpStatus.OK)
  async getCurrentUser(
    @CurrentUser() currentUser: CurrentUserType,
  ): Promise<ApiResponse<UserProfileDto>> {
    const query = new GetCurrentUserQuery(
      currentUser.userId,
      currentUser.tenantId,
    );

    const result = await this.queryBus.execute<
      GetCurrentUserQuery,
      UserProfileDto
    >(query);

    return ApiResponse.success(
      result,
      'User profile retrieved successfully',
      HttpStatus.OK,
    );
  }

  @Get()
  @Permissions('user:read')
  @HttpCode(HttpStatus.OK)
  async listUsers(
    @TenantId() tenantId: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('search') search?: string,
    @Query('isActive') isActive?: string,
  ) {
    const pageNumber = parseInt(page ?? '1', 10);
    const limitNumber = parseInt(limit ?? '10', 10);
    const isActiveBoolean =
      isActive === 'true' ? true : isActive === 'false' ? false : undefined;

    const query = new ListUsersQuery(
      tenantId,
      pageNumber,
      limitNumber,
      search,
      isActiveBoolean,
    );

    const result = await this.queryBus.execute<ListUsersQuery, ListUsersResult>(
      query,
    );

    return ApiResponse.success(
      result,
      'Users retrieved successfully',
      HttpStatus.OK,
    );
  }

  @Post(':userId/roles/:roleId')
  @Permissions('role:assign')
  @HttpCode(HttpStatus.OK)
  async assignRole(
    @TenantId() tenantId: string,
    @Param('userId') userId: string,
    @Param('roleId') roleId: string,
  ) {
    const command = new AssignRoleCommand(userId, roleId, tenantId);
    const result = await this.commandBus.execute<
      AssignRoleCommand,
      AssignRoleResult
    >(command);

    return ApiResponse.success(
      result,
      `Role "${result.roleName}" assigned to user successfully`,
      HttpStatus.OK,
    );
  }

  @Delete(':userId/roles/:roleId')
  @Permissions('role:assign')
  @HttpCode(HttpStatus.OK)
  async removeRole(
    @TenantId() tenantId: string,
    @Param('userId') userId: string,
    @Param('roleId') roleId: string,
  ) {
    const command = new RemoveRoleCommand(userId, roleId, tenantId);
    const result = await this.commandBus.execute<
      RemoveRoleCommand,
      RemoveRoleResult
    >(command);

    return ApiResponse.success(
      result,
      `Role "${result.roleName}" removed from user successfully`,
      HttpStatus.OK,
    );
  }
}
