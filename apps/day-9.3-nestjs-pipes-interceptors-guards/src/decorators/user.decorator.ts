import { createParamDecorator, ExecutionContext } from "@nestjs/common";

/**
 * ============================================================
 * @CurrentUser() DECORATOR
 * ============================================================
 *
 * Extracts the user object from the request.
 * The user is attached by AuthGuard after successful authentication.
 *
 * Usage:
 * @Get('profile')
 * getProfile(@CurrentUser() user: User) { return user; }
 *
 * @Get('profile')
 * getEmail(@CurrentUser() user: UserDto) { return email; }
 *
 * ============================================================
 */

export const CurrentUser = createParamDecorator(
  (data: string | undefined, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const user = request.user;

    // If data is provided, return specific property
    return data ? user?.[data] : user;
  }
);
