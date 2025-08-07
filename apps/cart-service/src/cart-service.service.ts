/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import {
  Injectable,
  Inject,
  BadRequestException,
  NotFoundException,
  UnauthorizedException,
  InternalServerErrorException,
  Logger,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ClientProxy, RpcException } from '@nestjs/microservices';
import { firstValueFrom, timeout, catchError } from 'rxjs';
import { AddToCartDto } from './dto/add-to-cart.dto';
import { UpdateCartItemDto } from './dto/update-cart-item.dto';
import { RemoveFromCartDto } from './dto/remove-from-cart.dto';
import { CartItem } from './entities/cart.entity';

@Injectable()
export class CartServiceService {
  private readonly logger = new Logger(CartServiceService.name);

  constructor(
    @InjectRepository(CartItem)
    private readonly cartRepository: Repository<CartItem>,
    @Inject('USERS_SERVICE')
    private readonly usersClient: ClientProxy,
    @Inject('AFFILIATE_SERVICE')
    private readonly affiliateClient: ClientProxy,
  ) {}

  private async verifyUserExists(userId: string) {
    if (!userId) throw new UnauthorizedException('Missing User ID');
    const user = await firstValueFrom(
      this.usersClient.send({ cmd: 'users.getUserById' }, { id: userId }).pipe(
        timeout(3000),
        catchError(() => {
          throw new UnauthorizedException('User does not exist (timeout)');
        }),
      ),
    );
    if (!user) throw new UnauthorizedException('User does not exist');
  }

  private async fetchCoupon(code: string) {
    try {
      return await firstValueFrom(
        this.affiliateClient
          .send({ cmd: 'affiliate.getCouponByCode' }, { code: code.trim().toUpperCase() })
          .pipe(
            timeout(3000),
            catchError((err) => {
              console.error('[CartService] fetchCoupon error:', JSON.stringify(err), err);

              const statusCode =
                err?.statusCode ||
                err?.status ||
                err?.error?.statusCode ||
                err?.error?.status;

              const message =
                err?.message ||
                err?.error?.message ||
                err?.error?.response?.message ||
                err?.response?.message ||
                err?.response;

              if (typeof statusCode === 'number' && message) {
                if (statusCode === 404) throw new NotFoundException(message);
                if (statusCode === 409) throw new ConflictException(message);
                if (statusCode === 400) throw new BadRequestException(message);
                if (statusCode === 401) throw new UnauthorizedException(message);
                throw new BadRequestException(message);
              }

              if (err instanceof RpcException) {
                throw new InternalServerErrorException(
                  'Microservice RPC exception: ' + (err.message || '')
                );
              }

              if (
                err instanceof NotFoundException ||
                err instanceof ConflictException ||
                err instanceof BadRequestException ||
                err instanceof UnauthorizedException
              )
                throw err;

              throw new InternalServerErrorException(
                'Affiliate service error: ' + (message || JSON.stringify(err) || '')
              );
            }),
          ),
      );
    } catch (err) {
      if (
        err instanceof NotFoundException ||
        err instanceof ConflictException ||
        err instanceof BadRequestException ||
        err instanceof UnauthorizedException
      )
        throw err;
      console.error('[CartService] fetchCoupon outer error:', err);
      throw new InternalServerErrorException('Failed to fetch coupon');
    }
  }

  async addToCart(dto: AddToCartDto, userId: string) {
    try {
      console.log('[CartService] addToCart called', dto, userId);
      await this.verifyUserExists(userId);

      if (!dto.productId) throw new BadRequestException('Missing productId');
      if (!dto.quantity || dto.quantity <= 0) throw new BadRequestException('Quantity must be greater than 0');

      const priceNum = Number(dto.price);
      if (isNaN(priceNum) || priceNum <= 0) throw new BadRequestException('Invalid price');
      dto.price = String(priceNum);

      const existing = await this.cartRepository.findOne({
        where: { userId: userId, productId: dto.productId },
      });

      if (existing) {
        existing.quantity += dto.quantity;
        existing.price = dto.price;
        const saved = await this.cartRepository.save(existing);
        const totalPrice = Number(saved.price) * saved.quantity;
        return { ...saved, totalPrice };
      }

      const created = await this.cartRepository.save({ ...dto, userId });
      const totalPrice = Number(created.price) * created.quantity;
      return { ...created, totalPrice };
    } catch (error) {
      console.error('[CartService] ERROR:', error, error?.stack);
      if (
        error instanceof BadRequestException ||
        error instanceof UnauthorizedException ||
        error instanceof NotFoundException ||
        error instanceof ConflictException
      )
        throw error;
      this.logger.error('Failed to add to cart', error.stack);
      throw new InternalServerErrorException('Failed to add to cart');
    }
  }

  async isProductInCart(userId: string, productId: string) {
    await this.verifyUserExists(userId);
    if (!productId) throw new BadRequestException('Missing productId');
    const item = await this.cartRepository.findOne({ where: { userId, productId } });
    return { exists: !!item };
  }

  async updateQuantity(dto: UpdateCartItemDto, userId: string) {
    await this.verifyUserExists(userId);
    if (!dto.productId) throw new BadRequestException('Missing productId');
    if (!dto.quantity || dto.quantity <= 0) throw new BadRequestException('Quantity must be greater than 0');

    const item = await this.cartRepository.findOne({
      where: { userId, productId: dto.productId },
    });
    if (!item) throw new NotFoundException('Cart item not found');

    item.quantity = dto.quantity;
    const saved = await this.cartRepository.save(item);
    const totalPrice = Number(saved.price) * saved.quantity;

    return { ...saved, totalPrice };
  }

  async getCart(userId: string) {
    await this.verifyUserExists(userId);
    const items = await this.cartRepository.find({ where: { userId } });
    return items.map(item => ({
      ...item,
      totalPrice: Number(item.price) * item.quantity,
    }));
  }

  async removeFromCart(dto: RemoveFromCartDto, userId: string) {
    await this.verifyUserExists(userId);
    if (!dto.productId) throw new BadRequestException('Missing productId');

    const item = await this.cartRepository.findOne({
      where: { userId, productId: dto.productId },
    });
    if (!item) throw new NotFoundException('Cart item not found');
    return this.cartRepository.remove(item);
  }

  async clearCart(userId: string) {
    await this.verifyUserExists(userId);
    const items = await this.cartRepository.find({ where: { userId } });
    if (!items.length) throw new NotFoundException('Cart is already empty');
    await this.cartRepository.remove(items);
    return { message: 'Cart cleared successfully' };
  }

  async applyCouponToCart(userId: string, couponCode: string) {
    try {
      await this.verifyUserExists(userId);
      const cartItems = await this.cartRepository.find({ where: { userId } });
      if (!cartItems.length) throw new NotFoundException('Cart is empty');

      const coupon = await this.fetchCoupon(couponCode);

      if (!coupon) throw new NotFoundException('Invalid coupon code');

      const total = cartItems.reduce((sum, i) => {
        const priceNum = i.price ? parseFloat(i.price) : 0;
        return sum + priceNum * i.quantity;
      }, 0);

      const discount = (total * coupon.discountPercentage) / 100;
      const totalAfterDiscount = total - discount;

      return { cartItems, total, discount, totalAfterDiscount, coupon };
    } catch (error) {
      if (
        error instanceof BadRequestException ||
        error instanceof UnauthorizedException ||
        error instanceof NotFoundException ||
        error instanceof ConflictException
      ) throw error;
      this.logger.error('Failed to apply coupon', error.stack);
      throw new InternalServerErrorException('Failed to apply coupon');
    }
  }
}
