import { Controller, Get, UseGuards, SetMetadata } from "@nestjs/common";
import { ApiTags, ApiOperation } from "@nestjs/swagger";

/**
 * Guards Beyond Authentication Demo
 * Full documentation: docs/05-guards.md
 */

@ApiTags("Advanced Guards")
@Controller("guards")
export class AdvancedGuardsController {
  @Get("demo")
  @ApiOperation({ summary: "Demo: Guard execution" })
  getGuardDemo() {
    return {
      message: "You passed all guards!",
      documentation:
        "See docs/05-guards.md for RBAC, rate limiting, feature flags, ownership guards",
    };
  }
}
