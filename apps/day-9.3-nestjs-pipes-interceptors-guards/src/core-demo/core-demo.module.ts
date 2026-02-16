import { Module } from "@nestjs/common";
import { CoreDemoController } from "./core-demo.controller";
import { CoreDemoService } from "./core-demo.service";
import { DynamicService } from "./dynamic.service";

/**
 * ============================================================
 * NESTJS CORE EXPLAINED
 * ============================================================
 *
 * This module demonstrates NestJS core concepts:
 * - ModuleRef
 * - Injector
 * - Runtime flow
 *
 * ============================================================
 */

@Module({
  controllers: [CoreDemoController],
  providers: [CoreDemoService, DynamicService],
})
export class CoreDemoModule {}
