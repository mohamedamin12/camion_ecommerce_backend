import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import * as dotenv from 'dotenv';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { WishlistServiceModule } from './wishlist-service.module';

dotenv.config();

dotenv.config({ path: __dirname + '../../../.env' });


async function bootstrap() {
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(WishlistServiceModule ,  {
    transport: Transport.TCP,
    options: {
      host:  process.env.TCP_BIND_HOST ,
      port: Number(process.env.WISHLIST_TCP_PORT || ""),
    },
  })
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }));
  await app.listen();

}
bootstrap();