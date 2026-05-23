import { Controller, Post, Body, Get, UseGuards, Request } from "@nestjs/common";

import { AuthService } from "../auth.service";
import { LoginDto } from "../dto/login.dto";
import { RegisterDto } from "../dto/register.dto";
import { AuthGuard } from "@nestjs/passport";
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";
import { VerifyOtpDto } from "../dto/verify.dto";
import { ForgetPasswordDto } from "../dto/forgot_password.dto";
import { ResetPasswordDto } from "../dto/reset_password.dto";


@ApiBearerAuth("access-token") 
@ApiTags("Auth")
@Controller("auth")
export class AuthController{
  constructor(private authService: AuthService){}

  // __ Register _____________________________________________________________
  @Post("register")
  @ApiOperation({summary: "Register a new user"})
  @ApiResponse({status: 201, description: "User registered sucessfully"})
  @ApiResponse({status: 409, description: "Email already in use"})
  register(@Body() dto: RegisterDto){
    return this.authService.register(dto);
  }

  // __ Login ________________________________________________________________
  @Post("login")
  @ApiOperation({summary: "Login"})
  @ApiResponse({status: 200, description: "Login successful"})
  @ApiResponse({status: 401, description: "Invalid credential"})
  // remains any stuff like verification, or so on. 
  login(
    @Body() dto: LoginDto
  ){
    return this.authService.login(dto);
  }

  // __ Profile _____________________________________________________________
  @ApiBearerAuth("access-token") 
  @UseGuards(AuthGuard("jwt"))
  @Get("me")
  @ApiOperation({summary: "Get profile"})
  @ApiResponse({status: 200, description: "User fetched successfully"})
  @ApiResponse({status: 401, description: "Unauthorized"})
  me(
    @Request() req
  ){
    console.log("")
    return this.authService.me(req.user.sub)
  }


  // __ Verify _________________________________________________________________
  @Post("verify-otp")
  @ApiOperation({summary: "Verify OTP"})
  @ApiResponse({status: 200, description: "Email verified successfully"})
  @ApiResponse({status: 400, description: "Invalid or expired OTP"})
  verify_otp(@Body() dto: VerifyOtpDto){
    return this.authService.verfiyOtp(dto);
  }

  // __ Forgot password ___________________________________________________________
  @Post("forgot-password")
  @ApiOperation({summary: "Forgot password"})
  @ApiResponse({status: 200, description: "Request OTP for password reset"})
  forgotPassword(@Body() dto: ForgetPasswordDto){
    return this.authService.forget_password(dto)
  }

  // __ Reset password _____________________________________________________________
  @Post("reset-password")
  @ApiOperation({summary: "Reset password"})
  @ApiResponse({status: 200, description: "Reset password after OTP verified"})
  resetPassword(@Body() dto: ResetPasswordDto){
     return this.authService.reset_password(dto);
  }
}