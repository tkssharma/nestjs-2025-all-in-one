import { Module } from "@nestjs/common";
import { ObservablesController } from "./observables.controller";
import { ObservablesService } from "./observables.service";

@Module({
  controllers: [ObservablesController],
  providers: [ObservablesService],
})
export class ObservablesModule {}
