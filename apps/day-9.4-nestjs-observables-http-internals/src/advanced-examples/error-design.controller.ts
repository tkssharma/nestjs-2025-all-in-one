import {
  Controller,
  Get,
  HttpException,
  HttpStatus,
  NotFoundException,
  BadRequestException,
} from "@nestjs/common";
import { ApiTags, ApiOperation } from "@nestjs/swagger";

/**
 * Exception Filters & Error Design Demo
 * Full documentation: docs/06-exception-filters.md
 */

@ApiTags("Error Design")
@Controller("errors")
export class ErrorDesignController {
  @Get("not-found")
  @ApiOperation({ summary: "Demo: NotFoundException" })
  throwNotFound() {
    throw new NotFoundException("Resource not found");
  }

  @Get("bad-request")
  @ApiOperation({ summary: "Demo: BadRequestException" })
  throwBadRequest() {
    throw new BadRequestException("Invalid input provided");
  }

  @Get("custom")
  @ApiOperation({ summary: "Demo: Custom exception with code" })
  throwCustom() {
    throw new HttpException(
      {
        statusCode: HttpStatus.UNPROCESSABLE_ENTITY,
        code: "USER_002",
        message: "Email already exists",
      },
      HttpStatus.UNPROCESSABLE_ENTITY
    );
  }

  @Get("demo")
  @ApiOperation({ summary: "Error handling info" })
  getErrorInfo() {
    return {
      availableEndpoints: [
        "/errors/not-found",
        "/errors/bad-request",
        "/errors/custom",
      ],
      documentation: "See docs/06-exception-filters.md for full guide",
    };
  }
}
