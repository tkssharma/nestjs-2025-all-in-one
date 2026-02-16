import { Module } from "@nestjs/common";
import { InterceptorsDemoController } from "./interceptors-demo.controller";

@Module({
  controllers: [InterceptorsDemoController],
})
export class InterceptorsDemoModule {}
