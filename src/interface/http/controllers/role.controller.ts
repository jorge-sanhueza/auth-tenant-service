import {
  Controller,
  Post,
  Get,
  Body,
  Query,
  HttpCode,
  HttpStatus,
  Req,
} from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import type { Request } from 'express';
import { CreateRoleCommand } from '../../../application/role/commands/create-role.command';
import { ListRolesQuery } from '../../../application/role/queries/list-roles.query';
import { CreateRoleRequestDto } from '../dto/request/create-role.request.dto';
import { ApiResponse } from '../dto/response/api-response.dto';
import { Permissions } from '../decorators/permissions.decorator';
import { CreateRoleResult } from 'src/application/role/handlers/create-role.handler';
import { ListRolesResult } from 'src/application/role/handlers/list-roles.handler';

@Controller('roles')
export class RoleController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @Post()
  @Permissions('role:create')
  @HttpCode(HttpStatus.CREATED)
  async createRole(
    @Req() request: Request,
    @Body() createRoleDto: CreateRoleRequestDto,
  ) {
    const tenantId = request.tenantId;

    const command = new CreateRoleCommand(
      createRoleDto.name,
      tenantId!,
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
    @Req() request: Request,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    const tenantId = request.tenantId;
    const pageNumber = parseInt(page || '1', 10);
    const limitNumber = parseInt(limit || '10', 10);

    const query = new ListRolesQuery(tenantId!, pageNumber, limitNumber);

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
