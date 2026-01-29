# 📹 Video 3: NestJS with Jest - Complete Testing Guide

> Unit, Integration, and E2E testing patterns

---

## 🎯 What You'll Learn

- Unit testing services and controllers
- Integration testing with real modules
- E2E testing with Supertest
- Mocking strategies

---

## Topic 3.1: Jest Integration Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                      Jest Test Runner                        │
├─────────────────────────────────────────────────────────────┤
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │  Unit Tests  │  │ Integration  │  │   E2E Tests  │      │
│  │  *.spec.ts   │  │    Tests     │  │ *.e2e-spec   │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
│         │                 │                  │               │
│         ▼                 ▼                  ▼               │
│  ┌─────────────────────────────────────────────────────┐   │
│  │              @nestjs/testing Module                  │   │
│  └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

---

## Topic 3.2: Unit Testing Services

```typescript
// user.service.spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from './user.service';
import { UserRepository } from './user.repository';

describe('UserService', () => {
  let service: UserService;
  let repository: jest.Mocked<UserRepository>;

  const mockUserRepository = {
    findOne: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
    delete: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: UserRepository,
          useValue: mockUserRepository,
        },
      ],
    }).compile();

    service = module.get<UserService>(UserService);
    repository = module.get(UserRepository);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('findById', () => {
    it('should return a user when found', async () => {
      const user = { id: 1, name: 'John', email: 'john@test.com' };
      mockUserRepository.findOne.mockResolvedValue(user);

      const result = await service.findById(1);

      expect(result).toEqual(user);
      expect(mockUserRepository.findOne).toHaveBeenCalledWith({
        where: { id: 1 },
      });
    });

    it('should throw NotFoundException when user not found', async () => {
      mockUserRepository.findOne.mockResolvedValue(null);

      await expect(service.findById(999)).rejects.toThrow('User not found');
    });
  });
});
```

---

## Topic 3.3: Unit Testing Controllers

```typescript
// user.controller.spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { UserController } from './user.controller';
import { UserService } from './user.service';

describe('UserController', () => {
  let controller: UserController;
  let service: jest.Mocked<UserService>;

  const mockUserService = {
    findAll: jest.fn(),
    findById: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserController],
      providers: [
        {
          provide: UserService,
          useValue: mockUserService,
        },
      ],
    }).compile();

    controller = module.get<UserController>(UserController);
    service = module.get(UserService);
  });

  describe('findAll', () => {
    it('should return array of users', async () => {
      const users = [{ id: 1, name: 'John' }];
      mockUserService.findAll.mockResolvedValue(users);

      const result = await controller.findAll();

      expect(result).toEqual(users);
    });
  });

  describe('create', () => {
    it('should create and return user', async () => {
      const dto = { name: 'John', email: 'john@test.com' };
      const created = { id: 1, ...dto };
      mockUserService.create.mockResolvedValue(created);

      const result = await controller.create(dto);

      expect(result).toEqual(created);
      expect(mockUserService.create).toHaveBeenCalledWith(dto);
    });
  });
});
```

---

## Topic 3.4: Integration Testing

```typescript
// user.integration.spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { UserModule } from './user.module';
import { UserService } from './user.service';
import { TypeOrmModule } from '@nestjs/typeorm';

describe('UserModule Integration', () => {
  let module: TestingModule;
  let service: UserService;

  beforeAll(async () => {
    module = await Test.createTestingModule({
      imports: [
        TypeOrmModule.forRoot({
          type: 'sqlite',
          database: ':memory:',
          entities: [User],
          synchronize: true,
        }),
        UserModule,
      ],
    }).compile();

    service = module.get<UserService>(UserService);
  });

  afterAll(async () => {
    await module.close();
  });

  it('should create and find user', async () => {
    const created = await service.create({
      name: 'Test',
      email: 'test@test.com',
    });

    const found = await service.findById(created.id);

    expect(found.name).toBe('Test');
  });
});
```

---

## Topic 3.5: E2E Testing

```typescript
// app.e2e-spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';

describe('UserController (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe());
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('POST /users', () => {
    it('should create a user', () => {
      return request(app.getHttpServer())
        .post('/users')
        .send({ name: 'John', email: 'john@test.com' })
        .expect(201)
        .expect((res) => {
          expect(res.body).toHaveProperty('id');
          expect(res.body.name).toBe('John');
        });
    });

    it('should return 400 for invalid data', () => {
      return request(app.getHttpServer())
        .post('/users')
        .send({ name: '' })
        .expect(400);
    });
  });

  describe('GET /users/:id', () => {
    it('should return 404 for non-existent user', () => {
      return request(app.getHttpServer())
        .get('/users/999')
        .expect(404);
    });
  });
});
```

---

## Topic 3.6: Testing Guards

```typescript
describe('AuthGuard', () => {
  let guard: AuthGuard;
  let jwtService: jest.Mocked<JwtService>;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        AuthGuard,
        {
          provide: JwtService,
          useValue: { verify: jest.fn() },
        },
      ],
    }).compile();

    guard = module.get(AuthGuard);
    jwtService = module.get(JwtService);
  });

  it('should return true for valid token', () => {
    jwtService.verify.mockReturnValue({ userId: 1 });

    const context = createMockExecutionContext({
      headers: { authorization: 'Bearer valid-token' },
    });

    expect(guard.canActivate(context)).toBe(true);
  });
});

// Helper to create mock execution context
function createMockExecutionContext(request: any) {
  return {
    switchToHttp: () => ({
      getRequest: () => request,
    }),
  } as ExecutionContext;
}
```

---

## 📝 Summary

| Test Type | Purpose | Tools |
|-----------|---------|-------|
| **Unit** | Test isolated components | Jest mocks |
| **Integration** | Test module interactions | Real DB (in-memory) |
| **E2E** | Test full request flow | Supertest |

---

## 🔗 Next

- [04-dependency-injection.md](./04-dependency-injection.md) - ⭐ DI Deep Dive
