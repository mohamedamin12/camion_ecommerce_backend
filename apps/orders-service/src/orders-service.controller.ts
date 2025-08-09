/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import {
  Controller,
  UsePipes,
  ValidationPipe,
  BadRequestException,
  NotFoundException,
  ConflictException,
  UnauthorizedException,
} from '@nestjs/common';
import { MessagePattern, Payload, RpcException } from '@nestjs/microservices';
import { CreateOrderDto } from './dto/create-order.dto';
import { OrdersService } from './orders-service.service';

function mapException(error: any) {
  if (error instanceof RpcException) return error;
  if (
    error instanceof NotFoundException ||
    error instanceof BadRequestException ||
    error instanceof ConflictException ||
    error instanceof UnauthorizedException
  ) {
    return new RpcException({
      statusCode: error.getStatus(),
      message: error.message,
    });
  }
  return new RpcException({
    statusCode: 500,
    message: error?.message || 'Unknown error from orders microservice',
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
export class OrdersController {
  constructor(private readonly orderService: OrdersService) {}

  @MessagePattern({ cmd: 'create_order' })
  async createOrder(@Payload() data: { userId: string } & CreateOrderDto) {
    try {
      const { userId, ...dto } = data;
      return await this.orderService.createOrder(userId, dto);
    } catch (error) {
      throw mapException(error);
    }
  }

  @MessagePattern({ cmd: 'get_orders_by_user' })
  async getOrdersByUser(@Payload() userId: string) {
    try {
      return await this.orderService.getOrdersByUser(userId);
    } catch (error) {
      throw mapException(error);
    }
  }

  @MessagePattern({ cmd: 'get_order_by_id' })
  async getOrderById(@Payload() id: string) {
    try {
      return await this.orderService.getOrderById(id);
    } catch (error) {
      throw mapException(error);
    }
  }

  @MessagePattern({ cmd: 'mark_order_as_paid' })
  async markAsPaid(@Payload() id: string) {
    try {
      return await this.orderService.markAsPaid(id);
    } catch (error) {
      throw mapException(error);
    }
  }

  @MessagePattern({ cmd: 'mark_order_as_delivered' })
  async markAsDelivered(@Payload() id: string) {
    try {
      return await this.orderService.markAsDelivered(id);
    } catch (error) {
      throw mapException(error);
    }
  }

  @MessagePattern({ cmd: 'delete_order' })
  async deleteOrder(@Payload() id: string) {
    try {
      return await this.orderService.deleteOrder(id);
    } catch (error) {
      throw mapException(error);
    }
  }
}
