import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  ParseIntPipe,
  ParseBoolPipe,
  ParseUUIDPipe,
  DefaultValuePipe,
  UsePipes,
  ValidationPipe,
} from "@nestjs/common";
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiQuery,
  ApiParam,
} from "@nestjs/swagger";
import {
  IsString,
  IsEmail,
  MinLength,
  IsOptional,
  IsInt,
  Min,
} from "class-validator";
import { CustomParseIntPipe } from "../pipes/custom-parse-int.pipe";
import { TrimStringsPipe } from "../pipes/trim-strings.pipe";
import { Public } from "../decorators/public.decorator";

// ============================================================
// DTOs for validation demos
// ============================================================

class CreateUserDto {
  @IsString()
  @MinLength(2)
  name: string;

  @IsEmail()
  email: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  age?: number;
}

class QueryDto {
  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  page?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  limit?: number;
}

@ApiTags("Pipes Demo")
@Controller("pipes")
export class PipesDemoController {
  // ============================================================
  // BUILT-IN PIPES DEMO
  // ============================================================

  @Get("parse-int/:id")
  @Public()
  @ApiOperation({ summary: "Demo: ParseIntPipe (built-in)" })
  @ApiParam({ name: "id", description: "Numeric ID" })
  @ApiResponse({ status: 200, description: "Successfully parsed integer" })
  @ApiResponse({ status: 400, description: "Invalid integer" })
  parseIntDemo(@Param("id", ParseIntPipe) id: number) {
    return {
      message: "ParseIntPipe successfully converted string to number",
      receivedValue: id,
      type: typeof id,
      explanation: 'ParseIntPipe transforms "123" string to 123 number',
    };
  }

  @Get("parse-bool")
  @Public()
  @ApiOperation({ summary: "Demo: ParseBoolPipe (built-in)" })
  @ApiQuery({ name: "active", description: "Boolean value (true/false/1/0)" })
  parseBoolDemo(@Query("active", ParseBoolPipe) active: boolean) {
    return {
      message: "ParseBoolPipe successfully converted string to boolean",
      receivedValue: active,
      type: typeof active,
      acceptedValues: ["true", "false", "1", "0"],
    };
  }

  @Get("parse-uuid/:uuid")
  @Public()
  @ApiOperation({ summary: "Demo: ParseUUIDPipe (built-in)" })
  @ApiParam({ name: "uuid", description: "Valid UUID" })
  parseUuidDemo(@Param("uuid", ParseUUIDPipe) uuid: string) {
    return {
      message: "ParseUUIDPipe validated UUID format",
      receivedValue: uuid,
      valid: true,
    };
  }

  @Get("default-value")
  @Public()
  @ApiOperation({ summary: "Demo: DefaultValuePipe (built-in)" })
  @ApiQuery({
    name: "page",
    required: false,
    description: "Page number (default: 1)",
  })
  @ApiQuery({
    name: "limit",
    required: false,
    description: "Items per page (default: 10)",
  })
  defaultValueDemo(
    @Query("page", new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query("limit", new DefaultValuePipe(10), ParseIntPipe) limit: number
  ) {
    return {
      message: "DefaultValuePipe provides fallback values",
      page,
      limit,
      explanation: "If not provided, page defaults to 1, limit defaults to 10",
    };
  }

  // ============================================================
  // CUSTOM PIPES DEMO
  // ============================================================

  @Get("custom-parse-int/:id")
  @Public()
  @ApiOperation({ summary: "Demo: Custom ParseIntPipe with validation" })
  @ApiParam({ name: "id", description: "Number between 1 and 100" })
  customParseIntDemo(
    @Param("id", new CustomParseIntPipe({ min: 1, max: 100 })) id: number
  ) {
    return {
      message: "Custom ParseIntPipe with min/max validation",
      receivedValue: id,
      constraints: { min: 1, max: 100 },
    };
  }

  @Post("trim-strings")
  @Public()
  @UsePipes(new TrimStringsPipe())
  @ApiOperation({ summary: "Demo: TrimStringsPipe (custom)" })
  trimStringsDemo(@Body() body: any) {
    return {
      message: "TrimStringsPipe automatically trims all string values",
      receivedBody: body,
      explanation: "Leading/trailing whitespace removed from all strings",
    };
  }

  // ============================================================
  // VALIDATION PIPE DEMO
  // ============================================================

  @Post("validation")
  @Public()
  @ApiOperation({ summary: "Demo: ValidationPipe with DTO" })
  validationDemo(@Body() createUserDto: CreateUserDto) {
    return {
      message: "ValidationPipe validated and transformed the DTO",
      receivedData: createUserDto,
      explanation: {
        transform: "Plain object converted to class instance",
        whitelist: "Unknown properties stripped",
        validation: "class-validator decorators applied",
      },
    };
  }

  // ============================================================
  // PIPES EXECUTION ORDER DEMO
  // ============================================================

  @Get("execution-order")
  @Public()
  @ApiOperation({ summary: "Explain pipes execution order" })
  executionOrderDemo() {
    return {
      title: "Pipes Execution Order",
      order: [
        "1. Global pipes (registered in main.ts via useGlobalPipes)",
        "2. Global pipes (registered in module via APP_PIPE)",
        "3. Controller-level pipes (@UsePipes on controller)",
        "4. Method-level pipes (@UsePipes on method)",
        '5. Parameter-level pipes (@Param("id", SomePipe))',
      ],
      withinSameLevel:
        "Left to right: @UsePipes(Pipe1, Pipe2) → Pipe1 then Pipe2",
      diagram: `
        Request Body/Param/Query
              ↓
        [Global Pipes]
              ↓
        [Controller Pipes]
              ↓
        [Method Pipes]
              ↓
        [Parameter Pipes]
              ↓
        Route Handler receives transformed/validated data
      `,
    };
  }

  @Get("global-vs-controller")
  @Public()
  @ApiOperation({ summary: "Explain Global vs Controller pipes" })
  globalVsControllerDemo() {
    return {
      title: "Global Pipes vs Controller Pipes",
      globalPipes: {
        registration: [
          "app.useGlobalPipes() in main.ts (cannot inject dependencies)",
          "APP_PIPE in module providers (can inject dependencies)",
        ],
        scope: "Applied to ALL routes in the entire application",
        useCase: "ValidationPipe for all endpoints",
      },
      controllerPipes: {
        registration: "@UsePipes() decorator on controller class",
        scope: "Applied only to routes within that controller",
        useCase: "Specific transformation for a group of endpoints",
      },
      methodPipes: {
        registration: "@UsePipes() decorator on method",
        scope: "Applied only to that specific route",
        useCase: "One-off transformations",
      },
      parameterPipes: {
        registration:
          'Inline in parameter decorator: @Param("id", ParseIntPipe)',
        scope: "Applied only to that specific parameter",
        useCase: "Type conversion and validation of individual params",
      },
    };
  }
}
