# 📹 Video 4: Dependency Injection Deep Dive ⭐

> **MAIN FOCUS** - Understanding how DI works in NestJS

---

## 🎯 What You'll Learn

- What is Dependency Injection (DI)?
- How NestJS DI Container works internally
- Provider types and when to use them
- Injection scopes (Singleton, Request, Transient)
- ModuleRef for dynamic resolution
- Circular dependency handling
- Real-world DI patterns

---

## Topic 4.1: What is Dependency Injection?

### The Problem Without DI

```typescript
// ❌ Without DI - Tight Coupling
class UserController {
  private userService: UserService;
  private logger: Logger;

  constructor() {
    // Controller creates its own dependencies
    this.userService = new UserService(new UserRepository(), new CacheService());
    this.logger = new Logger();
  }
}

// Problems:
// 1. Hard to test (can't mock dependencies)
// 2. Hard to change implementations
// 3. Tight coupling between classes
```

### The Solution With DI

```typescript
// ✅ With DI - Loose Coupling
@Controller('users')
class UserController {
  constructor(
    private userService: UserService,  // Injected by framework
    private logger: Logger,             // Injected by framework
  ) {}
}

// Benefits:
// 1. Easy to test (inject mocks)
// 2. Easy to swap implementations
// 3. Loose coupling
// 4. Single Responsibility
```

---

## Topic 4.2: How NestJS DI Container Works

### DI Container Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                     NestJS DI Container                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌──────────────────┐    ┌──────────────────┐                  │
│  │  Module Scanner  │───▶│  Provider Store  │                  │
│  │  (Collects meta) │    │  (Token → Class) │                  │
│  └──────────────────┘    └──────────────────┘                  │
│           │                       │                             │
│           ▼                       ▼                             │
│  ┌──────────────────┐    ┌──────────────────┐                  │
│  │ Dependency Graph │───▶│ Instance Loader  │                  │
│  │   (Who needs who)│    │ (Creates objects)│                  │
│  └──────────────────┘    └──────────────────┘                  │
│                                  │                              │
│                                  ▼                              │
│                         ┌──────────────────┐                   │
│                         │ Instance Cache   │                   │
│                         │ (Singleton store)│                   │
│                         └──────────────────┘                   │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### Step-by-Step: How DI Resolves Dependencies

```typescript
// Step 1: You define a service with @Injectable()
@Injectable()
export class UserService {
  constructor(
    private userRepository: UserRepository,
    private cacheService: CacheService,
  ) {}
}

// Step 2: Register in module
@Module({
  providers: [UserService, UserRepository, CacheService],
})
export class UserModule {}

// Step 3: NestJS reads metadata using Reflect API
// TypeScript emits design:paramtypes metadata
const paramTypes = Reflect.getMetadata('design:paramtypes', UserService);
// Result: [UserRepository, CacheService]

// Step 4: Container resolves each dependency recursively
// UserService needs UserRepository → resolve UserRepository first
// UserService needs CacheService → resolve CacheService first
// Then create UserService with resolved dependencies
```

### Simplified Container Implementation

```typescript
// How NestJS container works (simplified)
class DIContainer {
  private providers = new Map<any, any>();
  private instances = new Map<any, any>();

  // Register a provider
  register(token: any, provider: any) {
    this.providers.set(token, provider);
  }

  // Resolve a dependency
  resolve<T>(token: any): T {
    // 1. Check if already instantiated (singleton)
    if (this.instances.has(token)) {
      return this.instances.get(token);
    }

    // 2. Get the provider class
    const Provider = this.providers.get(token);
    if (!Provider) {
      throw new Error(`No provider for ${token.name}`);
    }

    // 3. Get constructor dependencies via reflection
    const dependencies = Reflect.getMetadata('design:paramtypes', Provider) || [];

    // 4. Recursively resolve each dependency
    const resolvedDeps = dependencies.map((dep: any) => this.resolve(dep));

    // 5. Create instance with resolved dependencies
    const instance = new Provider(...resolvedDeps);

    // 6. Cache for singleton scope
    this.instances.set(token, instance);

    return instance;
  }
}
```

---

## Topic 4.3: Provider Types

### 1. Standard Provider (useClass)

