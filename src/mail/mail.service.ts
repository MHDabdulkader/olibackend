import { Injectable } from "@nestjs/common";
import * as nodemailer from "nodemailer"

@Injectable()
export class MailService{
  private transporter = nodemailer.createTransport({
    host:process.env.MAIL_HOST,
    port: Number(process.env.MAIL_PORT),
    secure: false,
    auth: {
      user: process.env.MAIL_USER,
      pass: process.env.MAIL_PASS
    }
  })

  async sendOtp(email: string, otp: string){
    await this.transporter.sendMail({
      from: `"Oli" <${process.env.MAIL_USER}>`,
      to: email,
      subject: "Verify your account",
      html:`
        <h2>Email Verification</h2>
        <p>Your OTP code is:</p>
        <h1 style="letter-spacing: 8px">${otp}</h1>
        <p>This code expires in <b>10 minutes</b></p>
      `
    })
  }
}