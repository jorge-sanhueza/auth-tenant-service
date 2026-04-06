import {
  Controller,
  Post,
  Get,
  Body,
  Query,
  HttpCode,
  HttpStatus,
  UseGuards,
  Param,
  Patch,
  Delete,
} from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { CreateRoleCommand } from '../../../application/role/commands/create-role.command';
import { ListRolesQuery } from '../../../application/role/queries/list-roles.query';
import { CreateRoleRequestDto } from '../dto/request/create-role.request.dto';
import { ApiResponse } from '../dto/response/api-response.dto';
import { Permissions } from '../decorators/permissions.decorator';
import { TenantId } from '../decorators/tenant-id.decorator';
import { CreateRoleResult } from 'src/application/role/handlers/create-role.handler';
import {
  ListRolesResult,
  RoleDto,
} from 'src/application/role/handlers/list-roles.handler';
import { PermissionsGuard } from '../guards/permissions.guard';
import { GetRoleQuery } from 'src/application/role/queries/get-role.query';
import { UpdateRoleRequestDto } from '../dto/request/update-role.request.dto';
import { UpdateRoleCommand } from 'src/application/role/commands/update-role.command';
import { UpdateRoleResult } from 'src/application/role/handlers/update-role.handler';
import { DeleteRoleCommand } from 'src/application/role/commands/delete-role.command';
import { DeleteRoleResult } from 'src/application/role/handlers/delete-role.handler';
import { AssignPermissionsRequestDto } from '../dto/request/assign-permissions.request.dto';
import { AssignPermissionsCommand } from 'src/application/role/commands/assign-permissions.command';
import { AssignPermissionsResult } from 'src/application/role/handlers/assign-permissions.handler';

@Controller('roles')
@UseGuards(PermissionsGuard)
export class RoleController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @Post()
  @Permissions('role:create')
  @HttpCode(HttpStatus.CREATED)
  async createRole(
    @TenantId() tenantId: string,
    @Body() createRoleDto: CreateRoleRequestDto,
  ) {
    const command = new CreateRoleCommand(
      createRoleDto.name,
      tenantId,
      createRoleDto.description,
    );

    const result = await this.commandBus.execute<
      CreateRoleCommand,
      CreateRoleResult
    >(command);

    return ApiResponse.success(
      result,
      'Role created successfully',
      HttpStatus.CREATED,
    );
  }

  @Get()
  @Permissions('role:read')
  @HttpCode(HttpStatus.OK)
  async listRoles(
    @TenantId() tenantId: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    const pageNumber = parseInt(page ?? '1', 10);
    const limitNumber = parseInt(limit ?? '10', 10);

    const query = new ListRolesQuery(tenantId, pageNumber, limitNumber);

    const result = await this.queryBus.execute<ListRolesQuery, ListRolesResult>(
      query,
    );

    return ApiResponse.success(
      result,
      'Roles retrieved successfully',
      HttpStatus.OK,
    );
  }

  @Get(':id')
  @Permissions('role:read')
  @HttpCode(HttpStatus.OK)
  async getRole(@TenantId() tenantId: string, @Param('id') id: string) {
    const query = new GetRoleQuery(id, tenantId);
    const result = await this.queryBus.execute<GetRoleQuery, RoleDto>(query);

    return ApiResponse.success(
      result,
      'Role retrieved successfully',
      HttpStatus.OK,
    );
  }

  @Patch(':id')
  @Permissions('role:update')
  @HttpCode(HttpStatus.OK)
  async updateRole(
    @TenantId() tenantId: string,
    @Param('id') id: string,
    @Body() updateRoleDto: UpdateRoleRequestDto,
  ) {
    const command = new UpdateRoleCommand(
      id,
      tenantId,
      updateRoleDto.name,
      updateRoleDto.description,
    );

    const result = await this.commandBus.execute<
      UpdateRoleCommand,
      UpdateRoleResult
    >(command);

    return ApiResponse.success(
      result,
      'Role updated successfully',
      HttpStatus.OK,
    );
  }

  @Delete(':id')
  @Permissions('role:delete')
  @HttpCode(HttpStatus.OK)
  async deleteRole(@TenantId() tenantId: string, @Param('id') id: string) {
    const command = new DeleteRoleCommand(id, tenantId);
    const result = await this.commandBus.execute<
      DeleteRoleCommand,
      DeleteRoleResult
    >(command);

    return ApiResponse.success(result, result.message, HttpStatus.OK);
  }

  @Post(':id/permissions')
  @Permissions('permission:assign')
  @HttpCode(HttpStatus.OK)
  async assignPermissions(
    @TenantId() tenantId: string,
    @Param('id') id: string,
    @Body() assignPermissionsDto: AssignPermissionsRequestDto,
  ) {
    const command = new AssignPermissionsCommand(
      id,
      tenantId,
      assignPermissionsDto.permissionIds,
    );

    const result = await this.commandBus.execute<
      AssignPermissionsCommand,
      AssignPermissionsResult
    >(command);

    return ApiResponse.success(
      result,
      'Permissions assigned successfully',
      HttpStatus.OK,
    );
  }
}
