import { Body, Controller, Delete, Get, Inject, Param, Patch, Post } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { LoginDto } from 'apps/users-service/src/dto/login.dto';
import { RegisterDto } from 'apps/users-service/src/dto/register.dto';

@Controller('users')
export class UserController {
  constructor(
    @Inject('USERS_SERVICE') private readonly usersClient: ClientProxy,
  ) { }

  @Post('auth/register')
  register(@Body() body: RegisterDto) {
    return this.usersClient.send({ cmd: 'register_user' }, body);
  }

  @Post('auth/login')
  login(@Body() body: LoginDto) {
    return this.usersClient.send({ cmd: 'login_user' }, body);
  }

  @Get()
  async getAllUsers() {
    return this.usersClient.send({ cmd: 'get_users' }, {});
  }

  @Get(':id')
  async getUserById(@Param('id') id: string) {
    return this.usersClient.send({ cmd: 'get_user_by_id' }, id);
  }

  @Post('find')
  async findByEmailOrPhone(@Body() body: { email?: string; phone?: string }) {
    return this.usersClient.send({ cmd: 'find_by_email_or_phone' }, body);
  }

  @Patch(':id')
  async updateUser(@Param('id') id: string, @Body() updateData: any) {
    return this.usersClient.send({ cmd: 'update_user' }, { id, updateData });
  }

  @Delete(':id')
  async deleteUser(@Param('id') id: string) {
    return this.usersClient.send({ cmd: 'delete_user' }, id);
  }
}
