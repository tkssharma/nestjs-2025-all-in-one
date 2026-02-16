import { NestFactory } from "@nestjs/core";
import { ValidationPipe, Logger } from "@nestjs/common";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
import { AppModule } from "./app.module";

/**
 * ============================================================
 * NESTJS BOOTSTRAP - UNDER THE HOOD
 * ============================================================
 *
 * What happens when you call NestFactory.create()?
 *
 * 1. MODULE SCANNING
 *    - NestJS scans AppModule and all imported modules
 *    - Builds a module dependency tree
 *    - Identifies all providers, controllers, exports
 *
 * 2. DEPENDENCY INJECTION CONTAINER
 *    - Creates a DI container (IoC container)
 *    - Registers all providers with their injection tokens
 *    - Analyzes constructor dependencies
 *
 * 3. PROVIDER INSTANTIATION
 *    - Topologically sorts providers based on dependencies
 *    - Creates instances in correct order
 *    - Injects dependencies into constructors
 *
 * 4. CONTROLLER REGISTRATION
 *    - Maps routes from @Controller() and @Get/@Post/etc.
 *    - Associates routes with handler methods
 *    - Registers route metadata (guards, pipes, interceptors)
 *
 * 5. LIFECYCLE HOOKS
 *    - Calls onModuleInit() on all providers/controllers
 *    - Calls onApplicationBootstrap() after all modules init
 *
 * 6. HTTP ADAPTER
 *    - Creates Express/Fastify instance
 *    - Configures routes, middleware
 *    - Starts listening on port
 *
 * ============================================================
 */

async function bootstrap() {
  const logger = new Logger("Bootstrap");

  // ============================================================
  // Step 1: Create NestJS Application
  // ============================================================
  // This triggers module scanning and DI container creation
  logger.log("Creating NestJS application...");
  const app = await NestFactory.create(AppModule, {
    logger: ["error", "warn", "log", "debug", "verbose"],
  });

  // ============================================================
  // Step 2: Global Pipes
  // ============================================================
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
    })
  );

  // ============================================================
  // Step 3: Swagger Documentation
  // ============================================================
  const config = new DocumentBuilder()
    .setTitle("NestJS Observables & HTTP Module Demo")
    .setDescription("RxJS Observables, HTTP calls, and NestJS internals")
    .setVersion("1.0")
    .addTag("Observables", "RxJS Observable patterns in NestJS")
    .addTag("HTTP Module", "Making external API calls")
    .addTag("Internals", "NestJS under the hood")
    .addTag("Comparison", "NestJS vs Express vs HapiJS")
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup("api", app, document);

  // ============================================================
  // Step 4: CORS
  // ============================================================
  app.enableCors();

  // ============================================================
  // Step 5: Start Server
  // ============================================================
  const port = process.env.PORT || 3000;
  await app.listen(port);

  logger.log(`🚀 Application running on: http://localhost:${port}`);
  logger.log(`📚 Swagger docs at: http://localhost:${port}/api`);
  logger.log("");
  logger.log("=".repeat(60));
  logger.log("TOPICS COVERED:");
  logger.log("1. NestJS & Observables (RxJS)");
  logger.log("2. NestJS HTTP Module (Axios)");
  logger.log("3. NestJS Under the Hood");
  logger.log("4. NestJS vs Express vs HapiJS");
  logger.log("=".repeat(60));
}

bootstrap();
