import { Controller, Get } from "@nestjs/common";
import { ApiTags, ApiOperation, ApiResponse } from "@nestjs/swagger";
import { ServiceA } from "./service-a.service";
import { ServiceB } from "./service-b.service";
import { Public } from "../decorators/public.decorator";

/**
 * ============================================================
 * DEPENDENCY GRAPH DEMO CONTROLLER
 * ============================================================
 *
 * Demonstrates how circular dependencies work with forwardRef().
 *
 * ============================================================
 */

@ApiTags("Dependency Graph")
@Controller("dependency")
export class DependencyGraphController {
  constructor(private serviceA: ServiceA, private serviceB: ServiceB) {}

  @Get("service-a")
  @Public()
  @ApiOperation({ summary: "Get data from ServiceA" })
  @ApiResponse({ status: 200, description: "Returns data from ServiceA" })
  getFromServiceA() {
    return {
      message: "Calling ServiceA which has circular dependency with ServiceB",
      data: this.serviceA.getCombinedData(),
    };
  }

  @Get("service-b")
  @Public()
  @ApiOperation({ summary: "Get data from ServiceB" })
  @ApiResponse({ status: 200, description: "Returns data from ServiceB" })
  getFromServiceB() {
    return {
      message: "Calling ServiceB which has circular dependency with ServiceA",
      data: this.serviceB.getCombinedData(),
    };
  }

  @Get("cross-call")
  @Public()
  @ApiOperation({
    summary: "Demonstrate cross-service calls with circular deps",
  })
  @ApiResponse({
    status: 200,
    description: "Shows both services calling each other",
  })
  crossCall() {
    return {
      message: "Both services successfully call each other via forwardRef()",
      serviceACallingB: this.serviceA.getDataWithB(),
      serviceBCallingA: this.serviceB.getDataWithA(),
      explanation: [
        "1. ServiceA is injected with ServiceB via forwardRef()",
        "2. ServiceB is injected with ServiceA via forwardRef()",
        "3. Both services can now call each other without issues",
        "4. forwardRef() defers resolution until after module init",
      ],
    };
  }

  @Get("graph-info")
  @Public()
  @ApiOperation({ summary: "Information about dependency graph" })
  getDependencyGraphInfo() {
    return {
      title: "NestJS Dependency Graph Explained",
      concepts: {
        dependencyInjection: "NestJS manages object creation via DI container",
        circularDependency: "When A needs B and B needs A",
        forwardRef: "Defers dependency resolution to break circular deps",
      },
      diagram: `
        ┌──────────────┐     forwardRef()     ┌──────────────┐
        │   ServiceA   │ ──────────────────→  │   ServiceB   │
        │              │ ←──────────────────  │              │
        └──────────────┘     forwardRef()     └──────────────┘
      `,
      bestPractices: [
        "Avoid circular dependencies when possible",
        "Extract shared logic to a third service",
        "Use events for loose coupling",
        "Use forwardRef() only as last resort",
      ],
    };
  }
}
