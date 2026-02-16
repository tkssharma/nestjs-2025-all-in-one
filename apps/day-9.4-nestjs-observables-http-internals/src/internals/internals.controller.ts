import { Controller, Get } from "@nestjs/common";
import { ApiTags, ApiOperation } from "@nestjs/swagger";

/**
 * ============================================================
 * NESTJS UNDER THE HOOD
 * ============================================================
 *
 * This controller explains what happens internally when
 * NestJS processes a request.
 *
 * ============================================================
 */

@ApiTags("Internals")
@Controller("internals")
export class InternalsController {
  @Get("bootstrap")
  @ApiOperation({ summary: "Explain main.ts bootstrap process" })
  getBootstrapExplanation() {
    return {
      title: "main.ts Bootstrap - What Happens",
      code: `
        async function bootstrap() {
          const app = await NestFactory.create(AppModule);
          await app.listen(3000);
        }
        bootstrap();
      `,
      steps: {
        step1_create: {
          description: "NestFactory.create(AppModule)",
          details: [
            "Scans AppModule and all imported modules recursively",
            "Builds a module dependency tree",
            "Creates the DI (Dependency Injection) container",
            "Registers all providers with their tokens",
            "Analyzes constructor dependencies",
          ],
        },
        step2_di_container: {
          description: "DI Container Creation",
          details: [
            "Creates a central registry of all providers",
            "Maps injection tokens to provider definitions",
            "Determines instantiation order (topological sort)",
            "Handles scopes (singleton, transient, request)",
          ],
        },
        step3_instantiation: {
          description: "Provider Instantiation",
          details: [
            "Creates instances in dependency order",
            "Injects dependencies into constructors",
            "Caches singleton instances",
            "Sets up lazy providers if any",
          ],
        },
        step4_controllers: {
          description: "Controller Registration",
          details: [
            "Maps routes from @Controller and @Get/@Post/etc.",
            "Associates handlers with HTTP methods/paths",
            "Registers route metadata (guards, pipes, interceptors)",
          ],
        },
        step5_lifecycle: {
          description: "Lifecycle Hooks",
          details: [
            "Calls onModuleInit() on all providers",
            "Calls onApplicationBootstrap() after all modules init",
          ],
        },
        step6_listen: {
          description: "app.listen(port)",
          details: [
            "Creates HTTP adapter (Express/Fastify)",
            "Configures routes on the adapter",
            "Starts accepting connections",
          ],
        },
      },
    };
  }

  @Get("di-container")
  @ApiOperation({ summary: "Explain Dependency Injection Container" })
  getDIContainerExplanation() {
    return {
      title: "NestJS Dependency Injection Container",
      whatIs:
        "A central registry that manages object creation and dependencies",
      howItWorks: {
        step1: "Scan all @Injectable() classes",
        step2: "Analyze constructor parameters",
        step3: "Build dependency graph",
        step4: "Determine instantiation order",
        step5: "Create instances and inject dependencies",
        step6: "Cache singletons for reuse",
      },
      injectionTokens: {
        classToken: "The class itself (most common)",
        stringToken: "Custom string identifier",
        symbolToken: "Unique symbol identifier",
        example: `
          // Class token (default)
          constructor(private userService: UserService) {}
          
          // Custom token
          constructor(@Inject('CONFIG') private config: Config) {}
          
          // Symbol token
          const TOKEN = Symbol('TOKEN');
          constructor(@Inject(TOKEN) private value: any) {}
        `,
      },
      scopes: {
        singleton: {
          description: "One instance shared across entire app (default)",
          when: "Stateless services, utilities",
        },
        transient: {
          description: "New instance for each injection",
          when: "Stateful services that need isolation",
        },
        request: {
          description: "New instance for each HTTP request",
          when: "Request-specific data (user context)",
        },
      },
    };
  }

