# Guards Beyond Authentication

## Guard Basics

```typescript
@Injectable()
export class MyGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean> {
    // Return true to allow, false to deny
    return true;
  }
}
```

---

## Role-Based Access Control (RBAC)

```typescript
// roles.decorator.ts
export const ROLES_KEY = 'roles';
export const Roles = (...roles: string[]) => SetMetadata(ROLES_KEY, roles);

// roles.guard.ts
@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<string[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredRoles) {
      return true; // No roles required
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    return requiredRoles.some(role => user.roles?.includes(role));
  }
}

// Usage
@Roles('admin', 'moderator')
@UseGuards(AuthGuard, RolesGuard)
@Delete(':id')
delete(@Param('id') id: string) {}
```

---

## Permission-Based Guard

```typescript
// permissions.decorator.ts
export const PERMISSIONS_KEY = 'permissions';
export const RequirePermissions = (...permissions: string[]) =>
  SetMetadata(PERMISSIONS_KEY, permissions);

// permissions.guard.ts
@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private permissionService: PermissionService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const required = this.reflector.getAllAndOverride<string[]>(PERMISSIONS_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!required) return true;

    const request = context.switchToHttp().getRequest();
    const userPermissions = await this.permissionService.getUserPermissions(request.user.id);

    return required.every(p => userPermissions.includes(p));
  }
}

// Usage
@RequirePermissions('users:read', 'users:write')
@Get('users')
getUsers() {}
```

---

## Rate Limiting Guard

```typescript
@Injectable()
export class RateLimitGuard implements CanActivate {
  private readonly store = new Map<string, { count: number; resetTime: number }>();

  constructor(
    private readonly limit: number = 100,
    private readonly windowMs: number = 60000,
  ) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const key = request.ip;
    const now = Date.now();

    const record = this.store.get(key);

    if (!record || now > record.resetTime) {
      this.store.set(key, { count: 1, resetTime: now + this.windowMs });
      return true;
    }

    if (record.count >= this.limit) {
      throw new HttpException('Too Many Requests', HttpStatus.TOO_MANY_REQUESTS);
    }

    record.count++;
    return true;
  }
}
```

---

## Feature Flag Guard

```typescript
// feature.decorator.ts
export const FEATURE_KEY = 'feature';
export const RequireFeature = (feature: string) => SetMetadata(FEATURE_KEY, feature);

// feature.guard.ts
@Injectable()
export class FeatureFlagGuard implements CanActivate {
  constructor(private featureService: FeatureFlagService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const feature = this.reflector.get<string>(FEATURE_KEY, context.getHandler());

    if (!feature) return true;

    const request = context.switchToHttp().getRequest();
    const isEnabled = await this.featureService.isEnabled(feature, request.user);

    if (!isEnabled) {
      throw new ForbiddenException(`Feature '${feature}' is not enabled`);
    }

    return true;
  }
}

// Usage
@RequireFeature('new-dashboard')
@Get('dashboard')
getDashboard() {}
```

---

## Ownership Guard

```typescript
@Injectable()
export class OwnershipGuard implements CanActivate {
  constructor(private resourceService: ResourceService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const resourceId = request.params.id;
    const userId = request.user.id;

    const resource = await this.resourceService.findById(resourceId);

    if (!resource) {
      throw new NotFoundException();
    }

    if (resource.ownerId !== userId) {
      throw new ForbiddenException('You do not own this resource');
    }

    // Attach to request for later use
    request.resource = resource;
    return true;
  }
}
```

---

## IP Whitelist Guard

```typescript
@Injectable()
export class IpWhitelistGuard implements CanActivate {
  private readonly whitelist = ['127.0.0.1', '::1', '10.0.0.0/8'];

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const clientIp = request.ip;

    const isAllowed = this.whitelist.some(ip => this.matchIp(clientIp, ip));

    if (!isAllowed) {
      throw new ForbiddenException('IP not allowed');
    }

    return true;
  }

  private matchIp(clientIp: string, pattern: string): boolean {
    // Implement CIDR matching logic
    return clientIp === pattern;
  }
}
```

---

## Maintenance Mode Guard

```typescript
@Injectable()
export class MaintenanceGuard implements CanActivate {
  constructor(private configService: ConfigService) {}

  canActivate(context: ExecutionContext): boolean {
    const isMaintenanceMode = this.configService.get('MAINTENANCE_MODE') === 'true';

    if (isMaintenanceMode) {
      // Allow admin routes
      const request = context.switchToHttp().getRequest();
      if (request.user?.role === 'admin') {
        return true;
      }

      throw new ServiceUnavailableException('System is under maintenance');
    }

    return true;
  }
}
```

---

## Combining Guards

```typescript
// Multiple guards - ALL must pass (AND logic)
@UseGuards(AuthGuard, RolesGuard, FeatureFlagGuard)
@Get('admin')
adminOnly() {}

// Custom combined guard (OR logic)
@Injectable()
export class AuthOrApiKeyGuard implements CanActivate {
  constructor(
    private authGuard: AuthGuard,
    private apiKeyGuard: ApiKeyGuard,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    try {
      return await this.authGuard.canActivate(context);
    } catch {
      return await this.apiKeyGuard.canActivate(context);
    }
  }
}
```

---

## Guard Execution Order

```
Global Guards → Controller Guards → Route Guards
```

All guards must return `true` for request to proceed.
