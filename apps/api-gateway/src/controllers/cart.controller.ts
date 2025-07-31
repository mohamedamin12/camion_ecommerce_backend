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
import { UserRole } from 'apps/users-service/src/entities/user.entity';
import { JwtAuthGuard } from 'libs/auth/src';
import { Roles } from 'libs/auth/src/roles.decorator';
import { RolesGuard } from 'libs/auth/src/roles.guard';

@Controller('cart')
export class CartController {
  constructor(@Inject('CART_SERVICE') private readonly cartClient: ClientProxy) {}

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.USER || UserRole.AFFILIATE )
  @Post('add')
  addToCart(@Body() body: any) {
    return this.cartClient.send({ cmd: 'add_to_cart' }, body);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.USER || UserRole.AFFILIATE )
  @Patch('update')
  updateQuantity(@Body() body: any) {
    return this.cartClient.send({ cmd: 'update_cart_quantity' }, body);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.USER || UserRole.AFFILIATE )
  @Delete('remove')
  removeFromCart(@Body() body: any) {
    return this.cartClient.send({ cmd: 'remove_from_cart' }, body);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.USER || UserRole.AFFILIATE )
  @Post('get')
  getCart(@Body() body: any) {
    return this.cartClient.send({ cmd: 'get_cart' }, body);
  }
  
}
