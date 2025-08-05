/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
import {
  Injectable,
  NotFoundException,
  Inject,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import { AddToCartDto } from './dto/add-to-cart.dto';
import { UpdateCartItemDto } from './dto/update-cart-item.dto';
import { RemoveFromCartDto } from './dto/remove-from-cart.dto';
import { CartItem } from './entities/cart.entity';
import { GetUserCartDto } from './dto/get-user-cart.dto';

@Injectable()
export class CartServiceService {
  constructor(
    @InjectRepository(CartItem)
    private readonly cartRepository: Repository<CartItem>,
    @Inject('AFFILIATE_SERVICE')
    private readonly affiliateClient: ClientProxy,
  ) { }

  private async fetchCoupon(code: string) {
    return firstValueFrom(
      this.affiliateClient.send(
        { cmd: 'affiliate.getCouponByCode' },
        { code },
      ),
    );
  }

  async addToCart(dto: AddToCartDto) {
    try {
      const existing = await this.cartRepository.findOne({
        where: { userId: dto.userId, productId: dto.productId },
      });

      if (existing) {
        existing.quantity += dto.quantity;
        return this.cartRepository.save(existing);
      }

      const cartItem = this.cartRepository.create(dto);
      return this.cartRepository.save(cartItem);
    } catch (error) {
      throw new Error(error && typeof error === 'object' && 'message' in error ? error.message : 'Failed to add to cart');
    }
  }

  async isProductInCart(userId: string, productId: string) {
    const cartItem = await this.cartRepository.findOne({
      where: { userId, productId },
    });
    return !!cartItem;
  }

  async updateQuantity(dto: UpdateCartItemDto) {
    try {
      const cartItem = await this.cartRepository.findOne({
        where: { userId: dto.userId, productId: dto.productId },
      });

      if (!cartItem) {
        throw new NotFoundException('Cart item not found');
      }

      cartItem.quantity = dto.quantity;
      return this.cartRepository.save(cartItem);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      return new Error(error && typeof error === 'object' && 'message' in error ? error.message : 'Failed to update cart item quantity');
    }
  }

  async getCart(dto: GetUserCartDto) {
    try {
      return this.cartRepository.find({ where: { userId: dto.userId } });
    } catch (error) {
      return new Error(error && typeof error === 'object' && 'message' in error ? error.message : 'Failed to get cart');
    }
  }

  async applyCouponToCart(userId: string, couponCode: string) {
    const cartItems = await this.cartRepository.find({ where: { userId } });
    if (!cartItems.length) throw new NotFoundException('Cart is empty');

    const coupon = await this.fetchCoupon(couponCode);
    if (!coupon) throw new NotFoundException('Invalid coupon code');

    const total = cartItems.reduce((sum, i) => sum + (i.price ?? 0) * i.quantity, 0);
    const discount = (total * coupon.discountPercentage) / 100;
    const afterDisc = total - discount;

    return { cartItems, total, discount, totalAfterDiscount: afterDisc, coupon };
  }

  async getCouponByCode(code: string): Promise < { code: string; discountPercentage: number } | null > {
  try {
    const coupon = await firstValueFrom(
      this.affiliateClient.send(
        { cmd: 'affiliate.getCouponByCode' },
        { code }
      )
    );

    if(!coupon) return null;

    return {
      code: coupon.code,
      discountPercentage: coupon.discountPercentage
    };
  } catch(error) {
    console.log('Error getting coupon:', error);
    return null;
  }
}

  async removeFromCart(dto: RemoveFromCartDto) {
  try {
    const cartItem = await this.cartRepository.findOne({
      where: { userId: dto.userId, productId: dto.productId },
    });

    if (!cartItem) {
      throw new NotFoundException('Cart item not found');
    }

    return this.cartRepository.remove(cartItem);
  } catch (error) {
    if (error instanceof NotFoundException) {
      throw error;
    }
    return new Error(error && typeof error === 'object' && 'message' in error ? error.message : 'Failed to remove from cart');
  }
}

  async clearCart(userId: string) {
  try {
    const cartItems = await this.cartRepository.find({ where: { userId } });
    if (!cartItems.length) throw new NotFoundException('Cart is already empty');

    await this.cartRepository.remove(cartItems);
    return { message: 'Cart cleared successfully' };
  } catch (error) {
    if (error instanceof NotFoundException) throw error;
    return new Error(error && typeof error === 'object' && 'message' in error ? error.message : 'Failed to clear cart');
  }
}
}
