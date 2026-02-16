# 9. Logging & Monitoring

NestJS provides flexible logging with support for popular logging libraries and monitoring tools.

---

## Logging Libraries

| Library | Features |
|---------|----------|
| **Winston** | Flexible, transports |
| **Pino** | Fast, JSON-based |
| **Bunyan** | JSON logging |

## Monitoring Tools

| Tool | Purpose |
|------|---------|
| **Prometheus** | Metrics collection |
| **OpenTelemetry** | Distributed tracing |
| **New Relic** | APM |
| **Datadog** | Full observability |

---

## Built-in Logger

```ts
import { Logger } from '@nestjs/common';

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);

  async create(dto: CreateUserDto) {
    this.logger.log(`Creating user: ${dto.email}`);
    this.logger.debug('Debug info', { dto });
    this.logger.warn('Warning message');
    this.logger.error('Error occurred', error.stack);
    this.logger.verbose('Verbose info');
  }
}
```

---

## Winston Integration

### Installation
```bash
npm install nest-winston winston
```

### Configuration
```ts
import { WinstonModule } from 'nest-winston';
import * as winston from 'winston';

@Module({
  imports: [
    WinstonModule.forRoot({
      transports: [
        new winston.transports.Console({
          format: winston.format.combine(
            winston.format.timestamp(),
            winston.format.colorize(),
            winston.format.printf(({ timestamp, level, message, context }) => {
              return `${timestamp} [${context}] ${level}: ${message}`;
            }),
          ),
        }),
        new winston.transports.File({
          filename: 'logs/error.log',
          level: 'error',
        }),
        new winston.transports.File({
          filename: 'logs/combined.log',
        }),
      ],
    }),
  ],
})
export class AppModule {}
```

### Usage
```ts
import { Inject } from '@nestjs/common';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { Logger } from 'winston';

@Injectable()
export class UsersService {
  constructor(
    @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger,
  ) {}

  create(dto: CreateUserDto) {
    this.logger.info('Creating user', { email: dto.email });
  }
}
```

---

## Pino Integration

### Installation
```bash
npm install nestjs-pino pino-http pino-pretty
```

### Configuration
```ts
import { LoggerModule } from 'nestjs-pino';

@Module({
  imports: [
    LoggerModule.forRoot({
      pinoHttp: {
        transport: {
          target: 'pino-pretty',
          options: {
            singleLine: true,
          },
        },
      },
    }),
  ],
})
export class AppModule {}

// main.ts
import { Logger } from 'nestjs-pino';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { bufferLogs: true });
  app.useLogger(app.get(Logger));
}
```

---

## Request Logging Middleware

```ts
@Injectable()
export class LoggingMiddleware implements NestMiddleware {
  private readonly logger = new Logger('HTTP');

  use(req: Request, res: Response, next: NextFunction) {
    const { method, originalUrl } = req;
    const start = Date.now();

    res.on('finish', () => {
      const { statusCode } = res;
      const duration = Date.now() - start;
      this.logger.log(`${method} ${originalUrl} ${statusCode} - ${duration}ms`);
    });

    next();
  }
}
```

---

## Prometheus Metrics

### Installation
```bash
npm install @willsoto/nestjs-prometheus prom-client
```

### Setup
```ts
import { PrometheusModule } from '@willsoto/nestjs-prometheus';

@Module({
  imports: [
    PrometheusModule.register({
      path: '/metrics',
      defaultMetrics: { enabled: true },
    }),
  ],
})
export class AppModule {}
```

### Custom Metrics
```ts
import { Counter, Histogram } from 'prom-client';
import { InjectMetric } from '@willsoto/nestjs-prometheus';

@Injectable()
export class MetricsService {
  constructor(
    @InjectMetric('http_requests_total')
    private requestsCounter: Counter<string>,
    @InjectMetric('http_request_duration')
    private requestDuration: Histogram<string>,
  ) {}

  incrementRequests(method: string, path: string, status: number) {
    this.requestsCounter.inc({ method, path, status });
  }
}
```

---

## OpenTelemetry

### Installation
```bash
npm install @opentelemetry/sdk-node @opentelemetry/auto-instrumentations-node
```

### Setup
```ts
// tracing.ts
import { NodeSDK } from '@opentelemetry/sdk-node';
import { getNodeAutoInstrumentations } from '@opentelemetry/auto-instrumentations-node';

const sdk = new NodeSDK({
  serviceName: 'my-nestjs-app',
  instrumentations: [getNodeAutoInstrumentations()],
});

sdk.start();
```

---

## Best Practices

1. **Use structured logging** (JSON) for production
2. **Include correlation IDs** for request tracing
3. **Log at appropriate levels** - don't over-log
4. **Rotate log files** to prevent disk issues
5. **Use async logging** to avoid blocking
6. **Redact sensitive data** (passwords, tokens)
7. **Monitor key metrics** (latency, errors, throughput)
