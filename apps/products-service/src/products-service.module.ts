import { Module } from '@nestjs/common';
import { ProductsServiceController } from './products-service.controller';
import { ProductsServiceService } from './products-service.service';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [ConfigModule.forRoot({ isGlobal: true })],
  controllers: [ProductsServiceController],
  providers: [ProductsServiceService],
})
export class ProductsServiceModule {}
