import { SetMetadata } from "@nestjs/common";

/**
 * ============================================================
 * @Roles() DECORATOR
 * ============================================================
 *
 * Sets required roles for a route.
 * Used by RolesGuard to check user permissions.
 *
 * Usage:
 * @Roles('admin')
 * @Roles('admin',"viewer")
 * @Get("/users")
 * ============================================================
 */

export const ROLES_KEY = "roles";
export const Roles = (...roles: string[]) => SetMetadata(ROLES_KEY, roles);
