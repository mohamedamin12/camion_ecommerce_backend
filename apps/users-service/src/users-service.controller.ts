import { Controller } from '@nestjs/common';
import { UsersService } from './users-service.service';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { FilterUsersDto } from './dto/find-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { CreateUserDto } from './dto/create-user.dto';

@Controller()
export class UsersServiceController {
  constructor(private readonly usersService: UsersService) { }

  @MessagePattern({ cmd: 'register_user' })
  register(@Payload() dto: RegisterDto) {
    return this.usersService.register(dto);
  }

  @MessagePattern({ cmd: 'login_user' })
  login(@Payload() dto: LoginDto) {
    return this.usersService.login(dto);
  }

  @MessagePattern({ cmd: 'get_users' })
  async getAllUsers() {
    return this.usersService.getUsers();
  }

  @MessagePattern({ cmd: 'create_user' })
  async createUser(@Payload() dto: CreateUserDto) {
    return this.usersService.createUser(dto);
  }

  @MessagePattern({ cmd: 'get_user_by_id' })
  async getUserById(@Payload() id: string) {
    return this.usersService.getUserById(id);
  }

  @MessagePattern({ cmd: 'find_user_by_identifier' })
  async findUsersByFilters(@Payload() filters: FilterUsersDto) {
    return this.usersService.findUsersByFilters(filters);
  }

  @MessagePattern({ cmd: 'update_user' })
  async updateUser(@Payload() payload: { id: string; updateData: UpdateUserDto }) {
    const { id, updateData } = payload;
    return this.usersService.updateUser(id, updateData);
  }

  @MessagePattern({ cmd: 'delete_user' })
  async deleteUser(@Payload() id: string) {
    await this.usersService.deleteUser(id);
    return { message: 'User deleted successfully' };
  }



}