import { SetMetadata } from "@nestjs/common";

/**
 * ============================================================
 * @Public() DECORATOR
 * ============================================================
 *
 * Marks a route as public, bypassing authentication.
 * Used by AuthGuard to skip token validation.
 *
 * Usage:
 * @Public()
 * @Get('health')
 * healthCheck() { return 'OK'; }
 *
 * ============================================================
 */

export const IS_PUBLIC_KEY = "isPublic";
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);
