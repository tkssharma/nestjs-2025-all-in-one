import { Injectable, Logger } from "@nestjs/common";
import { Observable, of, throwError, interval, timer } from "rxjs";
import {
  map,
  delay,
  catchError,
  take,
  tap,
  retry,
  timeout,
} from "rxjs/operators";

/**
 * ============================================================
 * WHY NESTJS USES RxJS OBSERVABLES
 * ============================================================
 *
 * NestJS is built on top of RxJS Observables for several reasons:
 *
 * 1. INTERCEPTORS
 *    - Interceptors wrap the handler using Observable streams
 *    - Can transform, cache, log using RxJS operators
 *    - Example: tap(), map(), catchError()
 *
 * 2. MICROSERVICES
 *    - Message patterns are Observable-based
 *    - Enables reactive communication between services
 *
 * 3. WEBSOCKETS
 *    - Real-time events are naturally Observable streams
 *    - Easy to filter, transform, combine events
 *
 * 4. HTTP MODULE
 *    - @nestjs/axios returns Observables (not Promises)
 *    - Allows retries, timeouts, transformations
 *
 * ============================================================
 * PROMISES vs OBSERVABLES
 * ============================================================
 *
 * PROMISES:
 * - Single value (resolves once)
 * - Eager (starts immediately)
 * - Not cancellable
 * - Simple async operations
 *
 * OBSERVABLES:
 * - Multiple values over time
 * - Lazy (starts when subscribed)
 * - Cancellable (unsubscribe)
 * - Complex async operations
 * - Operators for transformation
 *
 * ============================================================
 */

@Injectable()
export class ObservablesService {
  private readonly logger = new Logger(ObservablesService.name);

  /**
   * Simple Observable returning a single value
   */
  getSimpleObservable(): Observable<{ message: string; timestamp: string }> {
    return of({
      message: "Hello from Observable!",
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * Observable with delay (simulating async operation)
   */
  getDelayedObservable(
    delayMs: number = 1000
  ): Observable<{ data: string; delayMs: number }> {
    return of({
      data: "This data was delayed",
      delayMs,
    }).pipe(
      tap(() => this.logger.log(`Starting delayed observable (${delayMs}ms)`)),
      delay(delayMs),
      tap(() => this.logger.log("Delayed observable completed"))
    );
  }

  /**
   * Observable with map transformation
   */
  getTransformedObservable(): Observable<
    { original: number; squared: number; cubed: number }[]
  > {
    const numbers = [1, 2, 3, 4, 5];

    return of(numbers).pipe(
      map((nums) =>
        nums.map((n) => ({
          original: n,
          squared: n * n,
          cubed: n * n * n,
        }))
      ),
      tap((result) => this.logger.log(`Transformed ${result.length} numbers`))
    );
  }

  /**
   * Observable with error handling
   */
  getObservableWithError(
    shouldFail: boolean
  ): Observable<{ success: boolean; data?: string; error?: string }> {
    if (shouldFail) {
      return throwError(() => new Error("Intentional error for demo")).pipe(
        catchError((err) => {
          this.logger.error(`Caught error: ${err.message}`);
          return of({
            success: false,
            error: err.message,
          });
        })
      );
    }

    return of({
      success: true,
      data: "Operation completed successfully",
    });
  }

  /**
   * Observable emitting multiple values over time
   */
  getStreamObservable(): Observable<{ count: number; timestamp: string }> {
    return interval(500).pipe(
      take(5),
      map((count) => ({
        count: count + 1,
        timestamp: new Date().toISOString(),
      })),
      tap((data) => this.logger.log(`Emitted value ${data.count}`))
    );
  }

  /**
   * Observable with timeout
   */
  getObservableWithTimeout(
    delayMs: number,
    timeoutMs: number
  ): Observable<any> {
    return of({ data: "Response data" }).pipe(
      delay(delayMs),
      timeout(timeoutMs),
      catchError((err) => {
        if (err.name === "TimeoutError") {
          return of({ error: "Request timed out", timeoutMs });
        }
        return throwError(() => err);
      })
    );
  }
}
