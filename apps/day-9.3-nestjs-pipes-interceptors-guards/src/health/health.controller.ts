import { Controller, Get } from "@nestjs/common";
import { ApiTags, ApiOperation, ApiResponse } from "@nestjs/swagger";
import {
  HealthCheckService,
  HealthCheck,
  MemoryHealthIndicator,
  DiskHealthIndicator,
} from "@nestjs/terminus";
import { CustomHealthIndicator } from "./custom-health.indicator";
import { Public } from "../decorators/public.decorator";

/**
 * ============================================================
 * HEALTH CHECK CONTROLLER
 * ============================================================
 *
 * Provides /health endpoint for monitoring.
 *
 * Response format:
 * {
 *   "status": "ok" | "error",
 *   "info": { ... },     // Healthy checks
 *   "error": { ... },    // Unhealthy checks
 *   "details": { ... }   // All check details
 * }
 *
 * ============================================================
 */

@ApiTags("Health")
@Controller("health")
export class HealthController {
  constructor(
    private health: HealthCheckService,
    private memory: MemoryHealthIndicator,
    private disk: DiskHealthIndicator,
    private customHealth: CustomHealthIndicator
  ) {}

  @Get()
  @Public()
  @HealthCheck()
  @ApiOperation({ summary: "Check application health status" })
  @ApiResponse({ status: 200, description: "Application is healthy" })
  @ApiResponse({ status: 503, description: "Application is unhealthy" })
  check() {
    return this.health.check([
      // ============================================================
      // Memory Health Check
      // ============================================================
      // Check if heap memory usage is below 150MB
      () => this.memory.checkHeap("memory_heap", 150 * 1024 * 1024),

      // Check if RSS (Resident Set Size) is below 300MB
      () => this.memory.checkRSS("memory_rss", 300 * 1024 * 1024),

      // ============================================================
      // Disk Health Check
      // ============================================================
      // Check if disk usage is below 90%
      () =>
        this.disk.checkStorage("disk", {
          path: "/",
          thresholdPercent: 0.9,
        }),

      // ============================================================
      // Custom Health Checks
      // ============================================================
      () => this.customHealth.isHealthy("app"),
      () => this.customHealth.checkDatabaseConnection("database"),
      () => this.customHealth.checkExternalService("external_api"),
    ]);
  }

  @Get("liveness")
  @Public()
  @ApiOperation({ summary: "Kubernetes liveness probe" })
  @ApiResponse({ status: 200, description: "Application is alive" })
  liveness() {
    // Simple liveness check - just verify the app is running
    return { status: "ok", timestamp: new Date().toISOString() };
  }

  @Get("readiness")
  @Public()
  @HealthCheck()
  @ApiOperation({ summary: "Kubernetes readiness probe" })
  @ApiResponse({
    status: 200,
    description: "Application is ready to accept traffic",
  })
  @ApiResponse({ status: 503, description: "Application is not ready" })
  readiness() {
    return this.health.check([
      // Only check critical dependencies for readiness
      () => this.customHealth.checkDatabaseConnection("database"),
    ]);
  }
}
