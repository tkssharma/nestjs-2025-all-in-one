import { Controller, Get } from "@nestjs/common";
import { ApiTags, ApiOperation } from "@nestjs/swagger";

/**
 * ============================================================
 * ADVANCED NESTJS INTERNALS
 * The stuff nobody usually explains
 * ============================================================
 */

@ApiTags("Advanced Internals")
@Controller("advanced")
export class AdvancedInternalsController {
  @Get("internals-nobody-explains")
  @ApiOperation({ summary: "NestJS Internals Nobody Explains" })
  getInternalsNobodyExplains() {
    return {
      title: "NestJS Internals Nobody Explains",
      sections: {
        "1_metadata_reflection": {
          title: "Metadata Reflection System",
          explanation:
            "NestJS relies heavily on TypeScript decorators and reflect-metadata",
          howItWorks: [
            "Decorators attach metadata to classes/methods/parameters",
            "NestJS reads this metadata at runtime",
            "reflect-metadata polyfill enables this",
            "This is why emitDecoratorMetadata must be true in tsconfig",
          ],
          example: `
            // What @Injectable() does internally:
            function Injectable() {
              return (target) => {
                Reflect.defineMetadata('injectable', true, target);
                // Also stores constructor param types
                const types = Reflect.getMetadata('design:paramtypes', target);
              };
            }
          `,
          gotcha: "Without reflect-metadata, DI breaks silently",
        },
        "2_module_compilation": {
          title: "Module Compilation Phase",
          explanation: 'Before your app runs, NestJS "compiles" your modules',
          phases: [
            {
              phase: "Discovery",
              action: "Scan all @Module() decorators recursively",
            },
            {
              phase: "Graph Building",
              action: "Build module dependency graph",
            },
            {
              phase: "Provider Resolution",
              action: "Determine which providers are available where",
            },
            {
              phase: "Instantiation",
              action: "Create instances in topological order",
            },
          ],
          notKnown: "This compilation is synchronous and blocks startup",
        },
        "3_injection_token_resolution": {
          title: "How Injection Tokens Actually Work",
          explanation: "Tokens are just identifiers in a Map",
          internals: `
            // Simplified version of what NestJS does:
            class Container {
              private providers = new Map<any, Provider>();
              
              register(token: any, provider: Provider) {
                this.providers.set(token, provider);
              }
              
              resolve<T>(token: any): T {
                const provider = this.providers.get(token);
                // Recursively resolve dependencies
                const deps = this.resolveDependencies(provider);
                return new provider.useClass(...deps);
              }
            }
          `,
          classTokens: "Class itself is the token (reference equality)",
          stringTokens: "String comparison (why duplicates are dangerous)",
          symbolTokens: "Guaranteed unique (safest for custom tokens)",
        },
        "4_circular_dependency_detection": {
          title: "Circular Dependency Detection",
          explanation: "NestJS detects circles during instantiation",
          howDetected: [
            "Track which providers are currently being instantiated",
            "If same token appears twice in chain, it's circular",
            "forwardRef() defers resolution to break the chain",
          ],
          theHack: "forwardRef returns a wrapper that NestJS unwraps later",
        },
        "5_scope_implementation": {
          title: "How Scopes Are Implemented",
          singleton: "Cached in container after first creation",
          transient: "Never cached, new instance every resolve()",
          request: {
            howItWorks: [
              "Uses AsyncLocalStorage (Node.js) or cls-hooked",
              "Creates a request-scoped container for each HTTP request",
              "Container is cleaned up after response",
            ],
            performance: "Request scope is slower than singleton",
          },
        },
        "6_enhancer_application": {
          title: "How Guards/Pipes/Interceptors Are Applied",
          order: [
            "Read metadata from handler and class",
            "Merge global + controller + method enhancers",
            "Create execution chain (like middleware)",
            "Execute in order with proper context",
          ],
          funFact:
            "Enhancers are re-resolved for each request if request-scoped",
        },
      },
    };
  }

