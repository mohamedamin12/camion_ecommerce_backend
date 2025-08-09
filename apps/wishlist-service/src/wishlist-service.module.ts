import { Module } from '@nestjs/common';
import { WishlistServiceController } from './wishlist-service.controller';
import { WishlistServiceService } from './wishlist-service.service';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WishlistItem } from './entities/wishlist.entity';
import { AuthModule } from '@app/auth';

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
    TypeOrmModule.forFeature([WishlistItem]),
    AuthModule
  ],
  controllers: [WishlistServiceController],
  providers: [WishlistServiceService],
})
export class WishlistServiceModule {}
