import { Module } from "@nestjs/common";
import { ComparisonController } from "./comparison.controller";

@Module({
  controllers: [ComparisonController],
})
export class ComparisonModule {}
