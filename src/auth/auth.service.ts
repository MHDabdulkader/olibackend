import { BadRequestException, ConflictException, Injectable, UnauthorizedException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { PrismaService } from "src/prisma/prisma.service";
import { RegisterDto } from "./dto/register.dto";
import * as bcrypt from "bcrypt"
import { LoginDto } from "./dto/login.dto";
import { ApiResponse } from "src/common/api-response";
import { MailService } from "src/mail/mail.service";
import { VerifyOtpDto } from "./dto/verify.dto";
import { ForgetPasswordDto } from "./dto/forgot_password.dto";
import { ResetPasswordDto } from "./dto/reset_password.dto";

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwt: JwtService,
    private mail: MailService
  ) { }
  // __ Otp generate ______________________________________________________
  private generateOtp(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }


  // __ Register _______________________________________________________
  async register(dto: RegisterDto) {
    const exists = await this.prisma.user.findUnique({
      where: {
        email: dto.email
      }
    });


    if (exists && exists.isVerified) throw new ConflictException("Email already in use");

    const hash = await bcrypt.hash(dto.password, 10);
    const otp = this.generateOtp();
    const otpExpireAt = new Date(Date.now() + 10 * 60 * 1000);

    const { confirmPassword, ...rest } = dto;

    // Account exist but miss verification
    if (exists && !exists.isVerified) {
      await this.prisma.user.update({
        where: { email: dto.email },
        data: { otp, otpExpireAt }
      })
      await this.mail.sendOtp(dto.email, otp);

      return ApiResponse.success(
        { email: dto.email },
        "Account exists but unverified. New OTP send to your email"
      )
    }
    // new user
    const user = await this.prisma.user.create({
      data: {
        email: dto.email,
        password: hash,
        name: dto.name,
        otp,
        otpExpireAt
      }
    })

    await this.mail.sendOtp(user.email, otp);

    const { password, ...result } = user;

    return ApiResponse.create({
      email: user.email
    }, "Registered successfully. Please verify your email")
  }

  // __ Verify Otp ______________________________________________________
  async verfiyOtp(dto: VerifyOtpDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email }
    });
    if (!user) {
      throw new BadRequestException("User not founded!");
    }

    if (dto.otp_type === "email") {
      if (user?.isVerified) throw new BadRequestException("Account already verified!")
    } else if (dto.otp_type === "forget_password") {
      if (!user?.isVerified) throw new BadRequestException("Account not verified!")
    }
    else {
      throw new BadRequestException("Invalid otp_type. User 'email' or 'forget_password'")
    }

    // if(user.isVerified){
    //   throw new BadRequestException("Account already verifed");
    // }
    if (!user.otp || !user.otpExpireAt) {
      throw new BadRequestException("OTP not found, register again")
    }
    if (new Date() > user.otpExpireAt) {
      throw new BadRequestException("OTP has expired. please register again to get new otp")
    }
    if (user.otp !== dto.otp) {
      throw new BadRequestException("Invaild OTP!");
    }

    if (dto.otp_type === "email") {
      // __ update user___
      const updatedUser = await this.prisma.user.update({
        where: { email: dto.email },
        data: {
          isVerified: true,
          otp: null,
          otpExpireAt: null
        }
      });

      const { password, ...result } = updatedUser;

      return ApiResponse.success(
        {
          user: result,
          token: await this.signToken(updatedUser?.id, updatedUser?.email)
        },
        "Email verified successfully"
      )
    }

    if(dto.otp_type ==="forget_password"){
      await this.prisma.user.update({
        where: {email: dto.email},
        data: {
          otp: null,
          otpExpireAt: null
        }
      })

      return ApiResponse.success({
        email: dto.email
      }, "OTP verified. You can now reset your password")
    }



  }

  // __ Forgot Password ________________________________________________
  async forget_password(dto: ForgetPasswordDto){
    const user = await this.prisma.user.findUnique({
      where: {email: dto.email}
    })

    if(!user || !user.isVerified){
      return ApiResponse.success({
        email: dto.email
      }, "If this email is registered, an OTP has been sent")
    }

    const otp = this.generateOtp();
    const otpExpireAt = new Date(Date.now() + 10 * 60 * 1000);

    await this.prisma.user.update({
      where: {email: dto.email},
      data: {otp,otpExpireAt}
    });

    await this.mail.sendOtp(dto.email, otp)

    return ApiResponse.success({
      email: dto.email
    }, "If this email is registered, an OTP has been sent")
  }

  // __ Reset Password ___________________________________________________________
  async reset_password(dto: ResetPasswordDto){
    const user = await this.prisma.user.findUnique({
      where: {email: dto.email}
    });

    if(!user) throw new BadRequestException("User not found");
    if(!user.isVerified) throw new BadRequestException("Account not verified!");

    if(user.otp || user.otpExpireAt){
      throw new BadRequestException("Please verify OTP before resetting password")
    }
    // const is_same_password = await bcrypt.compare(dto.new_password, user.password);

    // if(is_same_password){
    //   throw new BadRequestException("New password cannot be the same as old password!")
    // }

    const hash = await bcrypt.hash(dto.new_password, 10);

    await this.prisma.user.update({
      where: {email: dto.email},
      data: {password: hash}
    })

    return ApiResponse.success({
      email: dto.email
    }, "Password reset successfully. You can now login")
  }

  // __ Login ____________________________________________________________
  async login(dto: LoginDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email }
    })

    if (!user) {
      throw new UnauthorizedException("Invalid credentials");
    }

    const valid = await bcrypt.compare(dto.password, user.password);

    if (!valid) throw new UnauthorizedException("Invalid credentials");

    if (!user?.isVerified) {
      const otp = this.generateOtp();
      const otpExpireAt = new Date(Date.now() + 10 * 60 * 1000);

      await this.prisma.user.update({
        where: { email: dto.email },
        data: { otp, otpExpireAt }
      });

      await this.mail.sendOtp(dto.email, otp);

      throw new UnauthorizedException("Email not verified. A new OTP has sent to your email");
    }


    const { password, ...rest } = user;
    return ApiResponse.success({
      user: rest,
      token: await this.signToken(user.id, user.email)
    }, "Login successful")
  }

  // __ Profile ____________________________________________________________
  async me(user_id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: user_id }
    })
    if (!user) throw new UnauthorizedException("User not founded");

    const { password, ...result } = user;
    return ApiResponse.success(result, "Profile fetch successful");
  }

  // __ Token check _________________________________________________________
  private async signToken(user_id: string, email: string) {
    return this.jwt.signAsync(
      { sub: user_id, email },
      { secret: process.env.SECRET_KEY!, expiresIn: "7d" }
    )
  }
}