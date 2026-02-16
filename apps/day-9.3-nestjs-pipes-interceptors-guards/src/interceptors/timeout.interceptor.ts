import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  RequestTimeoutException,
  Logger,
} from "@nestjs/common";
import { Observable, throwError, TimeoutError } from "rxjs";
import { catchError, timeout } from "rxjs/operators";

/**
 * ============================================================
 * TIMEOUT INTERCEPTOR
 * ============================================================
 *
 * Automatically times out requests that take too long.
 * Uses RxJS timeout operator.
 *
 * ============================================================
 */

@Injectable()
export class TimeoutInterceptor implements NestInterceptor {
  private readonly logger = new Logger("TimeoutInterceptor");
  private readonly timeoutMs: number;

  constructor(timeoutMs: number = 30000) {
    this.timeoutMs = timeoutMs;
  }

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      timeout(this.timeoutMs),
      catchError((err) => {
        if (err instanceof TimeoutError) {
          const request = context.switchToHttp().getRequest();
          this.logger.error(
            `Request timeout: ${request.method} ${request.url} exceeded ${this.timeoutMs}ms`
          );
          return throwError(
            () =>
              new RequestTimeoutException(
                `Request timeout after ${this.timeoutMs}ms`
              )
          );
        }
        return throwError(() => err);
      })
    );
  }
}
