import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { createDocument } from './swagger/swagger';
import { HttpExceptionFilter } from './core/filters/exception.filter';
import { TaskInterceptor } from './core/interceptor/simple.interceptor';
import { EmailValidationPipe } from './core/pipes/custom.pipe';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    snapshot: true,
  });
  app.useGlobalFilters(new HttpExceptionFilter());
  // app.useGlobalPipes(new EmailValidationPipe())
  createDocument(app);
  await app.listen(3012);
}
bootstrap();
