import {
  PipeTransform,
  Injectable,
  ArgumentMetadata,
  Logger,
} from "@nestjs/common";

/**
 * ============================================================
 * CUSTOM PIPE - Trim Strings Recursively
 * ============================================================
 *
 * This pipe demonstrates:
 * 1. Transforming complex objects
 * 2. Recursive transformation
 * 3. Non-validating pipes (transformation only)
 *
 * ============================================================
 */

@Injectable()
export class TrimStringsPipe implements PipeTransform {
  private readonly logger = new Logger(TrimStringsPipe.name);

  transform(value: any, metadata: ArgumentMetadata): any {
    // Only transform body and query parameters
    if (metadata.type !== "body" && metadata.type !== "query") {
      return value;
    }

    this.logger.debug(`[PIPE] Trimming strings in ${metadata.type}`);
    return this.trimRecursive(value);
  }

  private trimRecursive(value: any): any {
    if (typeof value === "string") {
      return value.trim();
    }

    if (Array.isArray(value)) {
      return value.map((item) => this.trimRecursive(item));
    }

    if (value !== null && typeof value === "object") {
      const trimmed: Record<string, any> = {};
      for (const key of Object.keys(value)) {
        trimmed[key] = this.trimRecursive(value[key]);
      }
      return trimmed;
    }

    return value;
  }
}
