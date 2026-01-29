# 📹 Video 5: NestJS Under the Hood - Internals

> Understanding the bootstrap process and request lifecycle

---

## 🎯 What You'll Learn

- Application bootstrap process
- Request lifecycle flow
- Metadata reflection system
- How decorators work internally

---

## Topic 5.1: Application Bootstrap Process

```
┌─────────────────────────────────────────────────────────────────┐
│                    NestFactory.create()                          │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│  1. Create NestContainer (DI Container)                         │
│     - Holds all module instances                                 │
│     - Manages provider lifecycle                                 │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│  2. DependenciesScanner                                         │
│     - Recursively scan all modules                              │
│     - Collect metadata from decorators                          │
│     - Build dependency graph                                     │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│  3. InstanceLoader                                              │
│     - Resolve dependencies (topological sort)                   │
│     - Inject into constructors                                  │
│     - Handle circular dependencies                              │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│  4. RoutesResolver                                              │
│     - Scan controllers for route metadata                       │
│     - Register routes with HTTP adapter                         │
│     - Apply middleware, guards, interceptors                    │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│  5. Application Ready                                           │
│     - Call OnModuleInit hooks                                   │
│     - Call OnApplicationBootstrap hooks                         │
│     - Start listening on port                                   │
└─────────────────────────────────────────────────────────────────┘
```

---

## Topic 5.2: Request Lifecycle Flow

```
HTTP Request
     │
     ▼
┌─────────────┐
│ Middleware  │ ──▶ Can modify request/response, call next()
└─────────────┘
     │
     ▼
┌─────────────┐
│   Guards    │ ──▶ Return true/false, determines if request proceeds
└─────────────┘
     │
     ▼
┌─────────────┐
│Interceptors │ ──▶ PRE-controller logic (before handler)
│   (Pre)     │
└─────────────┘
     │
     ▼
┌─────────────┐
│   Pipes     │ ──▶ Transform/validate incoming data
└─────────────┘
     │
     ▼
┌─────────────┐
│ Controller  │ ──▶ Route handler executes
│  Handler    │
└─────────────┘
     │
     ▼
┌─────────────┐
│Interceptors │ ──▶ POST-controller logic (after handler)
│   (Post)    │
└─────────────┘
     │
     ▼
┌─────────────┐
│ Exception   │ ──▶ Catches and handles exceptions
│  Filters    │
└─────────────┘
     │
     ▼
HTTP Response
```

---

## Topic 5.3: Metadata Reflection System

### How Decorators Store Metadata

```typescript
// TypeScript decorator compiles to Reflect.defineMetadata calls
function Controller(prefix: string): ClassDecorator {
  return (target: Function) => {
    Reflect.defineMetadata('path', prefix, target);
    Reflect.defineMetadata('isController', true, target);
  };
}

function Get(path: string): MethodDecorator {
  return (target, propertyKey, descriptor) => {
    Reflect.defineMetadata('path', path, target, propertyKey);
    Reflect.defineMetadata('method', 'GET', target, propertyKey);
  };
}

// TypeScript also emits design:paramtypes for DI
@Injectable()
class UserService {
  constructor(repo: UserRepository) {}
}
// Emits: Reflect.defineMetadata('design:paramtypes', [UserRepository], UserService)
```

### How NestJS Reads Metadata

```typescript
class RouteExplorer {
  explore(controller: Type<any>) {
    const controllerPath = Reflect.getMetadata('path', controller);
    const prototype = controller.prototype;
    
    const methods = Object.getOwnPropertyNames(prototype);
    
    return methods.map((methodName) => {
      const path = Reflect.getMetadata('path', prototype, methodName);
      const httpMethod = Reflect.getMetadata('method', prototype, methodName);
      
      return {
        fullPath: `${controllerPath}/${path}`,
        method: httpMethod,
        handler: prototype[methodName],
      };
    });
  }
}
```

---

## Topic 5.4: DI Container Internals

```typescript
// Simplified NestJS container
class Container {
  private providers = new Map<any, Provider>();
  private instances = new Map<any, any>();

  register(token: any, provider: Provider) {
    this.providers.set(token, provider);
  }

  resolve<T>(token: any): T {
    // Check cache (singleton)
    if (this.instances.has(token)) {
      return this.instances.get(token);
    }

    const provider = this.providers.get(token);
    
    // Get constructor params via reflection
    const deps = Reflect.getMetadata('design:paramtypes', provider.useClass) || [];
    
    // Recursively resolve dependencies
    const resolvedDeps = deps.map(dep => this.resolve(dep));
    
    // Create instance
    const instance = new provider.useClass(...resolvedDeps);
    
    // Cache (singleton scope)
    this.instances.set(token, instance);
    
    return instance;
  }
}
```

---

## Topic 5.5: Lifecycle Hooks

```typescript
@Injectable()
export class DatabaseService implements 
  OnModuleInit, 
  OnApplicationBootstrap,
  OnModuleDestroy,
  OnApplicationShutdown {
  
  async onModuleInit() {
    // Called after module's providers instantiated
    console.log('Module initialized');
  }

  async onApplicationBootstrap() {
    // Called after all modules initialized
    await this.connect();
  }

  async onModuleDestroy() {
    // Called when module is being destroyed
    console.log('Module destroying');
  }

  async onApplicationShutdown(signal?: string) {
    // Called on app shutdown (SIGTERM, etc.)
    await this.disconnect();
  }
}

// Enable shutdown hooks in main.ts
app.enableShutdownHooks();
```

---

## 📝 Summary

| Phase | What Happens |
|-------|-------------|
| **Bootstrap** | Container → Scanner → InstanceLoader → RoutesResolver |
| **Request** | Middleware → Guards → Interceptors → Pipes → Handler → Interceptors → Filters |
| **Metadata** | Decorators use Reflect API to store/read metadata |
| **Lifecycle** | onModuleInit → onApplicationBootstrap → onModuleDestroy → onApplicationShutdown |

---

## 🔗 Next

- [06-building-blocks.md](./06-building-blocks.md) - Core building blocks
