import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  Req,
  BadRequestException,
  Patch,
} from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { RegisterCommand } from '../../../application/auth/commands/register.command';
import { RegisterRequestDto } from '../dto/request/register.request.dto';
import {
  RegisterResponseDto,
  RegisterResponseData,
  LoginResponseDto,
  RefreshTokenResponseDto,
  RefreshTokenResponseData,
} from '../dto/response/auth.response.dto';
import { ApiResponse } from '../dto/response/api-response.dto';
import { LoginRequestDto } from '../dto/request/login.request.dto';
import { LoginCommand } from 'src/application/auth/commands/login.command';
import { LoginResult } from 'src/application/auth/types/login-result.type';
import { Public } from '../decorators/public.decorator';
import type { Request } from 'express';
import { RefreshTokenRequestDto } from '../dto/request/refresh-token.request.dto';
import { RefreshTokenCommand } from 'src/application/auth/commands/refresh-token.command';
import { LogoutRequestDto } from '../dto/request/logout.request.dto';
import { LogoutCommand } from 'src/application/auth/commands/logout.command';
import { LogoutResult } from 'src/application/auth/handlers/logout.handler';
import {
  CurrentUser,
  type CurrentUserType,
} from '../decorators/current-user.decorator';
import { LogoutAllCommand } from 'src/application/auth/commands/logout-all.command';
import { ChangePasswordRequestDto } from '../dto/request/change-password.request.dto';
import { ChangePasswordCommand } from 'src/application/auth/commands/change-password.command';
import { ChangePasswordResult } from 'src/application/auth/types/change-password-result.type';

@Controller('auth')
export class AuthController {
  constructor(private readonly commandBus: CommandBus) {}

  @Public()
  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  async register(
    @Req() request: Request,
    @Body() registerDto: RegisterRequestDto,
  ): Promise<RegisterResponseDto> {
    const tenantId = request.tenantId;

    if (!tenantId) {
      throw new BadRequestException(
        'Tenant ID is required in x-tenant-id header',
      );
    }

    const command = new RegisterCommand(
      registerDto.email,
      registerDto.password,
      tenantId,
      registerDto.firstName,
      registerDto.lastName,
    );

    const result = await this.commandBus.execute<
      RegisterCommand,
      RegisterResponseData
    >(command);

    return ApiResponse.success(
      result,
      'User registered successfully',
      HttpStatus.CREATED,
    );
  }

  @Public()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(
    @Req() request: Request,
    @Body() loginDto: LoginRequestDto,
  ): Promise<LoginResponseDto> {
    const tenantId = request.tenantId;

    if (!tenantId) {
      throw new BadRequestException(
        'Tenant ID is required in x-tenant-id header',
      );
    }

    const command = new LoginCommand(
      loginDto.email,
      loginDto.password,
      tenantId,
    );

    const result = await this.commandBus.execute<LoginCommand, LoginResult>(
      command,
    );

    return ApiResponse.success(result, 'Login successful', HttpStatus.OK);
  }

  @Public()
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  async refresh(
    @Req() request: Request,
    @Body() refreshDto: RefreshTokenRequestDto,
  ): Promise<RefreshTokenResponseDto> {
    const tenantId = request.tenantId;

    if (!tenantId) {
      throw new BadRequestException(
        'Tenant ID is required in x-tenant-id header',
      );
    }

    const command = new RefreshTokenCommand(refreshDto.refreshToken, tenantId);

    const result = await this.commandBus.execute<
      RefreshTokenCommand,
      RefreshTokenResponseData
    >(command);

    return ApiResponse.success(
      result,
      'Token refreshed successfully',
      HttpStatus.OK,
    );
  }

  @Public() // Logout is public because client might have invalid token
  @Post('logout')
  @HttpCode(HttpStatus.OK)
  async logout(
    @Req() request: Request,
    @Body() logoutDto: LogoutRequestDto,
  ): Promise<ApiResponse<{ success: boolean; message: string }>> {
    const tenantId = request.tenantId;

    if (!tenantId) {
      throw new BadRequestException(
        'Tenant ID is required in x-tenant-id header',
      );
    }

    const command = new LogoutCommand(logoutDto.refreshToken, tenantId);

    const result = await this.commandBus.execute<LogoutCommand, LogoutResult>(
      command,
    );

    return ApiResponse.success(result, result.message, HttpStatus.OK);
  }

  // Protected endpoint - requires authentication
  @Post('logout-all')
  @HttpCode(HttpStatus.OK)
  async logoutAll(
    @CurrentUser() currentUser: CurrentUserType,
  ): Promise<ApiResponse<{ success: boolean; message: string }>> {
    const command = new LogoutAllCommand(
      currentUser.userId,
      currentUser.tenantId,
    );

    const result = await this.commandBus.execute<
      LogoutAllCommand,
      LogoutResult
    >(command);

    return ApiResponse.success(result, result.message, HttpStatus.OK);
  }

  @Patch('change-password')
  @HttpCode(HttpStatus.OK)
  async changePassword(
    @CurrentUser() currentUser: CurrentUserType,
    @Body() changePasswordDto: ChangePasswordRequestDto,
  ): Promise<ApiResponse<{ success: boolean; message: string }>> {
    const command = new ChangePasswordCommand(
      currentUser.userId,
      currentUser.tenantId,
      changePasswordDto.oldPassword,
      changePasswordDto.newPassword,
    );

    const result = await this.commandBus.execute<
      ChangePasswordCommand,
      ChangePasswordResult
    >(command);

    return ApiResponse.success(result, result.message, HttpStatus.OK);
  }
}
