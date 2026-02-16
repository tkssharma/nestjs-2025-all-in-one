import { IsEmail, IsString, MinLength } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class LoginDto {
  @ApiProperty({ example: "admin@blog.com" })
  @IsEmail()
  email: string;

  @ApiProperty({ example: "admin123" })
  @IsString()
  @MinLength(6)
  password: string;
}
