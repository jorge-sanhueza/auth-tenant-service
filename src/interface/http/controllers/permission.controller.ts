import { Controller, Get, Query, HttpCode, HttpStatus } from '@nestjs/common';
import { QueryBus } from '@nestjs/cqrs';
import { TenantId } from '../decorators/tenant-id.decorator';
import { Permissions } from '../decorators/permissions.decorator';
import { ListPermissionsQuery } from '../../../application/permission/queries/list-permissions.query';
import { ApiResponse } from '../dto/response/api-response.dto';
import type { ListPermissionsResult } from '../../../application/permission/handlers/list-permissions.handler';

@Controller('permissions')
export class PermissionController {
  constructor(private readonly queryBus: QueryBus) {}

  @Get()
  @Permissions('role:read')
  @HttpCode(HttpStatus.OK)
  async listPermissions(
    @TenantId() tenantId: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    const pageNumber = parseInt(page ?? '1', 10);
    const limitNumber = parseInt(limit ?? '100', 10);

    const query = new ListPermissionsQuery(tenantId, pageNumber, limitNumber);
    const result = await this.queryBus.execute<
      ListPermissionsQuery,
      ListPermissionsResult
    >(query);

    return ApiResponse.success(
      result,
      'Permissions retrieved successfully',
      HttpStatus.OK,
    );
  }
}
