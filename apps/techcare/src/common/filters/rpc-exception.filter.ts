import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Response } from 'express';

interface MicroserviceError {
  message?: string | string[];
  statusCode?: number | string;
  status?: number | string;
  response?: {
    message?: string | string[];
    statusCode?: number | string;
    status?: number | string;
  };
}

@Catch()
export class RpcExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Internal server error';

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      message = exception.message;
      const res = exception.getResponse() as MicroserviceError;
      if (typeof res === 'object' && res.message) {
        message = Array.isArray(res.message) ? res.message[0] : res.message;
      }
    } else if (exception && typeof exception === 'object') {
      const errorResponse = exception as MicroserviceError;

      // Extract message
      if (
        errorResponse.response &&
        typeof errorResponse.response === 'object'
      ) {
        const inner = errorResponse.response;
        message =
          (Array.isArray(inner.message) ? inner.message[0] : inner.message) ||
          (Array.isArray(errorResponse.message)
            ? errorResponse.message[0]
            : errorResponse.message) ||
          message;
      } else {
        message =
          (Array.isArray(errorResponse.message)
            ? errorResponse.message[0]
            : errorResponse.message) || message;
      }

      // Extract status code
      const statusCode =
        errorResponse.statusCode ||
        errorResponse.status ||
        (errorResponse.response &&
          (errorResponse.response.statusCode || errorResponse.response.status));

      if (typeof statusCode === 'number') {
        status = statusCode;
      } else if (
        typeof statusCode === 'string' &&
        !isNaN(parseInt(statusCode))
      ) {
        status = parseInt(statusCode);
      }
    }

    // Final safety check to ensure status is a valid HTTP status code
    let finalStatus =
      typeof status === 'number' && Number.isInteger(status)
        ? status
        : parseInt(status as any, 10);

    if (isNaN(finalStatus) || finalStatus < 100 || finalStatus > 599) {
      finalStatus = HttpStatus.INTERNAL_SERVER_ERROR;
    }

    console.warn(
      `[RpcExceptionFilter] Catching error: ${finalStatus} - ${message}`,
      exception,
    );

    response.status(finalStatus).json({
      statusCode: finalStatus,
      timestamp: new Date().toISOString(),
      path: request.url,
      message: message,
    });
  }
}
