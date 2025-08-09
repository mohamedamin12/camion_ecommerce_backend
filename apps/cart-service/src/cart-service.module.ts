import { AuthModule } from "@app/auth";
import { Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { ClientsModule , Transport } from "@nestjs/microservices";
import { TypeOrmModule } from "@nestjs/typeorm";
import { CartItem } from "./entities/cart.entity";
import { CartServiceController } from "./cart-service.controller";
import { CartServiceService } from "./cart-service.service";

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.POSTGRES_HOST,
      port: Number(process.env.POSTGRES_PORT),
      username: process.env.POSTGRES_USER,
      password: process.env.POSTGRES_PASSWORD,
      database: process.env.POSTGRES_DB,
      autoLoadEntities: true,
      synchronize: true,
    }),
    TypeOrmModule.forFeature([CartItem]), 
    AuthModule,

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
      },
    ]),
  ],
  controllers: [CartServiceController],
  providers: [CartServiceService],
})
export class CartServiceModule {}
