import { IsEmail, IsString, MinLength, IsOptional } from "class-validator";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

export class RegisterDto {
  @ApiProperty({ example: "newuser@blog.com" })
  @IsEmail()
  email: string;

  @ApiProperty({ example: "password123" })
  @IsString()
  @MinLength(6)
  password: string;

  @ApiProperty({ example: "New User" })
  @IsString()
  @MinLength(2)
  name: string;

  @ApiPropertyOptional({ example: "A new blogger" })
  @IsOptional()
  @IsString()
  bio?: string;
}
