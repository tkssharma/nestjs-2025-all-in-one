# Day 9.5 - NestJS Blog API

A comprehensive Blog API demonstrating all NestJS fundamentals.

## Features Covered

- **CRUD Operations** - Authors, Blogs, Comments
- **Authentication** - JWT token-based auth
- **Authorization** - RBAC (Role-Based Access Control)
- **Validation** - DTOs with class-validator
- **Guards** - JwtAuthGuard, RolesGuard
- **Middleware** - Logger, RequestId
- **Interceptors** - Transform, Logging
- **Exception Filters** - HTTP & Global
- **Events** - NestJS EventEmitter
- **Cyclic Dependencies** - forwardRef() solutions

## Project Structure

```
src/
├── auth/                    # Authentication module
│   ├── dto/                 # Login, Register DTOs
│   ├── guards/              # JwtAuthGuard
│   └── strategies/          # JWT Strategy
├── authors/                 # Authors CRUD
│   ├── dto/                 # Create/Update DTOs
│   ├── entities/            # Author entity
│   └── *.repository.ts      # Mock repository
├── blogs/                   # Blogs CRUD
│   ├── dto/
│   ├── entities/
│   └── *.repository.ts
├── comments/                # Comments CRUD
│   ├── dto/
│   ├── entities/
│   └── *.repository.ts
├── events/                  # Event listeners
│   └── listeners/
├── common/
│   ├── decorators/          # @Roles, @Public, @CurrentUser
│   ├── filters/             # Exception filters
│   ├── guards/              # RolesGuard
│   ├── interceptors/        # Transform, Logging
│   └── middleware/          # Logger, RequestId
└── app.module.ts
```

## Getting Started

```bash
# Install dependencies
npm install

# Run development server
npm run start:dev

# Access Swagger docs
open http://localhost:3000/api
```

## API Endpoints

### Auth
- `POST /auth/login` - Login (public)
- `POST /auth/register` - Register (public)
- `GET /auth/me` - Current user profile

### Authors
- `GET /authors` - List all (public)
- `GET /authors/:id` - Get by ID (public)
- `POST /authors` - Create (admin only)
- `PUT /authors/:id` - Update (admin only)
- `DELETE /authors/:id` - Delete (admin only)

### Blogs
- `GET /blogs` - Published blogs (public)
- `GET /blogs/all` - All blogs (auth required)
- `GET /blogs/my` - My blogs (auth required)
- `GET /blogs/:id` - Get by ID (public)
- `POST /blogs` - Create (auth required)
- `PUT /blogs/:id` - Update (owner/admin)
- `PATCH /blogs/:id/publish` - Publish (owner/admin)
- `DELETE /blogs/:id` - Delete (owner/admin)

### Comments
- `GET /comments?blogId=` - By blog ID (public)
- `GET /comments/:id` - Get by ID (public)
- `POST /comments` - Create (auth required)
- `PUT /comments/:id` - Update (owner/admin)
- `PATCH /comments/:id/approve` - Approve (admin/mod)
- `DELETE /comments/:id` - Delete (owner/admin)

## Demo Credentials

```
Admin:
- email: admin@blog.com
- password: admin123

User:
- email: user@blog.com
- password: user123
```

## Key Concepts Demonstrated

### 1. Cyclic Dependencies
```typescript
// AuthModule <-> AuthorsModule circular dependency
// Solution: forwardRef()
@Module({
  imports: [forwardRef(() => AuthModule)],
})
export class AuthorsModule {}
```

### 2. RBAC with Custom Decorators
```typescript
// Define roles
@Roles(Role.ADMIN, Role.MODERATOR)
@UseGuards(JwtAuthGuard, RolesGuard)
@Patch(':id/approve')
approve() {}
```

### 3. Events
```typescript
// Emit
this.eventEmitter.emit('blog.created', { blog, author });

// Listen
@OnEvent('blog.created')
handleBlogCreated(payload) {}
```

### 4. Global Middleware
```typescript
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(RequestIdMiddleware, LoggerMiddleware)
      .forRoutes('*');
  }
}
```

### 5. Global Interceptors & Filters
```typescript
providers: [
  { provide: APP_INTERCEPTOR, useClass: TransformInterceptor },
  { provide: APP_FILTER, useClass: HttpExceptionFilter },
]
```

## Response Format

All responses are wrapped by TransformInterceptor:

```json
{
  "success": true,
  "data": { ... },
  "timestamp": "2024-01-01T00:00:00.000Z",
  "requestId": "uuid"
}
```

## Error Format

```json
{
  "success": false,
  "statusCode": 400,
  "message": "Validation failed",
  "path": "/blogs",
  "method": "POST",
  "requestId": "uuid",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```
