import { Injectable, NestMiddleware, Logger } from "@nestjs/common";
import { Request, Response, NextFunction } from "express";

/**
 * ============================================================
 * MIDDLEWARE IN NESTJS
 * ============================================================
 *
 * Middleware executes FIRST in the request lifecycle:
 *
 * Request → [MIDDLEWARE] → Guards → Interceptors → Pipes → Handler
 *
 * Key characteristics:
 * - Has access to raw Request and Response objects
 * - Can modify request/response before they reach the route handler
 * - Can end the request-response cycle
 * - Can call next() to pass control to the next middleware
 * - Does NOT have access to the execution context (no handler info)
 *
 * When to use Middleware:
 * - Request logging
 * - Authentication token parsing
 * - Request body parsing
 * - CORS handling
 * - Compression
 *
 * When NOT to use Middleware:
 * - Authorization checks (use Guards instead)
 * - Data validation (use Pipes instead)
 * - Response transformation (use Interceptors instead)
 * - When you need execution context info (handler, class metadata)
 *
 * ============================================================
 */

@Injectable()
export class LoggerMiddleware implements NestMiddleware {
  private readonly logger = new Logger("HTTP");

  use(req: Request, res: Response, next: NextFunction) {
    const startTime = Date.now();
    const { method, originalUrl, ip } = req;
    const userAgent = req.get("user-agent") || "";

    // Log request start
    this.logger.log(`[MIDDLEWARE] → ${method} ${originalUrl} - IP: ${ip}`);

    // Capture response finish event
    res.on("finish", () => {
      const duration = Date.now() - startTime;
      const { statusCode } = res;
      const contentLength = res.get("content-length") || 0;

      const logMessage = `[MIDDLEWARE] ← ${method} ${originalUrl} ${statusCode} - ${duration}ms - ${contentLength}b`;

      if (statusCode >= 500) {
        this.logger.error(logMessage);
      } else if (statusCode >= 400) {
        this.logger.warn(logMessage);
      } else {
        this.logger.log(logMessage);
      }
    });

    // IMPORTANT: Must call next() to continue to the next middleware/handler
    next();
  }
}
