# NestJS Core Libraries Overview

> Understanding the @nestjs/* ecosystem and how packages work together

---

## 🎯 What You'll Learn

- Overview of all @nestjs/* packages
- Role of each core library
- How libraries connect together

---

## Topic 1.1: Core Packages Overview

| Package | Purpose |
|---------|---------|
| `@nestjs/core` | Core functionality, DI container, application context |
| `@nestjs/common` | Decorators, pipes, guards, interceptors, exceptions |
| `@nestjs/platform-express` | Express adapter (default HTTP platform) |
| `@nestjs/platform-fastify` | Fastify adapter (alternative HTTP platform) |
| `@nestjs/testing` | Testing utilities and module compilation |
| `@nestjs/microservices` | Microservices support (TCP, Redis, NATS, RabbitMQ) |
| `@nestjs/websockets` | WebSocket support with Socket.io/WS |
| `@nestjs/graphql` | GraphQL integration |
| `@nestjs/typeorm` | TypeORM database integration |
| `@nestjs/mongoose` | MongoDB/Mongoose integration |
| `@nestjs/config` | Configuration management |
| `@nestjs/swagger` | OpenAPI/Swagger documentation |

---

## Topic 1.2: @nestjs/core - The Heart of NestJS

```typescript
import {
  NestFactory,           // Application factory
  NestApplication,       // Application instance
  ModuleRef,             // Module reference for dynamic providers
  Reflector,             // Metadata reflection utility
} from '@nestjs/core';
```

### NestFactory

```typescript
// main.ts - Bootstrap application
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  // Standard HTTP application
  const app = await NestFactory.create(AppModule);
  
  // With options
  const app = await NestFactory.create(AppModule, {
    logger: ['error', 'warn', 'log'],
    cors: true,
  });

  // Microservice
  const microservice = await NestFactory.createMicroservice(AppModule, {
    transport: Transport.TCP,
  });

  // Standalone (no HTTP)
  const standalone = await NestFactory.createApplicationContext(AppModule);
  
  await app.listen(3000);
}
```

### ModuleRef

```typescript
@Injectable()
export class DynamicService {
  constructor(private moduleRef: ModuleRef) {}

  getService() {
    // Get provider at runtime
    return this.moduleRef.get(UserService);
  }

  async resolveScoped(contextId: ContextId) {
    // Resolve request-scoped provider
    return this.moduleRef.resolve(RequestService, contextId);
  }
}
```

### Reflector

```typescript
@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    // Read metadata set by decorators
    const roles = this.reflector.get<string[]>('roles', context.getHandler());
    return roles?.includes(user.role);
  }
}
```

---

## Topic 1.3: @nestjs/common - Decorators & Utilities

```typescript
import {
  // Module & Injectable
  Module, Injectable, Controller,
  
  // HTTP Decorators
  Get, Post, Put, Delete, Patch,
  Body, Query, Param, Headers,
  
  // Lifecycle Hooks
  OnModuleInit, OnModuleDestroy,
  OnApplicationBootstrap, OnApplicationShutdown,
  
  // Enhancers
  UseGuards, UsePipes, UseInterceptors, UseFilters,
  
  // DI
  Inject, Optional, forwardRef,
  
  // Scope
  Scope,
} from '@nestjs/common';
```

---

## Topic 1.4: Platform Adapters

### Express (Default)

```typescript
import { NestFactory } from '@nestjs/core';
import { ExpressAdapter } from '@nestjs/platform-express';
import * as express from 'express';

const server = express();
const app = await NestFactory.create(AppModule, new ExpressAdapter(server));
```

### Fastify (Alternative)

```typescript
import { NestFactory } from '@nestjs/core';
import { FastifyAdapter } from '@nestjs/platform-fastify';

const app = await NestFactory.create(AppModule, new FastifyAdapter());
await app.listen(3000, '0.0.0.0'); // Fastify requires host
```

---

## 📝 Summary

- **@nestjs/core** - DI container, NestFactory, ModuleRef, Reflector
- **@nestjs/common** - All decorators and utilities
- **Platform adapters** - Express or Fastify for HTTP layer
- **Integration packages** - Database, GraphQL, microservices, etc.

---

## 🔗 Next

- [02-testing-library.md](./02-testing-library.md) - Testing architecture