```typescript
// Implicit - most common
@Module({
  providers: [UserService], // Same as { provide: UserService, useClass: UserService }
})

// Explicit
@Module({
  providers: [
    {
      provide: UserService,
      useClass: UserService,
    },
  ],
})
```

### 2. Value Provider (useValue)

```typescript
// Inject static values or configurations
@Module({
  providers: [
    {
      provide: 'API_KEY',
      useValue: 'my-secret-api-key',
    },
    {
      provide: 'CONFIG',
      useValue: {
        database: { host: 'localhost', port: 5432 },
        cache: { ttl: 3600 },
      },
    },
  ],
})
export class AppModule {}

// Usage
@Injectable()
export class ApiService {
  constructor(
    @Inject('API_KEY') private apiKey: string,
    @Inject('CONFIG') private config: AppConfig,
  ) {}
}
```

### 3. Class Provider (useClass)

```typescript
// Swap implementations based on environment
@Module({
  providers: [
    {
      provide: LoggerService,
      useClass: process.env.NODE_ENV === 'production' 
        ? ProductionLogger 
        : DevelopmentLogger,
    },
  ],
})

// Interface-based injection
interface PaymentGateway {
  charge(amount: number): Promise<void>;
}

@Module({
  providers: [
    {
      provide: 'PAYMENT_GATEWAY',
      useClass: StripePaymentService, // Can easily swap to PayPalService
    },
  ],
})
```

### 4. Factory Provider (useFactory)

```typescript
// Dynamic provider creation with dependencies
@Module({
  providers: [
    {
      provide: 'DATABASE_CONNECTION',
      useFactory: async (configService: ConfigService) => {
        const dbConfig = configService.get('database');
        const connection = await createConnection({
          host: dbConfig.host,
          port: dbConfig.port,
          username: dbConfig.username,
          password: dbConfig.password,
        });
        return connection;
      },
      inject: [ConfigService], // Dependencies for factory
    },
  ],
})

// Async factory with multiple dependencies
@Module({
  providers: [
    {
      provide: 'CACHE_CLIENT',
      useFactory: async (config: ConfigService, logger: LoggerService) => {
        logger.log('Initializing cache client...');
        const client = new Redis(config.get('redis'));
        await client.connect();
        return client;
      },
      inject: [ConfigService, LoggerService],
    },
  ],
})
```

### 5. Existing Provider (useExisting) - Alias

```typescript
// Create an alias for existing provider
@Module({
  providers: [
    UserService,
    {
      provide: 'USER_SERVICE_ALIAS',
      useExisting: UserService, // Points to same instance
    },
  ],
})

// Useful for interface tokens
@Module({
  providers: [
    EmailNotificationService,
    {
      provide: 'NOTIFICATION_SERVICE',
      useExisting: EmailNotificationService,
    },
  ],
})
```

---

## Topic 4.4: Injection Scopes

### Scope Types

```
┌─────────────────────────────────────────────────────────────────┐
│                      INJECTION SCOPES                            │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  DEFAULT (Singleton)     REQUEST              TRANSIENT         │
│  ┌─────────────────┐    ┌─────────────────┐  ┌─────────────────┐│
│  │ One instance    │    │ New instance    │  │ New instance    ││
│  │ shared across   │    │ per HTTP       │  │ every time      ││
│  │ entire app      │    │ request        │  │ injected        ││
│  └─────────────────┘    └─────────────────┘  └─────────────────┘│
│                                                                  │
│  Use: Stateless        Use: Request data    Use: Stateful,     │
│  services              User context         unique instances    │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### Singleton Scope (Default)

```typescript
// One instance for entire application lifecycle
@Injectable() // Default scope is Singleton
export class DatabaseService {
  private pool: ConnectionPool;

  constructor() {
    this.pool = createPool(); // Created once
  }

  query(sql: string) {
    return this.pool.query(sql);
  }
}
```

### Request Scope

```typescript
// New instance for each HTTP request
@Injectable({ scope: Scope.REQUEST })
export class RequestContextService {
  private user: User;
  private requestId: string;

  constructor(@Inject(REQUEST) private request: Request) {
    this.requestId = uuid();
    this.user = request.user;
  }

