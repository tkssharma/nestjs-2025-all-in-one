import { Module } from "@nestjs/common";
import { PipesDemoController } from "./pipes-demo.controller";

@Module({
  controllers: [PipesDemoController],
})
export class PipesDemoModule {}
