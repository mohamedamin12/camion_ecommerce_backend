import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { WishlistServiceService } from './wishlist-service.service';
import { AddToWishlistDto } from './dto/add-to-wishlist.dto';
import { RemoveFromWishlistDto } from './dto/remove-from-wishlist.dto';
import { GetUserWishlistDto } from './dto/get-user-wishlist.dto';

@Controller()
export class WishlistServiceController {
  constructor(private readonly wishlistService: WishlistServiceService) { }

  @MessagePattern({ cmd: 'add_to_wishlist' })
  addToWishlist(@Payload() dto: AddToWishlistDto) {
    return this.wishlistService.addToWishlist(dto);
  }

  @MessagePattern({ cmd: 'wishlist.isProductInWishlist' })
  isProductInWishlist(
    @Payload() data: { userId: string; productId: string },
  ) {
    return this.wishlistService.isProductInWishlist(data.userId, data.productId);
  }

  @MessagePattern({ cmd: 'remove_from_wishlist' })
  removeFromWishlist(@Payload() dto: RemoveFromWishlistDto) {
    return this.wishlistService.removeFromWishlist(dto);
  }

  @MessagePattern({ cmd: 'get_wishlist' })
  getWishlist(@Payload() dto: GetUserWishlistDto) {
    return this.wishlistService.getWishlist(dto);
  }
}
