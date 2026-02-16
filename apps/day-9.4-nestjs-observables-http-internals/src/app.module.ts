import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { HttpModule } from "@nestjs/axios";

import { ObservablesModule } from "./observables/observables.module";
import { HttpDemoModule } from "./http-demo/http-demo.module";
import { InternalsModule } from "./internals/internals.module";
import { ComparisonModule } from "./comparison/comparison.module";
import { AdvancedExamplesModule } from "./advanced-examples/advanced-examples.module";

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),

    // ============================================================
    // HTTP MODULE CONFIGURATION
    // ============================================================
    // The HttpModule wraps Axios and provides HttpService
    // Can be configured globally or per-module
    HttpModule.register({
      timeout: 5000,
      maxRedirects: 5,
    }),

    // Feature modules
    ObservablesModule,
    HttpDemoModule,
    InternalsModule,
    ComparisonModule,
    AdvancedExamplesModule,
  ],
})
export class AppModule {}
