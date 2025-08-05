/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
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
      return new Error(error && typeof error === 'object' && 'message' in error ? error.message : 'Failed to create order');
    }
  }

  async getOrdersByUser(userId: string) {
    try {
      return await this.orderRepository.find({
        where: { userId },
        order: { createdAt: 'DESC' },
      });
    } catch (error) {
      return new Error(error && typeof error === 'object' && 'message' in error ? error.message : 'Failed to get orders by user');
    }
  }

  async getOrderById(id: string) {
    try {
      const order = await this.orderRepository.findOne({ where: { id } });
      if (!order) throw new NotFoundException('Order not found');
      return order;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      return new Error(error && typeof error === 'object' && 'message' in error ? error.message : 'Failed to get order by id');
    }
  }

  async markAsPaid(id: string) {
    try {
      const order = await this.getOrderById(id);
      if (order instanceof Error) {
        throw order;
      }
      order.isPaid = true;
      order.paidAt = new Date();
      return await this.orderRepository.save(order);
    } catch (error) {
      return new Error(error && typeof error === 'object' && 'message' in error ? error.message : 'Failed to mark order as paid');
    }
  }

  async markAsDelivered(id: string) {
    try {
      const order = await this.getOrderById(id);
      if (order instanceof Error) {
        throw order;
      }
      order.isDelivered = true;
      order.deliveredAt = new Date();
      return await this.orderRepository.save(order);
    } catch (error) {
      return new Error(error && typeof error === 'object' && 'message' in error ? error.message : 'Failed to mark order as delivered');
    }
  }

  async deleteOrder(id: string) {
    try {
      const result = await this.orderRepository.delete(id);
      if (result.affected === 0) {
        throw new NotFoundException('Order not found');
      }
      return { message: 'Order deleted successfully' };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      return new Error(error && typeof error === 'object' && 'message' in error ? error.message : 'Failed to delete order');
    }
  }
}

