# 8. Caching & Performance

NestJS provides built-in caching support with flexible storage backends.

---

## Libraries

| Library | Use Case |
|---------|----------|
| **cache-manager** | Unified caching API |
| **Redis** | Distributed cache |
| **Keyv** | Multi-backend |
| **In-memory** | Simple, single-instance |

---

## Cache Manager Integration

### Installation
```bash
npm install @nestjs/cache-manager cache-manager
```

### Module Setup
```ts
import { CacheModule } from '@nestjs/cache-manager';

@Module({
  imports: [
    CacheModule.register({
      ttl: 60000, // milliseconds
      max: 100,   // max items in cache
      isGlobal: true,
    }),
  ],
})
export class AppModule {}
```

### Inject Cache
```ts
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';

@Injectable()
export class UsersService {
  constructor(@Inject(CACHE_MANAGER) private cacheManager: Cache) {}

  async findOne(id: number): Promise<User> {
    const cacheKey = `user:${id}`;
    
    // Check cache
    const cached = await this.cacheManager.get<User>(cacheKey);
    if (cached) return cached;

    // Fetch from DB
    const user = await this.usersRepo.findOne(id);
    
    // Store in cache
    await this.cacheManager.set(cacheKey, user, 60000);
    
    return user;
  }

  async update(id: number, data: UpdateUserDto) {
    await this.usersRepo.update(id, data);
    // Invalidate cache
    await this.cacheManager.del(`user:${id}`);
  }
}
```

---

## Cache Interceptor

### Auto-cache GET Responses
```ts
import { CacheInterceptor, CacheTTL, CacheKey } from '@nestjs/cache-manager';

@Controller('users')
@UseInterceptors(CacheInterceptor)
export class UsersController {
  @Get()
  @CacheTTL(30000) // 30 seconds
  findAll() {
    return this.usersService.findAll();
  }

  @Get(':id')
  @CacheKey('custom-key')
  findOne(@Param('id') id: number) {
    return this.usersService.findOne(id);
  }
}
```

### Global Cache Interceptor
```ts
@Module({
  providers: [
    {
      provide: APP_INTERCEPTOR,
      useClass: CacheInterceptor,
    },
  ],
})
export class AppModule {}
```

---

## Redis Cache

### Installation
```bash
npm install cache-manager-redis-yet redis
```

### Configuration
```ts
import { redisStore } from 'cache-manager-redis-yet';

@Module({
  imports: [
    CacheModule.registerAsync({
      isGlobal: true,
      useFactory: async () => ({
        store: await redisStore({
          socket: {
            host: 'localhost',
            port: 6379,
          },
          ttl: 60000,
        }),
      }),
    }),
  ],
})
export class AppModule {}
```

---

## Custom Cache Key Strategy

```ts
import { CacheInterceptor, ExecutionContext } from '@nestjs/common';

@Injectable()
export class HttpCacheInterceptor extends CacheInterceptor {
  trackBy(context: ExecutionContext): string | undefined {
    const request = context.switchToHttp().getRequest();
    const { httpAdapter } = this.httpAdapterHost;

    const isGetRequest = httpAdapter.getRequestMethod(request) === 'GET';
    if (!isGetRequest) return undefined;

    // Include query params and user ID in cache key
    const url = httpAdapter.getRequestUrl(request);
    const userId = request.user?.id || 'anonymous';
    
    return `${userId}:${url}`;
  }
}
```

---

## Cache Aside Pattern

```ts
@Injectable()
export class ProductsService {
  async getProduct(id: number): Promise<Product> {
    const cacheKey = `product:${id}`;
    
    return this.cacheManager.wrap(
      cacheKey,
      () => this.productsRepo.findOne(id),
      60000, // TTL
    );
  }
}
```

---

## Best Practices

1. **Set appropriate TTLs** - balance freshness vs performance
2. **Invalidate on mutations** - keep cache consistent
3. **Use cache keys wisely** - include relevant identifiers
4. **Monitor cache hit rates** - tune configuration
5. **Use Redis for distributed** - multiple instances
6. **Implement cache warming** - for critical data
7. **Handle cache failures gracefully** - fallback to DB
