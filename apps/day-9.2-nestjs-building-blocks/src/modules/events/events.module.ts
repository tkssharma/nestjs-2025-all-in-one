import { Module } from "@nestjs/common";
import { EventsController } from "./events.controller";
import { ProductEventsListener } from "./listeners/product-events.listener";

@Module({
  controllers: [EventsController],
  providers: [ProductEventsListener],
})
export class EventsModule {}
