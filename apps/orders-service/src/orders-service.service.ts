/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RpcException } from '@nestjs/microservices';
import { CreateOrderDto } from './dto/create-order.dto';
import { Order } from './entities/order.entity';

@Injectable()
export class OrdersService {
  constructor(
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,
  ) {}

  async createOrder(dto: CreateOrderDto) {
    try {
      const order = this.orderRepository.create({
        ...dto,
        paymentMethodType: 'card',
      });
      return await this.orderRepository.save(order);
    } catch (error) {
      throw toRpc(error, 'Failed to create order');
    }
  }

  async getOrdersByUser(userId: string) {
    try {
      return await this.orderRepository.find({
        where: { userId },
        order: { createdAt: 'DESC' },
      });
    } catch (error) {
      throw toRpc(error, 'Failed to get orders by user');
    }
  }

  async getOrderById(id: string) {
    try {
      const order = await this.orderRepository.findOne({ where: { id } });
      if (!order)
        throw new RpcException({ statusCode: 404, message: 'Order not found' });
      return order;
    } catch (error) {
      throw toRpc(error, 'Failed to get order by id');
    }
  }

  async markAsPaid(id: string) {
    try {
      const order = await this.getOrderById(id);
      order.isPaid = true;
      order.paidAt = new Date();
      return await this.orderRepository.save(order);
    } catch (error) {
      throw toRpc(error, 'Failed to mark order as paid');
    }
  }

  async markAsDelivered(id: string) {
    try {
      const order = await this.getOrderById(id);
      order.isDelivered = true;
      order.deliveredAt = new Date();
      return await this.orderRepository.save(order);
    } catch (error) {
      throw toRpc(error, 'Failed to mark order as delivered');
    }
  }

  async deleteOrder(id: string) {
    try {
      const result = await this.orderRepository.delete(id);
      if (result.affected === 0)
        throw new RpcException({ statusCode: 404, message: 'Order not found' });
      return { message: 'Order deleted successfully' };
    } catch (error) {
      throw toRpc(error, 'Failed to delete order');
    }
  }
}

// Helper for converting exceptions
function toRpc(error: any, fallbackMsg?: string) {
  if (error instanceof RpcException) return error;
  const statusCode = error?.getStatus?.() || 500;
  const message = error?.message || fallbackMsg || 'Orders microservice error';
  return new RpcException({ statusCode, message });
}