  getCurrentUser(): User {
    return this.user;
  }

  getRequestId(): string {
    return this.requestId;
  }
}

// Usage in controller
@Controller('users')
export class UserController {
  constructor(private requestContext: RequestContextService) {}

  @Get('me')
  getMe() {
    // Each request gets fresh RequestContextService
    return this.requestContext.getCurrentUser();
  }
}
```

### Transient Scope

```typescript
// New instance every time it's injected
@Injectable({ scope: Scope.TRANSIENT })
export class TaskRunner {
  private taskId = uuid();

  constructor() {
    console.log(`TaskRunner created: ${this.taskId}`);
  }

  run(task: () => void) {
    console.log(`Running task in ${this.taskId}`);
    task();
  }
}

// Each injection gets a new instance
@Injectable()
export class JobProcessor {
  constructor(
    private runner1: TaskRunner, // New instance
    private runner2: TaskRunner, // Another new instance
  ) {
    // runner1.taskId !== runner2.taskId
  }
}
```

### Scope Bubbling

```typescript
// ⚠️ Important: Scope bubbles up!

@Injectable({ scope: Scope.REQUEST })
export class RequestService {}

@Injectable() // Singleton
export class UserService {
  constructor(private requestService: RequestService) {}
  // ❌ This won't work! Singleton can't depend on Request-scoped
}

// Solution: Use ModuleRef for dynamic resolution
@Injectable()
export class UserService {
  constructor(private moduleRef: ModuleRef) {}

  async doSomething(request: Request) {
    const contextId = ContextIdFactory.getByRequest(request);
    const requestService = await this.moduleRef.resolve(
      RequestService,
      contextId,
    );
    // Now you can use requestService
  }
}
```

---

## Topic 4.5: ModuleRef - Dynamic Resolution

### What is ModuleRef?

```typescript
// ModuleRef allows runtime provider resolution
@Injectable()
export class DynamicService {
  constructor(private moduleRef: ModuleRef) {}

  // Get singleton provider
  getSingleton() {
    return this.moduleRef.get(UserService);
  }

  // Resolve request-scoped or transient provider
  async getRequestScoped(contextId: ContextId) {
    return this.moduleRef.resolve(RequestService, contextId);
  }

  // Create new instance (ignores scope)
  async createNew() {
    return this.moduleRef.create(SomeService);
  }
}
```

### Use Case: Strategy Pattern

```typescript
// Define strategies
@Injectable()
export class StripePayment implements PaymentStrategy {
  async charge(amount: number) {
    console.log(`Charging ${amount} via Stripe`);
  }
}

@Injectable()
export class PayPalPayment implements PaymentStrategy {
  async charge(amount: number) {
    console.log(`Charging ${amount} via PayPal`);
  }
}

// Dynamic strategy selection
@Injectable()
export class PaymentProcessor {
  private strategies = new Map<string, Type<PaymentStrategy>>();

  constructor(private moduleRef: ModuleRef) {
    this.strategies.set('stripe', StripePayment);
    this.strategies.set('paypal', PayPalPayment);
  }

  async processPayment(method: string, amount: number) {
    const StrategyClass = this.strategies.get(method);
    if (!StrategyClass) {
      throw new Error(`Unknown payment method: ${method}`);
    }

    const strategy = this.moduleRef.get(StrategyClass);
    await strategy.charge(amount);
  }
}
```

### Use Case: Plugin System

```typescript
@Injectable()
export class PluginManager {
  private plugins: Type<Plugin>[] = [];

  constructor(private moduleRef: ModuleRef) {}

  registerPlugin(plugin: Type<Plugin>) {
    this.plugins.push(plugin);
  }

  async executeAll(context: PluginContext) {
    for (const PluginClass of this.plugins) {
      const plugin = this.moduleRef.get(PluginClass, { strict: false });
      await plugin.execute(context);
    }
  }
}
```

---

## Topic 4.6: Circular Dependencies

### The Problem

```typescript
// ❌ Circular dependency
@Injectable()
export class ServiceA {
  constructor(private serviceB: ServiceB) {} // A needs B
}

@Injectable()
export class ServiceB {
  constructor(private serviceA: ServiceA) {} // B needs A
}

