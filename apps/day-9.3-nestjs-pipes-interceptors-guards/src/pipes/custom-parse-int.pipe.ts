import {
  PipeTransform,
  Injectable,
  ArgumentMetadata,
  BadRequestException,
  Logger,
} from "@nestjs/common";

/**
 * ============================================================
 * CUSTOM PIPE - ParseIntPipe with Enhanced Validation
 * ============================================================
 *
 * This custom pipe demonstrates:
 * 1. Implementing PipeTransform interface
 * 2. Using ArgumentMetadata for context
 * 3. Custom validation logic
 * 4. Throwing appropriate exceptions
 *
 * Pipes have TWO main purposes:
 * 1. TRANSFORMATION: Convert input data to desired form
 * 2. VALIDATION: Validate input data and throw if invalid
 *
 * ============================================================
 */

export interface CustomParseIntPipeOptions {
  min?: number;
  max?: number;
  optional?: boolean;
}

@Injectable()
export class CustomParseIntPipe implements PipeTransform<string, number> {
  private readonly logger = new Logger(CustomParseIntPipe.name);
  private readonly min: number;
  private readonly max: number;
  private readonly optional: boolean;

  constructor(options: CustomParseIntPipeOptions = {}) {
    this.min = options.min ?? Number.MIN_SAFE_INTEGER;
    this.max = options.max ?? Number.MAX_SAFE_INTEGER;
    this.optional = options.optional ?? false;
  }

  /**
   * The transform method receives:
   * @param value - The incoming value to transform
   * @param metadata - Contains type, metatype, and data (parameter name)
   */
  transform(value: string, metadata: ArgumentMetadata): number {
    this.logger.debug(
      `[PIPE] Transforming "${value}" | Type: ${metadata.type} | Data: ${metadata.data}`
    );

    // Handle optional values
    if (
      this.optional &&
      (value === undefined || value === null || value === "")
    ) {
      return undefined as any;
    }

    // Validate that value exists
    if (value === undefined || value === null || value === "") {
      throw new BadRequestException(
        `Validation failed: "${metadata.data}" is required`
      );
    }

    // Attempt to parse the integer
    const parsedValue = parseInt(value, 10);

    // Check if parsing was successful
    if (isNaN(parsedValue)) {
      throw new BadRequestException(
        `Validation failed: "${metadata.data}" must be a valid integer (received: "${value}")`
      );
    }

    // Check minimum bound
    if (parsedValue < this.min) {
      throw new BadRequestException(
        `Validation failed: "${metadata.data}" must be at least ${this.min} (received: ${parsedValue})`
      );
    }

    // Check maximum bound
    if (parsedValue > this.max) {
      throw new BadRequestException(
        `Validation failed: "${metadata.data}" must be at most ${this.max} (received: ${parsedValue})`
      );
    }

    this.logger.debug(`[PIPE] Successfully transformed to: ${parsedValue}`);
    return parsedValue;
  }
}
