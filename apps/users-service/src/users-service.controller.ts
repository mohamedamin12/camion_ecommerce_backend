/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import {
  Controller,
  UsePipes,
  ValidationPipe,
  BadRequestException,
  NotFoundException,
  UnauthorizedException,
  ConflictException,
} from '@nestjs/common';
import { UsersService } from './users-service.service';
import { MessagePattern, Payload, RpcException } from '@nestjs/microservices';
import { UpdateUserDto } from './dto/update-user.dto';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { VerifyDto } from './dto/verifyOTP.dto';
import { FilterUsersDto } from './dto/filter-users.dto';
import { CreateUserDto } from './dto/create-user.dto';

function mapException(error: any) {
  if (error instanceof RpcException) return error;
  if (
    error instanceof NotFoundException ||
    error instanceof BadRequestException ||
    error instanceof UnauthorizedException ||
    error instanceof ConflictException
  ) {
    return new RpcException({
      statusCode: error.getStatus(),
      message: error.message,
    });
  }
  return new RpcException({
    statusCode: 500,
    message: error?.message || 'Unknown error from users microservice',
  });
}

@UsePipes(
  new ValidationPipe({
    exceptionFactory: (errors) =>
      new RpcException({
        statusCode: 400,
        message: 'Validation failed',
        details: errors,
      }),
  }),
)
@Controller()
export class UsersServiceController {
  constructor(private readonly usersService: UsersService) {}

  @MessagePattern({ cmd: 'register_user' })
  async register(@Payload() dto: RegisterDto) {
    try {
      return await this.usersService.register(dto);
    } catch (error) {
      throw mapException(error);
    }
  }

  @MessagePattern({ cmd: 'login_user' })
  async login(@Payload() dto: LoginDto) {
    try {
      return await this.usersService.login(dto);
    } catch (error) {
      throw mapException(error);
    }
  }

  @MessagePattern({ cmd: 'create_user' })
  async createUser(@Payload() dto: CreateUserDto) {
    try {
      return await this.usersService.createUser(dto);
    } catch (error) {
      throw mapException(error);
    }
  }

  @MessagePattern({ cmd: 'verify_user' })
  async verifyOTP(@Payload() dto: VerifyDto) {
    try {
      return await this.usersService.verifyOTP(dto);
    } catch (error) {
      throw mapException(error);
    }
  }

  @MessagePattern({ cmd: 'get_users' })
  async getAllUsers() {
    try {
      return await this.usersService.getUsers();
    } catch (error) {
      throw mapException(error);
    }
  }

  @MessagePattern({ cmd: 'get_user_by_id' })
  async getUserById(@Payload() id: string) {
    try {
      return await this.usersService.getUserById(id);
    } catch (error) {
      throw mapException(error);
    }
  }

  @MessagePattern({ cmd: 'users.getUserById' })
  async handleGetUserById(@Payload() { id }: { id: string }) {
    try {
      return await this.usersService.getUserById(id);
    } catch (error) {
      throw mapException(error);
    }
  }

  @MessagePattern({ cmd: 'find_user_by_identifier' })
  async findUsersByFilters(@Payload() filters: FilterUsersDto) {
    try {
      return await this.usersService.findUsersByFilters(filters);
    } catch (error) {
      throw mapException(error);
    }
  }

  @MessagePattern({ cmd: 'update_user' })
  async updateUser(@Payload() payload: { id: string; updateData: UpdateUserDto }) {
    try {
      const { id, updateData } = payload;
      return await this.usersService.updateUser(id, updateData);
    } catch (error) {
      throw mapException(error);
    }
  }

  @MessagePattern({ cmd: 'delete_user' })
  async deleteUser(@Payload() id: string) {
    try {
      await this.usersService.deleteUser(id);
      return { message: 'User deleted successfully' };
    } catch (error) {
      throw mapException(error);
    }
  }
}
