import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from "@nestjs/common";
import { Observable, of } from "rxjs";
import { tap } from "rxjs/operators";

@Injectable()
export class SimpleCacheInterceptor implements NestInterceptor {
  private cache = new Map<string, { data: any; expiry: number }>();
  private readonly ttl = 60000; // 1 minute TTL

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();

    // Only cache GET requests
    if (request.method !== "GET") {
      return next.handle();
    }

    const key = this.generateCacheKey(request);
    const cached = this.cache.get(key);

    // Return cached data if valid
    if (cached && cached.expiry > Date.now()) {
      return of(cached.data);
    }

    return next.handle().pipe(
      tap((data) => {
        this.cache.set(key, {
          data,
          expiry: Date.now() + this.ttl,
        });
      })
    );
  }

  private generateCacheKey(request: any): string {
    return `${request.method}:${request.url}`;
  }

  clearCache(): void {
    this.cache.clear();
  }
}
