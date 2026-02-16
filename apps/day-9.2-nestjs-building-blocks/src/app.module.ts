import { MiddlewareConsumer, Module, NestModule } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { EventEmitterModule } from "@nestjs/event-emitter";
import { APP_FILTER, APP_GUARD, APP_INTERCEPTOR, APP_PIPE } from "@nestjs/core";

import { UsersModule } from "./modules/users/users.module";
import { ProductsModule } from "./modules/products/products.module";
import { EventsModule } from "./modules/events/events.module";

import { LoggerMiddleware } from "./common/middleware/logger.middleware";
import { AuthGuard } from "./common/guards/auth.guard";
import { TimeoutInterceptor } from "./common/interceptors/timeout.interceptor";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    EventEmitterModule.forRoot({
      wildcard: true,
      delimiter: ".",
      maxListeners: 10,
      verboseMemoryLeak: true,
    }),
    UsersModule,
    ProductsModule,
    EventsModule,
  ],
  providers: [
    // Global Guard (commented - enable as needed)
    // {
    //   provide: APP_GUARD,
    //   useClass: AuthGuard,
    // },
    // Global Timeout Interceptor
    {
      provide: APP_INTERCEPTOR,
      useClass: TimeoutInterceptor,
    },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggerMiddleware).forRoutes("*");
  }
}
