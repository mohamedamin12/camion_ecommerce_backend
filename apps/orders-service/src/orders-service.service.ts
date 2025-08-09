/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RpcException } from '@nestjs/microservices';
import { CreateOrderDto } from './dto/create-order.dto';
import { Order } from './entities/order.entity';
import { WooCommerceClientService } from './woocommerce/woocommerce-client.service';

function toRpc(error: any, fallbackMsg?: string) {
  if (error instanceof RpcException) return error;
  const statusCode = error?.getStatus?.() || 500;
  const message = error?.message || fallbackMsg || 'Orders microservice error';
  return new RpcException({ statusCode, message });
}

@Injectable()
export class OrdersService {
  constructor(
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,
    private readonly wooCommerceClient: WooCommerceClientService,
  ) {}

  async createOrder(userId: string, dto: CreateOrderDto) {
    try {
      // Create order in your local database first
      const order = this.orderRepository.create({
        userId,
        cartItems: dto.cartItems,
        taxPrice: dto.taxPrice || '0',
        shippingPrice: dto.shippingPrice || '0',
        totalOrderPrice: dto.totalOrderPrice,
        shippingAddress: dto.shippingAddress,
        paymentMethodType: 'card', // Default value
        isPaid: false,
        isDelivered: false,
      });

      const savedOrder = await this.orderRepository.save(order);

      // Only try WooCommerce integration if you have the necessary data
      try {
        const wooCommerceData = this.transformToWooCommerceFormat(savedOrder);
        const wooCommerceResponse =
          await this.wooCommerceClient.completeCheckout(wooCommerceData);

        // Update local order with WooCommerce details
        savedOrder.wooCommerceOrderId = wooCommerceResponse.order_id;
        savedOrder.wooCommerceOrderNumber = wooCommerceResponse.order_number;
        savedOrder.wooCommerceStatus = wooCommerceResponse.status;

        return await this.orderRepository.save(savedOrder);
      } catch (wooCommerceError) {
        // Log the error but don't fail the entire order creation
        console.error('WooCommerce integration failed:', wooCommerceError);

        // Return the order without WooCommerce integration
        return savedOrder;
      }
    } catch (error) {
      throw toRpc(error, 'Failed to create order');
    }
  }

  private transformToWooCommerceFormat(order: Order) {
    const lineItems = order.cartItems.map((item) => ({
      product_id: parseInt(item.productId),
      quantity: item.quantity,
      price: parseFloat(item.price),
      name: item.title || `Product ${item.productId}`,
    }));

    const subtotal = order.cartItems.reduce(
      (sum, item) => sum + parseFloat(item.price) * item.quantity,
      0,
    );

    return {
      payment_method: 'stripe',
      items: lineItems,
      customer_data: {
        first_name: '',
        last_name: '',
        email: '',
        phone: '',
        address_1: order.shippingAddress || '',
        city: '',
        state: '',
        postcode: '',
        country: 'US',
      },
      shipping_address: order.shippingAddress || '',
      totals: {
        subtotal: subtotal.toString(),
        tax_total: order.taxPrice || '0',
        shipping_total: order.shippingPrice || '0',
        total: order.totalOrderPrice,
      },
      payment_data: [],
      meta_data: [
        {
          key: '_internal_order_id',
          value: order.id,
        },
        {
          key: '_internal_user_id',
          value: order.userId,
        },
      ],
    };
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

  // New method to sync with WooCommerce
  async syncOrderWithWooCommerce(orderId: string) {
    try {
      const order = await this.orderRepository.findOne({
        where: { id: orderId },
      });

      if (!order || !order.wooCommerceOrderId) {
        throw new RpcException(
          'Order not found or not synchronized with WooCommerce',
        );
      }

      const wooCommerceOrder = await this.wooCommerceClient.getOrder(
        order.wooCommerceOrderId,
      );

      // Update local order status based on WooCommerce
      order.wooCommerceStatus = wooCommerceOrder.status;

      // Map WooCommerce status to your local status
      if (wooCommerceOrder.status === 'completed') {
        order.isPaid = true;
        order.paidAt = new Date(wooCommerceOrder.date_paid);
        order.isDelivered = true;
        order.deliveredAt = new Date();
      } else if (wooCommerceOrder.status === 'processing') {
        order.isPaid = true;
        order.paidAt = new Date(wooCommerceOrder.date_paid);
      }

      return await this.orderRepository.save(order);
    } catch (error) {
      throw toRpc(error, 'Failed to sync order status');
    }
  }
}
