import { Body, Controller, Delete, Inject, Post } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';

@Controller('wishlist')
export class WishlistController {
  constructor(
    @Inject('WISHLIST_SERVICE') private readonly wishlistClient: ClientProxy,
  ) {}

  @Post('add')
  addToWishlist(@Body() body: any) {
    return this.wishlistClient.send({ cmd: 'add_to_wishlist' }, body);
  }

  @Delete('remove')
  removeFromWishlist(@Body() body: any) {
    return this.wishlistClient.send({ cmd: 'remove_from_wishlist' }, body);
  }

  @Post('get')
  getWishlist(@Body() body: any) {
    return this.wishlistClient.send({ cmd: 'get_wishlist' }, body);
  }
}
