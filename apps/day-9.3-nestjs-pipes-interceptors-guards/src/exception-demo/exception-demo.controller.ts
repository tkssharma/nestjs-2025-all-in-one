import {
  Controller,
  Get,
  Query,
  HttpException,
  HttpStatus,
  BadRequestException,
  NotFoundException,
  ForbiddenException,
  InternalServerErrorException,
  UseFilters,
} from "@nestjs/common";
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from "@nestjs/swagger";
import { HttpExceptionFilter } from "../exception-filters/http-exception.filter";
import {
  BusinessException,
  ResourceNotFoundException,
  ValidationException,
} from "../exception-filters/custom-exceptions";
import { Public } from "../decorators/public.decorator";

@ApiTags("Exception Demo")
@Controller("exceptions")
export class ExceptionDemoController {
  @Get("bad-request")
  @Public()
  @ApiOperation({ summary: "Demo: BadRequestException (400)" })
  @ApiResponse({ status: 400, description: "Bad request error" })
  badRequestDemo() {
    throw new ForbiddenException("This is a bad request");
  }

  @Get("not-found")
  @Public()
  @ApiOperation({ summary: "Demo: NotFoundException (404)" })
  @ApiResponse({ status: 404, description: "Not found error" })
  notFoundDemo() {
    throw new NotFoundException("Resource not found");
  }

  @Get("forbidden")
  @Public()
  @ApiOperation({ summary: "Demo: ForbiddenException (403)" })
  @ApiResponse({ status: 403, description: "Forbidden error" })
  forbiddenDemo() {
    throw new ForbiddenException("Access denied");
  }

  @Get("internal-error")
  @Public()
  @ApiOperation({ summary: "Demo: InternalServerErrorException (500)" })
  @ApiResponse({ status: 500, description: "Internal server error" })
  internalErrorDemo() {
    throw new InternalServerErrorException("Something went wrong");
  }

  @Get("custom-http")
  @Public()
  @ApiOperation({ summary: "Demo: Custom HttpException" })
  @ApiQuery({
    name: "status",
    required: false,
    description: "HTTP status code",
  })
  @ApiResponse({ status: 418, description: "Custom HTTP exception" })
  customHttpDemo(@Query("status") status?: string) {
    const statusCode = parseInt(status || "418", 10);
    throw new HttpException(
      {
        statusCode,
        message: "Custom HTTP exception",
        customField: "You can include any data here",
      },
      statusCode
    );
  }

  @Get("business-error")
  @Public()
  @ApiOperation({ summary: "Demo: Custom BusinessException" })
  @ApiResponse({ status: 400, description: "Business logic error" })
  businessErrorDemo() {
    throw new BusinessException(
      "Insufficient funds for this operation",
      "INSUFFICIENT_FUNDS"
    );
  }

  @Get("resource-not-found")
  @Public()
  @ApiOperation({ summary: "Demo: Custom ResourceNotFoundException" })
  @ApiResponse({ status: 404, description: "Resource not found" })
  resourceNotFoundDemo() {
    throw new ResourceNotFoundException("User", 123);
  }

  @Get("validation-error")
  @Public()
  @ApiOperation({ summary: "Demo: Custom ValidationException" })
  @ApiResponse({ status: 422, description: "Validation error" })
  validationErrorDemo() {
    throw new ValidationException({
      email: ["Invalid email format", "Email is required"],
      password: ["Password must be at least 8 characters"],
    });
  }

  @Get("unhandled")
  @Public()
  @ApiOperation({
    summary: "Demo: Unhandled Error (caught by AllExceptionsFilter)",
  })
  @ApiResponse({ status: 500, description: "Unhandled error" })
  unhandledErrorDemo() {
    // This throws a regular Error, not an HttpException
    // It will be caught by AllExceptionsFilter
    throw new Error("This is an unhandled error");
  }

  @Get("with-filter")
  @Public()
  @UseFilters(HttpExceptionFilter)
  @ApiOperation({ summary: "Demo: Route with explicit exception filter" })
  @ApiResponse({ status: 400, description: "Error handled by filter" })
  withFilterDemo() {
    throw new BadRequestException({
      message: "Handled by HttpExceptionFilter",
      details: "This route has @UseFilters decorator",
    });
  }

  @Get("error-flow")
  @Public()
  @ApiOperation({ summary: "Explain error flow in NestJS" })
  errorFlowDemo() {
    return {
      title: "Error Flow Inside NestJS",
      defaultBehavior: {
        httpException: "Returns exception response with status code",
        unknownError: "Returns 500 Internal Server Error",
      },
      flow: {
        step1: "Handler throws an exception",
        step2: "Exception bubbles up through interceptors",
        step3: "Exception filters catch the exception",
        step4: "Most specific filter runs first (method → controller → global)",
        step5: "Filter formats and sends error response",
      },
      diagram: `
        Handler throws error
              ↓
        Interceptors (catchError in RxJS)
              ↓
        Exception Filters
              │
        ┌─────┴─────┐
        ↓           ↓
        @Catch(HttpException)    @Catch() (all)
              │                       │
              └───────────────────────┘
                        ↓
                Error Response
      `,
      filterPriority: [
        "1. Method-level filters (@UseFilters on method)",
        "2. Controller-level filters (@UseFilters on controller)",
        "3. Global filters (APP_FILTER or app.useGlobalFilters)",
      ],
    };
  }

  @Get("http-vs-custom")
  @Public()
  @ApiOperation({ summary: "HttpException vs Custom Errors" })
  httpVsCustomDemo() {
    return {
      title: "HttpException vs Custom Errors",
      httpException: {
        description: "Built-in NestJS exception class",
        builtInTypes: [
          "BadRequestException (400)",
          "UnauthorizedException (401)",
          "ForbiddenException (403)",
          "NotFoundException (404)",
          "ConflictException (409)",
          "GoneException (410)",
          "PayloadTooLargeException (413)",
          "UnprocessableEntityException (422)",
          "InternalServerErrorException (500)",
          "NotImplementedException (501)",
          "BadGatewayException (502)",
          "ServiceUnavailableException (503)",
          "GatewayTimeoutException (504)",
        ],
        usage: 'throw new BadRequestException("Invalid input")',
      },
      customExceptions: {
        description: "Extend HttpException for domain-specific errors",
        benefits: [
          "Type-safe error handling",
          "Consistent error codes",
          "Additional metadata",
          "Better error categorization",
        ],
        example: `
          export class BusinessException extends HttpException {
            constructor(message: string, errorCode: string) {
              super({ message, errorCode }, HttpStatus.BAD_REQUEST);
            }
          }
        `,
      },
    };
  }

  @Get("global-filters")
  @Public()
  @ApiOperation({ summary: "Global Exception Filters Explained" })
  globalFiltersDemo() {
    return {
      title: "Global Exception Filters",
      registration: {
        appLevel: {
          method: "app.useGlobalFilters()",
          location: "main.ts",
          canInjectDependencies: false,
          example: "app.useGlobalFilters(new AllExceptionsFilter())",
        },
        moduleLevel: {
          method: "APP_FILTER provider",
          location: "Any module (usually AppModule)",
          canInjectDependencies: true,
          example: "{ provide: APP_FILTER, useClass: AllExceptionsFilter }",
        },
      },
      recommendation:
        "Use APP_FILTER when you need to inject services (ConfigService, Logger)",
      multipleFilters:
        "You can have multiple global filters - they run in registration order",
    };
  }
}
