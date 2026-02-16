import { Injectable, Inject, forwardRef, Logger } from "@nestjs/common";
import { ServiceB } from "./service-b.service";

/**
 * ============================================================
 * SERVICE A - Circular Dependency Example
 * ============================================================
 *
 * This service depends on ServiceB, which in turn depends
 * on ServiceA, creating a circular dependency.
 *
 * We use forwardRef() to resolve this.
 *
 * ============================================================
 */

@Injectable()
export class ServiceA {
  private readonly logger = new Logger(ServiceA.name);

  constructor(
    // ============================================================
    // forwardRef() is the key to resolving circular dependencies
    // ============================================================
    // Without forwardRef(), NestJS would throw:
    // "Nest cannot create the ServiceA instance. The module at index [X]
    // is undefined or the provider has a circular dependency."
    @Inject(forwardRef(() => ServiceB))
    private serviceB: ServiceB
  ) {
    this.logger.log("ServiceA instantiated");
  }

  getDataFromA(): string {
    this.logger.debug("getDataFromA called");
    return "Data from Service A";
  }

  getDataWithB(): string {
    this.logger.debug("getDataWithB called - calling ServiceB");
    const dataFromB = this.serviceB.getDataFromB();
    return `ServiceA received: ${dataFromB}`;
  }

  getCombinedData(): object {
    return {
      source: "ServiceA",
      ownData: this.getDataFromA(),
      fromServiceB: this.serviceB.getDataFromB(),
      timestamp: new Date().toISOString(),
    };
  }
}
