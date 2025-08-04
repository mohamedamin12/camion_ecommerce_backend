import {
  BadRequestException,
  Body,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import {
  Between,
  FindOptionsWhere,
  ILike,
  LessThanOrEqual,
  MoreThanOrEqual,
  Repository,
} from 'typeorm';
import { UpdateUserDto } from './dto/update-user.dto';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { JwtService } from '@nestjs/jwt';
import { OTPService } from './otp-service';
import { VerifyDto } from './dto/verifyOTP.dto';
import { FilterUsersDto } from './dto/filter-users.dto';
import { CreateUserDto } from './dto/create-user.dto';
@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private jwtService: JwtService,
    private otpService: OTPService,
  ) {}

  async register(dto: RegisterDto) {
    try {
      if (!dto.email || !dto.phone)
        throw new BadRequestException('Email and Phone number are required');
      const existing = await this.userRepository.findOne({
        where: [{ email: dto.email }, { phone: dto.phone }],
      });

      if (existing) throw new BadRequestException('User already exists');

      const user = this.userRepository.create(dto);
      return this.userRepository.save(user);
    } catch (error) {
      return error.message;
    }
  }

  async login(dto: LoginDto) {
    if (!dto.email && !dto.phone) {
      throw new BadRequestException('Email or phone is required');
    }

    const user = await this.userRepository.findOne({
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
    const digits = '0123456789';
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

  async verifyOTP(dto: VerifyDto) {
    if (!dto.email && !dto.phone) {
      throw new BadRequestException('Email or phone is required');
    }

    let user: User | null = null;
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
    user.code = '';
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

  async createUser(dto: CreateUserDto): Promise<User> {
    const existing = await this.userRepository.findOne({
      where: [{ email: dto.email }, { phone: dto.phone }],
    });

    if (existing) {
      throw new BadRequestException('User already exists');
    }

    const user = this.userRepository.create(dto);
    return this.userRepository.save(user);
  }

  async getUsers(): Promise<User[]> {
    return this.userRepository.find();
  }

  async getUserById(id: string): Promise<User> {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  async findUsersByFilters(filters: FilterUsersDto): Promise<User[]> {
    const where: FindOptionsWhere<User>[] = [];

    if (filters.identifier) {
      const pattern = ILike(`%${filters.identifier}%`);
      where.push({ email: pattern }, { phone: pattern }, { fullName: pattern });
    }

    const commonFilters: Partial<FindOptionsWhere<User>> = {};
    if (filters.role) commonFilters.role = filters.role;
    if (typeof filters.isActive === 'boolean')
      commonFilters.isActive = filters.isActive;

    if (filters.joinedAfter && filters.joinedBefore) {
      commonFilters.createdAt = Between(
        new Date(filters.joinedAfter),
        new Date(filters.joinedBefore),
      );
    } else if (filters.joinedAfter) {
      commonFilters.createdAt = MoreThanOrEqual(new Date(filters.joinedAfter));
    } else if (filters.joinedBefore) {
      commonFilters.createdAt = LessThanOrEqual(new Date(filters.joinedBefore));
    }

    const combinedWhere =
      where.length > 0
        ? where.map((w) => ({ ...w, ...commonFilters }))
        : [commonFilters];

    return this.userRepository.find({ where: combinedWhere });
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
