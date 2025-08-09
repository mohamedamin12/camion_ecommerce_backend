/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { RpcException } from '@nestjs/microservices';
import { User, UserRole } from './entities/user.entity';
import {
  Repository,
  Between,
  ILike,
  LessThanOrEqual,
  MoreThanOrEqual,
  FindOptionsWhere,
} from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import { OTPService } from './otp-service';
import { UpdateUserDto } from './dto/update-user.dto';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { VerifyDto } from './dto/verifyOTP.dto';
import { FilterUsersDto } from './dto/filter-users.dto';
import { CreateUserDto } from './dto/create-user.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private jwtService: JwtService,
    private otpService: OTPService,
  ) {}

  async register(dto: RegisterDto): Promise<User> {
    try {
      if (!dto.email || !dto.phone) {
        throw new RpcException({
          statusCode: 400,
          message: 'Email and Phone number are required',
        });
      }
      const existing = await this.userRepository.findOne({
        where: [{ email: dto.email }, { phone: dto.phone }],
      });
      if (existing) {
        throw new RpcException({
          statusCode: 409,
          message: 'User already exists',
        });
      }
      const user = this.userRepository.create(dto);
      return await this.userRepository.save(user);
    } catch (error) {
      throw toRpc(error, 'Registration failed');
    }
  }
  
  async loginAdmin(dto: LoginDto) {
    try {
      if (!dto.email || !dto.password) {
        throw new RpcException({
          statusCode: 400,
          message: 'Email and password are required',
        });
      }

      // Find user by email only
      const user = await this.userRepository.findOne({
        where: { email: dto.email },
      });

      if (!user) {
        throw new RpcException({
          statusCode: 401,
          message: 'Invalid credentials',
        });
      }

      // Compare hashed password
      const isPasswordValid = await bcrypt.compare(dto.password, user.password);
      if (!isPasswordValid) {
        throw new RpcException({
          statusCode: 401,
          message: 'Invalid credentials',
        });
      }

      // Check if admin
      if (user.role !== UserRole.ADMIN) {
        throw new RpcException({
          statusCode: 403,
          message: 'Access denied. Admins only.',
        });
      }

      return { success: true, msg: `Admin Login`, admin: user };
    } catch (error) {
      console.error('Login error at login', error);
      throw toRpc(error, 'Login failed');
    }
  }

  async login(dto: LoginDto) {
    try {
      if (!dto.email || !dto.phone) {
        throw new RpcException({
          statusCode: 400,
          message: 'Email and phone are required',
        });
      }
      console.log('Login input:', dto.email, dto.phone);

      const user = await this.userRepository.findOne({
        where: { email: dto.email, phone: dto.phone },
      });
      console.log('User found:', user);

      if (!user) {
        throw new RpcException({
          statusCode: 401,
          message: 'Invalid credentials',
        });
      }

      let OTP = '';
      for (let i = 0; i < 6; i++) {
        OTP += Math.floor(Math.random() * 10);
      }
      user.code = OTP;

      console.log('Generated OTP:', OTP);
      await this.userRepository.save(user);

      await this.otpService.sendSms(
        user.phone,
        `Camion Verification code ${OTP}`,
      );
      console.log('SMS sent to:', user.phone);

      return { success: true, msg: `Check Code on ${user.phone}!` };
    } catch (error) {
      console.error('Login error at login');
      throw toRpc(error, 'Login failed');
    }
  }

  async verifyOTP(dto: VerifyDto) {
    try {
      if (!dto.email || !dto.phone) {
        throw new RpcException({
          statusCode: 400,
          message: 'Email and phone are required',
        });
      }

      const user = await this.userRepository.findOne({
        where: { email: dto.email, phone: dto.phone },
      });

      if (!user)
        throw new RpcException({
          statusCode: 401,
          message: 'Invalid credentials',
        });
      if (user.code !== dto.code)
        throw new RpcException({
          statusCode: 401,
          message: 'Invalid OTP code',
        });

      user.code = '';
      await this.userRepository.save(user);
      const payload = {
        sub: user.id,
        email: user.email,
        phone: user.phone,
        role: user.role,
      };
      const token = this.jwtService.sign(payload);
      return { accessToken: token, user };
    } catch (error) {
      throw toRpc(error, 'OTP verification failed');
    }
  }

  async createUser(dto: CreateUserDto): Promise<User> {
    try {
      const existing = await this.userRepository.findOne({
        where: [{ email: dto.email }, { phone: dto.phone }],
      });
      if (existing)
        throw new RpcException({
          statusCode: 409,
          message: 'User already exists',
        });
      const user = this.userRepository.create(dto);
      return await this.userRepository.save(user);
    } catch (error) {
      throw toRpc(error, 'Create user failed');
    }
  }

  async getUsers(): Promise<User[]> {
    try {
      return await this.userRepository.find();
    } catch (error) {
      throw toRpc(error, 'Get users failed');
    }
  }

  async getUserById(id: string): Promise<User> {
    try {
      const user = await this.userRepository.findOne({ where: { id } });
      if (!user)
        throw new RpcException({ statusCode: 404, message: 'User not found' });
      return user;
    } catch (error) {
      throw toRpc(error, 'Get user by id failed');
    }
  }

  async findUsersByFilters(filters: FilterUsersDto): Promise<User[]> {
    try {
      const where: FindOptionsWhere<User>[] = [];
      if (filters.identifier) {
        const pattern = ILike(`%${filters.identifier}%`);
        where.push(
          { email: pattern },
          { phone: pattern },
          { fullName: pattern },
        );
      }
      const commonFilters: Partial<FindOptionsWhere<User>> = {};
      if (filters.role) commonFilters.role = filters.role;
      if (typeof filters.isActive === 'boolean')
        commonFilters.isActive = filters.isActive;
      if (filters.joinedAfter && filters.joinedBefore)
        commonFilters.createdAt = Between(
          new Date(filters.joinedAfter),
          new Date(filters.joinedBefore),
        );
      else if (filters.joinedAfter)
        commonFilters.createdAt = MoreThanOrEqual(
          new Date(filters.joinedAfter),
        );
      else if (filters.joinedBefore)
        commonFilters.createdAt = LessThanOrEqual(
          new Date(filters.joinedBefore),
        );
      const combinedWhere =
        where.length > 0
          ? where.map((w) => ({ ...w, ...commonFilters }))
          : [commonFilters];
      return await this.userRepository.find({ where: combinedWhere });
    } catch (error) {
      throw toRpc(error, 'Find users by filters failed');
    }
  }

  async updateUser(id: string, updateData: UpdateUserDto) {
    try {
      const user = await this.getUserById(id);
      Object.assign(user, updateData);
      return await this.userRepository.save(user);
    } catch (error) {
      throw toRpc(error, 'Update user failed');
    }
  }

  async deleteUser(id: string): Promise<void> {
    try {
      const result = await this.userRepository.delete(id);
      if (result.affected === 0) {
        throw new RpcException({ statusCode: 404, message: 'User not found' });
      }
    } catch (error) {
      throw toRpc(error, 'Delete user failed');
    }
  }
}

function toRpc(error: any, fallbackMsg?: string) {
  if (error instanceof RpcException) return error;
  const statusCode = error?.getStatus?.() || 500;
  const message = error?.message || fallbackMsg || 'Internal server error';
  return new RpcException({ statusCode, message });
}
