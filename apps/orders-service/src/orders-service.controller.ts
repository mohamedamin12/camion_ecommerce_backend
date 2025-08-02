import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { CreateOrderDto } from './dto/create-order.dto';
import { OrdersService } from './orders-service.service';

@Controller()
export class OrdersController {
  constructor(private readonly orderService: OrdersService) {}

  @MessagePattern({ cmd: 'create_order' })
  createOrder(@Payload() dto: CreateOrderDto) {
    return this.orderService.createOrder(dto);
  }

  @MessagePattern({ cmd: 'get_orders_by_user' })
  getOrdersByUser(@Payload() userId: string) {
    return this.orderService.getOrdersByUser(userId);
  }

  @MessagePattern({ cmd: 'get_order_by_id' })
  getOrderById(@Payload() id: string) {
    return this.orderService.getOrderById(id);
  }

  @MessagePattern({ cmd: 'mark_order_as_paid' })
  markAsPaid(@Payload() id: string) {
    return this.orderService.markAsPaid(id);
  }

  @MessagePattern({ cmd: 'mark_order_as_delivered' })
  markAsDelivered(@Payload() id: string) {
    return this.orderService.markAsDelivered(id);
  }

  @MessagePattern({ cmd: 'delete_order' })
  deleteOrder(@Payload() id: string) {
    return this.orderService.deleteOrder(id);
  }
}
