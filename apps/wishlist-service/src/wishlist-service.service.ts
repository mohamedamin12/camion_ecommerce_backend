import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { WishlistItem } from './entities/wishlist.entity';
import { AddToWishlistDto } from './dto/add-to-wishlist.dto';
import { RemoveFromWishlistDto } from './dto/remove-from-wishlist.dto';
import { GetUserWishlistDto } from './dto/get-user-wishlist.dto';

@Injectable()
export class WishlistServiceService {
  constructor(
    @InjectRepository(WishlistItem)
    private readonly wishlistRepository: Repository<WishlistItem>,
  ) {}

  async addToWishlist(dto: AddToWishlistDto) {
    const exists = await this.wishlistRepository.findOne({
      where: { userId: dto.userId, productId: dto.productId },
    });

    if (exists) return exists;

    const item = this.wishlistRepository.create(dto);
    return this.wishlistRepository.save(item);
  }

  async removeFromWishlist(dto: RemoveFromWishlistDto) {
    const item = await this.wishlistRepository.findOne({
      where: { userId: dto.userId, productId: dto.productId },
    });

    if (!item) throw new NotFoundException('Item not found in wishlist');

    return this.wishlistRepository.remove(item);
  }

  async getWishlist(dto: GetUserWishlistDto) {
    return this.wishlistRepository.find({ where: { userId: dto.userId } });
  }
}
