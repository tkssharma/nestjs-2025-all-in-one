import { Injectable, Logger } from "@nestjs/common";

/**
 * ============================================================
 * SINGLETON SCOPE (Default)
 * ============================================================
 * - One instance shared across entire application
 * - Created once when module loads
 * - Lives forever (until app shuts down)
 * - Best for: stateless services, utilities, database connections
 */
@Injectable()
export class SingletonService {
  private readonly logger = new Logger(SingletonService.name);
  private readonly instanceId: string;
  private callCount = 0;

  constructor() {
    this.instanceId = Math.random().toString(36).substring(7);
    this.logger.log(`SingletonService created with ID: ${this.instanceId}`);
  }

  getInfo() {
    this.callCount++;
    return {
      type: "SINGLETON",
      instanceId: this.instanceId,
      callCount: this.callCount,
      message: "Same instance across all requests",
    };
  }
}
