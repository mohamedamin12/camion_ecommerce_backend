/* eslint-disable @typescript-eslint/require-await */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_SECRET'),
    });
  }

  async validate(payload: any) {
    console.log('JWT Strategy - Payload:', payload);
    
    if (!payload) {
      throw new UnauthorizedException('Invalid token payload');
    }
    
    if (!payload.sub && !payload.id) {
      throw new UnauthorizedException('User ID not found in token');
    }
    
    return {
      id: payload.sub || payload.id,
      sub: payload.sub || payload.id, 
      email: payload.email,
      phone: payload.phone,
      role: payload.role,
    };
  }
}
