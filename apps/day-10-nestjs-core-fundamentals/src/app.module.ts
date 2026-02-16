import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DomainModule } from './domain/domain.module';
import { DevtoolsModule } from '@nestjs/devtools-integration';

@Module({
  imports: [
    DomainModule,
    DevtoolsModule.register({
      http: true,
      port: 8000,
    }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
