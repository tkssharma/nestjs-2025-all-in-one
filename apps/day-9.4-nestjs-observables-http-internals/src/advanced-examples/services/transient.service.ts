import { Injectable, Scope, Logger } from "@nestjs/common";

/**
 * ============================================================
 * TRANSIENT SCOPE
 * ============================================================
 * - New instance for EACH injection
 * - If ServiceA and ServiceB both inject this, they get different instances
 * - Best for: stateful helpers, builders, temporary state
 */
@Injectable({ scope: Scope.TRANSIENT })
export class TransientService {
  private readonly logger = new Logger(TransientService.name);
  private readonly instanceId: string;
  private state: any = {};

  constructor() {
    this.instanceId = Math.random().toString(36).substring(7);
    this.logger.log(`TransientService created with ID: ${this.instanceId}`);
  }

  setState(key: string, value: any) {
    this.state[key] = value;
  }

  getInfo() {
    return {
      type: "TRANSIENT",
      instanceId: this.instanceId,
      state: this.state,
      message: "New instance for each injection point",
    };
  }
}
