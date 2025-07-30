import { Module } from '@nestjs/common';
import { AffiliateServiceController } from './affiliate-service.controller';
import { AffiliateServiceService } from './affiliate-service.service';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Affiliate } from './entities/affiliate.entity';
import { Coupon } from './entities/coupon.entity';

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
    TypeOrmModule.forFeature([Affiliate, Coupon]),
  ],
  controllers: [AffiliateServiceController],
  providers: [AffiliateServiceService],
})
export class AffiliateServiceModule { }
