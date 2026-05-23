import { ApiProperty, ApiResponse } from "@nestjs/swagger";
import { IsEmail, IsString, Matches, MinLength } from "class-validator";


export class ResetPasswordDto {
  @ApiProperty({example: "user@gmail.com"})
  @IsEmail()
  email: string;

  @ApiProperty({example: "password123"})
  @IsString()
  @MinLength(8)
  @Matches(/^(?=.*[A-Z])(?=.*[a-z])(?=.*[0-9])(?=.*[!@#$%^&*])/,{
    message: "Password must be uppercase, lowercase, number and special character"
  })
  new_password: string;
}