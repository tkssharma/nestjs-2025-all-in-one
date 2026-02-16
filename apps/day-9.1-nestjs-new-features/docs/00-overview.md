# NestJS Integration with Other Libraries - Overview

## How NestJS Integrates with Other Libraries (Big Picture)

NestJS itself is **thin core + adapters**.
It doesn't reinvent tools — it **wraps and standardizes** existing libraries using:

- Dependency Injection
- Modules
- Providers
- Decorators

---

## Integration Map

```
┌─────────────────────────────────────────────────────────────────┐
│                         NestJS Core                              │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐              │
│  │   Modules   │  │  Providers  │  │ Decorators  │              │
│  └─────────────┘  └─────────────┘  └─────────────┘              │
│                         │                                        │
│            Dependency Injection Container                        │
└─────────────────────────────────────────────────────────────────┘
                          │
    ┌─────────────────────┼─────────────────────┐
    │                     │                     │
    ▼                     ▼                     ▼
┌─────────┐         ┌─────────┐           ┌─────────┐
│ Express │         │ Fastify │           │  Other  │
│ Adapter │         │ Adapter │           │ Adapters│
└─────────┘         └─────────┘           └─────────┘
```

---

## Topics Covered

| # | Topic | File |
|---|-------|------|
| 1 | HTTP & Web Frameworks | [01-http-web-frameworks.md](./01-http-web-frameworks.md) |
| 2 | Database & ORM | [02-database-orm.md](./02-database-orm.md) |
| 3 | Authentication & Authorization | [03-authentication.md](./03-authentication.md) |
| 4 | Validation & Transformation | [04-validation.md](./04-validation.md) |
| 5 | API Documentation & Schema | [05-api-documentation.md](./05-api-documentation.md) |
| 6 | Messaging, Queues & Events | [06-messaging-events.md](./06-messaging-events.md) |
| 7 | Background Jobs & Queues | [07-background-jobs.md](./07-background-jobs.md) |
| 8 | Caching & Performance | [08-caching.md](./08-caching.md) |
| 9 | Logging & Monitoring | [09-logging-monitoring.md](./09-logging-monitoring.md) |
| 10 | File Uploads & Media | [10-file-uploads.md](./10-file-uploads.md) |
| 11 | Email, Notifications & External APIs | [11-email-notifications.md](./11-email-notifications.md) |
| 12 | Testing Libraries | [12-testing.md](./12-testing.md) |
| 13 | Frontend & Full-Stack Integration | [13-frontend-integration.md](./13-frontend-integration.md) |
| 14 | DevOps & Infrastructure | [14-devops.md](./14-devops.md) |

---

## Why NestJS Integrates So Well

Because of:

- **Strong DI system** - Everything is injectable
- **Module boundaries** - Clean separation of concerns
- **Adapter pattern** - Swap implementations easily
- **Platform abstraction** - Framework agnostic core

> NestJS doesn't replace libraries — it **organizes them**.

---

## Key Concepts

### 1. Platform Adapters
NestJS abstracts the underlying HTTP framework:
```ts
// Express (default)
const app = await NestFactory.create(AppModule);

// Fastify
const app = await NestFactory.create<NestFastifyApplication>(
  AppModule,
  new FastifyAdapter()
);
```

### 2. Providers as Wrappers
External libraries become injectable services:
```ts
@Injectable()
export class PrismaService extends PrismaClient {}
```

### 3. Module Organization
Each integration gets its own module:
```ts
@Module({
  imports: [
    TypeOrmModule.forRoot(config),
    CacheModule.register(),
    BullModule.forRoot({ redis: config }),
  ],
})
export class AppModule {}
```

### 4. Decorator-Based Configuration
Clean, declarative syntax:
```ts
@UseGuards(JwtAuthGuard)
@UseInterceptors(CacheInterceptor)
@UsePipes(ValidationPipe)
```
