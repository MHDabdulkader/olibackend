import { Controller, Post, Body, Get, UseGuards, Request } from "@nestjs/common";

import { AuthService } from "../auth.service";
import { LoginDto } from "../dto/login.dto";
import { RegisterDto } from "../dto/register.dto";
import { AuthGuard } from "@nestjs/passport";
import { ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";

@ApiTags("Auth")
@Controller("auth")
export class AuthController{
  constructor(private authService: AuthService){}

  @Post("register")
  @ApiOperation({summary: "Register a new user"})
  @ApiResponse({status: 201, description: "User registered sucessfully"})
  @ApiResponse({status: 409, description: "Email already in use"})
  register(@Body() dto: RegisterDto){
    return this.authService.register(dto);
  }

  @Post("login")
  login(
    @Body() dto: LoginDto
  ){
    return this.authService.login(dto);
  }

  @UseGuards(AuthGuard("jwt"))
  @Get("me")
  me(
    @Request() req
  ){
    console.log("")
    return this.authService.me(req.user.user_id)
  }

}