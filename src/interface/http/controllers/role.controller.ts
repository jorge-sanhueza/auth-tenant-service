import {
  Controller,
  Post,
  Get,
  Body,
  Query,
  HttpCode,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { CreateRoleCommand } from '../../../application/role/commands/create-role.command';
import { ListRolesQuery } from '../../../application/role/queries/list-roles.query';
import { CreateRoleRequestDto } from '../dto/request/create-role.request.dto';
import { ApiResponse } from '../dto/response/api-response.dto';
import { Permissions } from '../decorators/permissions.decorator';
import { TenantId } from '../decorators/tenant-id.decorator';
import { CreateRoleResult } from 'src/application/role/handlers/create-role.handler';
import { ListRolesResult } from 'src/application/role/handlers/list-roles.handler';
import { PermissionsGuard } from '../guards/permissions.guard';

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
}
