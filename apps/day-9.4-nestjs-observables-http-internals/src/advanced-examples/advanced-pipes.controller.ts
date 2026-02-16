import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  UsePipes,
  ParseIntPipe,
  ParseBoolPipe,
  ParseArrayPipe,
  ParseEnumPipe,
  DefaultValuePipe,
  HttpStatus,
  BadRequestException,
} from "@nestjs/common";
import { ApiTags, ApiOperation, ApiQuery, ApiBody } from "@nestjs/swagger";

enum UserRole {
  ADMIN = "admin",
  USER = "user",
  MODERATOR = "moderator",
}

/**
 * ============================================================
 * PIPES & VALIDATION BEYOND BASICS
 * ============================================================
 */

@ApiTags("Advanced Pipes")
@Controller("pipes")
export class AdvancedPipesController {
  @Get("parse-int/:id")
  @ApiOperation({ summary: "ParseIntPipe with custom error" })
  parseIntDemo(
    @Param(
      "id",
      new ParseIntPipe({
        errorHttpStatusCode: HttpStatus.NOT_ACCEPTABLE,
        exceptionFactory: (error) => {
          return new BadRequestException(
            `"${error}" is not a valid ID. Must be a number.`
          );
        },
      })
    )
    id: number
  ) {
    return { id, type: typeof id };
  }

  @Get("parse-bool")
  @ApiOperation({ summary: "ParseBoolPipe demo" })
  @ApiQuery({ name: "active", required: false })
  parseBoolDemo(
    @Query("active", new ParseBoolPipe({ optional: true }))
    active?: boolean
  ) {
    return {
      active,
      type: typeof active,
      acceptedValues: ["true", "false", "1", "0"],
    };
  }

  @Get("parse-array")
  @ApiOperation({ summary: "ParseArrayPipe demo" })
  @ApiQuery({ name: "ids", description: "Comma-separated IDs" })
  parseArrayDemo(
    @Query(
      "ids",
      new ParseArrayPipe({
        items: Number,
        separator: ",",
        optional: false,
      })
    )
    ids: number[]
  ) {
    return {
      ids,
      count: ids.length,
      sum: ids.reduce((a, b) => a + b, 0),
    };
  }

  @Get("parse-enum/:role")
  @ApiOperation({ summary: "ParseEnumPipe demo" })
  parseEnumDemo(
    @Param("role", new ParseEnumPipe(UserRole))
    role: UserRole
  ) {
    return {
      role,
      allowedValues: Object.values(UserRole),
    };
  }

  @Get("default-value")
  @ApiOperation({ summary: "DefaultValuePipe demo" })
  @ApiQuery({ name: "page", required: false })
  @ApiQuery({ name: "limit", required: false })
  defaultValueDemo(
    @Query("page", new DefaultValuePipe(1), ParseIntPipe)
    page: number,
    @Query("limit", new DefaultValuePipe(10), ParseIntPipe)
    limit: number
  ) {
    return {
      page,
      limit,
      offset: (page - 1) * limit,
      explanation:
        "DefaultValuePipe provides fallback, then ParseIntPipe transforms",
    };
  }

  @Get("pipe-chaining")
  @ApiOperation({ summary: "Multiple pipes in sequence" })
  @ApiQuery({ name: "value", required: false })
  pipeChaining(
    @Query("value", new DefaultValuePipe("100"), ParseIntPipe)
    value: number
  ) {
    return {
      value,
      explanation: "Pipes execute left-to-right: DefaultValue → ParseInt",
    };
  }

  @Get("pipe-patterns")
  @ApiOperation({ summary: "Advanced pipe patterns" })
  getPipePatterns() {
    return {
      title: "Advanced Pipe Patterns",
      patterns: {
        conditionalValidation: {
          description: "Validate based on other fields",
          example: `
            @ValidateIf(o => o.type === 'premium')
            @IsNotEmpty()
            subscriptionId: string;
          `,
        },
        customTransform: {
          description: "Transform input before validation",
          example: `
            @Transform(({ value }) => value.toLowerCase().trim())
            @IsEmail()
            email: string;
          `,
        },
        nestedValidation: {
          description: "Validate nested objects",
          example: `
            @ValidateNested()
            @Type(() => AddressDto)
            address: AddressDto;
          `,
        },
        arrayValidation: {
          description: "Validate array items",
          example: `
            @IsArray()
            @ValidateNested({ each: true })
            @Type(() => ItemDto)
            items: ItemDto[];
          `,
        },
        customDecorators: {
          description: "Create reusable validation decorators",
          example: `
            export function IsStrongPassword() {
              return applyDecorators(
                MinLength(8),
                Matches(/[A-Z]/),
                Matches(/[0-9]/),
              );
            }
          `,
        },
      },
      performanceTips: [
        "Use whitelist: true to strip unknown properties",
        "Use forbidNonWhitelisted: true to reject unknown",
        "Skip validation for internal endpoints",
        "Cache transformed classes where possible",
      ],
    };
  }

  @Get("validation-groups")
  @ApiOperation({ summary: "Validation groups pattern" })
  getValidationGroups() {
    return {
      title: "Validation Groups",
      description: "Different validation rules for create vs update",
      example: `
        // DTO
        export class UserDto {
          @IsNotEmpty({ groups: ['create'] })
          @IsOptional({ groups: ['update'] })
          name: string;
          
          @IsEmail({}, { groups: ['create', 'update'] })
          email: string;
        }
        
        // Controller
        @Post()
        @UsePipes(new ValidationPipe({ groups: ['create'] }))
        create(@Body() dto: UserDto) {}
        
        @Patch(':id')
        @UsePipes(new ValidationPipe({ groups: ['update'] }))
        update(@Body() dto: UserDto) {}
      `,
    };
  }
}
