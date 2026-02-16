import { Module } from "@nestjs/common";
import { GuardsDemoController } from "./guards-demo.controller";

@Module({
  controllers: [GuardsDemoController],
})
export class GuardsDemoModule {}
