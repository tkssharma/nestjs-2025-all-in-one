/**
 * ============================================================
 * BUILT-IN PIPES IN NESTJS
 * ============================================================
 *
 * NestJS provides several built-in pipes out of the box:
 *
 * 1. ValidationPipe
 *    - Validates incoming data against DTOs using class-validator
 *    - Most commonly used pipe
 *    - Can transform plain objects to class instances
 *
 * 2. ParseIntPipe
 *    - Transforms string to integer
 *    - Throws BadRequestException if conversion fails
 *    - Usage: @Param('id', ParseIntPipe) id: number
 *
 * 3. ParseFloatPipe
 *    - Transforms string to float
 *    - Usage: @Query('price', ParseFloatPipe) price: number
 *
 * 4. ParseBoolPipe
 *    - Transforms string to boolean
 *    - Accepts: 'true', 'false', '1', '0'
 *    - Usage: @Query('active', ParseBoolPipe) active: boolean
 *
 * 5. ParseArrayPipe
 *    - Transforms string to array
 *    - Can validate array items
 *    - Usage: @Query('ids', new ParseArrayPipe({ items: Number }))
 *
 * 6. ParseUUIDPipe
 *    - Validates UUID format
 *    - Supports versions 3, 4, 5
 *    - Usage: @Param('id', ParseUUIDPipe) id: string
 *
 * 7. ParseEnumPipe
 *    - Validates enum values
 *    - Usage: @Param('status', new ParseEnumPipe(StatusEnum))
 *
 * 8. DefaultValuePipe
 *    - Provides default value if undefined/null
 *    - Usage: @Query('page', new DefaultValuePipe(1), ParseIntPipe)
 *
 * 9. ParseFilePipe
 *    - Validates uploaded files
 *    - Can check file size, type, etc.
 *
 * ============================================================
 * PIPES EXECUTION ORDER
 * ============================================================
 *
 * When multiple pipes are applied, they execute in this order:
 *
 * 1. Global pipes (registered in main.ts or via APP_PIPE)
 * 2. Controller-level pipes (@UsePipes on controller)
 * 3. Method-level pipes (@UsePipes on method)
 * 4. Parameter-level pipes (@Param('id', SomePipe))
 *
 * Within each level, pipes execute left to right:
 * @UsePipes(Pipe1, Pipe2, Pipe3) → Pipe1 → Pipe2 → Pipe3
 *
 * ============================================================
 */

export const BUILT_IN_PIPES_INFO = {
  ValidationPipe: "Validates DTOs using class-validator decorators",
  ParseIntPipe: "Transforms string to integer",
  ParseFloatPipe: "Transforms string to float",
  ParseBoolPipe: "Transforms string to boolean",
  ParseArrayPipe: "Transforms string to array",
  ParseUUIDPipe: "Validates UUID format",
  ParseEnumPipe: "Validates enum values",
  DefaultValuePipe: "Provides default value if undefined",
  ParseFilePipe: "Validates uploaded files",
};
