import { Injectable, Logger } from "@nestjs/common";
import {
  HealthIndicator,
  HealthIndicatorResult,
  HealthCheckError,
} from "@nestjs/terminus";

/**
 * ============================================================
 * CUSTOM HEALTH INDICATOR
 * ============================================================
 *
 * Create custom health checks by extending HealthIndicator.
 *
 * Each check should return:
 * - HealthIndicatorResult on success
 * - Throw HealthCheckError on failure
 *
 * ============================================================
 */

@Injectable()
export class CustomHealthIndicator extends HealthIndicator {
  private readonly logger = new Logger(CustomHealthIndicator.name);

  // Simulated states for demo
  private dbConnected = true;
  private externalServiceUp = true;
  private startTime = Date.now();

  /**
   * Basic application health check
   */
  async isHealthy(key: string): Promise<HealthIndicatorResult> {
    const uptime = Math.floor((Date.now() - this.startTime) / 1000);

    return this.getStatus(key, true, {
      uptime: `${uptime}s`,
      version: "1.0.0",
      environment: process.env.NODE_ENV || "development",
    });
  }

  /**
   * Check database connection (simulated)
   */
  async checkDatabaseConnection(key: string): Promise<HealthIndicatorResult> {
    // Simulate database ping
    const isHealthy = this.dbConnected;

    if (isHealthy) {
      return this.getStatus(key, true, {
        responseTime: "5ms",
        connectionPool: {
          active: 5,
          idle: 10,
          waiting: 0,
        },
      });
    }

    // Throw error if unhealthy
    throw new HealthCheckError(
      "Database check failed",
      this.getStatus(key, false, {
        message: "Cannot connect to database",
      })
    );
  }

  /**
   * Check external service (simulated)
   */
  async checkExternalService(key: string): Promise<HealthIndicatorResult> {
    // Simulate external API call
    const isHealthy = this.externalServiceUp;

    if (isHealthy) {
      return this.getStatus(key, true, {
        responseTime: "120ms",
        lastChecked: new Date().toISOString(),
      });
    }

    throw new HealthCheckError(
      "External service check failed",
      this.getStatus(key, false, {
        message: "External service is not responding",
        lastChecked: new Date().toISOString(),
      })
    );
  }

  // Methods to toggle health for demo purposes
  setDbConnected(connected: boolean) {
    this.dbConnected = connected;
    this.logger.log(`Database connection set to: ${connected}`);
  }

  setExternalServiceUp(up: boolean) {
    this.externalServiceUp = up;
    this.logger.log(`External service status set to: ${up}`);
  }
}
