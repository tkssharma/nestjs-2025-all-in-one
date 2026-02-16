import { Logger } from "@nestjs/common";

/**
 * ============================================================
 * FACTORY-CREATED SERVICE
 * ============================================================
 * - Created via useFactory
 * - Can receive configuration at creation time
 * - Useful for services that need runtime configuration
 */
export class ConfigurableService {
  private readonly logger = new Logger(ConfigurableService.name);

  constructor(
    private readonly appName: string,
    private readonly options: { debug: boolean }
  ) {
    this.logger.log(`ConfigurableService created for ${appName}`);
  }

  getInfo() {
    return {
      type: "FACTORY_CREATED",
      appName: this.appName,
      options: this.options,
      message: "Created via useFactory with injected dependencies",
    };
  }
}
