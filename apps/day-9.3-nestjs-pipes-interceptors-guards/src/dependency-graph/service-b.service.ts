import { Injectable, Inject, forwardRef, Logger } from "@nestjs/common";
import { ServiceA } from "./service-a.service";

/**
 * ============================================================
 * SERVICE B - Circular Dependency Example
 * ============================================================
 *
 * This service depends on ServiceA, which in turn depends
 * on ServiceB, creating a circular dependency.
 *
 * We use forwardRef() to resolve this.
 *
 * ============================================================
 */

@Injectable()
export class ServiceB {
  private readonly logger = new Logger(ServiceB.name);

  constructor(
    // ============================================================
    // Both services need forwardRef() for circular dependencies
    // ============================================================
    @Inject(forwardRef(() => ServiceA))
    private serviceA: ServiceA
  ) {
    this.logger.log("ServiceB instantiated");
  }

  getDataFromB(): string {
    this.logger.debug("getDataFromB called");
    return "Data from Service B";
  }

  getDataWithA(): string {
    this.logger.debug("getDataWithA called - calling ServiceA");
    const dataFromA = this.serviceA.getDataFromA();
    return `ServiceB received: ${dataFromA}`;
  }

  getCombinedData(): object {
    return {
      source: "ServiceB",
      ownData: this.getDataFromB(),
      fromServiceA: this.serviceA.getDataFromA(),
      timestamp: new Date().toISOString(),
    };
  }
}
