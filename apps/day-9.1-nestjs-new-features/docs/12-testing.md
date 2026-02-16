# 12. Testing Libraries

NestJS provides excellent testing support with built-in utilities and integration with popular testing frameworks.

---

## Tools

| Tool | Purpose |
|------|---------|
| **Jest** | Unit & integration testing |
| **Supertest** | HTTP testing |
| **Playwright** | E2E testing |
| **Testcontainers** | Container-based testing |

---

## NestJS Testing Module

### Installation
```bash
npm install -D @nestjs/testing jest @types/jest supertest @types/supertest
```

---

## Unit Testing

### Service Test
```ts
import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from './user.entity';

describe('UsersService', () => {
  let service: UsersService;
  let mockRepository: any;

  beforeEach(async () => {
    mockRepository = {
      find: jest.fn(),
      findOne: jest.fn(),
      save: jest.fn(),
      delete: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: getRepositoryToken(User),
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    it('should return array of users', async () => {
      const users = [{ id: 1, name: 'John' }];
      mockRepository.find.mockResolvedValue(users);

      const result = await service.findAll();

      expect(result).toEqual(users);
      expect(mockRepository.find).toHaveBeenCalled();
    });
  });

  describe('create', () => {
    it('should create a user', async () => {
      const dto = { name: 'John', email: 'john@test.com' };
      const user = { id: 1, ...dto };
      mockRepository.save.mockResolvedValue(user);

      const result = await service.create(dto);

      expect(result).toEqual(user);
      expect(mockRepository.save).toHaveBeenCalledWith(dto);
    });
  });
});
```

---

## Integration Testing

### Controller Test with Supertest
```ts
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';

describe('UsersController (e2e)', () => {
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

  describe('/users (GET)', () => {
    it('should return all users', () => {
      return request(app.getHttpServer())
        .get('/users')
        .expect(200)
        .expect((res) => {
          expect(Array.isArray(res.body)).toBe(true);
        });
    });
  });

  describe('/users (POST)', () => {
    it('should create a user', () => {
      return request(app.getHttpServer())
        .post('/users')
        .send({ name: 'John', email: 'john@test.com' })
        .expect(201)
        .expect((res) => {
          expect(res.body.name).toBe('John');
        });
    });

    it('should fail with invalid data', () => {
      return request(app.getHttpServer())
        .post('/users')
        .send({ name: '' })
        .expect(400);
    });
  });
});
```

---

## Mocking Dependencies

### Override Providers
```ts
const module = await Test.createTestingModule({
  imports: [UsersModule],
})
  .overrideProvider(UsersService)
  .useValue({
    findAll: jest.fn().mockResolvedValue([]),
    findOne: jest.fn().mockResolvedValue({ id: 1, name: 'Test' }),
  })
  .compile();
```

### Mock Guards
```ts
const module = await Test.createTestingModule({
  imports: [AppModule],
})
  .overrideGuard(JwtAuthGuard)
  .useValue({ canActivate: () => true })
  .compile();
```

---

## Testing with Database

### In-Memory SQLite
```ts
const module = await Test.createTestingModule({
  imports: [
    TypeOrmModule.forRoot({
      type: 'sqlite',
      database: ':memory:',
      entities: [User],
      synchronize: true,
    }),
    TypeOrmModule.forFeature([User]),
  ],
  providers: [UsersService],
}).compile();
```

### Testcontainers
```ts
import { PostgreSqlContainer } from '@testcontainers/postgresql';

describe('UsersService with PostgreSQL', () => {
  let container: StartedPostgreSqlContainer;

  beforeAll(async () => {
    container = await new PostgreSqlContainer().start();
    
    // Use container.getConnectionUri() for TypeORM config
  });

  afterAll(async () => {
    await container.stop();
  });
});
```

---

## Best Practices

1. **Isolate tests** - each test should be independent
2. **Use mocks** for external dependencies
3. **Test edge cases** and error scenarios
4. **Use factories** for test data
5. **Clean up after tests** - reset database state
6. **Run tests in CI/CD** pipeline
7. **Aim for high coverage** on critical paths
