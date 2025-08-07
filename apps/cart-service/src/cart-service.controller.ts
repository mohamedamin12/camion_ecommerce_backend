/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Controller, UsePipes, ValidationPipe } from "@nestjs/common";
import { MessagePattern, Payload, RpcException } from "@nestjs/microservices";
import { NotFoundException, ConflictException, BadRequestException, UnauthorizedException } from "@nestjs/common";
import { CartServiceService } from "./cart-service.service";
import { AddToCartDto } from "./dto/add-to-cart.dto";
import { UpdateCartItemDto } from "./dto/update-cart-item.dto";
import { RemoveFromCartDto } from "./dto/remove-from-cart.dto";


function mapException(error: any) {
  if (
    error instanceof NotFoundException ||
    error instanceof ConflictException ||
    error instanceof BadRequestException ||
    error instanceof UnauthorizedException
  ) {
    return new RpcException({
      statusCode: error.getStatus(),
      message: error.message,
    });
  }
  return new RpcException({
    statusCode: 500,
    message: error?.message || 'Unknown error from cart microservice',
  });
}

@UsePipes(new ValidationPipe({
  exceptionFactory: (errors) =>
    new RpcException({
      statusCode: 400,
      message: 'Validation failed',
      details: errors,
    }),
}))
@Controller()
export class CartServiceController {
  constructor(private readonly cartService: CartServiceService) {}

  @MessagePattern({ cmd: 'add_to_cart' })
  async addToCart(@Payload() { userId, ...dto }: AddToCartDto & { userId: string }) {
    try {
      return await this.cartService.addToCart(dto as AddToCartDto, userId);
    } catch (error) {
      throw mapException(error);
    }
  }

  @MessagePattern({ cmd: 'cart.isProductInCart' })
  async isProductInCart(@Payload() { userId, productId }: { userId: string; productId: string }) {
    try {
      return await this.cartService.isProductInCart(userId, productId);
    } catch (error) {
      throw mapException(error);
    }
  }

  @MessagePattern({ cmd: 'apply_coupon_to_cart' })
  async applyCouponToCart(@Payload() { userId, couponCode }: { userId: string; couponCode: string }) {
    try {
      return await this.cartService.applyCouponToCart(userId, couponCode);
    } catch (error) {
      throw mapException(error);
    }
  }

  @MessagePattern({ cmd: 'update_cart_quantity' })
  async updateQuantity(@Payload() { userId, ...dto }: UpdateCartItemDto & { userId: string }) {
    try {
      return await this.cartService.updateQuantity(dto as UpdateCartItemDto, userId);
    } catch (error) {
      throw mapException(error);
    }
  }

  @MessagePattern({ cmd: 'remove_from_cart' })
  async removeFromCart(@Payload() { userId, ...dto }: RemoveFromCartDto & { userId: string }) {
    try {
      return await this.cartService.removeFromCart(dto as RemoveFromCartDto, userId);
    } catch (error) {
      throw mapException(error);
    }
  }

  @MessagePattern({ cmd: 'get_cart' })
  async getCart(@Payload() { userId }: { userId: string }) {
    try {
      return await this.cartService.getCart(userId);
    } catch (error) {
      throw mapException(error);
    }
  }

  @MessagePattern({ cmd: 'clear_cart' })
  async clearCart(@Payload() userId: string) {
    try {
      return await this.cartService.clearCart(userId);
    } catch (error) {
      throw mapException(error);
    }
  }
}
