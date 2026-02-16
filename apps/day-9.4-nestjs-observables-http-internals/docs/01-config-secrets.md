# Config & Secrets Management

## ConfigModule Basics

```typescript
// app.module.ts
@Module({
  imports: [
    ConfigModule.forRoot(), // loads .env file
  ],
})
```

### With Options

```typescript
ConfigModule.forRoot({
  isGlobal: true,           // Available everywhere
  envFilePath: '.env',       // Custom path
  ignoreEnvFile: false,      // Set true in production
  cache: true,               // Cache env vars
  expandVariables: true,     // Support ${VAR} syntax
})
```

### Usage

```typescript
constructor(private configService: ConfigService) {}

// Get value
const dbHost = this.configService.get<string>('DB_HOST');

// With default
const port = this.configService.get<number>('PORT', 3000);

// Required (throws if missing)
const secret = this.configService.getOrThrow<string>('JWT_SECRET');
```

---

## Typed Configuration (Recommended)

### Step 1: Create Config Schema

```typescript
// config/database.config.ts
import { registerAs } from '@nestjs/config';

export default registerAs('database', () => ({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT, 10) || 5432,
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
}));
```

### Step 2: Load Config

```typescript
// app.module.ts
import databaseConfig from './config/database.config';

ConfigModule.forRoot({
  load: [databaseConfig],
})
```

### Step 3: Use Typed Config

```typescript
import { ConfigType } from '@nestjs/config';
import databaseConfig from './config/database.config';

constructor(
  @Inject(databaseConfig.KEY)
  private dbConfig: ConfigType<typeof databaseConfig>,
) {
  // Fully typed!
  console.log(this.dbConfig.host);  // string
  console.log(this.dbConfig.port);  // number
}
```

**Benefits:**
- Type safety at compile time
- IntelliSense support
- Centralized config per feature
- Easy to test with mocks

---

## Config Validation at Startup

### Using Joi

```typescript
import * as Joi from 'joi';

ConfigModule.forRoot({
  validationSchema: Joi.object({
    NODE_ENV: Joi.string()
      .valid('development', 'production', 'test')
      .default('development'),
    PORT: Joi.number().default(3000),
    DB_HOST: Joi.string().required(),
    DB_PORT: Joi.number().required(),
    JWT_SECRET: Joi.string().min(32).required(),
  }),
  validationOptions: {
    abortEarly: true,
    allowUnknown: true,
  },
})
```

### Using class-validator

```typescript
// env.validation.ts
import { plainToInstance } from 'class-transformer';
import { IsEnum, IsNumber, IsString, validateSync } from 'class-validator';

enum Environment {
  Development = 'development',
  Production = 'production',
  Test = 'test',
}

class EnvironmentVariables {
  @IsEnum(Environment)
  NODE_ENV: Environment;

  @IsNumber()
  PORT: number;

  @IsString()
  DB_HOST: string;
}

export function validate(config: Record<string, unknown>) {
  const validated = plainToInstance(EnvironmentVariables, config, {
    enableImplicitConversion: true,
  });
  const errors = validateSync(validated);
  if (errors.length > 0) {
    throw new Error(errors.toString());
  }
  return validated;
}

// app.module.ts
ConfigModule.forRoot({ validate })
```

---

## Secrets Management Strategies

### Level 1: Environment Files (Development)

```
.env, .env.local, .env.development
```

- ✅ Simple, quick to set up
- ❌ Not secure for production
- ⚠️ Add `.env*` to `.gitignore`

### Level 2: System Environment Variables

```bash
export JWT_SECRET=xxx
```

- ✅ No files to manage
- ❌ Manual management, no rotation

### Level 3: Cloud Secrets Manager (Recommended)

**Options:** AWS Secrets Manager, Google Secret Manager, Azure Key Vault, HashiCorp Vault

```typescript
// AWS Secrets Manager integration
import { SecretsManager } from '@aws-sdk/client-secrets-manager';

ConfigModule.forRoot({
  load: [async () => {
    const client = new SecretsManager({ region: 'us-east-1' });
    const secret = await client.getSecretValue({
      SecretId: 'myapp/production',
    });
    return JSON.parse(secret.SecretString);
  }],
})
```

- ✅ Encryption at rest
- ✅ Access control
- ✅ Audit logs
- ✅ Automatic rotation

### Level 4: Kubernetes Secrets

```bash
kubectl create secret generic myapp-secrets --from-literal=JWT_SECRET=xxx
```

---

## Multi-Environment Configuration

### Structure

```
config/
├── configuration.ts
├── database.config.ts
├── auth.config.ts
└── environments/
    ├── development.ts
    ├── production.ts
    └── test.ts
```

### Environment-Specific Files

```typescript
ConfigModule.forRoot({
  envFilePath: [
    `.env.${process.env.NODE_ENV}.local`,
    `.env.${process.env.NODE_ENV}`,
    '.env.local',
    '.env',
  ],
})
```

**Precedence (highest to lowest):**
1. `.env.{NODE_ENV}.local`
2. `.env.{NODE_ENV}`
3. `.env.local`
4. `.env`

---

## Best Practices

| Rule | How |
|------|-----|
| Never commit secrets | Add `.env*` to `.gitignore`, use `.env.example` |
| Validate at startup | Use Joi or class-validator to fail fast |
| Type your config | Use `registerAs()` and `ConfigType<>` |
| Different secrets per env | Separate secrets for dev/staging/prod |
| Rotate secrets regularly | Use secrets manager with rotation policies |
| Minimize secret exposure | Only inject secrets where needed |

### Anti-Patterns

- ❌ Hardcoding secrets in code
- ❌ Logging secrets (even accidentally)
- ❌ Sharing secrets via Slack/email
- ❌ Using same secrets across environments
- ❌ Not rotating after employee leaves
