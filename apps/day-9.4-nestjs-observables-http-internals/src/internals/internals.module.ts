import { Module } from "@nestjs/common";
import { InternalsController } from "./internals.controller";
import { AdvancedInternalsController } from "./advanced-internals.controller";

@Module({
  controllers: [InternalsController, AdvancedInternalsController],
})
export class InternalsModule {}