  @Get("request-flow")
  @ApiOperation({ summary: "Explain request flow through NestJS" })
  getRequestFlowExplanation() {
    return {
      title: "What Happens When a Request Hits NestJS",
      diagram: `
        ┌─────────────────────────────────────────────────────────────┐
        │                    HTTP Request Arrives                      │
        │                 (GET /users/123)                            │
        └─────────────────────────────────────────────────────────────┘
                                    ↓
        ┌─────────────────────────────────────────────────────────────┐
        │              1. MIDDLEWARE                                   │
        │   - Runs first, has access to req, res, next                │
        │   - Examples: logging, CORS, body parsing                    │
        │   - No knowledge of which handler will be called            │
        └─────────────────────────────────────────────────────────────┘
                                    ↓
        ┌─────────────────────────────────────────────────────────────┐
        │              2. GUARDS                                       │
        │   - Determines if request should proceed                     │
        │   - Has ExecutionContext (knows the handler)                │
        │   - Returns true/false or throws exception                   │
        │   - Examples: AuthGuard, RolesGuard                         │
        └─────────────────────────────────────────────────────────────┘
                                    ↓
        ┌─────────────────────────────────────────────────────────────┐
        │              3. INTERCEPTORS (Before)                        │
        │   - Wraps handler using RxJS Observable                      │
        │   - Can transform request before handler                     │
        │   - Examples: logging start time                             │
        └─────────────────────────────────────────────────────────────┘
                                    ↓
        ┌─────────────────────────────────────────────────────────────┐
        │              4. PIPES                                        │
        │   - Transform and validate input data                        │
        │   - Runs on each parameter (@Body, @Param, @Query)          │
        │   - Examples: ValidationPipe, ParseIntPipe                   │
        └─────────────────────────────────────────────────────────────┘
                                    ↓
        ┌─────────────────────────────────────────────────────────────┐
        │              5. ROUTE HANDLER                                │
        │   - Your controller method executes                          │
        │   - Business logic runs                                      │
        │   - Returns response (or Observable/Promise)                 │
        └─────────────────────────────────────────────────────────────┘
                                    ↓
        ┌─────────────────────────────────────────────────────────────┐
        │              6. INTERCEPTORS (After)                         │
        │   - Transforms response using RxJS operators                 │
        │   - Can modify, cache, log response                          │
        │   - Examples: TransformInterceptor, CacheInterceptor         │
        └─────────────────────────────────────────────────────────────┘
                                    ↓
        ┌─────────────────────────────────────────────────────────────┐
        │              7. EXCEPTION FILTERS                            │
        │   - Catches errors thrown anywhere in the flow              │
        │   - Formats error response                                   │
        │   - Examples: HttpExceptionFilter                            │
        └─────────────────────────────────────────────────────────────┘
                                    ↓
        ┌─────────────────────────────────────────────────────────────┐
        │                    HTTP Response Sent                        │
        │                 { "id": 123, "name": "John" }               │
        └─────────────────────────────────────────────────────────────┘
      `,
      order: [
        "1. Middleware",
        "2. Guards",
        "3. Interceptors (before)",
        "4. Pipes",
        "5. Handler (controller method)",
        "6. Interceptors (after)",
        "7. Exception Filters (if error)",
      ],
      keyInsights: [
        "Middleware has NO knowledge of which handler will run",
        "Guards CAN access handler metadata via Reflector",
        "Interceptors wrap the handler like an onion",
        "Pipes run on EACH decorated parameter",
        "Exception filters catch errors from ANY layer",
      ],
    };
  }

  @Get("module-system")
  @ApiOperation({ summary: "Explain NestJS module system" })
  getModuleSystemExplanation() {
    return {
      title: "NestJS Module System",
      whatIsModule:
        "A class decorated with @Module() that organizes related functionality",
      moduleMetadata: {
        imports: "Other modules this module depends on",
        controllers: "Controllers defined in this module",
        providers: "Services/providers available in this module",
        exports: "Providers to share with importing modules",
      },
      moduleTypes: {
        featureModule: {
          description:
            "Organizes a specific feature (UsersModule, OrdersModule)",
          example: `
            @Module({
              controllers: [UsersController],
              providers: [UsersService],
              exports: [UsersService],
            })
            export class UsersModule {}
          `,
        },
        sharedModule: {
          description: "Provides reusable functionality",
          example: "DatabaseModule, LoggingModule",
        },
        globalModule: {
          description: "Available everywhere without importing",
          example: `
            @Global()
            @Module({
              providers: [ConfigService],
              exports: [ConfigService],
            })
            export class ConfigModule {}
          `,
        },
        dynamicModule: {
          description: "Configurable module with forRoot/forRootAsync",
          example: `
            @Module({})
            export class DatabaseModule {
              static forRoot(options: DbOptions): DynamicModule {
                return {
                  module: DatabaseModule,
                  providers: [
                    { provide: 'DB_OPTIONS', useValue: options },
                    DatabaseService,
                  ],
                  exports: [DatabaseService],
                };
              }
            }
          `,
        },
      },
    };
  }

  @Get("decorators")
  @ApiOperation({ summary: "Explain how NestJS decorators work" })
  getDecoratorsExplanation() {
    return {
      title: "How NestJS Decorators Work",
      whatAreDecorators:
        "Functions that add metadata to classes, methods, or parameters",
      underTheHood: {
        explanation: "Decorators use Reflect.defineMetadata() to attach data",
        example: `
          // What @Controller('users') does internally:
          Reflect.defineMetadata('path', 'users', UsersController);
          
          // NestJS reads it later:
          const path = Reflect.getMetadata('path', UsersController);
        `,
      },
      commonDecorators: {
        classDecorators: [
          "@Module()",
          "@Controller()",
          "@Injectable()",
          "@Global()",
        ],
        methodDecorators: ["@Get()", "@Post()", "@UseGuards()", "@UsePipes()"],
        parameterDecorators: ["@Body()", "@Param()", "@Query()", "@Inject()"],
      },
      customDecorators: `
        // Creating a custom decorator
        export const User = createParamDecorator(
          (data: string, ctx: ExecutionContext) => {
            const request = ctx.switchToHttp().getRequest();
            return data ? request.user?.[data] : request.user;
          },
        );
        
        // Usage
        @Get('profile')
        getProfile(@User() user: UserEntity) {
          return user;
        }
      `,
    };
  }
}
