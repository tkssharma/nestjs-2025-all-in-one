import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Logger,
} from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { ROLES_KEY } from "../decorators/roles.decorator";

/**
 * ============================================================
 * ROLES GUARD
 * ============================================================
 *
 * Checks if the authenticated user has the required roles
 * to access the route.
 *
 * This guard should be used AFTER AuthGuard, as it expects
 * request.user to be populated.
 *
 * Usage:
 * @UseGuards(AuthGuard, RolesGuard)
 * @Roles('admin', 'moderator')
 *
 * ============================================================
 */

@Injectable()
export class RolesGuard implements CanActivate {
  private readonly logger = new Logger(RolesGuard.name);

  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    // ============================================================
    // Step 1: Get required roles from metadata
    // ============================================================
    const requiredRoles = this.reflector.getAllAndOverride<string[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()]
    );

    // No roles required = allow access
    if (!requiredRoles || requiredRoles.length === 0) {
      this.logger.debug("[GUARD] No roles required for this route");
      return true;
    }

    this.logger.debug(`[GUARD] Required roles: ${requiredRoles.join(", ")}`);

    // ============================================================
    // Step 2: Get user from request
    // ============================================================
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user) {
      this.logger.warn(
        "[GUARD] No user found on request (AuthGuard not applied?)"
      );
      throw new ForbiddenException("User not authenticated");
    }

    // ============================================================
    // Step 3: Check if user has required role
    // ============================================================
    const hasRole = requiredRoles.some((role) => user.role === role);

    if (!hasRole) {
      this.logger.warn(
        `[GUARD] Access denied: User role "${
          user.role
        }" not in required roles [${requiredRoles.join(", ")}]`
      );
      throw new ForbiddenException(
        `Access denied. Required roles: ${requiredRoles.join(", ")}`
      );
    }

    this.logger.log(`[GUARD] Access granted: User has role "${user.role}"`);
    return true;
  }
}
