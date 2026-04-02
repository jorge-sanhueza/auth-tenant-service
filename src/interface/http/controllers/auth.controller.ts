import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  Req,
  BadRequestException,
} from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { RegisterCommand } from '../../../application/auth/commands/register.command';
import { RegisterRequestDto } from '../dto/request/register.request.dto';
import {
  RegisterResponseDto,
  RegisterResponseData,
  LoginResponseDto,
} from '../dto/response/auth.response.dto';
import { ApiResponse } from '../dto/response/api-response.dto';
import { LoginRequestDto } from '../dto/request/login.request.dto';
import { LoginCommand } from 'src/application/auth/commands/login.command';
import { LoginResult } from 'src/application/auth/types/login-result.type';
import { Public } from '../decorators/public.decorator';
import type { Request } from 'express';

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
}
