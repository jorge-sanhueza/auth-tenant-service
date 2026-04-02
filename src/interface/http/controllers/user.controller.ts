import { Controller, Get, HttpCode, HttpStatus } from '@nestjs/common';
import { QueryBus } from '@nestjs/cqrs';
import {
  CurrentUser,
  type CurrentUserType,
} from '../decorators/current-user.decorator';
import { GetCurrentUserQuery } from '../../../application/user/queries/get-current-user.query';
import { ApiResponse } from '../dto/response/api-response.dto';
import type { UserProfileDto } from '../dto/response/user-profile.dto.ts';

@Controller('users')
export class UserController {
  constructor(private readonly queryBus: QueryBus) {}

  @Get('me')
  @HttpCode(HttpStatus.OK)
  async getCurrentUser(@CurrentUser() currentUser: CurrentUserType) {
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
}
