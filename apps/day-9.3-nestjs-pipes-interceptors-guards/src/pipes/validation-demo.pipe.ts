import {
  PipeTransform,
  Injectable,
  ArgumentMetadata,
  BadRequestException,
  Logger,
} from "@nestjs/common";
import { validate } from "class-validator";
import { plainToInstance } from "class-transformer";

/**
 * ============================================================
 * VALIDATION PIPE INTERNALS (Simplified Demo)
 * ============================================================
 *
 * This is a simplified version of how NestJS's ValidationPipe works.
 *
 * The actual ValidationPipe does:
 * 1. Transforms plain objects to class instances (plainToInstance)
 * 2. Runs class-validator validation
 * 3. Optionally strips unknown properties (whitelist)
 * 4. Optionally forbids unknown properties (forbidNonWhitelisted)
 * 5. Transforms types automatically (transform + enableImplicitConversion)
 *
 * ============================================================
 */

@Injectable()
export class ValidationDemoPipe implements PipeTransform<any> {
  private readonly logger = new Logger("ValidationPipeInternals");

  async transform(value: any, metadata: ArgumentMetadata) {
    const { metatype } = metadata;

    // Skip validation if no metatype or if it's a native JavaScript type
    if (!metatype || !this.toValidate(metatype)) {
      this.logger.debug(
        "[PIPE] No validation needed - native type or no metatype"
      );
      return value;
    }

    this.logger.debug(`[PIPE] Validating against: ${metatype.name}`);

    // Step 1: Transform plain object to class instance
    // This is where class-transformer magic happens
    const object = plainToInstance(metatype, value);
    this.logger.debug("[PIPE] Transformed plain object to class instance");

    // Step 2: Run class-validator validation
    const errors = await validate(object);

    if (errors.length > 0) {
      this.logger.warn(
        `[PIPE] Validation failed with ${errors.length} error(s)`
      );

      // Format error messages
      const messages = errors.map((err) => {
        const constraints = Object.values(err.constraints || {});
        return {
          property: err.property,
          value: err.value,
          constraints,
        };
      });

      throw new BadRequestException({
        message: "Validation failed",
        errors: messages,
      });
    }

    this.logger.debug("[PIPE] Validation passed");
    return object;
  }

  private toValidate(metatype: Function): boolean {
    // Skip native JavaScript types
    const types: Function[] = [String, Boolean, Number, Array, Object];
    return !types.includes(metatype);
  }
}
