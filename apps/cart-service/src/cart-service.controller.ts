import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { CartServiceService } from './cart-service.service';
import { AddToCartDto } from './dto/add-to-cart.dto';
import { UpdateCartItemDto } from './dto/update-cart-item.dto';
import { RemoveFromCartDto } from './dto/remove-from-cart.dto';
import { GetUserCartDto } from './dto/get-user-cart.dto';

@Controller()
export class CartServiceController {
  constructor(private readonly cartService: CartServiceService) {}

  @MessagePattern({ cmd: 'add_to_cart' })
  addToCart(@Payload() dto: AddToCartDto) {
    return this.cartService.addToCart(dto);
  }

  @MessagePattern({ cmd: 'update_cart_quantity' })
  updateCartQuantity(@Payload() dto: UpdateCartItemDto) {
    return this.cartService.updateQuantity(dto);
  }

  @MessagePattern({ cmd: 'remove_from_cart' })
  removeFromCart(@Payload() dto: RemoveFromCartDto) {
    return this.cartService.removeFromCart(dto);
  }

  @MessagePattern({ cmd: 'get_cart' })
  getCart(@Payload() dto: GetUserCartDto) {
    return this.cartService.getCart(dto);
  }
}
