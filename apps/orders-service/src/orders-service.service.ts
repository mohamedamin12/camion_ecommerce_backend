import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateOrderDto } from './dto/create-order.dto';
import { Order } from './entities/order.entity';
import { StripeService } from './stripe/stripe.controller';

@Injectable()
export class OrdersService {
  constructor(
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,
    private readonly stripeService: StripeService,
  ) {}

  async createOrder(dto: CreateOrderDto) {
    // Create a Stripe PaymentIntent for the amount
    const paymentIntent = await this.stripeService.createPaymentIntent(
      dto.totalOrderPrice, // Amount in cents!
      dto.currency || 'usd',
    );
    const order = this.orderRepository.create({
      ...dto,
      paymentMethodType: 'card',
      paymentIntentId: paymentIntent.id, // Save it for webhooks/reconciliation
      paymentIntentStatus: paymentIntent.status,
    });
    const savedOrder = await this.orderRepository.save(order);
    return {
      order: savedOrder,
      clientSecret: paymentIntent.client_secret, // for Stripe Elements on frontend
    };
  }

  async getOrdersByUser(userId: string) {
    return this.orderRepository.find({
      where: { userId },
      order: { createdAt: 'DESC' },
    });
  }

  async getOrderById(id: string) {
    const order = await this.orderRepository.findOne({ where: { id } });
    if (!order) throw new NotFoundException('Order not found');
    return order;
  }

  async markAsPaid(id: string) {
    const order = await this.getOrderById(id);
    order.isPaid = true;
    order.paidAt = new Date();
    return this.orderRepository.save(order);
  }

  async markAsDelivered(id: string) {
    const order = await this.getOrderById(id);
    order.isDelivered = true;
    order.deliveredAt = new Date();
    return this.orderRepository.save(order);
  }

  async deleteOrder(id: string) {
    const result = await this.orderRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException('Order not found');
    }
    return { message: 'Order deleted successfully' };
  }
}
