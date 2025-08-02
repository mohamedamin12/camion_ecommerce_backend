import { Body, Controller, Delete, Inject, Post, UseGuards } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { UserRole } from 'apps/users-service/src/entities/user.entity';
import { AddToWishlistDto } from 'apps/wishlist-service/src/dto/add-to-wishlist.dto';
import { GetUserWishlistDto } from 'apps/wishlist-service/src/dto/get-user-wishlist.dto';
import { RemoveFromWishlistDto } from 'apps/wishlist-service/src/dto/remove-from-wishlist.dto';
import { JwtAuthGuard } from 'libs/auth/src';
import { Roles } from 'libs/auth/src/roles.decorator';
import { RolesGuard } from 'libs/auth/src/roles.guard';

@Controller('wishlist')
export class WishlistController {
  constructor(
    @Inject('WISHLIST_SERVICE') private readonly wishlistClient: ClientProxy,
  ) {}

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.USER , UserRole.AFFILIATE )
  @Post('add')
  addToWishlist(@Body() body: AddToWishlistDto) {
    return this.wishlistClient.send({ cmd: 'add_to_wishlist' }, body);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.USER , UserRole.AFFILIATE )
  @Delete('remove')
  removeFromWishlist(@Body() body: RemoveFromWishlistDto) {
    return this.wishlistClient.send({ cmd: 'remove_from_wishlist' }, body);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.USER , UserRole.AFFILIATE )
  @Post('get')
  getWishlist(@Body() body: GetUserWishlistDto) {
    return this.wishlistClient.send({ cmd: 'get_wishlist' }, body);
  }
}
