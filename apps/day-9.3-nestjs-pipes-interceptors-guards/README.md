# Day 9.3 - NestJS Pipes, Interceptors, Guards & More

A comprehensive deep dive into NestJS request lifecycle components with demo examples.

## Topics Covered

### 🔄 Pipes (Very Important & Generic)
- Built-in Pipes Explained
- Create Custom Pipe in NestJS
- Global Pipes vs Controller Pipes
- App-Level vs Global Pipes (main.ts)
- Pipes Execution Order Explained
- ValidationPipe Internals (Quick Demo)

### 🔁 Interceptors
- What are Interceptors in NestJS?
- Create Custom Interceptor (Demo)
- Global vs Controller Level Interceptors
- App-Level Interceptors Explained
- Interceptor Execution Flow (Before & After)
- Use Interceptors for Logging & Timing

### 🛡️ Guards & Middleware (Quick Contrast)
- Middleware vs Guards vs Interceptors
- Create Custom Guard (Demo)
- Global Guards vs Route Guards
- Auth Guard Flow Explained
- When NOT to Use Middleware

### ⚠️ Exception Handling
- Default Exception Handling in NestJS
- Create Custom Exception Filter
- Global Exception Filters Explained
- HttpException vs Custom Errors
- Error Flow Inside NestJS

### 🏥 Health Check (Terminus)
- /health endpoint
- Custom health indicators
- Liveness & Readiness probes

### 🔗 Dependency Graph
- Circular dependency example
- forwardRef fix explained

### ⚙️ NestJS Core Explained
- ModuleRef usage
- Injector internals
- Runtime flow (high-level)

## Getting Started

```bash
# Install dependencies
pnpm install

# Run in development mode
pnpm start:dev
```

## API Documentation

Swagger docs available at: `http://localhost:3000/api`

## Request Lifecycle Order

```
Request → Middleware → Guards → Interceptors(before) → Pipes → Handler → Interceptors(after) → Response
                                                                              ↓
                                                              Exception Filters (if error)
```

## API Endpoints

### Pipes Demo (`/pipes`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/pipes/parse-int/:id` | ParseIntPipe demo |
| GET | `/pipes/parse-bool?active=true` | ParseBoolPipe demo |
| GET | `/pipes/parse-uuid/:uuid` | ParseUUIDPipe demo |
| GET | `/pipes/default-value` | DefaultValuePipe demo |
| GET | `/pipes/custom-parse-int/:id` | Custom pipe with validation |
| POST | `/pipes/trim-strings` | TrimStringsPipe demo |
| POST | `/pipes/validation` | ValidationPipe demo |
| GET | `/pipes/execution-order` | Explains pipe execution order |
| GET | `/pipes/global-vs-controller` | Explains scopes |

### Interceptors Demo (`/interceptors`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/interceptors/logging` | LoggingInterceptor demo |
| GET | `/interceptors/transform` | TransformInterceptor demo |
| GET | `/interceptors/cache` | CacheInterceptor demo (30s TTL) |
| GET | `/interceptors/timeout` | TimeoutInterceptor demo |
| GET | `/interceptors/slow` | Demonstrates timeout |
| GET | `/interceptors/execution-flow` | Explains flow |
| GET | `/interceptors/global-vs-controller` | Explains scopes |

### Guards Demo (`/guards`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/guards/public` | Public route (no auth) |
| GET | `/guards/protected` | Protected route (auth required) |
| GET | `/guards/admin-only` | Admin role required |
| GET | `/guards/moderator-or-admin` | Multiple roles |
| GET | `/guards/guard-flow` | Auth flow explained |
| GET | `/guards/middleware-vs-guards` | Comparison |
| GET | `/guards/global-vs-route` | Scope comparison |

### Exception Demo (`/exceptions`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/exceptions/bad-request` | BadRequestException demo |
| GET | `/exceptions/not-found` | NotFoundException demo |
| GET | `/exceptions/forbidden` | ForbiddenException demo |
| GET | `/exceptions/internal-error` | InternalServerError demo |
| GET | `/exceptions/custom-http` | Custom HttpException |
| GET | `/exceptions/business-error` | Custom BusinessException |
| GET | `/exceptions/validation-error` | Custom ValidationException |
| GET | `/exceptions/unhandled` | Unhandled error demo |
| GET | `/exceptions/error-flow` | Error flow explained |
| GET | `/exceptions/http-vs-custom` | Exception comparison |
| GET | `/exceptions/global-filters` | Global filters explained |

### Health Check (`/health`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/health` | Full health check |
| GET | `/health/liveness` | Kubernetes liveness probe |
| GET | `/health/readiness` | Kubernetes readiness probe |

