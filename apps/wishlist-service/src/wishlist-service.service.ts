/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { RpcException } from '@nestjs/microservices';
import { Repository } from 'typeorm';
import { WishlistItem } from './entities/wishlist.entity';
import { AddToWishlistDto } from './dto/add-to-wishlist.dto';
import { RemoveFromWishlistDto } from './dto/remove-from-wishlist.dto';

@Injectable()
export class WishlistServiceService {
  constructor(
    @InjectRepository(WishlistItem)
    private readonly wishlistRepository: Repository<WishlistItem>,
  ) { }


  async addToWishlist(userId: string, dto: AddToWishlistDto) {
    try {
      const exists = await this.wishlistRepository.findOne({
        where: { userId, productId: dto.productId },
      });
      if (exists) return exists;
      const item = this.wishlistRepository.create({ ...dto, userId });
      return await this.wishlistRepository.save(item);
    } catch (error) {
      throw toRpc(error, 'Failed to add to wishlist');
    }
  }

  async isProductInWishlist(userId: string, productId: string): Promise<boolean> {
    try {
      const wishlistItem = await this.wishlistRepository.findOne({
        where: { userId, productId },
      });
      return !!wishlistItem;
    } catch (error) {
      throw toRpc(error, 'Failed to check product in wishlist');
    }
  }

  async removeFromWishlist(userId: string, dto: RemoveFromWishlistDto) {
    try {
      const item = await this.wishlistRepository.findOne({
        where: { userId, productId: dto.productId },
      });
      if (!item) throw new RpcException({ statusCode: 404, message: 'Item not found in wishlist' });
      return await this.wishlistRepository.remove(item);
    } catch (error) {
      throw toRpc(error, 'Failed to remove from wishlist');
    }
  }

  async getWishlist(userId: string) {
    try {
      if (!userId) {
        throw new RpcException({ statusCode: 400, message: 'User ID is required' });
      }
      return await this.wishlistRepository.find({ where: { userId } });
    } catch (error) {
      throw toRpc(error, 'Failed to retrieve wishlist');
    }
  }
}

function toRpc(error: any, fallbackMsg?: string) {
  if (error instanceof RpcException) return error;
  const statusCode = error?.getStatus?.() || 500;
  const message = error?.message || fallbackMsg || 'Wishlist microservice error';
  return new RpcException({ statusCode, message });
}
