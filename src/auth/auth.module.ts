import { Module } from "@nestjs/common";
import { JwtModule } from "@nestjs/jwt";
import { PassportModule } from "@nestjs/passport";
import { AuthController } from "./controller/auth.controller";
import { JwtStrategy } from "./strategies/jwt.strategies";
import { AuthService } from "./auth.service";
import { MailModule } from "src/mail/mail.module";

@Module({
  imports: [
    PassportModule,
    JwtModule.register({
      secret: process.env.SECRET_KEY,
      signOptions: { expiresIn: "7d"}
    }),
    MailModule
  ],
  providers: [AuthService, JwtStrategy],
  controllers: [AuthController],
  exports: [AuthService]
})

export class AuthModule{}