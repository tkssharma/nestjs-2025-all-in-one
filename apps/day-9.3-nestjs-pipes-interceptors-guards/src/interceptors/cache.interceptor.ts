import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from "@nestjs/common";
import { Observable, of } from "rxjs";
import { tap } from "rxjs/operators";

/**
 * ============================================================
 * CACHE INTERCEPTOR (Simple Demo)
 * ============================================================
 *
 * Demonstrates how interceptors can COMPLETELY OVERRIDE
 * the route handler by returning cached data.
 *
 * This is a simplified in-memory cache for demo purposes.
 * In production, use @nestjs/cache-manager with Redis.
 *
 * Key concept: If we return of(cachedData) instead of
 * calling next.handle(), the route handler is NEVER called!
 *
 * ============================================================
 */

@Injectable()
export class CacheInterceptor implements NestInterceptor {
  private readonly logger = new Logger("CacheInterceptor");
  private cache = new Map<string, { data: any; expiry: number }>();
  private readonly TTL = 30000; // 30 seconds

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();

    // Only cache GET requests
    if (request.method !== "GET") {
      return next.handle();
    }

    const cacheKey = request.url;
    const cached = this.cache.get(cacheKey);

    // Check if we have valid cached data
    if (cached && cached.expiry > Date.now()) {
      this.logger.log(`[CACHE HIT] ${cacheKey}`);
      // Return cached data - handler is NOT called!
      return of(cached.data);
    }

    this.logger.debug(`[CACHE MISS] ${cacheKey}`);

    // No cache, call the handler and cache the result
    return next.handle().pipe(
      tap((data) => {
        this.cache.set(cacheKey, {
          data,
          expiry: Date.now() + this.TTL,
        });
        this.logger.debug(`[CACHE SET] ${cacheKey} (TTL: ${this.TTL}ms)`);
      })
    );
  }

  // Helper to clear cache (useful for testing)
  clearCache() {
    this.cache.clear();
    this.logger.log("[CACHE] Cleared all entries");
  }
}
