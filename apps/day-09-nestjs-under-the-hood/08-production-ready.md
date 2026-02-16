# NestJS as Production-Ready Framework

> Built-in features for enterprise applications

---

## 🎯 What You'll Learn

- Production-ready features in NestJS
- Configuration management
- Security, logging, and monitoring
- Best practices for deployment

---

## Topic 8.1: Configuration Management

```typescript
// config/database.config.ts
import { registerAs } from '@nestjs/config';

export default registerAs('database', () => ({
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT, 10) || 5432,
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
}));

// app.module.ts
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [databaseConfig],
      validationSchema: Joi.object({
        DB_HOST: Joi.string().required(),
        DB_PORT: Joi.number().default(5432),
      }),
    }),
  ],
})
export class AppModule {}

// Usage
@Injectable()
export class DatabaseService {
  constructor(private config: ConfigService) {
    const host = this.config.get<string>('database.host');
  }
}
```

---

## Topic 8.2: Health Checks

```typescript
import { HealthCheckService, TypeOrmHealthIndicator } from '@nestjs/terminus';

@Controller('health')
export class HealthController {
  constructor(
    private health: HealthCheckService,
    private db: TypeOrmHealthIndicator,
  ) {}

  @Get()
  @HealthCheck()
  check() {
    return this.health.check([
      () => this.db.pingCheck('database'),
    ]);
  }
}

// Response
{
  "status": "ok",
  "details": {
    "database": { "status": "up" }
  }
}
```

---

## Topic 8.3: Rate Limiting

```typescript
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';

@Module({
  imports: [
    ThrottlerModule.forRoot({
      ttl: 60,     // Time window (seconds)
      limit: 100,  // Max requests per window
    }),
  ],
  providers: [
    { provide: APP_GUARD, useClass: ThrottlerGuard },
  ],
})
export class AppModule {}

// Per-route override
@Controller('api')
export class ApiController {
  @Throttle(5, 60) // 5 requests per 60 seconds
  @Post('expensive')
  expensiveOperation() {}

  @SkipThrottle()
  @Get('health')
  health() {}
}
```

---

## Topic 8.4: Security Headers

```typescript
// main.ts
import * as helmet from 'helmet';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Security headers
  app.use(helmet());

  // CORS
  app.enableCors({
    origin: ['https://example.com'],
    credentials: true,
  });

  // Validation
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,           // Strip unknown properties
    forbidNonWhitelisted: true, // Throw on unknown properties
    transform: true,            // Auto-transform payloads
  }));

  await app.listen(3000);
}
```

---

## Topic 8.5: Logging

```typescript
import { Logger, Injectable } from '@nestjs/common';

@Injectable()
export class UserService {
  private readonly logger = new Logger(UserService.name);

  async create(dto: CreateUserDto) {
    this.logger.log(`Creating user: ${dto.email}`);
    try {
      const user = await this.repo.save(dto);
      this.logger.log(`User created: ${user.id}`);
      return user;
    } catch (error) {
      this.logger.error(`Failed to create user: ${error.message}`, error.stack);
      throw error;
    }
  }
}

// Custom logger with Winston
@Injectable()
export class WinstonLogger implements LoggerService {
  private logger = winston.createLogger({
    transports: [
      new winston.transports.Console(),
      new winston.transports.File({ filename: 'error.log', level: 'error' }),
    ],
  });

  log(message: string) { this.logger.info(message); }
  error(message: string, trace: string) { this.logger.error(message, { trace }); }
  warn(message: string) { this.logger.warn(message); }
}
```

---

## Topic 8.6: Graceful Shutdown

```typescript
// main.ts
async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableShutdownHooks();
  await app.listen(3000);
}

// service.ts
@Injectable()
export class DatabaseService implements OnApplicationShutdown {
  async onApplicationShutdown(signal?: string) {
    console.log(`Received ${signal}, closing connections...`);
    await this.connection.close();
  }
}
```

---

## Topic 8.7: Exception Handling

```typescript
// Global exception filter
@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  constructor(private logger: Logger) {}

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();
    const request = ctx.getRequest();

    const status = exception instanceof HttpException
      ? exception.getStatus()
      : HttpStatus.INTERNAL_SERVER_ERROR;

    const message = exception instanceof HttpException
      ? exception.message
      : 'Internal server error';

    this.logger.error(`${request.method} ${request.url}`, exception);

    response.status(status).json({
      statusCode: status,
      message,
      timestamp: new Date().toISOString(),
      path: request.url,
    });
  }
}
```

---

## Topic 8.8: Production Checklist

| Category | Items |
|----------|-------|
| **Config** | ✅ Environment variables, ✅ Validation |
| **Security** | ✅ Helmet, ✅ CORS, ✅ Rate limiting, ✅ Validation |
| **Monitoring** | ✅ Health checks, ✅ Logging, ✅ Error tracking |
| **Performance** | ✅ Compression, ✅ Caching |
| **Reliability** | ✅ Graceful shutdown, ✅ Exception filters |
| **Documentation** | ✅ Swagger/OpenAPI |
| **Testing** | ✅ Unit, ✅ Integration, ✅ E2E |
| **Deployment** | ✅ Docker, ✅ CI/CD |

---

## Topic 8.9: Docker Setup

```dockerfile
# Dockerfile
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:18-alpine
WORKDIR /app
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
EXPOSE 3000
CMD ["node", "dist/main.js"]
```

```yaml
# docker-compose.yml
version: '3.8'
services:
  api:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - DB_HOST=postgres
    depends_on:
      - postgres
  postgres:
    image: postgres:14
    environment:
      POSTGRES_DB: app
      POSTGRES_USER: user
      POSTGRES_PASSWORD: pass
```

---

## 📝 Summary

NestJS provides enterprise-grade features out of the box:

- **Configuration** - Environment-based config with validation
- **Security** - Headers, CORS, rate limiting, validation
- **Monitoring** - Health checks, structured logging
- **Reliability** - Graceful shutdown, error handling
- **Scalability** - Microservices, queue workers

---

## 🔗 Back to Index

- [README.md](./README.md) - Video series overview
