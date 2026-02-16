import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from "@nestjs/common";
import { Observable } from "rxjs";
import { tap, catchError } from "rxjs/operators";

/**
 * ============================================================
 * INTERCEPTORS IN NESTJS
 * ============================================================
 *
 * Interceptors wrap around the route handler execution:
 *
 * Request → Middleware → Guards → [INTERCEPTOR (before)] →
 * Pipes → Handler → [INTERCEPTOR (after)] → Response
 *
 * Interceptors can:
 * 1. Execute code BEFORE the handler (pre-processing)
 * 2. Execute code AFTER the handler (post-processing)
 * 3. Transform the result returned from the handler
 * 4. Transform exceptions thrown from the handler
 * 5. Completely override the handler (return cached data, etc.)
 * 6. Extend the basic function behavior
 *
 * Key concept: Interceptors use RxJS Observables!
 * The handle() method returns an Observable of the response.
 *
 * ============================================================
 * EXECUTION FLOW
 * ============================================================
 *
 *    ┌─────────────────────────────────────────────────┐
 *    │              INTERCEPTOR                        │
 *    │  ┌─────────────────────────────────────────┐   │
 *    │  │ Before (pre-handler code)               │   │
 *    │  └─────────────────────────────────────────┘   │
 *    │                     ↓                          │
 *    │  ┌─────────────────────────────────────────┐   │
 *    │  │ next.handle() → ROUTE HANDLER           │   │
 *    │  └─────────────────────────────────────────┘   │
 *    │                     ↓                          │
 *    │  ┌─────────────────────────────────────────┐   │
 *    │  │ After (post-handler code via RxJS)      │   │
 *    │  └─────────────────────────────────────────┘   │
 *    └─────────────────────────────────────────────────┘
 *
 * ============================================================
 */

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger("LoggingInterceptor");

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const { method, url, body } = request;
    const className = context.getClass().name;
    const handlerName = context.getHandler().name;
    const now = Date.now();

    // ============================================================
    // BEFORE: Code here runs BEFORE the route handler
    // ============================================================
    this.logger.log(`[INTERCEPTOR - BEFORE] ${method} ${url}`);
    this.logger.debug(`[INTERCEPTOR] Handler: ${className}.${handlerName}()`);

    if (Object.keys(body || {}).length > 0) {
      this.logger.debug(`[INTERCEPTOR] Body: ${JSON.stringify(body)}`);
    }

    // ============================================================
    // next.handle() invokes the route handler
    // Everything after this is AFTER the handler
    // ============================================================
    return next.handle().pipe(
      // ============================================================
      // AFTER SUCCESS: tap() runs after successful response
      // ============================================================
      tap((response) => {
        const duration = Date.now() - now;
        this.logger.log(
          `[INTERCEPTOR - AFTER] ${method} ${url} - ${duration}ms`
        );
        this.logger.debug(
          `[INTERCEPTOR] Response: ${JSON.stringify(response).substring(
            0,
            100
          )}...`
        );
      }),
      // ============================================================
      // AFTER ERROR: catchError() runs if handler throws
      // ============================================================
      catchError((error) => {
        const duration = Date.now() - now;
        this.logger.error(
          `[INTERCEPTOR - ERROR] ${method} ${url} - ${duration}ms - ${error.message}`
        );
        throw error; // Re-throw to let exception filters handle it
      })
    );
  }
}
