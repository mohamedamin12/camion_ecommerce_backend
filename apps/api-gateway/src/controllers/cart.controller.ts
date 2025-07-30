import {
  Body,
  Controller,
  Delete,
  Inject,
  Patch,
  Post,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';

@Controller('cart')
export class CartController {
  constructor(@Inject('CART_SERVICE') private readonly cartClient: ClientProxy) {}

  @Post('add')
  addToCart(@Body() body: any) {
    return this.cartClient.send({ cmd: 'add_to_cart' }, body);
  }

  @Patch('update')
  updateQuantity(@Body() body: any) {
    return this.cartClient.send({ cmd: 'update_cart_quantity' }, body);
  }

  @Delete('remove')
  removeFromCart(@Body() body: any) {
    return this.cartClient.send({ cmd: 'remove_from_cart' }, body);
  }

  @Post('get')
  getCart(@Body() body: any) {
    return this.cartClient.send({ cmd: 'get_cart' }, body);
  }
}
