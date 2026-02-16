import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  Logger,
} from "@nestjs/common";
import { Request, Response } from "express";

/**
 * ============================================================
 * HTTP EXCEPTION FILTER
 * ============================================================
 *
 * Exception filters handle errors thrown during request processing.
 *
 * Request → ... → Handler throws error → [EXCEPTION FILTER] → Response
 *
 * This filter catches all HttpException types:
 * - BadRequestException (400)
 * - UnauthorizedException (401)
 * - ForbiddenException (403)
 * - NotFoundException (404)
 * - ConflictException (409)
 * - InternalServerErrorException (500)
 * - etc.
 *
 * ============================================================
 * ERROR FLOW IN NESTJS
 * ============================================================
 *
 *    Handler throws exception
 *           ↓
 *    [Exception Filters catch it]
 *           ↓
 *    [Most specific filter runs first]
 *    (Method → Controller → Global)
 *           ↓
 *    [Filter formats error response]
 *           ↓
 *    Response sent to client
 *
 * ============================================================
 */

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger("HttpExceptionFilter");

  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const status = exception.getStatus();
    const exceptionResponse = exception.getResponse();

    // Extract error details
    const errorMessage =
      typeof exceptionResponse === "string"
        ? exceptionResponse
        : (exceptionResponse as any).message || exception.message;

    const errorDetails =
      typeof exceptionResponse === "object"
        ? (exceptionResponse as any).errors || null
        : null;

    // Log the error
    this.logger.error(
      `[FILTER] ${request.method} ${request.url} - ${status} - ${
        typeof errorMessage === "string"
          ? errorMessage
          : JSON.stringify(errorMessage)
      }`
    );

    // Build response
    const errorResponse = {
      success: false,
      statusCode: status,
      message: errorMessage,
      errors: errorDetails,
      timestamp: new Date().toISOString(),
      path: request.url,
      method: request.method,
    };

    response.status(status).json(errorResponse);
  }
}
