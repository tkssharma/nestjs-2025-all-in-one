import { Module, forwardRef } from "@nestjs/common";
import { ServiceA } from "./service-a.service";
import { ServiceB } from "./service-b.service";
import { DependencyGraphController } from "./dependency-graph.controller";

/**
 * ============================================================
 * DEPENDENCY GRAPH IN NESTJS
 * ============================================================
 *
 * NestJS uses a dependency injection (DI) container to manage
 * the creation and lifecycle of providers.
 *
 * The dependency graph shows how services depend on each other.
 *
 * ============================================================
 * CIRCULAR DEPENDENCY PROBLEM
 * ============================================================
 *
 * A circular dependency occurs when:
 * - ServiceA depends on ServiceB
 * - ServiceB depends on ServiceA
 *
 * This creates an infinite loop during module initialization:
 *
 *    ServiceA needs ServiceB to be created first
 *         ↓
 *    ServiceB needs ServiceA to be created first
 *         ↓
 *    ServiceA needs ServiceB to be created first
 *         ↓
 *    ... INFINITE LOOP!
 *
 * ============================================================
 * THE SOLUTION: forwardRef()
 * ============================================================
 *
 * forwardRef() tells NestJS to defer the resolution of the
 * dependency until the entire module is loaded.
 *
 * Usage:
 * @Inject(forwardRef(() => ServiceB))
 * private serviceB: ServiceB;
 *
 * This allows NestJS to:
 * 1. Create ServiceA (with a placeholder for ServiceB)
 * 2. Create ServiceB (with a placeholder for ServiceA)
 * 3. Fill in the placeholders after both are created
 *
 * ============================================================
 * BEST PRACTICES
 * ============================================================
 *
 * 1. Avoid circular dependencies when possible
 * 2. Consider extracting shared logic to a third service
 * 3. Use events/event emitter for loose coupling
 * 4. Use forwardRef only as a last resort
 *
 * ============================================================
 */

@Module({
  controllers: [DependencyGraphController],
  providers: [ServiceA, ServiceB],
  exports: [ServiceA, ServiceB],
})
export class DependencyGraphModule {}
