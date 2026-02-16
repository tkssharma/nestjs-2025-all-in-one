import { Controller, Post, Body, Logger } from "@nestjs/common";
import { ApiTags, ApiOperation, ApiResponse } from "@nestjs/swagger";
import { EventEmitter2 } from "@nestjs/event-emitter";
import { Public } from "../../common/decorators/public.decorator";

class EmitEventDto {
  event: string;
  payload: Record<string, any>;
}

@ApiTags("Events")
@Controller("events")
export class EventsController {
  private readonly logger = new Logger(EventsController.name);

  constructor(private eventEmitter: EventEmitter2) {}

  @Post("emit")
  @Public()
  @ApiOperation({ summary: "Emit a custom event (for testing)" })
  @ApiResponse({ status: 201, description: "Event emitted successfully" })
  emitEvent(@Body() dto: EmitEventDto) {
    this.logger.log(`Emitting event: ${dto.event}`);
    this.eventEmitter.emit(dto.event, dto.payload);
    return {
      message: `Event "${dto.event}" emitted successfully`,
      payload: dto.payload,
    };
  }
}