  @Get("why-app-is-slow")
  @ApiOperation({ summary: "Why Your NestJS App Is Slow" })
  getWhyAppIsSlow() {
    return {
      title: "Why Your NestJS App Is Slow",
      commonCauses: {
        "1_request_scoped_providers": {
          issue: "Request-scoped providers are expensive",
          why: [
            "New instance created for EVERY request",
            "All dependencies must also be request-scoped (cascade effect)",
            "Adds allocation overhead",
          ],
          solution: "Use singleton scope when possible",
          benchmark: "Request scope can be 10-30% slower",
        },
        "2_large_module_graph": {
          issue: "Too many modules/providers slow startup",
          why: [
            "Module scanning is synchronous",
            "Each provider needs metadata reflection",
            "Circular dependency checks add overhead",
          ],
          solution: [
            "Lazy load feature modules",
            "Use dynamic imports",
            "Consider module splitting",
          ],
        },
        "3_sync_in_async_context": {
          issue: "Blocking operations in async handlers",
          examples: [
            "JSON.parse() on large objects",
            "Sync file operations (fs.readFileSync)",
            "Heavy computation without worker threads",
          ],
          solution: "Use async alternatives, worker threads, or queues",
        },
        "4_validation_overhead": {
          issue: "ValidationPipe on every request",
          why: [
            "class-transformer creates new instances",
            "class-validator runs all decorators",
            "Nested objects multiply the cost",
          ],
          solution: [
            "Skip validation for internal endpoints",
            "Use lightweight validation for simple cases",
            "Cache transformed classes (not instances)",
          ],
        },
        "5_global_interceptors": {
          issue: "Heavy global interceptors",
          examples: [
            "Logging interceptor doing JSON.stringify",
            "Transform interceptor on large responses",
            "Multiple interceptors stacking up",
          ],
          solution: "Profile interceptors, skip for health checks",
        },
        "6_cold_start": {
          issue: "Slow cold starts (serverless)",
          why: [
            "Module compilation happens on each cold start",
            "DI container setup is synchronous",
            "TypeORM/Prisma connection pools",
          ],
          solution: [
            "Use @nestjs/platform-fastify (faster)",
            "Minimize imports",
            "Use lazy loading",
            "Consider nest-webpack for bundling",
          ],
        },
        "7_n_plus_one_queries": {
          issue: "N+1 database queries",
          why: "Fetching related data in loops",
          solution: [
            "Use eager loading (relations option)",
            "Use DataLoader pattern",
            "Enable query logging to detect",
          ],
        },
      },
      profiling: {
        tools: [
          "clinic.js (Node.js profiling)",
          "node --inspect (Chrome DevTools)",
          "0x (flamegraph generation)",
          "autocannon (load testing)",
        ],
        nestjsSpecific: [
          "Log module initialization time",
          "Time each lifecycle hook",
          "Profile route resolution",
        ],
      },
      quickWins: [
        "Switch to Fastify adapter",
        "Use singleton scope everywhere possible",
        "Lazy load heavy feature modules",
        "Skip validation on internal APIs",
        "Use compression middleware",
        "Enable HTTP caching headers",
      ],
    };
  }

  @Get("di-like-compiler")
  @ApiOperation({ summary: "NestJS DI Explained Like a Compiler" })
  getDILikeCompiler() {
    return {
      title: "NestJS DI Explained Like a Compiler",
      analogy: "Think of NestJS DI as a compiler with phases",
      phases: {
        "1_lexical_analysis": {
          compilerPhase: "Lexical Analysis (Tokenization)",
          nestjsEquivalent: "Decorator Scanning",
          whatHappens: [
            "Reads @Module, @Injectable, @Controller decorators",
            "Extracts metadata attached by decorators",
            "Identifies providers, controllers, imports, exports",
          ],
          output: 'List of "tokens" (class references, strings, symbols)',
        },
        "2_syntax_analysis": {
          compilerPhase: "Syntax Analysis (Parsing)",
          nestjsEquivalent: "Module Graph Building",
          whatHappens: [
            "Builds tree structure of modules",
            "Validates imports/exports relationships",
            "Checks for missing providers",
          ],
          output: "Module dependency tree (AST equivalent)",
        },
        "3_semantic_analysis": {
          compilerPhase: "Semantic Analysis",
          nestjsEquivalent: "Provider Resolution",
          whatHappens: [
            "Resolves which provider satisfies which token",
            "Handles token collisions (last wins)",
            "Determines scope inheritance",
            "Detects circular dependencies",
          ],
          output: "Provider resolution map",
        },
        "4_code_generation": {
          compilerPhase: "Code Generation",
          nestjsEquivalent: "Instance Creation",
          whatHappens: [
            "Topologically sorts providers",
            "Instantiates in correct order",
            "Injects dependencies into constructors",
            "Caches singleton instances",
          ],
          output: "Running application with all instances",
        },
      },
      codeExample: `
        // This is conceptually what NestJS does:
        
        class DICompiler {
          // Phase 1: Lexical - Scan decorators
          scan(modules: Module[]): Token[] {
            return modules.flatMap(m => 
              this.extractTokens(m)
            );
          }
          
          // Phase 2: Syntax - Build graph
          parse(tokens: Token[]): ModuleGraph {
            const graph = new Map();
            for (const token of tokens) {
              graph.set(token, this.getDependencies(token));
            }
            return graph;
          }
          
          // Phase 3: Semantic - Resolve
          analyze(graph: ModuleGraph): ResolutionMap {
            const resolution = new Map();
            for (const [token, deps] of graph) {
              resolution.set(token, this.resolveProvider(token));
            }
            return resolution;
          }
          
          // Phase 4: Generate - Instantiate
          generate(resolution: ResolutionMap): Container {
            const sorted = this.topologicalSort(resolution);
            for (const token of sorted) {
              container.instantiate(token);
            }
            return container;
          }
        }
      `,
      keyInsight: "Understanding these phases helps debug DI issues",
    };
  }

