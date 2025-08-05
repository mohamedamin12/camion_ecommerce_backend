/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
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
  ) { }

  async addToWishlist(dto: AddToWishlistDto) {
    try {
      const exists = await this.wishlistRepository.findOne({
        where: { userId: dto.userId, productId: dto.productId },
      });

      if (exists) return exists;

      const item = this.wishlistRepository.create(dto);
      return await this.wishlistRepository.save(item);
    } catch (error) {
      return new BadRequestException(error.message || 'Failed to add to wishlist');
    }
  }

  async isProductInWishlist(userId: string, productId: string): Promise<boolean> {
  try {
    const wishlistItem = await this.wishlistRepository.findOne({
      where: { userId, productId },
    });
    return !!wishlistItem;
  } catch (error) {
    return false;
  }
}

  async removeFromWishlist(dto: RemoveFromWishlistDto) {
    try {
      const item = await this.wishlistRepository.findOne({
        where: { userId: dto.userId, productId: dto.productId },
      });

      if (!item) throw new NotFoundException('Item not found in wishlist');

      return this.wishlistRepository.remove(item);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      return new BadRequestException(error.message || 'Failed to remove from wishlist');
    }

  }

  async getWishlist(dto: GetUserWishlistDto) {
    try {
      if (!dto.userId) {
        throw new BadRequestException('User ID is required');
      }
      return this.wishlistRepository.find({ where: { userId: dto.userId } });
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      return new BadRequestException(error.message || 'Failed to retrieve wishlist');
    
    }
  }
}
