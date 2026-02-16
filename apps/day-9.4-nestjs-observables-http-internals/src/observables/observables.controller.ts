import { Controller, Get, Query, Logger } from "@nestjs/common";
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from "@nestjs/swagger";
import { Observable } from "rxjs";
import { map } from "rxjs/operators";
import { ObservablesService } from "./observables.service";

/**
 * ============================================================
 * CONTROLLER RETURNING OBSERVABLES
 * ============================================================
 *
 * NestJS controllers can return:
 * - Plain values
 * - Promises
 * - Observables (automatically subscribed by NestJS)
 *
 * When you return an Observable, NestJS:
 * 1. Subscribes to it
 * 2. Waits for the first value
 * 3. Sends that value as the response
 * 4. Unsubscribes
 *
 * ============================================================
 */

@ApiTags("Observables")
@Controller("observables")
export class ObservablesController {
  private readonly logger = new Logger(ObservablesController.name);

  constructor(private readonly observablesService: ObservablesService) {}

  @Get("simple")
  @ApiOperation({ summary: "Return simple Observable" })
  @ApiResponse({ status: 200, description: "Simple Observable response" })
  getSimple(): Observable<any> {
    this.logger.log("Returning Observable from controller");
    // NestJS automatically subscribes and returns the value
    return this.observablesService.getSimpleObservable();
  }

  @Get("delayed")
  @ApiOperation({ summary: "Return Observable with delay" })
  @ApiQuery({ name: "delay", required: false, description: "Delay in ms" })
  getDelayed(@Query("delay") delayMs?: string): Observable<any> {
    const delay = parseInt(delayMs || "1000", 10);
    return this.observablesService.getDelayedObservable(delay);
  }

  @Get("transformed")
  @ApiOperation({ summary: "Return Observable with map transformation" })
  @ApiResponse({ status: 200, description: "Transformed data" })
  getTransformed(): Observable<any> {
    // Can also chain additional operators in controller
    return this.observablesService.getTransformedObservable().pipe(
      map((data) => ({
        message: "Data transformed using RxJS map operator",
        data,
      }))
    );
  }

  @Get("error-handling")
  @ApiOperation({ summary: "Demo Observable error handling with catchError" })
  @ApiQuery({
    name: "fail",
    required: false,
    description: 'Set to "true" to trigger error',
  })
  getWithErrorHandling(@Query("fail") fail?: string): Observable<any> {
    const shouldFail = fail === "true";
    return this.observablesService.getObservableWithError(shouldFail);
  }

  @Get("retry")
  @ApiOperation({ summary: "Demo Observable with retry logic" })
  @ApiResponse({ status: 200, description: "Shows retry mechanism" })
  getWithRetry(): Observable<any> {
    return this.observablesService.getObservableWithRetry().pipe(
      map((result) => ({
        message: "Observable with retry (fails 2x, succeeds 3rd time)",
        result,
      }))
    );
  }

  @Get("timeout")
  @ApiOperation({ summary: "Demo Observable with timeout" })
  @ApiQuery({
    name: "delay",
    required: false,
    description: "Response delay in ms",
  })
  @ApiQuery({ name: "timeout", required: false, description: "Timeout in ms" })
  getWithTimeout(
    @Query("delay") delayMs?: string,
    @Query("timeout") timeoutMs?: string
  ): Observable<any> {
    const delay = parseInt(delayMs || "500", 10);
    const timeout = parseInt(timeoutMs || "1000", 10);
    return this.observablesService.getObservableWithTimeout(delay, timeout);
  }

  @Get("promises-vs-observables")
  @ApiOperation({ summary: "Explain Promises vs Observables" })
  getComparison() {
    return {
      title: "Promises vs Observables in NestJS",
      promises: {
        description: "Single async value",
        characteristics: [
          "Resolves to ONE value",
          "Eager - starts immediately when created",
          "Not cancellable",
          "Native JavaScript",
          "Simple async/await syntax",
        ],
        useCase: "Simple async operations (DB queries, single API calls)",
        example: `
          async getUser(id: string): Promise<User> {
            return this.userRepository.findOne(id);
          }
        `,
      },
      observables: {
        description: "Stream of async values",
        characteristics: [
          "Can emit MULTIPLE values over time",
          "Lazy - only executes when subscribed",
          "Cancellable via unsubscribe()",
          "RxJS library required",
          "Powerful operators (map, filter, retry, etc.)",
        ],
        useCase: "Complex async (real-time, retries, transformations)",
        example: `
          getUsers(): Observable<User[]> {
            return this.httpService.get('/users').pipe(
              map(response => response.data),
              retry(3),
              catchError(err => of([]))
            );
          }
        `,
      },
      whenToUseWhat: {
        usePromises: [
          "Simple database operations",
          "Single API calls without retry logic",
          "When async/await is preferred",
          "Most CRUD operations",
        ],
        useObservables: [
          "HTTP calls with retries/timeouts",
          "Real-time data (WebSockets, SSE)",
          "Combining multiple async sources",
          "Complex transformation pipelines",
          "When working with interceptors",
        ],
      },
      nestjsNote:
        "NestJS accepts both! Return Promise OR Observable from controllers - NestJS handles both.",
    };
  }

  @Get("why-interceptors-love-observables")
  @ApiOperation({ summary: "Explain why interceptors use Observables" })
  getInterceptorExplanation() {
    return {
      title: "Why Interceptors Love Observables",
      reason: "Interceptors wrap the handler using RxJS Observable stream",
      flow: {
        step1: "Request arrives",
        step2: "Interceptor runs BEFORE code",
        step3: "next.handle() returns Observable of response",
        step4: "Interceptor can transform using RxJS operators",
        step5: "Response sent to client",
      },
      powerfulOperators: {
        tap: "Side effects (logging) without changing data",
        map: "Transform the response data",
        catchError: "Handle and transform errors",
        timeout: "Add timeout to requests",
        retry: "Retry failed operations",
        finalize: "Cleanup after completion or error",
      },
      example: `
        @Injectable()
        export class LoggingInterceptor implements NestInterceptor {
          intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
            const now = Date.now();
            
            return next.handle().pipe(
              tap(() => console.log(\`Request took \${Date.now() - now}ms\`)),
              map(data => ({ success: true, data })),
              catchError(err => of({ success: false, error: err.message }))
            );
          }
        }
      `,
      keyInsight:
        "Without Observables, interceptors could not easily transform responses or handle errors in a composable way.",
    };
  }
}
