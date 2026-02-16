# Exception Filters & Error Design

## Built-in Exceptions

```typescript
throw new BadRequestException('Invalid input');
throw new UnauthorizedException('Please login');
throw new ForbiddenException('Access denied');
throw new NotFoundException('User not found');
throw new ConflictException('Email already exists');
throw new InternalServerErrorException('Something went wrong');
throw new ServiceUnavailableException('Service temporarily unavailable');
```

---

## Custom Exception

```typescript
export class BusinessException extends HttpException {
  constructor(
    public readonly code: string,
    message: string,
    status: HttpStatus = HttpStatus.BAD_REQUEST,
  ) {
    super({ code, message }, status);
  }
}

// Usage
throw new BusinessException('USER_001', 'User already exists');
```

---

## Basic Exception Filter

```typescript
@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const status = exception.getStatus();

    response.status(status).json({
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      message: exception.message,
    });
  }
}
```

---

## All Exceptions Filter

```typescript
@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger('ExceptionFilter');

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Internal server error';
    let code = 'INTERNAL_ERROR';

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const exceptionResponse = exception.getResponse();
      message = typeof exceptionResponse === 'string'
        ? exceptionResponse
        : (exceptionResponse as any).message;
      code = (exceptionResponse as any).code || 'HTTP_ERROR';
    } else if (exception instanceof Error) {
      message = exception.message;
      this.logger.error(exception.message, exception.stack);
    }

    response.status(status).json({
      success: false,
      statusCode: status,
      code,
      message,
      timestamp: new Date().toISOString(),
      path: request.url,
    });
  }
}
```

---

## Database Exception Filter

```typescript
@Catch(QueryFailedError)
export class DatabaseExceptionFilter implements ExceptionFilter {
  catch(exception: QueryFailedError, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Database error';
    let code = 'DB_ERROR';

    // PostgreSQL unique violation
    if ((exception as any).code === '23505') {
      status = HttpStatus.CONFLICT;
      message = 'Duplicate entry';
      code = 'DUPLICATE_ENTRY';
    }

    // Foreign key violation
    if ((exception as any).code === '23503') {
      status = HttpStatus.BAD_REQUEST;
      message = 'Referenced record not found';
      code = 'FK_VIOLATION';
    }

    response.status(status).json({
      success: false,
      statusCode: status,
      code,
      message,
    });
  }
}
```

---

## Validation Exception Filter

```typescript
@Catch(BadRequestException)
export class ValidationExceptionFilter implements ExceptionFilter {
  catch(exception: BadRequestException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const exceptionResponse = exception.getResponse() as any;

    response.status(HttpStatus.BAD_REQUEST).json({
      success: false,
      statusCode: 400,
      code: 'VALIDATION_ERROR',
      message: 'Validation failed',
      errors: this.formatErrors(exceptionResponse.message),
    });
  }

  private formatErrors(messages: string | string[]) {
    if (typeof messages === 'string') {
      return [{ field: 'unknown', message: messages }];
    }
    return messages.map(msg => {
      // Parse "field should not be empty" format
      const [field, ...rest] = msg.split(' ');
      return { field, message: rest.join(' ') };
    });
  }
}
```

---

## Error Response Design

### Consistent Error Format

```typescript
interface ErrorResponse {
  success: false;
  statusCode: number;
  code: string;           // Machine-readable code
  message: string;        // Human-readable message
  details?: any;          // Additional context
  timestamp: string;
  path: string;
  requestId?: string;     // For tracing
}
```

### Error Code System

```typescript
// errors/error-codes.ts
export const ErrorCodes = {
  // Authentication
  AUTH_001: 'Invalid credentials',
  AUTH_002: 'Token expired',
  AUTH_003: 'Token invalid',

  // User
  USER_001: 'User not found',
  USER_002: 'Email already exists',
  USER_003: 'Invalid password format',

  // Order
  ORDER_001: 'Order not found',
  ORDER_002: 'Insufficient stock',
  ORDER_003: 'Payment failed',
} as const;

// Usage
throw new BusinessException('USER_002', ErrorCodes.USER_002, HttpStatus.CONFLICT);
```

---

## Error Logging Strategy

```typescript
@Catch()
export class LoggingExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger('Exception');

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const request = ctx.getRequest<Request>();

    const errorContext = {
      path: request.url,
      method: request.method,
      userId: request.user?.id,
      body: this.sanitize(request.body),
      ip: request.ip,
      userAgent: request.get('user-agent'),
    };

    if (exception instanceof HttpException) {
      const status = exception.getStatus();
      if (status >= 500) {
        this.logger.error('Server error', exception.stack, errorContext);
      } else {
        this.logger.warn('Client error', { ...errorContext, status });
      }
    } else {
      this.logger.error('Unhandled error', (exception as Error).stack, errorContext);
    }

    // Continue with normal error handling...
  }

  private sanitize(body: any): any {
    const sensitive = ['password', 'token', 'secret', 'creditCard'];
    return JSON.parse(JSON.stringify(body, (key, value) =>
      sensitive.includes(key) ? '[REDACTED]' : value
    ));
  }
}
```

---

## Best Practices

1. **Never expose stack traces in production**
2. **Use consistent error format across all APIs**
3. **Include request ID for tracing**
4. **Log errors with context**
5. **Sanitize sensitive data in logs**
6. **Use error codes for client handling**
7. **Provide helpful error messages**

---

## Filter Execution Order

```
Route Filter → Controller Filter → Global Filter
```

First matching filter handles the exception.
