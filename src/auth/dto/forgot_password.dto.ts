import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, IsIn, IsString } from "class-validator";

export class ForgetPasswordDto{
  @ApiProperty({example: "user@gmail.com"})
  @IsEmail()
  email: string;

}