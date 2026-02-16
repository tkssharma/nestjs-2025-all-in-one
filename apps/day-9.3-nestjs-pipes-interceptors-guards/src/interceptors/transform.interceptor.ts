import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from "@nestjs/common";
import { Observable } from "rxjs";
import { map } from "rxjs/operators";

/**
 * ============================================================
 * TRANSFORM INTERCEPTOR
 * ============================================================
 *
 * Transforms all responses to a standard format.
 *
 * Original response: { name: "John", email: "john@example.com" }
 *
 * Transformed response:
 * {
 *   success: true,
 *   data: { name: "John", email: "john@example.com" },
 *   timestamp: "2024-01-15T10:30:00.000Z",
 *   path: "/users/1"
 * }
 *
 * ============================================================
 */

export interface TransformedResponse<T> {
  success: boolean;
  data: T;
  timestamp: string;
  path: string;
}

@Injectable()
export class TransformInterceptor<T>
  implements NestInterceptor<T, TransformedResponse<T>>
{
  private readonly logger = new Logger("TransformInterceptor");

  intercept(
    context: ExecutionContext,
    next: CallHandler
  ): Observable<TransformedResponse<T>> {
    const request = context.switchToHttp().getRequest();
    const path = request.url;

    return next.handle().pipe(
      map((data) => {
        this.logger.debug(`[INTERCEPTOR] Transforming response for ${path}`);

        return {
          success: true,
          data,
          timestamp: new Date().toISOString(),
          path,
        };
      })
    );
  }
}
