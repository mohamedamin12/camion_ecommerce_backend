import { Module } from '@nestjs/common';
import { CartServiceController } from './cart-service.controller';
import { CartServiceService } from './cart-service.service';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CartItem } from './entities/cart.entity';

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
    ],
  controllers: [CartServiceController],
  providers: [CartServiceService],
})
export class CartServiceModule {}
