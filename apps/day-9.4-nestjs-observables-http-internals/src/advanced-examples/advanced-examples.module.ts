import { Module } from "@nestjs/common";
import { DIDeepDiveController } from "./di-deep-dive.controller";
import { AdvancedPipesController } from "./advanced-pipes.controller";
import { RealInterceptorsController } from "./real-interceptors.controller";
import { AdvancedGuardsController } from "./advanced-guards.controller";
import { ErrorDesignController } from "./error-design.controller";
import { CustomDecoratorsController } from "./custom-decorators.controller";
import { RxjsNestjsWayController } from "./rxjs-nestjs-way.controller";
import { ConfigSecretsController } from "./config-secrets.controller";

// Services for DI demo
import { SingletonService } from "./services/singleton.service";
import { TransientService } from "./services/transient.service";
import { RequestScopedService } from "./services/request-scoped.service";
import { ConfigurableService } from "./services/configurable.service";

@Module({
  controllers: [
    DIDeepDiveController,
    AdvancedPipesController,
    RealInterceptorsController,
    AdvancedGuardsController,
    ErrorDesignController,
    CustomDecoratorsController,
    RxjsNestjsWayController,
    ConfigSecretsController,
  ],
  providers: [
    SingletonService,
    TransientService,
    RequestScopedService,
    // Custom token provider
    {
      provide: "APP_NAME",
      useValue: "NestJS Advanced Demo",
    },
    // Factory provider
    {
      provide: "CONFIGURABLE_SERVICE",
      useFactory: (appName: string) => {
        return new ConfigurableService(appName, { debug: true });
      },
      inject: ["APP_NAME"],
    },
    // Alias provider
    {
      provide: "SINGLETON_ALIAS",
      useExisting: SingletonService,
    },
  ],
  exports: [SingletonService],
})
export class AdvancedExamplesModule {}
