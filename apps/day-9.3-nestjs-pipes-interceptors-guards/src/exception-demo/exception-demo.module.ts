import { Module } from "@nestjs/common";
import { ExceptionDemoController } from "./exception-demo.controller";

@Module({
  controllers: [ExceptionDemoController],
})
export class ExceptionDemoModule {}
