import { Module } from "@nestjs/common";
import { TerminusModule } from "@nestjs/terminus";
import { HealthController } from "./health.controller";
import { CustomHealthIndicator } from "./custom-health.indicator";

/**
 * ============================================================
 * HEALTH CHECK MODULE
 * ============================================================
 *
 * NestJS provides @nestjs/terminus for health checks.
 *
 * Health checks are essential for:
 * - Kubernetes liveness/readiness probes
 * - Load balancer health checks
 * - Monitoring systems
 * - Container orchestration
 *
 * Built-in health indicators:
 * - HttpHealthIndicator - Check external HTTP endpoints
 * - TypeOrmHealthIndicator - Check database connection
 * - MongooseHealthIndicator - Check MongoDB connection
 * - MicroserviceHealthIndicator - Check microservices
 * - MemoryHealthIndicator - Check memory usage
 * - DiskHealthIndicator - Check disk space
 *
 * ============================================================
 */

@Module({
  imports: [TerminusModule],
  controllers: [HealthController],
  providers: [CustomHealthIndicator],
})
export class HealthModule {}
