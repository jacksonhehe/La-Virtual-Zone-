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
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Error interno del servidor';

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const exceptionResponse = exception.getResponse();
      
      if (typeof exceptionResponse === 'string') {
        message = exceptionResponse;
      } else if (typeof exceptionResponse === 'object' && 'message' in exceptionResponse) {
        message = Array.isArray(exceptionResponse.message) 
          ? exceptionResponse.message[0] 
          : exceptionResponse.message;
      }
    } else if (exception instanceof Error) {
      message = exception.message;
    }

    // Log del error (sin información sensible en producción)
    const isProduction = process.env.NODE_ENV === 'production';
    
    if (isProduction) {
      this.logger.error(
        `${request.method} ${request.url} - ${status} - ${message}`,
        exception instanceof Error ? exception.stack : undefined,
      );
    } else {
      this.logger.error(
        `${request.method} ${request.url} - ${status} - ${message}`,
        exception instanceof Error ? exception.stack : undefined,
      );
    }

    // En producción, no revelar detalles del error
    const errorResponse = {
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      message: isProduction && status >= 500 
        ? 'Error interno del servidor' 
        : message,
    };

    response.status(status).json(errorResponse);
  }
} 