// Error: Cannot resolve circular dependency
```

### Solution: forwardRef

```typescript
// ✅ Using forwardRef
@Injectable()
export class ServiceA {
  constructor(
    @Inject(forwardRef(() => ServiceB))
    private serviceB: ServiceB,
  ) {}

  methodA() {
    return 'A: ' + this.serviceB.methodB();
  }
}

@Injectable()
export class ServiceB {
  constructor(
    @Inject(forwardRef(() => ServiceA))
    private serviceA: ServiceA,
  ) {}

  methodB() {
    return 'B';
  }
}

// Module
@Module({
  providers: [ServiceA, ServiceB],
})
export class AppModule {}
```

### Better Solution: Refactor

```typescript
// ✅ Best practice: Extract shared logic
@Injectable()
export class SharedService {
  sharedMethod() {
    return 'shared';
  }
}

@Injectable()
export class ServiceA {
  constructor(private shared: SharedService) {}
}

@Injectable()
export class ServiceB {
  constructor(private shared: SharedService) {}
}
```

---

## Topic 4.7: Custom Decorators with DI

### Creating Injectable Decorator

```typescript
// Custom decorator that uses DI
import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const CurrentUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    return request.user;
  },
);

// Usage
@Controller('users')
export class UserController {
  @Get('profile')
  getProfile(@CurrentUser() user: User) {
    return user;
  }
}
```

### Decorator with Injected Service

```typescript
// Advanced: Decorator that needs DI
export function LogExecution() {
  const injectLogger = Inject(LoggerService);

  return function (
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor,
  ) {
    injectLogger(target, 'logger');

    const originalMethod = descriptor.value;

    descriptor.value = async function (...args: any[]) {
      const logger = this.logger as LoggerService;
      logger.log(`Executing ${propertyKey}`);
      
      const start = Date.now();
      const result = await originalMethod.apply(this, args);
      
      logger.log(`${propertyKey} completed in ${Date.now() - start}ms`);
      return result;
    };

    return descriptor;
  };
}
```

---

## Topic 4.8: Testing with DI

### Mocking Dependencies

```typescript
describe('UserService', () => {
  let service: UserService;
  let mockRepository: jest.Mocked<UserRepository>;

  beforeEach(async () => {
    // Create mock
    mockRepository = {
      findOne: jest.fn(),
      save: jest.fn(),
      find: jest.fn(),
    } as any;

    // Use Test module to override providers
    const module = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: UserRepository,
          useValue: mockRepository, // Inject mock
        },
      ],
    }).compile();

    service = module.get(UserService);
  });

  it('should find user by id', async () => {
    const user = { id: 1, name: 'John' };
    mockRepository.findOne.mockResolvedValue(user);

    const result = await service.findById(1);

    expect(result).toEqual(user);
    expect(mockRepository.findOne).toHaveBeenCalledWith({ where: { id: 1 } });
  });
});
```

### Testing Request-Scoped Providers

```typescript
describe('RequestContextService', () => {
  let service: RequestContextService;

  beforeEach(async () => {
    const mockRequest = {
      user: { id: 1, name: 'Test User' },
    };

    const module = await Test.createTestingModule({
      providers: [
        RequestContextService,
        {
          provide: REQUEST,
          useValue: mockRequest,
        },
      ],
    }).compile();

    // Use resolve for request-scoped
    service = await module.resolve(RequestContextService);
  });

  it('should return current user', () => {
    const user = service.getCurrentUser();
    expect(user.name).toBe('Test User');
  });
});
```

---

## 📝 Summary

| Concept | Description |
|---------|-------------|
| **DI Container** | Manages provider registration and instance creation |
| **@Injectable()** | Marks class as injectable provider |
| **Provider Types** | useClass, useValue, useFactory, useExisting |
| **Scopes** | DEFAULT (singleton), REQUEST, TRANSIENT |
| **ModuleRef** | Dynamic runtime resolution |
| **forwardRef** | Handles circular dependencies |
| **Injection Token** | String/Symbol for non-class providers |

---

## 🔗 Next Steps

- [05-under-the-hood.md](./05-under-the-hood.md) - How NestJS bootstraps
- [06-building-blocks.md](./06-building-blocks.md) - Controllers, Services, etc.
