import { Body, Controller, Delete, Get, Param, Patch } from '@nestjs/common';
import { UsersService } from './users-service.service';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { FindUserDto } from './dto/find-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Controller()
export class UsersServiceController {
  constructor(private readonly usersService: UsersService) { }

  @MessagePattern({ cmd: 'get_users' })
  async getAllUsers() {
    return this.usersService.getUsers();
  }

  @MessagePattern({ cmd: 'get_user_by_id' })
  async getUserById(@Param('id') id: string) {
    return this.usersService.getUserById(id);
  }

  @MessagePattern({ cmd: 'find_by_email_or_phone' })
  async findByEmailOrPhone(@Payload() data: FindUserDto) {
    const identifier = data.email || data.phone;
    if (!identifier) {
      throw new Error('Email or phone is required');
    }
    return this.usersService.findByEmailOrPhone(identifier);
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