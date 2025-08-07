/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-return */
import {
  Body,
  Controller,
  Delete,
  Inject,
  Patch,
  Post,
  UseGuards,
  HttpException,
  InternalServerErrorException,
  Get,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import { CheckProductInCartDto } from 'apps/cart-service/src/dto/check-product-in-cart.dto';
import { RemoveFromCartDto } from 'apps/cart-service/src/dto/remove-from-cart.dto';
import { UpdateCartItemDto } from 'apps/cart-service/src/dto/update-cart-item.dto';
import { AddToCartDto } from 'apps/cart-service/src/dto/add-to-cart.dto';
import { JwtAuthGuard } from 'libs/auth/src';
import { CurrentUserId } from 'libs/auth/src/current-user.decorator';
import { Roles } from 'libs/auth/src/roles.decorator';
import { RolesGuard } from 'libs/auth/src/roles.guard';
import { UserRole } from 'apps/users-service/src/entities/user.entity';

@Controller('cart')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.USER, UserRole.AFFILIATE)
export class CartController {
  constructor(@Inject('CART_SERVICE') private readonly cartClient: ClientProxy) { }

  private async callCart(pattern: any, data: any) {
    try {
      return await firstValueFrom(this.cartClient.send(pattern, data));
    } catch (err: any) {
      const statusCode = err?.statusCode || err?.status || err?.error?.statusCode || err?.error?.status;
      const message = err?.message || err?.error?.message || err?.error?.response?.message;
      if (typeof statusCode === 'number' && message) {
        throw new HttpException(message, statusCode);
      }
      if (err instanceof HttpException) throw err;
      console.error('[GATEWAY] RAW ERROR FROM CART:', JSON.stringify(err), err);
      throw new InternalServerErrorException('Cart service unavailable');
    }
  }


  @Post('add')
  async addToCart(
    @Body() dto: AddToCartDto,
    @CurrentUserId() userId: string
  ) {
    return this.callCart({ cmd: 'add_to_cart' }, { ...dto, userId });
  }

  @Post('check-product')
  async checkProductInCart(
    @Body() dto: CheckProductInCartDto,
    @CurrentUserId() userId: string
  ) {
    return this.callCart(
      { cmd: 'cart.isProductInCart' },
      { userId, productId: dto.productId }
    );
  }

  @Post('apply-coupon')
  async applyCouponToCart(
    @Body() dto: { couponCode: string },
    @CurrentUserId() userId: string
  ) {
    return this.callCart(
      { cmd: 'apply_coupon_to_cart' },
      { userId, couponCode: dto.couponCode }
    );
  }

  @Patch('update')
  async updateQuantity(
    @Body() dto: UpdateCartItemDto,
    @CurrentUserId() userId: string
  ) {
    return this.callCart(
      { cmd: 'update_cart_quantity' },
      { ...dto, userId }
    );
  }

  @Delete('remove')
  async removeFromCart(
    @Body() dto: RemoveFromCartDto,
    @CurrentUserId() userId: string
  ) {
    return this.callCart(
      { cmd: 'remove_from_cart' },
      { ...dto, userId }
    );
  }

  @Get('get')
  async getCart(
    @CurrentUserId() userId: string
  ) {
    return this.callCart(
      { cmd: 'get_cart' },
      { userId }
    );
  }

  @Delete('clear')
  async clearCart(
    @CurrentUserId() userId: string
  ) {
    return this.callCart(
      { cmd: 'clear_cart' },
      userId
    );
  }
}
