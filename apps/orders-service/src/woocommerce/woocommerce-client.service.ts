// src/woocommerce/woocommerce-client.service.ts
import { Injectable, HttpException, HttpStatus, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class WooCommerceClientService {
  private readonly logger = new Logger(WooCommerceClientService.name);
  private readonly baseUrl: string;

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {
    this.baseUrl = this.configService.get<string>('WOOCOMMERCE_SERVER_URL') || 'http://localhost:3001';
  }

  async completeCheckout(checkoutData: any) {
    try {
      const response = await firstValueFrom(
        this.httpService.post(`${this.baseUrl}/api/checkout/complete`, checkoutData)
      );
      return response.data;
    } catch (error: any) {
      this.logger.error('Failed to complete checkout', error.response?.data || error.message);
      throw new HttpException(
        'Failed to process checkout with WooCommerce',
        error.response?.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async getOrder(orderId: number) {
    try {
      const response = await firstValueFrom(
        this.httpService.get(`${this.baseUrl}/api/orders/${orderId}`)
      );
      return response.data;
    } catch (error: any) {
      this.logger.error(`Failed to get order ${orderId}`, error.response?.data || error.message);
      throw new HttpException(
        'Failed to fetch order from WooCommerce',
        error.response?.status || HttpStatus.NOT_FOUND,
      );
    }
  }
}
