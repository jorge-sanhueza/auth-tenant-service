import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpStatus,
} from '@nestjs/common';
import { Response } from 'express';
import { DomainException } from '../../../domain/exceptions/domain.exception';

const domainExceptionStatusMap: Record<string, number> = {
  UserNotFoundException: HttpStatus.NOT_FOUND,
  InvalidCredentialsException: HttpStatus.UNAUTHORIZED,
  UserDeactivatedException: HttpStatus.FORBIDDEN,
  UserAlreadyExistsException: HttpStatus.CONFLICT,
  SessionNotFoundException: HttpStatus.UNAUTHORIZED,
  SessionExpiredException: HttpStatus.UNAUTHORIZED,
  TenantMismatchException: HttpStatus.UNAUTHORIZED,
  TenantNotFoundException: HttpStatus.NOT_FOUND,
};

@Catch(DomainException)
export class DomainExceptionFilter implements ExceptionFilter<DomainException> {
  catch(exception: DomainException, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    const status =
      domainExceptionStatusMap[exception.name] ?? HttpStatus.BAD_REQUEST;

    response.status(status).json({
      statusCode: status,
      message: exception.message,
      error: exception.name,
    });
  }
}
