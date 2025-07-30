import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { AppController } from './controllers/users.controller';
import { AffiliateController } from './controllers/affiliate.controller';
import { CartController } from './controllers/cart.controller';
import { WishlistController } from './controllers/wishlist.controller';

@Module({
  imports: [
    ClientsModule.register([
      {
        name: 'USERS_SERVICE',
        transport: Transport.TCP,
        options: {
          host: process.env.USERS_HOST,
          port: Number(process.env.USERS_TCP_PORT),
        },
      },
      {
        name: 'AFFILIATE_SERVICE',
        transport: Transport.TCP,
        options: {
          host: process.env.AFFILIATE_HOST,
          port: Number(process.env.AFFILIATE_TCP_PORT),
        },
      },
      {
        name: 'CART_SERVICE',
        transport: Transport.TCP,
        options: {
          host: process.env.CART_HOST,
          port: Number(process.env.CART_TCP_PORT),
        },
      },
      {
        name: 'WISHLIST_SERVICE',
        transport: Transport.TCP,
        options: {
          host: process.env.WISHLIST_SERVICE_HOST,
          port: Number(process.env.WISHLIST_TCP_PORT),
        },
      },
      {
        name: 'STORY_SERVICE',
        transport: Transport.TCP,
        options: {
          host: process.env.STORY_SERVICE_HOST,
          port: Number(process.env.STORY_TCP_PORT),
        },
      },
    ]),
  ],
  controllers: [AppController, CartController, AffiliateController, WishlistController],
})
export class AppModule { }
