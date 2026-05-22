import { ConflictException, Injectable, UnauthorizedException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { PrismaService } from "src/prisma/prisma.service";
import { RegisterDto } from "./dto/register.dto";
import * as bcrypt from "bcrypt"
import { LoginDto } from "./dto/login.dto";
import { ApiResponse } from "src/common/api-response";

@Injectable()
export class AuthService {
  constructor( 
    private prisma: PrismaService,
    private jwt: JwtService
  ){}
  
  async register(dto: RegisterDto){
    const exists = await this.prisma.user.findUnique({
      where: {
        email: dto.email
      }
    });


    if(exists) throw new ConflictException("Email already in use");

    const hash = await bcrypt.hash(dto.password, 10);
    
    const {confirmPassword, ...rest} = dto;

    const user = await this.prisma.user.create({
      data: {
        email: dto.email,
        password: hash,
        name: dto.name
      }
    })

    const {password, ...result} = user;

    return ApiResponse.create({
      user: result, 
      token: await this.signToken(user.id, user.email)
    }, "User registered successfully")
  }

  async login (dto: LoginDto){
    const user = await this.prisma.user.findUnique({
      where: {email: dto.email}
    })

    if(!user){
      throw new UnauthorizedException("Invalid credentials");
    }

    const valid = await bcrypt.compare(dto.password, user.password);

    if(!valid) throw new UnauthorizedException("Invalid credentials");

    const {password, ...rest} = user;
    return ApiResponse.success({
      user: rest,
      token: await this.signToken(user.id, user.email)
    }, "Login successful")
  }

  async me(user_id: string){
    const user = await this.prisma.user.findUnique({
      where: {id : user_id}
    })
    if(!user) throw new UnauthorizedException("User not founded");

    const {password, ...result} = user;
    return ApiResponse.success(result, "Profile fetch successful");
  }

  private async signToken(user_id: string, email: string){
    return this.jwt.signAsync(
      {sub: user_id, email},
      {secret: process.env.SECRET_KEY!, expiresIn: "7d"}
    )
  }
}