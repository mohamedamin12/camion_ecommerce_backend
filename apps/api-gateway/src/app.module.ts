import { Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { ClientsModule, Transport } from "@nestjs/microservices";
import { UserController } from "./controllers/users.controller";
import { CartController } from "./controllers/cart.controller";
import { AffiliateController } from "./controllers/affiliate.controller";
import { WishlistController } from "./controllers/wishlist.controller";
import { AuthModule } from "@app/auth";
import { OrderController } from "./controllers/order.controller";

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),

    ClientsModule.registerAsync([
      {
        name: 'USERS_SERVICE',
        useFactory: (config: ConfigService) => ({
          transport: Transport.TCP,
          options: {
            host: config.get('USERS_HOST'),
            port: Number(config.get('USERS_TCP_PORT')),
          },
        }),
        inject: [ConfigService],
      },
      {
        name: 'AFFILIATE_SERVICE',
        useFactory: (config: ConfigService) => ({
          transport: Transport.TCP,
          options: {
            host: config.get('AFFILIATE_HOST'),
            port: Number(config.get('AFFILIATE_TCP_PORT')),
          },
        }),
        inject: [ConfigService],
        imports: [ConfigModule],
      },
      {
        name: 'CART_SERVICE',
        useFactory: (config: ConfigService) => ({
          transport: Transport.TCP,
          options: {
            host: config.get('CART_HOST'),
            port: Number(config.get('CART_TCP_PORT')),
          },
        }),
        inject: [ConfigService],
      },
      {
        name: 'WISHLIST_SERVICE',
        useFactory: (config: ConfigService) => ({
          transport: Transport.TCP,
          options: {
            host: config.get('WISHLIST_SERVICE_HOST'),
            port: Number(config.get('WISHLIST_TCP_PORT')),
          },
        }),
        inject: [ConfigService],
      },
      {
        name: 'ORDERS_SERVICE',
        useFactory: (config: ConfigService) => ({
          transport: Transport.TCP,
          options: {
            host: config.get('ORDER_SERVICE_HOST'),
            port: Number(config.get('ORDERS_TCP_PORT')),
          },
        }),
        inject: [ConfigService],
      },
    ]),
    AuthModule
  ],
  controllers: [
    UserController,
    CartController,
    OrderController,
    AffiliateController,
    WishlistController,
  ],
})
export class AppModule {}
