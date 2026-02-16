import {
  PipeTransform,
  Injectable,
  ArgumentMetadata,
  BadRequestException,
} from "@nestjs/common";

@Injectable()
export class CustomParseIntPipe implements PipeTransform<string, number> {
  transform(value: string, metadata: ArgumentMetadata): number {
    const val = parseInt(value, 10);

    if (isNaN(val)) {
      throw new BadRequestException(
        `Validation failed. "${value}" is not a valid integer for ${
          metadata.data || "parameter"
        }`
      );
    }

    if (val < 0) {
      throw new BadRequestException(
        `Validation failed. Value must be a positive integer`
      );
    }

    return val;
  }
}
