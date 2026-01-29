# 📹 Video 2: NestJS Testing Library Architecture

> How @nestjs/testing connects with the DI system

---

## 🎯 What You'll Learn

- How @nestjs/testing works internally
- TestingModule compilation process
- Mocking and overriding providers

---

## Topic 2.1: Testing Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Test Environment                          │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────────┐    ┌─────────────────┐                │
│  │   Test.create   │───▶│  TestingModule  │                │
│  │   ModuleBuilder │    │    Compiler     │                │
│  └─────────────────┘    └─────────────────┘                │
│           │                      │                          │
│           ▼                      ▼                          │
│  ┌─────────────────┐    ┌─────────────────┐                │
│  │  Mock Providers │    │  Real Providers │                │
│  └─────────────────┘    └─────────────────┘                │
│                    │    │                                   │
│                    ▼    ▼                                   │
│           ┌─────────────────┐                               │
│           │  Compiled Test  │                               │
│           │     Module      │                               │
│           └─────────────────┘                               │
└─────────────────────────────────────────────────────────────┘
```

---

## Topic 2.2: TestingModule Builder Pattern

```typescript
import { Test, TestingModule } from '@nestjs/testing';

const moduleRef: TestingModule = await Test.createTestingModule({
  imports: [AppModule],
  controllers: [UserController],
  providers: [
    UserService,
    {
      provide: DatabaseService,
      useValue: mockDatabaseService, // Override with mock
    },
  ],
})
  .overrideProvider(ExternalApiService)
  .useValue(mockExternalApi)
  .overrideGuard(AuthGuard)
  .useValue({ canActivate: () => true })
  .compile();
```

---

## Topic 2.3: How compile() Works Internally

```typescript
class TestingModuleBuilder {
  private readonly module: ModuleMetadata;
  private readonly overloads: Map<any, any> = new Map();

  async compile(): Promise<TestingModule> {
    // 1. Create DI container
    const container = new NestContainer();

    // 2. Scan modules and collect metadata
    const scanner = new DependenciesScanner(container);
    await scanner.scan(this.module);

    // 3. Apply overrides (mocks)
    this.applyOverloads(container);

    // 4. Create instances
    const instanceLoader = new InstanceLoader(container);
    await instanceLoader.createInstances();

    // 5. Return compiled module
    return new TestingModule(container);
  }
}
```

---

## Topic 2.4: Getting Providers from TestingModule

```typescript
const module = await Test.createTestingModule({
  providers: [UserService, UserRepository],
}).compile();

// Get singleton provider
const service = module.get<UserService>(UserService);

// Get by token
const config = module.get('CONFIG');

// Resolve request-scoped provider
const requestService = await module.resolve(RequestScopedService);

// Create NestApplication for E2E
const app = module.createNestApplication();
await app.init();
```

---

## Topic 2.5: Override Methods

```typescript
// Override provider
.overrideProvider(UserService)
.useValue(mockUserService)
.useClass(MockUserService)
.useFactory({ factory: () => new MockUserService() })

// Override guard
.overrideGuard(AuthGuard)
.useValue({ canActivate: () => true })

// Override interceptor
.overrideInterceptor(LoggingInterceptor)
.useValue({ intercept: (ctx, next) => next.handle() })

// Override pipe
.overridePipe(ValidationPipe)
.useValue({ transform: (value) => value })

// Override filter
.overrideFilter(HttpExceptionFilter)
.useValue({ catch: () => {} })
```

---

## 📝 Summary

- **Test.createTestingModule()** - Creates isolated test module
- **compile()** - Builds DI container with overrides
- **module.get()** - Retrieves singleton providers
- **module.resolve()** - Retrieves scoped providers
- **Override methods** - Mock any provider, guard, interceptor, etc.

---

## 🔗 Next

- [03-jest-testing.md](./03-jest-testing.md) - Testing with Jest
