import { Body, Controller, Delete, Get, Inject, Post, UseGuards } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { UserRole } from 'apps/users-service/src/entities/user.entity';
import { AddToWishlistDto } from 'apps/wishlist-service/src/dto/add-to-wishlist.dto';
import { CheckProductInWishlistDto } from 'apps/wishlist-service/src/dto/check-product-in-wishlist.dto';
import { RemoveFromWishlistDto } from 'apps/wishlist-service/src/dto/remove-from-wishlist.dto';
import { JwtAuthGuard } from 'libs/auth/src';
import { CurrentUserId } from 'libs/auth/src/current-user.decorator';
import { Roles } from 'libs/auth/src/roles.decorator';
import { RolesGuard } from 'libs/auth/src/roles.guard';

@Controller('wishlist')
export class WishlistController {
  constructor(
    @Inject('WISHLIST_SERVICE') private readonly wishlistClient: ClientProxy,
  ) { }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.USER, UserRole.AFFILIATE)
  @Post('add')
  addToWishlist(
    @Body() body: AddToWishlistDto,
    @CurrentUserId() userId: string,
  ) {
    return this.wishlistClient.send({ cmd: 'add_to_wishlist' }, { ...body, userId });
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.USER, UserRole.AFFILIATE)
  @Post('check-product')
  checkProductInWishlist(
    @Body() dto: CheckProductInWishlistDto,
    @CurrentUserId() userId: string,
  ) {
    return this.wishlistClient.send<boolean>(
      { cmd: 'wishlist.isProductInWishlist' },
      { userId, productId: dto.productId },
    );
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.USER, UserRole.AFFILIATE)
  @Delete('remove')
  removeFromWishlist(
    @Body() body: RemoveFromWishlistDto,
    @CurrentUserId() userId: string,
  ) {
    return this.wishlistClient.send({ cmd: 'remove_from_wishlist' }, { ...body, userId });
  }

 @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.USER, UserRole.AFFILIATE)
  @Get('get')
  getWishlist(@CurrentUserId() userId: string) {
    return this.wishlistClient.send({ cmd: 'get_wishlist' }, { userId });
  }
}
