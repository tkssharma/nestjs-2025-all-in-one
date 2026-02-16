# Dependency Injection Deep Dive

## Provider Scopes

### Singleton (Default)

```typescript
@Injectable()
export class SingletonService {
  // One instance shared across entire application
  // Created once when module loads
  // Lives forever (until app shuts down)
}
```

**Best for:** Stateless services, utilities, database connections

### Transient

```typescript
@Injectable({ scope: Scope.TRANSIENT })
export class TransientService {
  // New instance for EACH injection
  // If ServiceA and ServiceB both inject this, they get different instances
}
```

**Best for:** Stateful helpers, builders, temporary state

### Request

```typescript
@Injectable({ scope: Scope.REQUEST })
export class RequestScopedService {
  constructor(@Inject(REQUEST) private request: Request) {}
  // New instance for EACH HTTP request
  // Can inject REQUEST object
  // Garbage collected after response
}
```

**Best for:** Request-specific state, user context, multi-tenancy

⚠️ **Warning:** Request scope is slower than singleton (creates new instances)

---

## Provider Types

### useClass (Standard)

```typescript
{ provide: UserService, useClass: UserService }
// Shorthand: just UserService in providers array
```

### useValue (Static Value)

```typescript
{ provide: 'CONFIG', useValue: { debug: true } }
```

**Use case:** Constants, configuration objects, mock data

### useFactory (Dynamic Creation)

```typescript
{
  provide: 'DATABASE',
  useFactory: (config: ConfigService) => {
    return new Database(config.get('DB_URL'));
  },
  inject: [ConfigService],
}
```

**Use case:** Async initialization, conditional logic

### useExisting (Alias)

```typescript
{ provide: 'ALIAS', useExisting: RealService }
```

**Use case:** Multiple tokens for same instance

---

## Injection Tokens

### Class Token (Default)

```typescript
constructor(private userService: UserService) {}
```

### String Token

```typescript
constructor(@Inject('CONFIG') private config: Config) {}
```

### Symbol Token (Safest)

```typescript
const DATABASE_TOKEN = Symbol('DATABASE');
constructor(@Inject(DATABASE_TOKEN) private db: Database) {}
```

---

## How Injection Actually Works

1. **Metadata Reading** - Read constructor parameter types via `reflect-metadata`
   ```typescript
   Reflect.getMetadata('design:paramtypes', MyController)
   ```

2. **Token Resolution** - Map each parameter type to a provider token

3. **Dependency Check** - Ensure all dependencies are available in scope
   ```
   Error: Nest can't resolve dependencies of...
   ```

4. **Instance Creation** - Create instances in topological order (dependencies first)

5. **Injection** - Pass instances to constructor

### Requirements

```json
// tsconfig.json
{
  "compilerOptions": {
    "emitDecoratorMetadata": true,
    "experimentalDecorators": true
  }
}
```

---

## Circular Dependencies

### Problem

```typescript
// ServiceA needs ServiceB
// ServiceB needs ServiceA
```

### Solution 1: forwardRef

```typescript
@Injectable()
export class ServiceA {
  constructor(
    @Inject(forwardRef(() => ServiceB))
    private serviceB: ServiceB,
  ) {}
}
```

### Solution 2: Refactor (Better)

```typescript
// Instead of A <-> B
// Use A -> Shared <- B
```

### Solution 3: Events (Loose Coupling)

```typescript
// ServiceA emits event
this.eventEmitter.emit('user.created', user);

// ServiceB listens
@OnEvent('user.created')
handleUserCreated(user: User) {}
```

💡 **Best Practice:** Circular deps are often a design smell. Refactor first.

---

## Advanced Patterns

### Optional Dependencies

```typescript
constructor(
  @Optional() @Inject('LOGGER') private logger?: Logger,
) {
  this.logger = logger || console;
}
```

### Self-Injection (Lazy)

```typescript
constructor(
  private moduleRef: ModuleRef,
) {}

async onModuleInit() {
  this.self = await this.moduleRef.resolve(MyService);
}
```

### Dynamic Provider Resolution

```typescript
const service = await this.moduleRef.resolve(MyService, contextId);
```
