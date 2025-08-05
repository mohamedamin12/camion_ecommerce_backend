import {
  Body,
  Controller,
  Delete,
  Inject,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { CheckProductInCartDto } from 'apps/cart-service/src/dto/check-product-in-cart.dto';
import { GetUserCartDto } from 'apps/cart-service/src/dto/get-user-cart.dto';
import { RemoveFromCartDto } from 'apps/cart-service/src/dto/remove-from-cart.dto';
import { UpdateCartItemDto } from 'apps/cart-service/src/dto/update-cart-item.dto';
import { UserRole } from 'apps/users-service/src/entities/user.entity';
import { JwtAuthGuard } from 'libs/auth/src';
import { CurrentUserId } from 'libs/auth/src/current-user.decorator';
import { Roles } from 'libs/auth/src/roles.decorator';
import { RolesGuard } from 'libs/auth/src/roles.guard';

@Controller('cart')
export class CartController {
  constructor(@Inject('CART_SERVICE') private readonly cartClient: ClientProxy) { }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.USER, UserRole.AFFILIATE)
  @Post('add')
  addToCart(@Body() body: any) {
    return this.cartClient.send({ cmd: 'add_to_cart' }, body);
  }

  @UseGuards(JwtAuthGuard)
  @Post('check-product')
  checkProductInCart(
    @Body() dto: CheckProductInCartDto,
    @CurrentUserId() userId: string,
  ) {
    return this.cartClient.send<boolean>(
      { cmd: 'cart.isProductInCart' },
      { userId, productId: dto.productId },
    );
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.USER, UserRole.AFFILIATE)
  @Post('apply-coupon')
  applyCouponToCart(
    @Body() dto: { couponCode: string },
    @CurrentUserId() userId: string,
  ) {
    return this.cartClient.send(
      { cmd: 'apply_coupon_to_cart' },
      { userId, couponCode: dto.couponCode },
    );
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.USER, UserRole.AFFILIATE)
  @Patch('update')
  updateQuantity(@Body() body: UpdateCartItemDto) {
    return this.cartClient.send({ cmd: 'update_cart_quantity' }, body);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.USER, UserRole.AFFILIATE)
  @Delete('remove')
  removeFromCart(@Body() body: RemoveFromCartDto) {
    return this.cartClient.send({ cmd: 'remove_from_cart' }, body);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.USER, UserRole.AFFILIATE)
  @Post('get')
  getCart(@Body() body: GetUserCartDto) {
    return this.cartClient.send({ cmd: 'get_cart' }, body);
  }

}
