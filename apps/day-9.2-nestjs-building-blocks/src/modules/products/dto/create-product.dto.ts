import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import {
  IsNotEmpty,
  IsString,
  IsNumber,
  IsOptional,
  IsBoolean,
  Min,
  MinLength,
} from "class-validator";

export class CreateProductDto {
  @ApiProperty({ example: "iPhone 15", description: "Product name" })
  @IsNotEmpty()
  @IsString()
  @MinLength(2)
  name: string;

  @ApiProperty({
    example: "Latest iPhone model",
    description: "Product description",
  })
  @IsNotEmpty()
  @IsString()
  description: string;

  @ApiProperty({ example: 999.99, description: "Product price" })
  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  price: number;

  @ApiProperty({ example: "Electronics", description: "Product category" })
  @IsNotEmpty()
  @IsString()
  category: string;

  @ApiPropertyOptional({ example: 100, description: "Stock quantity" })
  @IsOptional()
  @IsNumber()
  @Min(0)
  stock?: number = 0;

  @ApiPropertyOptional({ example: true, description: "Product availability" })
  @IsOptional()
  @IsBoolean()
  isAvailable?: boolean = true;
}
