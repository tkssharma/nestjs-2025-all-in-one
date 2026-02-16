import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from "@nestjs/common";
import { Request, Response } from "express";

/**
 * ============================================================
 * ALL EXCEPTIONS FILTER
 * ============================================================
 *
 * Catches ALL exceptions, not just HttpException.
 * This is the "catch-all" safety net.
 *
 * ============================================================
 * HttpException vs Custom Errors
 * ============================================================
 *
 * HttpException:
 * - Built-in NestJS exceptions (BadRequestException, etc.)
 * - Have a status code and message
 * - Automatically handled by NestJS
 *
 * Custom/Unknown Errors:
 * - Regular JavaScript errors (TypeError, ReferenceError, etc.)
 * - Database errors
 * - Third-party library errors
 * - Need a catch-all filter like this one
 *
 * ============================================================
 * DEFAULT EXCEPTION HANDLING
 * ============================================================
 *
 * Without any exception filters, NestJS:
 * 1. Catches HttpException and returns its message/status
 * 2. Catches unknown errors and returns 500 Internal Server Error
 *
 * With this filter:
 * 1. We get full control over error response format
 * 2. We can log errors properly
 * 3. We can include stack traces in development
 *
 * ============================================================
 */

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger("AllExceptionsFilter");

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    // Determine status code
    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    // Determine error message
    let message: string | object = "Internal server error";
    let stack: string | undefined;

    if (exception instanceof HttpException) {
      const exceptionResponse = exception.getResponse();
      message =
        typeof exceptionResponse === "string"
          ? exceptionResponse
          : (exceptionResponse as any).message || exception.message;
    } else if (exception instanceof Error) {
      message = exception.message;
      stack = exception.stack;
    }

    // Log the error
    this.logger.error(
      `[FILTER - CATCH ALL] ${request.method} ${request.url} - ${status}`
    );
    this.logger.error(
      `Message: ${
        typeof message === "string" ? message : JSON.stringify(message)
      }`
    );

    if (stack) {
      this.logger.debug(`Stack: ${stack}`);
    }

    // Build response
    const errorResponse: Record<string, any> = {
      success: false,
      statusCode: status,
      message,
      timestamp: new Date().toISOString(),
      path: request.url,
      method: request.method,
    };

    // Include stack trace in development
    if (process.env.NODE_ENV !== "production" && stack) {
      errorResponse.stack = stack.split("\n").slice(0, 5);
    }

    response.status(status).json(errorResponse);
  }
}
