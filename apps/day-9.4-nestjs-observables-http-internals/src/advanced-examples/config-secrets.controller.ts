import { Controller, Get } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { ApiTags, ApiOperation } from "@nestjs/swagger";

/**
 * Config & Secrets Management Demo
 * Full documentation: docs/01-config-secrets.md
 */

@ApiTags("Config & Secrets")
@Controller("config")
export class ConfigSecretsController {
  constructor(private configService: ConfigService) {}

  @Get("demo")
  @ApiOperation({ summary: "Demo: Read config values" })
  getConfigDemo() {
    return {
      port: this.configService.get<number>("PORT", 3000),
      nodeEnv: this.configService.get<string>("NODE_ENV", "development"),
      documentation: "See docs/01-config-secrets.md for full guide",
    };
  }
}
