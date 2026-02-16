import { Controller, Get, UseGuards } from "@nestjs/common";
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from "@nestjs/swagger";
import { AuthGuard } from "../guards/auth.guard";
import { RolesGuard } from "../guards/roles.guard";
import { Public } from "../decorators/public.decorator";
import { Roles } from "../decorators/roles.decorator";
import { CurrentUser } from "../decorators/user.decorator";

@ApiTags("Guards Demo")
@Controller("guards")
export class GuardsDemoController {
  @Get("public")
  @Public()
  @ApiOperation({ summary: "Public route (no auth required)" })
  @ApiResponse({ status: 200, description: "Accessible to everyone" })
  publicRoute() {
    return {
      message: "This is a public route",
      authRequired: false,
      explanation: "@Public() decorator bypasses AuthGuard",
    };
  }

  @Get("protected")
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Protected route (auth required)" })
  @ApiResponse({ status: 200, description: "Authenticated access" })
  @ApiResponse({ status: 401, description: "Unauthorized" })
  protectedRoute(@CurrentUser() user: any) {
    return {
      message: "You are authenticated!",
      user,
      authRequired: true,
    };
  }

  @Get("admin-only")
  @UseGuards(AuthGuard, RolesGuard)
  @Roles("admin")
  @ApiBearerAuth()
  @ApiOperation({ summary: "Admin only route" })
  @ApiResponse({ status: 200, description: "Admin access granted" })
  @ApiResponse({ status: 401, description: "Unauthorized" })
  @ApiResponse({ status: 403, description: "Forbidden - Admin role required" })
  adminOnlyRoute(@CurrentUser() user: any) {
    return {
      message: "Welcome, Admin!",
      user,
      requiredRoles: ["admin"],
    };
  }

  @Get("moderator-or-admin")
  @UseGuards(AuthGuard, RolesGuard)
  @Roles("admin", "moderator")
  @ApiBearerAuth()
  @ApiOperation({ summary: "Admin or Moderator route" })
  @ApiResponse({ status: 200, description: "Access granted" })
  @ApiResponse({ status: 403, description: "Forbidden" })
  moderatorOrAdminRoute(@CurrentUser() user: any) {
    return {
      message: "Welcome, staff member!",
      user,
      requiredRoles: ["admin", "moderator"],
    };
  }

  @Get("guard-flow")
  @Public()
  @ApiOperation({ summary: "Explain auth guard flow" })
  guardFlowDemo() {
    return {
      title: "Auth Guard Flow Explained",
      flow: {
        step1: "Request arrives with Authorization header",
        step2: "Guard checks for @Public() decorator",
        step3: "If public, skip auth and return true",
        step4: 'Extract token from "Bearer <token>"',
        step5: "Validate token (check against valid tokens)",
        step6: "If valid, attach user to request object",
        step7: "Return true to allow request",
        step8: "If invalid, throw UnauthorizedException",
      },
      diagram: `
        Request with Authorization: Bearer <token>
                        ↓
        ┌──────────────────────────────────┐
        │         AuthGuard                │
        │  ┌────────────────────────────┐  │
        │  │ Is route @Public()?        │  │
        │  │ YES → return true (skip)   │  │
        │  │ NO  → continue ↓           │  │
        │  └────────────────────────────┘  │
        │  ┌────────────────────────────┐  │
        │  │ Has Authorization header?  │  │
        │  │ NO  → throw 401            │  │
        │  │ YES → continue ↓           │  │
        │  └────────────────────────────┘  │
        │  ┌────────────────────────────┐  │
        │  │ Is token valid?            │  │
        │  │ NO  → throw 401            │  │
        │  │ YES → attach user, true    │  │
        │  └────────────────────────────┘  │
        └──────────────────────────────────┘
                        ↓
        Request continues to handler
      `,
    };
  }

  @Get("middleware-vs-guards")
  @Public()
  @ApiOperation({ summary: "Middleware vs Guards vs Interceptors" })
  middlewareVsGuardsDemo() {
    return {
      title: "Middleware vs Guards vs Interceptors",
      comparison: {
        middleware: {
          executionOrder: "1st (before guards)",
          hasExecutionContext: false,
          hasAccessTo: ["Request", "Response", "next()"],
          canReadMetadata: false,
          purpose: "Request manipulation, logging, parsing",
          example: "CORS, body parsing, request logging",
          whenToUse: "Generic request processing",
          whenNotToUse: [
            "Authorization (use guards)",
            "Response transformation (use interceptors)",
            "When you need handler metadata",
          ],
        },
        guards: {
          executionOrder: "2nd (after middleware)",
          hasExecutionContext: true,
          hasAccessTo: ["ExecutionContext", "Reflector"],
          canReadMetadata: true,
          purpose: "Authorization, access control",
          example: "AuthGuard, RolesGuard",
          whenToUse: "Deciding if request should proceed",
        },
        interceptors: {
          executionOrder: "3rd (wrap around handler)",
          hasExecutionContext: true,
          hasAccessTo: ["ExecutionContext", "CallHandler", "RxJS"],
          canReadMetadata: true,
          purpose: "Transform request/response, caching, logging",
          example: "LoggingInterceptor, CacheInterceptor",
          whenToUse: "Cross-cutting concerns around handler",
        },
      },
      orderDiagram: `
        Request → Middleware → Guards → Interceptors(before)
                                              ↓
                                          → Pipes
                                              ↓
                                          → Handler
                                              ↓
                                    Interceptors(after) → Response
      `,
    };
  }

  @Get("global-vs-route")
  @Public()
  @ApiOperation({ summary: "Global Guards vs Route Guards" })
  globalVsRouteDemo() {
    return {
      title: "Global Guards vs Route Guards",
      globalGuards: {
        registration: [
          "app.useGlobalGuards() in main.ts",
          "APP_GUARD in module providers",
        ],
        scope: "Applied to ALL routes",
        recommendation: "Use APP_GUARD for dependency injection support",
      },
      routeGuards: {
        controller: "@UseGuards() on controller class",
        method: "@UseGuards() on specific method",
        scope: "Applied only where decorated",
      },
      executionOrder: [
        "1. Global guards (in registration order)",
        "2. Controller-level guards",
        "3. Method-level guards",
      ],
      multipleGuards: "All guards must return true for request to proceed",
    };
  }
}
