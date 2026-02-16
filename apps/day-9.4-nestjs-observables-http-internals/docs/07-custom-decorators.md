# Metadata & Custom Decorators

## How Decorators Work

Decorators attach metadata to classes/methods/parameters using `Reflect.defineMetadata()`:

```typescript
// What @Controller('users') does internally:
function Controller(path: string) {
  return (target: Function) => {
    Reflect.defineMetadata('path', path, target);
  };
}

// NestJS reads it later:
const path = Reflect.getMetadata('path', UsersController);
```

---

## SetMetadata Decorator

```typescript
import { SetMetadata } from '@nestjs/common';

export const ROLES_KEY = 'roles';
export const Roles = (...roles: string[]) => SetMetadata(ROLES_KEY, roles);

// Usage
@Roles('admin', 'moderator')
@Get()
findAll() {}

// Read in guard/interceptor
const roles = this.reflector.get<string[]>(ROLES_KEY, context.getHandler());
```

---

## Custom Parameter Decorator

### Basic Example

```typescript
import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const User = createParamDecorator(
  (data: string, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const user = request.user;
    return data ? user?.[data] : user;
  },
);

// Usage
@Get('profile')
getProfile(@User() user: UserEntity) {
  return user;
}

@Get('email')
getEmail(@User('email') email: string) {
  return { email };
}
```

### With Validation

```typescript
export const User = createParamDecorator(
  (data: string, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const user = request.user;

    if (!user) {
      throw new UnauthorizedException('User not authenticated');
    }

    return data ? user?.[data] : user;
  },
);
```

---

## Composed Decorators

Combine multiple decorators into one:

```typescript
import { applyDecorators, UseGuards, SetMetadata } from '@nestjs/common';
import { ApiBearerAuth, ApiUnauthorizedResponse } from '@nestjs/swagger';

export function Auth(...roles: string[]) {
  return applyDecorators(
    SetMetadata('roles', roles),
    UseGuards(AuthGuard('jwt'), RolesGuard),
    ApiBearerAuth(),
    ApiUnauthorizedResponse({ description: 'Unauthorized' }),
  );
}

// Usage - much cleaner!
@Auth('admin')
@Get('admin')
adminRoute() {}
```

---

## Public Route Decorator

```typescript
import { SetMetadata } from '@nestjs/common';

export const IS_PUBLIC_KEY = 'isPublic';
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);

// In AuthGuard
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(private reflector: Reflector) {
    super();
  }

  canActivate(context: ExecutionContext) {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true;
    }

    return super.canActivate(context);
  }
}

// Usage
@Public()
@Get('health')
health() { return 'ok'; }
```

---

## Request ID Decorator

```typescript
export const RequestId = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    return request.headers['x-request-id'] || request.id;
  },
);

// Usage
@Get()
findAll(@RequestId() requestId: string) {
  this.logger.log(`Request ${requestId}: Finding all users`);
}
```

---

## IP Address Decorator

```typescript
export const ClientIp = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    return request.ip ||
           request.headers['x-forwarded-for']?.split(',')[0] ||
           request.connection.remoteAddress;
  },
);
```

---

## Pagination Decorator

```typescript
export interface PaginationParams {
  page: number;
  limit: number;
  offset: number;
}

export const Pagination = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): PaginationParams => {
    const request = ctx.switchToHttp().getRequest();
    const page = Math.max(1, parseInt(request.query.page) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(request.query.limit) || 10));
    const offset = (page - 1) * limit;

    return { page, limit, offset };
  },
);

// Usage
@Get()
findAll(@Pagination() pagination: PaginationParams) {
  return this.service.findAll(pagination);
}
```

---

## Cache Key Decorator

```typescript
export const CACHE_KEY = 'cacheKey';
export const CacheKey = (key: string) => SetMetadata(CACHE_KEY, key);

export const CACHE_TTL = 'cacheTTL';
export const CacheTTL = (ttl: number) => SetMetadata(CACHE_TTL, ttl);

// Usage
@CacheKey('users:list')
@CacheTTL(60)
@Get()
findAll() {}
```

---

## Method Decorator for Logging

```typescript
export function LogExecution() {
  return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value;

    descriptor.value = async function (...args: any[]) {
      const start = Date.now();
      const result = await originalMethod.apply(this, args);
      const duration = Date.now() - start;
      console.log(`${propertyKey} executed in ${duration}ms`);
      return result;
    };

    return descriptor;
  };
}

// Usage
@LogExecution()
async findAll() {
  return this.repository.find();
}
```

---

## Reading Metadata with Reflector

```typescript
@Injectable()
export class MyGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    // Get from handler only
    const handlerRoles = this.reflector.get<string[]>('roles', context.getHandler());

    // Get from class only
    const classRoles = this.reflector.get<string[]>('roles', context.getClass());

    // Get from both (handler overrides class)
    const roles = this.reflector.getAllAndOverride<string[]>('roles', [
      context.getHandler(),
      context.getClass(),
    ]);

    // Merge from both
    const allRoles = this.reflector.getAllAndMerge<string[]>('roles', [
      context.getHandler(),
      context.getClass(),
    ]);

    return true;
  }
}
```
