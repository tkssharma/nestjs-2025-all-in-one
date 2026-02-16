import { HttpException, HttpStatus } from "@nestjs/common";

/**
 * ============================================================
 * CUSTOM EXCEPTIONS
 * ============================================================
 *
 * You can create custom exceptions by extending HttpException.
 * This allows for domain-specific error types.
 *
 * ============================================================
 */

export class BusinessException extends HttpException {
  constructor(message: string, errorCode: string) {
    super(
      {
        statusCode: HttpStatus.BAD_REQUEST,
        message,
        errorCode,
        type: "BusinessException",
      },
      HttpStatus.BAD_REQUEST
    );
  }
}

export class ResourceNotFoundException extends HttpException {
  constructor(resource: string, id: string | number) {
    super(
      {
        statusCode: HttpStatus.NOT_FOUND,
        message: `${resource} with ID ${id} not found`,
        resource,
        resourceId: id,
        type: "ResourceNotFoundException",
      },
      HttpStatus.NOT_FOUND
    );
  }
}

export class ValidationException extends HttpException {
  constructor(errors: Record<string, string[]>) {
    super(
      {
        statusCode: HttpStatus.UNPROCESSABLE_ENTITY,
        message: "Validation failed",
        errors,
        type: "ValidationException",
      },
      HttpStatus.UNPROCESSABLE_ENTITY
    );
  }
}

export class RateLimitException extends HttpException {
  constructor(retryAfter: number) {
    super(
      {
        statusCode: HttpStatus.TOO_MANY_REQUESTS,
        message: "Rate limit exceeded",
        retryAfter,
        type: "RateLimitException",
      },
      HttpStatus.TOO_MANY_REQUESTS
    );
  }
}
