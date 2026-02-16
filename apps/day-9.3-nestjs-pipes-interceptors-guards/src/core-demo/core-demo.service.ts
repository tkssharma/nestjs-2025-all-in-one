import { Injectable, Logger } from "@nestjs/common";
import { ModuleRef } from "@nestjs/core";
import { DynamicService } from "./dynamic.service";

/**
 * ============================================================
 * MODULE REF - Dynamic Provider Resolution
 * ============================================================
 *
 * ModuleRef allows you to:
 * 1. Get providers dynamically at runtime
 * 2. Create instances of transient/request-scoped providers
 * 3. Resolve providers outside the constructor
 *
 * This is useful when:
 * - You need lazy loading of services
 * - You want to resolve services conditionally
 * - You need to get services in factory functions
 * - You're building plugin systems
 *
 * ============================================================
 * INJECTOR - Under the Hood
 * ============================================================
 *
 * The Injector is the core of NestJS DI system:
 *
 * 1. Module Scanning
 *    - NestJS scans all modules and their providers
 *    - Builds a dependency graph
 *
 * 2. Provider Registration
 *    - Each provider is registered with its token
 *    - Tokens can be: classes, strings, or symbols
 *
 * 3. Instance Creation
 *    - When a provider is needed, injector creates it
 *    - Resolves all dependencies first (topological sort)
 *    - Caches singleton instances
 *
 * 4. Injection
 *    - Injects resolved instance into constructor
 *    - Supports property injection via @Inject()
 *
 * ============================================================
 * RUNTIME FLOW (High Level)
 * ============================================================
 *
 *    NestFactory.create(AppModule)
 *           ↓
 *    [Scan modules recursively]
 *           ↓
 *    [Register all providers]
 *           ↓
 *    [Create dependency graph]
 *           ↓
 *    [Instantiate providers (respecting dependencies)]
 *           ↓
 *    [Call onModuleInit lifecycle hooks]
 *           ↓
 *    [Call onApplicationBootstrap hooks]
 *           ↓
 *    [Start HTTP server]
 *           ↓
 *    Application ready!
 *
 * ============================================================
 */

@Injectable()
export class CoreDemoService {
  private readonly logger = new Logger(CoreDemoService.name);

  constructor(private moduleRef: ModuleRef) {
    this.logger.log("CoreDemoService instantiated with ModuleRef");
  }

  /**
   * Get a provider dynamically using ModuleRef
   */
  getDynamicService(): DynamicService {
    // get() retrieves an instance from the current module's context
    // It returns the same singleton instance each time
    return this.moduleRef.get(DynamicService);
  }

  /**
   * Demonstrate ModuleRef.get() with strict mode
   */
  getProviderInfo(): object {
    const dynamicService = this.moduleRef.get(DynamicService, {
      strict: false,
    });

    return {
      serviceName: dynamicService.constructor.name,
      serviceData: dynamicService.getData(),
      moduleRefMethods: [
        "get(token) - Get singleton instance",
        "resolve(token) - Create new instance (for transient/request scope)",
        "create(Class) - Create instance without registering",
      ],
    };
  }

  /**
   * Information about NestJS internals
   */
  getNestJsCoreInfo(): object {
    return {
      title: "NestJS Core Explained",
      moduleRef: {
        description: "Reference to the current module container",
        methods: {
          get: "Get singleton provider instance",
          resolve: "Create new instance (transient/request scoped)",
          create: "Create instance without DI registration",
        },
        useCase: "Dynamic/lazy provider resolution",
      },
      injector: {
        description: "Core DI mechanism that manages provider lifecycle",
        responsibilities: [
          "Scan and register providers",
          "Build dependency graph",
          "Create instances in correct order",
          "Cache singleton instances",
          "Handle scope (singleton/transient/request)",
        ],
      },
      runtimeFlow: {
        "1_bootstrap": "NestFactory.create(AppModule)",
        "2_scan": "Recursively scan all imported modules",
        "3_register": "Register all providers with their tokens",
        "4_resolve": "Build dependency graph, topological sort",
        "5_instantiate": "Create provider instances",
        "6_lifecycle": "Call onModuleInit, onApplicationBootstrap",
        "7_listen": "Start HTTP server",
      },
      scopes: {
        singleton: "Single instance shared across entire app (default)",
        transient: "New instance for each injection",
        request: "New instance for each HTTP request",
      },
    };
  }
}
