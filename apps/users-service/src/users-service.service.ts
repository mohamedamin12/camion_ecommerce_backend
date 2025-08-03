import {
  BadRequestException,
  Body,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Repository } from 'typeorm';
import { UpdateUserDto } from './dto/update-user.dto';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { JwtService } from '@nestjs/jwt';
import { OTPService } from './otp-service';
@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private jwtService: JwtService,
    private otpService: OTPService,
  ) {}

  async register(dto: RegisterDto) {
    const existing = await this.userRepository.findOne({
      where: [{ email: dto.email }, { phone: dto.phone }],
    });

    if (existing) throw new BadRequestException('User already exists');

    const user = this.userRepository.create(dto);
    return this.userRepository.save(user);
  }

  async login(dto: LoginDto) {
    if (!dto.email && !dto.phone) {
      throw new BadRequestException('Email or phone is required');
    }

    let user = await this.userRepository.findOne({
      where: [
        ...(dto.email ? [{ email: dto.email }] : []),
        ...(dto.phone ? [{ phone: dto.phone }] : []),
      ],
    });
    // if (dto.email) {
    //   user = await this.userRepository.findOne({ where: { email: dto.email } });
    // } else if (dto.phone) {
    //   user = await this.userRepository.findOne({ where: { phone: dto.phone } });
    // }

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }
    let digits = '0123456789';
    let OTP = '';
    for (let i = 0; i < 6; i++) {
      OTP += digits[Math.floor(Math.random() * 10)];
    }
    user.code = OTP;
    await this.userRepository.save(user);
    const msg = `Camion Verification code ${OTP}`;
    await this.otpService.sendSms(user.phone, msg);
    // await this.otpService.sendOTP(user.phone);
    // check send response
    return {
      success: 'true',
      msg: `Check Code on ${user.phone}!`,
    };
  }

  async verifyOTP(dto: LoginDto) {
    if (!dto.email && !dto.phone) {
      throw new BadRequestException('Email or phone is required');
    }

    let user;
    if (dto.email) {
      user = await this.userRepository.findOne({ where: { email: dto.email } });
    } else if (dto.phone) {
      user = await this.userRepository.findOne({ where: { phone: dto.phone } });
    }

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }
    if (user.code !== dto.code) {
      throw new UnauthorizedException('Invalid OTP code');
    }
    user.code = null;
    await this.userRepository.save(user);
    const payload = {
      sub: user.id,
      email: user.email,
      phone: user.phone,
      role: user.role,
    };

    const token = this.jwtService.sign(payload);

    return {
      accessToken: token,
      user,
    };
  }
  
  async getUsers(): Promise<User[]> {
    return this.userRepository.find();
  }

  async getUserById(id: string): Promise<User> {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  async findByEmailOrPhone(identifier: string): Promise<User | null> {
    return this.userRepository.findOne({
      where: [{ email: identifier }, { phone: identifier }],
    });
  }

  async updateUser(
    id: string,
    @Body() updateData: UpdateUserDto,
  ): Promise<User> {
    const user = await this.getUserById(id);
    Object.assign(user, updateData);
    return this.userRepository.save(user);
  }

  async deleteUser(id: string): Promise<void> {
    const result = await this.userRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException('User not found');
    }
  }
}
