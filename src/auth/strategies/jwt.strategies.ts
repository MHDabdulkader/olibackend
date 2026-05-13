import { Injectable, UnauthorizedException } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy } from "passport-jwt";
import { PrismaService } from "src/prisma/prisma.service";


@Injectable()
export class JwtStrategy  extends PassportStrategy(Strategy){
  constructor(private prisma: PrismaService){
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: process.env.SECRET_KEY!,
    });
  }

  async validate(payload: {sub: string, email: string}){
    const user = await this.prisma.user.findUnique({
      where: {id: payload.sub, email: payload.email},
    })

    if(!user){
      throw new UnauthorizedException();
    }

    const {password, ...result} = user;
    return result;
  }
}