  @Get("request-flow-real-order")
  @ApiOperation({ summary: "NestJS Request Flow – Real Order" })
  getRequestFlowRealOrder() {
    return {
      title: "NestJS Request Flow – The REAL Order",
      disclaimer: "Most tutorials get this wrong or oversimplify",
      actualOrder: [
        {
          step: 1,
          name: "Express/Fastify receives request",
          details: "Raw HTTP parsing happens here",
          canAccess: ["req", "res"],
        },
        {
          step: 2,
          name: "Express Middleware (app.use)",
          details: "cors(), helmet(), bodyParser()",
          canAccess: ["req", "res", "next"],
          note: "Runs BEFORE any NestJS code",
        },
        {
          step: 3,
          name: "NestJS Middleware",
          details: "Registered via consumer.apply()",
          canAccess: ["req", "res", "next"],
          note: "No ExecutionContext yet",
        },
        {
          step: 4,
          name: "Route Resolution",
          details: "NestJS matches URL to controller/handler",
          hidden: "This is when NestJS knows which handler to call",
        },
        {
          step: 5,
          name: "Global Guards",
          details: "APP_GUARD, then app.useGlobalGuards()",
          canAccess: ["ExecutionContext"],
          note: "Can read handler metadata via Reflector",
        },
        {
          step: 6,
          name: "Controller Guards",
          details: "@UseGuards() on controller class",
          canAccess: ["ExecutionContext"],
        },
        {
          step: 7,
          name: "Route Guards",
          details: "@UseGuards() on method",
          canAccess: ["ExecutionContext"],
        },
        {
          step: 8,
          name: "Global Interceptors (PRE)",
          details: "Code BEFORE next.handle()",
          canAccess: ["ExecutionContext", "CallHandler"],
        },
        {
          step: 9,
          name: "Controller Interceptors (PRE)",
          details: "@UseInterceptors() on class - before part",
          canAccess: ["ExecutionContext", "CallHandler"],
        },
        {
          step: 10,
          name: "Route Interceptors (PRE)",
          details: "@UseInterceptors() on method - before part",
          canAccess: ["ExecutionContext", "CallHandler"],
        },
        {
          step: 11,
          name: "Global Pipes",
          details: "APP_PIPE, then app.useGlobalPipes()",
          runsOn: "Each @Body(), @Param(), @Query() parameter",
        },
        {
          step: 12,
          name: "Controller/Route Pipes",
          details: "@UsePipes() decorators",
          note: "Runs per parameter, not once",
        },
        {
          step: 13,
          name: "Parameter Pipes",
          details: 'Inline: @Param("id", ParseIntPipe)',
          note: "Most specific pipes",
        },
        {
          step: 14,
          name: ">>> HANDLER EXECUTION <<<",
          details: "Your controller method runs",
          this: "Your actual business logic",
        },
        {
          step: 15,
          name: "Route Interceptors (POST)",
          details: "Code inside .pipe(tap(), map())",
          executionOrder: "Reverse! Route first, then controller, then global",
        },
        {
          step: 16,
          name: "Controller Interceptors (POST)",
          details: "RxJS operators execute",
        },
        {
          step: 17,
          name: "Global Interceptors (POST)",
          details: "Transform/log response",
        },
        {
          step: 18,
          name: "Exception Filters (if error)",
          details: "Route → Controller → Global (first match handles)",
          note: "Only runs if exception was thrown",
        },
        {
          step: 19,
          name: "Response sent",
          details: "Express/Fastify sends HTTP response",
        },
      ],
      keyInsights: [
        "Middleware has NO knowledge of which handler will run",
        "Guards run BEFORE interceptors",
        "Pipes run PER PARAMETER, not once per request",
        "Interceptor POST-processing is in REVERSE order",
        "Exception filters catch errors from ANY previous step",
      ],
      visualDiagram: `
        Express Middleware → NestJS Middleware → Route Resolution
                                                       ↓
        ┌─────────────────────────────────────────────────────┐
        │ GUARDS: Global → Controller → Route                 │
        └─────────────────────────────────────────────────────┘
                                ↓
        ┌─────────────────────────────────────────────────────┐
        │ INTERCEPTORS (before): Global → Controller → Route  │
        └─────────────────────────────────────────────────────┘
                                ↓
        ┌─────────────────────────────────────────────────────┐
        │ PIPES: Global → Controller → Route → Parameter      │
        │        (runs for EACH @Body/@Param/@Query)          │
        └─────────────────────────────────────────────────────┘
                                ↓
        ┌─────────────────────────────────────────────────────┐
        │              HANDLER (your code)                     │
        └─────────────────────────────────────────────────────┘
                                ↓
        ┌─────────────────────────────────────────────────────┐
        │ INTERCEPTORS (after): Route → Controller → Global   │
        │                       ^^^ REVERSE ORDER ^^^          │
        └─────────────────────────────────────────────────────┘
                                ↓
        ┌─────────────────────────────────────────────────────┐
        │ EXCEPTION FILTERS (if error thrown anywhere above)  │
        └─────────────────────────────────────────────────────┘
      `,
    };
  }

