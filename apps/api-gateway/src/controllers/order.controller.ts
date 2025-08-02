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
import { CreateOrderDto } from 'apps/orders-service/src/dto/create-order.dto';
import { UserRole } from 'apps/users-service/src/entities/user.entity';
import { JwtAuthGuard } from 'libs/auth/src';
import { Roles } from 'libs/auth/src/roles.decorator';
import { RolesGuard } from 'libs/auth/src/roles.guard';

@Controller('orders')
export class OrderController {
  constructor(@Inject('ORDERS_SERVICE') private readonly orderClient: ClientProxy) {}

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.USER , UserRole.AFFILIATE )
  @Post('/create')
  createOrder(@Body() dto: CreateOrderDto) {
    return this.orderClient.send({ cmd: 'create_order' }, dto);
  }
  
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Get('/user/:userId')
  getOrdersByUser(@Param('userId') userId: string) {
    return this.orderClient.send({ cmd: 'get_orders_by_user' }, userId);
  }
  
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Get('/:id')
  getOrderById(@Param('id') id: string) {
    return this.orderClient.send({ cmd: 'get_order_by_id' }, id);
  }
  
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN )
  @Patch('/:id/pay')
  markAsPaid(@Param('id') id: string) {
    return this.orderClient.send({ cmd: 'mark_order_as_paid' }, id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN )
  @Patch('/:id/delivered')
  markAsDelivered(@Param('id') id: string) {
    return this.orderClient.send({ cmd: 'mark_order_as_delivered' }, id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.USER , UserRole.AFFILIATE , UserRole.ADMIN )
  @Delete('/:id')
  deleteOrder(@Param('id') id: string) {
    return this.orderClient.send({ cmd: 'delete_order' }, id);
  }
}
