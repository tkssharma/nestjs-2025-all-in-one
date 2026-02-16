# 1. HTTP & Web Frameworks

NestJS sits *on top of* HTTP frameworks using platform adapters.

---

## Supported Platforms

| Platform | Package | Use Case |
|----------|---------|----------|
| **Express** | `@nestjs/platform-express` | Ecosystem compatibility, middleware |
| **Fastify** | `@nestjs/platform-fastify` | High performance, low memory |

---

## How Integration Works

NestJS uses **platform adapters** to abstract the underlying HTTP framework:

```
┌──────────────────────────────────┐
│        NestJS Controllers        │
│   @Get(), @Post(), @Body(), etc  │
└──────────────────────────────────┘
              │
              ▼
┌──────────────────────────────────┐
│       Platform Adapter           │
└──────────────────────────────────┘
              │
    ┌─────────┴─────────┐
    ▼                   ▼
┌─────────┐       ┌─────────┐
│ Express │       │ Fastify │
└─────────┘       └─────────┘
```

---

## Express (Default)

### Installation
```bash
npm install @nestjs/platform-express
```

### Usage
```ts
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  await app.listen(3000);
}
bootstrap();
```

### Access Express Instance
```ts
import { ExpressAdapter } from '@nestjs/platform-express';
import * as express from 'express';

const server = express();
const app = await NestFactory.create(
  AppModule,
  new ExpressAdapter(server)
);

// Access Express app
const expressApp = app.getHttpAdapter().getInstance();
```

### Use Express Middleware
```ts
import * as helmet from 'helmet';
import * as compression from 'compression';

app.use(helmet());
app.use(compression());
```

---

## Fastify (High Performance)

### Installation
```bash
npm install @nestjs/platform-fastify fastify
```

### Usage
```ts
import { NestFactory } from '@nestjs/core';
import { FastifyAdapter, NestFastifyApplication } from '@nestjs/platform-fastify';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter()
  );
  await app.listen(3000, '0.0.0.0');
}
bootstrap();
```

### Fastify Options
```ts
const app = await NestFactory.create<NestFastifyApplication>(
  AppModule,
  new FastifyAdapter({
    logger: true,
    trustProxy: true,
    maxParamLength: 200,
  })
);
```

### Use Fastify Plugins
```ts
import fastifyHelmet from '@fastify/helmet';
import fastifyCompress from '@fastify/compress';

await app.register(fastifyHelmet);
await app.register(fastifyCompress);
```

---

## Comparison

| Feature | Express | Fastify |
|---------|---------|---------|
| **Performance** | Good | Excellent |
| **Memory** | Higher | Lower |
| **Ecosystem** | Massive | Growing |
| **Middleware** | Abundant | Via plugins |
| **Learning Curve** | Familiar | Slight learning |
| **JSON Parsing** | Standard | Schema-based (faster) |

---

## When to Use Which?

### Choose Express When:
- You need specific Express middleware
- Team is familiar with Express
- Using legacy Express code
- Maximum ecosystem compatibility

### Choose Fastify When:
- Performance is critical
- High throughput requirements
- Memory constraints
- Building new projects

---

## Platform-Agnostic Code

The beauty of NestJS is that **your controllers work the same** regardless of platform:

```ts
@Controller('users')
export class UsersController {
  @Get()
  findAll() {
    return this.usersService.findAll();
  }

  @Post()
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }
}
```

> Switch platforms by changing **one line** in `main.ts`!

---

## Raw Request/Response Access

When you need platform-specific features:

### Express
```ts
import { Request, Response } from 'express';

@Get()
findAll(@Req() req: Request, @Res() res: Response) {
  res.status(200).json({ message: 'Hello' });
}
```

### Fastify
```ts
import { FastifyRequest, FastifyReply } from 'fastify';

@Get()
findAll(@Req() req: FastifyRequest, @Res() reply: FastifyReply) {
  reply.status(200).send({ message: 'Hello' });
}
```

---

## Best Practices

1. **Avoid platform-specific code** in controllers when possible
2. **Use interceptors** instead of raw response manipulation
3. **Wrap platform features** in services for testability
4. **Test on target platform** before deployment
