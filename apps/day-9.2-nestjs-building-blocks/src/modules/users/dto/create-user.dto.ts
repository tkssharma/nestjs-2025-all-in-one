import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  MinLength,
  IsIn,
  IsBoolean,
} from "class-validator";

export class CreateUserDto {
  @ApiProperty({ example: "John Doe", description: "User full name" })
  @IsNotEmpty()
  @IsString()
  @MinLength(2)
  name: string;

  @ApiProperty({ example: "john@example.com", description: "User email" })
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @ApiPropertyOptional({
    example: "user",
    description: "User role",
    enum: ["admin", "user", "moderator"],
  })
  @IsOptional()
  @IsString()
  @IsIn(["admin", "user", "moderator"])
  role?: string = "user";

  @ApiPropertyOptional({ example: true, description: "User active status" })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean = true;
}
