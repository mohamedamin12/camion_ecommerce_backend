import { BadRequestException, Inject, Injectable, UnauthorizedException } from "@nestjs/common";
import { ClientProxy } from "@nestjs/microservices";
import { firstValueFrom } from "rxjs";
import { RegisterDto } from "./dto/register-auth.dto";
import { LoginDto } from "./dto/login-auth.dto";

@Injectable()
export class AuthService {
  constructor(
    @Inject('USER_SERVICE') private readonly userClient: ClientProxy,
  ) {}

  async register(dto: RegisterDto) {
    const user = await firstValueFrom(
      this.userClient.send({ cmd: 'find_user_by_email_or_phone' }, {
        email: dto.email,
        phone: dto.phone,
      }),
    );

    if (user) {
      throw new BadRequestException('User already exists');
    }

    return this.userClient.send({ cmd: 'create_user' }, dto);
  }

  async login(dto: LoginDto) {
    const user = await firstValueFrom(
      this.userClient.send({ cmd: 'find_user_by_email_or_phone' }, dto),
    );

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    return user;
  }
}
