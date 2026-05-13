import { minLength, IsEmail, IsOptional, IsString, MinLength } from "class-validator";
import { Match } from "../decorator/match.decorator";
import { ApiProperty } from "@nestjs/swagger";


export class RegisterDto {
  @ApiProperty({example: "user@gmail.com"})
  @IsEmail()
  email: string;


  @ApiProperty({example: "password123", minLength: 8})
  @IsString()
  @MinLength(8)
  password: string;

  @ApiProperty({example: "password123", minLength: 8})
  @IsString()
  @MinLength(8)
  @Match('password', {message: "Passwords do not match"})
  confirmPassword: string;

  @ApiProperty({example: "user name"})
  @IsString()
  @IsOptional()
  name?: string
}