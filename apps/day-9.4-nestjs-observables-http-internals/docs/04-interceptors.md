# Interceptors - Real Use Cases

## Response Transformation

Wrap all responses in consistent format:

```typescript
@Injectable()
export class TransformInterceptor<T> implements NestInterceptor<T, Response<T>> {
  intercept(context: ExecutionContext, next: CallHandler): Observable<Response<T>> {
    return next.handle().pipe(
      map(data => ({
        success: true,
        data,
        timestamp: new Date().toISOString(),
      })),
    );
  }
}
```

**Output:** `{ success: true, data: {...}, timestamp: "..." }`

---

## Request/Response Logging

```typescript
@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger('HTTP');

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const { method, url, body } = request;
    const now = Date.now();

    this.logger.log(`→ ${method} ${url} ${JSON.stringify(body)}`);

    return next.handle().pipe(
      tap(response => {
        this.logger.log(`← ${method} ${url} ${Date.now() - now}ms`);
      }),
    );
  }
}
```

---

## Response Caching

```typescript
@Injectable()
export class CacheInterceptor implements NestInterceptor {
  constructor(private cacheManager: Cache) {}

  async intercept(context: ExecutionContext, next: CallHandler): Promise<Observable<any>> {
    const request = context.switchToHttp().getRequest();
    const cacheKey = `${request.method}:${request.url}`;

    const cached = await this.cacheManager.get(cacheKey);
    if (cached) {
      return of(cached);
    }

    return next.handle().pipe(
      tap(response => {
        this.cacheManager.set(cacheKey, response, { ttl: 60 });
      }),
    );
  }
}
```

---

## Request Timeout

```typescript
@Injectable()
export class TimeoutInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      timeout(5000),
      catchError(err => {
        if (err instanceof TimeoutError) {
          throw new RequestTimeoutException();
        }
        throw err;
      }),
    );
  }
}
```

---

## Error Mapping

```typescript
@Injectable()
export class ErrorMappingInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      catchError(err => {
        if (err instanceof TypeORMError) {
          throw new InternalServerErrorException('Database error');
        }
        if (err instanceof AxiosError) {
          throw new BadGatewayException('External service error');
        }
        throw err;
      }),
    );
  }
}
```

---

## Exclude Null Values

```typescript
@Injectable()
export class ExcludeNullInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      map(data => this.removeNulls(data)),
    );
  }

  private removeNulls(obj: any): any {
    return JSON.parse(JSON.stringify(obj, (_, value) =>
      value === null ? undefined : value
    ));
  }
}
```

---

## Conditionally Skip Interceptor

```typescript
// Decorator to mark routes
export const SkipLogging = () => SetMetadata('skipLogging', true);

// Check in interceptor
@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  constructor(private reflector: Reflector) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const skipLogging = this.reflector.getAllAndOverride<boolean>('skipLogging', [
      context.getHandler(),
      context.getClass(),
    ]);

    if (skipLogging) {
      return next.handle(); // Skip logging
    }

    // Normal logging logic...
    return next.handle().pipe(tap(...));
  }
}

// Usage
@SkipLogging()
@Get('health')
healthCheck() { return 'ok'; }
```

---

## File Upload Validation

```typescript
@Injectable()
export class FileValidationInterceptor implements NestInterceptor {
  constructor(
    private readonly maxSize: number,
    private readonly allowedTypes: string[],
  ) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const file = request.file;

    if (!file) {
      throw new BadRequestException('File is required');
    }

    if (file.size > this.maxSize) {
      throw new PayloadTooLargeException(`File too large. Max: ${this.maxSize}`);
    }

    if (!this.allowedTypes.includes(file.mimetype)) {
      throw new UnsupportedMediaTypeException('Invalid file type');
    }

    return next.handle();
  }
}

// Usage
@Post('upload')
@UseInterceptors(
  FileInterceptor('file'),
  new FileValidationInterceptor(5 * 1024 * 1024, ['image/jpeg', 'image/png']),
)
upload(@UploadedFile() file: Express.Multer.File) {}
```

---

## ExecutionContext Methods

```typescript
const ctx = context.switchToHttp();
const request = ctx.getRequest<Request>();
const response = ctx.getResponse<Response>();

// Get handler/class
const handler = context.getHandler();
const controller = context.getClass();

// Read metadata
const roles = this.reflector.get<string[]>('roles', context.getHandler());
```

---

## Interceptor Execution Order

```
Global Interceptors (before) → Controller Interceptors (before) → Route Interceptors (before)
                              ↓
                         HANDLER
                              ↓
Route Interceptors (after) → Controller Interceptors (after) → Global Interceptors (after)
```

⚠️ **Note:** POST-processing is in REVERSE order!
