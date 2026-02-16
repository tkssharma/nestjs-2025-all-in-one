import {
  Controller,
  Get,
  UseInterceptors,
  Logger,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from "@nestjs/common";
import { ApiTags, ApiOperation, ApiResponse } from "@nestjs/swagger";
import { LoggingInterceptor } from "../interceptors/logging.interceptor";
import { TransformInterceptor } from "../interceptors/transform.interceptor";
import { CacheInterceptor } from "../interceptors/cache.interceptor";
import { TimeoutInterceptor } from "../interceptors/timeout.interceptor";
import { Public } from "../decorators/public.decorator";
import { AuthGuard } from "src/guards/auth.guard";

@ApiTags("Interceptors Demo")
@Controller("interceptors")
export class InterceptorsDemoController {
  private readonly logger = new Logger(InterceptorsDemoController.name);

  @Get("logging")
  @Public()
  @UseInterceptors(LoggingInterceptor)
  @ApiOperation({ summary: "Demo: LoggingInterceptor" })
  @ApiResponse({ status: 200, description: "Request logged" })
  loggingDemo() {
    return {
      message: "This request was logged by LoggingInterceptor",
      logged: ["Request method, URL, body", "Response data", "Execution time"],
    };
  }

  @Get("transform")
  @Public()
  @UseInterceptors(TransformInterceptor)
  @ApiOperation({ summary: "Demo: TransformInterceptor" })
  @ApiResponse({ status: 200, description: "Response transformed" })
  transformDemo() {
    // This simple object will be wrapped in a standard response format
    return { name: "John", role: "Developer" };
  }

  @Get("cache")
  @Public()
  @UseInterceptors(CacheInterceptor)
  @ApiOperation({ summary: "Demo: CacheInterceptor (30s TTL)" })
  @ApiResponse({ status: 200, description: "Response cached" })
  cacheDemo() {
    const timestamp = new Date().toISOString();
    this.logger.log(`Cache demo called at ${timestamp}`);
    return {
      message: "This response is cached for 30 seconds",
      generatedAt: timestamp,
      note: "Call again quickly to see cached response (same timestamp)",
    };
  }

  @Get("timeout")
  @Public()
  @UseInterceptors(new TimeoutInterceptor(5000))
  @ApiOperation({ summary: "Demo: TimeoutInterceptor (5s)" })
  @ApiResponse({ status: 200, description: "Completed within timeout" })
  @ApiResponse({ status: 408, description: "Request timeout" })
  timeoutDemo() {
    return {
      message: "Request completed within 5 second timeout",
      timeoutMs: 5000,
    };
  }

  @Get("slow")
  @Public()
  @UseInterceptors(new TimeoutInterceptor(2000))
  @ApiOperation({ summary: "Demo: Slow request (will timeout)" })
  @ApiResponse({ status: 408, description: "Request timeout" })
  async slowRequestDemo() {
    // This will timeout after 2 seconds
    await new Promise((resolve) => setTimeout(resolve, 3000));
    return { message: "This should not be reached" };
  }

  @Get("execution-flow")
  @Public()
  @ApiOperation({ summary: "Explain interceptor execution flow" })
  executionFlowDemo() {
    return {
      title: "Interceptor Execution Flow",
      concept: "Interceptors wrap around the route handler using RxJS",
      flow: {
        step1: "Request arrives",
        step2: "Interceptor BEFORE code runs (pre-handler)",
        step3: "next.handle() calls the route handler",
        step4: "Route handler returns Observable",
        step5:
          "Interceptor AFTER code runs via RxJS operators (tap, map, etc.)",
        step6: "Response sent to client",
      },
      diagram: `
        ┌─────────────────────────────────────────────┐
        │             INTERCEPTOR                      │
        │  ┌───────────────────────────────────────┐  │
        │  │ console.log("BEFORE")                 │  │
        │  └───────────────────────────────────────┘  │
        │                    ↓                        │
        │  ┌───────────────────────────────────────┐  │
        │  │ return next.handle().pipe(            │  │
        │  │   tap(() => console.log("AFTER"))    │  │
        │  │ )                                     │  │
        │  └───────────────────────────────────────┘  │
        └─────────────────────────────────────────────┘
      `,
      useCases: [
        "Logging requests/responses",
        "Transforming response format",
        "Caching responses",
        "Timeout handling",
        "Error transformation",
      ],
    };
  }

  @Get("global-vs-controller")
  @Public()
  @ApiOperation({ summary: "Explain Global vs Controller interceptors" })
  globalVsControllerDemo() {
    return {
      title: "Global vs Controller Level Interceptors",
      globalInterceptors: {
        appLevel: {
          registration: "app.useGlobalInterceptors() in main.ts",
          canInjectDependencies: false,
          example: "app.useGlobalInterceptors(new LoggingInterceptor())",
        },
        moduleLevel: {
          registration: "APP_INTERCEPTOR in module providers",
          canInjectDependencies: true,
          example: "{ provide: APP_INTERCEPTOR, useClass: LoggingInterceptor }",
        },
      },
      controllerLevel: {
        registration: "@UseInterceptors() on controller class",
        scope: "All routes in that controller",
      },
      methodLevel: {
        registration: "@UseInterceptors() on method",
        scope: "Only that specific route",
      },
      executionOrder: [
        "1. Global interceptors (in registration order)",
        "2. Controller-level interceptors",
        "3. Method-level interceptors",
      ],
    };
  }
}
