import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from "@nestjs/common";
import { Observable } from "rxjs";
import { tap } from "rxjs/operators";

/**
 * ============================================================
 * TIMING INTERCEPTOR
 * ============================================================
 *
 * Measures execution time of route handlers.
 * Also adds X-Response-Time header to the response.
 *
 * This interceptor is registered as GLOBAL via APP_INTERCEPTOR
 * in app.module.ts, demonstrating dependency injection capability.
 *
 * ============================================================
 */

@Injectable()
export class TimingInterceptor implements NestInterceptor {
  private readonly logger = new Logger("TimingInterceptor");

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const start = Date.now();
    const request = context.switchToHttp().getRequest();
    const response = context.switchToHttp().getResponse();

    return next.handle().pipe(
      tap(() => {
        const duration = Date.now() - start;

        // Add timing header to response
        response.setHeader("X-Response-Time", `${duration}ms`);

        // Log timing with color based on duration
        if (duration > 1000) {
          this.logger.warn(
            `⏱️ SLOW REQUEST: ${request.method} ${request.url} - ${duration}ms`
          );
        } else if (duration > 500) {
          this.logger.log(
            `⏱️ ${request.method} ${request.url} - ${duration}ms`
          );
        } else {
          this.logger.debug(
            `⏱️ ${request.method} ${request.url} - ${duration}ms`
          );
        }
      })
    );
  }
}
