import { NestFactory } from "@nestjs/core";
import { ValidationPipe, Logger } from "@nestjs/common";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
import { AppModule } from "./app.module";
import { AllExceptionsFilter } from "./exception-filters/all-exceptions.filter";
import { LoggingInterceptor } from "./interceptors/logging.interceptor";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const logger = new Logger("Bootstrap");

  // ============================================================
  // APP-LEVEL vs GLOBAL-LEVEL CONFIGURATION
  // ============================================================
  //
  // There are TWO ways to register pipes, interceptors, guards, filters:
  //
  // 1. APP-LEVEL (using app.useGlobal*) - Registered here in main.ts
  //    - Cannot inject dependencies (no DI container access)
  //    - Useful for simple cases
  //
  // 2. GLOBAL-LEVEL (using APP_* tokens in module) - Registered in AppModule
  //    - CAN inject dependencies (full DI container access)
  //    - Preferred for complex cases needing services
  //
  // ============================================================

  // ============================================================
  // APP-LEVEL GLOBAL VALIDATION PIPE
  // ============================================================
  // This ValidationPipe is registered at APP-LEVEL
  // It will validate ALL incoming requests across the entire application
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // Strip properties not in DTO
      forbidNonWhitelisted: true, // Throw error for unknown properties
      transform: true, // Auto-transform payloads to DTO instances
      transformOptions: {
        enableImplicitConversion: true, // Auto-convert types (string -> number)
      },
    })
  );

  // ============================================================
  // APP-LEVEL GLOBAL EXCEPTION FILTER
  // ============================================================
  // Catches ALL unhandled exceptions across the application
  // Note: Cannot inject dependencies here (no ConfigService, etc.)
  app.useGlobalFilters(new AllExceptionsFilter());

  // ============================================================
  // APP-LEVEL GLOBAL INTERCEPTOR
  // ============================================================
  // This interceptor will run for EVERY request
  // Note: Cannot inject dependencies here
  app.useGlobalInterceptors(new LoggingInterceptor());
  // ============================================================
  // SWAGGER DOCUMENTATION
  // ============================================================
  const config = new DocumentBuilder()
    .setTitle("NestJS Pipes, Interceptors & Guards Demo")
    .setDescription("Deep dive into NestJS request lifecycle components")
    .setVersion("1.0")
    .addBearerAuth()
    .addTag("Pipes Demo", "Demonstrates various pipe types and behaviors")
    .addTag("Interceptors Demo", "Demonstrates interceptor patterns")
    .addTag("Guards Demo", "Demonstrates guard patterns")
    .addTag("Exception Demo", "Demonstrates exception handling")
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup("api", app, document);

  // ============================================================
  // CORS
  // ============================================================
  app.enableCors();

  const port = process.env.PORT || 3000;
  await app.listen(port);

  logger.log(`🚀 Application running on: http://localhost:${port}`);
  logger.log(`📚 Swagger docs at: http://localhost:${port}/api`);
  logger.log("");
  logger.log("=".repeat(60));
  logger.log("REQUEST LIFECYCLE ORDER:");
  logger.log("1. Middleware → 2. Guards → 3. Interceptors (before)");
  logger.log("4. Pipes → 5. Route Handler → 6. Interceptors (after)");
  logger.log("7. Exception Filters (if error thrown)");
  logger.log("=".repeat(60));
}

bootstrap();
