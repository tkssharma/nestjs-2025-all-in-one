import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
  Logger,
} from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { Observable } from "rxjs";
import { IS_PUBLIC_KEY } from "../decorators/public.decorator";

/**
 * ============================================================
 * GUARDS IN NESTJS
 * ============================================================
 *
 * Guards determine whether a request should be handled by the route handler.
 *
 * Request → Middleware → [GUARDS] → Interceptors → Pipes → Handler
 *
 * Guards have a single responsibility:
 * - Return TRUE to allow the request
 * - Return FALSE or throw exception to deny the request
 *
 * Key characteristics:
 * 1. Have access to ExecutionContext (know which handler will be called)
 * 2. Can check metadata (roles, permissions, etc.)
 * 3. Run AFTER middleware, BEFORE interceptors and pipes
 * 4. Can be sync or async (return boolean or Promise<boolean>)
 *
 * ============================================================
 * GUARD vs MIDDLEWARE
 * ============================================================
 *
 * MIDDLEWARE:
 * - No knowledge of what handler will be called
 * - Only has access to Request, Response, Next
 * - Good for: logging, parsing, general request manipulation
 *
 * GUARDS:
 * - Has ExecutionContext (knows the handler, class, metadata)
 * - Can use Reflector to read metadata
 * - Good for: authorization, role checks, feature flags
 *
 * ============================================================
 * AUTH GUARD FLOW
 * ============================================================
 *
 *    Request arrives
 *         ↓
 *    [Is route @Public()?] ──YES──→ Allow (return true)
 *         ↓ NO
 *    [Has Authorization header?] ──NO──→ Throw UnauthorizedException
 *         ↓ YES
 *    [Is token valid?] ──NO──→ Throw UnauthorizedException
 *         ↓ YES
 *    [Attach user to request]
 *         ↓
 *    Allow (return true)
 *
 * ============================================================
 */

@Injectable()
export class AuthGuard implements CanActivate {
  private readonly logger = new Logger(AuthGuard.name);

  // Mock valid tokens for demo
  private readonly validTokens = new Map([
    ["valid-token", { id: "1", email: "user@example.com", role: "user" }],
    ["admin-token", { id: "2", email: "admin@example.com", role: "admin" }],
    [
      "moderator-token",
      { id: "3", email: "mod@example.com", role: "moderator" },
    ],
  ]);

  constructor(private reflector: Reflector) {}

  canActivate(
    context: ExecutionContext
  ): boolean | Promise<boolean> | Observable<boolean> {
    // ============================================================
    // Step 1: Check if route is marked as @Public()
    // ============================================================
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(), // Check method-level decorator
      context.getClass(), // Check class-level decorator
    ]);

    if (isPublic) {
      this.logger.debug("[GUARD] Route is public, skipping auth");
      return true;
    }

    // ============================================================
    // Step 2: Extract and validate the token
    // ============================================================
    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers.authorization;

    this.logger.debug(
      `[GUARD] Checking authorization for ${request.method} ${request.url}`
    );

    if (!authHeader) {
      this.logger.warn("[GUARD] No authorization header");
      throw new UnauthorizedException("Authorization header is required");
    }

    const [type, token] = authHeader.split(" ");

    if (type !== "Bearer" || !token) {
      this.logger.warn("[GUARD] Invalid authorization format");
      throw new UnauthorizedException(
        "Invalid authorization format. Use: Bearer <token>"
      );
    }

    // ============================================================
    // Step 3: Validate token and get user
    // ============================================================
    const user = this.validTokens.get(token);

    if (!user) {
      this.logger.warn(`[GUARD] Invalid token: ${token.substring(0, 10)}...`);
      throw new UnauthorizedException("Invalid or expired token");
    }

    // ============================================================
    // Step 4: Attach user to request for later use
    // ============================================================
    request.user = user;
    this.logger.log(`[GUARD] Authenticated: ${user.email} (${user.role})`);

    return true;
  }
}
