import { Injectable, Scope, Inject, Logger } from "@nestjs/common";
import { REQUEST } from "@nestjs/core";
import { Request } from "express";

/**
 * ============================================================
 * REQUEST SCOPE
 * ============================================================
 * - New instance for EACH HTTP request
 * - Can inject REQUEST object
 * - Instance is garbage collected after response
 * - Best for: request-specific state, user context, multi-tenancy
 * - WARNING: Slower than singleton (creates new instances)
 */
@Injectable({ scope: Scope.REQUEST })
export class RequestScopedService {
  private readonly logger = new Logger(RequestScopedService.name);
  private readonly instanceId: string;
  private readonly createdAt: Date;

  constructor(@Inject(REQUEST) private readonly request: Request) {
    this.instanceId = Math.random().toString(36).substring(7);
    this.createdAt = new Date();
    this.logger.log(
      `RequestScopedService created for ${request.method} ${request.url}`
    );
  }

  getInfo() {
    return {
      type: "REQUEST",
      instanceId: this.instanceId,
      createdAt: this.createdAt.toISOString(),
      requestInfo: {
        method: this.request.method,
        url: this.request.url,
        ip: this.request.ip,
        userAgent: this.request.get("user-agent"),
      },
      message: "New instance for each HTTP request",
    };
  }
}
