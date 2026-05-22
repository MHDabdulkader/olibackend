import { Controller, Post, Body, Get, UseGuards, Request } from "@nestjs/common";

import { AuthService } from "../auth.service";
import { LoginDto } from "../dto/login.dto";
import { RegisterDto } from "../dto/register.dto";
import { AuthGuard } from "@nestjs/passport";
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";


@ApiBearerAuth("access-token") 
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
  @ApiOperation({summary: "Login"})
  @ApiResponse({status: 200, description: "Login successful"})
  @ApiResponse({status: 401, description: "Invalid credential"})
  // remains any stuff like verification, or so on. 
  login(
    @Body() dto: LoginDto
  ){
    return this.authService.login(dto);
  }

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

}