  @Get("dark-side-of-global-providers")
  @ApiOperation({ summary: "The Dark Side of Global Providers" })
  getDarkSideOfGlobalProviders() {
    return {
      title: "The Dark Side of Global Providers",
      introduction:
        "Global providers (@Global, APP_*) seem convenient but have hidden costs",
      darkSides: {
        "1_hidden_dependencies": {
          issue: "Implicit Dependencies",
          explanation: [
            "When a provider is global, any module can use it",
            "No explicit imports = hidden coupling",
            "Hard to track what depends on what",
          ],
          example: `
            // Bad: Where does ConfigService come from?
            @Injectable()
            export class UserService {
              constructor(private config: ConfigService) {} // Magic!
            }
            
            // UserModule doesn't import ConfigModule
            // But it works because ConfigModule is @Global()
          `,
          consequence: "Refactoring becomes risky",
        },
        "2_testing_nightmare": {
          issue: "Testing Complexity",
          explanation: [
            "Global providers are harder to mock",
            "Test module setup becomes complex",
            "May get unexpected real implementations",
          ],
          example: `
            // You might forget to override the global provider
            const module = await Test.createTestingModule({
              imports: [UserModule],
              // Oops, ConfigService is globally injected
              // Your test hits real config!
            }).compile();
          `,
          solution: "Always explicitly override in tests",
        },
        "3_startup_time": {
          issue: "Increased Startup Time",
          explanation: [
            "Global modules are always loaded",
            "Even if not needed by current request",
            "No tree-shaking of unused globals",
          ],
          impact: "Slower cold starts, especially in serverless",
        },
        "4_memory_bloat": {
          issue: "Memory Consumption",
          explanation: [
            "Global singletons live forever",
            "Never garbage collected",
            "May hold references to large objects",
          ],
          worstCase: "Memory leaks from cached data in global services",
        },
        "5_naming_collisions": {
          issue: "Token Collisions",
          explanation: [
            "Multiple modules might provide same token globally",
            "Last one wins (silent override)",
            "Debugging is extremely difficult",
          ],
          example: `
            // Module A (global)
            { provide: 'CONFIG', useValue: { debug: true } }
            
            // Module B (global, loaded after A)
            { provide: 'CONFIG', useValue: { debug: false } }
            
            // Which one do you get? Depends on import order!
          `,
          solution: "Use Symbol() for custom tokens",
        },
        "6_circular_dependency_risk": {
          issue: "Easier to Create Circles",
          explanation: [
            "Global providers are accessible everywhere",
            "Easy to accidentally create circular deps",
            "forwardRef hacks multiply",
          ],
        },
        "7_module_isolation_breaks": {
          issue: "Breaks Module Isolation",
          explanation: [
            "Modules should be self-contained units",
            "Global providers create invisible links",
            "Harder to extract modules to separate packages",
          ],
        },
      },
      whenGlobalIsOkay: [
        "ConfigService (single source of truth)",
        "Logger (cross-cutting concern)",
        "EventEmitter (app-wide events)",
        "Cache (shared cache layer)",
      ],
      bestPractices: [
        "Prefer explicit imports over @Global()",
        "Use @Global() only for true cross-cutting concerns",
        "Document global providers clearly",
        "Use Symbol tokens to avoid collisions",
        "Test with overridden globals",
        "Audit global provider count periodically",
      ],
      alternativePatterns: {
        sharedModule: {
          description: "Export providers explicitly",
          code: `
            @Module({
              providers: [SharedService],
              exports: [SharedService], // Explicit!
            })
            export class SharedModule {}
            
            // Consumer must import
            @Module({
              imports: [SharedModule], // Visible dependency
            })
            export class UserModule {}
          `,
        },
        factoryPattern: {
          description: "Use factories for configuration",
          code: `
            // Instead of global config
            DatabaseModule.forRoot(options)
            DatabaseModule.forFeature([Entity])
          `,
        },
      },
      summary:
        "Global providers trade explicitness for convenience. Choose wisely.",
    };
  }
}
