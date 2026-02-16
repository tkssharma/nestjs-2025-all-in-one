import { Injectable, Scope, Logger } from "@nestjs/common";

/**
 * ============================================================
 * DYNAMIC SERVICE
 * ============================================================
 *
 * A simple service to demonstrate ModuleRef usage.
 *
 * Can be configured with different scopes:
 * - Scope.DEFAULT (singleton)
 * - Scope.TRANSIENT (new instance each time)
 * - Scope.REQUEST (new instance per HTTP request)
 *
 * ============================================================
 */

@Injectable({ scope: Scope.DEFAULT }) // Singleton by default
export class DynamicService {
  private readonly logger = new Logger(DynamicService.name);
  private readonly instanceId: string;
  private readonly createdAt: Date;

  constructor() {
    this.instanceId = Math.random().toString(36).substring(7);
    this.createdAt = new Date();
    this.logger.log(`DynamicService created - ID: ${this.instanceId}`);
  }

  getData(): object {
    return {
      instanceId: this.instanceId,
      createdAt: this.createdAt.toISOString(),
      scope: "singleton",
      message: "Same instance across all requests",
    };
  }

  getInstanceId(): string {
    return this.instanceId;
  }
}
