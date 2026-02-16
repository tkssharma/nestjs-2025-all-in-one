import { Controller, Get, Inject } from "@nestjs/common";
import { ApiTags, ApiOperation } from "@nestjs/swagger";
import { SingletonService } from "./services/singleton.service";
import { TransientService } from "./services/transient.service";
import { RequestScopedService } from "./services/request-scoped.service";
import { ConfigurableService } from "./services/configurable.service";

/**
 * ============================================================
 * DEPENDENCY INJECTION DEEP DIVE
 * ============================================================
 */

@ApiTags("DI Deep Dive")
@Controller("di")
export class DIDeepDiveController {
  constructor(
    private readonly singletonService: SingletonService,
    private readonly transientService: TransientService,
    private readonly requestScopedService: RequestScopedService,
    @Inject("APP_NAME") private readonly appName: string,
    @Inject("CONFIGURABLE_SERVICE")
    private readonly configurableService: ConfigurableService,
    @Inject("SINGLETON_ALIAS") private readonly singletonAlias: SingletonService
  ) {}

  @Get("scopes")
  @ApiOperation({ summary: "Compare all DI scopes" })
  compareScopes() {
    return {
      title: "DI Scopes Comparison",
      singleton: this.singletonService.getInfo(),
      transient: this.transientService.getInfo(),
      request: this.requestScopedService.getInfo(),
      tip: "Call this endpoint multiple times to see singleton incrementing, transient staying same, request changing",
    };
  }

  @Get("singleton")
  @ApiOperation({ summary: "Demo: Singleton scope (call multiple times)" })
  getSingleton() {
    return {
      instance1: this.singletonService.getInfo(),
      instance2: this.singletonAlias.getInfo(),
      areSame: this.singletonService === this.singletonAlias,
      explanation: "Both references point to the SAME instance",
    };
  }

  @Get("custom-tokens")
  @ApiOperation({ summary: "Demo: Custom injection tokens" })
  getCustomTokens() {
    return {
      appName: this.appName,
      configurableService: this.configurableService.getInfo(),
      tokenTypes: {
        classToken: "SingletonService - class itself is the token",
        stringToken: "'APP_NAME' - string identifier",
        symbolToken: 'Symbol("KEY") - unique identifier (recommended)',
      },
    };
  }

  @Get("provider-types")
  @ApiOperation({ summary: "Explain all provider types" })
  getProviderTypes() {
    return {
      title: "NestJS Provider Types",
      providers: {
        useClass: {
          description: "Standard class instantiation",
          example: "{ provide: UserService, useClass: UserService }",
          shorthand: "Just UserService in providers array",
        },
        useValue: {
          description: "Inject a static value",
          example: "{ provide: 'CONFIG', useValue: { debug: true } }",
          useCase: "Constants, configuration objects, mock data",
        },
        useFactory: {
          description: "Dynamic creation with dependencies",
          example: `{
            provide: 'DATABASE',
            useFactory: (config: ConfigService) => {
              return new Database(config.get('DB_URL'));
            },
            inject: [ConfigService],
          }`,
          useCase: "Async initialization, conditional logic",
        },
        useExisting: {
          description: "Alias to another provider",
          example: "{ provide: 'ALIAS', useExisting: RealService }",
          useCase: "Multiple tokens for same instance",
        },
      },
    };
  }

  @Get("circular-deps")
  @ApiOperation({ summary: "Explain circular dependency solutions" })
  getCircularDeps() {
    return {
      title: "Circular Dependency Solutions",
      problem: "ServiceA needs ServiceB, ServiceB needs ServiceA",
      solutions: {
        forwardRef: {
          description: "Defer resolution until both classes are defined",
          code: `
            @Injectable()
            export class ServiceA {
              constructor(
                @Inject(forwardRef(() => ServiceB))
                private serviceB: ServiceB,
              ) {}
            }
          `,
          when: "Both services truly need each other",
        },
        refactor: {
          description: "Extract shared logic to third service",
          code: `
            // Instead of A <-> B
            // Use A -> Shared <- B
          `,
          when: "Circle indicates design problem",
        },
        events: {
          description: "Use EventEmitter for loose coupling",
          code: `
            // ServiceA emits event
            this.eventEmitter.emit('user.created', user);
            
            // ServiceB listens
            @OnEvent('user.created')
            handleUserCreated(user: User) {}
          `,
          when: "Services need to react to each other",
        },
      },
      bestPractice: "Circular deps are often a design smell. Refactor first.",
    };
  }

  @Get("injection-explained")
  @ApiOperation({ summary: "How injection actually works" })
  getInjectionExplained() {
    return {
      title: "How DI Actually Works in NestJS",
      steps: [
        {
          step: 1,
          name: "Metadata Reading",
          description: "Read constructor parameter types via reflect-metadata",
          code: "Reflect.getMetadata('design:paramtypes', MyController)",
        },
        {
          step: 2,
          name: "Token Resolution",
          description: "Map each parameter type to a provider token",
          note: "Class type = token, unless @Inject() overrides",
        },
        {
          step: 3,
          name: "Dependency Check",
          description: "Ensure all dependencies are available in scope",
          error: "Nest can't resolve dependencies of...",
        },
        {
          step: 4,
          name: "Instance Creation",
          description: "Create instances in topological order",
          note: "Dependencies first, then dependents",
        },
        {
          step: 5,
          name: "Injection",
          description: "Pass instances to constructor",
        },
      ],
      requirements: {
        emitDecoratorMetadata: "Must be true in tsconfig.json",
        reflectMetadata: "reflect-metadata polyfill must be imported",
        injectable: "Class must have @Injectable() decorator",
      },
    };
  }
}
