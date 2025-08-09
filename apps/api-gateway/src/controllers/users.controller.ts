import {
  Body,
  Controller,
  Delete,
  Get,
  Inject,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { CreateUserDto } from 'apps/users-service/src/dto/create-user.dto';
import { FilterUsersDto } from 'apps/users-service/src/dto/filter-users.dto';
import { LoginDto } from 'apps/users-service/src/dto/login.dto';
import { RegisterDto } from 'apps/users-service/src/dto/register.dto';
import { UpdateUserDto } from 'apps/users-service/src/dto/update-user.dto';
import { VerifyDto } from 'apps/users-service/src/dto/verifyOTP.dto';
import { UserRole } from 'apps/users-service/src/entities/user.entity';
import { JwtAuthGuard } from 'libs/auth/src';
import { Roles } from 'libs/auth/src/roles.decorator';
import { RolesGuard } from 'libs/auth/src/roles.guard';

@Controller('users')
export class UserController {
  constructor(
    @Inject('USERS_SERVICE') private readonly usersClient: ClientProxy,
  ) {}

  @Post('auth/register')
  register(@Body() body: RegisterDto) {
    return this.usersClient.send({ cmd: 'register_user' }, body);
  }

  @Post('auth/login_admin')
  loginAdmin(@Body() body: LoginDto) {
    return this.usersClient.send({ cmd: 'login_admin' }, body);
  }

  @Post('auth/login')
  login(@Body() body: LoginDto) {
    return this.usersClient.send({ cmd: 'login_user' }, body);
  }

  @Post('auth/verify')
  verify(@Body() body: VerifyDto) {
    return this.usersClient.send({ cmd: 'verify_user' }, body);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Post()
  createUser(@Body() body: CreateUserDto) {
    return this.usersClient.send({ cmd: 'create_user' }, body);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Get()
  getAllUsers() {
    return this.usersClient.send({ cmd: 'get_users' }, {});
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  getUserById(@Param('id') id: string) {
    return this.usersClient.send({ cmd: 'get_user_by_id' }, id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Post('find')
  findUsersByFilters(@Body() body: FilterUsersDto) {
    return this.usersClient.send({ cmd: 'find_user_by_identifier' }, body);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Patch(':id')
  updateUser(@Param('id') id: string, @Body() updateData: UpdateUserDto) {
    return this.usersClient.send({ cmd: 'update_user' }, { id, updateData });
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Delete(':id')
  deleteUser(@Param('id') id: string) {
    return this.usersClient.send({ cmd: 'delete_user' }, id);
  }
}