### Dependency Graph (`/dependency`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/dependency/service-a` | Data from ServiceA |
| GET | `/dependency/service-b` | Data from ServiceB |
| GET | `/dependency/cross-call` | Cross-service calls |
| GET | `/dependency/graph-info` | Circular dep explanation |

### NestJS Core (`/core`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/core/module-ref` | ModuleRef demo |
| GET | `/core/provider-info` | Provider info via ModuleRef |
| GET | `/core/internals` | Core internals explained |
| GET | `/core/runtime-flow` | Bootstrap flow diagram |

## Authentication

Use Bearer token for protected endpoints:

```bash
# Valid tokens for testing:
Authorization: Bearer valid-token      # Regular user
Authorization: Bearer admin-token      # Admin user  
Authorization: Bearer moderator-token  # Moderator user
```

## Project Structure

```
src/
├── main.ts                           # App bootstrap with global config
├── app.module.ts                     # Root module
│
├── pipes/                            # Custom pipes
│   ├── built-in-pipes.info.ts        # Documentation
│   ├── custom-parse-int.pipe.ts      # Custom ParseIntPipe
│   ├── trim-strings.pipe.ts          # TrimStringsPipe
│   └── validation-demo.pipe.ts       # ValidationPipe internals
│
├── interceptors/                     # Custom interceptors
│   ├── logging.interceptor.ts        # Request/response logging
│   ├── timing.interceptor.ts         # Execution timing
│   ├── transform.interceptor.ts      # Response transformation
│   ├── cache.interceptor.ts          # Simple caching
│   └── timeout.interceptor.ts        # Request timeout
│
├── guards/                           # Custom guards
│   ├── auth.guard.ts                 # Authentication
│   └── roles.guard.ts                # Role-based access
│
├── decorators/                       # Custom decorators
│   ├── public.decorator.ts           # @Public()
│   ├── roles.decorator.ts            # @Roles()
│   └── user.decorator.ts             # @CurrentUser()
│
├── exception-filters/                # Exception filters
│   ├── http-exception.filter.ts      # HttpException handler
│   ├── all-exceptions.filter.ts      # Catch-all handler
│   └── custom-exceptions.ts          # Custom exception types
│
├── middleware/                       # Middleware
│   └── logger.middleware.ts          # Request logging
│
├── pipes-demo/                       # Pipes demo module
├── interceptors-demo/                # Interceptors demo module
├── guards-demo/                      # Guards demo module
├── exception-demo/                   # Exception demo module
├── health/                           # Health check module
├── dependency-graph/                 # Circular dependency demo
└── core-demo/                        # NestJS core concepts demo
```

## Key Concepts

### App-Level vs Global-Level Registration

```typescript
// APP-LEVEL (main.ts) - Cannot inject dependencies
app.useGlobalPipes(new ValidationPipe());
app.useGlobalFilters(new AllExceptionsFilter());
app.useGlobalInterceptors(new LoggingInterceptor());

// GLOBAL-LEVEL (module) - CAN inject dependencies
@Module({
  providers: [
    { provide: APP_PIPE, useClass: ValidationPipe },
    { provide: APP_FILTER, useClass: AllExceptionsFilter },
    { provide: APP_INTERCEPTOR, useClass: LoggingInterceptor },
    { provide: APP_GUARD, useClass: AuthGuard },
  ],
})
```

### Circular Dependency Solution

```typescript
// Use forwardRef() to break circular dependencies
@Injectable()
export class ServiceA {
  constructor(
    @Inject(forwardRef(() => ServiceB))
    private serviceB: ServiceB,
  ) {}
}
```

### ModuleRef Usage

```typescript
@Injectable()
export class MyService {
  constructor(private moduleRef: ModuleRef) {}

  doSomething() {
    // Get provider dynamically at runtime
    const service = this.moduleRef.get(SomeService);
  }
}
```

## Testing Examples

### Test Pipes
```bash
# ParseIntPipe
curl http://localhost:3000/pipes/parse-int/123

# Invalid integer (will fail)
curl http://localhost:3000/pipes/parse-int/abc

# ValidationPipe
curl -X POST http://localhost:3000/pipes/validation \
  -H "Content-Type: application/json" \
  -d '{"name": "John", "email": "john@example.com"}'
```

### Test Guards
```bash
# Public route
curl http://localhost:3000/guards/public

# Protected route (no token - will fail)
curl http://localhost:3000/guards/protected

# Protected route (with token)
curl http://localhost:3000/guards/protected \
  -H "Authorization: Bearer valid-token"

# Admin route
curl http://localhost:3000/guards/admin-only \
  -H "Authorization: Bearer admin-token"
```

### Test Health Check
```bash
curl http://localhost:3000/health
curl http://localhost:3000/health/liveness
curl http://localhost:3000/health/readiness
```
