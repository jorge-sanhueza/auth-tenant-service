import { Controller, Get, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiResponse } from '../dto/response/api-response.dto';

@Controller()
export class AppController {
  @Get()
  @HttpCode(HttpStatus.OK)
  getRoot() {
    return ApiResponse.success(
      {
        name: 'Auth Tenant Service',
        version: '1.0.0',
        endpoints: {
          health: '/api/health',
          auth: {
            register: '/api/auth/register',
            login: '/api/auth/login',
          },
        },
      },
      'Welcome to Auth Tenant Service API',
    );
  }

  @Get('api')
  @HttpCode(HttpStatus.OK)
  getApiInfo() {
    return ApiResponse.success(
      {
        message: 'Auth Tenant Service API',
        documentation: '/api/docs', // For Swagger
      },
      'API endpoints available under /api/*',
    );
  }
}
