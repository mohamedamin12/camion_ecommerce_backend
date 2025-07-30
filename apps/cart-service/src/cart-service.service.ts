import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
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
  ) {}

  async addToCart(dto: AddToCartDto) {
    const existing = await this.cartRepository.findOne({
      where: { userId: dto.userId, productId: dto.productId },
    });

    if (existing) {
      // If already exists, just update the quantity
      existing.quantity += dto.quantity;
      return this.cartRepository.save(existing);
    }

    const cartItem = this.cartRepository.create(dto);
    return this.cartRepository.save(cartItem);
  }

  async updateQuantity(dto: UpdateCartItemDto) {
    const cartItem = await this.cartRepository.findOne({
      where: { userId: dto.userId, productId: dto.productId },
    });

    if (!cartItem) {
      throw new NotFoundException('Cart item not found');
    }

    cartItem.quantity = dto.quantity;
    return this.cartRepository.save(cartItem);
  }

  async removeFromCart(dto: RemoveFromCartDto) {
    const cartItem = await this.cartRepository.findOne({
      where: { userId: dto.userId, productId: dto.productId },
    });

    if (!cartItem) {
      throw new NotFoundException('Cart item not found');
    }

    return this.cartRepository.remove(cartItem);
  }

  async getCart(dto: GetUserCartDto) {
    return this.cartRepository.find({ where: { userId: dto.userId } });
  }
}
