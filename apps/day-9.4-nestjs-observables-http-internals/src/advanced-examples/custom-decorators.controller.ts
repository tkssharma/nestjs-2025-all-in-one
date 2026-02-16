import {
  Controller,
  Get,
  createParamDecorator,
  ExecutionContext,
  SetMetadata,
} from "@nestjs/common";
import { ApiTags, ApiOperation } from "@nestjs/swagger";

// Custom parameter decorator example
export const ClientIp = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    return request.ip || request.headers["x-forwarded-for"]?.split(",")[0];
  }
);

// Custom metadata decorator example
export const Public = () => SetMetadata("isPublic", true);

/**
 * Metadata & Custom Decorators Demo
 * Full documentation: docs/07-custom-decorators.md
 */

@ApiTags("Custom Decorators")
@Controller("decorators")
export class CustomDecoratorsController {
  @Get("ip")
  @ApiOperation({ summary: "Demo: Custom @ClientIp decorator" })
  getClientIp(@ClientIp() ip: string) {
    return {
      yourIp: ip,
      explanation: "Extracted using custom @ClientIp() parameter decorator",
    };
  }

  @Public()
  @Get("public")
  @ApiOperation({ summary: "Demo: @Public() metadata decorator" })
  publicRoute() {
    return {
      message: "This route is marked as public using @Public() decorator",
      documentation: "See docs/07-custom-decorators.md for full guide",
    };
  }
}
