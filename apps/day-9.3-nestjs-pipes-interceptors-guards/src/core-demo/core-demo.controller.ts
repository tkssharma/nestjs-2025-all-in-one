import { Controller, Get } from "@nestjs/common";
import { ApiTags, ApiOperation, ApiResponse } from "@nestjs/swagger";
import { CoreDemoService } from "./core-demo.service";
import { Public } from "../decorators/public.decorator";

/**
 * ============================================================
 * NESTJS CORE DEMO CONTROLLER
 * ============================================================
 */

@ApiTags("NestJS Core")
@Controller("core")
export class CoreDemoController {
  constructor(private coreDemoService: CoreDemoService) {}

  @Get("module-ref")
  @Public()
  @ApiOperation({ summary: "Demonstrate ModuleRef usage" })
  @ApiResponse({ status: 200, description: "ModuleRef demo" })
  moduleRefDemo() {
    const dynamicService = this.coreDemoService.getDynamicService();
    return {
      message: "ModuleRef allows dynamic provider resolution",
      dynamicServiceData: dynamicService.getData(),
      explanation: [
        "ModuleRef.get(Token) retrieves provider from DI container",
        "Useful for lazy loading and conditional resolution",
        "Works with any registered provider token",
      ],
    };
  }

  @Get("provider-info")
  @Public()
  @ApiOperation({ summary: "Get provider information via ModuleRef" })
  getProviderInfo() {
    return this.coreDemoService.getProviderInfo();
  }

  @Get("internals")
  @Public()
  @ApiOperation({ summary: "Explain NestJS core internals" })
  @ApiResponse({ status: 200, description: "Core internals explanation" })
  getInternals() {
    return this.coreDemoService.getNestJsCoreInfo();
  }

  @Get("runtime-flow")
  @Public()
  @ApiOperation({ summary: "Visualize NestJS runtime flow" })
  getRuntimeFlow() {
    return {
      title: "NestJS Application Bootstrap Flow",
      diagram: `
        ┌─────────────────────────────────────────────────────────────┐
        │                    NestFactory.create()                      │
        └─────────────────────────────────────────────────────────────┘
                                    ↓
        ┌─────────────────────────────────────────────────────────────┐
        │              1. Module Scanner                               │
        │   - Scan AppModule and all imports                          │
        │   - Build module dependency tree                             │
        └─────────────────────────────────────────────────────────────┘
                                    ↓
        ┌─────────────────────────────────────────────────────────────┐
        │              2. Injector / DI Container                      │
        │   - Register all providers with tokens                       │
        │   - Build provider dependency graph                          │
        │   - Topological sort for instantiation order                 │
        └─────────────────────────────────────────────────────────────┘
                                    ↓
        ┌─────────────────────────────────────────────────────────────┐
        │              3. Instance Loader                              │
        │   - Create provider instances                                │
        │   - Inject dependencies into constructors                    │
        │   - Cache singleton instances                                │
        └─────────────────────────────────────────────────────────────┘
                                    ↓
        ┌─────────────────────────────────────────────────────────────┐
        │              4. Lifecycle Hooks                              │
        │   - onModuleInit()                                          │
        │   - onApplicationBootstrap()                                 │
        └─────────────────────────────────────────────────────────────┘
                                    ↓
        ┌─────────────────────────────────────────────────────────────┐
        │              5. HTTP Adapter (Express/Fastify)               │
        │   - Register routes from controllers                         │
        │   - Apply middleware, guards, interceptors                   │
        │   - Start listening on port                                  │
        └─────────────────────────────────────────────────────────────┘
                                    ↓
        ┌─────────────────────────────────────────────────────────────┐
        │                   🚀 Application Ready!                      │
        └─────────────────────────────────────────────────────────────┘
      `,
      requestFlow: `
        ┌─────────────────────────────────────────────────────────────┐
        │                    Incoming Request                          │
        └─────────────────────────────────────────────────────────────┘
                                    ↓
        ┌──────────┐    ┌──────────┐    ┌──────────────┐
        │Middleware│ →  │  Guards  │ →  │ Interceptors │
        │ (first)  │    │          │    │   (before)   │
        └──────────┘    └──────────┘    └──────────────┘
                                              ↓
                                    ┌──────────────┐
                                    │    Pipes     │
                                    │ (validation) │
                                    └──────────────┘
                                              ↓
                                    ┌──────────────┐
                                    │   Handler    │
                                    │ (controller) │
                                    └──────────────┘
                                              ↓
                                    ┌──────────────┐
                                    │ Interceptors │
                                    │   (after)    │
                                    └──────────────┘
                                              ↓
                                    ┌──────────────┐
                                    │  Exception   │
                                    │   Filters    │
                                    │ (if error)   │
                                    └──────────────┘
                                              ↓
        ┌─────────────────────────────────────────────────────────────┐
        │                    Response Sent                             │
        └─────────────────────────────────────────────────────────────┘
      `,
    };
  }
}
