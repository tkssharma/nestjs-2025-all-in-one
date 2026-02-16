import { PipeTransform, Injectable, ArgumentMetadata } from "@nestjs/common";

@Injectable()
export class TrimPipe implements PipeTransform {
  private isObject(value: unknown): boolean {
    return typeof value === "object" && value !== null;
  }

  private trim(values: Record<string, unknown>): Record<string, unknown> {
    Object.keys(values).forEach((key) => {
      if (typeof values[key] === "string") {
        values[key] = (values[key] as string).trim();
      } else if (this.isObject(values[key])) {
        values[key] = this.trim(values[key] as Record<string, unknown>);
      }
    });
    return values;
  }

  transform(value: unknown, metadata: ArgumentMetadata) {
    if (this.isObject(value)) {
      return this.trim(value as Record<string, unknown>);
    }
    if (typeof value === "string") {
      return value.trim();
    }
    return value;
  }
}
