import { NestFactory } from "@nestjs/core";
import { ValidationPipe, Logger } from "@nestjs/common";
import { SwaggerModule, DocumentBuilder } from "@nestjs/swagger";
import { AppModule } from "./app.module";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const logger = new Logger("Bootstrap");

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    })
  );

  // Swagger setup
  const config = new DocumentBuilder()
    .setTitle("Blog API")
    .setDescription("NestJS Blog API - All Fundamentals Demo")
    .setVersion("1.0")
    .addBearerAuth()
    .addTag("Auth", "Authentication endpoints")
    .addTag("Authors", "Author management")
    .addTag("Blogs", "Blog post management")
    .addTag("Comments", "Comment management")
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup("api", app, document);

  const port = process.env.PORT || 3000;
  await app.listen(port);
  logger.log(`Application running on http://localhost:${port}`);
  logger.log(`Swagger docs at http://localhost:${port}/api`);
}
bootstrap();
