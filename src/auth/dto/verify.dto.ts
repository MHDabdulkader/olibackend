import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, IsIn, IsString, Length } from "class-validator";

export class VerifyOtpDto {
  @ApiProperty({example: "user@gmail.com"})
  @IsEmail()
  email: string;

  @ApiProperty({example: "123456", minLength: 6})
  @IsString()
  @Length(6,6)
  otp: string;

  @ApiProperty({example: "email", enum:["email", "forget_password"]})
  @IsString()
  @IsIn(["email", "forget_password"])
  otp_type: string; // email verification or forget password
}