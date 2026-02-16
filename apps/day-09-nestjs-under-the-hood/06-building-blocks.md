# NestJS Building Blocks

> Controllers, Services, Middleware, Guards, Interceptors, Pipes, Filters

---

## 🎯 What You'll Learn

- All NestJS building blocks with code examples
- When to use each component
- How they integrate together

---

## Topic 6.1: Modules

```typescript
// Basic Module
@Module({
  imports: [DatabaseModule],      // Import other modules
  controllers: [UserController],   // Register controllers
  providers: [UserService],        // Register providers
  exports: [UserService],          // Export for other modules
})
export class UserModule {}

// Dynamic Module
@Module({})
export class DatabaseModule {
  static forRoot(options: DbOptions): DynamicModule {
    return {
      module: DatabaseModule,
      global: true,
      providers: [
        { provide: 'DB_OPTIONS', useValue: options },
        DatabaseService,
      ],
      exports: [DatabaseService],
    };
  }
}
```

---

## Topic 6.2: Controllers

```typescript
@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get()
  findAll(@Query() query: PaginationDto): Promise<User[]> {
    return this.userService.findAll(query);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number): Promise<User> {
    return this.userService.findById(id);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() dto: CreateUserDto): Promise<User> {
    return this.userService.create(dto);
  }

  @Put(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateUserDto,
  ): Promise<User> {
    return this.userService.update(id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.userService.remove(id);
  }
}
```

---

## Topic 6.3: Providers (Services)

```typescript
@Injectable()
export class UserService {
  constructor(
    private readonly userRepository: UserRepository,
    @Inject('CACHE') private readonly cache: CacheService,
  ) {}

  async findById(id: number): Promise<User> {
    // Check cache
    const cached = await this.cache.get(`user:${id}`);
    if (cached) return cached;

    // Query database
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException(`User ${id} not found`);
    }

    // Store in cache
    await this.cache.set(`user:${id}`, user, 3600);
    return user;
  }
}
```

---

## Topic 6.4: Middleware

```typescript
// Functional Middleware
export function loggerMiddleware(req: Request, res: Response, next: NextFunction) {
  console.log(`${req.method} ${req.url}`);
  next();
}

// Class-based Middleware
@Injectable()
export class AuthMiddleware implements NestMiddleware {
  constructor(private authService: AuthService) {}

  async use(req: Request, res: Response, next: NextFunction) {
    const token = req.headers.authorization?.split(' ')[1];
    if (token) {
      req['user'] = await this.authService.validateToken(token);
    }
    next();
  }
}

// Apply in Module
@Module({})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(AuthMiddleware)
      .exclude({ path: 'auth/login', method: RequestMethod.POST })
      .forRoutes('*');
  }
}
```

---

## Topic 6.5: Guards

```typescript
@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const roles = this.reflector.getAllAndOverride<string[]>('roles', [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!roles) return true;

    const { user } = context.switchToHttp().getRequest();
    return roles.some(role => user.roles?.includes(role));
  }
}

// Decorator
export const Roles = (...roles: string[]) => SetMetadata('roles', roles);

// Usage
@Controller('admin')
@UseGuards(AuthGuard, RolesGuard)
export class AdminController {
  @Get()
  @Roles('admin')
  getDashboard() {}
}
```

---

## Topic 6.6: Interceptors

```typescript
// Response transformation
@Injectable()
export class TransformInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      map(data => ({
        data,
        timestamp: new Date().toISOString(),
      })),
    );
  }
}

// Logging interceptor
@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const now = Date.now();
    return next.handle().pipe(
      tap(() => console.log(`Completed in ${Date.now() - now}ms`)),
    );
  }
}

// Caching interceptor
@Injectable()
export class CacheInterceptor implements NestInterceptor {
  constructor(private cache: CacheService) {}

  async intercept(context: ExecutionContext, next: CallHandler) {
    const key = context.switchToHttp().getRequest().url;
    const cached = await this.cache.get(key);
    if (cached) return of(cached);

    return next.handle().pipe(
      tap(data => this.cache.set(key, data, 60)),
    );
  }
}
```

---

## Topic 6.7: Pipes

```typescript
// Validation Pipe (built-in)
@Post()
@UsePipes(new ValidationPipe({ transform: true }))
create(@Body() dto: CreateUserDto) {}

// Custom Pipe
@Injectable()
export class ParseDatePipe implements PipeTransform<string, Date> {
  transform(value: string): Date {
    const date = new Date(value);
    if (isNaN(date.getTime())) {
      throw new BadRequestException('Invalid date');
    }
    return date;
  }
}

// Usage
@Get()
findByDate(@Query('date', ParseDatePipe) date: Date) {}
```

---

## Topic 6.8: Exception Filters

```typescript
@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const status = exception.getStatus();

    response.status(status).json({
      statusCode: status,
      message: exception.message,
      timestamp: new Date().toISOString(),
    });
  }
}

// Global filter
@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const status = exception instanceof HttpException
      ? exception.getStatus()
      : HttpStatus.INTERNAL_SERVER_ERROR;

    // Log and respond
  }
}
```

---

## 📝 Summary

| Block | Purpose | Scope |
|-------|---------|-------|
| **Module** | Organize app structure | - |
| **Controller** | Handle HTTP requests | Route level |
| **Provider** | Business logic, DI | Module level |
| **Middleware** | Pre-route processing | Route level |
| **Guard** | Authorization | Method/Controller |
| **Interceptor** | Transform req/res | Method/Controller |
| **Pipe** | Validate/transform data | Param level |
| **Filter** | Handle exceptions | Method/Controller/Global |

---

## 🔗 Next

- [07-angular-inspired.md](./07-angular-inspired.md) - Angular design patterns
