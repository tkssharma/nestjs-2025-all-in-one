# Day 9.2 - NestJS Building Blocks

A comprehensive demonstration of all NestJS building blocks including Guards, Pipes, Interceptors, Filters, Middleware, and Event Emitters.

## Features

- **Guards** - Authentication & Role-based authorization
- **Pipes** - Validation & Transformation
- **Interceptors** - Logging, Transform responses, Timeout, Caching
- **Filters** - Exception handling (HTTP & All exceptions)
- **Middleware** - Request logging
- **Event Emitter** - Async event handling
- **Swagger** - API documentation
- **Mock Data** - In-memory CRUD operations (no database)

## Getting Started

```bash
# Install dependencies
pnpm install

# Run in development mode
pnpm start:dev

# Run in production mode
pnpm start:prod
```

## API Documentation

Swagger docs available at: `http://localhost:3000/api`

## Project Structure

```
src/
├── common/
│   ├── decorators/
│   │   ├── public.decorator.ts    # Skip auth for routes
│   │   ├── roles.decorator.ts     # Role-based access
│   │   └── user.decorator.ts      # Get current user
│   ├── filters/
│   │   ├── http-exception.filter.ts
│   │   └── all-exceptions.filter.ts
│   ├── guards/
│   │   ├── auth.guard.ts          # Token validation
│   │   └── roles.guard.ts         # Role checking
│   ├── interceptors/
│   │   ├── logging.interceptor.ts
│   │   ├── transform.interceptor.ts
│   │   ├── timeout.interceptor.ts
│   │   └── cache.interceptor.ts
│   ├── middleware/
│   │   ├── logger.middleware.ts
│   │   └── cors.middleware.ts
│   └── pipes/
│       ├── parse-int.pipe.ts
│       └── trim.pipe.ts
├── modules/
│   ├── users/
│   │   ├── dto/
│   │   ├── entities/
│   │   ├── users.controller.ts
│   │   ├── users.service.ts
│   │   └── users.module.ts
│   ├── products/
│   │   ├── dto/
│   │   ├── entities/
│   │   ├── products.controller.ts
│   │   ├── products.service.ts
│   │   └── products.module.ts
│   └── events/
│       ├── listeners/
│       ├── events.controller.ts
│       └── events.module.ts
├── app.module.ts
└── main.ts
```

## Building Blocks Overview

### Guards

Guards determine if a request should be handled:

```typescript
@UseGuards(AuthGuard)          // Require authentication
@UseGuards(AuthGuard, RolesGuard)  // Auth + Role check
@Roles('admin')                // Require admin role
@Public()                      // Skip auth
```

### Pipes

Pipes transform and validate input:

```typescript
@UsePipes(ValidationPipe)      // Validate DTOs
@Param('id', ParseIntPipe)     // Transform to int
```

### Interceptors

Interceptors wrap around request handling:

```typescript
@UseInterceptors(LoggingInterceptor)    // Log requests
@UseInterceptors(TransformInterceptor)  // Wrap responses
@UseInterceptors(CacheInterceptor)      // Cache responses
```

### Filters

Filters handle exceptions:

```typescript
@UseFilters(HttpExceptionFilter)        // Handle HTTP errors
@UseFilters(AllExceptionsFilter)        // Catch all errors
```

### Middleware

Middleware runs before route handlers:

```typescript
// Applied in module
consumer.apply(LoggerMiddleware).forRoutes('*');
```

### Event Emitter

Emit and listen to events:

```typescript
// Emit
this.eventEmitter.emit('product.created', payload);

// Listen
@OnEvent('product.created')
handleProductCreated(payload) { }
```

## Authentication

Use Bearer token for protected endpoints:

```bash
# Valid tokens for testing:
Authorization: Bearer valid-token    # Regular user
Authorization: Bearer admin-token    # Admin user
```

## API Endpoints

### Users
- `GET /users` - Get all users (paginated)
- `GET /users/:id` - Get user by ID
- `POST /users` - Create user
- `PUT /users/:id` - Update user (Auth required)
- `DELETE /users/:id` - Delete user (Admin only)

### Products
- `GET /products` - Get all products
- `GET /products/:id` - Get product by ID
- `POST /products` - Create product
- `PUT /products/:id` - Update product
- `DELETE /products/:id` - Delete product

### Events
- `POST /events/emit` - Emit custom event (for testing)

## Testing the Building Blocks

### Test Validation (Pipes)
```bash
curl -X POST http://localhost:3000/users \
  -H "Content-Type: application/json" \
  -d '{"name": "", "email": "invalid"}'
```

### Test Guards
```bash
# Without auth (should fail)
curl -X PUT http://localhost:3000/users/1 \
  -H "Content-Type: application/json" \
  -d '{"name": "Updated"}'

# With auth
curl -X PUT http://localhost:3000/users/1 \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer valid-token" \
  -d '{"name": "Updated"}'
```

### Test Role Guard
```bash
# Admin only endpoint
curl -X DELETE http://localhost:3000/users/1 \
  -H "Authorization: Bearer admin-token"
```

### Test Event Emitter
```bash
curl -X POST http://localhost:3000/events/emit \
  -H "Content-Type: application/json" \
  -d '{"event": "product.created", "payload": {"name": "Test"}}'
```
