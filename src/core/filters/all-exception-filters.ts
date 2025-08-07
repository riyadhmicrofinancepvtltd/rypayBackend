import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    const message =
      exception instanceof HttpException
        ? exception.getResponse()
        : (exception as any)?.message || 'Internal server error';

    this.logger.error(
      `Error on ${request.method} ${request.url}: ${JSON.stringify(message)}`,
      (exception as any)?.stack,
    );
    const openUrls = [
      "/user/set-app-lock-pin",
      "/user/new-signup",
      "/user/verify-aadhaar-otp",
      "/user",
      "/auth/validate-otp-new",
      "/user/verify-app-lock-pin",
      "/user/change-app-lock-pin",
      "/user/verify-app-lock-pin-otp",
      "/user/change-transaction-pin",
      "verify-transaction-pin-otp",
    ];

    if (openUrls.includes(request.url)) {
      response.status(status).json({
        statusCode: status,
        success: false,
        message: message.message[0],
      });
    }
    response.status(status).json({
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      message,
    });

  }
}
