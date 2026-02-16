import { Module, NestModule, MiddlewareConsumer } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { APP_GUARD, APP_INTERCEPTOR, APP_FILTER, APP_PIPE } from "@nestjs/core";

// Modules
import { PipesDemoModule } from "./pipes-demo/pipes-demo.module";
import { InterceptorsDemoModule } from "./interceptors-demo/interceptors-demo.module";
import { GuardsDemoModule } from "./guards-demo/guards-demo.module";
import { ExceptionDemoModule } from "./exception-demo/exception-demo.module";
import { HealthModule } from "./health/health.module";
import { DependencyGraphModule } from "./dependency-graph/dependency-graph.module";
import { CoreDemoModule } from "./core-demo/core-demo.module";

// Global providers (registered via DI - can inject dependencies)
import { HttpExceptionFilter } from "./exception-filters/http-exception.filter";
import { LoggerMiddleware } from "./middleware/logger.middleware";

// ============================================================
// GLOBAL-LEVEL REGISTRATION (via APP_* tokens)
// ============================================================
// These are registered through the DI container, so they CAN
// inject other services like ConfigService, Logger, etc.
//
// Compare with app.useGlobal* in main.ts which CANNOT inject.
// ============================================================

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PipesDemoModule,
    InterceptorsDemoModule,
    GuardsDemoModule,
    ExceptionDemoModule,
    HealthModule,
    DependencyGraphModule,
    CoreDemoModule,
  ],
  providers: [
    // ============================================================
    // GLOBAL INTERCEPTOR via DI
    // ============================================================
    // This interceptor CAN inject dependencies because it's
    // registered through the module system

    // ============================================================
    // GLOBAL EXCEPTION FILTER via DI
    // ============================================================
    // This filter CAN inject ConfigService, Logger, etc.
    {
      provide: APP_FILTER,
      useClass: HttpExceptionFilter,
    },

    // ============================================================
    // NOTE: Global Guards and Pipes can also be registered here
    // ============================================================
    // {
    //   provide: APP_GUARD,
    //   useClass: AuthGuard,
    // },
    // {
    //   provide: APP_PIPE,
    //   useClass: ValidationPipe,
    // },
  ],
})
export class AppModule implements NestModule {
  // ============================================================
  // MIDDLEWARE REGISTRATION
  // ============================================================
  // Middleware is registered differently - via configure() method
  // Middleware runs FIRST, before guards, interceptors, and pipes
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggerMiddleware).forRoutes("*"); // Apply to all routes
  }
}
